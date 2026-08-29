/* PepTalk 3.0.1 — show actual dose + syringe draw together wherever concentration is known.
 * Presentation only. Reads stored dose concentration / vial concentration; never guesses.
 * Bounded/event-driven only; no MutationObserver.
 */
const ddRead=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}};
const ddProfiles=()=>{const v=ddRead('health-dose-concentrations',{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{}};
const ddVials=()=>{const v=ddRead('health-vials',[]);return Array.isArray(v)?v:[]};
const ddSchedules=()=>{const v=ddRead('health-schedules',[]);return Array.isArray(v)?v:[]};
const ddEntries=()=>{const v=ddRead('health-injection-entries',[]);return Array.isArray(v)?v:[]};
const ddKey=s=>String(s||'').trim().toLowerCase();
const ddText=n=>String(n?.textContent||'').replace(/\s+/g,' ').trim();
function ddConc(med){
  const p=ddProfiles()[ddKey(med)];
  if(p){const direct=Number(p.concentration);if(direct>0)return direct;const total=Number(p.totalMg),bac=Number(p.bacWaterMl);if(total>0&&bac>0)return total/bac}
  const candidates=ddVials().filter(v=>ddKey(v.medication)===ddKey(med));
  for(const v of candidates){const direct=Number(v.concentration);if(direct>0)return direct;const total=Number(v.totalMg),bac=Number(v.bacWaterMl);if(total>0&&bac>0)return total/bac}
  return 0;
}
function ddPair(dose,unit,med){
  const d=Number(dose),u=ddKey(unit),c=ddConc(med);if(!(d>0)||!(c>0))return null;
  if(u==='mg'){const ml=d/c;return{mg:d,units:ml*100}}
  if(u==='mcg'){const mg=d/1000,ml=mg/c;return{mg,units:ml*100}}
  if(u==='units'||u==='unit'){const ml=d/100;return{mg:ml*c,units:d}}
  if(u==='ml'){return{mg:d*c,units:d*100}}
  return null;
}
function ddMg(v){if(v>=10)return v.toFixed(1).replace(/\.0$/,'');if(v>=1)return v.toFixed(2).replace(/0$/,'').replace(/\.$/,'');return v.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')}
function ddUnits(v){return Number.isInteger(v)?String(v):v.toFixed(1).replace(/\.0$/,'')}
function ddLabel(pair){return `${ddMg(pair.mg)} mg · ${ddUnits(pair.units)} units`}
function ddKnownMeds(){return [...new Set([...ddSchedules().map(x=>x.medication),...ddEntries().map(x=>x.type),...ddVials().map(x=>x.medication),...Object.values(ddProfiles()).map(x=>x.medication)].filter(Boolean))].sort((a,b)=>String(b).length-String(a).length)}
function ddMedIn(text,meds){const low=String(text||'').toLowerCase();return meds.find(m=>low.includes(String(m).toLowerCase()))||null}
function ddReplaceDose(el,med){
  if(!el||!med)return false;const text=ddText(el);if(!text||/\bmg\s*·\s*[\d.]+\s*units\b/i.test(text))return false;
  const match=text.match(/([\d.]+)\s*(mg|mcg|units?|mL)\b/i);if(!match)return false;
  const pair=ddPair(match[1],match[2],med);if(!pair)return false;
  const replacement=ddLabel(pair);el.textContent=text.replace(match[0],replacement);el.dataset.ptDosePair='1';return true;
}
function ddToday(meds){
  document.querySelectorAll('h3').forEach(h=>{
    const med=meds.find(m=>ddText(h)===String(m));if(!med)return;
    const box=h.parentElement;if(!box)return;
    const doseLine=Array.from(box.querySelectorAll('p')).find(p=>/([\d.]+)\s*(mg|mcg|units?|mL)\b/i.test(ddText(p)));
    if(doseLine)ddReplaceDose(doseLine,med);
  });
}
function ddProtocols(){
  document.querySelectorAll('.pt-v3-protocol-row').forEach(row=>{
    const edit=row.querySelector('button[aria-label^="Edit "]');const med=(edit?.getAttribute('aria-label')||'').replace(/^Edit\s+/,'').replace(/\s+protocol$/,'');
    const chip=row.querySelector('.pt-v3-protocol-meta .pt-v3-protocol-chip:first-child');if(chip)ddReplaceDose(chip,med);
  });
}
function ddCalendar(meds){
  document.querySelectorAll('.pt-v3-agenda-row').forEach(row=>{const med=ddMedIn(ddText(row.querySelector('.pt-v3-agenda-med')),meds);const meta=row.querySelector('.pt-v3-agenda-meta');if(med&&meta)ddReplaceDose(meta,med)});
}
function ddHistory(meds){
  document.querySelectorAll('.pt-v3-dose-row').forEach(row=>{
    const med=ddMedIn(row.dataset.ptSearch||ddText(row),meds);if(!med)return;
    const nodes=Array.from(row.querySelectorAll('p,span,div')).filter(n=>n.children.length===0&&/([\d.]+)\s*(mg|mcg|units?|mL)\b/i.test(ddText(n)));
    if(nodes[0])ddReplaceDose(nodes[0],med);
  });
}
function ddBuild(){const meds=ddKnownMeds();if(!meds.length)return;ddToday(meds);ddProtocols();ddCalendar(meds);ddHistory(meds)}
let ddTimer=0;function ddQueue(delay=80){clearTimeout(ddTimer);ddTimer=setTimeout(()=>requestAnimationFrame(ddBuild),delay)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>ddQueue(180),{once:true});else ddQueue(120);
[450,1100,1900].forEach(d=>setTimeout(ddBuild,d));
window.addEventListener('pageshow',()=>ddQueue(80));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)ddQueue(100)});
document.addEventListener('click',e=>{if(e.target.closest('button,.peptalk-bottom-nav,.more-menu'))ddQueue(140)},{capture:true});
document.addEventListener('change',e=>{if(e.target.matches('input,select'))ddQueue(80)},{capture:true});
