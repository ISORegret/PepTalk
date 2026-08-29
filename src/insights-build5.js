/* PepTalk Build 5 — Insights response view.
 * Presentation only: reuses the existing weekly stack/weight data already rendered by React.
 */

const ptBuild5Text = (node) => String(node?.textContent || '').replace(/\s+/g, ' ').trim();

function applyStackResponseToInsights() {
  const active = document.querySelector('.peptalk-bottom-nav .ui-tab-active span');
  if (ptBuild5Text(active).toLowerCase() !== 'insights') return;

  const scope = document.querySelector('.app-frame') || document.querySelector('.app-shell');
  if (!scope) return;

  const card = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel')).find((node) => {
    const text = ptBuild5Text(node).toLowerCase();
    return text.includes('weekly stack & weight') && text.includes('what you took each week');
  });
  if (!card || card.dataset.ptStackResponse === '1') return;

  card.dataset.ptStackResponse = '1';
  card.classList.add('pt-stack-response-card');

  const heading = Array.from(card.querySelectorAll('h2, h3, h4')).find((node) => ptBuild5Text(node) === 'Weekly stack & weight');
  if (heading) {
    heading.textContent = 'Weekly weight & protocols';
    heading.classList.add('pt-stack-response-title');
    const headerRow = heading.parentElement;
    const icon = headerRow?.querySelector('svg');
    if (icon) icon.classList.add('pt-stack-response-old-icon');
  }

  const subtitle = Array.from(card.querySelectorAll('p, div')).find((node) => {
    if (node.children.length > 0) return false;
    return ptBuild5Text(node) === 'What you took each week and how your weight changed.';
  });
  if (subtitle) {
    subtitle.textContent = 'What you took and how your weight moved.';
    subtitle.classList.add('pt-stack-response-subtitle');
  }

  if (!card.querySelector('.pt-stack-response-eyebrow')) {
    const eyebrow = document.createElement('div');
    eyebrow.className = 'pt-stack-response-eyebrow';
    eyebrow.textContent = 'STACK RESPONSE';
    card.insertBefore(eyebrow, card.firstChild);
  }
}

function scheduleBuild5(delay = 100) {
  window.setTimeout(() => requestAnimationFrame(applyStackResponseToInsights), delay);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => scheduleBuild5(180), { once: true });
} else {
  scheduleBuild5(120);
}

window.addEventListener('pageshow', () => scheduleBuild5(100));
document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleBuild5(120); });
document.addEventListener('click', (event) => {
  if (event.target.closest('.peptalk-bottom-nav')) scheduleBuild5(140);
}, { capture: true });
[450, 1000, 1800].forEach((delay) => scheduleBuild5(delay));
