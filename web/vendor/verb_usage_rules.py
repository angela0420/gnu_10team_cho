"""동사 쓰임 구분 규칙(초안 v0.4): 술어 / 명사 앞 수식 / 명사 뒤 수식 / 비정형 / 명사처럼 / 전치사처럼 / 분사형 형용사 (+ 확인 필요).
v0.4(2026-11-11, 조은정 교수 판정 기준 반영. 근거: 분석_2026-11-11_rules0.4.9/B_60문장_판정준비/판정기준.md, v0.4_후보.md):
  - -ing는 자리가 아니라 내부 구조로 가른다: 목적어·보어·부사어를 거느리면 비정형(주어 자리여도), 관사·of구·앞 명사를 거느리면 명사처럼.
  - 과정·용도를 나타내는 명사 앞 -ing(stirring rate, drying oven, supporting material)는 명사처럼.
  - 분사형 형용사(새 범주): 보충어·방식 부사 없이 굳은 속성을 나타내는 낱말 목록(detailed, corresponding, related …).
  - 과거분사 전용 꼴(grown, taken …)에 붙은 과거형(VBD) 표지를 믿지 않는다.
  - 명사 뒤에서 목적어 없이 전치사가 오는 과거분사 + 뒤에 진짜 정형 동사가 있으면 명사 뒤 수식(Crystals grown at RT were collected).
  - be동사 뒤 보어 자리의 과거분사는 상태 수동의 술어(are H-bonded to …). and로 이어진 수동태가 xcomp로 붙어도 술어(were prepared and placed).
  - 명령형(문두, 주어 없음, 원형)은 술어.
  - 수단의 분사(using, employing …)가 목적어를 거느리면 명사 뒤에 붙어도 비정형.
  - 굳은 표현: compared/based에 접속사(when, if …)가 붙으면 일반 비정형(굳은 표현 아님).
v0.3(2026-11-09): and로 이어진 수식 분사는 앞 수식어의 쓰임을 따름. v0.2: 준전치사 처리.
기준선 총계(모든 VERB)는 바꾸지 않고, 쓰임 층에서만 구분한다(분사형 형용사도 총계에는 그대로 들어 있다).
정형 여부: 과거·현재 시제 꼴(VBD·VBP·VBZ)이거나 정형 조동사·be동사(VBD·VBP·VBZ·MD)가 붙어 있으면 정형."""
FINITE_TAGS = {"VBD", "VBP", "VBZ", "MD"}
LABELS = ["술어", "명사 앞 수식", "명사 뒤 수식", "비정형", "명사처럼", "전치사처럼", "분사형 형용사", "확인 필요"]
LABELS_EN = {"술어": "predicate", "명사 앞 수식": "pre-modifier", "명사 뒤 수식": "post-modifier", "비정형": "non-finite",
             "명사처럼": "nominal", "전치사처럼": "prep-like", "분사형 형용사": "participial adjective", "확인 필요": "check"}
NOUNISH = {"NOUN", "PROPN", "PRON", "NUM"}
FIXED_NONFINITE = {"compared", "based", "given"}
PREP_LIKE = {"including", "following", "regarding", "concerning"}
FIXED_TAG = "굳은 표현"
CONJ_MARKS = {"when", "if", "while", "once", "unless", "although", "though", "whereas", "until", "after", "before", "because", "since"}
# 과거분사로만 쓰이는 꼴(과거형과 꼴이 다름). spaCy가 VBD를 붙여도 과거형으로 보지 않는다
VBN_ONLY = {"grown", "taken", "written", "shown", "given", "known", "seen", "done", "chosen", "drawn", "broken", "frozen", "driven", "risen",
            "spoken", "stolen", "worn", "torn", "thrown", "blown", "flown", "eaten", "fallen", "forgotten", "gotten", "hidden", "ridden",
            "shaken", "mistaken", "undertaken", "overtaken", "begun", "sung", "rung", "sunk", "shrunk", "swum", "proven", "woven", "sown", "sewn"}
# 자동사로 흔히 쓰여 '명사 + V-ed + 전치사'가 술어(과거형)일 수 있는 동사: 명사 뒤 수식으로 바꾸지 않는다
COMMON_INTRANSITIVE = {"shift", "increase", "decrease", "change", "grow", "rise", "fall", "drop", "decline", "occur", "appear", "remain", "move",
                       "react", "proceed", "begin", "start", "end", "emerge", "persist", "vary", "range", "differ", "depend", "converge", "diverge",
                       "evolve", "migrate", "diffuse", "flow", "swell", "shrink", "melt", "dissolve", "precipitate", "crystallize", "decompose", "rotate"}
