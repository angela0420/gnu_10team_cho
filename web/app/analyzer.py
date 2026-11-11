"""원고 진단: 절별 글을 받아 기준선과 같은 규칙(section-verb-hedge-baseline 0.4.9 / hedge-baseline-0.4.5)으로 세고,
기준선의 범위·동사층과 비교한다. 세는 규칙은 vendor/의 원본 스크립트를 그대로 불러 쓴다(고치지 않음)."""
import json, os, re, sys
from collections import Counter, defaultdict
from dataclasses import dataclass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, 'vendor'))
import rvtool as rv                                    # noqa: E402
import engine_local as L                               # noqa: E402
from hedge_baseline import classify, HEDGE_PHRASES, BOOSTER_PHRASES, VERSION as HEDGE_VERSION   # noqa: E402
from prose_filters import strip_publication_metadata, is_lexical_verb, noun_like_signature, misparsed_noun, VERSION as FILTER_VERSION   # noqa: E402
from verb_usage_rules import usage, is_fixed             # noqa: E402
from commentary import make as make_commentary          # noqa: E402

MODEL = 'en_core_web_sm'
SECS = ['INT', 'MET', 'RD', 'CON']
HEDGE_SECS = {'INT', 'RD', 'CON'}          # 실험·방법 절은 헷지·부스터를 세지 않는다
SHORT_WORDS = 300                          # 이보다 짧은 절은 범위 판정 없이 개수만
MISSING_SHARE = 0.8                        # 기준선 논문 80% 이상이 쓰는 장르 공통 동사만 '없음'으로 알림
TOP = 10
DATA = os.path.join(ROOT, 'data')
USAGE_RULES = 'verb-usage v0.4'            # v0.4(2026-11-10): 보고동사(선행연구)를 동사가 아니라 주어·귀속으로 판정(engine whole-paper-0.4.3)
USAGE_CLASSES = 'verb_usage_rules v0.4'    # 동사 쓰임 분류 판본. v0.4 채택 2026-11-12(60용례 판정 반영, 분사형 형용사 추가). 기준선 동사층도 v0.4로 다시 만듦

# 문장 나누기: 기준선(extract_pdf.split_sents)과 같은 규칙. "…unclear.[5] In this work"처럼
# 마침표 뒤 인용 번호에서도 문장을 나눈다(spaCy 기본 분리는 여기서 두 문장을 하나로 붙였다).
ABBR = {'al', 'e.g', 'i.e', 'ca', 'vs', 'Fig', 'Figs', 'eq', 'eqs', 'ref', 'refs', 'Ref', 'Refs', 'approx', 'No', 'cf', 'resp', 'Eq', 'Prof', 'Dr', 'viz', 'Anal', 'Calcd', 'calcd', 'equiv'}


def split_sents(t):
    out, start = [], 0
    for m in re.finditer(r'[.!?](\s*\[[\d,–]+\])?\s+(?=[A-Z(“"\[]|\d+[A-Za-z])', t):
        pre = t[start:m.start() + 1]
        lw = re.search(r'([A-Za-z][A-Za-z.]*)\.$', pre)
        if lw and (lw.group(1).rstrip('.') in ABBR or re.fullmatch(r'[A-Z]', lw.group(1))): continue
        end = m.end(1) if m.group(1) else m.start() + 1
        out.append(t[start:end].strip()); start = m.end()
    if t[start:].strip(): out.append(t[start:].strip())
    return out
BASE = json.load(open(os.path.join(DATA, 'baselines.json'), encoding='utf-8'))
VERBS = json.load(open(os.path.join(DATA, 'verbs.json'), encoding='utf-8'))


@dataclass
class Sent:   # engine_local.analyze_sentence가 쓰는 속성만
    id: str
    text: str
    section_type: str


def band(v, s):
    """값 v를 기준선 요약 s(q1, q3, min, max)에 놓는다."""
    if s is None or v is None: return None
    if s['q1'] <= v <= s['q3']: return 'typical'
    if v < s['min'] or v > s['max']: return 'beyond_high' if v > s['max'] else 'beyond_low'
    return 'higher' if v > s['q3'] else 'lower'


# 남의 연구를 소개할 때도, 내 연구를 소개할 때도 쓰이는 보고형 동사. 주어가 자기 연구여서 보고동사에서 뺀 경우를 화면에 알린다.
REPORT_LIKE = L.REPORT | {'examine', 'investigate', 'study', 'explore', 'analyze', 'analyse', 'present', 'propose', 'demonstrate',
                          'show', 'suggest', 'find', 'reveal', 'discuss', 'address', 'evaluate', 'compare', 'introduce', 'establish'}


