// =========================
// main.js (정비 완료 + about 무한롤링 추가)
// =========================
(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function safeJsonParse(text) {
    try { return JSON.parse(text); } catch { return null; }
  }

  function getRootPath() {
    const scriptSrc = document.querySelector('script[src$="main.js"]')?.getAttribute("src") || "";
    return scriptSrc.includes("../") ? "../" : "";
  }

  // ---------- Mobile Nav ----------
  function initMobileNav() {
    const navToggle = $("#navToggle");
    const mobileDrawer = $("#mobileDrawer");
    const desktopGroups = $$(".nav-dropdowns .nav-group");
    if (!navToggle || !mobileDrawer) return;

    function buildMobileDrawer() {
      if (!desktopGroups.length) return;
      mobileDrawer.innerHTML = "";

      desktopGroups.forEach((group, index) => {
        const mainLink = $(":scope > .nav-item", group);
        const subLinks = $$(":scope .nav-dropdown a", group);
        if (!mainLink) return;

        const section = document.createElement("div");
        section.className = "mobile-nav-section" + (index === desktopGroups.length - 1 ? " mobile-nav-section-cta" : "");

        const heading = document.createElement("div");
        heading.className = "mobile-nav-heading";

        const titleLink = document.createElement("a");
        titleLink.href = mainLink.getAttribute("href") || "#";
        titleLink.className = "mobile-nav-title" + (mainLink.classList.contains("nav-cta") ? " nav-cta" : "");
        titleLink.textContent = mainLink.querySelector('.nav-ko')?.textContent?.trim() || mainLink.textContent.trim();

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "mobile-nav-trigger";
        trigger.setAttribute("aria-label", `${titleLink.textContent} 하위메뉴 열기`);

        const panel = document.createElement("div");
        panel.className = "mobile-nav-panel";

        subLinks.forEach((link) => {
          const cloned = link.cloneNode(true);
          panel.appendChild(cloned);
        });

        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = section.classList.contains("is-open");
          $$(".mobile-nav-section", mobileDrawer).forEach(el => el.classList.remove("is-open"));
          if (!isOpen) section.classList.add("is-open");
        });

        heading.appendChild(titleLink);
        heading.appendChild(trigger);
        section.appendChild(heading);
        section.appendChild(panel);
        mobileDrawer.appendChild(section);
      });

      $$("a", mobileDrawer).forEach(a => a.addEventListener("click", closeDrawer));
    }

    function closeDrawer() {
      mobileDrawer.style.display = "none";
      mobileDrawer.setAttribute("aria-hidden", "true");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("mobile-nav-open");
      $$(".mobile-nav-section", mobileDrawer).forEach(el => el.classList.remove("is-open"));
    }

    function openDrawer() {
      mobileDrawer.style.display = "block";
      mobileDrawer.setAttribute("aria-hidden", "false");
      navToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("mobile-nav-open");
    }

    buildMobileDrawer();

    const headerInner = navToggle.closest(".header-inner");
    let hoverCloseTimer = null;

    function cancelHoverClose() {
      if (hoverCloseTimer) clearTimeout(hoverCloseTimer);
    }

    function scheduleHoverClose() {
      cancelHoverClose();
      hoverCloseTimer = setTimeout(() => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        if (expanded) closeDrawer();
      }, 140);
    }

    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.innerWidth > 900;
    if (supportsHover) {
      navToggle.addEventListener("mouseenter", openDrawer);
      navToggle.addEventListener("focus", openDrawer);
      navToggle.addEventListener("mouseleave", scheduleHoverClose);
      mobileDrawer.addEventListener("mouseenter", cancelHoverClose);
      mobileDrawer.addEventListener("mouseleave", scheduleHoverClose);
      headerInner?.addEventListener("mouseleave", scheduleHoverClose);
    }

    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      expanded ? closeDrawer() : openDrawer();
    });

    mobileDrawer.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeDrawer();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });
  }

  function initDesktopMegaMenu() {
    const nav = document.querySelector('.nav-dropdowns');
    const headerInner = document.querySelector('.header-inner');
    if (!nav || !headerInner) return;

    const groups = Array.from(nav.querySelectorAll('.nav-group'));
    if (!groups.length) return;

    const oldPanel = headerInner.querySelector('.nav-mega-panel');
    if (oldPanel) oldPanel.remove();

    const panel = document.createElement('div');
    panel.className = 'nav-mega-panel';
    panel.setAttribute('aria-hidden', 'true');

    const grid = document.createElement('div');
    grid.className = 'nav-mega-grid';

    groups.forEach((group) => {
      const subLinks = Array.from(group.querySelectorAll(':scope .nav-dropdown a'));
      const col = document.createElement('div');
      col.className = 'nav-mega-column';

      const linksWrap = document.createElement('div');
      linksWrap.className = 'nav-mega-links';
      subLinks.forEach((link) => linksWrap.appendChild(link.cloneNode(true)));
      col.appendChild(linksWrap);
      grid.appendChild(col);
    });

    panel.appendChild(grid);
    headerInner.appendChild(panel);

    function layoutColumns() {
      if (window.innerWidth <= 900) return;
      const gridRect = grid.getBoundingClientRect();
      const columns = Array.from(grid.children);
      let maxHeight = 0;

      grid.style.width = '100%';
      grid.style.maxWidth = '100%';
      grid.style.marginLeft = '0';

      columns.forEach((col, index) => {
        const groupRect = groups[index].getBoundingClientRect();
        const center = groupRect.left + (groupRect.width / 2) - gridRect.left;
        col.style.left = `${Math.round(center)}px`;
        col.style.width = 'max-content';
        col.style.maxWidth = '220px';
      });

      requestAnimationFrame(() => {
        columns.forEach((col) => {
          maxHeight = Math.max(maxHeight, col.offsetHeight);
        });
        grid.style.minHeight = `${maxHeight}px`;
      });
    }

    function openPanel() {
      if (window.innerWidth <= 900) return;
      layoutColumns();
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-mega-open');
    }

    function closePanel() {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-mega-open');
    }

    nav.addEventListener('mouseenter', openPanel);
    nav.addEventListener('focusin', openPanel);
    headerInner.addEventListener('mouseleave', closePanel);
    panel.addEventListener('mouseenter', openPanel);
    panel.addEventListener('mouseleave', closePanel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 900) closePanel();
      else layoutColumns();
    });

    layoutColumns();
  }

  // ---------- Smooth Anchor ----------
  function initSmoothAnchor() {
    // nav / drawer / footer 등에서 #링크만 부드럽게 이동
    const anchors = $$('a[href^="#"], a[href^="index.html#"]');
    anchors.forEach(a => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href) return;

        // index.html#xxx 형태도 지원
        const hashIndex = href.indexOf("#");
        if (hashIndex < 0) return;

        const hash = href.slice(hashIndex); // "#contact"
        if (hash === "#") return;

        const el = $(hash);
        if (!el) return; // 해당 섹션이 없으면 기본 동작 유지

        // 같은 페이지 내 이동일 때만 스무스 적용
        // (index.html#contact 는 index에서만 의미 있음)
        if (href.startsWith("index.html#") && !(/(?:index\.html)?$/.test(location.pathname))) {
          // 다른 페이지에서는 index로 이동해야 하므로 기본 동작
          return;
        }

        e.preventDefault();
        const headerH = 80;
        const y = el.getBoundingClientRect().top + window.scrollY - headerH + 1;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  }

  // ---------- Hero Slider ----------
  function initHeroSlider() {
    const track = $("#heroTrack");
    if (!track) return;

    const slides = Array.from(track.children);
    const prevBtn = $("#heroPrev");
    const nextBtn = $("#heroNext");
    const dotsWrap = $("#heroDots");

    let currentIndex = 0;
    let intervalId = null;
    let isDragging = false;
    let startX = 0;
    let currentTranslatePx = 0;

    function setTranslateByIndex(index, animate = true) {
      const x = -index * 100;
      track.style.transition = animate ? "transform 700ms cubic-bezier(.2,.8,.2,1)" : "none";
      track.style.transform = `translateX(${x}%)`;
    }

    function updateDots(index) {
      if (!dotsWrap) return;
      $$("#heroDots button").forEach((d, i) => d.classList.toggle("is-active", i === index));
    }

    function createDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `${i + 1}번 슬라이드`);
        if (i === 0) dot.classList.add("is-active");
        dot.addEventListener("click", () => {
          currentIndex = i;
          setTranslateByIndex(currentIndex, true);
          updateDots(currentIndex);
          restartAutoSlide();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function nextSlide() {
      if (slides.length <= 1) return;
      currentIndex = (currentIndex + 1) % slides.length;
      setTranslateByIndex(currentIndex, true);
      updateDots(currentIndex);
    }

    function prevSlide() {
      if (slides.length <= 1) return;
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      setTranslateByIndex(currentIndex, true);
      updateDots(currentIndex);
    }

    function startAutoSlide() {
      if (slides.length <= 1) return;
      intervalId = setInterval(nextSlide, 4500);
    }

    function restartAutoSlide() {
      if (intervalId) clearInterval(intervalId);
      startAutoSlide();
    }

    if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); restartAutoSlide(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); restartAutoSlide(); });

    // 드래그/스와이프
    function pointerDown(e) {
      isDragging = true;
      startX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
      track.style.transition = "none";
      currentTranslatePx = -currentIndex * window.innerWidth;
    }

    function pointerMove(e) {
      if (!isDragging) return;
      const x = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
      const dx = x - startX;
      const translatePx = currentTranslatePx + dx;
      track.style.transform = `translateX(${translatePx}px)`;
    }

    function pointerUp(e) {
      if (!isDragging) return;
      isDragging = false;

      const endX = e.type.includes("mouse")
        ? e.pageX
        : (e.changedTouches ? e.changedTouches[0].clientX : startX);

      const dx = endX - startX;
      const threshold = 80;

      if (dx < -threshold) nextSlide();
      else if (dx > threshold) prevSlide();
      else {
        setTranslateByIndex(currentIndex, true);
        updateDots(currentIndex);
      }
      restartAutoSlide();
    }

    // 이미지 드래그 방지
    track.addEventListener("dragstart", e => e.preventDefault());

    track.addEventListener("touchstart", pointerDown, { passive: true });
    track.addEventListener("touchmove", pointerMove, { passive: true });
    track.addEventListener("touchend", pointerUp);

    track.addEventListener("mousedown", pointerDown);
    window.addEventListener("mousemove", pointerMove);
    window.addEventListener("mouseup", pointerUp);

    window.addEventListener("resize", () => setTranslateByIndex(currentIndex, false));

    // Init
    if (slides.length > 0) {
      createDots();
      setTranslateByIndex(currentIndex, false);
      updateDots(currentIndex);
      startAutoSlide();
    }
  }

  // ---------- Hero Text Rotator (Index: video hero) ----------
  // Rotates only the copy blocks (.hero-text) while the background video stays fixed.
  function initHeroTextRotator() {
    const slides = $$(".hero-text");
    if (!slides || slides.length <= 1) return;

    // able-edu.com 스타일 페이지 표기(1 / N)
    const pageCurrent = $("#heroPageCurrent");
    const pageTotal = $("#heroPageTotal");
    if (pageTotal) pageTotal.textContent = String(slides.length);

    let idx = 0;
    const intervalMs = 5000; // 5s per copy (10s video -> 2 copies)

    // Ensure exactly one starts active
    slides.forEach((el, i) => el.classList.toggle("is-active", i === 0));
    if (pageCurrent) pageCurrent.textContent = "1";

    setInterval(() => {
      const current = slides[idx];
      // animate the current copy out to the left
      current.classList.remove("is-active");
      current.classList.add("is-exit-left");

      idx = (idx + 1) % slides.length;
      const next = slides[idx];
      next.classList.add("is-active");

      if (pageCurrent) pageCurrent.textContent = String(idx + 1);

      // clean up the exit class after the CSS transition completes
      window.setTimeout(() => current.classList.remove("is-exit-left"), 650);
    }, intervalMs);
  }

  // ---------- Home News (3 items) ----------
  async function fetchNewsItems() {
    const res = await fetch(`${getRootPath()}data/news.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`news.json HTTP ${res.status}`);
    const text = await res.text();
    const items = safeJsonParse(text);
    if (!Array.isArray(items)) throw new Error("news.json is not array");

    // pinned 먼저, 그 다음 날짜 최신순
    return items.sort((a, b) => {
      const ap = a && a.pinned ? 1 : 0;
      const bp = b && b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return String(b?.date || "").localeCompare(String(a?.date || ""));
    });
  }

  function renderNewsItems(items, detailPrefix) {
    return items.map(n => {
      const id = encodeURIComponent(n?.id ?? "");
      const date = String(n?.date ?? "");
      const title = String(n?.title ?? "");
      const summary = String(n?.summary ?? "");
      const tag = String(n?.tag ?? "");
      return `
        <a class="news-item" href="${detailPrefix}news-detail.html?id=${id}">
          <span class="news-date">${date}</span>
          <span class="news-title-wrap">
            <span class="news-title">${title}</span>
            ${summary ? `<span class="news-summary">${summary}</span>` : ""}
          </span>
          ${tag ? `<span class="news-tag">${tag}</span>` : ""}
        </a>
      `;
    }).join("");
  }

  async function loadNewsHome() {
    const wrap = $("#newsHomeList");
    if (!wrap) return;

    try {
      const items = await fetchNewsItems();
      wrap.innerHTML = renderNewsItems(items.slice(0, 3), "news-contact/");
    } catch (err) {
      // 실패 시에도 레이아웃은 깔끔하게 유지
      wrap.innerHTML = `
        <div class="news-item" role="status" aria-live="polite">
          <span class="news-date">-</span>
          <span class="news-title">공지 목록을 불러오지 못했습니다. (news.json 확인)</span>
        </div>
      `;
      console.error(err);
    }
  }

  async function loadNewsList() {
    const wrap = $("#newsList");
    const error = $("#newsError");
    if (!wrap) return;

    try {
      const items = await fetchNewsItems();
      wrap.innerHTML = renderNewsItems(items, "");
      if (error) error.style.display = "none";
    } catch (err) {
      if (error) error.style.display = "block";
      console.error(err);
    }
  }

  // ---------- Footer year ----------
  function setFooterYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  // ---------- People Marquee (About: infinite roll) ----------
  function initPeopleMarquee() {
    const track = $("#peopleTrack");
    if (!track) return;

    // 중복 방지
    if (track.dataset.duplicated === "true") return;

    const items = Array.from(track.children);
    if (items.length === 0) return;

    // 한 세트 복제해서 뒤에 붙임(끊김 제거)
    items.forEach((el) => {
      const clone = el.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    track.dataset.duplicated = "true";
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    initDesktopMegaMenu();
    initSmoothAnchor();
    initHeroSlider();
    initHeroTextRotator();
    loadNewsHome();
    loadNewsList();
    setFooterYear();
    initPeopleMarquee(); // ✅ about 팀 무한 롤링
    // ❌ initPageTransition()는 정의되어 있지 않으므로 호출 제거
  });
})();


// =========================
// Page Transition (FAST)
// - 링크 클릭 시 빠르게 덮고 이동
// =========================
(function () {
  const LEAVE_MS = 170; // 클릭 후 나가는 시간
  const ENTER_MS = 180; // 새 페이지에서 들어오는 시간

  function ensureLayer() {
    let layer = document.querySelector(".page-transition");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "page-transition";
      document.body.appendChild(layer);
    }
    return layer;
  }

  function enterAnimation() {
    const layer = ensureLayer();
    layer.classList.add("is-leaving"); // 살짝 덮고
    requestAnimationFrame(() => {
      layer.classList.remove("is-leaving");
      layer.classList.add("is-entering"); // 빠르게 투명
      setTimeout(() => layer.classList.remove("is-entering"), ENTER_MS);
    });
  }

  function shouldIgnoreLink(a) {
    if (!a) return true;
    const href = a.getAttribute("href") || "";
    if (!href) return true;
    if (href.startsWith("#")) return true; // 같은 페이지 앵커
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
    if (a.target === "_blank") return true;
    if (a.hasAttribute("download")) return true;
    if (a.getAttribute("rel")?.includes("external")) return true;

    // 외부링크 제외
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return true;
    } catch {
      return true;
    }
    return false;
  }

  function bindLeaveAnimation() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      if (shouldIgnoreLink(a)) return;

      e.preventDefault();
      const layer = ensureLayer();
      layer.classList.remove("is-entering");
      layer.classList.add("is-leaving");

      const href = a.getAttribute("href");
      setTimeout(() => {
        location.href = href;
      }, LEAVE_MS);
    });
  }

  // 뒤로가기/앞으로가기(bfcache) 대응
  window.addEventListener("pageshow", () => {
    enterAnimation();
  });

  document.addEventListener("DOMContentLoaded", () => {
    enterAnimation();
    bindLeaveAnimation();
  });
})();
/* ===== About: 프로젝트 실적 펼침/접기 ===== */
(() => {
  const btn = document.getElementById('aboutToggle');
  const panel = document.getElementById('aboutProjects');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.textContent = expanded ? '프로젝트 실적 보기 ↓' : '프로젝트 실적 접기 ↑';
    panel.hidden = expanded;
  });
})();

/* ===== Proof: 숫자 카운트업(스크롤 시 1회) ===== */
(() => {
  const counts = document.querySelectorAll('.count[data-count]');
  if (!counts.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (!Number.isFinite(target)) return;

    const duration = 900; // ms
    const start = performance.now();

    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const value = Math.floor(target * p);
      el.textContent = String(value);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        counts.forEach(animate);
        io.disconnect();
      }
    });
  }, { threshold: 0.25 });

  io.observe(counts[0]);
})();



// =========================
// Premium minimal motion: reveal-on-scroll
// =========================
(() => {
  const els = Array.from(document.querySelectorAll('.reveal'));
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach((el) => io.observe(el));
})();

// =========================
// Dynamic section: 1-minute quick check
// =========================
(() => {
  const root = document.getElementById('quick-check');
  if (!root) return;

  const rows = Array.from(root.querySelectorAll('.chip-row'));
  const resultWrap = root.querySelector('.result-box');
  const resultText = root.querySelector('#quickText');
  const badges = root.querySelector('#quickBadges');
  const resetBtn = root.querySelector('#quickReset');

  const state = { goal: null, stage: null, style: null };

  function setSelected(row, btn) {
    row.querySelectorAll('.chip').forEach((b) => b.classList.remove('is-selected'));
    btn.classList.add('is-selected');
  }

  function render() {
    const done = state.goal && state.stage && state.style;
    if (!done) {
      if (resultWrap) resultWrap.style.display = 'none';
      return;
    }

    const recs = [];
    // Simple premium recommendation logic
    if (state.goal.includes('진로')) recs.push('진로 설계');
    if (state.goal.includes('학습')) recs.push('학습 코칭');
    if (state.goal.includes('입시')) recs.push('진학 전략');

    if (state.style.includes('서류')) recs.push('서류·면접');
    if (state.style.includes('로드맵')) recs.push('로드맵 설계');
    if (state.style.includes('주간')) recs.push('주간 실행 체크');

    const unique = Array.from(new Set(recs)).slice(0, 3);

    const msg = `지금은 “${state.goal}” 중심으로 ${state.stage} 단계에 맞는 흐름을 먼저 잡는 게 좋아요. ` +
      `추천은 ${unique.join(' · ')} 입니다.`;

    if (resultText) resultText.textContent = msg;

    if (badges) {
      badges.innerHTML = unique.map((t) => `<span class="badge">${t}</span>`).join('');
    }

    if (resultWrap) resultWrap.style.display = 'block';
  }

  rows.forEach((row) => {
    row.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.chip');
      if (!btn) return;

      const key = row.getAttribute('data-q');
      state[key] = btn.textContent.trim();
      setSelected(row, btn);
      render();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      Object.keys(state).forEach((k) => (state[k] = null));
      rows.forEach((row) => row.querySelectorAll('.chip').forEach((b) => b.classList.remove('is-selected')));
      if (resultWrap) resultWrap.style.display = 'none';
    });
  }
})();

// =========================
// Home showcase slider
// =========================
(() => {
  const root = document.querySelector('.home-showcase');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.showcase-slide'));
  const prevBtn = root.querySelector('#showcasePrev');
  const nextBtn = root.querySelector('#showcaseNext');
  const dotsWrap = root.querySelector('#showcaseDots');
  const currentEl = root.querySelector('#showcaseCurrent');
  const totalEl = root.querySelector('#showcaseTotal');

  if (!slides.length) return;

  let index = 0;
  let timer = null;

  function format(n) {
    return String(n).padStart(2, '0');
  }

  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = slides.map((_, i) => (
      `<button class="showcase-dot ${i === index ? 'is-active' : ''}" data-index="${i}" aria-label="${i + 1}번 슬라이드"></button>`
    )).join('');
  }

  function render() {
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    if (currentEl) currentEl.textContent = format(index + 1);
    if (totalEl) totalEl.textContent = format(slides.length);
    renderDots();
  }

  function go(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    render();
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(() => go(index + 1), 5000);
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
  }

  prevBtn?.addEventListener('click', () => {
    go(index - 1);
    startAuto();
  });

  nextBtn?.addEventListener('click', () => {
    go(index + 1);
    startAuto();
  });

  dotsWrap?.addEventListener('click', (e) => {
    const btn = e.target.closest('.showcase-dot');
    if (!btn) return;
    go(Number(btn.dataset.index));
    startAuto();
  });

  root.addEventListener('mouseenter', stopAuto);
  root.addEventListener('mouseleave', startAuto);

  render();
  startAuto();
})();

// =========================
// ARTE-like home carousel
// =========================
(() => {
  const root = document.getElementById('arteCarousel');
  if (!root) return;

  const cards = Array.from(root.querySelectorAll('.arte-card'));
  const prevBtn = document.getElementById('artePrev');
  const nextBtn = document.getElementById('arteNext');
  const currentEl = document.getElementById('arteCurrent');
  const totalEl = document.getElementById('arteTotal');
  const labelEl = document.getElementById('arteSectionLabel');
  const descEl = document.getElementById('arteSectionDesc');

  let index = 0;
  let timer;

  function pad(n){ return String(n).padStart(2,'0'); }

  function render() {
    const total = cards.length;
    cards.forEach((card, i) => {
      card.classList.remove('is-prev2','is-prev','is-current','is-next','is-next2');
      const diff = (i - index + total) % total;
      if (diff === 0) card.classList.add('is-current');
      else if (diff === 1) card.classList.add('is-next');
      else if (diff === 2) card.classList.add('is-next2');
      else if (diff === total - 1) card.classList.add('is-prev');
      else if (diff === total - 2) card.classList.add('is-prev2');
      const isCurrent = diff === 0;
      card.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
      card.tabIndex = isCurrent ? 0 : -1;
    });

    if (currentEl) currentEl.textContent = pad(index + 1);
    if (totalEl) totalEl.textContent = pad(cards.length);
    if (labelEl) labelEl.textContent = cards[index].dataset.title || '';
    if (descEl) descEl.textContent = cards[index].dataset.desc || '';
  }

  function go(nextIndex) {
    index = (nextIndex + cards.length) % cards.length;
    render();
  }

  function start() {
    stop();
    timer = setInterval(() => go(index + 1), 5000);
  }

  function stop() {
    if (timer) clearInterval(timer);
  }

  prevBtn?.addEventListener('click', () => { go(index - 1); start(); });
  nextBtn?.addEventListener('click', () => { go(index + 1); start(); });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  render();
  start();
})();
