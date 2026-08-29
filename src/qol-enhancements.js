/* PepTalk QOL helpers.
 * Presentation/accessibility only: no health data or protocol state is changed here.
 * Deliberately event-driven: do not observe/mutate the entire DOM continuously.
 */

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const RELEASE_VERSION = '2.5.0';
const RELEASE_CHANGES = [
  'Removed the duplicate weekly stack/weight analysis from Weight; it now lives in Insights only',
  'Reorganized More into a cleaner settings-style menu with clearer destinations',
  'Added focused Summary presentation so the dashboard prioritizes today and progress',
  'Added All, Active and Paused views for Protocols',
  'Separated Dose History from vial Inventory',
  'Separated Calendar schedule and adherence views without adding a blocked top navigation rail',
  'Improved page hierarchy and reduced repeated information',
  'Removed continuous DOM observers that could cause freezing or missed taps on iPhone',
  'Added a built-in What’s New popup that appears once per PepTalk release',
  'No stored weights, doses, protocols, vials or history were changed',
];

function detectPage() {
  const active = document.querySelector('.peptalk-bottom-nav .ui-tab-active span');
  if (!active) return;
  document.documentElement.dataset.peptalkPage = cleanText(active.textContent).toLowerCase() || 'summary';
}

function normalizeWeightLossCopy() {
  document.querySelectorAll('.ui-hero-panel').forEach((panel) => {
    const bigValue = panel.querySelector('.text-4xl');
    const stats = panel.querySelector('.grid.grid-cols-3');
    if (!bigValue || !stats) return;
    const cells = Array.from(stats.children).filter((node) => node instanceof HTMLElement);
    if (cells.length < 2) return;
    const percentNode = Array.from(cells[1].querySelectorAll('div, span')).find((node) => /^[-+]?\d+(?:\.\d+)?%$/.test(cleanText(node.textContent)));
    if (!percentNode) return;
    const numeric = Number.parseFloat(cleanText(percentNode.textContent));
    if (Number.isFinite(numeric) && numeric < 0) {
      percentNode.textContent = `${Math.abs(numeric).toFixed(1)}%`;
      percentNode.setAttribute('aria-label', `${Math.abs(numeric).toFixed(1)} percent body weight lost`);
    }
  });
}

function modernizeTitrationCopy() {
  const replacements = new Map([
    ['Recommended Dose', 'Planned Dose'],
    ['Ready to increase?', 'Review next planned step'],
    ['✓ On Track - Taking recommended dose', '✓ On track — matches planned dose'],
    ['Titration Progress', 'Dose Plan Progress'],
  ]);
  document.querySelectorAll('div, span, h2, h3, h4, button').forEach((node) => {
    if (node.children.length > 0) return;
    const replacement = replacements.get(cleanText(node.textContent));
    if (replacement) node.textContent = replacement;
  });
}

function simplifyDoseHistoryHeader() {
  document.querySelectorAll('h2').forEach((heading) => {
    if (cleanText(heading.textContent) !== 'Doses') return;
    const page = heading.parentElement?.parentElement;
    if (!page || page.dataset.ptDosePage === '1') return;
    page.dataset.ptDosePage = '1';
    Array.from(page.children)
      .filter((node) => node instanceof HTMLElement && node.matches('.grid.grid-cols-4'))
      .forEach((grid) => {
        grid.hidden = true;
        grid.setAttribute('aria-hidden', 'true');
      });
  });
}

function improveIconButtonLabels() {
  document.querySelectorAll('button').forEach((button) => {
    if (button.hasAttribute('aria-label') || cleanText(button.textContent)) return;
    const title = button.getAttribute('title');
    if (title) button.setAttribute('aria-label', title);
    else if (button.querySelector('svg')) button.setAttribute('aria-label', 'Action');
  });
}

function markTechnicalCopy() {
  document.querySelectorAll('p, div').forEach((node) => {
    const text = cleanText(node.textContent);
    if (text && text.length <= 650 && text.includes('Cloud sign-in is not configured for this deployment')) {
      node.classList.add('pt-collapsible-tech');
    }
  });
}

function markFocusSurfaces() {
  document.querySelectorAll('.ui-card, .ui-hero-panel').forEach((node) => node.classList.add('pt-page-focus'));
}

function showWhatsNewOnce() {
  const key = `peptalk-whats-new-${RELEASE_VERSION}`;
  try {
    if (localStorage.getItem(key) === 'seen') return;
  } catch (_) {}
  if (document.querySelector('.pt-whats-new-modal')) return;

  const overlay = document.createElement('div');
  overlay.className = 'pt-whats-new-modal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', `What’s new in PepTalk ${RELEASE_VERSION}`);
  overlay.innerHTML = `
    <div class="pt-whats-new-card">
      <div class="pt-release-notes__eyebrow">WHAT’S NEW</div>
      <div class="pt-whats-new-title">PepTalk ${RELEASE_VERSION}</div>
      <div class="pt-whats-new-subtitle">Structural redesign & stability update</div>
      <ul>${RELEASE_CHANGES.map((item) => `<li>${item}</li>`).join('')}</ul>
      <button type="button" class="pt-whats-new-dismiss">Got it</button>
    </div>
  `;
  const close = () => {
    try { localStorage.setItem(key, 'seen'); } catch (_) {}
    overlay.remove();
  };
  overlay.querySelector('.pt-whats-new-dismiss')?.addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  document.body.appendChild(overlay);
}

let queued = false;
function enhance() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    detectPage();
    normalizeWeightLossCopy();
    modernizeTitrationCopy();
    simplifyDoseHistoryHeader();
    improveIconButtonLabels();
    markTechnicalCopy();
    markFocusSurfaces();
  });
}

function scheduleEnhance(delay = 80) { window.setTimeout(enhance, delay); }

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scheduleEnhance(150), { once: true });
else scheduleEnhance(100);

window.addEventListener('pageshow', () => scheduleEnhance(80));
document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleEnhance(100); });
document.addEventListener('click', (event) => {
  if (event.target.closest('.peptalk-bottom-nav, .more-menu, button')) scheduleEnhance(100);
}, { capture: true });

// A few bounded startup passes cover React/Supabase mounting without a permanent observer.
[350, 900, 1800].forEach((delay) => scheduleEnhance(delay));
window.setTimeout(showWhatsNewOnce, 1200);
