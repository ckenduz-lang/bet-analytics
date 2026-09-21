const CODES={'Angleterre · Premier League':'PL','Espagne · LaLiga':'PD','Italie · Serie A':'SA','Allemagne · Bundesliga':'BL1','France · Ligue 1':'FL1','Pays-Bas · Eredivisie':'DED','Europe · UEFA Champions League':'CL'};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export async function handler(event){
 const token=process.env.FOOTBALL_DATA_TOKEN,q=event.queryStringParameters||{},code=CODES[q.league],team=norm(q.team);
 if(!token||!code||!team)return {statusCode:200,headers:{'content-type':'application/json'},body:JSON.stringify({available:false,matches:[]})};
 try{
  const r=await fetch(`https://api.football-data.org/v4/competitions/${code}/matches?status=FINISHED`,{headers:{'X-Auth-Token':token}});
  if(!r.ok)throw new Error(`football-data ${r.status}`);
  const j=await r.json(), all=(j.matches||[]).filter(m=>norm(m.homeTeam?.name).includes(team)||team.includes(norm(m.homeTeam?.name))||norm(m.awayTeam?.name).includes(team)||team.includes(norm(m.awayTeam?.name))).slice(-10);
  let gf=0,ga=0,w=0,d=0,l=0,o25=0,btts=0;
  for(const m of all){const home=norm(m.homeTeam?.name).includes(team)||team.includes(norm(m.homeTeam?.name)),a=m.score?.fullTime?.home,b=m.score?.fullTime?.away;if(a==null||b==null)continue;const x=home?a:b,y=home?b:a;gf+=x;ga+=y;x>y?w++:x===y?d++:l++;if(x+y>=3)o25++;if(x>0&&y>0)btts++}
  const n=all.length;
  return {statusCode:200,headers:{'content-type':'application/json','cache-control':'public,max-age=1800'},body:JSON.stringify({available:n>0,n,ppg:n?(3*w+d)/n:null,gf:n?gf/n:null,ga:n?ga/n:null,over25:n?o25/n:null,btts:n?btts/n:null,w,d,l})};
 }catch(e){return {statusCode:200,headers:{'content-type':'application/json'},body:JSON.stringify({available:false,error:e.message})}}
}