/* PepTalk 3.0 — informational draw-unit to mg equivalent.
 * Uses only the app's stored vial concentration/reconstitution data.
 * Event-driven and bounded: no MutationObserver and no health-data mutation.
 */
const deText=(n)=>String(n?.textContent||'').replace(/\s+/g,' ').trim();
const deRead=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}};
const deVials=()=>{const v=deRead('health-vials');return Array.isArray(v)?v:[]};
const deConc=(v)=>{if(!v)return 0;const c=Number(v.concentration);if(c>0)return c;const total=Number(v.totalMg),bac=Number(v.bacWaterMl);return total>0&&bac>0?total/bac:0};
function deLabelParent(scope,label){return Array.from(scope.querySelectorAll('label')).find(l=>deText(l).toLowerCase()===label.toLowerCase())?.parentElement||null}
function deMedication(scope,vials){
  const medParent=deLabelParent(scope,'Medication');
  if(medParent){
    const select=medParent.querySelector('select');
    if(select?.value)return select.value;
    const button=medParent.querySelector('button');
    const t=deText(button);
    if(t)return t;
  }
  const allSelects=Array.from(scope.querySelectorAll('select'));
  for(const s of allSelects){const value=String(s.value||'').trim();if(vials.some(v=>v.medication===value))return value}
  const text=deText(scope);
  const matches=[...new Set(vials.map(v=>v.medication).filter(Boolean).filter(m=>text.includes(m)))];
  return matches.length===1?matches[0]:null;
}
function deDoseControls(scope){
  const parent=deLabelParent(scope,'Dose')||Array.from(scope.querySelectorAll('label')).find(l=>/planned dose|dose amount|current planned dose/i.test(deText(l)))?.parentElement;
  if(!parent)return null;
  const input=parent.querySelector('input[type="number"]');
  const select=parent.querySelector('select');
  return input&&select?{parent,input,select}:null;
}
function deSelectedVial(scope,vials,med){
  const label=Array.from(scope.querySelectorAll('label')).find(l=>/use from vial|vial/i.test(deText(l)));
  const select=label?.parentElement?.querySelector('select');
  if(select?.value){const id=String(select.value);const exact=vials.find(v=>String(v.id)===id);if(exact)return exact}
  return vials.find(v=>v.medication===med&&deConc(v)>0&&(Number(v.remainingMg??v.totalMg)||0)>0)||vials.find(v=>v.medication===med&&deConc(v)>0)||null;
}
function deFormatMg(mg){if(mg>=10)return mg.toFixed(1).replace(/\.0$/,'');if(mg>=1)return mg.toFixed(2).replace(/0$/,'').replace(/\.$/,'');return mg.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')}
function deRender(scope){
  const controls=deDoseControls(scope);if(!controls)return;
  let helper=controls.parent.querySelector(':scope > .pt-v3-dose-equivalent');
  if(!helper){helper=document.createElement('div');helper.className='pt-v3-dose-equivalent is-hidden';controls.parent.appendChild(helper)}
  const unit=String(controls.select.value||'').toLowerCase();const dose=Number(controls.input.value);if(!(dose>0)||!['units','ml'].includes(unit)){helper.className='pt-v3-dose-equivalent is-hidden';return}
  const vials=deVials();const med=deMedication(scope,vials);if(!med){helper.className='pt-v3-dose-equivalent is-hidden';return}
  if(unit==='units'&&med==='Retatrutide'){
    const mg=dose/10;helper.className='pt-v3-dose-equivalent';helper.innerHTML=`<div class="pt-v3-dose-eq-main"><strong>${dose} units</strong> = <strong>${deFormatMg(mg)} mg</strong></div><div class="pt-v3-dose-eq-source">Retatrutide dial conversion used by PepTalk. Informational math only.</div>`;return;
  }
  const vial=deSelectedVial(scope,vials,med),conc=deConc(vial);
  if(!(conc>0)){
    helper.className='pt-v3-dose-equivalent is-warning';helper.innerHTML=`<div class="pt-v3-dose-eq-main">mg equivalent unavailable</div><div class="pt-v3-dose-eq-source">Add ${med} vial total mg + BAC water (or mg/mL concentration) so PepTalk can convert draw units to mg.</div>`;return;
  }
  const ml=unit==='units'?dose/100:dose;const mg=ml*conc;
  helper.className='pt-v3-dose-equivalent';helper.innerHTML=`<div class="pt-v3-dose-eq-main"><strong>${dose} ${unit}</strong> = <strong>${ml.toFixed(3)} mL</strong> ≈ <strong>${deFormatMg(mg)} mg</strong></div><div class="pt-v3-dose-eq-source">Using ${med}: ${conc.toFixed(2)} mg/mL${vial?' from your stored vial':''}. Informational math only.</div>`;
}
function deEnhance(){
  const candidates=Array.from(document.querySelectorAll('.ui-card,.ui-hero-panel,[role="dialog"]')).filter(n=>{const t=deText(n);return /log injection|edit injection|protocol editor|add protocol|edit protocol|schedule/i.test(t)&&/\bDose\b/i.test(t)});
  candidates.forEach(deRender);
}
let deTimer=0;function deSchedule(d=60){clearTimeout(deTimer);deTimer=setTimeout(()=>requestAnimationFrame(deEnhance),d)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>deSchedule(180),{once:true});else deSchedule(120);
[450,1100].forEach(d=>setTimeout(deEnhance,d));window.addEventListener('pageshow',()=>deSchedule(80));document.addEventListener('visibilitychange',()=>{if(!document.hidden)deSchedule(100)});
document.addEventListener('input',e=>{if(e.target.matches('input,select'))deSchedule(20)},{capture:true});document.addEventListener('change',e=>{if(e.target.matches('input,select'))deSchedule(20)},{capture:true});document.addEventListener('click',e=>{if(e.target.closest('.peptalk-bottom-nav,.more-menu,button'))deSchedule(120)},{capture:true});