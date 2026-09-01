/* PepTalk 3.0 hotfix: direct Insights nav + consistent quick-entry popups.
 * Bounded/event-driven only. No MutationObserver and no direct health-data mutation.
 */
const hxText = (n) => String(n?.textContent || '').replace(/\s+/g, ' ').trim();
const hxButtons = () => Array.from(document.querySelectorAll('.peptalk-bottom-nav button'));
const hxTab = (names) => hxButtons().find((b) => names.some((n) => new RegExp(`^${n}$`, 'i').test(hxText(b))));
const hxPageContext = () => hxText(document.querySelector('.page-context'));
const hxIsAnalysis = () => /analysis|insights/i.test(hxPageContext()) || Array.from(document.querySelectorAll('h1,h2')).some((n) => /advanced analysis|insights/i.test(hxText(n)));
const hxPageKind = () => hxIsAnalysis() ? 'insights' : /progress|weight/i.test(hxPageContext()) ? 'progress' : /today|summary/i.test(hxPageContext()) ? 'today' : 'other';
const hxRead = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback; } catch { return fallback; } };

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
    button.addEventListener('click', hxOpenInsights);
  }
  button.classList.toggle('ui-tab-active', hxIsAnalysis());
}

function hxOpenInsights() {
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
}

function hxRestorePage(kind) {
  if (kind === 'insights') { hxOpenInsights(); return; }
  if (kind === 'progress') { hxTab(['Progress','Weight'])?.click(); return; }
  hxTab(['Today','Summary'])?.click();
}

