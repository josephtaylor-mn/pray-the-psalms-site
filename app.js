/* ========================================
   PRAY THE PSALMS — Application Logic
   Multi-translation support (ESV default)
   ======================================== */

// --- State ---
let psalmsData = [];
let currentPsalm = null;
let currentVerseIndex = 0;
let showingAllVerses = false;
let currentFilter = 'All';
let currentTheme = 'dawn';
let currentTranslation = 'ESV';

const translations = [
  { id: 'ESV', name: 'English Standard Version', short: 'ESV', desc: 'Essentially literal, modern language' },
  { id: 'NIV', name: 'New International Version', short: 'NIV', desc: 'Balance of accuracy and readability' },
  { id: 'NLT', name: 'New Living Translation', short: 'NLT', desc: 'Thought-for-thought, very readable' },
  { id: 'NASB', name: 'New American Standard Bible', short: 'NASB', desc: 'Most literal modern translation' },
  { id: 'NKJV', name: 'New King James Version', short: 'NKJV', desc: 'Updated KJV language, formal' },
  { id: 'KJV', name: 'King James Version', short: 'KJV', desc: 'Classic, traditional language' },
];

const themes = [
  { id: 'dawn', name: 'Dawn', desc: 'Warm sunrise golden hour', gradient: 'linear-gradient(135deg, #FFF8E7, #8B6914, #B8860B)' },
  { id: 'forest', name: 'Forest', desc: 'Deep green forest peace', gradient: 'linear-gradient(135deg, #F0F5EC, #2D5016, #6B8E23)' },
  { id: 'ocean', name: 'Ocean', desc: 'Calm sea tranquil waters', gradient: 'linear-gradient(135deg, #ECF4F9, #1A4B6E, #4A90B8)' },
  { id: 'twilight', name: 'Twilight', desc: 'Purple dusk evening sky', gradient: 'linear-gradient(135deg, #F3EEF9, #4A2D6E, #9B6BC6)' },
  { id: 'night', name: 'Night', desc: 'Starry night peaceful dark', gradient: 'linear-gradient(135deg, #1A1A2E, #CDB87C, #D4A843)' },
];

const themeCategories = [
  'All', 'Trust', 'Praise', 'Lament', 'Thanksgiving', 'Wisdom',
  'Creation', 'Deliverance', 'Mercy', 'Joy', 'Hope',
  'Protection', 'Repentance', 'Sovereignty', 'Justice', 'Worship'
];

// --- Init ---
function init() {
  loadTranslation(currentTranslation);

  setGreeting();
  setTodaysDate();
  renderTodaysPsalms();
  renderFilterChips();
  renderBrowseList();
  renderThemeOptions();
  renderTranslationOptions();
  renderPsalmsChart();
  setupSwipeGestures();
}

function loadTranslation(translationId) {
  if (TRANSLATIONS_DATA && TRANSLATIONS_DATA[translationId]) {
    psalmsData = TRANSLATIONS_DATA[translationId];
    currentTranslation = translationId;
  }
}

// --- Psalms of the Day ---
function getPsalmsOfTheDay(day) {
  if (day === 31) return [119];
  const psalms = [];
  for (let i = 0; i < 5; i++) {
    const num = day + (i * 30);
    if (num <= 150) psalms.push(num);
  }
  return psalms;
}

function getPsalmByNumber(num) {
  return psalmsData.find(p => p.number === num) || psalmsData[0];
}

// --- Greeting ---
function setGreeting() {
  const hour = new Date().getHours();
  let text;
  if (hour < 12) text = 'Good morning — a new day to seek His face';
  else if (hour < 17) text = 'Good afternoon — pause and rest in His Word';
  else text = 'Good evening — quiet your soul before Him';
  document.getElementById('greeting').textContent = text;
}

function setTodaysDate() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('today-date').textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  document.getElementById('day-hint').textContent = `Day ${now.getDate()} — choose a psalm that speaks to your heart`;
}

