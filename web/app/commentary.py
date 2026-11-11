"""분석 결과 풀이: 절마다 진단 수치를 문장으로 옮긴다(영·한). 외부 생성형 AI를 호출하지 않는다.
원칙(2026-11-09 조은정 검토 반영)
- '풀이'에는 표에서 확인되는 사실(개수, 1,000단어당 빈도, 참조 범위와의 관계, 논문별 대조)만 쓴다.
- 숫자로 뒷받침되지 않는 해석(배경 분량, 균형, 적절성)은 쓰지 않고, '추가로 확인해 보세요'에서 작성자가 확인할 질문으로만 쓴다.
- 개수는 '개', 1,000단어당 환산 빈도는 '회', 서로 다른 동사는 '종'.
- '17편 중 16편' 같은 논문별 대조는 비교 논문 각각의 실제 빈도(values)와 견주며, 같은 값은 낮은 논문에 넣지 않는다."""

SEC_KO = {'INT': '서론', 'MET': '실험·방법', 'RD': '결과·논의', 'CON': '결론'}
SEC_EN = {'INT': 'Introduction', 'MET': 'Methods', 'RD': 'Results and Discussion', 'CON': 'Conclusions'}
NAME = {'verbs_per1000': ('동사', 'lexical verbs'), 'hedge_per1000': ('완화 표현', 'hedges'),
        'booster_per1000': ('강조 표현', 'boosters'), 'reporting_per1000': ('선행연구 보고동사로 분류된 표현', 'expressions classified as reporting verbs for prior work')}
LAYER_KO = {'genre': '네 저널 공통', 'field': '선택 집합에서 자주 확인', 'rare': '일부 논문에서 확인', 'none': '해당 용법 미확인'}
LAYER_EN = {'genre': 'found in all four journals', 'field': 'frequent in the chosen set', 'rare': 'found in some papers', 'none': 'use not found'}
NONE_KO = {'no_pred_in_section': '비교 자료의 같은 절에서는 술어 용법이 확인되지 않았습니다',
           'other_sections_only': '비교 자료의 같은 절에서는 이 동사가 확인되지 않았습니다(다른 절에서는 나옵니다)',
           'not_in_data': '현재 비교 자료에서는 이 동사가 확인되지 않았습니다'}
NONE_EN = {'no_pred_in_section': 'not used as a predicate in the same section of the comparison papers',
           'other_sections_only': 'not found in the same section of the comparison papers (it occurs in other sections)',
           'not_in_data': 'not found anywhere in the current comparison data'}
CHECK = {   # 범위를 벗어난 지표마다, 작성자가 원문에서 확인할 질문
    'reporting_per1000': ('표의 개수를 눌러 탐지된 문장을 확인해 보세요. 해당 표현이 실제로 다른 연구를 소개하는 데 쓰였는지, 각 문장이 자신의 연구 질문이나 목적과 어떻게 연결되는지 살펴보면 됩니다.',
                          'Click the count in the table to see the sentences. Check whether each expression actually introduces other studies, and how each sentence connects to your research question or aim.'),
    'hedge_per1000': ('표의 개수를 눌러 탐지된 문장을 확인해 보세요. 각 완화 표현이 그 문장에서 가능성이나 추정을 나타내는 데 쓰였는지 살펴보면 됩니다.',
                      'Click the count to see the sentences, and check whether each hedge expresses possibility or inference in its sentence.'),
    'booster_per1000': ('표의 개수를 눌러 탐지된 문장을 확인해 보세요. 각 강조 표현이 그 문장에서 확신을 나타내는 데 쓰였는지 살펴보면 됩니다.',
                        'Click the count to see the sentences, and check whether each booster expresses certainty in its sentence.'),
    'verbs_per1000': ('동사 빈도는 문장을 절로 풀어 쓰는지, 명사구로 묶어 쓰는지에 따라 달라집니다. 아래 ‘내 글 살펴보기’의 용례에서 문장을 확인해 보세요.',
                      'The verb rate depends on whether content is written out as clauses or packed into noun phrases. Check the sentences in the concordance under ‘Explore your text’.'),
}


def _f(v):
    return f'{v:,.2f}'.rstrip('0').rstrip('.') if isinstance(v, float) else f'{v:,}'


def _josa(word, a, b):
    ch = word[-1:]
    return a if ('가' <= ch <= '힣' and (ord(ch) - 0xAC00) % 28) else b


