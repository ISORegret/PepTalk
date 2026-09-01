/* PepTalk 3.0 — Step 2: Summary becomes Today.
 * Bounded enhancement only: no MutationObserver, no direct health/protocol data mutation.
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

function ptFindButton(scope, patterns, exclude = null) {
  const buttons = Array.from(scope.querySelectorAll('button'));
  return buttons.find((button) => {
    if (exclude && button.matches(exclude)) return false;
    return patterns.some((pattern) => pattern.test(ptText(button)));
  }) || null;
}

function ptClickExisting(scope, patterns, exclude = null) {
  const target = ptFindButton(scope, patterns, exclude);
  if (target) {
    target.click();
    return true;
  }
  return false;
}

function ptNativeSet(input, value) {
  if (!input) return;
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  descriptor?.set?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function ptFindLabelInput(scope, pattern, selector = 'input') {
  const labels = Array.from(scope.querySelectorAll('label'));
  const label = labels.find((node) => pattern.test(ptText(node)));
  return label?.querySelector(selector) || label?.parentElement?.querySelector(selector) || null;
}

function ptSubmitWeightThroughNativeForm(weightValue, onDone) {
  const weightTab = Array.from(document.querySelectorAll('.peptalk-bottom-nav button'))
    .find((button) => /^weight$/i.test(ptText(button).trim()));
  if (!weightTab) return false;
  weightTab.click();

  let attempts = 0;
  const openAndFill = () => {
    attempts += 1;
    const scope = ptScope();
    if (!scope || ptActivePage() !== 'weight') {
      if (attempts < 12) window.setTimeout(openAndFill, 80);
      return;
    }

    const openButton = ptFindButton(scope, [/^log weight$/i, /^add weight$/i], '.pt-v3-quick-action');
    if (openButton) openButton.click();

    window.setTimeout(() => {
      const currentScope = ptScope();
      if (!currentScope) return;
      const weightInput = ptFindLabelInput(currentScope, /weight\s*\(lb\)|^weight\b/i, 'input[type="number"]');
      const dateInput = ptFindLabelInput(currentScope, /^date\b/i, 'input[type="date"]');
      const saveButton = ptFindButton(currentScope, [/^save weight$/i, /^save changes$/i]);
      if (!weightInput || !saveButton) {
        if (attempts < 12) window.setTimeout(openAndFill, 100);
        return;
      }
      ptNativeSet(weightInput, String(weightValue));
      if (dateInput && !dateInput.value) ptNativeSet(dateInput, new Date().toISOString().slice(0, 10));
      saveButton.click();
      window.setTimeout(() => {
        const summaryTab = Array.from(document.querySelectorAll('.peptalk-bottom-nav button'))
          .find((button) => /^summary$/i.test(ptText(button).trim()));
        summaryTab?.click();
        onDone?.();
      }, 180);
    }, 90);
  };

  window.setTimeout(openAndFill, 80);
  return true;
}

function ptCloseWeightModal() {
  document.querySelector('.pt-v3-weight-modal')?.remove();
  document.documentElement.classList.remove('pt-v3-modal-open');
}

function ptShowWeightModal() {
  ptCloseWeightModal();
  const overlay = document.createElement('div');
  overlay.className = 'pt-v3-weight-modal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Log weight');
  overlay.innerHTML = `
    <div class="pt-v3-weight-modal__backdrop" data-close="1"></div>
    <section class="pt-v3-weight-modal__sheet">
      <div class="pt-v3-weight-modal__handle" aria-hidden="true"></div>
      <div class="pt-v3-weight-modal__head">
        <div>
          <div class="pt-v3-weight-modal__eyebrow">QUICK ENTRY</div>
          <h2>Log weight</h2>
          <p>Add today's weight without leaving Summary.</p>
        </div>
        <button type="button" class="pt-v3-weight-modal__close" data-close="1" aria-label="Close">×</button>
      </div>
      <label class="pt-v3-weight-modal__field">
        <span>Weight</span>
        <div><input type="number" step="0.1" inputmode="decimal" autofocus placeholder="189.2"><b>lb</b></div>
      </label>
      <div class="pt-v3-weight-modal__error" hidden>Enter a valid weight.</div>
      <button type="button" class="pt-v3-weight-modal__save">Save weight</button>
    </section>`;

  const input = overlay.querySelector('input');
  const error = overlay.querySelector('.pt-v3-weight-modal__error');
  const save = overlay.querySelector('.pt-v3-weight-modal__save');
  overlay.addEventListener('click', (event) => {
    if (event.target.closest('[data-close="1"]')) ptCloseWeightModal();
  });
  const submit = () => {
    const value = Number(input.value);
    if (!(value > 0)) {
      error.hidden = false;
      input.focus();
      return;
    }
    error.hidden = true;
    save.disabled = true;
    save.textContent = 'Saving…';
    const started = ptSubmitWeightThroughNativeForm(value, ptCloseWeightModal);
    if (!started) {
      save.disabled = false;
      save.textContent = 'Save weight';
      error.textContent = 'Could not open the weight logger. Try again.';
      error.hidden = false;
    }
  };
  save.addEventListener('click', submit);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submit();
    if (event.key === 'Escape') ptCloseWeightModal();
  });
  document.body.appendChild(overlay);
  document.documentElement.classList.add('pt-v3-modal-open');
  window.setTimeout(() => input.focus(), 50);
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
      ptShowWeightModal();
    } else if (action === 'dose') {
      if (!ptClickExisting(scope, [/log dose/i, /unscheduled dose/i, /add dose/i], '.pt-v3-quick-action')) {
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

  const button = event.target.closest('button');
  if (!button || button.classList.contains('pt-v3-quick-action')) return;
  if (ptActivePage() === 'summary' && /^log weight$/i.test(ptText(button))) {
    event.preventDefault();
    event.stopPropagation();
    ptShowWeightModal();
  }
}, { capture: true });
