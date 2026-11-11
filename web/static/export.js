// 결과 내보내기(2026-11-10, 조은정 교수 지시): 이 도구는 원고를 생성형 AI에 보내지 않는다. 대신 학생이 결과를 PDF나 글자로
// 저장해 자기가 쓰는 AI에 직접 물을 수 있게 한다. PDF(인쇄용 화면), 전체·간단·절별 글자 복사, 프롬프트 복사가 모두
// 같은 내용 모델(buildDoc)에서 나온다. index.html의 전역(LAST, EX, CV, BL, LANG, SECS, LAYER, BAND, esc, fmt, exTitle)을 쓴다.
(function(){
const PROMPT = {
ko: `첨부한 PDF는 「논문 글쓰기 진단」 결과입니다. 원고 전문, 절별 분석 결과, 결과를 읽는 법, 비교 기준 자료와 출처가 들어 있습니다. 제목·키워드·목표 저널·원고 단계와 제가 고르거나 적은 ‘확인하고 싶은 점’을 함께 참고해 주세요. 목표 저널과 실제로 사용한 비교 자료는 다를 수 있으니 구분해 주세요.

다음 원칙에 따라 원고를 다시 읽고 판단하는 데 도움이 되는 피드백을 주세요.

1. 원고를 대신 고쳐 쓰지 마세요
원고를 재작성하거나 대체 문장을 제시하지 마세요. 수정 여부와 방법은 제가 직접 판단합니다.

2. 먼저 분석 기준과 한계를 확인하세요
PDF의 ‘이 결과를 읽는 법’과 분석 기준·알려진 한계를 먼저 읽고 따르세요. 300단어보다 짧은 절은 빈도나 참조 범위를 근거로 평가하지 마세요. 다만 문장의 의미와 근거 관계는 검토해도 됩니다.

3. 비교 수치를 글쓰기의 정답으로 삼지 마세요
참조 범위를 벗어났다는 이유만으로 표현을 늘리거나 줄이라고 권하지 마세요. 출판 논문의 빈도나 동사 선택에 맞추도록 권하지도 마세요. 범위 안에 있다는 이유만으로 적절하다고 판단하지 마세요. 분류 ④ ‘해당 용법 미확인’은 오류나 부적절한 표현을 뜻하지 않습니다.

4. 도구의 탐지·분류도 원문과 대조하세요
도구가 잘못 탐지하거나 분류한 것으로 의심되는 항목은 글쓰기 피드백과 구분해 알려 주세요. 해당 절·문장번호·표현과 의심 이유를 적고, 확실하지 않으면 ‘확인 필요’로 표시하세요. 도구의 분류를 그대로 정답으로 받아들이지 마세요.

5. 다시 읽어 볼 문장 3~5개를 골라 주세요
참조 범위 밖 항목에서만 고르지 말고, 원고의 내용과 앞뒤 문맥을 근거로 선택하세요. 제목·키워드가 제공되었다면 연구의 맥락을 이해하는 데 참고하되, 특정 단어의 등장 횟수만으로 판단하지 마세요.

각 문장에 대해 다음을 제시해 주세요.
  • 절과 문장번호, 확인할 원문
  • 다시 읽어 볼 가치가 있는 이유
  • 제가 스스로 답해 볼 질문 1~2개

질문은 다음에 초점을 맞춰 주세요.
  • 직접 관찰하거나 계산한 결과와 그에 대한 해석이 구분되는가?
  • 주장의 세기가 제시한 근거에 맞는가?
  • 선행연구의 주장과 제 연구 결과·해석이 구분되는가?

제가 고르거나 적은 ‘확인하고 싶은 점’을 우선 반영하세요. 필요한 경우에는 문장을 억지로 3~5개 채우지 말고, 선정할 수 있는 문장만 제시하세요.

6. 판단의 근거와 불확실성을 밝혀 주세요
PDF에 있는 정보만으로 판단하기 어려우면 추측으로 결론 내리지 말고, 무엇을 더 확인해야 하는지 알려 주세요. 원고에 제시되지 않은 실험 결과·연구 의도·참고문헌 내용을 만들어 넣지 마세요.

7. 한국어로, 이해하기 쉽게 설명해 주세요
먼저 핵심 피드백을 제시한 뒤, 제가 이해하기 쉽도록 그 이유를 풀어서 추가 설명해 주세요. 문법·통계 용어가 필요하면 뜻을 설명하고, 숫자는 실제 원고에서 무엇을 의미하는지 구체적으로 알려 주세요. 실제 발견 횟수와 1,000단어 기준으로 환산한 수치를 구분해 주세요.

설명을 위한 예시는 가능하지만, 제 원고를 고쳐 쓴 대체 문장은 제시하지 마세요.`,
en: `The attached PDF contains results from Manuscript Diagnosis: my full manuscript, section-by-section analysis, a guide to reading the results, and the comparison data with sources. Please take into account the title, keywords, target journal, manuscript stage and the ‘questions to check’ I chose or wrote. The target journal and the comparison data actually used may differ; keep them apart.

Please give feedback that helps me reread my manuscript and make my own judgements, following these principles.

1. Do not rewrite my manuscript for me
Do not rewrite it or suggest replacement sentences. I will decide myself whether and how to revise.

2. First check the analysis criteria and limits
First read “How to read these results”, the analysis criteria and the known limits in the PDF, and follow them. Do not evaluate sections shorter than 300 words on the basis of frequencies or reference ranges. You may still review the meaning of the sentences and how they relate to the evidence.

3. Do not treat the comparison figures as the right answer for writing
Do not recommend using an expression more or less only because a figure is outside the reference range. Do not recommend matching the frequencies or verb choices of published papers either. Do not judge something appropriate only because it is within the range. Group 4 (usage not found) does not mean an error or an inappropriate expression.

4. Check the tool’s detection and classification against the text too
Report items the tool seems to have detected or classified wrongly separately from writing feedback. Give the section, sentence number, expression and the reason for your doubt, and mark it “needs checking” if you are not sure. Do not take the tool’s classification as the right answer.

5. Choose 3–5 sentences for me to reread
Do not choose only from items outside the reference range; base your choice on the content of the manuscript and the surrounding context. If a title and keywords are given, use them to understand the research context, but do not judge by how often a particular word appears.

For each sentence, give:
  • the section, sentence number and the original text to check
  • why it is worth rereading
  • one or two questions for me to answer for myself

Focus the questions on:
  • Are the results I observed or calculated kept apart from my interpretation of them?
  • Does the strength of the claim match the evidence given?
  • Are earlier studies’ claims kept apart from my own results and interpretation?

Address the ‘questions to check’ I chose or wrote first. Do not force the number up to 3–5; give only the sentences you can justify.

6. State the grounds and the uncertainty of your judgements
If the information in the PDF is not enough to judge, do not draw conclusions by guessing; tell me what else needs to be checked. Do not invent experimental results, research intentions or reference contents that are not in the manuscript.

7. Explain in English, in a way that is easy to understand
Give the main feedback first, then explain the reasons so that I can follow them. If you need grammatical or statistical terms, explain what they mean, and say concretely what each number means in my manuscript. Keep the actual number of occurrences apart from the rate per 1,000 words.

You may give examples for explanation, but do not give replacement sentences that rewrite my manuscript.`};
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
  ["Marginal prepositions that have lost their verb meaning (including, following, regarding) are left out of the verb comparison tables for individual verbs. To keep the same counting basis as the comparison data, they are still included in the verb totals, and they are marked separately (“preposition-like”) in the complete detection list.","동사 뜻을 잃은 준전치사(including, following, regarding)는 개별 동사 비교표에서는 제외합니다. 다만 비교 자료와의 집계 기준을 유지하기 위해 동사 총계에는 포함하고, 전체 탐지 목록에는 ‘전치사처럼’으로 따로 표시합니다."],
  ["Items counted as reporting verbs are not counted again as hedges or boosters.","보고동사로 센 낱말은 완화·강조 표현에 다시 세지 않습니다."],
  ["Sections under 300 words are not judged as higher or lower (rates for reference only).","300단어 미만 절은 높고 낮음을 판정하지 않습니다(환산 수치는 참고용)."]];
const LIMITS = [
  ["When the parser assigns the wrong part of speech, a verb can be missed or classified differently. Known cases: “changes” read as a plural noun (…titanium changes the phase behaviour), “were mixed, pressed … and heated” read as an adjective and an adverbial clause, “titanium delays the phase transition” read as a noun phrase.","분석기가 품사를 잘못 붙이면 동사가 빠지거나 다르게 분류됩니다. 확인된 예: “changes”를 복수 명사로(…titanium changes the phase behaviour), “were mixed, pressed … and heated”를 형용사·부사절로, “titanium delays the phase transition”을 명사구로 읽음."],
  ["The same word can be judged differently depending on sentence structure (e.g. “delays” was a verb in one sentence and a noun in another).","같은 낱말도 문장 구조에 따라 다르게 판정될 수 있습니다(예: delays가 한 문장에서는 동사, 다른 문장에서는 명사)."],
  ["The manuscript and the comparison papers are processed by the same procedure, but it has not been shown that errors are equally frequent in both or cancel out.","원고와 비교 논문은 같은 절차로 처리했지만, 오류의 빈도와 영향이 같거나 서로 상쇄된다는 것은 확인되지 않았습니다."],
  ["Verbs carrying noun-like dependents are still counted but marked “may be a noun”; check them in context.","명사처럼 수식어를 거느린 '동사'는 그대로 세되 '명사일 수 있음'으로 표시합니다. 문맥에서 확인하세요."],
  ["The usage rules (verb_usage_rules v0.4) were adjusted using 60 researcher-judged examples (with reference to an AI’s interpretation); this is not independent validation data. The results are in the table “Comparison with the 60 researcher-judged examples” above. Further validation will use a new sample not used for adjusting the rules.",
   "동사 쓰임 분류 규칙(verb_usage_rules v0.4)은 AI의 해석을 참고한 연구자 판정 60개를 사용해 조정했으며, 이 표본은 독립 검증 자료가 아닙니다. 비교 결과는 위 ‘60개 용례 비교’ 표에 있습니다. 후속 검증은 규칙 조정에 사용하지 않은 새 표본으로 수행합니다."],

  ["Comparison sets contain 10–19 papers per journal, so ranges are wide.","비교 집합은 저널마다 10–19편이라 범위가 넓습니다."],
  ["Reporting verbs: a verb whose phrase contains a citation number, or whose subject is a word such as ‘researchers’, is attributed to earlier studies even when the sentence describes the writer’s own material or a future possibility (e.g. ‘the oxides can be prepared from … precursors.[1,2]’, ‘would help researchers select …’). The same rules were applied to the comparison data; whether and how often such cases occur there has not been checked.",
   "선행연구 보고동사: 동사구 안에 인용 번호가 있거나 주어가 ‘researchers’ 같은 낱말이면, 문장이 필자의 자료나 앞으로의 가능성을 말할 때도 선행연구로 귀속될 수 있습니다(예: ‘the oxides can be prepared from … precursors.[1,2]’, ‘would help researchers select …’). 비교 자료에도 같은 규칙을 적용했지만, 비교 자료 안의 같은 유형 오탐의 존재·빈도는 확인하지 않았습니다."],
  ["Hedges and boosters are counted from lists and do not separate uncertainty about the present results from future possibility or recommendation (would, should, …); they also do not separate the writer’s own claims from claims of earlier studies being reported (the ‘may’ in ‘Kim et al. suggested that … may …’ is counted for the section). Do not read these counts alone as showing that the writer’s claims are weak.",
   "완화·강조 표현은 목록에 따라 세므로, 현재 결과에 대한 불확실성과 미래 가능성·권고(would, should 등)를 구분하지 않고, 원고 저자의 주장과 인용·보고된 선행연구의 주장도 구분하지 않습니다(‘Kim et al. suggested that … may …’의 may도 그 절의 완화 표현으로 셉니다). 이 수치만으로 저자의 주장이 소극적이라고 해석하지 마세요."],
  ["Some words are tagged as verbs inside noun phrases or technique names, or the same -ing form is classified differently in similar contexts (e.g. ‘to room temperature’, ‘charge and discharge curves’, ‘scanning electron microscopy’, ‘during charging’ classified once as non-finite and once as nominal). Check such items in context.",
   "명사구나 기법 이름 안의 낱말이 동사로 잡히거나, 비슷한 문맥의 같은 -ing가 다르게 분류되는 경우가 있습니다(예: ‘to room temperature’, ‘charge and discharge curves’, ‘scanning electron microscopy’, ‘during charging’이 한 번은 비정형, 한 번은 명사처럼). 문맥에서 확인하세요."]];
// 글자로 붙여 넣을 때는 'PDF' 대신 '아래 글'로 읽히게 한다
const promptFor = (lang, asText) => asText ? PROMPT[lang].replace("첨부한 PDF는", "아래 글은").replaceAll("PDF의 ‘이 결과를 읽는 법’", "아래 ‘이 결과를 읽는 법’").replaceAll("PDF에 있는 정보", "아래 글에 있는 정보").replace("PDF의 ‘이 결과를 읽는 법’과", "아래 ‘이 결과를 읽는 법’과")
  .replace("The attached PDF contains", "The text below contains").replaceAll("in the PDF", "below") : PROMPT[lang];
const GUIDE = [   // [종류, en, ko] 2026-11-12 교수님 문구
  ["p","This tool does not send your manuscript to any generative AI. If you would like AI feedback, save your results as a PDF and upload it yourself to the AI you usually use.","이 도구는 원고를 생성형 AI에 보내지 않습니다. AI 피드백을 받고 싶다면 결과를 PDF로 저장해, 평소 사용하는 AI에 직접 올려 보세요."],
  ["p","The PDF includes your full manuscript. If you upload it to an external AI, your manuscript is sent to that service, so before uploading, check the service’s data-handling policy and whether your manuscript may be shared.","PDF에는 원고 전문이 포함됩니다. 외부 AI에 올리면 원고가 해당 서비스로 전달되므로, 업로드 전에 그 서비스의 데이터 처리 정책과 원고의 공유 가능 여부를 확인하세요."],
  ["p","The PDF contains:","PDF에는 다음 내용이 담깁니다."],
  ["ul",["Analysis criteria and known limits","분석 기준과 알려진 한계"],["A summary of the results","결과 요약"],["Your full manuscript with sentence numbers","문장번호가 붙은 원고 전문"],["The complete detection list with the surrounding context","전체 탐지 목록과 앞뒤 문맥"],["The comparison data and sources","비교 기준 자료와 출처"],["A request telling the AI how to give feedback (the same prompt as below)","AI에게 피드백 원칙을 알려 주는 요청문(아래 프롬프트와 같은 글)"]],
  ["p","If you paste the prompt below along with it, you can ask the AI to give you questions for checking your own writing instead of rewriting your manuscript. Check the AI’s answers against the original text too, and decide yourself whether to revise.","아래 프롬프트를 함께 붙여 넣으면, 원고를 대신 고쳐 쓰기보다 스스로 점검할 질문을 제시하도록 요청할 수 있습니다. AI의 답도 원문과 대조해 확인하고, 수정 여부는 직접 판단하세요."],
  ["h","If you cannot upload a PDF","PDF를 올리기 어렵다면"],
  ["p","Copy the results as text and paste them into the AI chat. If input length or usage is limited, use “Short copy” or copy one section at a time. If the copied text includes your manuscript, it is also sent to that AI service when you paste it.","결과를 텍스트로 복사해 AI 대화창에 붙여 넣으세요. 입력 길이나 사용량에 제한이 있다면 ‘간단 복사’나 절별 복사를 이용하세요. 복사한 내용에 원고가 포함되어 있다면, 붙여 넣을 때도 해당 AI 서비스로 전달됩니다."],
  ["p","You do not have to use AI. You can save the results and review them later, or read your sentences yourself in “Read your own text” and decide whether to revise.","AI를 사용하지 않아도 괜찮습니다. 결과를 저장해 두고 나중에 검토하거나, ‘내 글 살펴보기’에서 문장을 직접 읽으며 수정할지 판단할 수 있습니다."]];
function guideHtml(){
  const L = LANG, one = (en, ko) => L==="en" ? esc(en) : L==="ko" ? esc(ko) : `${esc(en)}<br>${esc(ko)}`;
  return GUIDE.map(g => g[0]==="ul" ? `<ul class="note save-g">${g.slice(1).map(([en,ko]) => `<li>${one(en,ko)}</li>`).join("")}</ul>`
    : g[0]==="h" ? `<h3 class="save-h">${one(g[1],g[2])}</h3>` : `<p class="note save-g">${one(g[1],g[2])}</p>`).join("");
}
const UI = {
  title:["Save your results and ask the AI you use","결과를 저장해, 내가 쓰는 AI에 물어보세요"], jump:["Save results ↓","결과 저장하기 ↓"],
  pdf:["Save as PDF","PDF로 저장하기"], all:["Copy all","전체 복사"], short:["Copy short version","간단 복사"], sec:["Sections","절"], allsec:["All sections","모든 절"],
  words:["about {n} words","약 {n}단어"], copied:["Copied","복사했습니다"], fail:["Could not copy. Select the text in the prompt box and copy it.","복사하지 못했습니다. 프롬프트 상자의 글을 직접 골라 복사하세요."],
  pcopy:["Copy prompt","프롬프트 복사"], pcopy_ko:["Copy Korean prompt","한국어 프롬프트 복사"], pcopy_en:["Copy English prompt","Copy English prompt"],
  pview:["See the prompt","프롬프트 펼쳐 보기"], reply:["AI reply language for copies and PDF","복사·PDF에 넣을 AI 답변 언어"],
  pdfnote:["A print view with everything expanded opens. In the print window, set the destination to “Save as PDF”. If you save through a printer such as Hancom PDF, the letters become pictures and an AI cannot read them.",
           "모든 내용을 펼친 인쇄용 화면이 열립니다. 인쇄 창의 대상에서 ‘PDF로 저장’을 고르세요. 한컴 PDF 같은 프린터로 저장하면 글자가 그림이 되어 AI가 읽지 못합니다."],
  upload:["This file contains your full manuscript. If you upload it to an external AI, it is sent to that service.","원고 전문이 포함되어 있으며, 외부 AI에 업로드하면 해당 서비스로 전달됩니다."],
  info_h:["About your manuscript (required)","원고 정보(필수)"], info_note:["Please prepare the title, keywords, target journal, manuscript stage and what you want to check. This tool does not write your manuscript for you. It analyses the expressions in the manuscript you have prepared and gives you material for rereading it in its research context and in the light of your questions. These fields are not sent to the server (only the manuscript text is sent for analysis); they go into the results screen, the saved PDF and the text copies.","제목, 키워드, 목표 저널, 원고 단계와 확인하고 싶은 점을 준비해 주세요. 이 도구는 원고를 대신 작성하지 않습니다. 준비한 원고의 표현을 분석하고, 연구 맥락과 질문에 따라 다시 읽을 자료를 제공합니다. 이 칸의 정보는 서버로 보내지 않으며(원고 본문만 분석을 위해 서버로 보냅니다), 결과 화면과 결과 PDF·텍스트 복사에 들어갑니다."],
  info_ex:["Example →","예시 →"],
  info_ex_t:["Titanium doping delays the phase transition in a layered sodium manganese oxide cathode","Titanium doping delays the phase transition in a layered sodium manganese oxide cathode"],
  info_ex_k:["sodium-ion battery, layered oxide, titanium doping, phase transition, X-ray diffraction","sodium-ion battery, layered oxide, titanium doping, phase transition, X-ray diffraction"],
  info_ex_j:["Inorganic Chemistry","Inorganic Chemistry"],
  info_ex_s:["Before submission","투고 전 원고"],
  info_ex_q:["In Results and Discussion, are my claims compared with earlier studies too strong for my data?","결과·논의에서 선행연구와 비교하는 문장의 주장이 내 자료에 비해 너무 세지 않은지 보고 싶습니다."],
  mtitle:["Manuscript title *","원고 제목 *"], mtitle_ph:["A working title is fine.","가제도 괜찮습니다."],
  mkeys:["Keywords *","키워드 *"], mkeys_ph:["Words for the topic and material of the study, separated by commas","연구 주제와 대상을 나타내는 키워드를 쉼표로 구분해 적어 주세요."],
  mjournal_ph:["The exact name of the journal you aim to submit to","투고를 목표로 하는 저널의 정확한 이름"], mquestion_ph:["Write your own question here if you like.","직접 질문을 적어도 됩니다."],
  jhint:["If you have not decided on a target journal yet, discuss candidate journals with an AI and then enter one. A journal you are still considering is fine.","목표 저널을 아직 정하지 못하셨다면, AI와 상의하여 후보 저널을 살펴본 뒤 하나를 정해 입력해 주세요. 현재 검토 중인 저널도 괜찮습니다."],
  jprompt_h:["Prompt for discussing candidate journals with your AI","저널 후보를 AI와 상의할 때 쓸 프롬프트"],
  qhint:["Choose what you want to check in your manuscript while reading the results. You may also write your own question. This tool does not write or revise your manuscript.","분석 결과를 보며 내 원고의 무엇을 확인하고 싶은지 골라 주세요. 직접 질문을 적어도 됩니다. 이 도구는 원고를 대신 쓰거나 수정하지 않습니다."],
  qown:["Your own question","직접 질문하기"],
  miss:["Please fill this in.","입력해 주세요."], miss_q:["Choose at least one, or write your own question.","하나 이상 고르거나 직접 질문을 적어 주세요."],
  miss_all:["Please fill in all the manuscript information (the missing fields are marked).","원고 정보를 모두 입력해 주세요(빠진 칸에 표시했습니다)."],
  mtitle_s:["Manuscript title","원고 제목"], mkeys_s:["Keywords","키워드"], journal_s:["Target journal","목표 저널"], stage_s:["Manuscript stage","원고 단계"],
  qs_s:["Questions to check this time","이번에 확인할 질문"], set_s:["Comparison data actually used","실제로 사용한 비교 자료"],
  ctx_h:["This manuscript and the questions to check","이번 원고와 확인할 질문"],
  ctx_role:["The rule-based analysis finds and shows expressions and their sentences. It does not decide the answers to these questions. Read the original text and the results together and judge for yourself.","규칙 분석은 표현과 용례를 찾아 보여 줍니다. 이 질문에 대한 답을 자동으로 판정하지는 않습니다. 원문과 분석 결과를 함께 읽고 판단해 주세요."],
  journal:["Target journal *","목표 저널 *"], stage:["Manuscript stage *","원고 단계 *"], question:["What I want to check in my manuscript *","내 원고에서 확인하고 싶은 점 *"],
  stages:[["","(choose)","(고르기)"],["draft","First draft","초고"],["revising","Being revised","수정 중"],["pre","Before submission","투고 전 원고"],["rev","Revision after review","심사 후 수정본"],["class","Course assignment draft","수업 과제 초안"],["thesis","Thesis chapter draft","학위논문 장 초안"],["other","Other","기타"]]};
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
  [/분류 기준은 표 위 ‘네 저널에서 공통으로 자주 확인된 동사’와 각 분류의 ‘설명’에 있습니다\./, "분류 기준은 ‘{crit_ko}’에, 네 저널 공통 동사 목록은 ‘{ref_ko}’에 있습니다."],
  [/The criteria are given in the table “Verbs frequently found in all four journals” above the results and under each category’s “Explain” button\./, "The criteria are in “{crit_en}” and the common-verb lists in “{ref_en}”."],
  [/동사 이름을 누르면 그 동사가 쓰인 문장이 보입니다\./, "해당 문장 번호를 따라 ‘{manu_ko}’ 또는 ‘{det_ko}’에서 용례를 확인해 보세요."],
  [/Click a verb to see its sentences, and read/, "Follow the sentence numbers to “{manu_en}” or “{det_en}”, and read"],
  [/표의 개수를 눌러 탐지된 문장을 확인해 보세요\./, "‘{det_ko}’과 ‘{manu_ko}’에서 문장번호로 찾아보세요."],
  [/Click the count in the table to see the sentences\./, "Find the sentences by number in “{det_en}” and “{manu_en}”."],
  [/Click the count to see the sentences, and check/, "Find the sentences by number in “{det_en}” and “{manu_en}”, and check"],
  [/아래 ‘내 글 살펴보기’의 용례에서 문장을 확인해 보세요\./, "‘{det_ko}’과 ‘{manu_ko}’에서 문장번호로 찾아보세요."],
  [/Check the sentences in the concordance under ‘Explore your text’\./, "Find the sentences by number in “{det_en}” and “{manu_en}”."],
  [/구분 기준과 예는 동사 목록 아래 ‘동사의 쓰임은 어떻게 구분하나요\?’에 있습니다\./, "구분 기준과 예는 아래 ‘1. 동사의 쓰임’ 표에 있습니다."],
  [/The criteria and examples are under “How are verb uses classified\?” below the verb list\./, "The criteria and examples are in the table “1. Verb uses” below."]];
