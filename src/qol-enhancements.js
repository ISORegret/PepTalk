/* PepTalk 2.3 DOM-level QOL helpers.
 * These are intentionally presentation/accessibility only: no health data or protocol state is changed here.
 */

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

function detectPage() {
  const active = document.querySelector('.peptalk-bottom-nav .ui-tab-active span');
  if (!active) return;
  const label = cleanText(active.textContent).toLowerCase();
  document.documentElement.dataset.peptalkPage = label || 'summary';
}

function normalizeWeightLossCopy() {
  const heroPanels = document.querySelectorAll('.ui-hero-panel');
  heroPanels.forEach((panel) => {
    const bigValue = panel.querySelector('.text-4xl');
    const stats = panel.querySelector('.grid.grid-cols-3');
    if (!bigValue || !stats) return;

    const cells = Array.from(stats.children).filter((node) => node instanceof HTMLElement);
    if (cells.length < 2) return;
    const percentageCell = cells[1];
    const valueNodes = Array.from(percentageCell.querySelectorAll('div, span'));
    const percentNode = valueNodes.find((node) => /^[-+]?\d+(?:\.\d+)?%$/.test(cleanText(node.textContent)));
    if (!percentNode) return;

    const numeric = Number.parseFloat(cleanText(percentNode.textContent));
    if (Number.isFinite(numeric) && numeric < 0) {
      percentNode.textContent = `${Math.abs(numeric).toFixed(1)}%`;
      percentNode.setAttribute('aria-label', `${Math.abs(numeric).toFixed(1)} percent body weight lost`);
    }
  });
}

function improveIconButtonLabels() {
  document.querySelectorAll('button').forEach((button) => {
    if (button.hasAttribute('aria-label')) return;
    const visible = cleanText(button.textContent);
    if (visible) return;
    const title = button.getAttribute('title');
    if (title) {
      button.setAttribute('aria-label', title);
      return;
    }
    const svg = button.querySelector('svg');
    if (svg) button.setAttribute('aria-label', 'Action');
  });
}

function markTechnicalCopy() {
  document.querySelectorAll('p, div').forEach((node) => {
    const text = cleanText(node.textContent);
    if (!text || text.length > 650) return;
    if (text.includes('Cloud sign-in is not configured for this deployment')) {
      node.classList.add('pt-collapsible-tech');
    }
  });
}

function markFocusSurfaces() {
  document.querySelectorAll('.ui-card, .ui-hero-panel').forEach((node) => node.classList.add('pt-page-focus'));
}

let queued = false;
function enhance() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    detectPage();
    normalizeWeightLossCopy();
    improveIconButtonLabels();
    markTechnicalCopy();
    markFocusSurfaces();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhance, { once: true });
} else {
  enhance();
}

const observer = new MutationObserver(enhance);
observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
