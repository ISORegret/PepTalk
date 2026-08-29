/* PepTalk 3.0 — Step 4: Insights hierarchy.
 * Bounded presentation enhancement only. No MutationObserver and no data mutation.
 */
const iText = (node) => String(node?.textContent || '').replace(/\s+/g, ' ').trim();
const iLower = (node) => iText(node).toLowerCase();

function iActivePage() {
  const active = document.querySelector('.peptalk-bottom-nav .ui-tab-active span');
  return iText(active).toLowerCase() || 'summary';
}

function iScope() {
  return document.querySelector('.app-frame') || document.querySelector('.app-shell');
}

function iEnsureIntro(scope) {
  if (scope.querySelector('.pt-v3-insights-intro')) return;
  const first = scope.querySelector('.ui-card, .ui-hero-panel');
  if (!first) return;
  const intro = document.createElement('section');
  intro.className = 'pt-v3-insights-intro';
  intro.innerHTML = '<div class="pt-v3-insights-eyebrow">INSIGHTS</div><div class="pt-v3-insights-title">What changed?</div><div class="pt-v3-insights-copy">Weekly response first. Compound-level estimated levels and deeper analysis stay below.</div>';
  first.insertAdjacentElement('beforebegin', intro);
}

function iEnsureDelta(scope) {
  if (scope.querySelector('.pt-v3-insights-delta')) return;
  const cards = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel'));
  const stackCard = cards.find((card) => {
    const t = iLower(card);
    return t.includes('weekly weight & protocols') || t.includes('weekly stack & weight');
  });
  if (!stackCard) return;

  const delta = document.createElement('section');
  delta.className = 'pt-v3-insights-delta';
  delta.innerHTML = `
    <div class="pt-v3-delta-card"><div class="pt-v3-delta-label">7-day view</div><div class="pt-v3-delta-value">Recent response</div></div>
    <div class="pt-v3-delta-card"><div class="pt-v3-delta-label">Protocols</div><div class="pt-v3-delta-value">Current stack</div></div>
    <div class="pt-v3-delta-card"><div class="pt-v3-delta-label">Analysis</div><div class="pt-v3-delta-value">Non-causal</div></div>`;
  stackCard.insertAdjacentElement('beforebegin', delta);
}

function iClassifyCards(scope) {
  const cards = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel'))
    .filter((card) => !card.closest('[role="dialog"]'));
  let seenUnifiedAnalysis = false;

  cards.forEach((card) => {
    const t = iLower(card);
    card.classList.remove('pt-v3-active-compound','pt-v3-archived-compound','pt-v3-duplicate-analysis');

    if (t.includes('inactive') || t.includes('archived')) card.classList.add('pt-v3-archived-compound');
    else if (t.includes('estimated level') || t.includes('last dose') || t.includes('next dose')) card.classList.add('pt-v3-active-compound');

    const looksCombined = (t.includes('estimated levels') || t.includes('medication levels')) && !t.includes('weekly weight & protocols') && !t.includes('weekly stack & weight');
    if (looksCombined) {
      if (seenUnifiedAnalysis) card.classList.add('pt-v3-duplicate-analysis');
      seenUnifiedAnalysis = true;
    }
  });
}

function iEnsureNote(scope) {
  if (scope.querySelector('.pt-v3-insights-note')) return;
  const stackCard = Array.from(scope.querySelectorAll('.ui-card, .ui-hero-panel')).find((card) => {
    const t = iLower(card);
    return t.includes('weekly weight & protocols') || t.includes('weekly stack & weight');
  });
  if (!stackCard) return;
  const note = document.createElement('p');
  note.className = 'pt-v3-insights-note';
  note.textContent = 'Weight and protocol patterns can be compared here, but the app does not treat correlation as proof that a protocol caused a weight change.';
  stackCard.insertAdjacentElement('afterend', note);
}

function iBuild() {
  const page = iActivePage();
  document.documentElement.dataset.ptMainPage = page;
  if (page !== 'insights') return;
  const scope = iScope();
  if (!scope) return;
  iEnsureIntro(scope);
  iEnsureDelta(scope);
  iClassifyCards(scope);
  iEnsureNote(scope);
}

let iTimer = 0;
function iSchedule(delay=100) {
  window.clearTimeout(iTimer);
  iTimer = window.setTimeout(() => requestAnimationFrame(iBuild), delay);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => iSchedule(180), { once: true });
else iSchedule(120);
[450,1100].forEach((delay)=>window.setTimeout(iBuild, delay));
window.addEventListener('pageshow',()=>iSchedule(80));
document.addEventListener('visibilitychange',()=>{ if (!document.hidden) iSchedule(100); });
document.addEventListener('click',(event)=>{ if (event.target.closest('.peptalk-bottom-nav')) iSchedule(130); },{capture:true});
