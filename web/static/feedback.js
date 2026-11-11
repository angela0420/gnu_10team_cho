// 사용 경험 의견과 최근 업데이트(2026-11-12). 브라우저에서 Supabase로 바로 보낸다(진단 서버를 거치지 않으므로 원고와 섞이지 않음).
// 공개용 키(publishable)만 쓴다. 키가 비어 있으면 아무것도 보이지 않는다. Supabase가 정지·오류면 의견 칸만 "지금은 받을 수 없음"으로 바뀐다.
// 저장하는 것: 의견, 별명(선택), 공개 동의(선택). 원고·분석 결과·원고 정보(제목·키워드·질문)는 보내지 않는다.
(function(){
const SB_URL = "https://htyxbytvljpjjncxcdro.supabase.co";
const SB_KEY = "sb_publishable_PBm5I2LRg24JDwcGl9Kuew_FQ2hrBgF";   // 공개용 키(publishable). 비어 있으면 기능을 숨긴다. secret 키는 절대 넣지 않는다
const ON = !!SB_KEY;
const L = () => (document.documentElement.lang === "en" ? 0 : 1);
const S = {
  h:["How was it to use?","사용해 보니 어떠셨나요?"],
  lead:["What helped, or what was missing? Your one line helps make this site better. Please do not write manuscript content or unpublished research information.","어떤 점이 도움이 됐거나, 무엇이 부족했나요? 여러분의 한 줄이 사이트의 완성도를 높이는 데 큰 힘이 됩니다. 원고 내용이나 미공개 연구 정보는 적지 마세요."],
  msg:["Your feedback *","의견 *"], nick:["Nickname (optional)","별명(선택)"], consent:["I agree that this feedback may be shown on the site after review (optional).","검토 뒤 사이트에 이 의견을 소개해도 됩니다(선택)."],
  notice_h:["What is stored","무엇이 저장되나요?"],
  notice:[["Stored: your feedback, nickname (if given), the time of submission, and whether you agreed to it being shown.","저장하는 것: 의견, 별명(적은 경우), 제출 시각, 사이트 공개 동의 여부"],
    ["Purpose: improving the tool. Only feedback you agreed to show and that the administrator has reviewed may later be shown on the site.","이용 목적: 도구 개선. 공개에 동의하고 관리자가 확인한 의견만 나중에 사이트에 소개될 수 있습니다."],
    ["Not stored: your manuscript, the analysis results, the manuscript information (title, keywords, questions), or identity information such as e-mail or name.","저장하지 않는 것: 원고, 분석 결과, 원고 정보(제목·키워드·질문), 이메일·이름 같은 신원 정보"],
    ["Kept for: 2 years from submission.","보관 기간: 제출일로부터 2년"],
    ["Deletion: send ‘delete request’ in this box with the date and nickname of your feedback, and it will be deleted.","삭제 요청: 이 칸에 ‘삭제 요청’과 의견을 낸 날짜·별명을 적어 보내 주시면 지웁니다."],
    ["Stored with: Supabase (an external database service). This is separate from the diagnosis server.","저장 위치: Supabase(외부 데이터베이스 서비스). 진단 서버와는 따로입니다."]],
  send:["Review and send","확인하고 보내기"], confirm_h:["The following will be stored. Send it?","다음 내용이 저장됩니다. 보낼까요?"], yes:["Send","보내기"], back:["Edit","고치기"],
  empty:["Please write your feedback.","의견을 적어 주세요."], sending:["Sending…","보내는 중…"],
  done:["Thank you. Your feedback has been sent.","고맙습니다. 의견을 보냈습니다."],
  down:["Feedback cannot be received right now. Please try again later. The diagnosis itself works as usual.","지금은 의견을 받을 수 없습니다. 나중에 다시 시도해 주세요. 진단은 그대로 쓰실 수 있습니다."],
  upd_h:["Recent updates","최근 업데이트"], upd_more:["See more","더 보기"]
};
const t = k => S[k][L()];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const H = {apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`};

async function loadUpdates(box, limit){
  if(!ON || !box) return;
  try{
    const r = await fetch(`${SB_URL}/rest/v1/updates?select=date,category,title,body&is_public=eq.true&order=date.desc,id.desc&limit=${limit}`, {headers: H});
    if(!r.ok) throw new Error(r.status);
    const rows = await r.json(); if(!rows.length) return;
    const li = rows.map(x => `<li><b>${esc(x.date)}</b> ${esc(x.title)}${x.body ? `<span class="upd-b">${esc(x.body)}</span>` : ""}</li>`);
    box.innerHTML = `<details class="upd"><summary>${esc(t("upd_h"))}: ${esc(rows[0].date)} ${esc(rows[0].title)}</summary><ul>${li.join("")}</ul></details>`;
    box.hidden = false;
  }catch(e){ box.hidden = true; }   // 정지·오류면 조용히 숨긴다
}

function drawForm(host){
  if(!ON || !host) return;
  const keep = {m: host.querySelector("#fb-msg")?.value || "", n: host.querySelector("#fb-nick")?.value || "", c: !!host.querySelector("#fb-consent")?.checked};
  host.innerHTML = `<h2>${esc(t("h"))}</h2><p class="note">${esc(t("lead"))}</p>
    <label class="fb-l" for="fb-msg">${esc(t("msg"))}</label><textarea id="fb-msg" rows="3" maxlength="1000"></textarea>
    <label class="fb-l" for="fb-nick">${esc(t("nick"))}</label><input id="fb-nick" type="text" maxlength="40" autocomplete="off">
    <label class="fb-c"><input type="checkbox" id="fb-consent"> ${esc(t("consent"))}</label>
    <details class="fb-n"><summary>${esc(t("notice_h"))}</summary><ul>${S.notice.map(p => `<li>${esc(p[L()])}</li>`).join("")}</ul></details>
    <div class="fb-row"><button class="btn" type="button" id="fb-send">${esc(t("send"))}</button><span class="note" id="fb-st"></span></div>
    <div id="fb-confirm" hidden></div>`;
  host.querySelector("#fb-msg").value = keep.m; host.querySelector("#fb-nick").value = keep.n; host.querySelector("#fb-consent").checked = keep.c;
  host.hidden = false;
  const st = host.querySelector("#fb-st"), cf = host.querySelector("#fb-confirm");
  host.querySelector("#fb-send").onclick = () => {
    const m = host.querySelector("#fb-msg").value.trim(), n = host.querySelector("#fb-nick").value.trim(), c = host.querySelector("#fb-consent").checked;
    if(!m){ st.textContent = t("empty"); return; }
    st.textContent = "";
    cf.innerHTML = `<p><b>${esc(t("confirm_h"))}</b></p><ul><li>${esc(S.msg[L()].replace(" *",""))}: ${esc(m)}</li>${n ? `<li>${esc(S.nick[L()])}: ${esc(n)}</li>` : ""}<li>${esc(S.consent[L()])}: ${c ? "✔" : "–"}</li></ul>
      <div class="fb-row"><button class="btn" type="button" id="fb-yes">${esc(t("yes"))}</button><button class="btn ghost" type="button" id="fb-back">${esc(t("back"))}</button></div>`;
    cf.hidden = false;
    cf.querySelector("#fb-back").onclick = () => { cf.hidden = true; };
    cf.querySelector("#fb-yes").onclick = async () => {
      st.textContent = t("sending"); cf.hidden = true;
      try{
        const r = await fetch(`${SB_URL}/rest/v1/feedback`, {method:"POST", headers:{...H, "Content-Type":"application/json", Prefer:"return=minimal"},
          body: JSON.stringify({message: m, nickname: n || null, consent_public: c})});
        if(!r.ok) throw new Error(r.status);
        host.querySelector("#fb-msg").value = ""; host.querySelector("#fb-nick").value = ""; host.querySelector("#fb-consent").checked = false;
        st.textContent = t("done");
      }catch(e){ st.textContent = t("down"); }
    };
  };
}
window.FEEDBACK = {on: ON, drawForm, loadUpdates};
})();
