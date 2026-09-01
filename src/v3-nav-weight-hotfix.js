/* PepTalk 3.0 hotfix: restore direct Insights navigation and make Today Log weight a true popup.
 * Bounded/event-driven only. No MutationObserver and no direct health-data mutation.
 */
const hxText = (n) => String(n?.textContent || '').replace(/\s+/g, ' ').trim();
const hxButtons = () => Array.from(document.querySelectorAll('.peptalk-bottom-nav button'));
const hxTab = (names) => hxButtons().find((b) => names.some((n) => new RegExp(`^${n}$`, 'i').test(hxText(b))));
const hxIsAnalysis = () => /analysis|insights/i.test(hxText(document.querySelector('.page-context'))) || Array.from(document.querySelectorAll('h1,h2')).some((n) => /advanced analysis|insights/i.test(hxText(n)));

function hxEnsureInsightsTab() {
  const shell = document.querySelector('.peptalk-bottom-nav .bottom-nav-shell');
  if (!shell) return;
  shell.style.gridTemplateColumns = 'repeat(5,minmax(0,1fr))';
  let button = shell.querySelector('.pt-restored-insights-tab');
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'ui-tab pt-restored-insights-tab';
    button.setAttribute('aria-label', 'Insights');
    button.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h4l2-7 4 14 2-7h6"/></svg><span>Insights</span>';
    const more = Array.from(shell.querySelectorAll('button')).find((b) => /^more$/i.test(hxText(b)));
    if (more) shell.insertBefore(button, more); else shell.appendChild(button);
    button.addEventListener('click', () => {
      const progress = hxTab(['Progress','Weight']);
      progress?.click();
      let tries = 0;
      const open = () => {
        tries += 1;
        const analysis = Array.from(document.querySelectorAll('button')).find((b) => /^analysis$/i.test(hxText(b)) || /analysis/i.test(hxText(b)));
        if (analysis) {
          analysis.click();
          setTimeout(hxSchedule, 120);
        } else if (tries < 12) setTimeout(open, 80);
      };
      setTimeout(open, 70);
    });
  }
  button.classList.toggle('ui-tab-active', hxIsAnalysis());
}

function hxSetInput(input, value) {
  if (!input) return;
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  descriptor?.set?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
function hxFindLabeledInput(pattern, type='number') {
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find((l) => pattern.test(hxText(l)));
  return label?.querySelector(`input[type="${type}"]`) || null;
}
function hxCloseWeight() {
  document.querySelector('.pt-v3-weight-modal.pt-hotfix-weight')?.remove();
  document.documentElement.classList.remove('pt-v3-modal-open');
}
function hxSaveWeight(value, saveButton, error) {
  const progress = hxTab(['Progress','Weight']);
  if (!progress) {
    error.textContent = 'Could not open Progress.'; error.hidden = false; saveButton.disabled = false; saveButton.textContent = 'Save weight'; return;
  }
  progress.click();
  let tries = 0;
  const fill = () => {
    tries += 1;
    const openButton = Array.from(document.querySelectorAll('button')).find((b) => /^log weight$/i.test(hxText(b)) || /^add weight$/i.test(hxText(b)));
    if (openButton) openButton.click();
    setTimeout(() => {
      const weightInput = hxFindLabeledInput(/weight\s*\(lb\)|^weight\b/i, 'number');
      const dateInput = hxFindLabeledInput(/^date\b/i, 'date');
      const nativeSave = Array.from(document.querySelectorAll('button')).find((b) => /^save weight$/i.test(hxText(b)) || /^save changes$/i.test(hxText(b)));
      if (weightInput && nativeSave) {
        hxSetInput(weightInput, String(value));
        if (dateInput && !dateInput.value) hxSetInput(dateInput, new Date().toISOString().slice(0,10));
        nativeSave.click();
        setTimeout(() => { hxTab(['Today','Summary'])?.click(); hxCloseWeight(); }, 180);
      } else if (tries < 12) setTimeout(fill, 100);
      else { error.textContent='Could not open the weight form.'; error.hidden=false; saveButton.disabled=false; saveButton.textContent='Save weight'; }
    }, 70);
  };
  setTimeout(fill, 70);
}
function hxShowWeight() {
  hxCloseWeight();
  const overlay = document.createElement('div');
  overlay.className = 'pt-v3-weight-modal pt-hotfix-weight';
  overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-label','Log weight');
  overlay.innerHTML = '<div class="pt-v3-weight-modal__backdrop" data-close="1"></div><section class="pt-v3-weight-modal__sheet"><div class="pt-v3-weight-modal__handle"></div><div class="pt-v3-weight-modal__head"><div><div class="pt-v3-weight-modal__eyebrow">QUICK ENTRY</div><h2>Log weight</h2><p>Enter today\'s weight.</p></div><button type="button" class="pt-v3-weight-modal__close" data-close="1" aria-label="Close">×</button></div><label class="pt-v3-weight-modal__field"><span>Weight</span><div><input type="number" step="0.1" inputmode="decimal" autofocus placeholder="189.2"><b>lb</b></div></label><div class="pt-v3-weight-modal__error" hidden>Enter a valid weight.</div><button type="button" class="pt-v3-weight-modal__save">Save weight</button></section>';
  const input=overlay.querySelector('input'), error=overlay.querySelector('.pt-v3-weight-modal__error'), save=overlay.querySelector('.pt-v3-weight-modal__save');
  overlay.addEventListener('click',(e)=>{ if(e.target.closest('[data-close="1"]')) hxCloseWeight(); });
  save.addEventListener('click',()=>{ const v=Number(input.value); if(!(v>0)){error.hidden=false;input.focus();return;} error.hidden=true;save.disabled=true;save.textContent='Saving…';hxSaveWeight(v,save,error); });
  input.addEventListener('keydown',(e)=>{ if(e.key==='Enter') save.click(); if(e.key==='Escape') hxCloseWeight(); });
  document.body.appendChild(overlay); document.documentElement.classList.add('pt-v3-modal-open'); setTimeout(()=>input.focus(),40);
}

let hxTimer=0;
function hxSchedule(delay=60){ clearTimeout(hxTimer); hxTimer=setTimeout(()=>requestAnimationFrame(hxEnsureInsightsTab),delay); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>hxSchedule(120),{once:true}); else hxSchedule(80);
[300,800,1500].forEach((d)=>setTimeout(hxEnsureInsightsTab,d));
window.addEventListener('pageshow',()=>hxSchedule(60));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)hxSchedule(60)});
document.addEventListener('click',(event)=>{
  const button=event.target.closest('button');
  if(button && /^log weight$/i.test(hxText(button)) && /today|summary/i.test(hxText(document.querySelector('.page-context')))) {
    event.preventDefault(); event.stopImmediatePropagation(); hxShowWeight(); return;
  }
  if(event.target.closest('.peptalk-bottom-nav') || button) hxSchedule(100);
},{capture:true});