function hxSetInput(input, value) {
  if (!input) return;
  const proto = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  descriptor?.set?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
function hxFindLabel(pattern) {
  return Array.from(document.querySelectorAll('label')).find((l) => pattern.test(hxText(l))) || null;
}
function hxFindLabeledInput(pattern, type='number') {
  const label = hxFindLabel(pattern);
  return label?.querySelector(`input[type="${type}"]`) || label?.parentElement?.querySelector(`input[type="${type}"]`) || null;
}

/* ---------- Weight popup ---------- */
let hxBridgeWeight = false;
function hxCloseWeight() {
  document.querySelector('.pt-v3-weight-modal.pt-hotfix-weight')?.remove();
  if (!document.querySelector('.pt-v3-dose-modal')) document.documentElement.classList.remove('pt-v3-modal-open');
}
function hxSaveWeight(value, returnPage, saveButton, error) {
  const progress = hxTab(['Progress','Weight']);
  if (!progress) {
    error.textContent = 'Could not open Progress.'; error.hidden = false; saveButton.disabled = false; saveButton.textContent = 'Save weight'; return;
  }
  progress.click();
  let tries = 0;
  const fill = () => {
    tries += 1;
    const openButton = Array.from(document.querySelectorAll('button')).find((b) => /^log weight$/i.test(hxText(b)) || /^add weight$/i.test(hxText(b)));
    if (openButton) {
      hxBridgeWeight = true;
      openButton.click();
      setTimeout(() => { hxBridgeWeight = false; }, 100);
    }
    setTimeout(() => {
      const weightInput = hxFindLabeledInput(/weight\s*\(lb\)|^weight\b/i, 'number');
      const dateInput = hxFindLabeledInput(/^date\b/i, 'date');
      const nativeSave = Array.from(document.querySelectorAll('button')).find((b) => /^save weight$/i.test(hxText(b)) || /^save changes$/i.test(hxText(b)));
      if (weightInput && nativeSave) {
        hxSetInput(weightInput, String(value));
        if (dateInput && !dateInput.value) hxSetInput(dateInput, new Date().toISOString().slice(0,10));
        nativeSave.click();
        setTimeout(() => { hxRestorePage(returnPage); hxCloseWeight(); }, 180);
      } else if (tries < 12) setTimeout(fill, 100);
      else { error.textContent='Could not open the weight form.'; error.hidden=false; saveButton.disabled=false; saveButton.textContent='Save weight'; }
    }, 70);
  };
  setTimeout(fill, 70);
}
function hxShowWeight(returnPage = hxPageKind()) {
  hxCloseWeight();
  const overlay = document.createElement('div');
  overlay.className = 'pt-v3-weight-modal pt-hotfix-weight';
  overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-label','Log weight');
  overlay.innerHTML = '<div class="pt-v3-weight-modal__backdrop" data-close="1"></div><section class="pt-v3-weight-modal__sheet"><div class="pt-v3-weight-modal__handle"></div><div class="pt-v3-weight-modal__head"><div><div class="pt-v3-weight-modal__eyebrow">QUICK ENTRY</div><h2>Log weight</h2><p>Enter today\'s weight.</p></div><button type="button" class="pt-v3-weight-modal__close" data-close="1" aria-label="Close">×</button></div><label class="pt-v3-weight-modal__field"><span>Weight</span><div><input type="number" step="0.1" inputmode="decimal" autofocus placeholder="189.2"><b>lb</b></div></label><div class="pt-v3-weight-modal__error" hidden>Enter a valid weight.</div><button type="button" class="pt-v3-weight-modal__save">Save weight</button></section>';
  const input=overlay.querySelector('input'), error=overlay.querySelector('.pt-v3-weight-modal__error'), save=overlay.querySelector('.pt-v3-weight-modal__save');
  overlay.addEventListener('click',(e)=>{ if(e.target.closest('[data-close="1"]')) hxCloseWeight(); });
  save.addEventListener('click',()=>{ const v=Number(input.value); if(!(v>0)){error.hidden=false;input.focus();return;} error.hidden=true;save.disabled=true;save.textContent='Saving…';hxSaveWeight(v,returnPage,save,error); });
  input.addEventListener('keydown',(e)=>{ if(e.key==='Enter') save.click(); if(e.key==='Escape') hxCloseWeight(); });
  document.body.appendChild(overlay); document.documentElement.classList.add('pt-v3-modal-open'); setTimeout(()=>input.focus(),40);
}

/* ---------- Dose popup ---------- */
function hxDoseOptions() {
  const schedules = hxRead('health-schedules', []).filter((s) => s && s.medication && !s.paused);
  const history = hxRead('health-injection-entries', []);
  const map = new Map();
  schedules.forEach((s) => map.set(String(s.medication), { medication: String(s.medication), dose: s.dose ?? '', unit: s.unit || 'mg' }));
  history.forEach((e) => { const name = String(e?.type || '').trim(); if (name && !map.has(name)) map.set(name, { medication:name, dose:e.dose ?? '', unit:e.unit || 'mg' }); });
  return Array.from(map.values()).sort((a,b)=>a.medication.localeCompare(b.medication));
}
function hxCloseDose() {
  document.querySelector('.pt-v3-dose-modal')?.remove();
  if (!document.querySelector('.pt-v3-weight-modal.pt-hotfix-weight')) document.documentElement.classList.remove('pt-v3-modal-open');
}
function hxSelectNativeMedication(name, done) {
  const label = hxFindLabel(/^medication$/i);
  const root = label?.parentElement;
  const trigger = root?.querySelector(':scope > button') || root?.querySelector('button');
  if (!root || !trigger) { done(false); return; }
  if (new RegExp(`^${String(name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`,'i').test(hxText(trigger))) { done(true); return; }
  trigger.click();
  setTimeout(() => {
    const choices = Array.from(root.querySelectorAll('button')).filter((b) => hxText(b).toLowerCase() === String(name).toLowerCase());
    const option = choices[choices.length - 1];
    if (!option || option === trigger) { done(false); return; }
    option.click(); done(true);
  }, 70);
}
function hxSaveDose(payload, returnPage, saveButton, error) {
  const today = hxTab(['Today','Summary']);
  if (!today) { error.textContent='Could not open Today.'; error.hidden=false; saveButton.disabled=false; saveButton.textContent='Save dose'; return; }
  today.click();
  let tries = 0;
  const openNative = () => {
    tries += 1;
    const unscheduled = Array.from(document.querySelectorAll('button')).find((b) => /log an unscheduled dose/i.test(hxText(b)));
    if (!unscheduled) { if (tries < 12) setTimeout(openNative,90); else fail('Could not open the dose form.'); return; }
    unscheduled.click();
    setTimeout(fillNative, 100);
  };
  const fail = (msg) => { error.textContent=msg; error.hidden=false; saveButton.disabled=false; saveButton.textContent='Save dose'; };
  const fillNative = () => {
    let formTries = 0;
    const attempt = () => {
      formTries += 1;
      const medLabel = hxFindLabel(/^medication$/i);
      const doseLabel = hxFindLabel(/^dose$/i);
      const dateLabel = hxFindLabel(/^date\s*&\s*time$/i);
      const nativeSave = Array.from(document.querySelectorAll('button')).find((b) => /^log injection$/i.test(hxText(b)));
      if (!medLabel || !doseLabel || !nativeSave) { if (formTries < 12) setTimeout(attempt,90); else fail('Could not prepare the dose form.'); return; }
      hxSelectNativeMedication(payload.medication, (selected) => {
        if (!selected) { fail('Could not select that medication.'); return; }
        const doseInput = doseLabel.parentElement?.querySelector('input[type="number"]') || doseLabel.querySelector('input[type="number"]');
        const unitSelect = doseLabel.parentElement?.querySelector('select') || doseLabel.querySelector('select');
        const dateInput = dateLabel?.parentElement?.querySelector('input[type="date"]') || hxFindLabeledInput(/^date\s*&\s*time$/i,'date');
        const timeInput = dateLabel?.parentElement?.querySelector('input[type="time"]') || hxFindLabeledInput(/^date\s*&\s*time$/i,'time');
        if (!doseInput || !unitSelect) { fail('Could not fill the dose form.'); return; }
        hxSetInput(doseInput, String(payload.dose));
        hxSetInput(unitSelect, payload.unit);
        if (dateInput) hxSetInput(dateInput, payload.date);
        if (timeInput) hxSetInput(timeInput, payload.time);
        setTimeout(() => {
          const saveNow = Array.from(document.querySelectorAll('button')).find((b) => /^log injection$/i.test(hxText(b)));
          if (!saveNow) { fail('Could not save the dose.'); return; }
          saveNow.click();
          setTimeout(() => { hxRestorePage(returnPage); hxCloseDose(); }, 220);
        }, 80);
      });
    };
    attempt();
  };
  setTimeout(openNative, 70);
}
function hxShowDose(returnPage = hxPageKind()) {
  hxCloseDose();
  const options = hxDoseOptions();
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const first = options[0] || { medication:'', dose:'', unit:'mg' };
  const overlay = document.createElement('div');
  overlay.className = 'pt-v3-weight-modal pt-v3-dose-modal';
  overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-label','Log dose');
  overlay.innerHTML = `<div class="pt-v3-weight-modal__backdrop" data-close="1"></div><section class="pt-v3-weight-modal__sheet pt-v3-dose-modal__sheet"><div class="pt-v3-weight-modal__handle"></div><div class="pt-v3-weight-modal__head"><div><div class="pt-v3-weight-modal__eyebrow">QUICK ENTRY</div><h2>Log dose</h2><p>Record a dose without leaving Insights.</p></div><button type="button" class="pt-v3-weight-modal__close" data-close="1" aria-label="Close">×</button></div><label class="pt-v3-dose-field"><span>Medication</span><select data-hx="med">${options.length ? options.map((o)=>`<option value="${o.medication.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${o.medication.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</option>`).join('') : '<option value="">No saved protocols</option>'}</select></label><div class="pt-v3-dose-modal__row"><label class="pt-v3-dose-field"><span>Dose</span><input data-hx="dose" type="number" step="0.01" inputmode="decimal" value="${first.dose ?? ''}" placeholder="Amount"></label><label class="pt-v3-dose-field"><span>Unit</span><select data-hx="unit"><option value="mg">mg</option><option value="mcg">mcg</option><option value="ml">mL</option><option value="units">units</option><option value="IU">IU</option></select></label></div><div class="pt-v3-dose-modal__row"><label class="pt-v3-dose-field"><span>Date</span><input data-hx="date" type="date" value="${date}"></label><label class="pt-v3-dose-field"><span>Time</span><input data-hx="time" type="time" value="${time}"></label></div><div class="pt-v3-weight-modal__error" hidden>Enter a medication and dose.</div><button type="button" class="pt-v3-weight-modal__save">Save dose</button></section>`;
  const med=overlay.querySelector('[data-hx=med]'), dose=overlay.querySelector('[data-hx=dose]'), unit=overlay.querySelector('[data-hx=unit]'), dateEl=overlay.querySelector('[data-hx=date]'), timeEl=overlay.querySelector('[data-hx=time]'), error=overlay.querySelector('.pt-v3-weight-modal__error'), save=overlay.querySelector('.pt-v3-weight-modal__save');
  unit.value = first.unit || 'mg';
  med.addEventListener('change',()=>{ const match=options.find((o)=>o.medication===med.value); if(match){dose.value=match.dose ?? '';unit.value=match.unit || 'mg';} });
  overlay.addEventListener('click',(e)=>{ if(e.target.closest('[data-close="1"]')) hxCloseDose(); });
  save.addEventListener('click',()=>{ const d=Number(dose.value); if(!med.value || !(d>0)){error.hidden=false;dose.focus();return;} error.hidden=true;save.disabled=true;save.textContent='Saving…';hxSaveDose({medication:med.value,dose:d,unit:unit.value,date:dateEl.value,time:timeEl.value},returnPage,save,error); });
  dose.addEventListener('keydown',(e)=>{ if(e.key==='Enter') save.click(); if(e.key==='Escape') hxCloseDose(); });
  document.body.appendChild(overlay); document.documentElement.classList.add('pt-v3-modal-open'); setTimeout(()=>dose.focus(),40);
}

function hxEnsureInsightsActions() {
  if (!hxIsAnalysis()) return;
  const scope = document.querySelector('.app-frame') || document.body;
  if (scope.querySelector('.pt-insights-quick-actions')) return;
  const heading = Array.from(scope.querySelectorAll('h1,h2')).find((n) => /advanced analysis|insights/i.test(hxText(n)));
  const header = heading?.closest('.flex') || heading?.parentElement;
  if (!header) return;
  const actions = document.createElement('div');
  actions.className = 'pt-insights-quick-actions';
  actions.innerHTML = '<button type="button" data-hx-action="weight">Log weight</button><button type="button" data-hx-action="dose">Log dose</button>';
  actions.addEventListener('click',(e)=>{ const b=e.target.closest('button[data-hx-action]'); if(!b)return; if(b.dataset.hxAction==='weight')hxShowWeight('insights'); else hxShowDose('insights'); });
  header.insertAdjacentElement('afterend', actions);
}

let hxTimer=0;
function hxSchedule(delay=60){ clearTimeout(hxTimer); hxTimer=setTimeout(()=>requestAnimationFrame(()=>{hxEnsureInsightsTab();hxEnsureInsightsActions();}),delay); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>hxSchedule(120),{once:true}); else hxSchedule(80);
[300,800,1500].forEach((d)=>setTimeout(()=>{hxEnsureInsightsTab();hxEnsureInsightsActions();},d));
window.addEventListener('pageshow',()=>hxSchedule(60));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)hxSchedule(60)});
document.addEventListener('click',(event)=>{
  const button=event.target.closest('button');
  if (button && !button.closest('.pt-v3-weight-modal') && !button.closest('.pt-insights-quick-actions')) {
    if (/^log weight$/i.test(hxText(button)) && !hxBridgeWeight && ['today','progress','insights'].includes(hxPageKind())) {
      event.preventDefault(); event.stopImmediatePropagation(); hxShowWeight(hxPageKind()); return;
    }
    if ((/^log dose$/i.test(hxText(button)) || /^log an unscheduled dose$/i.test(hxText(button))) && hxIsAnalysis()) {
      event.preventDefault(); event.stopImmediatePropagation(); hxShowDose('insights'); return;
    }
  }
  if(event.target.closest('.peptalk-bottom-nav') || button) hxSchedule(100);
},{capture:true});