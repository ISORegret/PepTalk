/* PepTalk 3.0.2 — native protocol/single-dose concentration UI.
 * Matches PepTalk's real label markup where label text includes the control value/options.
 * No MutationObserver; bounded/event-driven only.
 */
const dxText=n=>String(n?.textContent||'').replace(/\s+/g,' ').trim();
const DX_KEY='health-dose-concentrations';
const dxRead=()=>{try{const v=JSON.parse(localStorage.getItem(DX_KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return{}}};
const dxSave=(med,p)=>{if(!med)return;try{const all=dxRead();all[String(med).trim().toLowerCase()]={medication:med,totalMg:Number(p.totalMg)||0,bacWaterMl:Number(p.bacWaterMl)||0,concentration:Number(p.concentration)||0,updatedAt:new Date().toISOString()};localStorage.setItem(DX_KEY,JSON.stringify(all));window.dispatchEvent(new Event('peptalk-dose-concentrations-changed'))}catch{}};
const dxFmt=n=>{const x=Number(n);if(!Number.isFinite(x))return'';return x.toFixed(x>=10?1:x>=1?2:3).replace(/0+$/,'').replace(/\.$/,'')};
const dxCaption=l=>{if(!l)return'';for(const n of l.childNodes){if(n.nodeType===3&&String(n.textContent||'').trim())return String(n.textContent).trim()}return dxText(l.querySelector(':scope > span')||l).split(/\s{2,}/)[0].trim()};
function dxField(label){return label?.querySelector('input,select')||null}
function dxFindForm(medLabel){
  let n=medLabel;
  for(let i=0;i<10&&n;i++,n=n.parentElement){
    const labels=Array.from(n.querySelectorAll('label'));
    const dose=labels.find(l=>/^dose\b/i.test(dxCaption(l))||/planned dose|dose amount/i.test(dxCaption(l)));
    const unit=labels.find(l=>/^unit\b/i.test(dxCaption(l)));
    if(dose&&dxField(dose)&&(unit&&dxField(unit)))return {root:n,doseLabel:dose,unitLabel:unit};
  }
  return null;
}
function dxMed(medLabel){return String(dxField(medLabel)?.value||'').trim()}
function dxDose(form){return {input:dxField(form.doseLabel),unit:dxField(form.unitLabel)}}
function dxProfile(med){return dxRead()[String(med||'').trim().toLowerCase()]||null}
function dxConc(p){if(!p)return 0;const direct=Number(p.concentration);if(direct>0)return direct;const mg=Number(p.totalMg),ml=Number(p.bacWaterMl);return mg>0&&ml>0?mg/ml:0}
function dxPair(dose,unit,conc){const d=Number(dose),u=String(unit||'').toLowerCase();if(!(d>0)||!(conc>0))return null;if(u==='units'){const ml=d/100;return{mg:ml*conc,units:d,ml}}if(u==='mg'){const ml=d/conc;return{mg:d,units:ml*100,ml}}if(u==='mcg'){const mg=d/1000,ml=mg/conc;return{mg,units:ml*100,ml}}if(u==='ml')return{mg:d*conc,units:d*100,ml:d};return null}
function dxRender(panel,doseCtl){const total=Number(panel.querySelector('[data-dx=total]').value),bac=Number(panel.querySelector('[data-dx=bac]').value),direct=Number(panel.querySelector('[data-dx=conc]').value),conc=direct>0?direct:(total>0&&bac>0?total/bac:0),result=panel.querySelector('[data-dx=result]'),pairOut=panel.querySelector('[data-dx=pair]');if(conc>0){result.innerHTML=`<strong>${dxFmt(conc)} mg/mL</strong><span>10 units = ${dxFmt(conc*.1)} mg · 20 units = ${dxFmt(conc*.2)} mg</span>`;panel.classList.add('is-ready')}else{result.textContent='Enter vial strength and BAC water to calculate mg ↔ units.';panel.classList.remove('is-ready')}const pair=dxPair(doseCtl?.input?.value,doseCtl?.unit?.value,conc);if(pair){pairOut.innerHTML=`<strong>${dxFmt(pair.mg)} mg</strong><i>·</i><strong>${dxFmt(pair.units)} units</strong><small>${dxFmt(pair.ml)} mL draw</small>`;pairOut.hidden=false}else pairOut.hidden=true}
function dxAttach(medLabel){
  const form=dxFindForm(medLabel),med=dxMed(medLabel);if(!form||!med)return;const doseCtl=dxDose(form);if(!doseCtl.input||!doseCtl.unit)return;
  let panel=form.root.querySelector('.pt-v3-concentration-panel[data-dx-panel="1"]');
  if(!panel){panel=document.createElement('section');panel.className='pt-v3-concentration-panel';panel.dataset.dxPanel='1';panel.innerHTML=`<div class="pt-v3-conc-head"><div><div class="pt-v3-conc-eyebrow">DOSE CONCENTRATION</div><div class="pt-v3-conc-title">Vial strength + BAC water</div></div><div class="pt-v3-conc-badge">No inventory required</div></div><div class="pt-v3-conc-grid"><label><span>Vial strength</span><div class="pt-v3-input-suffix"><input data-dx="total" type="number" min="0" step="any" inputmode="decimal" placeholder="5"><b>mg</b></div></label><label><span>BAC water</span><div class="pt-v3-input-suffix"><input data-dx="bac" type="number" min="0" step="any" inputmode="decimal" placeholder="2"><b>mL</b></div></label></div><div class="pt-v3-conc-direct"><span>or known concentration</span><div class="pt-v3-input-suffix"><input data-dx="conc" type="number" min="0" step="any" inputmode="decimal" placeholder="2.5"><b>mg/mL</b></div></div><div class="pt-v3-conc-result" data-dx="result"></div><div class="pt-v3-dose-eq-pair" data-dx="pair" hidden></div><div class="pt-v3-conc-foot">Used for dose math only. This does not create an Inventory vial.</div>`;const row=form.doseLabel.parentElement;row.insertAdjacentElement('beforebegin',panel);panel.addEventListener('input',()=>{const current=dxMed(medLabel);dxSave(current,{totalMg:panel.querySelector('[data-dx=total]').value,bacWaterMl:panel.querySelector('[data-dx=bac]').value,concentration:panel.querySelector('[data-dx=conc]').value});dxRender(panel,dxDose(form))})}
  if(panel.dataset.dxMed!==med){const p=dxProfile(med)||{};panel.dataset.dxMed=med;panel.querySelector('[data-dx=total]').value=p.totalMg||'';panel.querySelector('[data-dx=bac]').value=p.bacWaterMl||'';panel.querySelector('[data-dx=conc]').value=p.concentration||''}dxRender(panel,doseCtl)
}
function dxBuild(){Array.from(document.querySelectorAll('label')).filter(l=>/^medication\b/i.test(dxCaption(l))||/^compound\b/i.test(dxCaption(l))).forEach(dxAttach)}
let dxTimer=0;const dxQueue=(d=50)=>{clearTimeout(dxTimer);dxTimer=setTimeout(()=>requestAnimationFrame(dxBuild),d)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>dxQueue(150),{once:true});else dxQueue(80);[300,700,1300,2200].forEach(d=>setTimeout(dxBuild,d));window.addEventListener('pageshow',()=>dxQueue(80));document.addEventListener('visibilitychange',()=>{if(!document.hidden)dxQueue(80)});document.addEventListener('click',e=>{if(e.target.closest('button,.peptalk-bottom-nav,.more-menu'))dxQueue(100)},{capture:true});document.addEventListener('change',e=>{if(e.target.matches('select,input'))dxQueue(25)},{capture:true});document.addEventListener('input',e=>{if(e.target.matches('input')&&!e.target.closest('[data-dx-panel="1"]'))dxQueue(25)},{capture:true});
