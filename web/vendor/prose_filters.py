"""Local counting correction: publication dates are metadata, symbols are not verbs."""
import re

VERSION = 'publication-metadata-1+noun-fix-2'   # 2026-11-09: 명사 오분류 규칙 A·B 추가(조은정 결정). 2026-11-12: 고정 결합 C(room temperature, charge and discharge curves) 추가(조은정 결정)
MONTH = r'(?:January|February|March|April|May|June|July|August|September|October|November|December)'
DATE = rf'(?:{MONTH}\s+\d{{1,2}},?\s+\d{{4}}|\d{{1,2}}[/.-]\d{{1,2}}[/.-]\d{{4}}|\d{{4}}[-/]\d{{1,2}}[-/]\d{{1,2}})'
PUBLICATION_DATE = re.compile(
    rf'\b(?P<label>Received|Revised(?:\s+Manuscript\s+Received)?|Accepted|Published(?:\s+(?:on\s+(?:the\s+)?Web|Online|ASAP))?)\s*:?\s*(?P<date>{DATE})\b')


def strip_publication_metadata(text):
    """Remove exact label/date spans, retaining scientific text on either side."""
    cleaned = []
    removed = []
    for line_number, line in enumerate(text.splitlines(), 1):
        before = len(removed)
        def remove(match):
            removed.append(dict(line=line_number, text=match.group(), label=match['label'], reason='publication_date'))
            return ''
        line = PUBLICATION_DATE.sub(remove, line)
        if len(removed) > before and not re.search(r'\w', line):
            line = ''
        cleaned.append(line.rstrip())
    return '\n'.join(cleaned), removed


# 2026-11-09(조은정 결정): 분석기가 동사로 잘못 붙인 명사를 동사 수에서 뺀다. 원고와 비교 자료에 똑같이 적용한다.
# A. 문맥(KWIC)으로 명사임을 확인한 낱말: 화학 복수 명사를 3인칭 현재 동사(VBZ)로 잘못 붙임
CONFIRMED_NOUNS = {'alkanethiol', 'cuvette'}
# B. 하이픈 앞 접두 조각: co-workers, re-examined, non-linear 등에서 낱말 나누기가 조각을 떼어 냄
HYPHEN_PREFIXES = {'co', 're', 'non', 'pre', 'post', 'anti', 'semi', 'multi', 'sub', 'inter', 'intra', 'cross'}
HYPHENS = {'-', '‐', '‑'}


# C. 고정 결합(2026-11-12, 조은정 결정): 분석기가 동사로 붙였지만 이 결합 안에서는 명사인 낱말. 결합 안에서만 적용하고,
#    같은 낱말의 다른 문맥(room 단독, 'We charge and discharge the cells' 등)은 그대로 둔다. 분석기의 원래 품사(pos_)는 바꾸지 않는다.
#    검토 기록: 분석_2026-11-11_rules0.4.9/G_도구점검/점검_보고.md '고정 결합 오탐 검토', v0.5_후보/scan2.md
FIXED_NOUN_CURVES = {'curve', 'curves'}


def fixed_noun_combination(token):
    """'room temperature'의 room, 'charge and discharge curve(s)'의 charge·discharge면 결합 이름, 아니면 None."""
    d, i, low = token.doc, token.i, token.lower_
    w = lambda k: d[i + k].lower_ if 0 <= i + k < len(d) else ''
    if low == 'room' and w(1) in ('temperature', 'temperatures'):
        return 'room temperature'
    if low == 'charge' and w(1) == 'and' and w(2) == 'discharge' and w(3) in FIXED_NOUN_CURVES:
        return 'charge and discharge curves'
    if low == 'discharge' and w(-1) == 'and' and w(-2) == 'charge' and w(1) in FIXED_NOUN_CURVES:
        return 'charge and discharge curves'
    return None


def misparsed_noun(token):
    """A·B·C에 해당하면 그 이유, 아니면 None."""
    fx = fixed_noun_combination(token)
    if fx: return 'fixed_combination:' + fx
    low = token.lower_
    if token.lemma_.lower() in CONFIRMED_NOUNS or low.rstrip('s') in CONFIRMED_NOUNS:
        return 'confirmed_noun'
    if low in HYPHEN_PREFIXES and not token.whitespace_ and token.i + 1 < len(token.doc) and token.doc[token.i + 1].text in HYPHENS:
        return 'hyphen_prefix'
    return None


def noun_like_signature(token):
    """C(세지는 그대로, 표시만): 관사·형용사·수사·소유격·명사 수식어를 거느린 '동사'. 명사일 수 있어 용례 확인이 필요."""
    return any(c.dep_ in ('det', 'amod', 'nummod', 'poss', 'compound') for c in token.children)


def is_lexical_verb(token):
    lemma = token.lemma_.lower()
    return (token.pos_ == 'VERB' and token.is_alpha and lemma.isalpha() and len(lemma) > 1
            and misparsed_noun(token) is None)