def count_section(sec, text, nlp):
    clean, _ = strip_publication_metadata(text)
    words, hedge, booster, reporting = 0, [], [], []
    verbs = defaultdict(list)                       # 기본형 -> [쓰임 기록]
    tokens = []                                     # 어휘 목록·KWIC용: [문장, 시작, 끝, 기본형, 품사, 쓰임]
    sents = [x for para in re.split(r'\n\s*\n|\r?\n', clean) for x in split_sents(para.strip()) if x.strip()]
    self_intro = []                                 # 자기 연구 소개로 보고동사에서 뺀 동사(v0.4)
    for i, st in enumerate(sents, 1):
        s = Sent(id=f'{sec}{i}', text=st, section_type=sec)
        doc = nlp(st)
        words += sum(1 for t in doc if t.is_alpha)
        _, hits, _ = L.analyze_sentence('manuscript', s, MODEL)
        prior = [(h['start'], h['end']) for h in hits if h['role'] == 'prior']
        for t in doc:
            lab = ''
            if is_lexical_verb(t):
                lab, why = usage(t)
                verbs[t.lemma_.lower()].append(dict(sent=i, start=t.idx, end=t.idx + len(t.text), usage=lab, fixed=is_fixed(why), noun_like=noun_like_signature(t)))
            if t.is_alpha:
                mp = misparsed_noun(t) if t.pos_ == 'VERB' else None   # 2026-11-12: 보정 사유(원래 품사는 그대로 두고 따로 남김)
                tokens.append([i, t.idx, t.idx + len(t.text), t.lemma_.lower(), t.pos_, lab, bool(lab) and noun_like_signature(t), mp or ''])
            name, cat = classify(t)
            if name and any(b <= t.idx < e for b, e in prior): name = None    # 선행연구 보고로 이미 셈(기준선과 같음)
            if name in ('hedge', 'booster') and sec in HEDGE_SECS:
                (hedge if name == 'hedge' else booster).append(dict(sent=i, start=t.idx, end=t.idx + len(t.text), word=t.text, kind=cat))
        if sec in HEDGE_SECS:
            low = st.lower()
            for lst, phrases in ((hedge, HEDGE_PHRASES), (booster, BOOSTER_PHRASES)):
                for ph in phrases:
                    for m in re.finditer(r'\b' + re.escape(ph) + r'\b', low):
                        lst.append(dict(sent=i, start=m.start(), end=m.end(), word=st[m.start():m.end()], kind='phrase'))
        for h in hits:
            if h['role'] == 'prior':
                reporting.append(dict(sent=i, start=h['start'], end=h['end'], word=h['text'], kind='prior'))
            elif h.get('self_intro') and h['lemma'].split()[0] in REPORT_LIKE and h['role'] != 'ref':
                self_intro.append(dict(sent=i, start=h['start'], end=h['end'], word=h['text'], kind='self'))
    return sents, words, verbs, hedge, booster, reporting, tokens, self_intro


