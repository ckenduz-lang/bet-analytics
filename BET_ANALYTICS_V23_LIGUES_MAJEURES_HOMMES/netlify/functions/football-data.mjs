import { canonicalCompetition } from './_competition-filter.mjs';
const MAP={PL:'Angleterre · Premier League',PD:'Espagne · LaLiga',SA:'Italie · Serie A',BL1:'Allemagne · Bundesliga',FL1:'France · Ligue 1',DED:'Pays-Bas · Eredivisie',CL:'Europe · UEFA Champions League'};
const ok=(n)=>canonicalCompetition(n)?.name||null;
export async function handler(event){
 const token=process.env.FOOTBALL_DATA_TOKEN;
 if(!token)return {statusCode:200,headers:{'content-type':'application/json'},body:JSON.stringify({source:'football-data.org',configured:false,matches:[]})};
 const q=event.queryStringParameters||{}, date=q.date||new Date().toISOString().slice(0,10);
 try{
  const r=await fetch(`https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=${date}`,{headers:{'X-Auth-Token':token}});
  if(!r.ok)throw new Error(`football-data ${r.status}`);
  const j=await r.json();
  const matches=(j.matches||[]).map(m=>{
   const league=MAP[m.competition?.code]||ok(`${m.area?.name||''} ${m.competition?.name||''}`);
   if(!league)return null;
   return {id:`fd-${m.id}`,date:m.utcDate,status:m.status,league:{name:league,canonicalKey:canonicalCompetition(league)?.key},
    home:{name:m.homeTeam?.name||''},away:{name:m.awayTeam?.name||''},
    score:m.score||null,venue:m.venue||null,source:'football-data.org',feedSources:['football-data.org']};
  }).filter(Boolean);
  return {statusCode:200,headers:{'content-type':'application/json','cache-control':'public,max-age=300'},body:JSON.stringify({source:'football-data.org',configured:true,matches})};
 }catch(e){return {statusCode:200,headers:{'content-type':'application/json'},body:JSON.stringify({source:'football-data.org',configured:true,error:e.message,matches:[]})}}
}