// 공지 상세 페이지 전용 스크립트
(() => {
  "use strict";

function getQueryParam(name){
      const params = new URLSearchParams(location.search);
      return params.get(name);
    }

    function showNotFound(message){
      const titleEl = document.getElementById("newsTitle");
      const subEl = document.getElementById("newsSub");
      const cardEl = document.getElementById("newsCard");
      const nfEl = document.getElementById("newsNotFound");

      if (cardEl) cardEl.style.display = "none";
      if (nfEl) nfEl.hidden = false;

      if (titleEl) titleEl.textContent = "공지 상세";
      if (subEl) subEl.textContent = message;
      document.title = "공지 상세 | 시그널에듀케이션";
    }

    async function loadNewsDetail(){
      const id = getQueryParam("id");

      const titleEl = document.getElementById("newsTitle");
      const subEl = document.getElementById("newsSub");
      const dateEl = document.getElementById("newsDate");
      const tagEl = document.getElementById("newsTag");
      const bodyEl = document.getElementById("newsBody");

      if (!id){
        showNotFound("잘못된 접근입니다. (id가 없습니다)");
        return;
      }

      try{
        const res = await fetch("../data/news.json", { cache: "no-store" });
        if (!res.ok) throw new Error("news.json fetch failed");

        const items = await res.json();
        const found = items.find(n => String(n.id) === String(id));

        if (!found){
          showNotFound("해당 공지를 찾을 수 없습니다.");
          return;
        }

        // 화면 채우기
        const title = found.title || "공지 상세";
        const summary = found.summary || "공지 내용을 확인하세요.";
        const date = found.date || "";
        const tag = found.tag ? `#${found.tag}` : "";
        const content = found.content || "(내용이 없습니다)";

        if (titleEl) titleEl.textContent = title;
        if (subEl) subEl.textContent = summary;
        if (dateEl) dateEl.textContent = date;

        if (tagEl){
          if (tag){
            tagEl.hidden = false;
            tagEl.textContent = tag;
          } else {
            tagEl.hidden = true;
            tagEl.textContent = "";
          }
        }

        if (bodyEl) bodyEl.textContent = content;

        document.title = `${title} | 시그널에듀케이션`;

      } catch (err){
        showNotFound("공지 데이터를 불러오지 못했습니다.");
      }
    }

    function bindShareButton(){
      const shareBtn = document.getElementById("shareBtn");
      if (!shareBtn) return;

      shareBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(location.href);
          shareBtn.textContent = "복사 완료!";
          setTimeout(() => (shareBtn.textContent = "링크 복사"), 1200);
        } catch (e) {
          alert("복사에 실패했습니다. 주소를 직접 복사해주세요.");
        }
      });
    }

    // Init
    bindShareButton();
    loadNewsDetail();
})();
