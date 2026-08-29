/* PepTalk 3.0.1 — paired mg + syringe units and direct concentration setup.
 * Users can define concentration inside Protocol or Single Dose without creating Inventory.
 * Stored concentration math is informational and never invents a conversion.
 * Event-driven/bounded only: no MutationObserver.
 */
const deText=(n)=>String(n?.textContent||'').replace(/\s+/g,' ').trim();
const deRead=(key,fallback=[])=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}};
const deWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const deVials=()=>{const v=deRead('health-vials',[]);return Array.isArray(v)?v:[]};
const DE_PROFILE_KEY='health-dose-concentrations';
const deProfiles=()=>{const v=deRead(DE_PROFILE_KEY,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{}};
const deNorm=(s)=>String(s||'').trim();
const deKey=(s)=>deNorm(s).toLowerCase();
const deConc=(v)=>{if(!v)return 0;const c=Number(v.concentration);if(c>0)return c;const total=Number(v.totalMg),bac=Number(v.bacWaterMl);return total>0&&bac>0?total/bac:0};
function deProfile(med){const p=deProfiles();return p[deKey(med)]||null}
function deSaveProfile(med,next){
  if(!med)return;
  const all=deProfiles(),key=deKey(med);
  const clean={medication:med,totalMg:Number(next.totalMg)||0,bacWaterMl:Number(next.bacWaterMl)||0,concentration:Number(next.concentration)||0,updatedAt:new Date().toISOString()};
  if(!(clean.totalMg>0)&&!(clean.bacWaterMl>0)&&!(clean.concentration>0))delete all[key];else all[key]=clean;
  deWrite(DE_PROFILE_KEY,all);
}
function deLabelParent(scope,label){
  return Array.from(scope.querySelectorAll('label')).find(l=>{
    const own=deText(l.querySelector('span')||l).toLowerCase();
    return own===label.toLowerCase();
  })?.parentElement||null
}
function deMedication(scope){
  const medLabel=Array.from(scope.querySelectorAll('label')).find(l=>deText(l.querySelector('span')||l).toLowerCase()==='medication');
  if(medLabel){
    const select=medLabel.querySelector('select')||medLabel.parentElement?.querySelector('select');
    if(select?.value)return deNorm(select.value);
    const input=medLabel.querySelector('input')||medLabel.parentElement?.querySelector('input');
    if(input?.value)return deNorm(input.value);
  }
  const labelled=scope.querySelector('select[aria-label*="medication" i],input[aria-label*="medication" i]');
  if(labelled?.value)return deNorm(labelled.value);
  const vials=deVials(),text=deText(scope);
  const matches=[...new Set(vials.map(v=>v.medication).filter(Boolean).filter(m=>text.includes(m)))];
  return matches.length===1?matches[0]:null;
}
function deDoseControls(scope){
  const labels=Array.from(scope.querySelectorAll('label'));
  const doseLabel=labels.find(l=>/^dose$/i.test(deText(l.querySelector('span')||l)))||labels.find(l=>/planned dose|dose amount|current planned dose/i.test(deText(l.querySelector('span')||l)));
  const parent=doseLabel?.parentElement;
  if(!parent)return null;
  const input=doseLabel.querySelector('input[type="number"]')||parent.querySelector('input[type="number"]');
  let select=null;
  const siblings=parent.querySelectorAll('select');
  select=siblings[0]||null;
  if(!select){
    const unitLabel=labels.find(l=>/^unit$/i.test(deText(l.querySelector('span')||l)));
    select=unitLabel?.querySelector('select')||unitLabel?.parentElement?.querySelector('select')||null;
  }
  return input&&select?{parent,input,select}:null;
}
function deSelectedVial(scope,med){
  const vials=deVials();
  const label=Array.from(scope.querySelectorAll('label')).find(l=>/use from vial|vial/i.test(deText(l.querySelector('span')||l)));
  const select=label?.querySelector('select')||label?.parentElement?.querySelector('select');
  if(select?.value){
    const id=String(select.value),exact=vials.find(v=>String(v.id)===id);
    if(exact)return exact;
  }
  return vials.find(v=>v.medication===med&&deConc(v)>0&&(Number(v.remainingMg??v.totalMg)||0)>0)||vials.find(v=>v.medication===med&&deConc(v)>0)||null;
}
function deSource(scope,med){
  const p=deProfile(med);
  if(p){
    const c=Number(p.concentration)>0?Number(p.concentration):(Number(p.totalMg)>0&&Number(p.bacWaterMl)>0?Number(p.totalMg)/Number(p.bacWaterMl):0);
    if(c>0)return {conc:c,totalMg:Number(p.totalMg)||0,bacWaterMl:Number(p.bacWaterMl)||0,kind:'dose setup'};
  }
  const vial=deSelectedVial(scope,med),c=deConc(vial);
  if(c>0)return {conc:c,totalMg:Number(vial.totalMg)||0,bacWaterMl:Number(vial.bacWaterMl)||0,kind:'saved vial'};
  return null;
}
function deFormatMg(mg){if(mg>=10)return mg.toFixed(1).replace(/\.0$/,'');if(mg>=1)return mg.toFixed(2).replace(/0$/,'').replace(/\.$/,'');return mg.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')}
function deFormatUnits(u){return Number.isInteger(u)?String(u):u.toFixed(1).replace(/\.0$/,'')}
function dePairFromDose(dose,unit,conc,med){
  const u=String(unit||'').toLowerCase();
  if(!(dose>0))return null;
  if(med==='Retatrutide'&&!(conc>0)){
    if(u==='units')return {mg:dose/10,units:dose,ml:null,special:'Retatrutide dial conversion'};
    if(u==='mg')return {mg:dose,units:dose*10,ml:null,special:'Retatrutide dial conversion'};
  }
  if(!(conc>0))return null;
  if(u==='units'){const ml=dose/100;return {mg:ml*conc,units:dose,ml}}
  if(u==='ml'){return {mg:dose*conc,units:dose*100,ml:dose}}
  if(u==='mg'){const ml=dose/conc;return {mg:dose,units:ml*100,ml}}
  if(u==='mcg'){const mg=dose/1000,ml=mg/conc;return {mg,units:ml*100,ml}}
  return null;
}
function dePanelValues(scope,med){
  const p=deProfile(med);
  if(p)return {totalMg:p.totalMg||'',bacWaterMl:p.bacWaterMl||'',concentration:p.concentration||'',source:'Dose setup'};
  const vial=deSelectedVial(scope,med);
  if(vial&&deConc(vial)>0)return {totalMg:vial.totalMg||'',bacWaterMl:vial.bacWaterMl||'',concentration:vial.concentration||'',source:'Prefilled from saved vial'};
  return {totalMg:'',bacWaterMl:'',concentration:'',source:''};
}
function deEnsurePanel(scope,controls){
  const med=deMedication(scope);if(!med)return;
  let panel=scope.querySelector('.pt-v3-concentration-panel');
  if(!panel){
    panel=document.createElement('div');
    panel.className='pt-v3-concentration-panel';
    panel.innerHTML=`<div class="pt-v3-conc-head"><div><div class="pt-v3-conc-eyebrow">DOSE CONCENTRATION</div><div class="pt-v3-conc-title">Vial strength + BAC water</div></div><div class="pt-v3-conc-badge">No inventory required</div></div>
      <div class="pt-v3-conc-grid">
        <label><span>Vial strength</span><div class="pt-v3-input-suffix"><input data-de="total" type="number" min="0" step="any" inputmode="decimal" placeholder="5"><b>mg</b></div></label>
        <label><span>BAC water</span><div class="pt-v3-input-suffix"><input data-de="bac" type="number" min="0" step="any" inputmode="decimal" placeholder="2"><b>mL</b></div></label>
      </div>
      <div class="pt-v3-conc-direct"><span>or known concentration</span><div class="pt-v3-input-suffix"><input data-de="conc" type="number" min="0" step="any" inputmode="decimal" placeholder="2.5"><b>mg/mL</b></div></div>
      <div class="pt-v3-conc-result" data-de="result">Enter vial strength and BAC water to calculate concentration.</div>
      <div class="pt-v3-conc-foot">Saved for this medication's dose math. This does not add a vial to Inventory.</div>`;
    controls.parent.parentElement?.insertBefore(panel,controls.parent);
    panel.addEventListener('input',()=>{
      const currentMed=deMedication(scope);if(!currentMed)return;
      const total=panel.querySelector('[data-de="total"]').value;
      const bac=panel.querySelector('[data-de="bac"]').value;
      const direct=panel.querySelector('[data-de="conc"]').value;
      deSaveProfile(currentMed,{totalMg:total,bacWaterMl:bac,concentration:direct});
      deUpdatePanelResult(panel,currentMed);
      deRender(scope);
    });
  }
  if(panel.dataset.med!==med){
    const values=dePanelValues(scope,med);
    panel.dataset.med=med;
    panel.querySelector('[data-de="total"]').value=values.totalMg;
    panel.querySelector('[data-de="bac"]').value=values.bacWaterMl;
    panel.querySelector('[data-de="conc"]').value=values.concentration;
  }
  deUpdatePanelResult(panel,med);
}
function deUpdatePanelResult(panel,med){
  const total=Number(panel.querySelector('[data-de="total"]')?.value),bac=Number(panel.querySelector('[data-de="bac"]')?.value),direct=Number(panel.querySelector('[data-de="conc"]')?.value);
  const c=direct>0?direct:(total>0&&bac>0?total/bac:0),out=panel.querySelector('[data-de="result"]');
  if(!out)return;
  if(c>0){
    const ten=(10/100)*c,twenty=(20/100)*c;
    out.innerHTML=`<strong>${c.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')} mg/mL</strong><span>10 units = ${deFormatMg(ten)} mg · 20 units = ${deFormatMg(twenty)} mg</span>`;
    panel.classList.add('is-ready');
  }else{
    out.textContent=`Set ${med} concentration to pair mg with syringe units.`;
    panel.classList.remove('is-ready');
  }
}
function deRender(scope){
  const controls=deDoseControls(scope);if(!controls)return;
  deEnsurePanel(scope,controls);
  let helper=controls.parent.querySelector(':scope > .pt-v3-dose-equivalent');
  if(!helper){helper=document.createElement('div');helper.className='pt-v3-dose-equivalent is-hidden';controls.parent.appendChild(helper)}
  const unit=String(controls.select.value||'').toLowerCase(),dose=Number(controls.input.value),med=deMedication(scope);
  if(!(dose>0)||!med){helper.className='pt-v3-dose-equivalent is-hidden';return}
  const src=deSource(scope,med),pair=dePairFromDose(dose,unit,src?.conc||0,med);
  if(!pair){
    if(['units','ml','mg','mcg'].includes(unit)){
      helper.className='pt-v3-dose-equivalent is-warning';
      helper.innerHTML=`<div class="pt-v3-dose-eq-main">Set concentration to pair mg + units</div><div class="pt-v3-dose-eq-source">Enter vial strength and BAC water above. You do not need to add the vial to Inventory.</div>`;
    }else helper.className='pt-v3-dose-equivalent is-hidden';
    return;
  }
  helper.className='pt-v3-dose-equivalent';
  const volume=pair.ml!=null?`<span>${pair.ml.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')} mL</span>`:'';
  helper.innerHTML=`<div class="pt-v3-dose-eq-pair"><strong>${deFormatMg(pair.mg)} mg</strong><i>·</i><strong>${deFormatUnits(pair.units)} units</strong></div><div class="pt-v3-dose-eq-source">${volume}${src?.conc?`<span>${src.conc.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')} mg/mL · ${src.kind}</span>`:`<span>${pair.special||''}</span>`}</div>`;
}
function deEnhance(){
  const candidates=Array.from(document.querySelectorAll('[role="dialog"],.ui-card,.ui-hero-panel')).filter(n=>{
    const t=deText(n);return /\bDose\b/i.test(t)&&(/medication/i.test(t)||/protocol editor|log injection|edit injection|add dose|single dose/i.test(t));
  });
  const scopes=[];
  candidates.forEach(n=>{
    const dialog=n.closest('[role="dialog"]');
    const scope=dialog||n;
    if(!scopes.includes(scope))scopes.push(scope);
  });
  scopes.forEach(deRender);
}
let deTimer=0;function deSchedule(d=60){clearTimeout(deTimer);deTimer=setTimeout(()=>requestAnimationFrame(deEnhance),d)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>deSchedule(180),{once:true});else deSchedule(120);
[450,1100,1900].forEach(d=>setTimeout(deEnhance,d));
window.addEventListener('pageshow',()=>deSchedule(80));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)deSchedule(100)});
document.addEventListener('input',e=>{if(e.target.matches('input,select')&&!e.target.closest('.pt-v3-concentration-panel'))deSchedule(20)},{capture:true});
document.addEventListener('change',e=>{if(e.target.matches('input,select'))deSchedule(20)},{capture:true});
document.addEventListener('click',e=>{if(e.target.closest('.peptalk-bottom-nav,.more-menu,button'))deSchedule(120)},{capture:true});