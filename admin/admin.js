// ===========================
// Simple Admin (Static Hosting)
// - Edit in browser
// - Download JSON
// - You upload/overwrite in /data
// ===========================

const STATUS = document.getElementById("statusText");

// ---- Simple "lock" (not secure) ----
const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");
const pwInput = document.getElementById("pw");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// ⚠️ 여기 비밀번호 바꿔서 쓰세요 (정적사이트라 강보안 아님)
const ADMIN_PASSWORD = "1234";
const AUTH_KEY = "signal_admin_authed";

function setStatus(t){ if (STATUS) STATUS.textContent = t; }

function showAdmin(){
  loginView?.classList.add("hide");
  adminView?.classList.remove("hide");
  setStatus("관리자 모드");
}
function showLogin(){
  adminView?.classList.add("hide");
  loginView?.classList.remove("hide");
  setStatus("로그인 필요");
}

function isAuthed(){
  return localStorage.getItem(AUTH_KEY) === "1";
}

function login(){
  const v = (pwInput?.value || "").trim();
  if (!v) return alert("비밀번호를 입력하세요.");
  if (v !== ADMIN_PASSWORD) return alert("비밀번호가 틀렸습니다.");
  localStorage.setItem(AUTH_KEY, "1");
  showAdmin();
  initAll();
}
function logout(){
  localStorage.removeItem(AUTH_KEY);
  showLogin();
}

loginBtn?.addEventListener("click", login);
logoutBtn?.addEventListener("click", logout);
pwInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") login();
});

// ---- Tabs ----
const tabNews = document.getElementById("tabNews");
const tabReviews = document.getElementById("tabReviews");
const newsPanel = document.getElementById("newsPanel");
const reviewsPanel = document.getElementById("reviewsPanel");

function activateTab(which){
  const isNews = which === "news";
  tabNews?.classList.toggle("is-active", isNews);
  tabReviews?.classList.toggle("is-active", !isNews);
  newsPanel?.classList.toggle("hide", !isNews);
  reviewsPanel?.classList.toggle("hide", isNews);
}
tabNews?.addEventListener("click", () => activateTab("news"));
tabReviews?.addEventListener("click", () => activateTab("reviews"));

// ---- Utils ----
function downloadJson(filename, obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function fetchJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} 불러오기 실패`);
  return await res.json();
}

function safeId(){
  return `n-${Date.now()}`;
}

// ===========================
// NEWS (data/news.json)
// ===========================
let newsItems = [];
let currentNewsIndex = -1;

const newsTbody = document.getElementById("newsTbody");
const newsReload = document.getElementById("newsReload");
const newsAdd = document.getElementById("newsAdd");
const newsDownload = document.getElementById("newsDownload");

const news_id = document.getElementById("news_id");
const news_date = document.getElementById("news_date");
const news_tag = document.getElementById("news_tag");
const news_title = document.getElementById("news_title");
const news_summary = document.getElementById("news_summary");
const news_content = document.getElementById("news_content");
const news_pinned = document.getElementById("news_pinned");

const newsSave = document.getElementById("newsSave");
const newsDelete = document.getElementById("newsDelete");
const newsHint = document.getElementById("newsHint");

function sortNews(items){
  // pinned 먼저, 그 다음 날짜 최신순(문자열 YYYY-MM-DD 전제)
  return items.sort((a, b) => {
    const ap = a.pinned ? 1 : 0;
    const bp = b.pinned ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
}

function renderNewsTable(){
  if (!newsTbody) return;
  sortNews(newsItems);

  newsTbody.innerHTML = newsItems.map((n, idx) => {
    const pin = n.pinned ? `<span class="badge pin">PIN</span>` : `<span class="badge">-</span>`;
    const tag = n.tag ? `<span class="badge">#${escapeHtml(n.tag)}</span>` : `<span class="muted">-</span>`;
    return `
      <tr>
        <td>${escapeHtml(n.date || "")}</td>
        <td>
          <div style="font-weight:900;">${escapeHtml(n.title || "")}</div>
          <div class="muted" style="margin-top:4px;">id: ${escapeHtml(String(n.id || ""))}</div>
        </td>
        <td>${tag}</td>
        <td>${pin}</td>
        <td>
          <button class="btn small" type="button" data-edit-news="${idx}">편집</button>
        </td>
      </tr>
    `;
  }).join("");

  newsTbody.querySelectorAll("[data-edit-news]").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-edit-news"));
      loadNewsToEditor(i);
    });
  });
}

