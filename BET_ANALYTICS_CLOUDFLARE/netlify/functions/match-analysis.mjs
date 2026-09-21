const ROOT='https://raw.githubusercontent.com/openfootball/football.json/master';

const LEAGUE_FILES={
  39:'en.1.json',   // Premier League
  140:'es.1.json',  // La Liga
  135:'it.1.json',  // Serie A
  61:'fr.1.json',   // Ligue 1
  78:'de.1.json',   // Bundesliga
  203:'tr.1.json',  // Süper Lig
  103:'no.1.json',   // Eliteserien
  113:'se.1.json',   // Allsvenskan
  244:'fi.1.json',   // Veikkausliiga
  253:'us.1.json'    // MLS (fallback si disponible)
};

const OFFICIAL_SOURCES={"39":{"country":"Angleterre","league":"Premier League","official":"https://www.premierleague.com/en/matches","archive":"https://www.premierleague.com/en/welcome/the-archive","fallback":"OpenFootball"},"140":{"country":"Espagne","league":"La Liga","official":"https://rfef.es/es/resultados","fallback":"OpenFootball"},"135":{"country":"Italie","league":"Serie A","official":"https://www.legaseriea.it/serie-a","fallback":"OpenFootball"},"61":{"country":"France","league":"Ligue 1","official":"https://ligue1.com/en/calendar/ligue1","fallback":"OpenFootball"},"78":{"country":"Allemagne","league":"Bundesliga","official":"https://www.bundesliga.com/en/bundesliga/matchday","fallback":"OpenFootball"},"203":{"country":"Turquie","league":"Süper Lig","official":"https://www.tff.org/default.aspx?pageID=198","fallback":"OpenFootball"},"103":{"country":"Norvège","league":"Eliteserien","official":"https://www.fotball.no/eliteserien/","fallback":"OpenFootball"},"113":{"country":"Suède","league":"Allsvenskan","official":"https://www.svenskfotboll.se/serier-cuper/tabell-och-resultat/allsvenskan-herrar/","fallback":"OpenFootball"},"244":{"country":"Finlande","league":"Veikkausliiga","official":"https://tulospalvelu.palloliitto.fi/category/VL!spljp26/group/1/","fallback":"OpenFootball"},"253":{"country":"USA/Canada","league":"MLS","official":"https://www.mlssoccer.com/schedule/scores","fallback":"OpenFootball"}};

const norm=s=>String(s||'').toLowerCase()
 .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/\b(fc|afc|cf|ac|ssc|calcio|club|fk|sk)\b/g,' ')
 .replace(/[^a-z0-9]+/g,' ').trim();

function score(m){
 const s=m?.score;
 if(Array.isArray(s)) return s.length>=2?s:null;
 if(Array.isArray(s?.ft)) return s.ft;
 return null;
}
function similar(a,b){
 a=norm(a); b=norm(b);
 if(!a||!b)return false;
 return a===b || a.includes(b) || b.includes(a);
}
function summary(rows,name,side){
 let n=0,gf=0,ga=0,w=0,d=0,l=0; const form=[];
 for(const m of rows){
  const sc=score(m); if(!sc)continue;
  const isH=similar(m.team1,name), isA=similar(m.team2,name);
  if(!isH&&!isA)continue;
  if(side==='home'&&!isH)continue;
  if(side==='away'&&!isA)continue;
  const a=isH?+sc[0]:+sc[1], b=isH?+sc[1]:+sc[0];
  if(!Number.isFinite(a)||!Number.isFinite(b))continue;
  n++;gf+=a;ga+=b;
  if(a>b){w++;form.push('W')}else if(a===b){d++;form.push('D')}else{l++;form.push('L')}
 }
 return {played:n,gfAvg:n?gf/n:0,gaAvg:n?ga/n:0,w,d,l,form:form.slice(-8).reverse()};
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fact=n=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r};
const pois=(k,l)=>Math.exp(-l)*Math.pow(l,k)/fact(k);
function model(hAll,aAll,hHome,aAway){
 if(hAll.played<3||aAll.played<3)return null;
 const ha=hHome.played>=2?hHome.gfAvg:hAll.gfAvg;
 const hd=hHome.played>=2?hHome.gaAvg:hAll.gaAvg;
 const aa=aAway.played>=2?aAway.gfAvg:aAll.gfAvg;
 const ad=aAway.played>=2?aAway.gaAvg:aAll.gaAvg;
 const lh=clamp(.58*ha+.42*ad,.2,3.8), la=clamp(.58*aa+.42*hd,.2,3.5);
 let p1=0,pd=0,p2=0,o15=0,o25=0,o35=0,btts=0, scores=[];
 for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){
  const p=pois(i,lh)*pois(j,la); scores.push([i,j,p]);
  if(i>j)p1+=p;else if(i===j)pd+=p;else p2+=p;
  if(i+j>1)o15+=p;if(i+j>2)o25+=p;if(i+j>3)o35+=p;if(i>0&&j>0)btts+=p;
 }
 const pc=x=>Math.round(x*1000)/10;
 scores.sort((a,b)=>b[2]-a[2]);
 return {expectedGoals:{home:+lh.toFixed(2),away:+la.toFixed(2)},home:pc(p1),draw:pc(pd),away:pc(p2),
  over15:pc(o15),over25:pc(o25),over35:pc(o35),btts:pc(btts),
  likelyScores:scores.slice(0,3).map(x=>({score:`${x[0]}-${x[1]}`,probability:pc(x[2])})),
  confidence:hAll.played>=5&&aAll.played>=5?'standard':'limitée'};
}