def diagnose(sections, baseline):
    """sections: {INT|MET|RD|CON: 글}. baseline: baselines.json의 이름."""
    nlp = L.nlp(MODEL)
    B = BASE['baselines'][baseline]
    out = dict(baseline=baseline, baseline_info=dict(en=B['en'], ko=B['ko'], papers=B['papers'], reference_only=B['reference_only']),
               version=dict(baseline=BASE['version'], counting=HEDGE_VERSION, usage_rules=USAGE_RULES,
                            # 표기만 나눔(2026-11-10): 규칙은 그대로. 보고동사 판정 = engine_local, 동사 쓰임 분류 = verb_usage_rules
                            reporting=L.RULE_VERSION, usage_classes=USAGE_CLASSES, filters=FILTER_VERSION), sections={})
    for sec in SECS:
        text = (sections.get(sec) or '').strip()
        if not text: continue
        sents, words, verbs, hedge, booster, reporting, tokens, self_intro = count_section(sec, text, nlp)
        bs = B['sections'].get(sec, {})
        short = words < SHORT_WORDS
        n_verbs = sum(len(v) for v in verbs.values())
        metrics = []
        for key, n, ev in (('verbs_per1000', n_verbs, None), ('hedge_per1000', len(hedge), hedge),
                           ('booster_per1000', len(booster), booster), ('reporting_per1000', len(reporting), reporting)):
            if key in ('hedge_per1000', 'booster_per1000') and sec not in HEDGE_SECS: continue
            rate = round(n / words * 1000, 2) if words else None
            s = bs.get(key)
            metrics.append(dict(key=key, count=n, rate=rate, baseline=s, band=None if short else band(rate, s), evidence=ev))
            if key == 'reporting_per1000':
                metrics[-1]['excluded_self'] = self_intro
                metrics[-1]['excluded_self_sents'] = len({x['sent'] for x in self_intro})
        # 동사(술어 기반, 계획 3단계): 층과 빈도는 '술어로 쓴 것'으로 판정하고, 다른 쓰임은 내역으로 보여 준다.
        # 전치사처럼 쓰인 것은 목록에서 뺀다(기준선 총계에는 들어 있음).
        lay = VERBS['layers_pred'].get(sec, {})
        genre = set(lay.get('genre_wide', []))
        field = set(lay.get(baseline, [])) - genre
        bv = VERBS['pred'].get(baseline, {}).get(sec, {})
        SET_APART = ('전치사처럼', '분사형 형용사')   # v0.4(2026-11-11): 분사형 형용사도 동사 목록과 따로 본다(총계에는 포함)
        listed = {lem: [x for x in occ if x['usage'] not in SET_APART] for lem, occ in verbs.items()}
        listed = {k: v for k, v in listed.items() if v}

        def entry(lem, occ):
            c = len(occ); np_ = sum(1 for x in occ if x['usage'] == '술어')
            rate = round(np_ / words * 1000, 2) if words else 0
            b = bv.get(lem)
            if lem in genre: layer = 'genre'
            elif lem in field: layer = 'field'
            elif b and b['papers'] > 0: layer = 'rare'
            else: layer = 'none'
            # ④가 무엇이 0인지 구분한다: 같은 절에 나오지만 술어로는 0회 / 같은 절에는 없고 다른 절에만 / 이 비교 자료 어디에도 없음
            none_kind = None
            if layer == 'none':
                if b: none_kind = 'no_pred_in_section'
                elif any(lem in v for v in VERBS['pred'].get(baseline, {}).values()): none_kind = 'other_sections_only'
                else: none_kind = 'not_in_data'
            vb = None
            if layer in ('genre', 'field') and b and b['q1'] is not None and not short:
                vb = 'typical' if b['q1'] <= rate <= b['q3'] else ('higher' if rate > b['q3'] else 'lower')
            return dict(verb=lem, count=c, pred=np_, rate=rate, layer=layer, none_kind=none_kind, band=vb,
                        baseline=(dict(papers=b['papers'], n=b['n'], median=b['median'], q1=b['q1'], q3=b['q3'], usage=b['usage']) if b else None),
                        usage=dict(Counter(x['usage'] for x in occ)), fixed=sum(1 for x in occ if x['fixed']), noun_like=sum(1 for x in occ if x['noun_like']), hits=occ)

        preds = {k: v for k, v in listed.items() if any(x['usage'] == '술어' for x in v)}
        top = [entry(l, o) for l, o in sorted(preds.items(), key=lambda kv: (-sum(x['usage'] == '술어' for x in kv[1]), -len(kv[1]), kv[0]))[:TOP]]
        # 술어보다 수식어·비정형으로 더 많이 쓴 동사(압축 문체를 보는 곳)
        # '확인 필요'는 수식어·비정형으로 확정하지 않는다: 수식·비정형·명사처럼으로 판정된 쓰임만 센다
        MODS = ('명사 앞 수식', '명사 뒤 수식', '비정형', '명사처럼')
        others = {k: v for k, v in listed.items() if sum(x['usage'] in MODS for x in v) > sum(x['usage'] == '술어' for x in v)}
        other = [entry(l, o) for l, o in sorted(others.items(), key=lambda kv: (-len(kv[1]), kv[0]))[:5]]
        prep_like = {lem: n for lem, occ in verbs.items() if (n := sum(1 for x in occ if x['usage'] == '전치사처럼'))}
        adj_like = {lem: n for lem, occ in verbs.items() if (n := sum(1 for x in occ if x['usage'] == '분사형 형용사'))}
        pred_used = {l for l, v in listed.items() if any(x['usage'] == '술어' for x in v)}
        missing = sorted(l for l in genre if l not in pred_used and bv.get(l, {}).get('share', 0) >= MISSING_SHARE)
        mix = Counter()
        for occ in verbs.values():
            for x in occ:
                mix[x['usage']] += 1
                if x['fixed']: mix['굳은 표현'] += 1
        out['sections'][sec] = dict(usage_mix=dict(mix), words=words, words_baseline=bs.get('words'), short=short, sentences=sents, tokens=tokens,
                                    metrics=metrics, top_verbs=top, other_verbs=other, prep_like=prep_like, adj_like=adj_like, missing_genre=missing,
                                    baseline_papers=(bs.get('words') or {}).get('n', 0))
        out['sections'][sec]['commentary'] = make_commentary(sec, out['sections'][sec], bs, B['papers'])
    return out
