"""동사 쓰임 구분 규칙(초안 v0.3): 술어 / 명사 앞 수식 / 명사 뒤 수식 / 비정형 / 명사처럼 / 전치사처럼 (+ 확인 필요).
v0.3(2026-11-09): and로 이어진 수식 분사는 앞 수식어의 쓰임을 따름. v0.2: 준전치사 처리. 동사 뜻이 남은 compared·based·given은 비정형(굳은 표현),
뜻을 잃은 including·following·regarding·concerning은 전치사처럼. 둘 다 구문 분석이 prep으로 붙인 경우만.
기준선 총계(모든 VERB)는 바꾸지 않고, 쓰임 층에서만 구분한다.
정형 여부는 Close Reading(argument.py has_finite_verb)과 같은 기준: 과거·현재 시제 꼴(VBD·VBP·VBZ)이거나
정형 조동사·be동사(VBD·VBP·VBZ·MD)가 붙어 있으면 정형. spaCy 의존 구문은 '어디에 붙었나'를 보는 보조 수단.
노트북과 기준선 계산이 이 파일 하나를 함께 쓴다."""
FINITE_TAGS = {"VBD", "VBP", "VBZ", "MD"}
LABELS = ["술어", "명사 앞 수식", "명사 뒤 수식", "비정형", "명사처럼", "전치사처럼", "확인 필요"]
LABELS_EN = {"술어": "predicate", "명사 앞 수식": "pre-modifier", "명사 뒤 수식": "post-modifier",
             "비정형": "non-finite", "명사처럼": "nominal", "전치사처럼": "prep-like", "확인 필요": "check"}
NOUNISH = {"NOUN", "PROPN", "PRON", "NUM"}
# 준전치사(marginal preposition; Quirk et al., 1985). 낱말 꼴(소문자)로 비교한다(기본형이 아님)
FIXED_NONFINITE = {"compared", "based", "given"}                              # 비교·근거의 동사 뜻이 남음 → 비정형(굳은 표현)
PREP_LIKE = {"including", "following", "regarding", "concerning"}             # 동사 뜻을 잃음 → 전치사처럼
FIXED_TAG = "굳은 표현"


def is_finite(t):
    """이 동사가 정형인가(시제 꼴 또는 정형 조동사·be동사가 붙음). and로 이어진 동사는 앞 동사의 조동사를 함께 쓴다."""
    # "the method developed in this work": 과거분사가 과거형(VBD)으로 잘못 붙는 일이 있다. 명사 뒤 수식(acl)이고 주어가 없으면 정형이 아니다
    if t.dep_ == "acl" and t.tag_ == "VBD" and not any(c.dep_.startswith("nsubj") for c in t.children):
        return False
    if t.tag_ in FINITE_TAGS:
        return True
    if any(c.dep_ in ("aux", "auxpass") and c.tag_ in FINITE_TAGS for c in t.children):
        return True
    # "was synthesized and characterized": characterized는 앞 동사(synthesized)의 조동사 was를 함께 쓴다
    if t.dep_ == "conj" and t.head.pos_ in ("VERB", "AUX") and t.tag_ in ("VBN", "VBG", "VB"):
        if not any(c.dep_ in ("aux", "auxpass") for c in t.children) and is_finite(t.head):
            return True
    return False


def usage(t):
    """동사 토큰 t의 쓰임 이름과 그렇게 본 까닭."""
    # "conductivity of H2 compared to those of N2", "as compared to": 주어·조동사 없이 to/with/on을 거느린 compared·based는
    # 과거형(VBD)으로 잘못 붙거나 부사절(advcl)로 붙어도 굳은 표현으로 본다
    if (t.lower_ in ("compared", "based") and t.dep_ in ("prep", "advcl", "ROOT", "conj", "ccomp", "acl") and
            not any(c.dep_.startswith(("nsubj", "aux", "csubj", "dobj")) for c in t.children) and
            any(c.dep_ == "prep" and c.lower_ in ("to", "with", "on") for c in t.children) and
            not (t.lower_ == "based" and t.dep_ == "acl")):   # "compounds based on X"는 축약 관계절(명사 뒤 수식)로 둔다
        return "비정형", f"{FIXED_TAG}(준전치사): compared to/with, based on, given"
    if is_finite(t):
        return "술어", "정형 동사(시제 꼴이거나 정형 조동사가 붙음)"
    if t.dep_ == "prep" and t.lower_ in PREP_LIKE:
        return "전치사처럼", "동사 뜻을 잃은 준전치사(~을 포함해, ~ 후에, ~에 관하여)"
    if t.dep_ == "prep" and t.lower_ in FIXED_NONFINITE:
        return "비정형", f"{FIXED_TAG}(준전치사): compared to/with, based on, given"
    if t.dep_ == "amod" and t.i < t.head.i:
        return "명사 앞 수식", "명사 앞에서 꾸밈(amod)"
    if t.dep_ in ("acl", "relcl") and t.head.pos_ in NOUNISH and t.i > t.head.i and t.tag_ in ("VBN", "VBD", "VBG"):
        return "명사 뒤 수식", "정형이 아닌 채 명사 뒤에서 꾸밈(축약 관계절)"
    # "the pristine and doped samples", "samples synthesized and annealed at …": and로 이어진 동사는 앞 수식어의 쓰임을 따른다
    if t.dep_ == "conj" and t.tag_ in ("VBN", "VBG", "VBD"):
        h = t.head
        if h.dep_ == "amod" and t.i < h.head.i:
            return "명사 앞 수식", "and로 이어진 명사 앞 수식(amod와 나란함)"
        if h.dep_ in ("acl", "relcl") and h.head.pos_ in NOUNISH and h.i > h.head.i and not is_finite(h):
            return "명사 뒤 수식", "and로 이어진 명사 뒤 수식(축약 관계절과 나란함)"
    if t.tag_ == "VBG" and t.dep_ in ("nsubj", "nsubjpass", "csubj", "csubjpass", "dobj", "pobj", "attr", "appos"):
        return "명사처럼", "동명사가 주어·목적어 자리"
    if any(c.dep_ == "aux" and c.lower_ == "to" for c in t.children) or t.dep_ in ("xcomp", "advcl", "pcomp", "ccomp", "conj", "acl", "csubj"):
        return "비정형", "to부정사·분사구문 등 시제 없는 동사구"
    if t.dep_ == "ROOT":
        return "확인 필요", "주절 동사인데 정형 표지가 없음(제목·조각문일 수 있음)"
    return "확인 필요", f"규칙에 맞지 않음(dep={t.dep_}, tag={t.tag_})"


def is_fixed(why):
    """usage()가 돌려준 까닭이 '굳은 표현'인가(비정형 중 준전치사)."""
    return why.startswith(FIXED_TAG)
