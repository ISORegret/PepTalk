/* PepTalk 3.0 — Step 3: focused Weight page.
 * Bounded enhancement only. No observers and no health-data mutation.
 */
const wText = (node) => String(node?.textContent || '').replace(/\s+/g, ' ').trim();
const wLower = (node) => wText(node).toLowerCase();

function wActivePage() {
  const active = document.querySelector('.peptalk-bottom-nav .ui-tab-active span');
  return wText(active).toLowerCase() || 'summary';
}

function wScope() {
  return document.querySelector('.app-frame') || document.querySelector('.app-shell');
}

function wFindButton(scope, patterns) {
  return Array.from(scope.querySelectorAll('button')).find((button) => patterns.some((p) => p.test(wText(button)))) || null;
}

function wHideStackAnalysis(scope) {
  Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel')).forEach((card) => {
    const t = wLower(card);
    if ((t.includes('stack response') && t.includes('weekly weight')) || t.includes('weekly stack & weight') || t.includes('what you took each week and how your weight changed')) {
      card.classList.add('pt-v3-weight-hidden');
      card.setAttribute('aria-hidden', 'true');
    }
  });
}

function wClassify(scope) {
  const cards = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel')).filter((card) => !card.closest('[role="dialog"]'));
  cards.forEach((card, index) => {
    card.classList.remove('pt-v3-weight-primary', 'pt-v3-weight-secondary', 'pt-v3-weight-chart', 'pt-v3-weight-history');
    const t = wLower(card);
    const isChart = t.includes('trend') || card.querySelector('.recharts-responsive-container');
    const isStats = t.includes('current weight') || t.includes('body weight lost') || t.includes('30-day') || t.includes('weekly change') || t.includes('7-day');
    const isHistory = t.includes('recent') || t.includes('history') || t.includes('weigh-in') || t.includes('readings');
    const primary = index < 3 || isStats || isChart;
    card.classList.add(primary ? 'pt-v3-weight-primary' : 'pt-v3-weight-secondary');
    if (isChart) card.classList.add('pt-v3-weight-chart');
    if (isHistory) card.classList.add('pt-v3-weight-history');
  });
}

function wEnsureIntro(scope) {
  if (scope.querySelector('.pt-v3-weight-intro')) return;
  const firstCard = scope.querySelector('.ui-card, .ui-hero-panel');
  if (!firstCard) return;
  const intro = document.createElement('section');
  intro.className = 'pt-v3-weight-intro';
  intro.innerHTML = `
    <div>
      <div class="pt-v3-weight-eyebrow">WEIGHT</div>
      <div class="pt-v3-weight-title">Progress without the noise</div>
      <div class="pt-v3-weight-copy">Trend first, daily readings second. Stack analysis now lives only in Insights.</div>
    </div>
    <button type="button" class="pt-v3-weight-action">Log weight</button>`;
  intro.querySelector('button')?.addEventListener('click', () => {
    const target = wFindButton(scope, [/log weight/i, /add weight/i, /quick weight/i]);
    target?.click();
  });
  firstCard.insertAdjacentElement('beforebegin', intro);
}

function wEnsureMeta(scope) {
  if (scope.querySelector('.pt-v3-weight-meta')) return;
  const intro = scope.querySelector('.pt-v3-weight-intro');
  if (!intro) return;

  const hero = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel')).find((card) => {
    const t = wLower(card);
    return t.includes('current weight') || t.includes('body weight lost');
  });
  if (!hero) return;

  const text = wText(hero);
  const numbers = [...text.matchAll(/[-+]?\d+(?:\.\d+)?\s*(?:lb|lbs|%)/gi)].map((m) => m[0]);
  if (!numbers.length) return;

  const row = document.createElement('div');
  row.className = 'pt-v3-weight-meta';
  row.setAttribute('aria-label', 'Weight summary');
  numbers.slice(0, 4).forEach((value, index) => {
    const chip = document.createElement('div');
    chip.className = 'pt-v3-weight-chip';
    const label = ['Current', 'Change', 'Progress', 'Trend'][index] || 'Metric';
    chip.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    row.appendChild(chip);
  });
  intro.insertAdjacentElement('afterend', row);
}

function wBuild() {
  const page = wActivePage();
  document.documentElement.dataset.ptMainPage = page;
  if (page !== 'weight') return;
  const scope = wScope();
  if (!scope) return;
  wHideStackAnalysis(scope);
  wClassify(scope);
  wEnsureIntro(scope);
  wEnsureMeta(scope);
}

let wTimer = 0;
function wSchedule(delay = 100) {
  window.clearTimeout(wTimer);
  wTimer = window.setTimeout(() => requestAnimationFrame(wBuild), delay);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => wSchedule(180), { once: true });
else wSchedule(120);
[450, 1100].forEach((delay) => window.setTimeout(wBuild, delay));
window.addEventListener('pageshow', () => wSchedule(80));
document.addEventListener('visibilitychange', () => { if (!document.hidden) wSchedule(100); });
document.addEventListener('click', (event) => {
  if (event.target.closest('.peptalk-bottom-nav')) wSchedule(130);
}, { capture: true });