let DOC_FULL = false;   // buildDoc이 PDF·전체 복사를 만들 때 true(부록 체계), 간단 복사는 false(예전 번호)
const DLAB = {crit:[["1. Analysis criteria","1. 분석 기준"],["Appendix D. Analysis criteria","부록 D. 분석 기준"]],
  ref:[["5. Reference data","5. 기준 자료"],["Appendix E. Reference data","부록 E. 기준 자료"]],
  manu:[["3. Full manuscript","3. 원고 전문"],["Appendix C. Full manuscript","부록 C. 원고 전문"]],
  det:[["4. Complete detection list","4. 전체 탐지 목록"],["Appendix B. Complete detection list","부록 B. 전체 탐지 목록"]]};
const dlab = (k, lang) => DLAB[k][DOC_FULL ? 1 : 0][lang === "en" ? 0 : 1];
const docFix = s => DOC_FIX.reduce((a, [re, to]) => a.replace(re, to), String(s)).replace(/\{(crit|ref|manu|det)_(en|ko)\}/g, (_, k, l) => dlab(k, l));
const exText = k => { const e = EX[k]; if(!e) return ""; return docFix(docLang()==="en"?e.en:docLang()==="ko"?e.ko:`${e.en} ${e.ko}`); };
const exName = k => { const e = EX[k]; if(!e) return k; return P([e.title.en, e.title.ko]); };
const usageName = k => exName("usage_"+k);