function loadNewsToEditor(index){
  currentNewsIndex = index;
  const n = newsItems[index];
  if (!n) return;

  news_id.value = String(n.id || "");
  news_date.value = String(n.date || "");
  news_tag.value = String(n.tag || "");
  news_title.value = String(n.title || "");
  news_summary.value = String(n.summary || "");
  news_content.value = String(n.content || "");
  news_pinned.checked = !!n.pinned;

  if (newsHint) newsHint.textContent = `편집 중: ${n.id}`;
}

function clearNewsEditor(){
  currentNewsIndex = -1;
  news_id.value = safeId();
  news_date.value = "";
  news_tag.value = "";
  news_title.value = "";
  news_summary.value = "";
  news_content.value = "";
  news_pinned.checked = false;
  if (newsHint) newsHint.textContent = "새 공지 작성 중";
}

function upsertNewsFromEditor(){
  const obj = {
    id: String(news_id.value || "").trim(),
    date: String(news_date.value || "").trim(),
    title: String(news_title.value || "").trim(),
    summary: String(news_summary.value || "").trim(),
    content: String(news_content.value || "").trim(),
    tag: String(news_tag.value || "").trim(),
    pinned: !!news_pinned.checked
  };

  if (!obj.id) return alert("ID는 필수입니다.");
  if (!obj.date) return alert("날짜(YYYY-MM-DD)는 필수입니다.");
  if (!obj.title) return alert("제목은 필수입니다.");

  // 빈 값 정리
  if (!obj.tag) delete obj.tag;
  if (!obj.summary) delete obj.summary;

  // ID 중복 체크 (자기 자신 제외)
  const dup = newsItems.find((x, i) => String(x.id) === obj.id && i !== currentNewsIndex);
  if (dup) return alert("같은 ID가 이미 있습니다. ID를 바꿔주세요.");

  if (currentNewsIndex >= 0) newsItems[currentNewsIndex] = obj;
  else newsItems.push(obj);

  renderNewsTable();
  loadNewsToEditor(newsItems.findIndex(x => String(x.id) === obj.id));
  setStatus("공지 저장됨(다운로드 후 업로드 필요)");
}

function deleteCurrentNews(){
  if (currentNewsIndex < 0) return alert("삭제할 공지를 선택하세요.");
  const n = newsItems[currentNewsIndex];
  if (!confirm(`삭제할까요?\n\n${n.title}\n(${n.id})`)) return;
  newsItems.splice(currentNewsIndex, 1);
  renderNewsTable();
  clearNewsEditor();
  setStatus("공지 삭제됨(다운로드 후 업로드 필요)");
}

async function loadNews(){
  try{
    setStatus("공지 불러오는 중...");
    const items = await fetchJson("../data/news.json");
    newsItems = Array.isArray(items) ? items : [];
    renderNewsTable();
    clearNewsEditor();
    setStatus("공지 로드 완료");
  }catch(e){
    console.error(e);
    alert("data/news.json을 불러오지 못했습니다.\n정적 호스팅 환경에서 열어야 합니다.");
    setStatus("공지 로드 실패");
  }
}

newsReload?.addEventListener("click", loadNews);
newsAdd?.addEventListener("click", clearNewsEditor);
newsSave?.addEventListener("click", upsertNewsFromEditor);
newsDelete?.addEventListener("click", deleteCurrentNews);
newsDownload?.addEventListener("click", () => {
  sortNews(newsItems);
  downloadJson("news.json", newsItems);
  setStatus("news.json 다운로드 완료");
});

// ===========================
// REVIEWS (data/reviews.json)
// ===========================
let reviewsData = { posters: [], certTop: [], certBottom: [] };

