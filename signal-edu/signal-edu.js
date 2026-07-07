(function(){
  const profile = document.getElementById('consultantProfile');
  const grid = document.getElementById('consultantGrid');
  if (!profile || !grid) return;

  const STORAGE_KEY = 'signalEduConsultantStats.v1';
  const PAGE_SIZE = 8;
  const isConsultantAdmin = new URLSearchParams(window.location.search).get('consultantAdmin') === '1';

  const icons = {
    views: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    likes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.7a5.2 5.2 0 0 0-7.4 0L12 7.1l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-7.9a5.2 5.2 0 0 0 0-7.4Z"/></svg>',
    consults: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v10.8H8.5L4 20V5.5Z"/><path d="M8 9h8M8 12.5h5"/></svg>'
  };

  const closeButton = profile.querySelector('.signal-profile-close');
  const photo = profile.querySelector('.signal-profile-photo');
  const name = profile.querySelector('.signal-profile-name');
  const field = profile.querySelector('.signal-profile-field');
  const tags = profile.querySelector('.signal-profile-tags');
  const intro = profile.querySelector('.signal-profile-intro');
  const profileStats = Array.from(profile.querySelectorAll('[data-profile-stat]'));
  const detailName = profile.querySelector('.signal-profile-detail-name');
  const detailField = profile.querySelector('.signal-profile-detail-field');
  const detailJob = profile.querySelector('.signal-profile-detail-job');
  const detailDuty = profile.querySelector('.signal-profile-detail-duty');
  const detailEducation = profile.querySelector('.signal-profile-detail-education');
  const detailCareer = profile.querySelector('.signal-profile-detail-career');
  const cards = Array.from(grid.querySelectorAll('.signal-consultant-card'));
  const pagination = document.getElementById('consultantPagination');
  const pageNumbers = pagination ? pagination.querySelector('.signal-page-numbers') : null;
  const firstButton = pagination ? pagination.querySelector('[data-page-action="first"]') : null;
  const prevButton = pagination ? pagination.querySelector('[data-page-action="prev"]') : null;
  const nextButton = pagination ? pagination.querySelector('[data-page-action="next"]') : null;
  const lastButton = pagination ? pagination.querySelector('[data-page-action="last"]') : null;

  let currentPage = 1;
  let currentCard = null;

  function totalPages(){
    return Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  }

  function loadStats(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (error) { return {}; }
  }

  function saveStats(stats){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  function formatCount(value){
    const number = Number(value) || 0;
    if (number >= 1000) return (number / 1000).toFixed(number >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return String(number);
  }

  function getCardId(card){
    return card?.dataset.consultantId || card?.querySelector('h3')?.textContent?.trim() || 'consultant';
  }

  function getCardStats(card){
    const stats = loadStats();
    return stats[getCardId(card)] || { views: 0, likes: 0, consults: 0 };
  }

  function ensureStatIcons(scope){
    (scope || document).querySelectorAll('.signal-stat').forEach(button => {
      const type = button.dataset.stat || button.dataset.profileStat;
      const icon = button.querySelector('.signal-stat-icon');
      if (icon && icons[type]) icon.innerHTML = icons[type];
    });
  }

  function renderProfileStats(){
    if (!currentCard) return;
    const stats = getCardStats(currentCard);
    profileStats.forEach(button => {
      const type = button.dataset.profileStat;
      const count = button.querySelector('.signal-stat-count');
      if (count) count.textContent = formatCount(stats[type] || 0);
      if (type === 'consults') {
        button.classList.toggle('is-admin-enabled', isConsultantAdmin);
        button.title = isConsultantAdmin ? '상담수 올리기' : '관리자 모드에서만 올릴 수 있습니다';
      }
    });
  }

  function renderStats(){
    const stats = loadStats();
    cards.forEach(card => {
      const id = getCardId(card);
      const cardStats = stats[id] || { views: 0, likes: 0, consults: 0 };
      card.querySelectorAll('.signal-stat').forEach(button => {
        const type = button.dataset.stat;
        const count = button.querySelector('.signal-stat-count');
        if (count) count.textContent = formatCount(cardStats[type] || 0);
        if (type === 'consults') {
          button.classList.toggle('is-admin-enabled', isConsultantAdmin);
          button.title = isConsultantAdmin ? '상담수 올리기' : '관리자 모드에서만 올릴 수 있습니다';
        }
      });
    });
    renderProfileStats();
  }

  function increaseStat(card, type){
    if (!card || !type) return;
    if (type === 'consults' && !isConsultantAdmin) return;
    const stats = loadStats();
    const id = getCardId(card);
    stats[id] = stats[id] || { views: 0, likes: 0, consults: 0 };
    stats[id][type] = (Number(stats[id][type]) || 0) + 1;
    saveStats(stats);
    renderStats();
  }

  function renderLines(value){
    return (value || '')
      .split('|')
      .map(text => text.trim())
      .filter(Boolean)
      .map(text => `<span>${text}</span>`)
      .join('');
  }

  function openProfile(button){
    const data = button.dataset;
    const displayName = data.name || '컨설턴트';
    currentCard = button.closest('.signal-consultant-card');

    increaseStat(currentCard, 'views');
    const photoSrc = data.photo || '../images/placeholder.svg';
    const isPlaceholderPhoto = photoSrc.includes('placeholder.svg');
    photo.src = photoSrc;
    photo.alt = `${displayName} 상세 사진`;
    photo.closest('.signal-profile-photo-wrap')?.classList.toggle('is-placeholder', isPlaceholderPhoto);
    name.textContent = displayName;
    field.textContent = data.field || '';
    tags.innerHTML = (data.tags || data.field || '')
      .split('|')
      .map(text => text.trim())
      .filter(Boolean)
      .slice(0, 5)
      .map(text => `<span>${text}</span>`)
      .join('');
    intro.innerHTML = (data.intro || '')
      .split('|')
      .map(text => text.trim())
      .filter(Boolean)
      .map(text => `<p>${text}</p>`)
      .join('');
    detailName.textContent = displayName;
    detailField.textContent = data.field || '';
    detailJob.textContent = data.job || '교육 컨설턴트';
    detailDuty.textContent = data.duty || data.specialty || '';
    detailEducation.innerHTML = renderLines(data.education || '시그널에듀 전문 컨설턴트 과정');
    detailCareer.innerHTML = renderLines(data.career || data.duty || data.specialty || '학생 맞춤형 상담 및 교육 프로그램 운영');
    renderProfileStats();
    profile.hidden = false;
    document.body.classList.add('signal-profile-open');
    closeButton.focus({ preventScroll: true });
  }

  function closeProfile(){
    profile.hidden = true;
    currentCard = null;
    document.body.classList.remove('signal-profile-open');
  }

  function renderPageButtons(total, page){
    if (!pageNumbers) return;
    pageNumbers.innerHTML = '';
    for (let i = 1; i <= total; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `signal-page-number${i === page ? ' is-active' : ''}`;
      button.dataset.page = String(i);
      button.setAttribute('aria-label', `${i}페이지 보기`);
      if (i === page) button.setAttribute('aria-current', 'page');
      button.textContent = String(i);
      pageNumbers.appendChild(button);
    }
  }

  function renderPagination(){
    if (!pagination) return;
    const total = totalPages();
    if (cards.length <= PAGE_SIZE) {
      pagination.hidden = true;
      cards.forEach(card => { card.hidden = false; });
      return;
    }

    pagination.hidden = false;
    currentPage = Math.min(Math.max(1, currentPage), total);
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    cards.forEach((card, index) => {
      card.hidden = index < start || index >= end;
    });

    renderPageButtons(total, currentPage);
    if (firstButton) firstButton.disabled = currentPage <= 1;
    if (prevButton) prevButton.disabled = currentPage <= 1;
    if (nextButton) nextButton.disabled = currentPage >= total;
    if (lastButton) lastButton.disabled = currentPage >= total;
  }

  grid.addEventListener('click', event => {
    const photoButton = event.target.closest('.signal-consultant-photo');
    if (photoButton) {
      openProfile(photoButton);
      return;
    }
    const statButton = event.target.closest('.signal-stat');
    if (statButton) {
      const card = statButton.closest('.signal-consultant-card');
      increaseStat(card, statButton.dataset.stat);
    }
  });

  profile.addEventListener('click', event => {
    const statButton = event.target.closest('[data-profile-stat]');
    if (statButton && currentCard) {
      increaseStat(currentCard, statButton.dataset.profileStat);
    }
  });

  if (pagination) {
    pagination.addEventListener('click', event => {
      const pageBtn = event.target.closest('.signal-page-number');
      if (pageBtn) {
        currentPage = Number(pageBtn.dataset.page) || 1;
        closeProfile();
        renderPagination();
        document.getElementById('consultants')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const actionBtn = event.target.closest('[data-page-action]');
      if (!actionBtn) return;
      const total = totalPages();
      const action = actionBtn.dataset.pageAction;
      if (action === 'first') currentPage = 1;
      if (action === 'prev') currentPage = Math.max(1, currentPage - 1);
      if (action === 'next') currentPage = Math.min(total, currentPage + 1);
      if (action === 'last') currentPage = total;
      closeProfile();
      renderPagination();
      document.getElementById('consultants')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  closeButton.addEventListener('click', closeProfile);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !profile.hidden) closeProfile();
  });

  ensureStatIcons(document);
  renderStats();
  renderPagination();
})();
