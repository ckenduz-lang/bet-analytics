import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import{Activity,CalendarDays,Database,Goal,Search,ShieldCheck,Trophy,RefreshCw,Star,Clock3,Flame,LineChart,CheckCircle2,AlertTriangle,XCircle}from'lucide-react';
import'./style.css';

const TOP_LEAGUES=['Norvège · Eliteserien','Finlande · Veikkausliiga','Turquie · Süper Lig','MLS','Italie · Serie A','France · Ligue 1','Angleterre · Premier League','Danemark · Superliga','Pays-Bas · Eredivisie','Espagne · LaLiga','Allemagne · Bundesliga','Chine · Chinese Super League','Europe · UEFA Champions League'];
const today=()=>new Date().toISOString().slice(0,10);
const statusLabel=s=>s==='PREMIUM'?'⭐⭐⭐ PREMIUM':s==='WATCH'?'⭐⭐ À SURVEILLER':'❌ REJETÉ';
const statusIcon=s=>s==='PREMIUM'?<CheckCircle2/>:s==='WATCH'?<AlertTriangle/>:<XCircle/>;
const fmt=v=>v===null||v===undefined?'—':v;

function ScorerCard({x,onTrack,tracked}){
  return <article className={`scorerCard scorer-${x.status.toLowerCase()}`}>
    <div className="scorerHead">
      <div className="playerIdentity">{x.photo&&<img src={x.photo} alt=""/>}<div><h4>{x.player}</h4><p>{x.teamName} · {x.side==='home'?'Domicile':'Extérieur'} · {x.position||'poste non fourni'}</p></div></div>
      <div className={`scorerStatus ${x.status}`}>{statusIcon(x.status)} {statusLabel(x.status)}</div>
    </div>
    <div className="scoreStrip">
      <div><strong>{x.indispensableScore}</strong><span>Indispensable /100</span></div>
      <div><strong>{x.formContextScore}</strong><span>Forme & contexte /100</span></div>
      <div><strong>{x.dataCompleteness}%</strong><span>Données complètes</span></div>
    </div>
    <div className="factorGrid">
      <div><span>Titularisations saison</span><b>{fmt(x.startsPct)}{x.startsPct!=null?'%':''}</b></div>
      <div><span>Minutes moy. · 5 derniers</span><b>{fmt(x.recent?.minutesAvg)}{x.recent?.minutesAvg!=null?"'":''}</b></div>
      <div><span>Titulaire · 5 derniers</span><b>{fmt(x.recent?.starts)}/{fmt(x.recent?.matches)}</b></div>
      <div><span>Sortie avant 70'</span><b>{fmt(x.recent?.earlySubPct)}{x.recent?.earlySubPct!=null?'%':''}</b></div>
      <div><span>Buts · 5 derniers</span><b>⚽ {fmt(x.recent?.goals)}</b></div>
      <div><span>Buts · 5 {x.side==='home'?'domicile':'extérieur'}</span><b>⚽ {fmt(x.venue?.goals)}</b></div>
      <div><span>Tirs cadrés /90</span><b>{fmt(x.recent?.shotsOnTarget90)}</b></div>
      <div><span>Part des buts équipe</span><b>{fmt(x.goalShare)}{x.goalShare!=null?'%':''}</b></div>
      <div><span>Concurrence / rotation</span><b className={`risk-${String(x.rotationRisk||'').toLowerCase()}`}>{fmt(x.rotationRisk)}</b></div>
      <div><span>Penalty</span><b>{x.penaltyRole==='PROBABLE'?'✅ probable':'— non identifié'}</b></div>
      <div><span>Défense adverse</span><b>{fmt(x.opponentDefence?.grade)} · {fmt(x.opponentDefence?.goalsAgainstAvg)} BC/m</b></div>
      <div><span>XI officiel</span><b>{x.lineupStatus==='CONFIRMED_STARTER'?'✅ titulaire':x.lineupStatus==='CONFIRMED_BENCH'?'❌ banc':'⏳ attente'}</b></div>
      <div><span>Santé</span><b>{x.healthStatus==='OK'?'✅ disponible':'🚑 indisponible'}</b></div>
      <div><span>Cote buteur actuelle</span><b>{x.market?.available?`${x.market.current} · ${x.market.bookmakers} book(s)`:'— fournisseur non disponible'}</b></div>
      <div><span>Opening / Closing</span><b>— / —</b></div>
      <div><span>xG joueur</span><b>— si non fourni</b></div>
    </div>
    <p className="scorerReason">{x.reason}</p>
    {x.status==='PREMIUM'&&<button className="trackBtn" onClick={()=>onTrack(x)} disabled={tracked}>{tracked?'✓ Signal suivi':'＋ Suivre ce signal'}</button>}
  </article>
}