const reviewsReload = document.getElementById("reviewsReload");
const posterAdd = document.getElementById("posterAdd");
const reviewsDownload = document.getElementById("reviewsDownload");

const posterList = document.getElementById("posterList");
const certTopList = document.getElementById("certTopList");
const certBottomList = document.getElementById("certBottomList");

const certTopAdd = document.getElementById("certTopAdd");
const certBottomAdd = document.getElementById("certBottomAdd");

function renderPosterList(){
  if (!posterList) return;
  const posters = reviewsData.posters || [];

  posterList.innerHTML = posters.map((p, idx) => {
    return `
      <div style="border:1px solid rgba(0,0,0,.10); border-radius:14px; padding:12px; margin-top:10px;">
        <div class="row space">
          <div style="font-weight:900;">포스터 ${idx+1} <span class="muted">(id: ${escapeHtml(p.id||"")})</span></div>
          <div class="row">
            <button class="btn small" type="button" data-p-up="${idx}">↑</button>
            <button class="btn small" type="button" data-p-down="${idx}">↓</button>
            <button class="btn small danger" type="button" data-p-del="${idx}">삭제</button>
          </div>
        </div>

        <div class="cols3" style="margin-top:10px;">
          <div>
            <label>id</label>
            <input data-p="id" data-i="${idx}" value="${escapeAttr(p.id||"")}" />
          </div>
          <div>
            <label>year</label>
            <input data-p="year" data-i="${idx}" value="${escapeAttr(p.year||"")}" />
          </div>
          <div>
            <label>category(선택)</label>
            <input data-p="category" data-i="${idx}" value="${escapeAttr(p.category||"")}" placeholder="예: 한예종, 서울예대..." />
          </div>
        </div>

        <div class="cols" style="margin-top:10px;">
          <div>
            <label>mid</label>
            <input data-p="mid" data-i="${idx}" value="${escapeAttr(p.mid||"")}" />
          </div>
          <div>
            <label>bottom</label>
            <input data-p="bottom" data-i="${idx}" value="${escapeAttr(p.bottom||"")}" />
          </div>
        </div>

        <div class="cols" style="margin-top:10px;">
          <div>
            <label>image</label>
            <input data-p="image" data-i="${idx}" value="${escapeAttr(p.image||"")}" placeholder="images/placeholder.svg" />
          </div>
          <div>
            <label>link(선택)</label>
            <input data-p="link" data-i="${idx}" value="${escapeAttr(p.link||"#")}" placeholder="후기 상세 URL 또는 #" />
          </div>
        </div>
      </div>
    `;
  }).join("");

  // input change -> update model
  posterList.querySelectorAll("input[data-p]").forEach(inp => {
    inp.addEventListener("input", () => {
      const i = Number(inp.getAttribute("data-i"));
      const key = inp.getAttribute("data-p");
      if (!reviewsData.posters[i]) return;
      reviewsData.posters[i][key] = inp.value;
    });
  });

  // reorder / delete
  posterList.querySelectorAll("[data-p-up]").forEach(b => b.addEventListener("click", () => moveItem(reviewsData.posters, Number(b.dataset.pUp), -1, renderPosterList)));
  posterList.querySelectorAll("[data-p-down]").forEach(b => b.addEventListener("click", () => moveItem(reviewsData.posters, Number(b.dataset.pDown), +1, renderPosterList)));
  posterList.querySelectorAll("[data-p-del]").forEach(b => b.addEventListener("click", () => {
    const i = Number(b.dataset.pDel);
    if (!confirm("삭제할까요?")) return;
    reviewsData.posters.splice(i, 1);
    renderPosterList();
  }));
}

