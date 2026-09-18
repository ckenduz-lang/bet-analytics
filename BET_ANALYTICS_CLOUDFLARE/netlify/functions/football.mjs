import { canonicalCompetition } from './_competition-filter.mjs';
function clean(s){return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function num(s){const x=parseFloat(String(s||'').replace(',','.'));return Number.isFinite(x)?x:null}
function countryLeague(raw){
 const map=[['Türkiye Süper Lig','Turkey','Süper Lig'],['İngiltere Premier Lig','England','Premier League'],['İspanya LaLiga','Spain','La Liga'],['İtalya Serie A','Italy','Serie A'],['Fransa Ligue 1','France','Ligue 1'],['Almanya Bundesliga','Germany','Bundesliga'],['Norveç Eliteserien','Norway','Eliteserien'],['İsveç','Sweden','Allsvenskan'],['Finlandiya Veikkausliiga','Finland','Veikkausliiga'],['MLS','USA','MLS'],['Hollanda Eredivisie','Netherlands','Eredivisie'],['Belçika Pro Lig','Belgium','Pro League'],['İngiltere Championship','England','Championship'],['İspanya 2.Lig','Spain','LaLiga 2'],['Danimarka','Denmark','Superliga']];
 for(const [k,c,l] of map)if(raw.includes(k))return {country:c,name:l}; return {country:'',name:raw.replace(/^Image\s*/,'').trim()||'Football'}
}
function parse(html){
 const rows=[...html.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map(x=>x[0]); let league={country:'',name:'Football'}, out=[];

 for(const row of rows){
   const text=clean(row); if(!text)continue;
   if(/Premier Lig|LaLiga|Serie A|Ligue 1|Bundesliga|Eliteserien|Veikkausliiga|Eredivisie|Pro Lig|Championship|Superliga|Allsvenskan/i.test(text) && !/\s-\s/.test(text)){league=countryLeague(text);continue}
   if(!/\s-\s/.test(text))continue;
   const cells=[...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>clean(x[1])).filter(Boolean);
   const ti=cells.findIndex(x=>/^\d{1,2}:\d{2}$/.test(x));
   const mi=cells.findIndex(x=>/\s-\s/.test(x) && !/^\d/.test(x));
   if(mi<0)continue;
   const [home,...rest]=cells[mi].split(/\s+-\s+/); const away=rest.join(' - ');
   if(!home||!away)continue;
   const canon=canonicalCompetition(`${league.country||''} ${league.name||''}`); if(!canon)continue; league={...league,name:canon.name,canonicalKey:canon.key};
   const after=cells.slice(mi+1).map(num).filter(x=>x!==null);
   // Maçkolik order on the public program: code, 1, X, 2, code, Under, Over, ...
   let odds={home:null,draw:null,away:null,under25:null,over25:null};
   for(let i=0;i<after.length-5;i++){
     if(after[i]>100 && after[i+1]>.9&&after[i+1]<30 && after[i+2]>.9&&after[i+2]<30 && after[i+3]>.9&&after[i+3]<30){
       odds={home:after[i+1],draw:after[i+2],away:after[i+3],under25:after[i+5]??null,over25:after[i+6]??null}; break;
     }
   }
   const time=ti>=0?cells[ti]:'00:00';
   out.push({id:`mk-${out.length}-${home}-${away}`,date:null,time,status:'NS',league:{id:0,...league,flag:null},home:{name:home,logo:null},away:{name:away,logo:null},venue:null,goals:{home:null,away:null},odds,source:'Maçkolik'});
 }
 return out;
}
export default async(req)=>{
 const u=new URL(req.url), requested=u.searchParams.get('date')||new Date().toISOString().slice(0,10);
 try{
  const mackolikUrl = new URL("https://arsiv.mackolik.com/Program/Program.aspx");
mackolikUrl.searchParams.set("st", "1");
const r = await fetch(mackolikUrl.toString(), {
  headers: { "User-Agent": "Mozilla/5.0 BET-ANALYTICS" }
});  if(!r.ok)return Response.json({error:`Maçkolik HTTP ${r.status}`},{status:502});
  const html=await r.text(), fixtures=parse(html);
  const pageDate=(clean(html).match(/(\d{2}\.\d{2}\.\d{4})/)||[])[1]||null;
  const iso=pageDate?pageDate.split('.').reverse().join('-'):requested;
  for(const f of fixtures)f.date=`${iso}T${f.time}:00`;
  return Response.json({date:iso,requestedDate:requested,results:fixtures.length,fixtures,source:'Maçkolik public program',live:true},
    {headers:{'Cache-Control':'public, max-age=120, s-maxage=300'}});
 }catch(e){return Response.json({error:'Programme Maçkolik indisponible',details:String(e.message||e)},{status:502})}
};
export const config={path:'/api/football'};