function ScorerBoard({data,loading,onTrack,ledger}){
  if(loading)return <div className="premiumLoading"><RefreshCw className="spin"/><div><b>Analyse Buteur Premium…</b><p>Usage, forme récente, domicile/extérieur, défense adverse, blessures et XI.</p></div></div>;
  if(!data)return <div className="premiumEmpty">Sélectionne un match pour lancer le filtre Buteur Premium.</div>;
  if(!data.available)return <div className="premiumUnavailable"><ShieldCheck/><div><b>Module installé — données joueur non disponibles</b><p>{data.message||data.error}. Le site ne crée aucun buteur artificiel.</p></div></div>;
  const all=[...(data.candidates?.home||[]),...(data.candidates?.away||[])];
  const premium=all.filter(x=>x.status==='PREMIUM'),watch=all.filter(x=>x.status==='WATCH'),rejected=all.filter(x=>x.status==='REJECTED');
  return <div className="premiumBoard">
    <div className="premiumSummary">
      <div><small>Résultat du filtre</small><strong>{premium.length?`${premium.length} PREMIUM`:'AUCUN PREMIUM'}</strong><span>{data.lineupsConfirmed?'XI confirmés':'XI pas encore tous confirmés'}</span></div>
      <div><small>Candidats analysés</small><strong>{all.length}</strong><span>{watch.length} à surveiller · {rejected.length} rejetés</span></div>
      <div><small>Appels source estimés</small><strong>{fmt(data.callsEstimated)}</strong><span>Analyse à la demande</span></div>
      <div><small>Règle</small><strong>STRICTE</strong><span>Aucun joueur forcé</span></div>
    </div>
    {!premium.length&&<div className="noPremium">🚫 Aucun buteur ne passe actuellement tous les filtres Premium.</div>}
    <div className="scorerList">{all.map(x=><ScorerCard key={`${x.teamId}-${x.playerId}`} x={x} onTrack={onTrack} tracked={ledger.some(l=>l.fixtureId===data.fixture.id&&l.playerId===x.playerId)}/>)}</div>
    <div className="methodNote"><b>Lecture correcte :</b> les notes /100 sont des scores internes de sélection, pas une probabilité que le joueur marque. {data.limitations?.join(' · ')}</div>
  </div>
}

