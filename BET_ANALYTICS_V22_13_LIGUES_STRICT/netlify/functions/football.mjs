import { canonicalCompetition, cleanCompetition, isExcludedParticipant } from './_competition-filter.mjs';
function clean(s){return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function num(s){const x=parseFloat(String(s||'').replace(',','.'));return Number.isFinite(x)?x:null}

// Competition headings on Maçkolik often contain a hyphen, e.g. "İngiltere - Premier Lig".
// Never reject a heading only because it contains " - "; otherwise later matches inherit the previous league.
const COMP_HINT=/\b(lig|liga|league|serie|bundesliga|eredivisie|eliteserien|veikkausliiga|superliga|championship|kupasi|cup|copa|coupe|pokal|mls|sampiyonlar|champions|division)\b/i;
function looksLikeTime(s){return /^\d{1,2}:\d{2}\b/.test(cleanCompetition(s));}
function isCompetitionHeading(text,row=''){
 const s=cleanCompetition(text);
 if(!s || /^\d{2}\.\d{2}\.\d{4}\b/.test(s) || s.length>180) return false;
 // A supported competition is unambiguously a heading.
 if(canonicalCompetition(text)) return true;
 // Unsupported headings must also reset `current`. Match rows usually contain a clock cell.
 const cells=[...String(row).matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>clean(x[1])).filter(Boolean);
 if(cells.some(looksLikeTime)) return false;
 return COMP_HINT.test(s) && cells.length<=4;
}

export function parseMackolikHtml(html){
 const rows=[...String(html||'').matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map(x=>x[0]);
 let current=null, currentRaw=''; const out=[];

 for(const row of rows){
   const text=clean(row); if(!text) continue;

   if(isCompetitionHeading(text,row)){
     currentRaw=text;
     current=canonicalCompetition(text); // null for every league outside our strict 13
     continue;
   }

   if(!/\s-\s/.test(text) || !current) continue;
   const cells=[...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>clean(x[1])).filter(Boolean);
   const ti=cells.findIndex(x=>/^\d{1,2}:\d{2}$/.test(x));
   const mi=cells.findIndex(x=>/\s-\s/.test(x) && !/^\d/.test(x));
   if(mi<0) continue;
   const [home,...rest]=cells[mi].split(/\s+-\s+/); const away=rest.join(' - ');
   if(!home||!away) continue;
   if(isExcludedParticipant(home)||isExcludedParticipant(away)) continue;

   const after=cells.slice(mi+1).map(num).filter(x=>x!==null);
   let odds={home:null,draw:null,away:null,under25:null,over25:null};
   for(let i=0;i<after.length-5;i++){
     if(after[i]>100 && after[i+1]>.9&&after[i+1]<30 && after[i+2]>.9&&after[i+2]<30 && after[i+3]>.9&&after[i+3]<30){
       odds={home:after[i+1],draw:after[i+2],away:after[i+3],under25:after[i+5]??null,over25:after[i+6]??null}; break;
     }
   }
   const time=ti>=0?cells[ti]:'00:00';
   out.push({
     id:`mk-${current.key}-${out.length}-${home}-${away}`,
     date:null,time,status:'NS',
     league:{id:0,name:current.name,canonicalKey:current.key,country:current.country,raw:currentRaw,flag:null},
     home:{name:home,logo:null},away:{name:away,logo:null},venue:null,
     goals:{home:null,away:null},odds,source:'Maçkolik'
   });
 }
 return out;
}

export default async(req)=>{
 const u=new URL(req.url), requested=u.searchParams.get('date')||new Date().toISOString().slice(0,10);
 try{
  const r=await fetch('https://arsiv.mackolik.com/Program/Program.aspx?st=1',{headers:{'User-Agent':'Mozilla/5.0 BET-ANALYTICS'}});
  if(!r.ok)return Response.json({error:`Maçkolik HTTP ${r.status}`},{status:502});
  const html=await r.text(), fixtures=parseMackolikHtml(html);
  const pageDate=(clean(html).match(/(\d{2}\.\d{2}\.\d{4})/)||[])[1]||null;
  const iso=pageDate?pageDate.split('.').reverse().join('-'):requested;
  for(const f of fixtures)f.date=`${iso}T${f.time}:00`;
  const leagueCounts=Object.fromEntries(fixtures.reduce((m,f)=>m.set(f.league.name,(m.get(f.league.name)||0)+1),new Map()));
  return Response.json({date:iso,requestedDate:requested,results:fixtures.length,fixtures,leagueCounts,source:'Maçkolik public program',live:true,strictTop13:true,parserVersion:'22.0.0'},
    {headers:{'Cache-Control':'public, max-age=120, s-maxage=300'}});
 }catch(e){return Response.json({error:'Programme Maçkolik indisponible',details:String(e.message||e)},{status:502})}
};
export const config={path:'/api/football'};
