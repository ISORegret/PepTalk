/* PepTalk 2.5 structural redesign.
 * Safe, bounded DOM organization only. No continuous MutationObserver and no top jump rail.
 */

const txt = (node) => String(node?.textContent || '').replace(/\s+/g, ' ').trim();
const lower = (node) => txt(node).toLowerCase();

function activeMainPage() {
  const active = document.querySelector('.peptalk-bottom-nav .ui-tab-active span');
  return txt(active).toLowerCase() || 'summary';
}

function findPageByHeading(label) {
  const heading = Array.from(document.querySelectorAll('h2')).find((h) => txt(h) === label);
  return heading?.parentElement?.parentElement || heading?.parentElement || null;
}

function removeWeightDuplicate() {
  if (activeMainPage() !== 'weight') return;
  const scope = document.querySelector('.app-frame') || document.querySelector('.app-shell');
  if (!scope) return;
  Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel')).forEach((card) => {
    const text = lower(card);
    const duplicate = text.includes('stack response') && text.includes('weekly weight & protocols');
    if (duplicate) {
      card.hidden = true;
      card.setAttribute('aria-hidden', 'true');
      card.dataset.ptDuplicateRemoved = 'weekly-stack-weight';
    }
  });
}

function ensureSummaryStructure() {
  if (activeMainPage() !== 'summary') return;
  const scope = document.querySelector('.app-frame') || document.querySelector('.app-shell');
  if (!scope || scope.querySelector('.pt-summary-view-toggle')) return;

  const cards = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel')).filter((card) => !card.closest('[role="dialog"]'));
  if (cards.length < 5) return;

  let firstSecondary = null;
  cards.forEach((card, index) => {
    const text = lower(card);
    const primary = index < 3 || text.includes('today') || text.includes('current weight') || text.includes('weight trend') || text.includes('weekly review');
    card.classList.add(primary ? 'pt-summary-primary' : 'pt-summary-secondary');
    if (!primary && !firstSecondary) firstSecondary = card;
  });
  if (!firstSecondary) return;

  document.documentElement.dataset.ptSummaryView = document.documentElement.dataset.ptSummaryView || 'focus';
  const row = document.createElement('div');
  row.className = 'pt-summary-view-toggle';
  row.innerHTML = `
    <div>
      <div class="pt-structure-eyebrow">SUMMARY</div>
      <div class="pt-structure-copy">Today and progress first. Supporting detail stays one tap away.</div>
    </div>
    <button type="button" class="pt-structure-pill" aria-pressed="false">Show more</button>
  `;
  const button = row.querySelector('button');
  button.addEventListener('click', () => {
    const showingAll = document.documentElement.dataset.ptSummaryView === 'full';
    document.documentElement.dataset.ptSummaryView = showingAll ? 'focus' : 'full';
    button.textContent = showingAll ? 'Show more' : 'Show less';
    button.setAttribute('aria-pressed', String(!showingAll));
  });
  firstSecondary.parentElement?.insertBefore(row, firstSecondary);
}

function ensureMoreStructure() {
  const menu = document.querySelector('.more-menu');
  if (!menu || menu.dataset.ptStructured === '1') return;
  const meta = {
    Profile: ['ACCOUNT & BACKUP', 'Cloud sync, profile and preferences', 1],
    Body: ['PROGRESS', 'Measurements and progress photos', 2],
    Doses: ['TRACKING', 'Dose history and administrations', 3],
    Calendar: ['TRACKING', 'Schedule, taken and missed doses', 4],
    Tools: ['SYSTEM', 'Inventory, notifications, reports and data', 5],
    Labs: ['HEALTH DATA', 'Bloodwork history and trends', 6],
    Wellness: ['OPTIONAL', 'Optional wellness tracking', 7],
    Help: ['SUPPORT', 'Help, version and app information', 8],
  };
  Array.from(menu.querySelectorAll('.more-menu-item')).forEach((button) => {
    const labelNode = Array.from(button.querySelectorAll('span')).find((span) => meta[txt(span)]);
    if (!labelNode) return;
    const label = txt(labelNode);
    const [group, description, order] = meta[label];
    button.style.order = String(order);
    button.dataset.ptMoreGroup = group.toLowerCase().replaceAll(' ', '-');
    labelNode.classList.add('pt-more-title');
    if (!button.querySelector('.pt-more-kicker')) {
      const kicker = document.createElement('span');
      kicker.className = 'pt-more-kicker';
      kicker.textContent = group;
      labelNode.insertAdjacentElement('beforebegin', kicker);
    }
    if (!button.querySelector('.pt-more-copy')) {
      const copy = document.createElement('span');
      copy.className = 'pt-more-copy';
      copy.textContent = description;
      labelNode.insertAdjacentElement('afterend', copy);
    }
  });
  menu.dataset.ptStructured = '1';
}