# 과정·용도를 나타내는 명사 앞 -ing의 머리 명사(rate of stirring, oven for drying, material for supporting)
PROCESS_HEADS = {"rate", "rates", "temperature", "temperatures", "time", "times", "speed", "speeds", "point", "points", "step", "steps",
                 "procedure", "procedures", "process", "processes", "condition", "conditions", "oven", "ovens", "period", "periods",
                 "medium", "media", "chamber", "chambers", "room", "rooms", "pool", "pools", "machine", "machines",
                 "apparatus", "bath", "baths", "method", "methods", "technique", "techniques", "protocol", "protocols", "duration",
                 "voltage", "potential", "current", "power", "frequency", "pressure", "pressures"}
# 명사 앞에서 분사(동작·진행)로 흔히 쓰여 과정명으로 바꾸면 안 되는 -ing
PARTICIPLE_ING = {"resulting", "increasing", "decreasing", "growing", "remaining", "existing", "emerging", "surrounding", "underlying",
                  "interesting", "promising", "leading", "rising", "falling", "changing", "varying", "corresponding", "following", "preceding",
                  "neighboring", "neighbouring", "competing", "coexisting", "evolving", "migrating", "diffusing", "reacting", "decaying",
                  "oscillating", "rotating", "moving", "limiting", "determining", "flowing", "emitting", "absorbing", "scattering", "bridging", "coordinating", "binding"}
# 분사형 형용사(보충어·방식 부사 없이 굳은 속성): 낱말 목록으로만 정한다
# 교수님 기준(2026-11-11): very를 붙여도 자연스러우면 형용사. very가 어색한 corresponding·related 등은 넣지 않는다(명사 앞 수식으로 둠)
ADJ_PART = {"detailed", "interesting", "promising", "advanced", "sophisticated", "complicated", "pronounced", "marked",
            "distinguished", "experienced", "skilled", "qualified", "dedicated", "outstanding", "surprising", "striking", "convincing"}
NOMINAL_PAIRS = {("supporting", "material"), ("supporting", "materials"), ("starting", "material"), ("starting", "materials")}
MEANS_VBG = {"using", "employing", "applying", "utilizing", "utilising", "exploiting", "adopting", "assuming"}
MANNER_DEPS = {"advmod", "npadvmod"}


def _has_complement(t):
    """동사의 보충어나 방식 부사가 붙었는가(분사형 형용사가 아님을 보이는 근거)."""
    return any(c.dep_ in ("dobj", "agent", "ccomp", "xcomp", "prt") or (c.dep_ == "prep" and c.lower_ in ("to", "with", "by", "from", "into", "onto", "on", "in", "at", "for"))
               or (c.dep_ in MANNER_DEPS and c.lower_ not in ("very", "more", "most", "less", "least", "highly", "quite", "rather")) for c in t.children)


def is_finite(t):
    """이 동사가 정형인가(시제 꼴 또는 정형 조동사·be동사가 붙음). and로 이어진 동사는 앞 동사의 조동사를 함께 쓴다."""
    if t.dep_ == "acl" and t.tag_ == "VBD" and not any(c.dep_.startswith("nsubj") for c in t.children):
        return False
    vbd_as_vbn = t.tag_ == "VBD" and t.lower_ in VBN_ONLY        # v0.4: grown 등은 과거형일 수 없다
    if t.tag_ in FINITE_TAGS and not vbd_as_vbn:
        return True
    if any(c.dep_ in ("aux", "auxpass") and c.tag_ in FINITE_TAGS for c in t.children):
        return True
    if t.dep_ in ("conj", "xcomp") and t.head.pos_ in ("VERB", "AUX") and t.tag_ in ("VBN", "VBG", "VB", "VBD"):
        j = t.i - 1
        while j > t.head.i and (t.doc[j].dep_ == "advmod" or t.doc[j].pos_ == "ADV"): j -= 1   # and (thereafter) placed
        cc_before = j > t.head.i and t.doc[j].lower_ in ("and", "or")
        shared = t.dep_ == "conj" or (t.tag_ == "VBN" and cc_before)                  # v0.4: were prepared and placed(xcomp로 붙어도). 바로 앞이 and/or인 과거분사만
        if shared and not any(c.dep_ in ("aux", "auxpass") for c in t.children) and is_finite(t.head) and not any(c.lower_ == "to" and c.dep_ == "aux" for c in t.children):
            return True
    return False


