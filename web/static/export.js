// 결과 내보내기(2026-11-10, 조은정 교수 지시): 이 도구는 원고를 생성형 AI에 보내지 않는다. 대신 학생이 결과를 PDF나 글자로
// 저장해 자기가 쓰는 AI에 직접 물을 수 있게 한다. PDF(인쇄용 화면), 전체·간단·절별 글자 복사, 프롬프트 복사가 모두
// 같은 내용 모델(buildDoc)에서 나온다. index.html의 전역(LAST, EX, CV, BL, LANG, SECS, LAYER, BAND, esc, fmt, exTitle)을 쓴다.
(function(){
const PROMPT = {
ko: `첨부한 PDF는 「논문 글쓰기 진단」 결과입니다. 내 원고 전문, 절별 분석 결과, 결과를 읽는 법, 비교 기준 자료가 들어 있습니다. 다음 원칙에 따라 피드백해 주세요.

1. 원고를 고쳐 쓰거나 대체 문장을 제시하지 마세요. 수정은 제가 직접 합니다.
2. 먼저 PDF의 ‘이 결과를 읽는 법’을 읽고 그대로 따르세요. 300단어보다 짧은 절은 빈도나 비교 범위로 판단하지 마세요.
3. 비교 범위를 벗어났다는 이유만으로, 또는 출판 논문과 같아지도록 동사를 바꾸라고 권하지 마세요. 분류 ④(해당 용법 미확인)는 오류가 아닙니다.
4. 도구가 잘못 탐지한 것으로 보이는 항목이 있으면 따로 알려 주세요.
5. 다시 읽어 볼 가치가 큰 문장을 3~5개 골라, 문장마다 제가 스스로 답해 볼 질문을 1~2개씩 주세요. 관찰과 해석의 구분, 주장의 세기와 근거, 선행연구의 주장과 내 해석의 구분에 주목해 주세요.
6. 답은 한국어로 해 주세요.`,
en: `The attached PDF contains results from Manuscript Diagnosis: my full manuscript, section-by-section analysis, a guide to reading the results, and the comparison data. Please give feedback according to these principles.

1. Do not rewrite my manuscript or suggest replacement sentences. I will revise it myself.
2. First read “How to read these results” in the PDF and follow it. Do not judge sections shorter than 300 words by frequencies or comparison ranges.
3. Do not recommend changing verbs only because a figure is outside the comparison range, or to make my text resemble published papers. Group 4 (usage not found) is not an error.
4. If any item looks like a misdetection by the tool, point it out separately.
5. Choose 3–5 sentences most worth rereading, and for each give me one or two questions to answer for myself. Focus on separating observation from interpretation, matching the strength of claims to the evidence, and distinguishing previous studies’ claims from my own interpretation.
6. Please reply in English.`};
// PDF 맨 앞 'AI 검토 요청문'(2026-11-10, 교수님 지시): 도구의 분석 결과를 정답으로 전제하지 않고 원고 전문·탐지 목록·KWIC을 대조하게 한다
const REVIEW = {
ko: `이 자료는 규칙 기반 작문 분석 도구의 결과입니다. 분석 결과를 정답으로 전제하지 말고, 번호가 붙은 원고 전문과 전체 탐지 목록·KWIC을 대조해 주세요.

1. 탐지된 표현의 문장 내 역할과 분류가 적절한지 확인해 주세요.
2. 탐지 목록에 없는 표현도 원고에서 살펴보고, 분석 기준에 해당하지만 누락된 것으로 의심되는 사례를 찾아 주세요.
3. 도구가 명시한 분석 대상과 제외 기준을 구분하고, 기준 밖의 표현을 무조건 누락으로 판단하지 마세요.
4. 문제가 의심되면 ‘문장 번호 / 해당 표현 / 현재 분석 결과 또는 미탐지 / 검토 의견 / 판단 이유’ 순서로 제시해 주세요.
5. 판단이 불확실하면 ‘확인 필요’라고 표시해 주세요. 문장을 임의로 고치거나 연구 내용을 보충하지 마세요.
6. 이 검토는 작성자의 확인을 돕기 위한 것이며, 최종 판정으로 제시하지 마세요.`,
en: `This document contains the results of a rule-based writing analysis tool. Do not assume the results are correct; compare the numbered full manuscript with the complete detection list and KWIC.

1. Check whether the role in the sentence and the classification of each detected expression are appropriate.
2. Also look at expressions that are not in the detection list, and find cases that fall under the analysis criteria but seem to have been missed.
3. Distinguish the analysis targets and exclusion criteria stated by the tool, and do not treat expressions outside the criteria as missed.
4. If you suspect a problem, give it in this order: sentence number / expression / current result or “not detected” / your comment / reason.
5. If you are unsure, mark it “needs checking”. Do not rewrite sentences or add research content.
6. This review is to help the writer check the results; do not present it as a final judgement.`};
// 분석 대상·제외 기준과 알려진 한계(PDF '1. 분석 기준'). 규칙을 설명할 뿐 바꾸지 않는다
const SCOPE = [
  ["Verbs: lexical verbs that the parser (spaCy en_core_web_sm) tags as VERB. Auxiliaries and be/have used as auxiliaries are not counted.","동사: 분석기(spaCy en_core_web_sm)가 동사(VERB)로 붙인 내용 동사. 조동사와 조동사로 쓰인 be·have는 세지 않습니다."],
  ["Hedges and boosters: words and phrases from the tool's lists (based on the Hedges and Boosters entries in the appendix of Hyland 2005, pp. 218–223, with part-of-speech and context filters for literal uses), counted only in the Introduction, Results and Discussion, and Conclusions; not in Methods.","완화·강조 표현: 도구의 목록(Hyland 2005 부록 218–223쪽의 Hedges·Boosters 항목 바탕, 문자 그대로 쓰인 경우를 품사·문맥 조건으로 거름)에 있는 낱말·구. 서론·결과논의·결론에서만 세고 실험·방법에서는 세지 않습니다."],
  ["Reporting verbs (previous studies): judged by the subject (attribution), not by the verb itself. Counted: author names or previous-study subjects, agentless passive reports (it has been reported), or a citation attached to the verb. Not counted: your own study as subject (we, this work), unless a citation or previously/earlier/our previous work accompanies it.","선행연구 보고동사: 동사 이름이 아니라 주어(귀속)로 판정합니다. 셈: 저자 이름·선행연구 주어, 행위자 없는 수동 보고(it has been reported), 동사에 인용 표시. 뺌: 주어가 자기 연구(we, this work)인 경우. 단, 인용 표시나 previously·earlier·our previous work가 함께 있으면 셈."]];
const EXCLUDE = [
  ["Words confirmed as misparsed nouns (alkanethiol, cuvette) and hyphen prefixes split off as verbs (co-, re-, non- …) are not counted as verbs.","분석기가 동사로 잘못 붙인 것으로 확인된 명사(alkanethiol, cuvette)와 하이픈 앞 접두 조각(co-, re-, non- 등)은 동사로 세지 않습니다."],
  ["Marginal prepositions that have lost their verb meaning (including, following, regarding, concerning) are left out of the verb comparison tables for individual verbs. To keep the same counting basis as the comparison data, they are still included in the verb totals, and they are marked separately (“preposition-like”) in the complete detection list.","동사 뜻을 잃은 준전치사(including, following, regarding, concerning)는 개별 동사 비교표에서는 제외합니다. 다만 비교 자료와의 집계 기준을 유지하기 위해 동사 총계에는 포함하고, 전체 탐지 목록에는 ‘전치사처럼’으로 따로 표시합니다."],
  ["Items counted as reporting verbs are not counted again as hedges or boosters.","보고동사로 센 낱말은 완화·강조 표현에 다시 세지 않습니다."],
  ["Sections under 300 words are not judged as higher or lower (rates for reference only).","300단어 미만 절은 높고 낮음을 판정하지 않습니다(환산 수치는 참고용)."]];
const LIMITS = [
  ["When the parser assigns the wrong part of speech, a verb can be missed or classified differently. Known cases: “changes” read as a plural noun (…titanium changes the phase behaviour), “were mixed, pressed … and heated” read as an adjective and an adverbial clause, “titanium delays the phase transition” read as a noun phrase.","분석기가 품사를 잘못 붙이면 동사가 빠지거나 다르게 분류됩니다. 확인된 예: “changes”를 복수 명사로(…titanium changes the phase behaviour), “were mixed, pressed … and heated”를 형용사·부사절로, “titanium delays the phase transition”을 명사구로 읽음."],
  ["The same word can be judged differently depending on sentence structure (e.g. “delays” was a verb in one sentence and a noun in another).","같은 낱말도 문장 구조에 따라 다르게 판정될 수 있습니다(예: delays가 한 문장에서는 동사, 다른 문장에서는 명사)."],
  ["The manuscript and the comparison papers are processed by the same procedure, but it has not been shown that errors are equally frequent in both or cancel out.","원고와 비교 논문은 같은 절차로 처리했지만, 오류의 빈도와 영향이 같거나 서로 상쇄된다는 것은 확인되지 않았습니다."],
  ["Verbs carrying noun-like dependents are still counted but marked “may be a noun”; check them in context.","명사처럼 수식어를 거느린 '동사'는 그대로 세되 '명사일 수 있음'으로 표시합니다. 문맥에서 확인하세요."],
  ["The usage classification rules (verb_usage_rules v0.3) are still being checked against human judgements.","동사 쓰임 분류 규칙(verb_usage_rules v0.3)은 사람 판정과 대조하는 중입니다."],
  ["Comparison sets contain 10–19 papers per journal, so ranges are wide.","비교 집합은 저널마다 10–19편이라 범위가 넓습니다."]];
// 글자로 붙여 넣을 때는 'PDF' 대신 '아래 글'로 읽히게 한다
const promptFor = (lang, asText) => asText ? PROMPT[lang].replace("첨부한 PDF는", "아래 글은").replace("PDF의 ‘이 결과를 읽는 법’", "아래 ‘이 결과를 읽는 법’")
  .replace("The attached PDF contains", "The text below contains").replace("in the PDF", "below") : PROMPT[lang];
const GUIDE = {
ko: ["이 도구는 원고를 생성형 AI에 보내지 않습니다. AI 피드백이 필요하면 결과를 PDF로 저장해, 여러분이 쓰는 AI에 직접 올려 물어보세요. 저장되는 PDF에는 분석 기준과 알려진 한계, 결과 요약, 번호가 붙은 원고 전문, 전체 탐지 목록(앞뒤 문맥 포함), 비교 기준 자료와 출처, 그리고 AI가 결과를 원고와 대조하도록 하는 검토 요청문이 들어 있습니다. 아래 프롬프트를 함께 붙여 넣으면 AI가 원고를 대신 고쳐 쓰지 않고 질문으로 피드백합니다.",
     "PDF를 올릴 수 없을 때는 결과를 글자로 복사해 대화창에 붙여 넣으세요. AI 사용량이 빠듯하면 ‘간단 복사’나 절별 복사를 쓰세요. AI를 쓸 수 없을 때도 결과를 저장해 두었다가 나중에 물어보거나, ‘내 글 살펴보기’로 문장을 직접 읽어 볼 수 있습니다."],
en: ["This tool does not send your manuscript to any generative AI. If you would like AI feedback, save your results as a PDF and upload it to the AI you use. The PDF contains the analysis criteria and known limits, a results summary, your numbered full manuscript, the complete detection list with context, the comparison data with sources, and a review request asking the AI to check the results against your manuscript. Paste the prompt below along with it, and the AI will give feedback through questions instead of rewriting your manuscript.",
     "If you cannot upload a PDF, copy the results as text and paste them into the chat. If your AI usage is limited, use the short version or copy one section at a time. Even without AI, you can save your results to ask later, or read your sentences directly in “Read your own text.”"]};
const UI = {
  title:["Save your results and ask your own AI","결과를 저장하고, 내가 쓰는 AI에게 물어보세요"], jump:["Save results ↓","결과 저장하기 ↓"],
  pdf:["Save as PDF","PDF로 저장하기"], all:["Copy all","전체 복사"], short:["Copy short version","간단 복사"], sec:["Sections","절"], allsec:["All sections","모든 절"],
  words:["about {n} words","약 {n}단어"], copied:["Copied","복사했습니다"], fail:["Could not copy. Select the text in the prompt box and copy it.","복사하지 못했습니다. 프롬프트 상자의 글을 직접 골라 복사하세요."],
  pcopy:["Copy prompt","프롬프트 복사"], pcopy_ko:["Copy Korean prompt","한국어 프롬프트 복사"], pcopy_en:["Copy English prompt","Copy English prompt"],
  pview:["See the prompt","프롬프트 펼쳐 보기"], reply:["AI reply language for copies and PDF","복사·PDF에 넣을 AI 답변 언어"],
  pdfnote:["A print view with everything expanded opens. In the print window, set the destination to “Save as PDF”. If you save through a printer such as Hancom PDF, the letters become pictures and an AI cannot read them.",
           "모든 내용을 펼친 인쇄용 화면이 열립니다. 인쇄 창의 대상에서 ‘PDF로 저장’을 고르세요. 한컴 PDF 같은 프린터로 저장하면 글자가 그림이 되어 AI가 읽지 못합니다."],
  upload:["This file contains your full manuscript. If you upload it to an external AI, it is sent to that service.","원고 전문이 포함되어 있으며, 외부 AI에 업로드하면 해당 서비스로 전달됩니다."],
  info_h:["About your manuscript (optional)","원고 정보(선택)"], info_note:["These go only into your saved results, so that an AI can give more specific feedback. They are not sent to the server.","저장하는 결과에만 들어가 AI가 더 구체적으로 피드백하게 돕습니다. 서버로 보내지 않습니다."],
  journal:["Target journal","목표 저널"], stage:["Manuscript stage","원고 단계"], question:["What you especially want to ask","특히 묻고 싶은 점"],
  stages:[["","(choose)","(고르기)"],["class","Course assignment draft","수업 과제 초안"],["thesis","Thesis chapter draft","학위논문 장 초안"],["pre","Before submission","투고 전 원고"],["rev","Revision after review","심사 후 수정본"],["other","Other","기타"]]};
const SECNAME = {INT:["Introduction","서론"],MET:["Methods","실험·방법"],RD:["Results and Discussion","결과·논의"],CON:["Conclusions","결론"]};
const SECID = {INT:["Intro","서론"],MET:["Methods","방법"],RD:["RD","결과논의"],CON:["Concl","결론"]};

// ---- 언어: 문서 언어(ko|en|both)와 답변 언어(ko|en)
const docLang = () => LANG;
const replyLang = () => LANG==="both" ? (document.getElementById("replylang")?.value || "ko") : LANG;
const P = (pair) => { const [en,ko] = pair; return docLang()==="en"?en:docLang()==="ko"?ko:`${en} · ${ko}`; };
const P2 = (en, ko) => P([en, ko]);
const ui = k => P(UI[k]);
const sid = (code, n) => `[${docLang()==="en"?SECID[code][0]:SECID[code][1]}-${n}]`;
const ref = (code, n) => `${docLang()==="en"?SECID[code][0]:SECID[code][1]}-${n}`;
// 화면용 문구(누르면, 표 위)를 문서용으로 바꾼다. 화면에서는 원래 문구가 맞으므로 PDF·복사에서만 바꾼다(2026-11-10)
const DOC_FIX = [
  [/\s*개수를 누르면 이 절의 동사 목록을 볼 수 있습니다\./, ""], [/\s*Click the count to see the verb list for this section\./, ""],
  [/\s*낱말을 누르면 용례가 나옵니다\./, ""], [/\s*Click a word to see its concordance\./, ""],
  [/분류 기준은 표 위 ‘네 저널에서 공통으로 자주 확인된 동사’와 각 분류의 ‘설명’에 있습니다\./, "분류 기준은 ‘1. 분석 기준’에, 네 저널 공통 동사 목록은 ‘5. 기준 자료’에 있습니다."],
  [/The criteria are given in the table “Verbs frequently found in all four journals” above the results and under each category’s “Explain” button\./, "The criteria are in “1. Analysis criteria” and the common-verb lists in “5. Reference data”."],
  [/동사 이름을 누르면 그 동사가 쓰인 문장이 보입니다\./, "해당 문장 번호를 따라 ‘3. 원고 전문’ 또는 ‘4. 전체 탐지 목록’에서 용례를 확인해 보세요."],
  [/Click a verb to see its sentences, and read/, "Follow the sentence numbers to “3. Full manuscript” or “4. Complete detection list”, and read"]];
const docFix = s => DOC_FIX.reduce((a, [re, to]) => a.replace(re, to), String(s));
const exText = k => { const e = EX[k]; if(!e) return ""; return docFix(docLang()==="en"?e.en:docLang()==="ko"?e.ko:`${e.en} ${e.ko}`); };
const exName = k => { const e = EX[k]; if(!e) return k; return P([e.title.en, e.title.ko]); };
const usageName = k => exName("usage_"+k);

// 위치(눈금 그림 대신 문장)
function posText(band, short){
  if(short) return P2("Not judged (section under 300 words; rate for reference only)", "판정 보류(300단어 미만 절, 환산 수치는 참고용)");
  return ({typical:P2("Inside the comparison range (Q1–Q3)","비교 범위(Q1–Q3) 안"),
    higher:P2("Above the comparison range, inside the full range","비교 범위보다 높음, 전체 범위 안"),
    lower:P2("Below the comparison range, inside the full range","비교 범위보다 낮음, 전체 범위 안"),
    beyond_high:P2("Above the full range (higher than all comparison papers)","전체 범위보다 높음(모든 비교 논문보다 높음)"),
    beyond_low:P2("Below the full range (lower than all comparison papers)","전체 범위보다 낮음(모든 비교 논문보다 낮음)")})[band] || "–";
}
const usagePlain = (u, fixed) => Object.entries(u||{}).filter(([k])=>k!=="굳은 표현").map(([k,n]) => `${usageName(k)} ${n}${(k==="비정형"&&fixed)?` (${P2("of which fixed expressions","그중 굳은 표현")} ${fixed})`:""}`).join(", ") || "–";
const usagePct = u => { if(!u) return "–"; const e = Object.entries(u).filter(([k])=>k!=="굳은 표현"); const tot = e.reduce((a,[,n])=>a+n,0)||1;
  return e.sort((a,b)=>b[1]-a[1]).map(([k,n]) => `${usageName(k)} ${Math.round(n/tot*100)}%`).join(", "); };
const layerName = l => { const L = LAYER[l]; return P([L[0], L[1]]); };
const NONE_KIND = {no_pred_in_section:["appears in this section of the comparison papers but never as a predicate","비교 논문의 이 절에 나오지만 술어로는 쓰이지 않음"],
  other_sections_only:["appears only in other sections of the comparison papers","비교 논문의 다른 절에만 나옴"], not_in_data:["not found anywhere in this comparison data","이 비교 자료 어디에도 없음"]};

// ---- 내용 모델: [{t:'h1'|'h2'|'h3'|'p'|'ul'|'table'|'sent'|'pre', ...}]
// 검토용 문서(2026-11-10 개편): 1 분석 기준 → 2 결과 요약 → 3 번호 붙은 원고 전문 → 4 전체 탐지 목록·KWIC → 5 기준 자료 → 6 출처.
// 맨 앞의 AI 검토 요청문은 도구 결과를 정답으로 전제하지 않고 원고와 탐지 목록을 대조하게 한다. 간단 복사(short)는 예전처럼 짧게 둔다.
const CTX = 40;   // KWIC 앞뒤 문맥 글자 수. 전체 문장은 같은 번호로 '3. 원고 전문'에 있다
const HEDGE_IN = ["INT","RD","CON"];   // 완화·강조 표현을 세는 절(app/analyzer.py HEDGE_SECS와 같음)
const USAGE_ORDER = ["술어","명사 앞 수식","명사 뒤 수식","비정형","명사처럼","전치사처럼","확인 필요"];
function kwic(s, a, b){
  let L = s.slice(Math.max(0, a - CTX), a), R = s.slice(b, b + CTX);
  if(a > CTX) L = "…" + L.replace(/^\S*\s+/, "");
  if(b + CTX < s.length) R = R.replace(/\s+\S*$/, "") + "…";
  return [L.trim() || "–", R.trim() || "–"];
}
// 한 절의 모든 탐지 항목(동사 낱말 전부 + 완화·강조 표현 + 보고동사 + 보고동사에서 뺀 자기 연구 소개)
function detections(c, S){
  const rows = [], K = {verb:0, prep:0, hedge:0, booster:0, prior:0, self:0};
  (S.tokens || []).forEach(t => { const [n, a, b, lem, , lab, nl] = t; if(!lab) return;
    const w = S.sentences[n-1].slice(a, b); K.verb++; if(lab === "전치사처럼") K.prep++;
    rows.push({n, a, b, o:0, w: w.toLowerCase() === lem ? w : `${w} (${lem})`,
      cls: `${P2("Verb","동사")}: ${usageName(lab)}${nl ? ` · ${P2("may be a noun","명사일 수 있음")}` : ""}`}); });
  const LAB = {hedge_per1000:["hedge", P2("Hedge","완화 표현")], booster_per1000:["booster", P2("Booster","강조 표현")], reporting_per1000:["prior", P2("Reporting verb (previous study)","선행연구 보고동사")]};
  S.metrics.forEach(m => { const L = LAB[m.key]; if(!L) return;
    (m.evidence || []).forEach(h => { K[L[0]]++; rows.push({n:h.sent, a:h.start, b:h.end, o:1, w:h.word, cls:L[1]}); });
    (m.excluded_self || []).forEach(h => { K.self++; rows.push({n:h.sent, a:h.start, b:h.end, o:2, w:h.word, cls:P2("Not counted as a reporting verb (introduces your own study)","보고동사에서 뺌(자기 연구 소개)")}); }); });
  rows.sort((x, y) => x.n - y.n || x.a - y.a || x.o - y.o);
  return {rows, K};
}
function buildDoc(o){
  const r = LAST, D = [], B = BL[r.baseline] || {}, secs = SECS.map(s=>s[0]).filter(c => r.sections[c] && (!o.secs || o.secs.includes(c)));
  const now = new Date(), stamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const H = (t, x) => D.push({t, x}), Pp = x => D.push({t:"p", x}), UL = items => D.push({t:"ul", items}), TB = (head, rows) => D.push({t:"table", head, rows});
  const LL = docLang(), pairs = (arr) => arr.map(p => P(p));
  const review = lang => REVIEW[lang];
  H("h1", P2("Manuscript Diagnosis results", "논문 글쓰기 진단 결과"));
  Pp(ui("upload"));
  // 맨 앞: 검토용 문서(PDF·전체 복사)는 AI 검토 요청문, 간단 복사는 학생 피드백 프롬프트
  if(!o.short){
    H("h2", P2("Review request to the AI reading this document", "이 문서를 읽는 AI에게: 검토 요청"));
    D.push({t:"pre", x: review(replyLang()) + (replyLang()==="ko" ? "\n\n답은 한국어로 해 주세요." : "\n\nPlease reply in English.")});
  } else {
    D.push({t:"pre", x: promptFor(replyLang(), true)});
    D.push({t:"hr"});
  }
  // ① 분석 기준: 도구·규칙 버전, 분석 대상과 분류 기준, 제외 기준, 알려진 한계
  H("h2", P2("1. Analysis criteria", "1. 분석 기준"));
  H("h3", P2("Tool, rule versions and comparison set", "도구·규칙 버전과 비교 집합"));
  const info = [`${P2("Tool","도구")}: ${P2("Manuscript Diagnosis (rule-based; no generative AI)","논문 글쓰기 진단(규칙 기반, 생성형 AI 쓰지 않음)")}`,
    `${P2("Parser","분석기")}: spaCy en_core_web_sm`,
    `${P2("Comparison data","비교 자료")}: ${r.version.baseline}`,
    `${P2("Hedge and booster rules","완화·강조 표현 규칙")}: ${r.version.counting}`,
    `${P2("Reporting-verb rule","보고동사 규칙")}: ${r.version.reporting || r.version.usage_rules} (${P2("subject-based, 2026-11-10","주어 기반, 2026-11-10")})`,
    `${P2("Verb usage classification","동사 쓰임 분류")}: ${r.version.usage_classes || "verb_usage_rules v0.3"}`,
    `${P2("Export","내보내기")}: export-2026-11-10b`,
    `${P2("Comparison set","비교 집합")}: ${P([r.baseline_info.en, r.baseline_info.ko])}, ${LL==="ko"?`${r.baseline_info.papers}편`:`${r.baseline_info.papers} ${P2("papers","편")}`}${r.baseline_info.reference_only?` (${P2("few papers; for reference only","논문 수가 적어 참고용")})`:""}`,
    `${P2("Generated","만든 때")}: ${stamp}`];
  if(o.secs) info.push(`${P2("Sections included in this copy","이 복사에 넣은 절")}: ${secs.map(c=>P(SECNAME[c])).join(", ")}`);
  const mi = manuscriptInfo(); if(mi.length) info.push(...mi);
  UL(info);
  H("h3", P2("What is analysed and how it is classified", "분석 대상과 분류 기준"));
  UL(pairs(SCOPE));
  if(!o.short){
    Pp(`${exName("usage")}: ${exText("usage")}`);
    UL(Object.keys(EX).filter(k => k.startsWith("usage_")).map(k => `${exName(k)}: ${exText(k)}`).concat([`${exName("fixed")}: ${exText("fixed")}`, `${exName("noun_like")}: ${exText("noun_like")}`]));
    Pp(P2("Verb groups (compared with the comparison papers, by use as a predicate):","동사 분류(비교 논문과 견줌, 술어로 쓴 것 기준):"));
    UL(["layer_genre","layer_field","layer_rare","layer_none"].map(k => `${exName(k)}: ${exText(k)}`));
  }
  H("h3", P2("Exclusion criteria", "제외 기준"));
  UL(pairs(EXCLUDE));
  Pp(P2("Expressions outside these targets (e.g. nominalisations, adjectives, nouns, hedging by sentence structure) are not analysed; their absence from the detection list is not an omission.","이 대상 밖의 표현(예: 명사화, 형용사, 명사, 문장 구조로 나타나는 완화)은 분석하지 않습니다. 탐지 목록에 없다고 해서 누락은 아닙니다."));
  H("h3", P2("Known limits", "알려진 한계"));
  UL(pairs(LIMITS));
  H("h3", P2("What this tool does not judge", "이 도구가 판단하지 않는 것"));
  UL([P2("The overall quality of the text.","글 전체의 완성도."), P2("Whether the literature review is sufficient.","문헌 검토가 충분한지."),
      P2("Whether claims and evidence are properly connected.","주장과 근거가 적절하게 연결되는지."), P2("Whether you must revise.","반드시 수정해야 하는지."),
      P2("Nominalisation: this tool does not analyse nominalisation itself, so verb frequencies alone cannot tell whether you nominalise too much.","명사화: 이 도구는 명사화 자체를 분석하지 않으므로, 동사 빈도만으로 명사화가 많은지 판단할 수 없습니다.")]);
  // ② 결과 요약: 읽는 법, 수치의 계산 기준, 탐지 개수, 분류별 결과, 절별 결과
  H("h2", P2("2. Results summary", "2. 결과 요약"));
  H("h3", P2("How to read these results", "이 결과를 읽는 법"));
  UL([P2("Sentences are numbered by section, e.g. [Intro-3] is the third sentence of the Introduction. Results and the detection list refer to sentences by these numbers.", "문장에는 절별 번호가 붙어 있습니다. 예를 들어 [서론-3]은 서론의 셋째 문장입니다. 결과와 탐지 목록에서도 같은 번호로 문장을 가리킵니다."),
      P2("Sections shorter than 300 words are not judged as higher or lower. Their per-1,000-word rates are shown for reference only; focus on the actual counts and sentences. The 300-word threshold is this tool's own criterion for withholding frequency judgements on short sections.",
         "300단어보다 짧은 절은 빈도에 따른 높고 낮음을 판정하지 않습니다. 환산 수치는 참고용으로만 제시하므로, 실제 개수와 문장을 중심으로 확인해 주세요. 300단어는 이 도구에서 짧은 절의 빈도 판정을 보류하기 위해 정한 기준입니다."),
      P2("The comparison range is not a score. Being outside it is information for review, not an error.", "비교 범위는 점수가 아닙니다. 범위를 벗어난 것은 오류가 아니라 검토를 위한 정보입니다."),
      P2("Group 4 (usage not found) is not an error; it only means the comparison papers do not show this use.", "분류 ④(해당 용법 미확인)는 오류가 아닙니다. 비교 논문에서 이 쓰임이 확인되지 않았다는 뜻일 뿐입니다."),
      P2("All detections are automatic and can be wrong. Check each item in its sentence (see “4. Complete detection list”).", "모든 탐지는 자동 규칙이라 틀릴 수 있습니다. 항목마다 해당 문장에서 확인하세요(‘4. 전체 탐지 목록’).")]);
  if(!o.short){
    H("h3", P2("How the figures are calculated", "수치의 계산 기준"));
    UL([`${P2("Per 1,000 words","1,000단어당")}: ${P2("count in the section ÷ words in the section × 1,000. Words are alphabetic tokens.","절 안의 개수 ÷ 그 절의 단어 수 × 1,000. 단어는 알파벳으로 된 낱말입니다.")}`,
        `${P2("Comparison range","비교 범위")}: ${P2("for each paper in the comparison set the per-1,000-words value of the same section is computed; the comparison range is the first to third quartile (Q1–Q3) of those values, computed with the inclusive method (same as Excel QUARTILE.INC).","비교 집합의 논문마다 같은 절의 1,000단어당 값을 구하고, 그 값들의 1사분위수–3사분위수(Q1–Q3)를 비교 범위로 씁니다. 사분위수는 포함 방식(엑셀 QUARTILE.INC와 같음)으로 계산합니다.")}`,
        `${P2("Full range","전체 범위")}: ${P2("the lowest to the highest value among the comparison papers.","비교 논문 값 가운데 최솟값–최댓값.")}`,
        `${P2("Comparison median","비교 중앙값")}: ${exText("median")}`,
        `${P2("Position labels","판정 말")}: ${P2("“Inside the comparison range” = Q1 ≤ value ≤ Q3; “above/below the comparison range” = outside Q1–Q3 but inside the full range; “above/below the full range” = higher or lower than all comparison papers. Labels describe position, not quality.","‘비교 범위 안’ = Q1 ≤ 값 ≤ Q3, ‘비교 범위보다 높음/낮음’ = Q1–Q3 밖이지만 전체 범위 안, ‘전체 범위보다 높음/낮음’ = 모든 비교 논문보다 높거나 낮음. 위치를 말할 뿐 잘 썼다 못 썼다는 평가가 아닙니다.")}`,
        ...["hedge_per1000","booster_per1000","reporting_per1000","verbs_per1000"].map(k => `${exName(k)}: ${exText(k)}`),
        `${P2("No double counting","중복 집계 없음")}: ${P2("Items classified as reporting verbs for previous studies are not counted again as hedges or boosters. The same verb may therefore be counted under different measures depending on its context and classification.","선행연구 보고동사로 분류한 항목은 완화·강조 표현에 중복 집계하지 않습니다. 따라서 같은 동사라도 문맥과 분류에 따라 집계 항목이 달라질 수 있습니다.")}`]);
    // 탐지 개수와 분류별 결과(절 × 항목). 4의 목록 줄 수와 같다
    H("h3", P2("Detection counts", "탐지 개수"));
    const DS = {}; secs.forEach(c => DS[c] = detections(c, r.sections[c]));
    const na = c => !HEDGE_IN.includes(c);
    TB([P2("Section","절"), P2("Words","단어 수"), P2("Sentences","문장 수"), P2("Verbs","동사"), P2("Hedges","완화 표현"), P2("Boosters","강조 표현"), P2("Reporting verbs (previous studies)","선행연구 보고동사"), P2("Left out of reporting verbs (own study)","보고동사에서 뺌(자기 연구)"), P2("Rows in list 4","4번 목록 줄 수")],
      secs.map(c => { const S = r.sections[c], K = DS[c].K; return [P(SECNAME[c]), S.words.toLocaleString(), String(S.sentences.length), String(K.verb),
        na(c) ? P2("not counted","세지 않음") : String(K.hedge), na(c) ? P2("not counted","세지 않음") : String(K.booster), String(K.prior), String(K.self), String(DS[c].rows.length)]; }));
    Pp(P2("Verb counts include preposition-like uses, which are left out of the verb comparison tables. A word that is both a verb and a reporting verb (or hedge) appears in two rows of list 4.","동사 개수에는 개별 동사 비교표에서 뺀 ‘전치사처럼’ 쓰임도 들어 있습니다. 동사이면서 보고동사(또는 완화 표현)인 낱말은 4번 목록에 두 줄로 나옵니다."));
    H("h3", P2("Verbs by usage", "쓰임별 동사 수"));
    TB([P2("Section","절"), ...USAGE_ORDER.map(usageName), P2("of which fixed expressions","그중 굳은 표현")],
      secs.map(c => { const m = r.sections[c].usage_mix || {}; return [P(SECNAME[c]), ...USAGE_ORDER.map(k => String(m[k] || 0)), String(m["굳은 표현"] || 0)]; }));
  }
  // 절별 결과
  secs.forEach(c => {
    const S = r.sections[c]; H("h3", `${P(SECNAME[c])} — ${P2("results","결과")}`);
    UL([`${P2("Words","단어 수")}: ${S.words.toLocaleString()}${S.words_baseline?` (${P2("comparison median","비교 중앙값")} ${fmt(S.words_baseline.median)})`:""}; ${P2("comparison papers with this section","이 절이 있는 비교 논문")}: ${S.baseline_papers}`,
        ...(S.short ? [P2("This section is shorter than 300 words, so higher or lower frequencies are not judged. The rates are given for reference only; focus on the actual counts and sentences.","이 절은 300단어보다 짧아 빈도에 따른 높고 낮음은 판정하지 않습니다. 환산 수치는 참고용으로만 제시하므로, 실제 개수와 문장을 중심으로 확인해 주세요.")] : [])]);
    const ms = S.metrics.filter(m => !o.short || (!S.short && m.band && m.band !== "typical"));
    if(ms.length){
      if(o.short) Pp(P2("Measures outside the comparison range:","비교 범위를 벗어난 지표:"));
      TB([P2("Measure","지표"),P2("Count","개수"),P2("Per 1,000 words","1,000단어당"),P2("Comparison median","비교 중앙값"),P2("Comparison range (Q1–Q3)","비교 범위(Q1–Q3)"),P2("Full range","전체 범위"),P2("Position","위치")],
        ms.map(m => { const s = m.baseline; return [exName(m.key), String(m.count), fmt(m.rate), s?fmt(s.median):"–", s?`${fmt(s.q1)}–${fmt(s.q3)}`:"–", s?`${fmt(s.min)}–${fmt(s.max)}`:"–", posText(m.band, S.short)]; }));
    } else if(o.short) Pp(P2("No measure is outside the comparison range (or the section is too short to judge).","비교 범위를 벗어난 지표가 없습니다(또는 절이 짧아 판정하지 않음)."));
    if(o.short){   // 간단 복사: 탐지 낱말만 짧게
      const det = [];
      S.metrics.forEach(m => {
        if(m.evidence) det.push(`${exName(m.key)}: ${m.evidence.length ? m.evidence.map(h => `${h.word} (${ref(c, h.sent)})`).join(", ") : P2("none","없음")}`);
        if(m.excluded_self && m.excluded_self.length) det.push(`${P2("Not counted as reporting verbs (introducing your own study)","보고동사에서 뺀 것(자기 연구 소개)")}: ${m.excluded_self.map(h => `${h.word} (${ref(c, h.sent)})`).join(", ")}`);
      });
      if(det.length) UL(det);
    }
    if(!o.short && S.commentary){
      const cm = S.commentary, pick = (ko, en) => (LL==="ko"?ko:LL==="en"?en:en.map((e,i)=>`${e} ${ko[i]||""}`));
      Pp(`${P2("Reading the results","분석 결과 풀이")}:`);
      pick(cm.ko||[], cm.en||[]).map(docFix).forEach(Pp);
      if((cm.check_ko||[]).length){ Pp(P2("Check further:","추가로 확인해 보세요:")); UL(pick(cm.check_ko, cm.check_en).map(docFix)); }
    }
    // 동사
    const verbRow = v => { const b = v.baseline, sents = [...new Set(v.hits.map(h=>h.sent))].map(n=>ref(c,n)).join(", ");
      return [v.verb, String(v.pred), String(v.count), fmt(v.rate), layerName(v.layer),   // ④의 세부 사유는 표 아래 문장으로 뺀다
        b?`${b.papers}/${b.n}${(v.layer==="genre"||v.layer==="field")&&b.q1!=null?`; ${P2("range","범위")} ${fmt(b.q1)}–${fmt(b.q3)}`:""}`:"–",
        v.band?posText(v.band,false):"–", usagePlain(v.usage, v.fixed) + (v.noun_like?`; ${exName("noun_like")} ${v.noun_like}`:""), usagePct(b&&b.usage), sents]; };
    const VH = [P2("Verb","동사"),P2("As predicate","술어로"),P2("All uses","모든 쓰임"),P2("Predicate per 1,000 words","술어 1,000단어당"),P2("Group","분류"),P2("Comparison papers using it as predicate","비교 논문에서 술어로 쓴 논문"),P2("Frequency","빈도"),P2("Usage in your text","원고에서의 쓰임"),P2("Usage in comparison papers","비교 논문에서의 쓰임"),P2("Sentences","문장")];
    let tv = S.top_verbs, ov = S.other_verbs || [];
    if(o.short){ tv = tv.filter(v => v.layer==="rare"||v.layer==="none"); ov = ov.filter(v => v.layer==="rare"||v.layer==="none"); }
    if(tv.length || !o.short){ Pp(`${o.short?P2("Verbs in groups 3 and 4","③·④ 분류 동사"):exName("verbs_top")}:`);
      if(tv.length) TB(VH, tv.map(verbRow)); else Pp(P2("none","없음")); }
    if(ov.length){ Pp(`${exName("verbs_other")}${o.short?` (${P2("groups 3 and 4","③·④ 분류")})`:""}:`); TB(VH, ov.map(verbRow)); }
    const nk = [...tv, ...ov].filter(v => v.none_kind);
    if(nk.length) Pp(`${P2("Group ④ (usage not found) in detail","④ 해당 용법 미확인의 세부")}: ${nk.map(v => `${v.verb} — ${P(NONE_KIND[v.none_kind])}`).join("; ")}.`);
    if(!o.short){
      const extra = [...(S.short ? [] : [`${exName("missing_genre")}: ${S.missing_genre.length ? S.missing_genre.join(", ") : P2("none","없음")}`]),   // 300단어 미만 절에서는 숨김(2026-11-10)
          ...(Object.keys(S.prep_like||{}).length ? [`${P2("Left out of the verb tables as preposition-like (included in the verb total)","전치사처럼 쓰여 동사 비교표에서 뺀 것(동사 총계에는 포함)")}: ${Object.entries(S.prep_like).map(([k,n])=>`${k} ${n}`).join(", ")}`] : [])];
      const unsure = (S.tokens||[]).filter(t => t[5] === "확인 필요").map(t => `${S.sentences[t[0]-1].slice(t[1], t[2])} (${ref(c, t[0])})`);
      if(unsure.length) extra.push(`${P2("Usage not decided by the tool (needs checking)","쓰임을 정하지 못한 동사(확인 필요)")}: ${unsure.join(", ")}`);
      if(extra.length) UL(extra);
    }
  });
  // ③ 원고 전문(문장 번호): 탐지되지 않은 표현도 여기서 찾아볼 수 있다
  H("h2", P2("3. Full manuscript (numbered sentences)", "3. 원고 전문(문장 번호)"));
  Pp(P2("Every sentence is numbered, so that expressions not in the detection list can also be checked.","탐지 목록에 없는 표현도 찾아볼 수 있도록 모든 문장에 번호를 붙였습니다."));
  secs.forEach(c => { const S = r.sections[c]; H("h3", `${P(SECNAME[c])} (${S.words.toLocaleString()} ${P2("words","단어")}, ${S.sentences.length} ${P2("sentences","문장")})`);
    S.sentences.forEach((s, i) => D.push({t:"sent", id:sid(c, i+1), x:s, spans:[]})); });
  if(o.short) return D;
  // ④ 전체 탐지 목록과 KWIC: 탐지한 항목을 하나도 빼지 않는다
  H("h2", P2("4. Complete detection list with KWIC", "4. 전체 탐지 목록과 KWIC"));
  UL([P2("Every item the tool detected is listed: every verb with its usage, every hedge and booster, every reporting verb for previous studies, and the verbs left out of reporting verbs because they introduce your own study.","도구가 탐지한 항목을 모두 싣습니다: 동사 낱말 전부와 그 쓰임, 완화·강조 표현 전부, 선행연구 보고동사 전부, 자기 연구를 소개해 보고동사에서 뺀 동사."),
      P2(`Left and right context show up to ${CTX} characters. If that is not enough, read the whole sentence under the same number in “3. Full manuscript”.`, `앞뒤 문맥은 ${CTX}자까지만 보입니다. 부족하면 ‘3. 원고 전문’에서 같은 번호의 문장 전체를 확인하세요.`),
      P2("Verb entries show the word as written, with its base form in brackets when different.","동사는 원고에 쓴 꼴을 보이고, 기본형이 다르면 괄호에 적었습니다."),
      P2("Hedges and boosters are counted only in the Introduction, Results and Discussion, and Conclusions.","완화·강조 표현은 서론·결과논의·결론에서만 셉니다.")]);
  secs.forEach(c => { const S = r.sections[c], {rows, K} = detections(c, S);
    H("h3", `${P(SECNAME[c])} — ${rows.length} ${P2("items","건")}`);
    Pp(`${P2("Verbs","동사")} ${K.verb}${K.prep?` (${P2("of which preposition-like","그중 전치사처럼")} ${K.prep})`:""} · ${P2("hedges","완화 표현")} ${HEDGE_IN.includes(c)?K.hedge:P2("not counted","세지 않음")} · ${P2("boosters","강조 표현")} ${HEDGE_IN.includes(c)?K.booster:P2("not counted","세지 않음")} · ${P2("reporting verbs","보고동사")} ${K.prior} · ${P2("left out (own study)","뺌(자기 연구)")} ${K.self}`);
    if(rows.length) TB([P2("Sentence","문장 번호"), P2("Detected expression","탐지 표현"), P2("Classification","분류"), P2("Left context","앞 문맥"), P2("Right context","뒤 문맥")],
      rows.map(x => { const [Lc, Rc] = kwic(S.sentences[x.n-1], x.a, x.b); return [ref(c, x.n), x.w, x.cls, Lc, Rc]; }));
    else Pp(P2("none","없음")); });
  // ⑤ 기준 자료: 네 저널 공통 동사
  H("h2", P2("5. Reference data: verbs frequently found in all four journals", "5. 기준 자료: 네 저널에서 공통으로 자주 확인된 동사"));
  if(CV){
    Pp(P2(T.cv_rule[0], T.cv_rule[1])); Pp(P2(T.cv_note1[0], T.cv_note1[1])); Pp(P2(T.cv_note2[0], T.cv_note2[1]));
    TB([P2("Section","절"), P2("Verbs meeting the condition","조건을 충족한 동사")], SECS.map(([c]) => [P(SECNAME[c]), (CV.sections[c]||[]).map(v=>v.verb).join(", ") || P2("none","없음")]));
    Pp(P2(T.cv_frac[0], T.cv_frac[1]));
    const J = [["ACS_CM","CM"],["ACS_IC","IC"],["ACS_JOC","JOC"],["ACS_JPC_C","JPC C"]];
    TB([P2("Section","절"), P2("Verb","동사"), ...J.map(j=>j[1])], SECS.flatMap(([c]) => (CV.sections[c]||[]).map(v => [P(SECNAME[c]), v.verb, ...J.map(([k]) => `${v.journals[k].papers}/${v.journals[k].n}`)])));
  }
  // ⑥ 출처와 인용
  H("h2", P2("6. Sources and citation", "6. 출처와 인용"));
  UL([`${P2("How to cite this tool","이 도구 인용")}: ${P2("Manuscript Diagnosis (논문 글쓰기 진단)","논문 글쓰기 진단(Manuscript Diagnosis)")}, ${r.version.baseline}; ${r.version.counting}; ${r.version.reporting || ""}; ${r.version.usage_classes || r.version.usage_rules}. ${P2("Accessed","이용일")} ${stamp.slice(0,10)}.`,
      `${P2("Counting rules","세는 규칙")}: section-verb-hedge-baseline 0.4.9 (GitHub angela0420/gnu_10team_cho).`,
      `${P2("Comparison set","비교 집합")}: ${P([r.baseline_info.en, r.baseline_info.ko])}, ${r.baseline_info.papers} ${P2("papers (ACS, 2020–2021)","편(ACS, 2020–2021)")}. ${P2("Sections are introduction, methods, results and discussion (results and discussion counted together), and conclusions; quartiles use the inclusive method.","절은 서론, 실험·방법, 결과·논의(결과와 논의를 합쳐 셈), 결론이며 사분위수는 포함 방식입니다.")}`,
      P2("All comparison papers are open-access articles under CC BY 4.0. This document contains only figures derived from them, not their sentences.","비교 논문은 모두 CC BY 4.0 공개 논문입니다. 이 문서에는 논문 문장이 아니라 그로부터 센 수치만 들어 있습니다.")]);
  const pl = (B.paper_list || []);
  if(pl.length){ H("h3", P2("Comparison papers","비교 논문 목록")); D.push({t:"ol", items: pl.map(p => `${p.title || p.id}${p.year?` (${p.year})`:""}. https://doi.org/${p.doi}`)}); }
  return D;
}
function manuscriptInfo(){
  const v = id => (document.getElementById(id)?.value || "").trim(), out = [];
  const j = v("mi-journal"), s = v("mi-stage"), q = v("mi-question");
  if(j) out.push(`${ui("journal")}: ${j}`);
  if(s){ const st = UI.stages.find(x=>x[0]===s); out.push(`${ui("stage")}: ${st?P([st[1],st[2]]):s}`); }
  if(q) out.push(`${ui("question")}: ${q}`);
  return out;
}

// ---- 출력: 마크다운 글자 / 인쇄용 HTML
function markText(x, spans, bold){
  let out = "", pos = 0;
  [...spans].sort((a,b)=>a.start-b.start).forEach(h => { if(h.start < pos) return; out += x.slice(pos, h.start) + bold(x.slice(h.start, h.end)); pos = h.end; });
  return out + x.slice(pos);
}
const cell = s => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
function toMd(D){
  return D.map(b => {
    if(b.t==="h1") return `# ${b.x}`; if(b.t==="h2") return `## ${b.x}`; if(b.t==="h3") return `### ${b.x}`;
    if(b.t==="p") return b.x; if(b.t==="pre") return b.x; if(b.t==="hr") return "---";
    if(b.t==="ul") return b.items.map(i => `- ${i}`).join("\n"); if(b.t==="ol") return b.items.map((i,k) => `${k+1}. ${i}`).join("\n");
    if(b.t==="table") return [`| ${b.head.map(cell).join(" | ")} |`, `| ${b.head.map(()=>"---").join(" | ")} |`, ...b.rows.map(r => `| ${r.map(cell).join(" | ")} |`)].join("\n");
    if(b.t==="sent") return `${b.id} ${markText(b.x, b.spans, w => `**${w}**`)}${b.labels?`\n  (${b.labels.join(" · ")})`:""}`;
    return "";
  }).join("\n\n") + "\n";
}
function toHtml(D){
  return D.map(b => {
    if(["h1","h2","h3"].includes(b.t)) return `<${b.t}>${esc(b.x)}</${b.t}>`;
    if(b.t==="p") return `<p>${esc(b.x)}</p>`; if(b.t==="pre") return `<div class="pv-ai">${esc(b.x).replace(/\n/g,"<br>")}</div>`; if(b.t==="hr") return "<hr>";
    if(b.t==="ul") return `<ul>${b.items.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>`; if(b.t==="ol") return `<ol>${b.items.map(i=>`<li>${esc(i)}</li>`).join("")}</ol>`;
    if(b.t==="table") return `<table><thead><tr>${b.head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    if(b.t==="sent"){ let h = "", pos = 0; [...b.spans].sort((a,c)=>a.start-c.start).forEach(s => { if(s.start<pos) return; h += esc(b.x.slice(pos,s.start)) + `<mark>${esc(b.x.slice(s.start,s.end))}</mark>`; pos = s.end; });
      return `<p class="pv-s"><b>${esc(b.id)}</b> ${h + esc(b.x.slice(pos))}${b.labels?`<br><span class="pv-l">${esc(b.labels.join(" · "))}</span>`:""}</p>`; }
    return "";
  }).join("\n");
}
const wordsOf = s => (s.match(/\S+/g) || []).length;
const secsChosen = () => { const v = document.getElementById("savesec")?.value || "ALL"; return v === "ALL" ? null : [v]; };

// ---- 복사(2초 동안 '복사했습니다')
async function copyText(txt, btn){
  let ok = false;
  try{ await navigator.clipboard.writeText(txt); ok = true; }catch(e){
    const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
    try{ ok = document.execCommand("copy"); }catch(_){} ta.remove(); }
  const old = btn.dataset.label || btn.textContent; btn.dataset.label = old;
  btn.textContent = ok ? ui("copied") : ui("fail"); setTimeout(() => { btn.textContent = btn.dataset.label; }, 2000);
}

// ---- PDF: 모든 내용을 펼친 인쇄용 화면을 만든 뒤 인쇄 창을 연다
function printPdf(){
  if(!LAST) return;
  const pv = document.getElementById("printview");
  pv.innerHTML = toHtml(buildDoc({mode:"pdf", short:false, secs:null}));
  document.body.classList.add("print-export");
  const done = () => { document.body.classList.remove("print-export"); pv.innerHTML = ""; window.removeEventListener("afterprint", done); };
  window.addEventListener("afterprint", done);
  setTimeout(() => window.print(), 50);
}

// ---- 화면: 저장 영역 그리기
function drawSave(){
  const box = document.getElementById("savebox"); if(!box) return;
  const L = LANG, guide = L==="en" ? GUIDE.en : L==="ko" ? GUIDE.ko : GUIDE.en.map((e,i)=>`${e}\n${GUIDE.ko[i]}`);
  const have = LAST ? SECS.filter(s => LAST.sections[s[0]]) : [];
  const cur = document.getElementById("savesec")?.value || "ALL", rl = document.getElementById("replylang")?.value || "ko";
  const pbtns = L==="both" ? `<button class="btn ghost" data-pcopy="ko">${esc(P(UI.pcopy_ko))}</button><button class="btn ghost" data-pcopy="en">${esc(UI.pcopy_en[0])}</button>`
    : `<button class="btn ghost" data-pcopy="${L}">${esc(ui("pcopy"))}</button>`;
  const ptext = L==="both" ? `${PROMPT.ko}\n\n────────\n\n${PROMPT.en}` : PROMPT[L];
  box.innerHTML = `<h2>${esc(ui("title"))}</h2>${guide.map(g => `<p class="note save-g">${esc(g).replace(/\n/g,"<br>")}</p>`).join("")}
    <div class="row save-row"><button class="btn" id="pdf2">${esc(ui("pdf"))}</button><span class="note">${esc(ui("pdfnote"))}</span></div>
    <p class="warn save-up">${esc(ui("upload"))}</p>
    <div class="row save-row">
      <label for="savesec"><b>${esc(ui("sec"))}</b></label><select id="savesec"><option value="ALL">${esc(ui("allsec"))}</option>${have.map(([c]) => `<option value="${c}">${esc(P(SECNAME[c]))}</option>`).join("")}</select>
      ${L==="both" ? `<label for="replylang"><b>${esc(ui("reply"))}</b></label><select id="replylang"><option value="ko">한국어</option><option value="en">English</option></select>` : ""}
    </div>
    <div class="row save-row"><button class="btn ghost" id="cpall">${esc(ui("all"))}</button><span class="note" id="cpall-n"></span>
      <button class="btn ghost" id="cpshort">${esc(ui("short"))}</button><span class="note" id="cpshort-n"></span></div>
    <details class="save-p"><summary>${esc(ui("pview"))}</summary><pre id="prompttext">${esc(ptext)}</pre></details>
    <div class="row save-row">${pbtns}</div>`;
  const ss = document.getElementById("savesec"); if([...ss.options].some(o=>o.value===cur)) ss.value = cur;
  const rs = document.getElementById("replylang"); if(rs) rs.value = rl;
  counts();
  ss.onchange = counts; if(rs) rs.onchange = counts;
  document.getElementById("pdf2").onclick = printPdf;
  document.getElementById("cpall").onclick = e => copyText(toMd(buildDoc({mode:"text", short:false, secs:secsChosen()})), e.currentTarget);
  document.getElementById("cpshort").onclick = e => copyText(toMd(buildDoc({mode:"text", short:true, secs:secsChosen()})), e.currentTarget);
  box.querySelectorAll("[data-pcopy]").forEach(b => b.onclick = () => copyText(PROMPT[b.dataset.pcopy], b));
}
function counts(){
  if(!LAST) return;
  const n = (short) => wordsOf(toMd(buildDoc({mode:"text", short, secs:secsChosen()})));
  const f = k => ui("words").replace("{n}", k.toLocaleString());
  document.getElementById("cpall-n").textContent = f(n(false)); document.getElementById("cpshort-n").textContent = f(n(true));
}
function drawInfoFields(){
  const host = document.getElementById("mi-box"); if(!host) return;
  const keep = id => document.getElementById(id)?.value || "";
  const j = keep("mi-journal"), s = keep("mi-stage"), q = keep("mi-question");
  host.innerHTML = `<summary>${esc(ui("info_h"))}</summary><div class="mi-body"><p class="note">${esc(ui("info_note"))}</p>
    <label>${esc(ui("journal"))}<input id="mi-journal" type="text" autocomplete="off" maxlength="200"></label>
    <label>${esc(ui("stage"))}<select id="mi-stage">${UI.stages.map(([k,en,ko]) => `<option value="${k}">${esc(P([en,ko]))}</option>`).join("")}</select></label>
    <label class="wide">${esc(ui("question"))}<textarea id="mi-question" rows="2" maxlength="1000"></textarea></label></div>`;
  document.getElementById("mi-journal").value = j; document.getElementById("mi-stage").value = s; document.getElementById("mi-question").value = q;
  host.querySelectorAll("input,select,textarea").forEach(el => el.addEventListener("input", () => { if(LAST) counts(); }));
  const jl = document.getElementById("savejump"); if(jl) jl.textContent = ui("jump");
}
window.EXPORT = {drawSave, drawInfoFields, buildDoc, toMd, toHtml, PROMPT};
})();