// --- Today's Psalms ---
function renderTodaysPsalms() {
  const day = new Date().getDate();
  const psalmNums = getPsalmsOfTheDay(day);
  const container = document.getElementById('todays-psalms');
  container.innerHTML = '';

  psalmNums.forEach(num => {
    const psalm = getPsalmByNumber(num);
    if (!psalm) return;

    const card = document.createElement('div');
    card.className = 'psalm-card';
    card.onclick = () => openPrayer(num);
    card.innerHTML = `
      <div class="psalm-card-inner">
        <div class="psalm-card-number">${psalm.number}</div>
        <div class="psalm-card-body">
          <div class="psalm-card-title">${psalm.title}</div>
          <div class="psalm-card-theme">${psalm.theme}</div>
          ${psalm.verses.length > 0 ? `<div class="psalm-card-preview">${psalm.verses[0].text}</div>` : ''}
        </div>
        <svg class="psalm-card-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Prayer Screen ---
function openPrayer(psalmNumber) {
  currentPsalm = getPsalmByNumber(psalmNumber);
  currentVerseIndex = 0;
  showingAllVerses = false;

  document.getElementById('prayer-psalm-title').textContent = `Psalm ${currentPsalm.number}`;
  document.getElementById('prayer-psalm-subtitle').textContent = currentPsalm.title;
  document.getElementById('prayer-theme-badge').innerHTML = `<span>${currentPsalm.theme.toUpperCase()}</span>`;

  updateVerseDisplay();
  document.getElementById('single-verse-view').classList.add('active');
  document.getElementById('all-verses-view').classList.remove('active');

  showScreen('prayer');
}

function updateVerseDisplay() {
  if (!currentPsalm || currentPsalm.verses.length === 0) return;

  const verse = currentPsalm.verses[currentVerseIndex];
  const total = currentPsalm.verses.length;

  document.getElementById('verse-counter').textContent = `Verse ${verse.v} of ${total}  ·  ${currentTranslation}`;
  document.getElementById('verse-progress').style.width = `${((currentVerseIndex + 1) / total) * 100}%`;
  document.getElementById('verse-big-number').textContent = verse.v;
  document.getElementById('verse-text').textContent = verse.text;

  // Animate
  const display = document.getElementById('verse-display');
  display.style.animation = 'none';
  display.offsetHeight; // force reflow
  display.style.animation = 'verseIn 0.5s ease-out';

  // Button states
  document.getElementById('prev-btn').disabled = currentVerseIndex === 0;
  const nextBtn = document.getElementById('next-btn');
  const nextText = document.getElementById('next-btn-text');
  if (currentVerseIndex >= total - 1) {
    nextText.textContent = 'Amen';
    nextBtn.disabled = true;
  } else {
    nextText.textContent = 'Next Verse';
    nextBtn.disabled = false;
  }
}

function nextVerse() {
  if (currentPsalm && currentVerseIndex < currentPsalm.verses.length - 1) {
    currentVerseIndex++;
    updateVerseDisplay();
  }
}

function prevVerse() {
  if (currentPsalm && currentVerseIndex > 0) {
    currentVerseIndex--;
    updateVerseDisplay();
  }
}

function toggleView() {
  showingAllVerses = !showingAllVerses;

  if (showingAllVerses) {
    document.getElementById('single-verse-view').classList.remove('active');
    document.getElementById('all-verses-view').classList.add('active');
    renderAllVerses();
  } else {
    document.getElementById('all-verses-view').classList.remove('active');
    document.getElementById('single-verse-view').classList.add('active');
    updateVerseDisplay();
  }
}

function renderAllVerses() {
  if (!currentPsalm) return;
  const container = document.getElementById('all-verses-list');
  container.innerHTML = '';

  currentPsalm.verses.forEach((verse, index) => {
    const item = document.createElement('div');
    item.className = `all-verse-item${index === currentVerseIndex ? ' current' : ''}`;
    item.onclick = () => {
      currentVerseIndex = index;
      showingAllVerses = false;
      document.getElementById('all-verses-view').classList.remove('active');
      document.getElementById('single-verse-view').classList.add('active');
      updateVerseDisplay();
    };
    item.innerHTML = `
      <div class="all-verse-num">${verse.v}</div>
      <div class="all-verse-text">${verse.text}</div>
    `;
    container.appendChild(item);
  });
}

function openRandomPsalm() {
  const num = Math.floor(Math.random() * 150) + 1;
  openPrayer(num);
}

// --- Swipe Gestures ---
function setupSwipeGestures() {
  let touchStartX = 0;

  const verseDisplay = document.getElementById('verse-display');
  if (!verseDisplay) return;

  verseDisplay.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  verseDisplay.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) nextVerse();
      else prevVerse();
    }
  }, { passive: true });
}

// --- Browse Screen ---
function renderFilterChips() {
  const container = document.getElementById('filter-chips');
  container.innerHTML = '';

  themeCategories.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = `chip${cat === currentFilter ? ' active' : ''}`;
    chip.textContent = cat;
    chip.onclick = () => {
      currentFilter = cat;
      renderFilterChips();
      filterPsalms();
    };
    container.appendChild(chip);
  });
}

function filterPsalms() {
  const query = (document.getElementById('search-input').value || '').toLowerCase();
  let filtered = psalmsData;

  if (currentFilter !== 'All') {
    filtered = filtered.filter(p => p.theme === currentFilter);
  }

  if (query) {
    filtered = filtered.filter(p =>
      p.number.toString().includes(query) ||
      p.title.toLowerCase().includes(query) ||
      p.theme.toLowerCase().includes(query) ||
      p.verses.some(v => v.text.toLowerCase().includes(query))
    );
  }

  renderBrowseList(filtered);
}

function renderBrowseList(psalms) {
  if (!psalms) psalms = psalmsData;
  const container = document.getElementById('browse-list');
  const count = document.getElementById('results-count');
  count.textContent = `${psalms.length} psalm${psalms.length === 1 ? '' : 's'}`;
  container.innerHTML = '';

  psalms.forEach(psalm => {
    const item = document.createElement('div');
    item.className = 'browse-item';
    item.onclick = () => openPrayer(psalm.number);
    item.innerHTML = `
      <div class="browse-item-num">${psalm.number}</div>
      <div class="browse-item-body">
        <div class="browse-item-title">${psalm.title}</div>
        <div class="browse-item-meta">${psalm.verses.length} verses · ${psalm.theme}</div>
      </div>
      <svg class="browse-item-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
    `;
    container.appendChild(item);
  });
}

// --- Settings: Translation ---
function renderTranslationOptions() {
  const container = document.getElementById('translation-options');
  container.innerHTML = '';

  translations.forEach(trans => {
    const option = document.createElement('div');
    option.className = `theme-option${trans.id === currentTranslation ? ' active' : ''}`;
    option.onclick = () => setTranslation(trans.id);
    option.innerHTML = `
      <div class="translation-icon">
        <span class="translation-badge">${trans.short}</span>
      </div>
      <div class="theme-option-body">
        <div class="theme-option-name">${trans.name}</div>
        <div class="theme-option-desc">${trans.desc}</div>
      </div>
      ${trans.id === currentTranslation ? '<svg class="theme-check" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' : ''}
    `;
    container.appendChild(option);
  });
}

function setTranslation(translationId) {
  const wasInPrayer = currentPsalm !== null;
  const savedPsalmNum = currentPsalm ? currentPsalm.number : null;
  const savedVerseIdx = currentVerseIndex;

  loadTranslation(translationId);
  renderTranslationOptions();
  renderTodaysPsalms();
  renderBrowseList();

  // If we were viewing a psalm, reload it in the new translation
  if (wasInPrayer && savedPsalmNum) {
    currentPsalm = getPsalmByNumber(savedPsalmNum);
    currentVerseIndex = Math.min(savedVerseIdx, currentPsalm.verses.length - 1);
    updateVerseDisplay();
    if (showingAllVerses) renderAllVerses();
  }
}

// --- Settings: Theme ---
function renderThemeOptions() {
  const container = document.getElementById('theme-options');
  container.innerHTML = '';

  themes.forEach(theme => {
    const option = document.createElement('div');
    option.className = `theme-option${theme.id === currentTheme ? ' active' : ''}`;
    option.onclick = () => setTheme(theme.id);
    option.innerHTML = `
      <div class="theme-swatch" style="background:${theme.gradient}"></div>
      <div class="theme-option-body">
        <div class="theme-option-name">${theme.name}</div>
        <div class="theme-option-desc">${theme.desc}</div>
      </div>
      ${theme.id === currentTheme ? '<svg class="theme-check" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' : ''}
    `;
    container.appendChild(option);
  });
}

function setTheme(themeId) {
  currentTheme = themeId;
  document.documentElement.setAttribute('data-theme', themeId);
  renderThemeOptions();
}

function renderPsalmsChart() {
  const container = document.getElementById('psalms-chart');
  container.innerHTML = '';

  for (let day = 1; day <= 31; day++) {
    const psalms = getPsalmsOfTheDay(day);
    const row = document.createElement('div');
    row.className = 'chart-row';
    row.innerHTML = `
      <div class="chart-day">${day}</div>
      <div class="chart-psalms">${psalms.map(p => `Ps ${p}`).join('  ·  ')}</div>
    `;
    container.appendChild(row);
  }
}

// --- Screen Navigation ---
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(`${screenId}-screen`);
  if (screen) {
    screen.classList.add('active');
    screen.scrollTo(0, 0);
  }
}

// --- Keyboard Navigation ---
document.addEventListener('keydown', e => {
  const prayerScreen = document.getElementById('prayer-screen');
  if (!prayerScreen.classList.contains('active')) return;
  if (showingAllVerses) return;

  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextVerse();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevVerse();
  } else if (e.key === 'Escape') {
    showScreen('home');
  }
});

// --- Start ---
document.addEventListener('DOMContentLoaded', init);
