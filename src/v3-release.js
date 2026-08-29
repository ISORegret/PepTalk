/* PepTalk 3.0 — final navigation, changelog and backup-status cleanup.
 * Presentation only. No stored health/protocol data is modified.
 */
const rText=n=>String(n?.textContent||'').replace(/\s+/g,' ').trim();
const RELEASE='3.0.0';
document.documentElement.dataset.peptalkVersion=RELEASE;
const META={
  Profile:['Account & backup','Cloud, profile and preferences'],
  Body:['Body','Measurements and progress photos'],
  Doses:['History','Dose administrations and edits'],
  Calendar:['Calendar','Agenda, month and adherence'],
  Tools:['Data & alerts','Notifications, exports and utilities'],
  Labs:['Labs','Bloodwork history and trends'],
  Help:['Help','Version, changelog and support'],
};
function rMore(){
  const menu=document.querySelector('.more-menu');if(!menu)return;
  Array.from(menu.querySelectorAll('.more-menu-item')).forEach(btn=>{
    const spans=Array.from(btn.querySelectorAll('span'));const labelNode=spans.find(s=>META[rText(s)]||rText(s)==='Wellness');if(!labelNode)return;const label=rText(labelNode);
    if(label==='Wellness'){btn.classList.add('pt-v3-hidden-legacy');btn.setAttribute('aria-hidden','true');return}
    const [title,copy]=META[label];btn.classList.add('pt-v3-more-row');labelNode.textContent=title;labelNode.classList.add('pt-v3-more-title');
    if(!btn.querySelector('.pt-v3-more-copy')){const c=document.createElement('span');c.className='pt-v3-more-copy';c.textContent=copy;labelNode.insertAdjacentElement('afterend',c)}
    if(!btn.querySelector('.pt-v3-more-chevron')){const ch=document.createElement('span');ch.className='pt-v3-more-chevron';ch.setAttribute('aria-hidden','true');ch.textContent='›';btn.appendChild(ch)}
  });
}
function rTrackExports(){
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=rText(b);if(/export|download backup|backup file/i.test(t)){try{localStorage.setItem('peptalk-last-export-at',new Date().toISOString())}catch{}}},{capture:true,once:false});
}
function rBackup(){
  const active=Array.from(document.querySelectorAll('.more-menu-item')).find(b=>b.classList.contains('menu-3d-item-active'));if(!active||!/account|profile/i.test(rText(active)))return;
  const scope=document.querySelector('.app-frame')||document.querySelector('.app-shell');if(!scope||scope.querySelector('.pt-v3-backup-health'))return;
  const cloudCard=Array.from(scope.querySelectorAll('.ui-card')).find(c=>/account & cloud backup/i.test(rText(c)));if(!cloudCard)return;
  let lastExport=null;try{lastExport=localStorage.getItem('peptalk-last-export-at')}catch{}
  const syncMatch=rText(cloudCard).match(/Last cloud sync:\s*([^]+?)(?:Sync now|Sign out|$)/i);const cloud=syncMatch?.[1]?.trim()||(/Signed in as/i.test(rText(cloudCard))?'Enabled':'On-device / not signed in');
  const card=document.createElement('section');card.className='pt-v3-backup-health';card.innerHTML=`<div class="pt-v3-release-kicker">BACKUP HEALTH</div><div class="pt-v3-release-title">Your data status</div><div class="pt-v3-backup-grid"><div class="pt-v3-backup-stat"><span>Cloud</span><strong>${cloud}</strong></div><div class="pt-v3-backup-stat"><span>Last export</span><strong>${lastExport?new Date(lastExport).toLocaleString():'Not tracked yet'}</strong></div></div><div class="pt-v3-release-copy">PepTalk stores data on this device. Cloud state comes from your Profile session; export time is recorded when you use an export/backup action.</div>`;cloudCard.insertAdjacentElement('afterend',card);
}
function rAdvanced(){
  const tech=document.querySelector('.pt-collapsible-tech');if(!tech)return;const card=tech.closest('.ui-card')||tech.parentElement;if(!card||card.querySelector('.pt-v3-advanced-toggle'))return;
  const b=document.createElement('button');b.type='button';b.className='pt-v3-advanced-toggle';b.textContent='Show advanced deployment details';b.addEventListener('click',()=>{const on=card.classList.toggle('pt-v3-show-tech');b.textContent=on?'Hide advanced deployment details':'Show advanced deployment details'});tech.insertAdjacentElement('beforebegin',b);
}
function rHelp(){
  const active=Array.from(document.querySelectorAll('.more-menu-item')).find(b=>b.classList.contains('menu-3d-item-active'));if(!active||!/help/i.test(rText(active)))return;
  const scope=document.querySelector('.app-frame')||document.querySelector('.app-shell');if(!scope||scope.querySelector('.pt-v3-release-card'))return;
  const candidates=Array.from(scope.querySelectorAll('.ui-card,.ui-hero-panel'));const anchor=candidates.find(c=>/help|about|version|support/i.test(rText(c)))||candidates[candidates.length-1];if(!anchor)return;
  const card=document.createElement('section');card.className='pt-v3-release-card';card.innerHTML=`<div class="pt-v3-release-kicker">CHANGELOG</div><div class="pt-v3-release-title">PepTalk 3.0</div><div class="pt-v3-release-copy">A focused rebuild around protocols, dose history, weight, inventory and analysis.</div><ul class="pt-v3-release-list"><li>Today command center and simplified navigation</li><li>Weight-first progress view and single Stack Response in Insights</li><li>Rebuilt protocol, history, inventory and agenda-first calendar surfaces</li><li>Draw-unit ↔ mg equivalent shown from stored vial concentration</li><li>Cleaner More menu, backup status, release notes and reduced legacy clutter</li><li>Mint-first visual system, stronger contrast and calmer motion</li></ul><span class="pt-v3-release-badge">Version ${RELEASE}</span>`;anchor.insertAdjacentElement('afterend',card);
}
function rHideLegacy(){
  const banned=['Fasting Window Tracker','Goals & peptides','Journal Entries'];
  Array.from(document.querySelectorAll('h2,h3')).forEach(h=>{if(!banned.includes(rText(h)))return;const surface=h.closest('.ui-card,.ui-hero-panel')||h.parentElement;surface?.classList.add('pt-v3-hidden-legacy')});
}
function rBuild(){rMore();rBackup();rAdvanced();rHelp();rHideLegacy()}
let rTimer=0;function rSchedule(d=80){clearTimeout(rTimer);rTimer=setTimeout(()=>requestAnimationFrame(rBuild),d)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>rSchedule(180),{once:true});else rSchedule(100);[400,1000,1800].forEach(d=>setTimeout(rBuild,d));window.addEventListener('pageshow',()=>rSchedule(80));document.addEventListener('visibilitychange',()=>{if(!document.hidden)rSchedule(100)});document.addEventListener('click',e=>{if(e.target.closest('.peptalk-bottom-nav,.more-menu'))rSchedule(130)},{capture:true});rTrackExports();