function renderCertList(targetEl, arr, addBtnLabel){
  if (!targetEl) return;
  targetEl.innerHTML = (arr || []).map((c, idx) => `
    <div style="border:1px solid rgba(0,0,0,.10); border-radius:14px; padding:12px; margin-top:10px;">
      <div class="row space">
        <div style="font-weight:900;">${addBtnLabel} ${idx+1}</div>
        <div class="row">
          <button class="btn small" type="button" data-c-up="${idx}">↑</button>
          <button class="btn small" type="button" data-c-down="${idx}">↓</button>
          <button class="btn small danger" type="button" data-c-del="${idx}">삭제</button>
        </div>
      </div>
      <div class="cols" style="margin-top:10px;">
        <div>
          <label>image</label>
          <input data-c="image" data-i="${idx}" value="${escapeAttr(c.image||"")}" placeholder="images/placeholder.svg" />
        </div>
        <div>
          <label>alt</label>
          <input data-c="alt" data-i="${idx}" value="${escapeAttr(c.alt||"")}" placeholder="통지서 설명" />
        </div>
      </div>
    </div>
  `).join("");

  targetEl.querySelectorAll("input[data-c]").forEach(inp => {
    inp.addEventListener("input", () => {
      const i = Number(inp.getAttribute("data-i"));
      const key = inp.getAttribute("data-c");
      if (!arr[i]) return;
      arr[i][key] = inp.value;
    });
  });

  targetEl.querySelectorAll("[data-c-up]").forEach(b => b.addEventListener("click", () => {
    moveItem(arr, Number(b.dataset.cUp), -1, () => renderReviewsLists());
  }));
  targetEl.querySelectorAll("[data-c-down]").forEach(b => b.addEventListener("click", () => {
    moveItem(arr, Number(b.dataset.cDown), +1, () => renderReviewsLists());
  }));
  targetEl.querySelectorAll("[data-c-del]").forEach(b => b.addEventListener("click", () => {
    const i = Number(b.dataset.cDel);
    if (!confirm("삭제할까요?")) return;
    arr.splice(i, 1);
    renderReviewsLists();
  }));
}

function renderReviewsLists(){
  renderPosterList();
  renderCertList(certTopList, reviewsData.certTop, "윗줄");
  renderCertList(certBottomList, reviewsData.certBottom, "아랫줄");
}

function moveItem(arr, index, delta, cb){
  const to = index + delta;
  if (to < 0 || to >= arr.length) return;
  const [item] = arr.splice(index, 1);
  arr.splice(to, 0, item);
  cb?.();
}

async function loadReviews(){
  try{
    setStatus("후기 불러오는 중...");
    const data = await fetchJson("../data/reviews.json");
    reviewsData = {
      posters: Array.isArray(data.posters) ? data.posters : [],
      certTop: Array.isArray(data.certTop) ? data.certTop : [],
      certBottom: Array.isArray(data.certBottom) ? data.certBottom : []
    };
    renderReviewsLists();
    setStatus("후기 로드 완료");
  }catch(e){
    console.error(e);
    alert("data/reviews.json을 불러오지 못했습니다.\n정적 호스팅 환경에서 열어야 합니다.");
    setStatus("후기 로드 실패");
  }
}

posterAdd?.addEventListener("click", () => {
  reviewsData.posters.push({
    id: `r-${Date.now()}`,
    year: "2026",
    mid: "설명",
    bottom: "합격",
    image: "images/placeholder.svg",
    link: "#",
    category: "전체"
  });
  renderPosterList();
  setStatus("포스터 추가됨(다운로드 후 업로드 필요)");
});

certTopAdd?.addEventListener("click", () => {
  reviewsData.certTop.push({ image: "images/placeholder.svg", alt: "통지서" });
  renderReviewsLists();
  setStatus("통지서 추가됨(다운로드 후 업로드 필요)");
});
certBottomAdd?.addEventListener("click", () => {
  reviewsData.certBottom.push({ image: "images/placeholder.svg", alt: "통지서" });
  renderReviewsLists();
  setStatus("통지서 추가됨(다운로드 후 업로드 필요)");
});

reviewsReload?.addEventListener("click", loadReviews);
reviewsDownload?.addEventListener("click", () => {
  downloadJson("reviews.json", reviewsData);
  setStatus("reviews.json 다운로드 완료");
});

// ---- HTML escape ----
function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(s){ return escapeHtml(s); }

// ---- Init All ----
async function initAll(){
  activateTab("news");
  await loadNews();
  await loadReviews();
}

// ---- Boot ----
if (isAuthed()) {
  showAdmin();
  initAll();
} else {
  showLogin();
}
