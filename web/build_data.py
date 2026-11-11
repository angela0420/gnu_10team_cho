"""기준선_0.4.9 결과에서 진단 화면용 자료(data/baselines.json, data/verbs.json)를 만든다.
- 절은 원고 입력과 같은 네 칸: INT, MET, RD(결과·논의), CON. RES·DIS가 따로 있는 논문은 개수와 단어 수를 더해 RD 하나로 묶는다.
- 사분위수는 포함 방식(statistics.quantiles method='inclusive', 엑셀 QUARTILE.INC와 같음).
사용법: python build_data.py <기준선_0.4.9 폴더>"""
import csv, json, os, statistics, sys
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')
SRC = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
BASELINES = {   # 이름: (폴더, 영어 이름, 한국어 이름, 참고만 여부)
    'ACS_CM': ('acs_80/CM', 'Materials chemistry (Chem. Mater.)', '재료화학 (Chem. Mater.)', False),
    'ACS_IC': ('acs_80/IC', 'Inorganic chemistry (Inorg. Chem.)', '무기화학 (Inorg. Chem.)', False),
    'ACS_JOC': ('acs_80/JOC', 'Organic chemistry (J. Org. Chem.)', '유기화학 (J. Org. Chem.)', False),
    'ACS_JPC_C': ('acs_80/JPC_C', 'Physical (J. Phys. Chem. C)', '물리 (J. Phys. Chem. C)', False),   # 메뉴 이름만 짧게(2026-11-09)
    'JPC_C_exp': ('jpcc/JPC_C_exp', 'Physical–experimental (J. Phys. Chem. C)', '물리-실험 (J. Phys. Chem. C)', False),
    'JPC_C_comp': ('jpcc/JPC_C_comp', 'Physical–computational (J. Phys. Chem. C)', '물리-계산 (J. Phys. Chem. C)', True),
}
SECS = ['INT', 'MET', 'RD', 'CON']
HIDDEN = {'JPC_C_exp'}   # 2026-11-09: 물리-실험은 메뉴에서 감춤(물리와 같은 기준이라 겹침). 자료는 보관
MERGE = {'RES': 'RD', 'DIS': 'RD', 'RD': 'RD', 'INT': 'INT', 'MET': 'MET', 'CON': 'CON'}
HEDGE_SECS = {'INT', 'RD', 'CON'}


# 기준선 논문 목록(결과 내보내기의 '출처와 인용'용): 문서 ID → DOI는 규칙으로, 제목은 코퍼스 목록에서 찾는다.
PREFIX = {'jp': 'acs.jpcc', 'cm': 'acs.chemmater', 'ic': 'acs.inorgchem', 'jo': 'acs.joc'}


def doi_of(doc):
    if doc.startswith('acs.'): return '10.1021/' + doc
    m = __import__('re').match(r'^(jp|cm|ic|jo)(\d[a-z]\d+)$', doc)
    return f'10.1021/{PREFIX[m.group(1)]}.{m.group(2)}' if m else ''


def load_titles(src):
    """코퍼스 목록(라이선스_목록.csv, 후보목록*.md)에서 DOI → (제목, 연도)."""
    import re, glob
    t = {}
    lic = os.path.join(src, '..', '코퍼스_2020-2021_CCBY', '라이선스_목록.csv')
    if os.path.exists(lic):
        for r in csv.DictReader(open(lic, encoding='utf-8-sig')): t[r['doi'].lower()] = (r['title'], r['year'])
    for md in glob.glob(os.path.join(src, '..', '코퍼스_JPC_C_물리보강', '후보목록*.md')):
        for line in open(md, encoding='utf-8'):
            m = re.search(r'\|\s*\w+\s*\|\s*[^|]*\|\s*(\d{4})\s*\|.*\[([^\]]+)\]\(https://doi\.org/(10\.[^)]+)\)', line)
            if m: t.setdefault(m.group(3).lower(), (m.group(2), m.group(1)))
    return t


TITLES = load_titles(SRC)


def summary(vals):
    vals = sorted(vals)
    if not vals: return None
    q1, _, q3 = statistics.quantiles(vals, n=4, method='inclusive') if len(vals) > 1 else (vals[0], 0, vals[0])
    return dict(n=len(vals), median=round(statistics.median(vals), 2), q1=round(q1, 2), q3=round(q3, 2), min=round(vals[0], 2), max=round(vals[-1], 2),
                values=[round(v, 2) for v in vals])   # 해설에서 '몇 편이 이보다 적은가'를 세는 데 쓴다(논문 이름은 넣지 않음)


