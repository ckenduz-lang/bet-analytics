const BASE='https://v3.football.api-sports.io';

const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\b(fc|afc|cf|ac|ssc|calcio|club|fk|sk|sc)\b/g,' ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const toks=s=>norm(s).split(' ').filter(x=>x.length>2);
function sim(a,b){const A=toks(a),B=toks(b);if(!A.length||!B.length)return 0;let h=0;for(const x of A)if(B.some(y=>x===y||x.includes(y)||y.includes(x)))h++;return h/Math.max(A.length,B.length)}
const pct=(a,b)=>b>0?Math.round(a/b*1000)/10:null;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const round=(x,n=1)=>Number.isFinite(x)?+x.toFixed(n):null;

function getKey(){
  return globalThis.process?.env?.API_FOOTBALL_KEY || globalThis.process?.env?.APISPORTS_KEY || '';
}
async function callApi(path,params,key){
  const u=new URL(BASE+path);Object.entries(params||{}).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')u.searchParams.set(k,String(v))});
  const r=await fetch(u,{headers:{'x-apisports-key':key}});const j=await r.json();
  if(!r.ok||j?.errors&&Object.keys(j.errors).length)throw new Error(`API-Football ${path}: ${r.status} ${JSON.stringify(j.errors||{})}`);
  return j;
}
function findFixture(rows,home,away){
  let best=null,score=0;
  for(const x of rows||[]){const s=(sim(x.teams?.home?.name,home)+sim(x.teams?.away?.name,away))/2;if(s>score){score=s;best=x}}
  return score>=.45?best:null;
}
function leagueStat(item,leagueId){return (item.statistics||[]).find(s=>+s.league?.id===+leagueId)||(item.statistics||[])[0]||null}
async function allPlayers(team,season,league,key){
  let page=1,total=1,out=[];
  do{const j=await callApi('/players',{team,season,league,page},key);out.push(...(j.response||[]));total=Math.min(j.paging?.total||1,4);page++}while(page<=total);
  return out;
}
function fixtureSide(f,teamId){if(+f.teams?.home?.id===+teamId)return'home';if(+f.teams?.away?.id===+teamId)return'away';return null}
function conceded(f,teamId){const side=fixtureSide(f,teamId);if(side==='home')return Number(f.goals?.away);if(side==='away')return Number(f.goals?.home);return NaN}
function defenceContext(fixtures,teamId,wantedSide){
  const rows=(fixtures||[]).filter(f=>fixtureSide(f,teamId)===wantedSide).slice(-5);const vals=rows.map(f=>conceded(f,teamId)).filter(Number.isFinite);
  const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  return {matches:vals.length,goalsAgainstAvg:round(avg,2),grade:avg==null?'INCONNUE':avg<1?'SOLIDE':avg<1.45?'MOYENNE':'FAIBLE'};
}
function lineupInfo(raw,teamId){
  const row=(raw||[]).find(x=>+x.team?.id===+teamId);const start=(row?.startXI||[]).map(x=>x.player?.id).filter(Boolean);const subs=(row?.substitutes||[]).map(x=>x.player?.id).filter(Boolean);
  return {confirmed:start.length>=8,starterIds:new Set(start),subIds:new Set(subs)};
}
function injuryMap(raw){const m=new Map();for(const x of raw||[]){if(x.player?.id)m.set(+x.player.id,{type:x.player.type||x.type||'Injury',reason:x.player.reason||x.reason||''})}return m}
function playerFromFixture(raw,teamId,playerId){const team=(raw||[]).find(x=>+x.team?.id===+teamId);return (team?.players||[]).find(x=>+x.player?.id===+playerId)||null}
function fixtureMetric(p){const s=p?.statistics?.[0]||{};return {minutes:Number(s.games?.minutes)||0,started:s.games?.substitute===false,goals:Number(s.goals?.total)||0,shotsOn:Number(s.shots?.on)||0}}
async function recentMetrics(teamId,playerId,fixtures,key,cache){
  let goals=0,shotsOn=0,minutes=0,starts=0,early=0,played=0;
  for(const f of fixtures){const id=f.fixture?.id;if(!id)continue;let raw=cache.get(id);if(!raw){raw=(await callApi('/fixtures/players',{fixture:id},key)).response||[];cache.set(id,raw)}const p=playerFromFixture(raw,teamId,playerId);if(!p)continue;const m=fixtureMetric(p);played++;goals+=m.goals;shotsOn+=m.shotsOn;minutes+=m.minutes;if(m.started){starts++;if(m.minutes>0&&m.minutes<70)early++}}
  return {matches:fixtures.length,appearances:played,goals,starts,minutesAvg:played?round(minutes/played,1):null,earlySubPct:starts?pct(early,starts):null,shotsOnTarget90:minutes?round(shotsOn*90/minutes,2):null};
}
function marketOdds(raw,playerName){
  const n=norm(playerName),last=n.split(' ').at(-1);const hits=[];
  for(const event of raw||[])for(const book of event.bookmakers||[])for(const bet of book.bets||[]){
    if(!/(anytime|to score|goalscorer|goal scorer|player.*score)/i.test(bet.name||''))continue;
    for(const v of bet.values||[]){const vn=norm(v.value);if(vn===n||vn.includes(n)||(last&&vn.includes(last))){const odd=Number(v.odd);if(odd>1)hits.push({bookmaker:book.name,market:bet.name,odd})}}
  }
  if(!hits.length)return {available:false,current:null,bookmakers:0,quotes:[]};
  const odds=hits.map(x=>x.odd).sort((a,b)=>a-b);const median=odds[Math.floor(odds.length/2)];return {available:true,current:median,bookmakers:hits.length,quotes:hits.slice(0,8)};
}
function completeness(x){const fields=[x.startsPct,x.recent?.minutesAvg,x.recent?.goals,x.venue?.goals,x.recent?.shotsOnTarget90,x.goalShare,x.opponentDefence?.goalsAgainstAvg,x.lineupStatus,x.healthStatus];const ok=fields.filter(v=>v!==null&&v!==undefined&&v!=='INCONNU').length;return Math.round(ok/fields.length*100)}
function scoreCandidate(x){
  const recent=x.recent||{},venue=x.venue||{};
  const startScore=x.startsPct==null?0:clamp(x.startsPct/100*25,0,25);
  const recentStartScore=recent.matches?clamp((recent.starts/recent.matches)*20,0,20):0;
  const minuteScore=recent.minutesAvg==null?0:clamp(recent.minutesAvg/90*20,0,20);
  const earlyScore=recent.earlySubPct==null?0:clamp(15-(recent.earlySubPct*.15),0,15);
  const shareScore=x.goalShare==null?0:clamp(x.goalShare*.25,0,10);
  const penScore=x.penaltyRole==='PROBABLE'?5:0;const healthScore=x.healthStatus==='OK'?5:0;
  const indispensable=Math.round(clamp(startScore+recentStartScore+minuteScore+earlyScore+shareScore+penScore+healthScore,0,100));
  let form=0;form+=clamp((recent.goals||0)*11,0,44);form+=clamp((venue.goals||0)*9,0,27);form+=recent.shotsOnTarget90==null?0:clamp(recent.shotsOnTarget90*7,0,14);
  const dg=x.opponentDefence?.grade;form+=dg==='FAIBLE'?15:dg==='MOYENNE'?9:dg==='SOLIDE'?2:0;form=Math.round(clamp(form,0,100));
  const dataCompleteness=completeness(x);
  let rotationRisk='FORTE';if((x.startsPct??0)>=90&&(recent.starts??0)>=4&&(recent.minutesAvg??0)>=82&&(recent.earlySubPct??100)<=20)rotationRisk='FAIBLE';else if((x.startsPct??0)>=80&&(recent.starts??0)>=3&&(recent.minutesAvg??0)>=74)rotationRisk='MOYENNE';
  let status='REJECTED',reason='Le profil ne passe pas les filtres stricts.';
  const hardFail=x.healthStatus!=='OK'||x.lineupStatus==='CONFIRMED_BENCH'||(x.startsPct??0)<80||(recent.minutesAvg??0)<72||rotationRisk==='FORTE';
  const premiumCore=indispensable>=80&&form>=65&&(recent.goals??0)>=2&&(venue.goals??0)>=2&&x.opponentDefence?.grade!=='SOLIDE'&&dataCompleteness>=70;
  if(hardFail){status='REJECTED';reason='Échec d’un filtre dur : santé, banc, temps de jeu, titularisation ou rotation.'}
  else if(x.lineupStatus!=='CONFIRMED_STARTER'){status='WATCH';reason=premiumCore?'Profil Premium statistiquement, mais le XI officiel n’est pas encore confirmé.':'Profil intéressant, mais validation incomplète.'}
  else if(premiumCore){status='PREMIUM';reason='Buteur indispensable, en forme, contexte favorable et titulaire officiellement confirmé.'}
  else if(indispensable>=68&&form>=50){status='WATCH';reason='Bon profil, mais tous les critères Premium ne sont pas réunis.'}
  return {...x,rotationRisk,indispensableScore:indispensable,formContextScore:form,dataCompleteness,status,reason};
}