function ensureProtocolFilters() {
  if (activeMainPage() !== 'protocols') return;
  const scope = document.querySelector('.app-frame') || document.querySelector('.app-shell');
  if (!scope || scope.querySelector('.pt-protocol-filter')) return;
  const cards = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel')).filter((card) => {
    const t = lower(card);
    return (t.includes('next dose') || t.includes('paused') || t.includes('protocol')) && !t.includes('protocol editor');
  });
  if (cards.length < 2) return;
  cards.forEach((card) => { card.dataset.ptProtocolStatus = lower(card).includes('paused') ? 'paused' : 'active'; });

  const bar = document.createElement('div');
  bar.className = 'pt-protocol-filter pt-segmented-structure';
  bar.innerHTML = '<button type="button" data-value="all" class="is-active">All</button><button type="button" data-value="active">Active</button><button type="button" data-value="paused">Paused</button>';
  bar.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    const value = button.dataset.value;
    bar.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === button));
    cards.forEach((card) => { card.hidden = value !== 'all' && card.dataset.ptProtocolStatus !== value; });
  });
  const heading = Array.from(scope.querySelectorAll('h2, h3')).find((h) => /^protocols?$/i.test(txt(h)));
  const anchor = heading?.parentElement || scope.firstElementChild;
  anchor?.insertAdjacentElement('afterend', bar);
}

function ensureDoseStructure() {
  const page = findPageByHeading('Doses');
  if (!page || page.querySelector('.pt-dose-view-switch')) return;
  const vialPanel = Array.from(page.querySelectorAll('.ui-hero-panel, .ui-card')).find((node) => lower(node).includes('your vials'));
  if (!vialPanel) return;

  const switcher = document.createElement('div');
  switcher.className = 'pt-dose-view-switch pt-segmented-structure';
  switcher.innerHTML = '<button type="button" data-value="history" class="is-active">Dose history</button><button type="button" data-value="inventory">Inventory</button>';
  vialPanel.insertAdjacentElement('beforebegin', switcher);
  vialPanel.classList.add('pt-dose-inventory-surface');
  Array.from(page.children).forEach((child) => {
    if (child === switcher || child === vialPanel || child.querySelector?.('h2')) return;
    child.classList?.add('pt-dose-history-surface');
  });
  page.dataset.ptDoseView = 'history';
  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    switcher.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === button));
    page.dataset.ptDoseView = button.dataset.value;
  });
}

function ensureCalendarStructure() {
  const adherenceHeading = Array.from(document.querySelectorAll('h3')).find((h) => txt(h) === 'Adherence Summary');
  const adherenceCard = adherenceHeading?.closest('.ui-card');
  const monthCard = adherenceCard?.previousElementSibling;
  const parent = adherenceCard?.parentElement;
  if (!adherenceCard || !monthCard || !parent || parent.querySelector('.pt-calendar-switch')) return;

  const switcher = document.createElement('div');
  switcher.className = 'pt-calendar-switch pt-segmented-structure';
  switcher.innerHTML = '<button type="button" data-value="month" class="is-active">Month</button><button type="button" data-value="adherence">Adherence</button>';
  monthCard.insertAdjacentElement('beforebegin', switcher);
  monthCard.classList.add('pt-calendar-month');
  adherenceCard.classList.add('pt-calendar-adherence');
  parent.dataset.ptCalendarView = 'month';
  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    switcher.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === button));
    parent.dataset.ptCalendarView = button.dataset.value;
  });
}

function enhanceStructure() {
  removeWeightDuplicate();
  ensureSummaryStructure();
  ensureMoreStructure();
  ensureProtocolFilters();
  ensureDoseStructure();
  ensureCalendarStructure();
}

let scheduled = false;
function scheduleEnhance(delay = 100) {
  window.setTimeout(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhanceStructure(); });
  }, delay);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scheduleEnhance(200), { once: true });
else scheduleEnhance(150);

[400, 1000, 1900].forEach((delay) => scheduleEnhance(delay));
window.addEventListener('pageshow', () => scheduleEnhance(100));
document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleEnhance(120); });
document.addEventListener('click', (event) => {
  if (event.target.closest('.peptalk-bottom-nav, .more-menu, button')) scheduleEnhance(120);
}, { capture: true });