// 위치(눈금 그림 대신 문장)
function posText(band, short){
  if(short) return P2("Not judged (section under 300 words; rate for reference only)", "판정 보류(300단어 미만 절, 환산 수치는 참고용)");
  return ({typical:P2("Inside the reference range (Q1–Q3)","참조 범위(Q1–Q3) 안"),
    higher:P2("Above the reference range, inside the full range","참조 범위보다 높음, 전체 범위 안"),
    lower:P2("Below the reference range, inside the full range","참조 범위보다 낮음, 전체 범위 안"),
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
const USAGE_ORDER = ["술어","명사 앞 수식","명사 뒤 수식","비정형","명사처럼","전치사처럼","분사형 형용사","확인 필요"];
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
// PDF·전체 복사의 앞부분(2026-11-12): 원고 맥락과 확인할 질문 → 짧은 안내 → 절별로 다시 읽어 볼 문장 → 동사 실제 횟수.
// 이미 있는 원문·탐지 표현을 가까이 놓을 뿐, 문장의 적절성을 새로 판단하지 않는다. '확인할 점'은 표현 종류마다 같은 질문이다
const CHECKQ = {hedge:["Read the observation and the interpretation drawn from it separately, and check whether the claim needs to be stated cautiously here.","앞에서 제시한 관찰과 그 관찰에서 도출한 해석을 구분해 읽고, 이곳에서 주장을 신중하게 표현할 필요가 있는지 확인해 보세요."],
  booster:["Check whether the degree of emphasis matches the evidence given.","강조의 정도가 제시한 근거에 맞는지 확인해 보세요."],
  prior:["Check whether the claims of the earlier study are kept apart from your own interpretation.","선행연구의 주장과 내 해석이 구분되는지 확인해 보세요."]};
const KQ = {hedge:[["Hedge","완화 표현"],["What possibility or interpretation does it present, and how is it connected to the evidence?","어떤 가능성이나 해석을 제시하며, 근거와 어떻게 연결되는가?"]],
  booster:[["Booster","강조 표현"],["Does the degree of certainty match the evidence given?","확신의 정도가 제시한 근거에 맞는가?"]],
  prior:[["Reporting expression (earlier study)","선행연구 보고 표현"],["Is it clear whose result or claim it is?","누구의 결과·주장인지 분명한가?"]]};   // 축약안(제안 C-10) 문구
function frontPart(r, secs, stamp){
  const F = [], H = (t, x) => F.push({t, x}), Pp = x => F.push({t:"p", x}), UL = items => F.push({t:"ul", items}), TB = (head, rows) => F.push({t:"table", head, rows});
  const iv = infoValues();
  H("h2", ui("ctx_h"));
  UL(ctxItems(r).map(([k, v]) => `${k}: ${Array.isArray(v) ? (v.length ? v.join(" / ") : "–") : (v || "–")}`).concat([`${P2("Generated","만든 때")}: ${stamp}`]));
  const jr = journalRelation(iv, r); if(jr) Pp(jr);
  Pp(ui("ctx_role"));
  Pp(P2("This document is for rereading the sentences in which expressions were used. The comparison figures are not scores, and automatic detection can be wrong. Look at the expressions and sentences in the sections you are interested in, and use the appendices when you need the details.",
        "이 자료는 표현이 쓰인 문장을 다시 읽기 위한 자료입니다. 비교 수치는 평가 점수가 아니며, 자동 탐지는 틀릴 수 있습니다. 관심 있는 절의 표현과 문장을 확인하고, 필요한 경우 뒤의 상세 자료를 참고하세요."));
  F.push({t:"links", items:[["A", P2("Appendix A: detailed figures by section and reference ranges (including how to read the results)","부록 A: 절별 상세 수치와 참조 범위(이 결과를 읽는 법 포함)")], ["B", P2("Appendix B: complete detection list with KWIC","부록 B: 전체 탐지 목록과 KWIC")],
      ["C", P2("Appendix C: full manuscript with sentence numbers","부록 C: 문장번호가 붙은 원고 전문")], ["D", P2("Appendix D: analysis criteria, exclusions and known limits","부록 D: 분석 기준·제외 기준·알려진 한계")],
      ["E", P2("Appendix E: reference data (verbs common to four journals)","부록 E: 기준 자료(네 저널 공통 동사)")], ["F", P2("Appendix F: versions, sources and comparison papers","부록 F: 버전과 비교 논문 출처")], ["G", P2("Appendix G: request to the AI","부록 G: AI 요청문")]]});
  H("h2", P2("1. Sentences with detected stance expressions and reporting expressions", "1. 탐지된 주장 표현과 선행연구 보고 표현이 있는 문장"));
  Pp(P2("These sentences were gathered on the basis of automatically detected expressions. Sentences not in this list also need reviewing, and the sentences listed are not necessarily ones to revise. The tool has not judged whether a sentence is appropriate or whether its evidence is sufficient. The questions to check are given once per kind of expression in a table at the start of each section.",
        "자동 탐지된 표현을 기준으로 모은 문장입니다. 목록에 없는 문장도 검토할 필요가 있으며, 수록된 문장이 반드시 수정 대상인 것은 아닙니다. 도구가 문장의 적절성이나 근거의 충분함을 판단한 결과는 아닙니다. 확인할 질문은 절마다 첫머리 표에 표현 종류별로 한 번씩 적었습니다."));
  const KIND = {hedge_per1000:["hedge", P2("hedge","완화 표현")], booster_per1000:["booster", P2("booster","강조 표현")], reporting_per1000:["prior", P2("reporting verb (earlier study)","선행연구 보고동사")]};
  secs.forEach(c => {
    const S = r.sections[c], by = {};
    S.metrics.forEach(m => { const K = KIND[m.key]; if(!K) return; (m.evidence || []).forEach(h => { (by[h.sent] = by[h.sent] || []).push({...h, kind:K[0], kname:K[1]}); }); });
    H("h3", `${P(SECNAME[c])} — ${P2("sentences with detected stance and reporting expressions","탐지된 주장 표현과 선행연구 보고 표현이 있는 문장")}`);
    if(S.short) Pp(P2("This section is under 300 words, so frequencies are not judged; the sentences can still be reread.","이 절은 300단어보다 짧아 빈도는 판정하지 않지만, 문장은 다시 읽어 볼 수 있습니다."));

    const ns = Object.keys(by).map(Number).sort((a, b) => a - b);
    const noH = !HEDGE_IN.includes(c);
    if(noH) Pp(P2(`Hedges and boosters are not counted in ${P(SECNAME[c])}.${ns.length ? "" : " No reporting verbs for earlier studies were detected by the current rules."}`, `${P(SECNAME[c])}에서는 완화·강조 표현을 집계하지 않습니다.${ns.length ? "" : " 선행연구 보고동사는 현재 규칙으로 탐지되지 않았습니다."}`));
    else if(!ns.length) Pp(P2("No hedges, boosters or reporting verbs for earlier studies were detected in this section by the current rules.", "이 절에서는 현재 규칙으로 완화·강조 표현과 선행연구 보고동사가 탐지되지 않았습니다."));
    if(!ns.length) Pp(P2(`Expressions that were not detected can be read directly in “${dlab("manu","en")}”.`, `탐지되지 않은 표현도 ‘${dlab("manu","ko")}’에서 직접 읽어 볼 수 있습니다.`));
    const COMPACT = window.__COMPACT_Q !== false;   // 2026-11-12 교수님 채택: 종류별 질문은 절 첫머리에 한 번(예전 방식은 __COMPACT_Q=false로만 볼 수 있음)
    if(COMPACT && ns.length){ const present = [...new Set(ns.flatMap(n => by[n].map(h => h.kind)))];
      TB([P2("Kind of expression","표현 종류"), P2("Question to check","확인할 질문")], present.map(k => [P(KQ[k][0]), P(KQ[k][1])])); }
    ns.forEach(n => { const hs = by[n], kinds = [...new Set(hs.map(h => h.kind))];
      F.push({t:"sent", id:sid(c, n), x:S.sentences[n-1], spans:hs.map(h => ({start:h.start, end:h.end})),
        labels: COMPACT ? [`${P2("Detected","탐지 표현")}: ${hs.map(h => `${h.word} (${h.kname})`).join(", ")}`]
          : [`${P2("Detected","탐지 표현")}: ${hs.map(h => `${h.word} (${h.kname})`).join(", ")}`, `${P2("Check","확인할 점")}: ${kinds.map(k => P(CHECKQ[k])).join(" ")}`]}); });
    const vs = [...(S.top_verbs || []), ...(S.other_verbs || [])];
    // 2026-11-12: 이 절에서 동사로 센 낱말(기본형) 전부를 실제 횟수로 센 뒤, 많이 나온 순(같으면 먼저 나온 순) 10개만 표로 보인다
    const vc = {}; (S.tokens || []).forEach(t => { if(!t[5]) return; const e = vc[t[3]] = vc[t[3]] || {n:0, first:t[0]*1e5 + t[1], sents:new Set()}; e.n++; e.sents.add(t[0]); });
    const vlist = Object.entries(vc).sort((a, b) => b[1].n - a[1].n || a[1].first - b[1].first), VMAX = 10;
    if(vlist.length){
      Pp(P2(`Verbs in this section: ${(S.tokens||[]).filter(t=>t[5]).length} occurrences of ${vlist.length} verbs (base forms). The ${Math.min(VMAX, vlist.length)} most frequent are shown (ties in order of first appearance). All verbs are in “${dlab("det","en")}”; comparisons are in Appendix A.`,
               `이 절에서 동사로 센 것: ${vlist.length}개 동사(기본형), ${(S.tokens||[]).filter(t=>t[5]).length}회. 많이 나온 순으로 ${Math.min(VMAX, vlist.length)}개를 보입니다(같으면 먼저 나온 순). 모든 동사는 ‘${dlab("det","ko")}’에, 비교 수치는 부록 A에 있습니다.`));
      TB([P2("Verb","동사"), P2("Actual occurrences","실제 등장 횟수"), P2("Sentence numbers","문장번호")], vlist.slice(0, VMAX).map(([lem, e]) => [lem, String(e.n), [...e.sents].sort((x, y) => x - y).map(x => ref(c, x)).join(", ")]));
    }
  });
  return F;
}
function buildDoc(o){
  DOC_FULL = !o.short;
  let D = [];
  const r = LAST, B = BL[r.baseline] || {}, secs = SECS.map(s=>s[0]).filter(c => r.sections[c] && (!o.secs || o.secs.includes(c)));
  const now = new Date(), stamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const H = (t, x) => D.push({t, x}), Pp = x => D.push({t:"p", x}), UL = items => D.push({t:"ul", items}), TB = (head, rows) => D.push({t:"table", head, rows});
  const LL = docLang(), pairs = (arr) => arr.map(p => P(p));
  const review = lang => REVIEW[lang];
  const HEAD = D;
  H("h1", P2("Manuscript Diagnosis results", "논문 글쓰기 진단 결과"));
  Pp(ui("upload"));
  const PROMPT_B = (D = []);
  // 맨 앞: PDF·전체 복사·간단 복사 모두 같은 프롬프트(교수님 문구)
  if(!o.short){
    // 2026-11-12 교수님 요청: PDF·전체 복사 맨 앞도 화면의 프롬프트(교수님 문구)와 같은 글로. 예전 '검토 요청'(REVIEW)은 쓰지 않음
    H("h2", P2("Appendix G. Request to the AI reading this document", "부록 G. 이 문서를 읽는 AI에게: 피드백 요청"));
    D.push({t:"pre", x: promptFor(replyLang(), o.mode === "text")});
  } else {
    D.push({t:"pre", x: promptFor(replyLang(), true)});
    D.push({t:"hr"});
  }
  // ① 분석 기준: 도구·규칙 버전, 분석 대상과 분류 기준, 제외 기준, 알려진 한계
  const CRIT = (D = []);
  H("h2", o.short ? P2("1. Analysis criteria", "1. 분석 기준") : P2(dlab("crit","en"), dlab("crit","ko")));
  H("h3", P2("Tool, rule versions and comparison set", "도구·규칙 버전과 비교 집합"));
  const info = [`${P2("Tool","도구")}: ${P2("Manuscript Diagnosis (rule-based; no generative AI)","논문 글쓰기 진단(규칙 기반, 생성형 AI 쓰지 않음)")}`,
    `${P2("Parser","분석기")}: spaCy en_core_web_sm`,
    `${P2("Comparison data","비교 자료")}: ${r.version.baseline}`,
    `${P2("Hedge and booster rules","완화·강조 표현 규칙")}: ${r.version.counting}`,
    `${P2("Reporting-verb rule","보고동사 규칙")}: ${r.version.reporting || r.version.usage_rules} (${P2("subject-based, 2026-11-10","주어 기반, 2026-11-10")})`,
    `${P2("Verb usage classification","동사 쓰임 분류")}: ${r.version.usage_classes || "verb_usage_rules v0.4"}`,
    `${P2("Export","내보내기")}: export-2026-11-12`,
    `${P2("Comparison set","비교 집합")}: ${P([r.baseline_info.en, r.baseline_info.ko])}, ${LL==="ko"?`${r.baseline_info.papers}편`:`${r.baseline_info.papers} ${P2("papers","편")}`}${r.baseline_info.reference_only?` (${P2("few papers; for reference only","논문 수가 적어 참고용")})`:""}`,
    `${P2("Generated","만든 때")}: ${stamp}`];
  if(o.secs) info.push(`${P2("Sections included in this copy","이 복사에 넣은 절")}: ${secs.map(c=>P(SECNAME[c])).join(", ")}`);
  const mi = manuscriptInfo(); if(mi.length && o.short) info.push(...mi);   // PDF·전체 복사는 원고 정보를 첫머리에 둔다
  UL(info);
  H("h3", P2("What is analysed and how it is classified", "분석 대상과 분류 기준"));
  UL(pairs(SCOPE));
  if(!o.short){
    Pp(`${exName("usage")}: ${exText("usage")}`);
    // 2026-11-12: 표 먼저, 집계 기준과 예외는 표 아래(화면의 '동사의 쓰임은 어떻게 구분하나요?'와 같은 구성)
    [CRIT_T.usage, CRIT_T.marks, CRIT_T.layers].forEach(Tb => {
      H("h3", P(Tb.h)); if(Tb.lead) Pp(P(Tb.lead));
      TB(Tb.cols.map(c => P(c)), Tb.rows.map(r => r.map(c => Array.isArray(c) ? P(c) : c)));
      UL(Tb.notes.map(n => P(n))); });
    H("h3", P(SAMPLE60.h)); Pp(P(SAMPLE60.lead));
    TB(SAMPLE60.cols.map(c => P(c)), SAMPLE60.rows.map(([n, k, ids]) => [P(n), k, ids])); UL(SAMPLE60.notes.map(n => P(n)));
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
  const SUMM = (D = []);
  H("h2", o.short ? P2("2. Results summary", "2. 결과 요약") : P2("Appendix A. Detailed figures by section and reference ranges", "부록 A. 절별 상세 수치와 참조 범위"));
  H("h3", P2("How to read these results", "이 결과를 읽는 법"));
  UL([P2("Sentences are numbered by section, e.g. [Intro-3] is the third sentence of the Introduction. Results and the detection list refer to sentences by these numbers.", "문장에는 절별 번호가 붙어 있습니다. 예를 들어 [서론-3]은 서론의 셋째 문장입니다. 결과와 탐지 목록에서도 같은 번호로 문장을 가리킵니다."),
      P2("Sections shorter than 300 words are not judged as higher or lower. Their per-1,000-word rates are shown for reference only; focus on the actual counts and sentences. The 300-word threshold is this tool's own criterion for withholding frequency judgements on short sections.",
         "300단어보다 짧은 절은 빈도에 따른 높고 낮음을 판정하지 않습니다. 환산 수치는 참고용으로만 제시하므로, 실제 개수와 문장을 중심으로 확인해 주세요. 300단어는 이 도구에서 짧은 절의 빈도 판정을 보류하기 위해 정한 기준입니다."),
      P2("The reference range is not a score. Being outside it is information for review, not an error.", "참조 범위는 점수가 아닙니다. 범위를 벗어난 것은 오류가 아니라 검토를 위한 정보입니다."),
      P2("Group 4 (usage not found) is not an error; it only means the comparison papers do not show this use.", "분류 ④(해당 용법 미확인)는 오류가 아닙니다. 비교 논문에서 이 쓰임이 확인되지 않았다는 뜻일 뿐입니다."),
      P2("All detections are automatic and can be wrong. Check each item in its sentence (see “" + dlab("det","en") + "”).", "모든 탐지는 자동 규칙이라 틀릴 수 있습니다. 항목마다 해당 문장에서 확인하세요(‘" + dlab("det","ko") + "’).")]);
  if(!o.short){
    H("h3", P2("How the figures are calculated", "수치의 계산 기준"));
    UL([`${P2("Per 1,000 words","1,000단어당")}: ${P2("count in the section ÷ words in the section × 1,000. Words are alphabetic tokens.","절 안의 개수 ÷ 그 절의 단어 수 × 1,000. 단어는 알파벳으로 된 낱말입니다.")}`,
        `${P2("Reference range","참조 범위")}: ${P2("for each paper in the comparison set the per-1,000-words value of the same section is computed; the reference range is the first to third quartile (Q1–Q3) of those values, computed with the inclusive method (same as Excel QUARTILE.INC).","비교 집합의 논문마다 같은 절의 1,000단어당 값을 구하고, 그 값들의 1사분위수–3사분위수(Q1–Q3)를 참조 범위로 씁니다. 사분위수는 포함 방식(엑셀 QUARTILE.INC와 같음)으로 계산합니다.")}`,
        `${P2("Full range","전체 범위")}: ${P2("the lowest to the highest value among the comparison papers.","비교 논문 값 가운데 최솟값–최댓값.")}`,
        `${P2("Comparison median","비교 중앙값")}: ${exText("median")}`,
        `${P2("Position labels","판정 말")}: ${P2("“Inside the reference range” = Q1 ≤ value ≤ Q3; “above/below the reference range” = outside Q1–Q3 but inside the full range; “above/below the full range” = higher or lower than all comparison papers. Labels describe position, not quality.","‘참조 범위 안’ = Q1 ≤ 값 ≤ Q3, ‘참조 범위보다 높음/낮음’ = Q1–Q3 밖이지만 전체 범위 안, ‘전체 범위보다 높음/낮음’ = 모든 비교 논문보다 높거나 낮음. 위치를 말할 뿐 잘 썼다 못 썼다는 평가가 아닙니다.")}`,
        ...["hedge_per1000","booster_per1000","reporting_per1000","verbs_per1000"].map(k => `${exName(k)}: ${exText(k)}`),
        `${P2("No double counting","중복 집계 없음")}: ${P2("Items classified as reporting verbs for previous studies are not counted again as hedges or boosters. The same verb may therefore be counted under different measures depending on its context and classification.","선행연구 보고동사로 분류한 항목은 완화·강조 표현에 중복 집계하지 않습니다. 따라서 같은 동사라도 문맥과 분류에 따라 집계 항목이 달라질 수 있습니다.")}`]);
    // 탐지 개수와 분류별 결과(절 × 항목). 전체 탐지 목록의 행 수와 같다
    H("h3", P2("Detection counts", "탐지 개수"));
    const DS = {}; secs.forEach(c => DS[c] = detections(c, r.sections[c]));
    const na = c => !HEDGE_IN.includes(c);
    TB([P2("Section","절"), P2("Words","단어 수"), P2("Sentences","문장 수"), P2("Verbs","동사"), P2("Hedges","완화 표현"), P2("Boosters","강조 표현"), P2("Reporting verbs (previous studies)","선행연구 보고동사"), P2("Left out of reporting verbs (own study)","보고동사에서 뺌(자기 연구)"), P2(`Rows in ${dlab("det","en")}`, `${dlab("det","ko")} 행 수`)],
      secs.map(c => { const S = r.sections[c], K = DS[c].K; return [P(SECNAME[c]), S.words.toLocaleString(), String(S.sentences.length), String(K.verb),
        na(c) ? P2("not counted","세지 않음") : String(K.hedge), na(c) ? P2("not counted","세지 않음") : String(K.booster), String(K.prior), String(K.self), String(DS[c].rows.length)]; }));
    Pp(P2("Verb counts include preposition-like uses, which are left out of the verb comparison tables. A word that is both a verb and a reporting verb (or hedge) appears in two rows of the detection list.","동사 개수에는 개별 동사 비교표에서 뺀 ‘전치사처럼’ 쓰임도 들어 있습니다. 동사이면서 보고동사(또는 완화 표현)인 낱말은 전체 탐지 목록에 두 줄로 나옵니다."));
    H("h3", P2("Verbs by usage", "쓰임별 동사 수"));
    TB([P2("Section","절"), ...USAGE_ORDER.map(usageName), P2("of which fixed expressions","그중 굳은 표현")],
      secs.map(c => { const m = r.sections[c].usage_mix || {}; return [P(SECNAME[c]), ...USAGE_ORDER.map(k => String(m[k] || 0)), String(m["굳은 표현"] || 0)]; }));
  }
  // 절별 결과
  const PERSEC = (D = []);
  secs.forEach(c => {
    const S = r.sections[c]; H("h3", `${P(SECNAME[c])} — ${P2("results","결과")}`);
    UL([`${P2("Words","단어 수")}: ${S.words.toLocaleString()}${S.words_baseline?` (${P2("comparison median","비교 중앙값")} ${fmt(S.words_baseline.median)})`:""}; ${P2("comparison papers with this section","이 절이 있는 비교 논문")}: ${S.baseline_papers}`,
        ...(S.short ? [P2("This section is shorter than 300 words, so higher or lower frequencies are not judged. The rates are given for reference only; focus on the actual counts and sentences.","이 절은 300단어보다 짧아 빈도에 따른 높고 낮음은 판정하지 않습니다. 환산 수치는 참고용으로만 제시하므로, 실제 개수와 문장을 중심으로 확인해 주세요.")] : [])]);
    const ms = S.metrics.filter(m => !o.short || (!S.short && m.band && m.band !== "typical"));
    if(ms.length){
      if(o.short) Pp(P2("Measures outside the reference range:","참조 범위를 벗어난 지표:"));
      TB([P2("Measure","지표"),P2("Count","개수"),P2("Per 1,000 words","1,000단어당"),P2("Comparison median","비교 중앙값"),P2("Reference range (Q1–Q3)","참조 범위(Q1–Q3)"),P2("Full range","전체 범위"),P2("Position","위치")],
        ms.map(m => { const s = m.baseline; return [exName(m.key), String(m.count), fmt(m.rate), s?fmt(s.median):"–", s?`${fmt(s.q1)}–${fmt(s.q3)}`:"–", s?`${fmt(s.min)}–${fmt(s.max)}`:"–", posText(m.band, S.short)]; }));
    } else if(o.short) Pp(P2("No measure is outside the reference range (or the section is too short to judge).","참조 범위를 벗어난 지표가 없습니다(또는 절이 짧아 판정하지 않음)."));
    if(o.short){   // 간단 복사: 탐지 낱말만 짧게
      const det = [];
      S.metrics.forEach(m => {
        if(m.evidence) det.push(`${exName(m.key)}: ${m.evidence.length ? m.evidence.map(h => `${h.word} (${ref(c, h.sent)})`).join(", ") : P2("none","없음")}`);
        if(m.excluded_self && m.excluded_self.length) det.push(`${P2("Not counted as reporting verbs (introducing your own study)","보고동사에서 뺀 것(자기 연구 소개)")}: ${m.excluded_self.map(h => `${h.word} (${ref(c, h.sent)})`).join(", ")}`);
      });
      if(det.length) UL(det);
    }
    if(!o.short && S.commentary){   // 2026-11-12: 표의 숫자를 되풀이하던 '분석 결과 풀이' 본문은 뺀다. 확인 질문만 남김
      const cm = S.commentary, pick = (ko, en) => (LL==="ko"?ko:LL==="en"?en:en.map((e,i)=>`${e} ${ko[i]||""}`));
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
      if(!o.short) Pp(P2("Up to 10 verbs, by number of predicate uses (ties: by all uses, then alphabetically). This is not the full list; all verbs are in the detection list.", "술어로 쓴 횟수가 많은 순으로 10개까지 실었습니다(같으면 모든 쓰임 횟수, 그다음 알파벳순). 전체 목록이 아니며, 모든 동사는 전체 탐지 목록에 있습니다."));
      if(tv.length) TB(VH, tv.map(verbRow)); else Pp(P2("none","없음")); }
    if(ov.length){ Pp(`${exName("verbs_other")}${o.short?` (${P2("groups 3 and 4","③·④ 분류")})`:""}:`); if(!o.short) Pp(P2("Up to 5 verbs used more often as modifiers or non-finite forms than as predicates (by number of uses, then alphabetically).", "술어보다 수식어·비정형으로 더 많이 쓴 동사를 쓰임 횟수가 많은 순으로 5개까지 실었습니다(같으면 알파벳순).")); TB(VH, ov.map(verbRow)); }
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
  const MANU = (D = []);
  H("h2", o.short ? P2("3. Full manuscript (numbered sentences)", "3. 원고 전문(문장 번호)") : P2("Appendix C. Full manuscript (numbered sentences)", "부록 C. 원고 전문(문장 번호)"));
  Pp(P2("Every sentence is numbered, so that expressions not in the detection list can also be checked.","탐지 목록에 없는 표현도 찾아볼 수 있도록 모든 문장에 번호를 붙였습니다."));
  secs.forEach(c => { const S = r.sections[c]; H("h3", `${P(SECNAME[c])} (${S.words.toLocaleString()} ${P2("words","단어")}, ${S.sentences.length} ${P2("sentences","문장")})`);
    S.sentences.forEach((s, i) => D.push({t:"sent", id:sid(c, i+1), x:s, spans:[]})); });
  if(o.short) return [...HEAD, ...PROMPT_B, ...CRIT, ...SUMM, ...PERSEC, ...MANU];
  // ④ 전체 탐지 목록과 KWIC: 탐지한 항목을 하나도 빼지 않는다
  const DET = (D = []);
  H("h2", P2("Appendix B. Complete detection list with KWIC", "부록 B. 전체 탐지 목록과 KWIC"));
  UL([P2("Every item the tool detected is listed: every verb with its usage, every hedge and booster, every reporting verb for previous studies, and the verbs left out of reporting verbs because they introduce your own study.","도구가 탐지한 항목을 모두 싣습니다: 동사 낱말 전부와 그 쓰임, 완화·강조 표현 전부, 선행연구 보고동사 전부, 자기 연구를 소개해 보고동사에서 뺀 동사."),
      P2(`Left and right context show up to ${CTX} characters. If that is not enough, read the whole sentence under the same number in “${dlab("manu","en")}”.`, `앞뒤 문맥은 ${CTX}자까지만 보입니다. 부족하면 ‘${dlab("manu","ko")}’에서 같은 번호의 문장 전체를 확인하세요.`),
      P2("Verb entries show the word as written, with its base form in brackets when different.","동사는 원고에 쓴 꼴을 보이고, 기본형이 다르면 괄호에 적었습니다."),
      P2("Hedges and boosters are counted only in the Introduction, Results and Discussion, and Conclusions.","완화·강조 표현은 서론·결과논의·결론에서만 셉니다.")]);
  secs.forEach(c => { const S = r.sections[c], {rows, K} = detections(c, S);
    H("h3", `${P(SECNAME[c])} — ${rows.length} ${P2("items","건")}`);
    Pp(`${P2("Verbs","동사")} ${K.verb}${K.prep?` (${P2("of which preposition-like","그중 전치사처럼")} ${K.prep})`:""} · ${P2("hedges","완화 표현")} ${HEDGE_IN.includes(c)?K.hedge:P2("not counted","세지 않음")} · ${P2("boosters","강조 표현")} ${HEDGE_IN.includes(c)?K.booster:P2("not counted","세지 않음")} · ${P2("reporting verbs","보고동사")} ${K.prior} · ${P2("left out (own study)","뺌(자기 연구)")} ${K.self}`);
    if(rows.length) TB([P2("Sentence","문장 번호"), P2("Detected expression","탐지 표현"), P2("Classification","분류"), P2("Left context","앞 문맥"), P2("Right context","뒤 문맥")],
      rows.map(x => { const [Lc, Rc] = kwic(S.sentences[x.n-1], x.a, x.b); return [ref(c, x.n), x.w, x.cls, Lc, Rc]; }));
    else Pp(P2("none","없음")); });
  // ⑤ 기준 자료: 네 저널 공통 동사
  const REFD = (D = []);
  H("h2", P2("Appendix E. Reference data: verbs frequently found in all four journals", "부록 E. 기준 자료: 네 저널에서 공통으로 자주 확인된 동사"));
  if(CV){
    Pp(P2(T.cv_rule[0], T.cv_rule[1])); Pp(P2(T.cv_note1[0], T.cv_note1[1])); Pp(P2(T.cv_note2[0], T.cv_note2[1]));
    TB([P2("Section","절"), P2("Verbs meeting the condition","조건을 충족한 동사")], SECS.map(([c]) => [P(SECNAME[c]), (CV.sections[c]||[]).map(v=>v.verb).join(", ") || P2("none","없음")]));
    Pp(P2(T.cv_frac[0], T.cv_frac[1]));
    const J = [["ACS_CM","CM"],["ACS_IC","IC"],["ACS_JOC","JOC"],["ACS_JPC_C","JPC C"]];
    TB([P2("Section","절"), P2("Verb","동사"), ...J.map(j=>j[1])], SECS.flatMap(([c]) => (CV.sections[c]||[]).map(v => [P(SECNAME[c]), v.verb, ...J.map(([k]) => `${v.journals[k].papers}/${v.journals[k].n}`)])));
  }
  // ⑥ 출처와 인용
  const SRC = (D = []);
  H("h2", P2("Appendix F. Sources and citation", "부록 F. 출처와 인용"));
  UL([`${P2("How to cite this tool","이 도구 인용")}: ${P2("Manuscript Diagnosis (논문 글쓰기 진단)","논문 글쓰기 진단(Manuscript Diagnosis)")}, ${r.version.baseline}; ${r.version.counting}; ${r.version.reporting || ""}; ${r.version.usage_classes || r.version.usage_rules}. ${P2("Accessed","이용일")} ${stamp.slice(0,10)}.`,
      `${P2("Counting rules","세는 규칙")}: section-verb-hedge-baseline 0.4.9 (GitHub angela0420/gnu_10team_cho).`,
      `${P2("Comparison set","비교 집합")}: ${P([r.baseline_info.en, r.baseline_info.ko])}, ${r.baseline_info.papers} ${P2("papers (ACS, 2020–2021)","편(ACS, 2020–2021)")}. ${P2("Sections are introduction, methods, results and discussion (results and discussion counted together), and conclusions; quartiles use the inclusive method.","절은 서론, 실험·방법, 결과·논의(결과와 논의를 합쳐 셈), 결론이며 사분위수는 포함 방식입니다.")}`,
      P2("All comparison papers are open-access articles under CC BY 4.0. This document contains only figures derived from them, not their sentences.","비교 논문은 모두 CC BY 4.0 공개 논문입니다. 이 문서에는 논문 문장이 아니라 그로부터 센 수치만 들어 있습니다.")]);
  const pl = (B.paper_list || []);
  if(pl.length){ H("h3", P2("Comparison papers","비교 논문 목록")); D.push({t:"ol", items: pl.map(p => `${p.title || p.id}${p.year?` (${p.year})`:""}. https://doi.org/${p.doi}`)}); }
  // 앞은 읽는 자료, 뒤는 확인하는 자료(2026-11-12)
  return [...HEAD, ...frontPart(r, secs, stamp), ...SUMM, ...PERSEC, ...DET, ...MANU, ...CRIT, ...REFD, ...SRC, ...PROMPT_B];
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
    if(b.t==="ul") return b.items.map(i => `- ${i}`).join("\n"); if(b.t==="links") return b.items.map(([, x]) => `- ${x}`).join("\n"); if(b.t==="ol") return b.items.map((i,k) => `${k+1}. ${i}`).join("\n");
    if(b.t==="table") return [`| ${b.head.map(cell).join(" | ")} |`, `| ${b.head.map(()=>"---").join(" | ")} |`, ...b.rows.map(r => `| ${r.map(cell).join(" | ")} |`)].join("\n");
    if(b.t==="sent") return `${b.id} ${markText(b.x, b.spans, w => `**${w}**`)}${b.labels?`\n  (${b.labels.join(" · ")})`:""}`;
    return "";
  }).join("\n\n") + "\n";
}
function toHtml(D){
  return D.map(b => {
    if(b.t==="h2"){ const m = String(b.x).match(/^(?:부록|Appendix) ([A-G])\./); return `<h2${m ? ` id="app-${m[1]}"` : ""}>${esc(b.x)}</h2>`; }   // 첫 장 목록에서 이동
    if(["h1","h3"].includes(b.t)) return `<${b.t}>${esc(b.x)}</${b.t}>`;
    if(b.t==="links") return `<ul>${b.items.map(([id, x]) => `<li><a href="#app-${id}">${esc(x)}</a></li>`).join("")}</ul>`;
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
  const L = LANG;
  const have = LAST ? SECS.filter(s => LAST.sections[s[0]]) : [];
  const cur = document.getElementById("savesec")?.value || "ALL", rl = document.getElementById("replylang")?.value || "ko";
  const pbtns = L==="both" ? `<button class="btn ghost" data-pcopy="ko">${esc(P(UI.pcopy_ko))}</button><button class="btn ghost" data-pcopy="en">${esc(UI.pcopy_en[0])}</button>`
    : `<button class="btn ghost" data-pcopy="${L}">${esc(ui("pcopy"))}</button>`;
  const ptext = L==="both" ? `${PROMPT.ko}\n\n────────\n\n${PROMPT.en}` : PROMPT[L];
  box.innerHTML = `<h2>${esc(ui("title"))}</h2>${guideHtml()}
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
// 목표 저널을 아직 정하지 못했을 때 사용자가 자기 AI와 상의할 때 쓸 프롬프트(2026-11-12, 교수님 문구). 사이트가 AI를 부르지는 않는다
const JPROMPT = {
ko: `당신은 제 연구의 투고 저널 후보를 함께 검토하는 조력자입니다. 아래 정보를 바탕으로 후보를 비교하고, 제가 「논문 글쓰기 진단」에 입력할 잠정 목표 저널 하나를 선택하도록 도와주세요. 원고를 대신 작성하거나 고쳐 쓰지는 마세요.

제 연구 정보
  • 원고 제목 또는 가제:
  • 연구 분야:
  • 키워드:
  • 연구 목적 또는 질문:
  • 연구 대상·자료와 주요 방법:
  • 주요 결과:
  • 기존 연구와 다른 점 또는 기여:
  • 원고 단계:
  • 고려 중인 저널이 있다면:
  • 투고 조건이나 제약이 있다면:
    예: 게재료 예산, 오픈 액세스 여부, 원하는 독자층, 논문 유형 등

검토 원칙
1. 정보가 부족하면 추천에 앞서 꼭 필요한 질문을 최대 3개 해 주세요. 제가 제공하지 않은 연구 결과나 기여를 추측하지 마세요.
2. 주제와 키워드의 일치뿐 아니라, 연구 질문·방법·기여의 성격과 예상 독자층을 고려해 후보 저널을 3개 이내로 제시해 주세요.
3. 웹에서 각 저널의 공식 홈페이지를 확인하고, 다음 사항의 근거와 링크를 제시해 주세요.
  • 정확한 저널명과 출판사
  • 저널의 목적과 범위(Aims & Scope)
  • 제 원고에 해당하는 논문 유형
  • 게재료·오픈 액세스 등 제가 제시한 조건과 관련된 사항
   웹을 확인할 수 없다면 그 사실을 먼저 밝히고, 후보는 잠정 제안으로만 제시해 주세요. 확인하지 않은 정보나 링크를 만들어 내지 마세요.
4. 각 후보에 대해 다음을 구분해 설명해 주세요.
  • 제 연구와 맞는 점
  • 맞지 않을 수 있는 점
  • 결정 전에 더 확인할 점
5. 저널의 명성이나 영향력 지표만으로 순위를 매기지 마세요. 게재 가능성이나 심사 결과를 보장하거나, 근거 없는 합격 확률을 제시하지 마세요.
6. 미공개 원고 전문을 요구하지 말고, 추가 정보가 필요하면 연구 개요 수준에서 질문해 주세요.

원하는 답변 형식
먼저 후보 비교표를 제시해 주세요. 이어서 현재 정보로 가장 적합해 보이는 잠정 목표 저널 하나와 그 이유, 선택이 달라질 수 있는 조건을 설명해 주세요.
마지막에는 제가 직접 확인할 사항을 짧게 정리하고, 다음 형식으로 마무리해 주세요.
「논문 글쓰기 진단」에 입력할 잠정 목표 저널: [정확한 저널명]
선택 이유: [제 연구의 질문·방법·기여·독자층과 연결한 설명]

한국어로 설명하되, 저널명은 공식 명칭을 그대로 사용해 주세요.`,
en: `You are helping me review candidate journals for my research. Based on the information below, compare candidates and help me choose one provisional target journal to enter in Manuscript Diagnosis. Do not write or rewrite my manuscript.

My research
  • Manuscript title or working title:
  • Field:
  • Keywords:
  • Aim or research question:
  • Materials/data and main methods:
  • Main results:
  • How it differs from earlier work, or its contribution:
  • Manuscript stage:
  • Journals I am considering, if any:
  • Submission conditions or constraints, if any:
    e.g. publication-fee budget, open access, intended readers, article type

Principles
1. If information is missing, first ask me at most three questions that are really needed. Do not guess results or contributions I have not given.
2. Considering not only topic and keyword match but also the nature of the research question, methods and contribution and the expected readers, suggest no more than three candidate journals.
3. Check each journal’s official website on the web, and give evidence and links for:
  • the exact journal name and publisher
  • its aims and scope
  • the article type that fits my manuscript
  • publication fees, open access and other conditions I gave
   If you cannot check the web, say so first and give the candidates only as provisional suggestions. Do not invent information or links you have not checked.
4. For each candidate, explain separately:
  • how it fits my research
  • how it may not fit
  • what to check before deciding
5. Do not rank journals only by reputation or impact metrics. Do not guarantee acceptance or review outcomes, or give unfounded acceptance probabilities.
6. Do not ask for my unpublished full manuscript; if you need more, ask at the level of a research summary.

Answer format
First give a comparison table of the candidates. Then explain the one provisional target journal that looks most suitable with the current information, why, and what conditions could change the choice.
Finally, briefly list what I should check myself, and end in this form:
Provisional target journal to enter in Manuscript Diagnosis: [exact journal name]
Reason: [explanation linked to my research question, methods, contribution and readers]

Explain in English, and use the official journal names.`};
// 원고 정보(2026-11-12, 교수님 요청): 모두 필수. '내 원고에서 확인하고 싶은 점'은 제시된 질문 하나 이상 또는 직접 질문.
// 이 칸의 내용은 서버로 보내지 않는다(분석 요청에는 원고 본문과 비교 자료 이름만 간다). 결과 화면·PDF 첫머리·텍스트 복사에 쓴다.
const QOPTS = [
  ["q_obs", ["Whether I kept the results I observed or calculated apart from my interpretation of them","관찰·계산한 결과와 그에 대한 해석을 구분했는지"], ["Did I keep the results I observed or calculated apart from my interpretation of them?","관찰·계산한 결과와 그에 대한 해석을 구분했는가?"]],
  ["q_str", ["Whether the strength of my claims matches the evidence I give","주장의 세기가 제시한 근거에 맞는지"], ["Does the strength of my claims match the evidence I give?","주장의 세기가 제시한 근거에 맞는가?"]],
  ["q_prior", ["Whether I kept the claims of earlier studies apart from my own results and interpretation","선행연구의 주장과 내 연구의 결과·해석을 구분했는지"], ["Did I keep the claims of earlier studies apart from my own results and interpretation?","선행연구의 주장과 내 연구의 결과·해석을 구분했는가?"]],
  ["q_expr", ["Which expressions I used, checked in the actual sentences","어떤 표현이 쓰였는지 실제 문장에서 확인하기"], ["Which expressions did I use? (checked in the actual sentences)","어떤 표현이 쓰였는지 실제 문장에서 확인한다."]]];
// 비교 자료와 같은 저널인지 보려고 쓰는 이름(소문자, 점·쉼표 뺌). 저널 이름이 같다는 것만 알려 줄 뿐 투고 적합성은 판단하지 않는다
const JNAMES = {ACS_CM:["chemistry of materials","chem mater","acs chemistry of materials"], ACS_IC:["inorganic chemistry","inorg chem","acs inorganic chemistry"], ACS_JOC:["journal of organic chemistry","j org chem","joc"],
  ACS_JPC_C:["journal of physical chemistry c","j phys chem c","jpc c","jpcc"], JPC_C_exp:["journal of physical chemistry c","j phys chem c","jpc c","jpcc"], JPC_C_comp:["journal of physical chemistry c","j phys chem c","jpc c","jpcc"]};
const jnorm = x => String(x || "").toLowerCase().replace(/^the\s+/, "").replace(/[.,:;]/g, " ").replace(/\s+/g, " ").trim();
function infoValues(){
  const v = id => (document.getElementById(id)?.value || "").trim();
  return {title: v("mi-title"), keys: v("mi-keys"), journal: v("mi-journal"), stage: v("mi-stage"), own: v("mi-question"),
    qs: QOPTS.filter(([k]) => document.getElementById("mi-" + k)?.checked).map(([k]) => k)};
}
function stageName(k){ const st = UI.stages.find(x => x[0] === k); return st ? P([st[1], st[2]]) : k; }
function questionList(iv){ return [...iv.qs.map(k => P(QOPTS.find(q => q[0] === k)[2])), ...(iv.own ? [iv.own] : [])]; }
const setJournal = info => { const m = String(info.en || "").match(/\(([^)]*)\)/); return m ? m[1] : (info.en || ""); };   // "Physical (J. Phys. Chem. C)" → "J. Phys. Chem. C"
const setGroup = info => P([String(info.en || "").replace(/\s*\(.*$/, ""), String(info.ko || "").replace(/\s*\(.*$/, "")]);
function journalMatches(key, j){ const n = jnorm(j); return !!n && (JNAMES[key] || []).some(x => n === x || n.includes(x) || (x.length > 6 && x.includes(n))); }
function journalRelation(iv, r){
  const key = r ? r.baseline : document.getElementById("baseline")?.value, info = r ? r.baseline_info : (BL[key] || {});
  if(!key || !iv.journal) return "";
  const sel = setJournal(info), note = P2(" This tool does not analyse whether the manuscript suits the journal or its editorial policy.", " 이 도구는 저널의 투고 적합성이나 편집 방침은 분석하지 않습니다.");
  if(journalMatches(key, iv.journal)) return P2(`Your target journal is ${iv.journal}, and the comparison data chosen this time are published papers from the same journal (${sel}).`, `목표 저널은 ${iv.journal}이며, 이번에 선택한 비교 자료도 같은 저널(${sel})의 출판 논문입니다.`) + note;
  const others = Object.keys(BL).filter(k => k !== key && journalMatches(k, iv.journal));
  if(others.length){ const o = BL[others[0]]; return P2(`Your target journal is ${iv.journal}, and the comparison data chosen this time are ${sel}. This tool’s ‘${setGroup(o)}’ set contains ${setJournal(o)} papers. The current figures are calculated against the chosen ${sel} set.`,
    `목표 저널은 ${iv.journal}이며, 이번에 선택한 비교 자료는 ${sel}입니다. 이 도구의 ‘${setGroup(o)}’ 집합에 ${setJournal(o)} 논문이 있습니다. 현재 수치는 선택한 ${sel} 집합을 기준으로 계산했습니다.`) + note; }
  return P2(`This tool has no comparison data for your target journal (${iv.journal}). The current figures are calculated against the chosen comparison set (${sel}).`, `이 도구에는 목표 저널(${iv.journal})의 비교 자료가 없습니다. 현재 수치는 선택한 비교 집합(${sel})을 기준으로 계산했습니다.`) + note;
}
// 결과 화면·PDF 첫머리에 같은 순서로 쓰는 맥락 정보
function ctxItems(r){
  const iv = infoValues(), info = r ? r.baseline_info : null;
  return [[ui("mtitle_s"), iv.title], [ui("mkeys_s"), iv.keys], [ui("journal_s"), iv.journal], [ui("stage_s"), iv.stage ? stageName(iv.stage) : ""],
    [ui("qs_s"), questionList(iv)], [ui("set_s"), info ? `${P([info.en, info.ko])}, ${P2(`${info.papers} papers`, `${info.papers}편`)}${info.reference_only ? ` (${P2("few papers; for reference only","편수가 적어 참고용")})` : ""}` : ""]];
}
function manuscriptInfo(){   // 간단 복사의 '분석 기준' 목록에 넣는 줄
  return ctxItems(LAST).slice(0, 5).filter(([, v]) => v && v.length).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" / ") : v}`);
}
function drawCtx(){
  const box = document.getElementById("ctxbox"); if(!box || !LAST) return; box.hidden = false;
  const it = ctxItems(LAST), iv = infoValues();
  box.innerHTML = `<h3>${esc(ui("ctx_h"))}</h3><dl>${it.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${Array.isArray(v) ? (v.length ? `<ul>${v.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "–") : esc(v || "–")}</dd>`).join("")}</dl>
    ${journalRelation(iv, LAST) ? `<p class="note">${esc(journalRelation(iv, LAST))}</p>` : ""}<p class="note">${esc(ui("ctx_role"))}</p>`;
}
// 분석 전에 빠진 칸을 찾고 그 칸 가까이에 알린다. 빠진 것이 없으면 null
function checkInfo(){
  const iv = infoValues(), miss = [];
  [["mi-title", iv.title], ["mi-keys", iv.keys], ["mi-journal", iv.journal], ["mi-stage", iv.stage]].forEach(([id, v]) => { if(!v) miss.push(id); });
  if(!iv.qs.length && !iv.own) miss.push("mi-qbox");
  document.querySelectorAll("#mi-box .req").forEach(el => { const bad = miss.includes(el.dataset.for); el.classList.toggle("missing", bad);
    const m = el.querySelector(".miss"); if(m) m.hidden = !bad; });
  if(!miss.length) return null;
  const box = document.getElementById("mi-box"); box.open = true; (box.querySelector(".missing") || box).scrollIntoView({behavior:"smooth", block:"center"});
  return miss;
}
function drawInfoFields(){
  const host = document.getElementById("mi-box"); if(!host) return;
  const prev = document.getElementById("mi-title") ? infoValues() : null;
  const req = (id, inner, wide, msg) => `<div class="req${wide ? " wide" : ""}" data-for="${id}">${inner}<span class="miss" hidden>${esc(ui(msg || "miss"))}</span></div>`;
  host.innerHTML = `<summary>${esc(ui("info_h"))}</summary><div class="mi-body"><p class="note">${esc(ui("info_note"))}</p>
    <details class="mi-ex"><summary>${esc(ui("info_ex"))}</summary><dl>
      <dt>${esc(ui("mtitle_s"))}</dt><dd>${esc(ui("info_ex_t"))}</dd>
      <dt>${esc(ui("mkeys_s"))}</dt><dd>${esc(ui("info_ex_k"))}</dd>
      <dt>${esc(ui("journal_s"))}</dt><dd>${esc(ui("info_ex_j"))}</dd>
      <dt>${esc(ui("stage_s"))}</dt><dd>${esc(ui("info_ex_s"))}</dd>
      <dt>${esc(ui("qs_s"))}</dt><dd>${esc(P(QOPTS[0][1]))}; ${esc(ui("info_ex_q"))}</dd></dl></details>
    ${req("mi-title", `<label for="mi-title">${esc(ui("mtitle"))}</label><input id="mi-title" type="text" autocomplete="off" maxlength="300" placeholder="${esc(ui("mtitle_ph"))}">`, true)}
    ${req("mi-keys", `<label for="mi-keys">${esc(ui("mkeys"))}</label><input id="mi-keys" type="text" autocomplete="off" maxlength="300" placeholder="${esc(ui("mkeys_ph"))}">`, true)}
    ${req("mi-journal", `<label for="mi-journal">${esc(ui("journal"))}</label><input id="mi-journal" type="text" autocomplete="off" maxlength="200" placeholder="${esc(ui("mjournal_ph"))}">`)}
    ${req("mi-stage", `<label for="mi-stage">${esc(ui("stage"))}</label><select id="mi-stage">${UI.stages.map(([k,en,ko]) => `<option value="${k}">${esc(P([en,ko]))}</option>`).join("")}</select>`)}
    <div class="wide jhint"><p class="note">${esc(ui("jhint"))}</p>
      <details class="mi-ex"><summary>${esc(ui("jprompt_h"))}</summary><pre id="jprompttext">${esc(JPROMPT[LANG === "en" ? "en" : "ko"])}</pre>
      <button class="btn ghost" type="button" id="jpcopy">${esc(ui("pcopy"))}</button></details></div>
    ${req("mi-qbox", `<span class="qlab">${esc(ui("question"))}</span><p class="note">${esc(ui("qhint"))}</p>
      ${QOPTS.map(([k, lab]) => `<label class="qopt"><input type="checkbox" id="mi-${k}"> ${esc(P(lab))}</label>`).join("")}
      <label for="mi-question" class="qown">${esc(ui("qown"))}</label><textarea id="mi-question" rows="2" maxlength="1000" placeholder="${esc(ui("mquestion_ph"))}"></textarea>`, true, "miss_q")}
  </div>`;
  if(prev){ ["title","keys","journal","stage"].forEach(k => document.getElementById("mi-" + k).value = prev[k]); document.getElementById("mi-question").value = prev.own;
    prev.qs.forEach(k => { const c = document.getElementById("mi-" + k); if(c) c.checked = true; }); }
  host.querySelectorAll("input,select,textarea").forEach(el => el.addEventListener("input", () => {
    const w = el.closest(".req");
    if(w){ w.classList.remove("missing"); const m = w.querySelector(".miss"); if(m) m.hidden = true; }
    if(LAST){ counts(); drawCtx(); } }));
  host.querySelectorAll("input[type=checkbox]").forEach(el => el.addEventListener("change", () => { const w = el.closest(".req"); if(w){ w.classList.remove("missing"); w.querySelector(".miss").hidden = true; } if(LAST){ counts(); drawCtx(); } }));
  const jb = document.getElementById("jpcopy"); if(jb) jb.onclick = () => copyText(JPROMPT[LANG === "en" ? "en" : "ko"], jb);
  const jl = document.getElementById("savejump"); if(jl) jl.textContent = ui("jump");
}
function fillInfoExample(){   // '예시 원고 넣기'를 누르면 원고 정보도 예시로 채운다
  if(!document.getElementById("mi-title")) return;
  document.getElementById("mi-title").value = ui("info_ex_t"); document.getElementById("mi-keys").value = ui("info_ex_k");
  document.getElementById("mi-journal").value = ui("info_ex_j"); document.getElementById("mi-stage").value = "pre";
  document.getElementById("mi-q_obs").checked = true; document.getElementById("mi-question").value = ui("info_ex_q");
  document.querySelectorAll("#mi-box .req").forEach(w => { w.classList.remove("missing"); const m = w.querySelector(".miss"); if(m) m.hidden = true; });
}
window.EXPORT = {drawSave, drawInfoFields, buildDoc, toMd, toHtml, PROMPT, checkInfo, drawCtx, fillInfoExample, missMsg: () => ui("miss_all")};
})();