out = {}
for name, (folder, en, ko, ref_only) in BASELINES.items():
    agg = defaultdict(lambda: defaultdict(float))   # (doc, sec) -> counts
    for r in csv.DictReader(open(os.path.join(SRC, folder, '2_baseline', 'per_paper.csv'), encoding='utf-8-sig')):
        sec = MERGE.get(r['section'])
        if not sec: continue
        a = agg[(r['document_id'], sec)]
        for k in ('words', 'hedge', 'booster', 'reporting', 'verbs'): a[k] += float(r[k] or 0)
    docs = sorted({d for d, _ in agg})
    secs = {}
    for sec in SECS:
        rows = [a for (d, s), a in agg.items() if s == sec and a['words'] > 0]
        m = dict(words=summary([a['words'] for a in rows]),
                 verbs_per1000=summary([a['verbs'] / a['words'] * 1000 for a in rows]),
                 reporting_per1000=summary([a['reporting'] / a['words'] * 1000 for a in rows]))
        if sec in HEDGE_SECS:
            m['hedge_per1000'] = summary([a['hedge'] / a['words'] * 1000 for a in rows])
            m['booster_per1000'] = summary([a['booster'] / a['words'] * 1000 for a in rows])
        secs[sec] = m
    plist = []
    for d in docs:
        doi = doi_of(d); ti, yr = TITLES.get(doi.lower(), ('', ''))
        plist.append(dict(id=d, doi=doi, title=ti, year=yr))
    out[name] = dict(en=en, ko=ko, reference_only=ref_only, papers=len(docs), sections=secs, hidden=(name in HIDDEN), paper_list=plist)
    print(' ', name, 'titles found', sum(1 for p in plist if p['title']), '/', len(plist))
    print(name, len(docs), 'papers', {s: secs[s]['words']['n'] if secs[s]['words'] else 0 for s in SECS})

verbs = defaultdict(lambda: defaultdict(dict))
for r in csv.DictReader(open(os.path.join(SRC, '동사층', 'verb_table.csv'), encoding='utf-8-sig')):
    if r['baseline'] not in BASELINES: continue
    verbs[r['baseline']][r['section']][r['verb']] = dict(papers=int(r['papers_with']), n=int(r['papers_in_section']), share=float(r['share']),
                                                         median=float(r['median_per1000']), q1=float(r['q1']) if r['q1'] else None,
                                                         q3=float(r['q3']) if r['q3'] else None)
layers = json.load(open(os.path.join(SRC, '동사층', 'verb_layers.json'), encoding='utf-8'))
# 술어 기반(계획 1·3단계): 동사마다 술어로 쓴 논문 비율과 술어 1,000단어당 범위, 쓰임별 합계
pred = defaultdict(lambda: defaultdict(dict))
USAGE_COLS = ['술어', '명사 앞 수식', '명사 뒤 수식', '비정형', '명사처럼', '전치사처럼', '분사형 형용사', '확인 필요', '굳은 표현']
for r in csv.DictReader(open(os.path.join(SRC, '동사층', 'verb_usage_table.csv'), encoding='utf-8-sig')):
    if r['baseline'] not in BASELINES: continue
    pred[r['baseline']][r['section']][r['verb']] = dict(papers=int(r['papers_with_pred']), n=int(r['papers_in_section']), share=float(r['share_pred']),
        median=float(r['median_pred_per1000']), q1=float(r['q1_pred']) if r['q1_pred'] else None, q3=float(r['q3_pred']) if r['q3_pred'] else None,
        total=int(r['total']), usage={k: int(r[k]) for k in USAGE_COLS if int(r[k])})
layers_pred = json.load(open(os.path.join(SRC, '동사층', 'verb_layers_pred.json'), encoding='utf-8'))
# 절별 쓰임 합계(비교 논문 전체를 합친 값): 해설에서 원고의 쓰임 비율과 견준다
for b in pred:
    for sec, vs in pred[b].items():
        tot = defaultdict(int)
        for v in vs.values():
            for k, n in v['usage'].items(): tot[k] += n
        if b in out and sec in out[b]['sections']: out[b]['sections'][sec]['usage_pooled'] = dict(tot)
os.makedirs(os.path.join(HERE, 'data'), exist_ok=True)
json.dump(dict(version='baseline 0.4.9 (pdf-extract-0.4.9 / hedge-baseline-0.4.5)', baselines=out), open(os.path.join(HERE, 'data', 'baselines.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(dict(verbs=verbs, layers=layers['layers'], genre_key='genre_wide', pred=pred, layers_pred=layers_pred['layers'], usage_rules=layers_pred['usage_rules']), open(os.path.join(HERE, 'data', 'verbs.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('wrote data/baselines.json, data/verbs.json')