function hashSeed(s){let h=2166136261>>>0;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng32(seed){let x=seed>>>0||123456789;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function samplePoisson(lambda,rng){const L=Math.exp(-lambda);let k=0,p=1;do{k++;p*=rng()}while(p>L&&k<20);return k-1}
function simulateMonteCarlo(lh,la,label,n=10000){
 const rng=rng32(hashSeed(label));let h=0,d=0,a=0,o25=0,btts=0,ot=0,gh=0,ga=0;
 for(let i=0;i<n;i++){
   let x=samplePoisson(lh,rng),y=samplePoisson(la,rng);gh+=x;ga+=y;
   if(x>y)h++;else if(x<y)a++;else{d++;ot++}
   if(x+y>2)o25++;if(x>0&&y>0)btts++;
 }
 const pc=x=>+(100*x/n).toFixed(1);
 return {runs:n,home:pc(h),draw:pc(d),away:pc(a),over25:pc(o25),btts:pc(btts),extraTimeProxy:pc(ot),avgGoals:{home:+(gh/n).toFixed(2),away:+(ga/n).toFixed(2)},note:'Monte Carlo déterministe basé sur les λ du modèle Poisson; ce n’est pas une source indépendante.'};
}

function extractScorers(matches,teamName){
 const counts=new Map();
 const walk=(x,team)=>{
   if(Array.isArray(x)){x.forEach(v=>walk(v,team));return}
   if(!x||typeof x!=='object')return;
   const type=String(x.type||x.event||'').toLowerCase();
   const player=x.player?.name||x.player||x.scorer?.name||x.scorer||x.name;
   const evTeam=x.team?.name||x.team||x.club;
   if(player && (!evTeam||similar(evTeam,team)) && (!type||type.includes('goal'))){
     const k=String(player); counts.set(k,(counts.get(k)||0)+1);
   }
   Object.values(x).forEach(v=>{if(v&&typeof v==='object')walk(v,team)});
 };
 for(const m of matches||[]){
   if(!(similar(m.team1,teamName)||similar(m.team2,teamName)))continue;
   [m.goals,m.events,m.goal_events,m.scorers].filter(Boolean).forEach(x=>walk(x,teamName));
 }
 return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([player,goals])=>({player,goals}));
}
async function loadJson(url){try{const r=await fetch(url);if(!r.ok)return null;return await r.json()}catch{return null}}
function streakStats(rows,name){
 let gf=0,ga=0,pts=0,o15=0,o25=0,o35=0,btts=0,clean=0,scored=0;
 const form=[];
 for(const m of rows){
  const sc=score(m);if(!sc)continue;
  const h=similar(m.team1,name), a=similar(m.team2,name);if(!h&&!a)continue;
  const f=+(h?sc[0]:sc[1]), ag=+(h?sc[1]:sc[0]);gf+=f;ga+=ag;
  if(f>ag){pts+=3;form.push('W')}else if(f===ag){pts++;form.push('D')}else form.push('L');
  if(f+ag>1)o15++;if(f+ag>2)o25++;if(f+ag>3)o35++;if(f&&ag)btts++;if(!ag)clean++;if(f)scored++;
 }
 const n=rows.length||1, pc=x=>Math.round(1000*x/n)/10;
 return {played:rows.length,gfAvg:+(gf/n).toFixed(2),gaAvg:+(ga/n).toFixed(2),pointsPerGame:+(pts/n).toFixed(2),
  over15:pc(o15),over25:pc(o25),over35:pc(o35),btts:pc(btts),cleanSheets:pc(clean),scored:pc(scored),
  form:form.slice(-10).reverse()};
}
export default async req=>{
 const u=new URL(req.url);
 const league=+u.searchParams.get('league'), home=u.searchParams.get('homeName'), away=u.searchParams.get('awayName');
 const date=u.searchParams.get('date')||new Date().toISOString().slice(0,10);
 const file=LEAGUE_FILES[league];
 if(!file)return Response.json({error:'Championnat sans flux historique structuré actuellement',officialSource:OFFICIAL_SOURCES[String(league)]||null,apiSportsCallsUsed:0},{status:200});
 try{
  const y=+date.slice(0,4), mo=+date.slice(5,7), start=mo>=7?y:y-1;
  const seasons=[]; for(let n=4;n>=0;n--){const a=start-n;seasons.push(`${a}-${String(a+1).slice(-2)}`)}
  const datasets=await Promise.all(seasons.map(se=>loadJson(`${ROOT}/${se}/${file}`)));
  const fullCurrent=await loadJson(`${ROOT}/${seasons.at(-1)}/${file.replace('.json','-full.json')}`);
  let all=[];
  datasets.forEach((d,i)=>{if(d?.matches) all.push(...d.matches.map(m=>({...m,_season:seasons[i]})))});
  all=all.filter(m=>m.date<date&&score(m)).sort((a,b)=>a.date.localeCompare(b.date));
  const rowsFor=name=>all.filter(m=>similar(m.team1,name)||similar(m.team2,name)).slice(-20);
  const hr=rowsFor(home), ar=rowsFor(away);
  const h10=hr.slice(-10),a10=ar.slice(-10);
  const hAll=summary(h10,home),aAll=summary(a10,away),hHome=summary(hr.filter(m=>similar(m.team1,home)).slice(-10),home,'home'),aAway=summary(ar.filter(m=>similar(m.team2,away)).slice(-10),away,'away');
  const probabilities=model(hAll,aAll,hHome,aAway);
  const simulation=probabilities?simulateMonteCarlo(probabilities.expectedGoals.home,probabilities.expectedGoals.away,`${home}|${away}|${date}`,10000):null;
  const h2h=all.filter(m=>(similar(m.team1,home)&&similar(m.team2,away))||(similar(m.team1,away)&&similar(m.team2,home))).slice(-10).reverse()
    .map(m=>({date:m.date,season:m._season,home:m.team1,away:m.team2,goals:{home:score(m)[0],away:score(m)[1]}}));
  const scorerMatches=(fullCurrent?.matches||[]).filter(m=>m.date<date);
  const scorers={home:extractScorers(scorerMatches,home),away:extractScorers(scorerMatches,away)};
  return Response.json({
   source:'OpenFootball CC0',officialSource:OFFICIAL_SOURCES[String(league)]||null,sourcePriority:'official-first',
   apiSportsCallsUsed:0,seasonsUsed:seasons.filter((x,i)=>datasets[i]),historyDepth:all.length,
   home:hAll,away:aAll,homeAdvanced:streakStats(h10,home),awayAdvanced:streakStats(a10,away),
   homeAtHome:hHome,awayAway:aAway,h2h,scorers,scorersAvailable:scorers.home.length>0||scorers.away.length>0,
   probabilities,simulation,insufficient:!probabilities,
   message:!probabilities?`Historique insuffisant : ${hAll.played} match(s) ${home}, ${aAll.played} match(s) ${away}.`:null,
   method:probabilities?'Poisson BET ANALYTICS : 10 derniers matchs + splits domicile/extérieur, alimenté par jusqu’à 5 saisons d’historique. La simulation 10 000 tire des scores à partir des mêmes λ et sert de contrôle de cohérence, pas de source indépendante.':'Aucun pourcentage inventé.'
  },{headers:{'Cache-Control':'public, max-age=3600, s-maxage=21600'}});
 }catch(e){return Response.json({error:'Historique impossible à calculer',detail:String(e.message||e),apiSportsCallsUsed:0},{status:200})}
};
export const config={path:'/api/match-analysis'};
