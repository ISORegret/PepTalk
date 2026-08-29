/* PepTalk 3.0 — Step 2: Summary becomes Today.
 * Bounded enhancement only: no MutationObserver, no health/protocol data mutation.
 */
const ptText = (node) => String(node?.textContent || '').replace(/\s+/g, ' ').trim();
const ptLower = (node) => ptText(node).toLowerCase();

function ptActivePage() {
  const active = document.querySelector('.peptalk-bottom-nav .ui-tab-active span');
  return ptText(active).toLowerCase() || 'summary';
}

function ptScope() {
  return document.querySelector('.app-frame') || document.querySelector('.app-shell');
}

function ptFindButton(scope, patterns) {
  const buttons = Array.from(scope.querySelectorAll('button'));
  return buttons.find((button) => patterns.some((pattern) => pattern.test(ptText(button)))) || null;
}

function ptClickExisting(scope, patterns) {
  const target = ptFindButton(scope, patterns);
  if (target) {
    target.click();
    return true;
  }
  return false;
}

function ptMarkSummaryCards(scope) {
  const cards = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel'))
    .filter((card) => !card.closest('[role="dialog"]'));

  cards.forEach((card, index) => {
    const text = ptLower(card);
    card.classList.remove('pt-summary-primary', 'pt-summary-secondary', 'pt-v3-today-warning');

    const isSchedule = text.includes('today') || text.includes('scheduled') || text.includes('morning') || text.includes('evening') || text.includes('completed');
    const isWeight = text.includes('current weight') || text.includes('body weight lost') || text.includes('weight change') || text.includes('7-day') || text.includes('weekly');
    const isImportantInventory = (text.includes('low supply') || text.includes('run out') || text.includes('remaining')) && (text.includes('dose') || text.includes('vial'));
    const isPrimary = index < 2 || isSchedule || isWeight || isImportantInventory;

    card.classList.add(isPrimary ? 'pt-summary-primary' : 'pt-summary-secondary');
    if (isImportantInventory) card.classList.add('pt-v3-today-warning');
  });
}

function ptEnsureTodayIntro(scope) {
  if (scope.querySelector('.pt-v3-today-intro')) return;
  const firstCard = scope.querySelector('.ui-card, .ui-hero-panel');
  if (!firstCard) return;

  const intro = document.createElement('section');
  intro.className = 'pt-v3-today-intro';
  intro.setAttribute('aria-label', 'Today quick actions');
  intro.innerHTML = `
    <div>
      <div class="pt-v3-today-eyebrow">TODAY</div>
      <div class="pt-v3-today-title">Your day at a glance</div>
      <div class="pt-v3-today-copy">Schedule first, progress second. Detailed analysis lives in Weight and Insights.</div>
    </div>
    <div class="pt-v3-today-actions">
      <button type="button" class="pt-v3-quick-action" data-action="weight">Log weight</button>
      <button type="button" class="pt-v3-quick-action" data-action="dose">Log dose</button>
    </div>`;

  intro.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'weight') {
      if (!ptClickExisting(scope, [/log weight/i, /add weight/i, /quick weight/i])) {
        const weightTab = Array.from(document.querySelectorAll('.peptalk-bottom-nav button')).find((b) => /weight/i.test(ptText(b)));
        weightTab?.click();
      }
    } else if (action === 'dose') {
      if (!ptClickExisting(scope, [/log dose/i, /unscheduled dose/i, /add dose/i])) {
        const moreTab = Array.from(document.querySelectorAll('.peptalk-bottom-nav button')).find((b) => /more/i.test(ptText(b)));
        moreTab?.click();
      }
    }
  });

  firstCard.insertAdjacentElement('beforebegin', intro);
}

function ptEnsureFocusToggle(scope) {
  const existing = scope.querySelector('.pt-summary-view-toggle');
  if (existing) return;
  const secondary = scope.querySelector('.pt-summary-secondary');
  if (!secondary) return;

  document.documentElement.dataset.ptSummaryView ||= 'focus';
  const row = document.createElement('div');
  row.className = 'pt-summary-view-toggle';
  row.innerHTML = '<div><div class="pt-structure-eyebrow">MORE DETAIL</div><div class="pt-structure-copy">Reports and supporting cards stay out of the way until you need them.</div></div><button type="button" class="pt-structure-pill" aria-pressed="false">Show more</button>';
  const button = row.querySelector('button');
  button.addEventListener('click', () => {
    const full = document.documentElement.dataset.ptSummaryView === 'full';
    document.documentElement.dataset.ptSummaryView = full ? 'focus' : 'full';
    button.textContent = full ? 'Show more' : 'Show less';
    button.setAttribute('aria-pressed', String(!full));
  });
  secondary.insertAdjacentElement('beforebegin', row);
}

function ptBuildToday() {
  const page = ptActivePage();
  document.documentElement.dataset.ptMainPage = page;
  if (page !== 'summary') return;
  const scope = ptScope();
  if (!scope) return;
  ptMarkSummaryCards(scope);
  ptEnsureTodayIntro(scope);
  ptEnsureFocusToggle(scope);
}

let ptTimer = 0;
function ptScheduleToday(delay = 100) {
  window.clearTimeout(ptTimer);
  ptTimer = window.setTimeout(() => requestAnimationFrame(ptBuildToday), delay);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => ptScheduleToday(180), { once: true });
else ptScheduleToday(120);
[450, 1100].forEach((delay) => window.setTimeout(ptBuildToday, delay));
window.addEventListener('pageshow', () => ptScheduleToday(80));
document.addEventListener('visibilitychange', () => { if (!document.hidden) ptScheduleToday(100); });
document.addEventListener('click', (event) => {
  if (event.target.closest('.peptalk-bottom-nav')) ptScheduleToday(130);
}, { capture: true });