export default async function scorerPremium(req){
  const u=new URL(req.url);const home=u.searchParams.get('home');const away=u.searchParams.get('away');const date=u.searchParams.get('date');
  if(!home||!away||!date)return Response.json({error:'Paramètres requis: home, away, date'},{status:400});
  const key=getKey();if(!key)return Response.json({available:false,error:'API_FOOTBALL_KEY non configurée',message:'Le module Buteur Premium est installé mais reste volontairement vide sans source joueur vérifiée. Aucune donnée n’est inventée.'},{status:200});
  try{
    let calls=0;const api=async(path,params)=>{calls++;return callApi(path,params,key)};
    const day=await api('/fixtures',{date});const fixture=findFixture(day.response,home,away);
    if(!fixture)return Response.json({available:false,error:'Match introuvable chez API-Football',message:'Aucun rapprochement suffisamment fiable avec le programme actuel.',calls},{status:200});
    const fixtureId=fixture.fixture.id,leagueId=fixture.league.id,season=fixture.league.season||+date.slice(0,4);const homeId=fixture.teams.home.id,awayId=fixture.teams.away.id;
    const [lineupsJ,injuriesJ,oddsJ,hPlayers,aPlayers,hFxJ,aFxJ]=await Promise.all([
      api('/fixtures/lineups',{fixture:fixtureId}).catch(()=>({response:[]})),api('/injuries',{fixture:fixtureId}).catch(()=>({response:[]})),api('/odds',{fixture:fixtureId}).catch(()=>({response:[]})),
      allPlayers(homeId,season,leagueId,key),allPlayers(awayId,season,leagueId,key),api('/fixtures',{team:homeId,league:leagueId,season,last:12}),api('/fixtures',{team:awayId,league:leagueId,season,last:12})
    ]);
    // allPlayers performs API calls itself; account for approximate pagination for transparency.
    calls+=Math.max(1,Math.ceil(hPlayers.length/20))+Math.max(1,Math.ceil(aPlayers.length/20));
    const lineupHome=lineupInfo(lineupsJ.response,homeId),lineupAway=lineupInfo(lineupsJ.response,awayId),injuries=injuryMap(injuriesJ.response);
    const hFixtures=(hFxJ.response||[]).filter(x=>x.fixture?.id!==fixtureId),aFixtures=(aFxJ.response||[]).filter(x=>x.fixture?.id!==fixtureId);
    const playerCache=new Map();
    const buildTeam=async(teamId,opponentId,items,fixtures,lineup,oppFixtures,currentSide)=>{
      const rows=items.map(item=>({item,stat:leagueStat(item,leagueId)})).filter(x=>x.stat);
      const totalGoals=rows.reduce((s,x)=>s+(Number(x.stat.goals?.total)||0),0);
      const maxPen=Math.max(0,...rows.map(x=>Number(x.stat.penalty?.scored)||0));
      const candidates=rows.filter(x=>{const pos=String(x.stat.games?.position||'');const g=Number(x.stat.goals?.total)||0;return /attacker|forward|striker/i.test(pos)||g>=3}).sort((a,b)=>((Number(b.stat.goals?.total)||0)*8+(Number(b.stat.games?.lineups)||0))-((Number(a.stat.goals?.total)||0)*8+(Number(a.stat.games?.lineups)||0))).slice(0,5);
      const opponentWantedSide=currentSide==='home'?'away':'home';const oppDef=defenceContext(oppFixtures,opponentId,opponentWantedSide);
      const overall=(fixtures||[]).slice(-5);const venue=(fixtures||[]).filter(f=>fixtureSide(f,teamId)===currentSide).slice(-5);const out=[];
      for(const c of candidates){
        const id=c.item.player.id,s=c.stat,appear=Number(s.games?.appearences)||0,lineups=Number(s.games?.lineups)||0,goals=Number(s.goals?.total)||0,pen=Number(s.penalty?.scored)||0;
        const [recent,venueM]=await Promise.all([recentMetrics(teamId,id,overall,key,playerCache),recentMetrics(teamId,id,venue,key,playerCache)]);calls+=0; // detail calls are represented by cache size below
        const injured=injuries.get(+id);const lineupStatus=lineup.confirmed?(lineup.starterIds.has(id)?'CONFIRMED_STARTER':'CONFIRMED_BENCH'):'PENDING';
        const base={playerId:id,player:c.item.player.name,photo:c.item.player.photo||null,teamId,teamName:currentSide==='home'?fixture.teams.home.name:fixture.teams.away.name,side:currentSide,position:s.games?.position||null,seasonGoals:goals,startsPct:appear?pct(lineups,appear):null,seasonMinutesAvg:appear?round((Number(s.games?.minutes)||0)/appear,1):null,recent,venue:venueM,goalShare:totalGoals?pct(goals,totalGoals):null,penaltyRole:maxPen>0&&pen===maxPen?'PROBABLE':'NON_IDENTIFIÉ',healthStatus:injured?'OUT':'OK',injury:injured||null,lineupStatus,opponentDefence:oppDef,market:marketOdds(oddsJ.response,c.item.player.name),xg90:null};
        out.push(scoreCandidate(base));
      }
      return out.sort((a,b)=>({PREMIUM:3,WATCH:2,REJECTED:1}[b.status]-{PREMIUM:3,WATCH:2,REJECTED:1}[a.status])||(b.indispensableScore+b.formContextScore)-(a.indispensableScore+a.formContextScore));
    };
    const [homePlayers,awayPlayers]=await Promise.all([buildTeam(homeId,awayId,hPlayers,hFixtures,lineupHome,aFixtures,'home'),buildTeam(awayId,homeId,aPlayers,aFixtures,lineupAway,hFixtures,'away')]);
    calls+=playerCache.size;
    const all=[...homePlayers,...awayPlayers];const premium=all.filter(x=>x.status==='PREMIUM');
    return Response.json({available:true,fixture:{id:fixtureId,date:fixture.fixture.date,league:{id:leagueId,name:fixture.league.name,season},home:fixture.teams.home,away:fixture.teams.away},lineupsConfirmed:lineupHome.confirmed&&lineupAway.confirmed,candidates:{home:homePlayers,away:awayPlayers},premiumCount:premium.length,message:premium.length?`${premium.length} buteur(s) Premium après filtres stricts.`:'Aucun buteur Premium actuellement.',callsEstimated:calls,method:'Buteur Premium V24: usage réel + forme récente + split domicile/extérieur + défense adverse + blessures + XI. Le score interne n’est pas une probabilité de but.',limitations:['xG joueur laissé indisponible si la source ne le fournit pas','ouverture/closing du marché buteur nécessite des snapshots historiques','concurrence directe approchée par stabilité de titularisation et de minutes, sans prétendre identifier un remplaçant poste-pour-poste']},{headers:{'Cache-Control':'public, max-age=180, s-maxage=300'}});
  }catch(e){return Response.json({available:false,error:'Analyse Buteur Premium impossible',detail:String(e.message||e)},{status:200})}
}
export const config={path:'/api/scorer-premium'};
