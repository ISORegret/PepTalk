/* PepTalk 2.4 structural redesign.
 * This layer reorganizes existing UI surfaces without changing health, protocol, vial, or weight data.
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

function ensureSummaryStructure() {
  if (activeMainPage() !== 'summary') return;
  const scope = document.querySelector('.app-frame') || document.querySelector('.app-shell');
  if (!scope) return;

  const cards = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel'));
  cards.forEach((card) => card.classList.remove('pt-summary-primary', 'pt-summary-secondary'));

  let firstSecondary = null;
  cards.forEach((card, index) => {
    const t = lower(card);
    const primary = index < 2 || t.includes('current weight') || t.includes('weight trend') || t.includes('weekly review') || t.includes('today');
    card.classList.add(primary ? 'pt-summary-primary' : 'pt-summary-secondary');
    if (!primary && !firstSecondary) firstSecondary = card;
  });

  if (!document.documentElement.dataset.ptSummaryView) document.documentElement.dataset.ptSummaryView = 'focus';

  if (firstSecondary && !scope.querySelector('.pt-summary-view-toggle')) {
    const row = document.createElement('div');
    row.className = 'pt-summary-view-toggle';
    row.innerHTML = `
      <div>
        <div class="pt-structure-eyebrow">SUMMARY VIEW</div>
        <div class="pt-structure-copy">Keep the dashboard focused or show every supporting card.</div>
      </div>
      <button type="button" class="pt-structure-pill" aria-pressed="false">Show all</button>
    `;
    const button = row.querySelector('button');
    button.addEventListener('click', () => {
      const full = document.documentElement.dataset.ptSummaryView === 'full';
      document.documentElement.dataset.ptSummaryView = full ? 'focus' : 'full';
      button.textContent = full ? 'Show all' : 'Focus view';
      button.setAttribute('aria-pressed', String(!full));
    });
    firstSecondary.parentElement?.insertBefore(row, firstSecondary);
  }
}

function ensureMoreStructure() {
  const menu = document.querySelector('.more-menu');
  if (!menu) return;

  const meta = {
    Doses: ['TRACKING', 'Dose history and administrations', 1],
    Calendar: ['TRACKING', 'Schedule, taken and missed doses', 2],
    Body: ['TRACKING', 'Measurements and progress photos', 3],
    Labs: ['TRACKING', 'Bloodwork history and trends', 4],
    Wellness: ['TRACKING', 'Optional wellness tracking', 5],
    Profile: ['ACCOUNT', 'Account, cloud backup and preferences', 6],
    Tools: ['SYSTEM', 'Inventory, notifications, reports and data', 7],
    Help: ['SUPPORT', 'Help and app information', 8],
  };

  Array.from(menu.querySelectorAll('.more-menu-item')).forEach((button) => {
    const label = Array.from(button.querySelectorAll('span')).map(txt).find((value) => meta[value]);
    if (!label) return;
    const [group, description, order] = meta[label];
    button.dataset.ptMoreLabel = label.toLowerCase();
    button.dataset.ptMoreGroup = group.toLowerCase();
    button.style.order = String(order);
    if (!button.querySelector('.pt-more-copy')) {
      const textHost = Array.from(button.querySelectorAll('span')).find((span) => txt(span) === label);
      if (textHost) {
        textHost.classList.add('pt-more-title');
        const copy = document.createElement('span');
        copy.className = 'pt-more-copy';
        copy.textContent = description;
        textHost.insertAdjacentElement('afterend', copy);
        const kicker = document.createElement('span');
        kicker.className = 'pt-more-kicker';
        kicker.textContent = group;
        textHost.insertAdjacentElement('beforebegin', kicker);
      }
    }
  });
}

function ensureProtocolFilters() {
  if (activeMainPage() !== 'protocols') return;
  const scope = document.querySelector('.app-frame') || document.querySelector('.app-shell');
  if (!scope || scope.querySelector('.pt-protocol-filter')) return;

  const cards = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel')).filter((card) => {
    const t = lower(card);
    return t.includes('next dose') || t.includes('protocol') || t.includes('paused');
  });
  if (cards.length < 2) return;

  cards.forEach((card) => {
    const t = lower(card);
    card.dataset.ptProtocolStatus = t.includes('paused') ? 'paused' : 'active';
  });

  const bar = document.createElement('div');
  bar.className = 'pt-protocol-filter pt-segmented-structure';
  bar.innerHTML = `
    <button type="button" data-value="all" class="is-active">All</button>
    <button type="button" data-value="active">Active</button>
    <button type="button" data-value="paused">Paused</button>
  `;
  bar.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    const value = button.dataset.value;
    bar.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === button));
    cards.forEach((card) => {
      card.hidden = value !== 'all' && card.dataset.ptProtocolStatus !== value;
    });
  });

  const anchor = Array.from(scope.querySelectorAll('h2, h3')).find((h) => /protocol/i.test(txt(h)));
  const host = anchor?.parentElement?.parentElement || scope;
  host.insertBefore(bar, host.children[1] || null);
}

function ensureDoseStructure() {
  const page = findPageByHeading('Doses');
  if (!page || page.querySelector('.pt-dose-view-switch')) return;
  const vialPanel = Array.from(page.querySelectorAll('.ui-hero-panel, .ui-card')).find((node) => lower(node).includes('your vials'));
  if (!vialPanel) return;

  const switcher = document.createElement('div');
  switcher.className = 'pt-dose-view-switch pt-segmented-structure';
  switcher.innerHTML = `
    <button type="button" data-value="history" class="is-active">Dose history</button>
    <button type="button" data-value="inventory">Inventory</button>
  `;
  page.insertBefore(switcher, vialPanel);

  const directChildren = Array.from(page.children);
  directChildren.forEach((child) => {
    if (child === switcher || child === vialPanel || child.contains?.(page.querySelector('h2'))) return;
    child.classList?.add('pt-dose-history-surface');
  });
  vialPanel.classList.add('pt-dose-inventory-surface');

  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    const value = button.dataset.value;
    switcher.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === button));
    page.dataset.ptDoseView = value;
  });
  page.dataset.ptDoseView = 'history';
}

function ensureCalendarStructure() {
  const adherenceHeading = Array.from(document.querySelectorAll('h3')).find((h) => txt(h) === 'Adherence Summary');
  const adherenceCard = adherenceHeading?.closest('.ui-card');
  const monthCard = adherenceCard?.previousElementSibling;
  if (!adherenceCard || !monthCard || adherenceCard.parentElement?.querySelector('.pt-calendar-switch')) return;

  const parent = adherenceCard.parentElement;
  const switcher = document.createElement('div');
  switcher.className = 'pt-calendar-switch pt-segmented-structure';
  switcher.innerHTML = `
    <button type="button" data-value="month" class="is-active">Month</button>
    <button type="button" data-value="adherence">Adherence</button>
  `;
  parent.insertBefore(switcher, monthCard);
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

function ensureSectionJumpRail() {
  const page = activeMainPage();
  if (!['weight', 'insights'].includes(page)) {
    document.querySelector('.pt-section-rail')?.remove();
    return;
  }

  const scope = document.querySelector('.app-frame') || document.querySelector('.app-shell');
  if (!scope) return;
  const headings = Array.from(scope.querySelectorAll('h2, h3'))
    .filter((h) => h.offsetParent !== null)
    .filter((h) => txt(h).length > 0 && txt(h).length < 34)
    .slice(0, 5);
  if (headings.length < 2) return;

  let rail = scope.querySelector(':scope > .pt-section-rail');
  if (!rail) {
    rail = document.createElement('nav');
    rail.className = 'pt-section-rail';
    rail.setAttribute('aria-label', 'Jump to section');
    scope.insertBefore(rail, scope.firstChild);
  }
  rail.innerHTML = '';
  headings.forEach((heading, index) => {
    const id = heading.id || `pt-section-${page}-${index}`;
    heading.id = id;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = txt(heading);
    button.addEventListener('click', () => heading.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    rail.appendChild(button);
  });
}

function enhanceStructure() {
  ensureSummaryStructure();
  ensureMoreStructure();
  ensureProtocolFilters();
  ensureDoseStructure();
  ensureCalendarStructure();
  ensureSectionJumpRail();
}

let scheduled = false;
function scheduleEnhance() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    enhanceStructure();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleEnhance, { once: true });
else scheduleEnhance();

new MutationObserver(scheduleEnhance).observe(document.documentElement, { childList: true, subtree: true });