function App(){
  const[date,setDate]=useState(today());const[fixtures,setFixtures]=useState([]);const[loading,setLoading]=useState(true);const[error,setError]=useState('');
  const[q,setQ]=useState('');const[leagueFilter,setLeagueFilter]=useState('ALL');const[analysisMode,setAnalysisMode]=useState('goals');const[selected,setSelected]=useState(null);
  const[analysis,setAnalysis]=useState(null);const[analysisLoading,setAnalysisLoading]=useState(false);const[scorers,setScorers]=useState(null);const[scorerLoading,setScorerLoading]=useState(false);
  const[ledger,setLedger]=useState(()=>{try{return JSON.parse(localStorage.getItem('ba-scorer-ledger')||'[]')}catch{return[]}});

  async function load(){setLoading(true);setError('');try{const r=await fetch(`/api/football?date=${date}`);const d=await r.json();if(!r.ok)throw new Error(d.error||'Erreur API');const mk=(d.fixtures||[]).map(m=>({...m,feedSources:['Maçkolik']}));setFixtures(mk);
    fetch('/api/pronosoft-list').then(r=>r.ok?r.json():Promise.reject()).then(pd=>{
      const n=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();const ts=s=>n(s).split(' ').filter(x=>x.length>2);const sim=(a,b)=>{const A=ts(a),B=ts(b);if(!A.length||!B.length)return 0;let h=0;A.forEach(x=>{if(B.some(y=>x===y||x.includes(y)||y.includes(x)))h++});return h/Math.max(A.length,B.length)};
      const imp=o=>{if(!o?.home||!o?.draw||!o?.away)return null;const a=[1/o.home,1/o.draw,1/o.away],z=a.reduce((x,y)=>x+y,0);return{home:100*a[0]/z,draw:100*a[1]/z,away:100*a[2]/z}};
      const pro=pd.rows||[],used=new Set();const merged=mk.map(m=>{let best=null,bi=-1,bs=0;pro.forEach((z,i)=>{const s=(sim(m.home.name,z.home)+sim(m.away.name,z.away))/2;if(s>bs){bs=s;best=z;bi=i}});if(bs<.48){best=null;bi=-1}else used.add(bi);const a=imp(m.odds),b=best?imp(best.odds):null,one=a&&b?{home:+((a.home+b.home)/2).toFixed(1),draw:+((a.draw+b.draw)/2).toFixed(1),away:+((a.away+b.away)/2).toFixed(1)}:a?Object.fromEntries(Object.entries(a).map(([k,v])=>[k,+v.toFixed(1)])):b?Object.fromEntries(Object.entries(b).map(([k,v])=>[k,+v.toFixed(1)])):null;const agr=a&&b?+(100-(Math.abs(a.home-b.home)+Math.abs(a.draw-b.draw)+Math.abs(a.away-b.away))/3).toFixed(1):null;return{...m,feedSources:best?['Maçkolik','Pronosoft']:['Maçkolik'],pronosoft:best?{odds:best.odds}:null,synthesis:{oneXtwo:one,agreement:agr}}});setFixtures(merged)}).catch(()=>{});
  }catch(e){setError(e.message)}finally{setLoading(false)}}
  useEffect(()=>{load()},[date]);

  async function openMatch(g){setSelected(g);setAnalysis(null);setScorers(null);setAnalysisLoading(true);setScorerLoading(analysisMode==='scorer');
    const md=(g.date||date).slice(0,10);
    const tasks=[fetch(`/api/match-analysis?league=${g.league.id||0}&homeName=${encodeURIComponent(g.home.name)}&awayName=${encodeURIComponent(g.away.name)}&date=${encodeURIComponent(md)}`).then(r=>r.json()).catch(e=>({error:e.message}))];
    if(analysisMode==='scorer')tasks.push(fetch(`/api/scorer-premium?home=${encodeURIComponent(g.home.name)}&away=${encodeURIComponent(g.away.name)}&date=${encodeURIComponent(md)}`).then(r=>r.json()).catch(e=>({available:false,error:e.message})));
    const out=await Promise.all(tasks);setAnalysis(out[0]);if(out[1])setScorers(out[1]);setAnalysisLoading(false);setScorerLoading(false);
  }
  async function loadScorers(){if(!selected)return;setScorerLoading(true);const md=(selected.date||date).slice(0,10);try{const r=await fetch(`/api/scorer-premium?home=${encodeURIComponent(selected.home.name)}&away=${encodeURIComponent(selected.away.name)}&date=${encodeURIComponent(md)}`);setScorers(await r.json())}catch(e){setScorers({available:false,error:e.message})}finally{setScorerLoading(false)}}
  function trackSignal(x){if(!scorers?.fixture)return;const item={id:`${scorers.fixture.id}-${x.playerId}`,fixtureId:scorers.fixture.id,date:scorers.fixture.date,match:`${scorers.fixture.home.name} - ${scorers.fixture.away.name}`,playerId:x.playerId,player:x.player,status:x.status,odd:x.market?.current??null,result:'PENDING',createdAt:new Date().toISOString()};const next=[item,...ledger.filter(z=>z.id!==item.id)].slice(0,100);setLedger(next);localStorage.setItem('ba-scorer-ledger',JSON.stringify(next))}

  const filtered=useMemo(()=>fixtures.filter(g=>`${g.home?.name||''} ${g.away?.name||''} ${g.league?.name||''}`.toLowerCase().includes(q.toLowerCase())).filter(g=>leagueFilter==='ALL'||g.league?.name===leagueFilter),[fixtures,q,leagueFilter]);
  const goalScore=g=>{const o=Number(g.odds?.over25),u=Number(g.odds?.under25);if(o>1&&u>1){const a=1/o,b=1/u;return +(100*a/(a+b)).toFixed(1)}return null};
  const winnerScore=g=>Math.max(g.synthesis?.oneXtwo?.home??0,g.synthesis?.oneXtwo?.away??0);
  const displayed=useMemo(()=>[...filtered].sort((a,b)=>analysisMode==='goals'?(goalScore(b)??-1)-(goalScore(a)??-1):analysisMode==='winner'?winnerScore(b)-winnerScore(a):0),[filtered,analysisMode]);

  return <div className="app"><aside><div className="brand"><div className="mark">BA</div><div><b>BET ANALYTICS</b><small>SPORTS INTELLIGENCE</small></div></div><nav><a className="active"><Activity/>Dashboard</a><a><Goal/>Football</a><a><Trophy/>Buteurs Premium</a><a><Database/>Journal <small>{ledger.length}</small></a></nav><div className="api"><ShieldCheck/><div><b>Données vérifiées</b><small>Jamais de joueur inventé</small></div></div></aside>
  <main><header><div><p className="eyebrow">BET ANALYTICS V22 · 13 LIGUES · SCORER ENGINE</p><h1>Match Intelligence</h1><p className="muted">Interface inspirée des meilleurs trackers : facteurs visibles, marché visible, historique visible — mais aucun pourcentage inventé.</p></div><label className="date"><CalendarDays/><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></header>
  <section className="stats"><div><small>Matchs trouvés</small><strong>{displayed.length}</strong><span>{date}</span></div><div><small>Signaux suivis</small><strong>{ledger.length}</strong><span>journal local</span></div><div><small>Filtre buteur</small><strong>STRICT</strong><span>XI requis pour Premium</span></div><div><small>Données manquantes</small><strong>—</strong><span>jamais remplacées par une estimation</span></div></section>
  <div className="toolbar"><div className="tabs"><button className="on">Football</button><button disabled>NHL bientôt</button><button disabled>MLB bientôt</button></div><label><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Équipe ou championnat"/></label><button className="reload" onClick={load}><RefreshCw/> Actualiser</button></div>
  <div className="leagueTitle"><b>13 ligues autorisées</b><span>Les ligues sans match restent visibles avec 0.</span></div><div className="leaguebar"><button className={leagueFilter==='ALL'?'active':''} onClick={()=>setLeagueFilter('ALL')}>Toutes · {fixtures.length}</button>{TOP_LEAGUES.map(l=>{const n=fixtures.filter(g=>g.league?.name===l).length;return <button key={l} className={`${leagueFilter===l?'active':''} ${n===0?'zero':''}`} onClick={()=>setLeagueFilter(l)}>{l} · {n}</button>})}</div>
  <div className="modebar"><button className={analysisMode==='goals'?'active':''} onClick={()=>setAnalysisMode('goals')}>🔥 Matchs à buts</button><button className={analysisMode==='winner'?'active':''} onClick={()=>setAnalysisMode('winner')}>🏆 Gagnants</button><button className={analysisMode==='scorer'?'active scorerMode':''} onClick={()=>setAnalysisMode('scorer')}>⭐ Buteurs indispensables</button><span>{analysisMode==='scorer'?'Premium = XI officiel + filtres stricts':'Analyse multi-sources'}</span></div>
  <div className="sectionHead"><h2>{analysisMode==='scorer'?'Matchs à analyser pour les buteurs':'Programme'}</h2><span>{loading?'Chargement…':`${displayed.length} matchs`}</span></div>
  {error&&<div className="notice"><b>Programme :</b> {error}</div>}
  <div className="grid">{displayed.map(g=>{const dt=new Date(g.date);return <article className={`card ${analysisMode==='scorer'?'scorerMatch':''}`} key={g.id} onClick={()=>openMatch(g)}><div className="league"><span>{g.league?.name}</span><b>{dt.toLocaleTimeString('fr-CH',{hour:'2-digit',minute:'2-digit'})}</b></div><div className="feedbadge">{(g.feedSources||[g.source]).filter(Boolean).join(' + ')}</div><div className="teams"><h3>{g.home.name}</h3><span>VS</span><h3>{g.away.name}</h3></div>{analysisMode==='goals'&&goalScore(g)!=null&&<div className="goalbadge">🔥 +2,5 : {goalScore(g)}% marché</div>}{analysisMode==='winner'&&g.synthesis?.oneXtwo&&<div className="goalbadge">🏆 Lecture marché · max {winnerScore(g).toFixed(1)}%</div>}{analysisMode==='scorer'&&<div className="premiumTeaser"><Star/><div><b>Rechercher les buteurs indispensables</b><span>Forme 5 · split domicile/extérieur · minutes · rotation · blessures · XI</span></div></div>}<button className="detail">{analysisMode==='scorer'?'Analyser les buteurs':'Voir le match'}</button></article>})}</div>
  {analysisMode==='scorer'&&ledger.length>0&&<section className="ledger"><div className="sectionHead"><h2>Journal des signaux</h2><span>{ledger.length} suivis</span></div><div className="ledgerRows">{ledger.slice(0,12).map(x=><div key={x.id}><b>{x.player}</b><span>{x.match}</span><span>Cote {x.odd??'—'}</span><em>{x.result==='PENDING'?'⏳ En attente':x.result}</em></div>)}</div></section>}
  <div className="notice"><b>Principe :</b> BET ANALYTICS peut afficher « Aucun buteur Premium ». Le total de buts saison ne suffit jamais à sélectionner un joueur.</div></main>
  {selected&&<div className="modal" onClick={()=>setSelected(null)}><div className="panel wide" onClick={e=>e.stopPropagation()}><button className="x" onClick={()=>setSelected(null)}>×</button><p className="eyebrow">{selected.league?.name}</p><h2>{selected.home.name} <span>vs</span> {selected.away.name}</h2><p className="muted">{new Date(selected.date).toLocaleString('fr-CH')}</p>
  {analysisMode==='scorer'?<><div className="scorerHero"><div><small>MODULE BUTEUR PREMIUM</small><h3>On cherche l’attaquant qui joue, reste sur le terrain et porte réellement l’attaque.</h3></div><button onClick={loadScorers}><RefreshCw/> Relancer</button></div><ScorerBoard data={scorers} loading={scorerLoading} onTrack={trackSignal} ledger={ledger}/></>:analysisLoading?<div className="insight"><strong>Analyse en cours…</strong></div>:analysis?.error?<div className="notice"><b>{analysis.error}</b></div>:analysis?.probabilities?<><div className="prob"><div><small>1 · {selected.home.name}</small><b>{analysis.probabilities.home}%</b></div><div><small>Nul</small><b>{analysis.probabilities.draw}%</b></div><div><small>2 · {selected.away.name}</small><b>{analysis.probabilities.away}%</b></div></div><div className="prob"><div><small>Over 1.5</small><b>{analysis.probabilities.over15}%</b></div><div><small>Over 2.5</small><b>{analysis.probabilities.over25}%</b></div><div><small>Over 3.5</small><b>{analysis.probabilities.over35}%</b></div><div><small>BTTS</small><b>{analysis.probabilities.btts}%</b></div></div><div className="insight"><small>MODÈLE BET ANALYTICS</small><strong>xG modèle : {analysis.probabilities.expectedGoals.home} – {analysis.probabilities.expectedGoals.away}</strong><p>{analysis.method}</p></div></>:<div className="notice">Analyse indisponible pour ce match.</div>}
  </div></div>}</div>
}
createRoot(document.getElementById('root')).render(<App/>);
