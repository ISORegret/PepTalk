/* PepTalk QOL helpers.
 * Presentation/accessibility only: no health data or protocol state is changed here.
 */

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const RELEASE_CHANGES = {
  '2.4.0': [
    'Structural redesign pass across Summary, Doses, Protocols, Calendar, More, Weight and Insights',
    'Summary now opens in a focused view with an option to reveal supporting cards',
    'More is now a settings-style list with descriptions instead of equal-sized tiles',
    'Doses now separates Dose History and Inventory into dedicated views',
    'Calendar now separates Month and Adherence views',
    'Protocols adds All, Active and Paused filtering',
    'Weight and Insights add quick-jump section navigation',
    'Cleaner page rhythm, stronger hierarchy and less information shown at once',
    'No stored weight, dose, protocol, vial or history data was changed',
  ],
  '2.3.0': [
    'Improved readability and contrast across the app',
    'Larger helper text and easier-to-tap controls on iPhone',
    'Summary now labels weight loss as body weight lost instead of a negative percent',
    'Cleaner card hierarchy and more consistent spacing',
    'Refined bottom navigation and More menu styling',
    'Cleaner protocol editor fields and schedule controls',
    'Simplified Dose History header and removed low-value category counters',
    'Updated titration wording to Planned Dose / Dose Plan Progress',
    'Improved chart labels, calendar readability, and reduced-motion support',
    'Automatic app-version stamping for future releases',
  ],
};

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

function modernizeTitrationCopy() {
  const replacements = new Map([
    ['Recommended Dose', 'Planned Dose'],
    ['Ready to increase?', 'Review next planned step'],
    ['✓ On Track - Taking recommended dose', '✓ On track — matches planned dose'],
    ['Titration Progress', 'Dose Plan Progress'],
  ]);

  document.querySelectorAll('div, span, h2, h3, h4, button').forEach((node) => {
    if (node.children.length > 0) return;
    const text = cleanText(node.textContent);
    const replacement = replacements.get(text);
    if (replacement && text !== replacement) node.textContent = replacement;
  });
}

function simplifyDoseHistoryHeader() {
  document.querySelectorAll('h2').forEach((heading) => {
    if (cleanText(heading.textContent) !== 'Doses') return;
    const page = heading.parentElement?.parentElement;
    if (!page || page.dataset.ptDosePage === '1') return;
    page.dataset.ptDosePage = '1';
    const directGrids = Array.from(page.children).filter((node) => node instanceof HTMLElement && node.matches('.grid.grid-cols-4'));
    directGrids.forEach((grid) => {
      grid.hidden = true;
      grid.setAttribute('aria-hidden', 'true');
    });
  });
}

function improveUpdatePrompts() {
  const candidates = document.querySelectorAll('[role="dialog"], .ui-modal, .fixed');
  candidates.forEach((modal) => {
    if (!(modal instanceof HTMLElement) || modal.dataset.ptReleaseNotes === '1') return;
    const text = cleanText(modal.textContent).toLowerCase();
    const looksLikeUpdate = text.includes('update available') || text.includes('new version') || text.includes('update peptalk');
    if (!looksLikeUpdate) return;

    const versionMatch = cleanText(modal.textContent).match(/\b(\d+\.\d+\.\d+)\b/g);
    const version = versionMatch?.[versionMatch.length - 1] || '2.4.0';
    const changes = RELEASE_CHANGES[version] || RELEASE_CHANGES['2.4.0'];
    if (!changes?.length) return;

    const actionButton = Array.from(modal.querySelectorAll('button, a')).find((node) => /update|download|install/i.test(cleanText(node.textContent)));
    const host = actionButton?.parentElement || modal;
    if (!host) return;

    const box = document.createElement('section');
    box.className = 'pt-release-notes';
    box.setAttribute('aria-label', `What's new in PepTalk ${version}`);
    box.innerHTML = `
      <div class="pt-release-notes__eyebrow">WHAT'S NEW</div>
      <div class="pt-release-notes__title">PepTalk ${version}</div>
      <ul>${changes.map((item) => `<li>${item}</li>`).join('')}</ul>
    `;
    host.insertBefore(box, actionButton || host.firstChild);
    modal.dataset.ptReleaseNotes = '1';
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
    modernizeTitrationCopy();
    simplifyDoseHistoryHeader();
    improveUpdatePrompts();
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
