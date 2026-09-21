const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;$('#date').value=today;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let fixtures=[];let firstLoad=true;
$$('.nav').forEach(b=>b.onclick=()=>{$$('.nav').forEach(x=>x.classList.remove('active'));$$('.page').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.page).classList.add('active');if(b.dataset.page==='calibration')renderCalibration();if(b.dataset.page==='journal')renderJournal()});
function marketNoVig(o){if(!o?.home||!o?.draw||!o?.away)return null;const a=1/o.home,b=1/o.draw,c=1/o.away,t=a+b+c;return [a/t,b/t,c/t]}
function render(list=fixtures){$('#fixtures').innerHTML=list.length?list.map(f=>{const p=marketNoVig(f.odds);return `<article class="card"><div class="league">${esc(f.league.name)} · ${esc(f.league.country||'')}</div><div class="teams"><span>${esc(f.home.name)}</span><span class="time">${esc(f.time)}</span><span>${esc(f.away.name)}</span></div><div class="odds">${f.odds?.home?`<span>1 ${f.odds.home}</span><span>X ${f.odds.draw}</span><span>2 ${f.odds.away}</span>`:'<span>Cotes non disponibles</span>'}</div>${p?`<div class="muted" style="margin-top:9px">Marché sans marge: ${(p[0]*100).toFixed(1)}% · ${(p[1]*100).toFixed(1)}% · ${(p[2]*100).toFixed(1)}%</div>`:''}</article>`}).join(''):'<div class="notice amber">Aucun match majeur homme trouvé pour cette date dans le programme Pronosoft actuellement publié.</div>'}
async function load(){const d=$('#date').value;$('#sourceStatus').textContent='Lecture de Pronosoft…';try{const r=await fetch(`/api/football?date=${encodeURIComponent(d)}&debug=1&_=${Date.now()}`,{cache:'no-store'});const j=await r.json();

if(firstLoad && (j.results??0)===0 && Array.isArray(j.availableDates) && j.availableDates.length && !j.availableDates.includes(d)){
  firstLoad=false;
  const future=j.availableDates.find(x=>x>=d) || j.availableDates[0];
  if(future){
    $('#date').value=future;
    return load();
  }
}
firstLoad=false;

fixtures=j.fixtures||[];
$('#matchCount').textContent=j.results??0;
$('#activeDate').textContent=$('#date').value;
$('#leagueCount').textContent=Object.keys(j.leagueCounts||{}).length;
$('#parserState').textContent=`API ${j.parserVersion||j.version||'?'}`;
const ok=(j.sourceStatus||[]).filter(x=>x.ok).length;
$('#sourceStatus').innerHTML=`Source Pronosoft accessible: <b>${ok}/${(j.sourceStatus||[]).length}</b> · parser <b>${esc(j.parserVersion)}</b>${j.availableDates?.length?` · dates trouvées: ${j.availableDates.map(esc).join(', ')}`:''}`;
$('#leagues').innerHTML=Object.entries(j.leagueCounts||{}).map(([n,c])=>`<span class="chip">${esc(n)} <b>${c}</b></span>`).join('');
render()
}catch(e){$('#sourceStatus').innerHTML=`<span class="bad">Erreur API: ${esc(e.message)}</span>`}}
$('#refresh').onclick=load;$('#date').onchange=load;$('#search').oninput=e=>{const q=e.target.value.toLowerCase();render(fixtures.filter(f=>(f.home.name+' '+f.away.name+' '+f.league.name).toLowerCase().includes(q)))};
function signals(){try{return JSON.parse(localStorage.getItem('ba_signals')||'[]')}catch{return []}}
function renderCalibration(){const s=signals().filter(x=>typeof x.probability==='number'&&typeof x.outcome==='number');if(!s.length){$('#calibrationBox').innerHTML='<b>Données insuffisantes.</b><p class="muted">BET ANALYTICS n’affiche pas de Brier artificiel. Les probabilités devront être enregistrées avant match puis comparées au résultat.</p>';return}const b=s.reduce((a,x)=>a+(x.probability-x.outcome)**2,0)/s.length;$('#brier').textContent=b.toFixed(3);$('#sampleLabel').textContent=`${s.length} prédictions`;$('#calibrationBox').innerHTML=`<h3>Brier ${b.toFixed(3)}</h3><p>${s.length} prédictions réglées.</p>`}
function renderJournal(){const s=signals();$('#journalBox').innerHTML=s.length?`<table><tr><th>Date</th><th>Sélection</th><th>Prob.</th><th>Résultat</th></tr>${s.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.label)}</td><td>${(x.probability*100).toFixed(1)}%</td><td>${x.outcome===1?'✅':x.outcome===0?'❌':'—'}</td></tr>`).join('')}</table>`:'<p class="muted">Aucun signal enregistré.</p>'}
load();renderCalibration();
