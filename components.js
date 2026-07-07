// 공통 레이아웃: 헤더/푸터를 한 곳에서 관리합니다.
(() => {
  "use strict";

  const scriptSrc = document.currentScript?.getAttribute("src") || "";
  const root = scriptSrc.includes("../") ? "../" : "";
  const isHome = document.body.classList.contains("home-page");
  const homeHref = isHome ? "#top" : `${root}index.html#top`;

  const menu = [
    {
      en: "SIGNAL EDU",
      ko: "시그널에듀",
      href: `${root}signal-edu/`,
      children: [
        ["소개", `${root}signal-edu/#intro`],
        ["교육철학", `${root}signal-edu/#philosophy`],
        ["컨설턴트", `${root}signal-edu/#consultants`],
        ["오시는 길", `${root}signal-edu/#location`]
      ]
    },
    {
      en: "GUIDANCE",
      ko: "컨설팅 프로그램",
      href: `${root}consulting/`,
      children: [
        ["진로설계", `${root}consulting/#career`],
        ["진학설계", `${root}consulting/#pathway`],
        ["대입컨설팅", `${root}consulting/#admission`],
        ["학습검사·코칭", `${root}consulting/#coaching`]
      ]
    },
    {
      en: "AI CONNECTS",
      ko: "AI 커넥츠",
      href: `${root}ai-connects/`,
      children: [
        ["AI 커넥츠 소개", `${root}ai-connects/#overview`],
        ["중학교 성적분석", `${root}ai-connects/#middle-score`],
        ["고등학교 학생부 관리", `${root}ai-connects/#student-record`],
        ["문해력·언어사전", `${root}ai-connects/#literacy`],
        ["학생 분석", `${root}ai-connects/#student-analysis`]
      ]
    },
    {
      en: "PARTNERSHIPS",
      ko: "학교·기관 연계",
      href: `${root}partnerships/`,
      children: [
        ["학교 프로그램", `${root}partnerships/#school-program`],
        ["기관 프로그램", `${root}partnerships/#institution-program`],
        ["학부모 특강", `${root}partnerships/#parent-lecture`],
        ["교육행사 운영", `${root}partnerships/#event-operation`],
        ["제휴 문의", `${root}partnerships/#partnership-inquiry`]
      ]
    },
    {
      en: "PORTFOLIO",
      ko: "포트폴리오",
      href: `${root}stories/`,
      children: [
        ["합격소식", `${root}stories/#acceptance-news`],
        ["활동 갤러리", `${root}stories/#activity-gallery`]
      ]
    },
    {
      en: "NEWS & CONTACT",
      ko: "상담·소식",
      href: `${root}news-contact/`,
      cta: true,
      children: [
        ["공지사항", `${root}news-contact/#notice`],
        ["상담 안내", `${root}news-contact/#consultation`],
        ["오시는 길", `${root}news-contact/#location`]
      ]
    }
  ];

  function renderHeader() {
    return `
      <header class="header" role="banner">
        <div class="container header-inner">
          <a class="brand" href="${homeHref}" aria-label="시그널에듀케이션 홈">
            <img class="brand-textlogo" src="${root}images/text-logo.svg" alt="SIGNAL EDUCATION" onerror="this.style.display='none'">
          </a>

          <nav class="nav nav-bilingual nav-dropdowns" aria-label="주요 메뉴">
            ${menu.map(item => `
              <div class="nav-group${item.cta ? " nav-group-cta" : ""}">
                <a href="${item.href}" class="nav-item${item.cta ? " nav-cta" : ""}">
                  <span class="nav-en">${item.en}</span>
                  <span class="nav-ko">${item.ko}</span>
                </a>
                <div class="nav-dropdown" aria-label="${item.ko} 하위메뉴">
                  ${item.children.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
                </div>
              </div>
            `).join("")}
          </nav>

          <button class="nav-toggle" id="navToggle" aria-label="메뉴 열기" aria-expanded="false" type="button">
            <span></span><span></span><span></span>
          </button>

          <div class="mobile-drawer" id="mobileDrawer" aria-hidden="true"></div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    return `
      <footer class="site-footer" aria-label="사이트 푸터">
        <div class="container f-inner">
          <nav class="f-topnav" aria-label="Footer links">
            <a href="${root}news-contact/#notice">공지사항</a>
            <a href="${root}news-contact/#consultation">상담 안내</a>
            <a href="#top">위로</a>
          </nav>

          <hr class="f-divider" />

          <div class="f-main">
            <div class="f-left">
              <div class="f-brand">
                <img class="f-textlogo" src="${root}images/text-logo.png" alt="Signal Education" onerror="this.style.display='none'">
              </div>

              <div class="f-company">
                <p><b>상호</b> 시그널 에듀케이션 <span class="f-sep">|</span> <b>대표자</b> 이강우 <span class="f-sep">|</span> <b>사업자 등록번호</b> 361-13-02937</p>
                <p><b>주소</b> 광주 서구 유림로 98번길 49, 4층 <span class="f-sep">|</span> <b>대표전화</b> 010-6591-9592 <span class="f-sep">|</span> <b>이메일</b> signal@jnu.ac.kr</p>
              </div>

              <div class="f-legal">
                <p class="f-copy">Copyright © 2021 Signal Education. All Rights Reserved.</p>
                <p class="f-policy"><a href="#">이용약관</a> | <a href="#">개인정보처리방침</a></p>
              </div>
            </div>

            <aside class="f-right" aria-label="고객센터">
              <div class="f-cs-title">CUSTOMER CENTER</div>
              <div class="f-cs-phone">070.7954.6105</div>

              <dl class="f-cs-hours">
                <div class="f-row"><dt class="f-tag">상담시간</dt><dd>오전 10:00 ~ 오후 06:00</dd></div>
                <div class="f-row"><dt class="f-tag">점심시간</dt><dd>오후 12:00 ~ 오후 1:30</dd></div>
                <div class="f-row"><dt class="f-tag">휴무안내</dt><dd>토 / 일 / 공휴일 휴무</dd></div>
              </dl>
            </aside>
          </div>
        </div>
      </footer>
    `;
  }

  document.getElementById("site-header")?.replaceWith(document.createRange().createContextualFragment(renderHeader()));
  document.getElementById("site-footer")?.replaceWith(document.createRange().createContextualFragment(renderFooter()));
})();