def _rank(v, s):
    """비교 논문 각각의 실제 빈도와 견준다. 같은 값은 '낮은/높은' 어느 쪽에도 넣지 않는다."""
    vals = s.get('values') or []
    return sum(1 for x in vals if x < v), sum(1 for x in vals if x > v), len(vals)


def make(sec, S, bs, n_papers):
    ko, en, cko, cen = [], [], [], []
    sk, se = SEC_KO[sec], SEC_EN[sec]
    w, bw = S['words'], bs.get('words')
    # ① 길이
    if bw:
        if bw['q1'] <= w <= bw['q3']: rk, re_ = '해당 범위 안에 있습니다', 'within that range'
        elif w > bw['q3']: rk, re_ = '해당 범위보다 깁니다', 'longer than that range'
        else: rk, re_ = '해당 범위보다 짧습니다', 'shorter than that range'
        ko.append(f"{sk}{_josa(sk, '은', '는')} {_f(w)}단어입니다. 비교 논문 {bw['n']}편의 {sk} 길이는 중앙값이 {_f(bw['median'])}단어이고, 참조 범위는 {_f(bw['q1'])}~{_f(bw['q3'])}단어입니다. 이 원고의 {sk}{_josa(sk, '은', '는')} {rk}. 다만 길이만으로 설명이 충분한지 판단할 수는 없습니다.")
        en.append(f"The {se} has {_f(w)} words. In the {bw['n']} comparison papers this section has a median of {_f(bw['median'])} words and a reference range of {_f(bw['q1'])}–{_f(bw['q3'])}; this manuscript is {re_}. Length alone does not show whether the section says enough.")
    if S['short']:
        # 문구만 고침(2026-11-10): 표에는 환산 수치와 참조 범위가 남아 있으므로 '개수만'이 아니라 '높고 낮음 판정 보류, 환산 수치는 참고용'
        ko.append('이 절은 300단어보다 짧아 빈도에 따른 높고 낮음은 판정하지 않습니다. 환산 수치는 참고용으로만 제시하므로, 실제 개수와 문장을 중심으로 확인해 주세요.')
        en.append('This section is shorter than 300 words, so higher or lower frequencies are not judged. The per-1,000-word rates are given for reference only; focus on the actual counts and sentences.')
    # ② 지표
    inside, inside_en = [], []
    zero_ok_ko, zero_ok_en = [], []
    checks = []
    for m in S['metrics']:
        s, key = m['baseline'], m['key']
        nk, ne = NAME[key]
        n_sent = len({e['sent'] for e in (m.get('evidence') or [])})
        where_ko = f", {n_sent}개 문장에서 탐지되었습니다" if m.get('evidence') and m['count'] else ''
        where_en = f", found in {n_sent} sentences" if m.get('evidence') and m['count'] else ''
        if S['short'] or not s:
            ko.append(f"{nk}{_josa(nk, '은', '는')} {m['count']}개{where_ko or '입니다'}." if not where_ko else f"{nk}{_josa(nk, '은', '는')} {m['count']}개이며{where_ko}.")
            en.append(f"{ne.capitalize()}: {m['count']}{where_en}.")
            continue
        band = m['band']
        if band == 'typical':
            if m['count'] == 0:
                zero_ok_ko.append(nk); zero_ok_en.append(ne)
            else:
                inside.append(f"{nk} {_f(m['rate'])}회"); inside_en.append(f"{ne} {_f(m['rate'])}")
            continue
        lo, hi, n = _rank(m['rate'], s)
        if band == 'beyond_high':
            rel_ko = f"비교 논문 {n}편 가운데 가장 높은 논문({_f(s['max'])}회)보다도 높습니다"
            rel_en = f"higher than in any of the {n} comparison papers (highest {_f(s['max'])})"
        elif band == 'beyond_low':
            rel_ko = f"비교 논문 {n}편 가운데 가장 낮은 논문({_f(s['min'])}회)보다도 낮습니다"
            rel_en = f"lower than in any of the {n} comparison papers (lowest {_f(s['min'])})"
        elif band == 'higher':
            rel_ko = f"참조 범위인 {_f(s['q1'])}~{_f(s['q3'])}회보다 높습니다. 비교 논문 {n}편 중 {lo}편은 1,000단어당 빈도가 이 원고보다 낮았습니다"
            rel_en = f"above the reference range ({_f(s['q1'])}–{_f(s['q3'])}); {lo} of the {n} comparison papers have a lower rate"
        else:
            rel_ko = f"참조 범위인 {_f(s['q1'])}~{_f(s['q3'])}회보다 낮습니다. 비교 논문 {n}편 중 {hi}편은 1,000단어당 빈도가 이 원고보다 높았습니다"
            rel_en = f"below the reference range ({_f(s['q1'])}–{_f(s['q3'])}); {hi} of the {n} comparison papers have a higher rate"
        cnt_ko = f"{nk}{_josa(nk, '은', '는')} {m['count']}개이며{where_ko}." if where_ko else f"{nk}{_josa(nk, '은', '는')} {m['count']}개입니다."
        ko.append(f"{cnt_ko} 1,000단어당 빈도는 {_f(m['rate'])}회로, {rel_ko}.")
        en.append(f"{ne.capitalize()}: {m['count']}{where_en}. The rate is {_f(m['rate'])} per 1,000 words, {rel_en}.")
        checks.append(key)
    if inside:
        ko.insert(1 if bw else 0, f"1,000단어 기준으로 환산하면 {', '.join(inside)}이며, {'두 지표 모두' if len(inside) == 2 else ('모두' if len(inside) > 2 else '이 지표는')} 참조 범위 안에 있습니다.")
        en.insert(1 if bw else 0, f"Per 1,000 words, {', '.join(inside_en)}: {'both are' if len(inside) == 2 else ('all are' if len(inside) > 2 else 'this is')} within the reference range.")
    for nk, ne in zip(zero_ok_ko, zero_ok_en):
        ko.append(f"{nk}{_josa(nk, '은', '는')} 현재 분석 규칙으로는 탐지되지 않았으며, 빈도 0도 참조 범위에 포함됩니다.")
        en.append(f"No {ne} were detected by the current rules; a rate of 0 is within the reference range.")
    mh = any(m['key'] == 'hedge_per1000' for m in S['metrics'])
    if mh and not S['short']:
        ko.append('완화 표현과 강조 표현의 탐지 빈도는 각각 따로 비교했습니다. 두 표현의 비율만으로 주장의 신중함이나 설득력을 판단하지는 않습니다.')
        en.append('Hedges and boosters are compared separately. Their ratio alone is not used to judge how cautious or persuasive the claims are.')
    # ③ 동사
    top = S['top_verbs']
    if top:
        by = {}
        for v in top: by.setdefault(v['layer'], []).append(v['verb'])
        parts_ko = [f"‘{LAYER_KO[k]}’ {len(by[k])}종({', '.join(by[k])})" for k in ('genre', 'field', 'rare', 'none') if k in by]
        parts_en = [f"{len(by[k])} {LAYER_EN[k]} ({', '.join(by[k])})" for k in ('genre', 'field', 'rare', 'none') if k in by]
        ko.append(f"이 절에서 술어로 가장 자주 쓰인 동사 {len(top)}종은 현재 분류상 {', '.join(parts_ko)}입니다. 이러한 구성만으로 어휘 선택의 적절성을 판단하지는 않습니다.")
        en.append(f"Of the {len(top)} verbs used most often as predicates in this section, the current classification gives {', '.join(parts_en)}. This composition alone is not used to judge word choice.")
        if 'genre' in by or 'field' in by:
            ko.append('분류 기준은 표 위 ‘네 저널에서 공통으로 자주 확인된 동사’와 각 분류의 ‘설명’에 있습니다.')
            en.append('The criteria are given in the table “Verbs frequently found in all four journals” above the results and under each category’s “Explain” button.')
        nones = [v for v in top if v['layer'] == 'none']
        for kind in ('no_pred_in_section', 'other_sections_only', 'not_in_data'):
            vs = [v['verb'] for v in nones if v.get('none_kind') == kind]
            if vs:
                ko.append(f"{', '.join(vs)}({len(vs)}종): {NONE_KO[kind]}.")
                en.append(f"{', '.join(vs)}: {NONE_EN[kind]}.")
        if nones:
            ko.append('비교 자료에서 확인되지 않았다고 해서 사용할 수 없는 표현은 아닙니다.')
            en.append('Not being found in the comparison data does not mean an expression cannot be used.')
        hi_v = [v['verb'] for v in top if v['band'] == 'higher']
        lo_v = [v['verb'] for v in top if v['band'] == 'lower']
        if hi_v:
            ko.append(f"{', '.join(hi_v)}({len(hi_v)}종)의 술어 빈도는 각 동사의 참조 범위보다 높습니다.")
            en.append(f"{', '.join(hi_v)}: predicate rate above each verb's reference range.")
        if lo_v:
            ko.append(f"{', '.join(lo_v)}({len(lo_v)}종)의 술어 빈도는 각 동사의 참조 범위보다 낮습니다.")
            en.append(f"{', '.join(lo_v)}: predicate rate below each verb's reference range.")
        if hi_v or lo_v or nones:
            cko.append('동사 이름을 누르면 그 동사가 쓰인 문장이 보입니다. 비교 자료와 빈도가 다르거나 확인되지 않은 동사가 어떤 문장에서 쓰였는지 읽어 보세요.')
            cen.append('Click a verb to see its sentences, and read where verbs that differ from or are not found in the comparison data are used.')
    # 표시만 바꿈(2026-11-10, 교수님 결정): 300단어 미만 절에서는 '원고에 없는 공통 동사' 알림을 내지 않는다(빈도 판정을 보류하는 것과 같은 까닭)
    if S.get('missing_genre') and not S['short']:
        mg = S['missing_genre']
        ko.append(f"비교 논문의 80% 이상이 이 절에서 술어로 쓰는 ‘네 저널 공통’ 동사 {', '.join(mg)}({len(mg)}종)는 이 원고에서 술어로 쓰이지 않았습니다. 꼭 써야 하는 낱말은 아닙니다.")
        en.append(f"{', '.join(mg)}, verbs found in all four journals, used as predicates here by at least 80% of the comparison papers, {'is' if len(mg) == 1 else 'are'} not used as a predicate in this manuscript. They are not required words.")
    # ④ 쓰임 구성(사실만)
    mu, pu = S.get('usage_mix') or {}, bs.get('usage_pooled') or {}
    mt = sum(v for k, v in mu.items() if k != '굳은 표현'); pt = sum(v for k, v in pu.items() if k != '굳은 표현')
    if mt >= 20 and pt:
        def pct(d, t, k): return d.get(k, 0) / t * 100
        mod_m = pct(mu, mt, '명사 앞 수식') + pct(mu, mt, '명사 뒤 수식'); mod_p = pct(pu, pt, '명사 앞 수식') + pct(pu, pt, '명사 뒤 수식')
        ko.append(f"이 절의 동사 {mt}개 가운데 술어는 {pct(mu, mt, '술어'):.0f}%, 명사를 꾸미는 분사(명사 앞·뒤 수식)는 {mod_m:.0f}%입니다. 비교 논문의 같은 절을 모두 합친 값은 각각 {pct(pu, pt, '술어'):.0f}%, {mod_p:.0f}%입니다.")
        en.append(f"Of the {mt} verbs in this section, {pct(mu, mt, '술어'):.0f}% are predicates and {mod_m:.0f}% are participle modifiers of nouns; pooled over the same section of the comparison papers the figures are {pct(pu, pt, '술어'):.0f}% and {mod_p:.0f}%.")
    # 추가로 확인해 보세요
    for k in ('reporting_per1000', 'hedge_per1000', 'booster_per1000', 'verbs_per1000'):
        if k in checks:
            cko.insert(0, CHECK[k][0]) if k == 'reporting_per1000' else cko.append(CHECK[k][0])
            cen.insert(0, CHECK[k][1]) if k == 'reporting_per1000' else cen.append(CHECK[k][1])
    if checks or cko:
        cko.append('참조 범위를 벗어났다는 이유만으로 문장을 줄이거나 동사를 바꿀 필요는 없습니다. 이 결과는 원고를 다시 읽을 때 참고할 정보입니다.')
        cen.append('There is no need to shorten sentences or change verbs just because a value is outside the reference range; the results are information for rereading the manuscript.')
    return dict(ko=ko, en=en, check_ko=cko, check_en=cen,
                note_ko='이 설명은 표의 수치와 미리 정한 규칙에 따라 작성됩니다. 해설을 만들 때 외부 생성형 AI를 호출하지 않습니다. 같은 입력·비교 자료·규칙 버전에는 같은 설명이 나오도록 구성했으며, 분석의 정확성과 설명의 적절성은 별도로 검증해야 합니다.',
                note_en='This text is generated from the numbers in the tables with predefined rules; no external generative AI is called. The same input, comparison data and rule version give the same text; the accuracy of the analysis and the wording still need separate validation.')