def _later_finite_verb(t):
    """같은 문장에서 t 뒤에 진짜 정형 동사가 따로 있는가."""
    for x in t.sent:
        if x.i > t.i and x.pos_ in ("VERB", "AUX") and (x.tag_ in ("VBP", "VBZ", "MD") or (x.tag_ == "VBD" and x.lower_ not in VBN_ONLY)):
            return True
    return False


def usage(t):
    """동사 토큰 t의 쓰임 이름과 그렇게 본 까닭."""
    low = t.lower_
    # 1. 굳은 표현 compared/based(주어·조동사·목적어 없이 to/with/on을 거느림). v0.4: 접속사가 붙으면 일반 비정형
    if (low in ("compared", "based") and t.dep_ in ("prep", "advcl", "ROOT", "conj", "ccomp", "acl") and
            not any(c.dep_.startswith(("nsubj", "aux", "csubj", "dobj")) for c in t.children) and
            any(c.dep_ == "prep" and c.lower_ in ("to", "with", "on") for c in t.children) and
            not (low == "based" and t.dep_ == "acl")):
        if any(c.dep_ in ("mark", "advmod") and c.lower_ in CONJ_MARKS for c in t.children):
            return "비정형", "접속사가 이끄는 분사절(when/if compared to …)"
        return "비정형", f"{FIXED_TAG}(준전치사): compared to/with, based on, given"
    # 2. 분사형 형용사(목록 + 보충어·방식 부사 없음)
    if low in ADJ_PART and t.tag_ in ("VBN", "VBG", "VBD") and t.dep_ in ("amod", "acomp", "compound", "nmod") and not _has_complement(t):
        return "분사형 형용사", "보충어·방식 부사 없이 굳은 속성(분사형 형용사 목록)"
    # 2-1. 자료 이름 Supporting Information(ACS 논문에 자주 나옴): 명사 앞 수식으로 둔다(교수님 판정, 26번)
    if low == "supporting" and t.i + 1 < len(t.doc) and t.doc[t.i + 1].lower_ == "information":
        return "명사 앞 수식", "자료 이름 Supporting Information"
    # 3. 명령형: 문두, 주어 없음, 원형
    nxt = t.doc[t.i + 1] if t.i + 1 < len(t.doc) else None
    label_like = t.text in ("Figure", "Fig", "Table", "Scheme", "Chart", "Equation", "Eq") or (nxt is not None and (nxt.like_num or nxt.text[:1].isdigit()))
    if t.dep_ == "ROOT" and t.tag_ == "VB" and t.i == t.sent.start and not label_like and not any(c.dep_.startswith("nsubj") for c in t.children):
        return "술어", "명령형(문두, 주어 없음)"
    # 4. 명사 뒤 과거분사 + 목적어 없이 전치사 + 뒤에 정형 동사(Crystals grown at RT were collected)
    if (t.tag_ in ("VBD", "VBN") and t.dep_ in ("ROOT", "ccomp", "conj") and t.i > 0 and t.doc[t.i - 1].pos_ in ("NOUN", "PROPN")
            and not any(c.dep_ in ("aux", "auxpass", "dobj") for c in t.children) and t.i + 1 < len(t.doc) and t.doc[t.i + 1].dep_ == "prep"
            and _later_finite_verb(t) and (low in VBN_ONLY or t.lemma_.lower() not in COMMON_INTRANSITIVE)):
        return "명사 뒤 수식", "명사 뒤 과거분사 + 전치사, 뒤에 정형 동사(구문 분석이 주절로 잘못 붙임)"
    if is_finite(t):
        return "술어", "정형 동사(시제 꼴이거나 정형 조동사가 붙음)"
    # 5. be동사 보어 자리의 과거분사: 상태 수동(are H-bonded to …)
    if t.dep_ == "acomp" and t.tag_ == "VBN" and t.head.lemma_ == "be" and t.head.tag_ in FINITE_TAGS:
        return "술어", "be동사 뒤 과거분사(상태 수동)"
    h = t.head   # were prepared and (immediately) placed: be동사 보어인 과거분사에 and로 이어진 과거분사
    if (t.dep_ == "conj" and t.tag_ == "VBN" and h.dep_ == "acomp" and h.tag_ == "VBN" and h.head.lemma_ == "be" and h.head.tag_ in FINITE_TAGS
            and not any(c.dep_ in ("aux", "auxpass") for c in t.children)):
        return "술어", "and로 이어진 be동사 뒤 과거분사(조동사 공유)"
    if t.dep_ == "prep" and low in PREP_LIKE:
        return "전치사처럼", "동사 뜻을 잃은 준전치사(~을 포함해, ~ 후에, ~에 관하여)"
    if t.dep_ == "prep" and low in FIXED_NONFINITE:
        return "비정형", f"{FIXED_TAG}(준전치사): compared to/with, based on, given"
    # 6. 수단의 분사(using … + 목적어)는 명사 뒤에 붙어도 비정형
    if low in MEANS_VBG and t.dep_ in ("acl", "advcl", "xcomp") and any(c.dep_ == "dobj" for c in t.children):
        return "비정형", "수단을 나타내는 분사구문(using + 목적어)"
    # 7-0. 교수님이 정한 개별 결합: supporting material(용도, 56번), starting material(출발 물질: 재료가 시작하지 않음)
    if t.tag_ == "VBG" and t.dep_ in ("amod", "compound") and t.i < t.head.i and (low, t.head.lower_) in NOMINAL_PAIRS:
        return "명사처럼", "과정·용도를 나타내는 명사 앞 -ing(개별 결합)"
    # 7. 과정·용도를 나타내는 명사 앞 -ing(stirring rate, drying oven). 꾸밈을 받는 명사가 그 동작을 하면(reducing agent, insulating material) 분사로 둔다
    if (t.tag_ == "VBG" and t.dep_ in ("amod", "compound") and t.i < t.head.i and t.head.lower_ in PROCESS_HEADS
            and low not in PARTICIPLE_ING and all(c.dep_ in ("compound", "nmod", "npadvmod", "amod") and c.i < t.i and c.pos_ in ("NOUN", "PROPN", "ADJ") for c in t.children)):
        # 앞의 명사·형용사만 붙은 경우까지 허용([carbon] supporting material). 목적어·부사·전치사가 붙으면 동작을 서술하는 분사로 본다
        return "명사처럼", "과정·용도를 나타내는 명사 앞 -ing(N of/for V-ing)"
    if t.dep_ == "amod" and t.i < t.head.i:
        return "명사 앞 수식", "명사 앞에서 꾸밈(amod)"
    if t.dep_ in ("acl", "relcl") and t.head.pos_ in NOUNISH and t.i > t.head.i and t.tag_ in ("VBN", "VBD", "VBG"):
        return "명사 뒤 수식", "정형이 아닌 채 명사 뒤에서 꾸밈(축약 관계절)"
    if t.dep_ == "conj" and t.tag_ in ("VBN", "VBG", "VBD"):
        h = t.head
        if h.dep_ == "amod" and t.i < h.head.i:
            return "명사 앞 수식", "and로 이어진 명사 앞 수식(amod와 나란함)"
        if h.dep_ in ("acl", "relcl") and h.head.pos_ in NOUNISH and h.i > h.head.i and not is_finite(h):
            return "명사 뒤 수식", "and로 이어진 명사 뒤 수식(축약 관계절과 나란함)"
    # 8. -ing의 내부 구조(v0.4): 명사 자리여도 동사의 보충어·부사어를 거느리면 비정형, 관사·of구·앞 명사를 거느리면 명사처럼
    if t.tag_ == "VBG" and t.dep_ in ("nsubj", "nsubjpass", "csubj", "csubjpass", "dobj", "pobj", "attr", "appos"):
        verbal = any(c.dep_ in ("dobj", "ccomp", "xcomp", "advmod", "npadvmod", "prt", "attr", "acomp", "agent", "mark", "neg") or
                     (c.dep_ == "prep" and c.lower_ != "of") for c in t.children)
        nominal = any(c.dep_ in ("det", "poss", "amod", "compound", "nummod") or (c.dep_ == "prep" and c.lower_ == "of") for c in t.children)
        if verbal and not nominal:
            return "비정형", "명사 자리의 동사적 -ing절(목적어·부사어를 거느림)"
        return "명사처럼", "명사로 쓰인 -ing(관사·of구·앞 명사의 꾸밈, 또는 맨 -ing)"
    if any(c.dep_ == "aux" and c.lower_ == "to" for c in t.children) or t.dep_ in ("xcomp", "advcl", "pcomp", "ccomp", "conj", "acl", "csubj"):
        return "비정형", "to부정사·분사구문 등 시제 없는 동사구"
    if t.dep_ == "ROOT":
        return "확인 필요", "주절 동사인데 정형 표지가 없음(제목·조각문일 수 있음)"
    return "확인 필요", f"규칙에 맞지 않음(dep={t.dep_}, tag={t.tag_})"


def is_fixed(why):
    """usage()가 돌려준 까닭이 '굳은 표현'인가(비정형 중 준전치사)."""
    return why.startswith(FIXED_TAG)
