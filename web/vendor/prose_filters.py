"""Local counting correction: publication dates are metadata, symbols are not verbs."""
import re

VERSION = 'publication-metadata-1+noun-fix-1'   # 2026-11-09: 명사 오분류 규칙 A·B 추가(조은정 결정)
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


def misparsed_noun(token):
    """A·B에 해당하면 그 이유, 아니면 None."""
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
