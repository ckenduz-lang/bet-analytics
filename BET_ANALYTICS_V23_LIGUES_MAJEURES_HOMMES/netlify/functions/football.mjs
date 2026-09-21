import { canonicalCompetition, cleanCompetition, isExcludedParticipant, COMPETITION_TITLE_HINT } from './_competition-filter.mjs';
function clean(s){return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&#39;/g,"'").replace(/&quot;/gi,'"').replace(/\s+/g,' ').trim()}
function num(s){const x=parseFloat(String(s||'').replace(',','.'));return Number.isFinite(x)?x:null}
function cellsOf(row){return [...String(row).matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>clean(x[1])).filter(Boolean)}
function looksLikeTime(s){return /^\d{1,2}:\d{2}\b/.test(cleanCompetition(s))}
function looksLikeDate(s){return /\b\d{2}\.\d{2}\.\d{4}\b/.test(cleanCompetition(s))}
const MARKET_HEADER=/\b(iy|ms|kod|2,5\s*gol|alt|ust|1-x|1-2|x-2|tumu)\b/i;

// Retourne le titre brut d'une compétition, y compris si nous allons ensuite la rejeter.
// C'est volontaire: toute nouvelle section réinitialise `current` et empêche qu'un match
// d'Iran D2 hérite de la section précédente "İngiltere Premier Lig".
function detectCompetitionHeading(row){
 const cells=cellsOf(row); if(!cells.length || cells.some(looksLikeTime)) return null;
 const text=clean(row); if(!text || text.length>220 || looksLikeDate(text) || MARKET_HEADER.test(cleanCompetition(text))) return null;
 // Sur le programme Maçkolik, un titre de ligue est généralement une ligne courte/colspan.
 // On cherche la cellule la plus informative, pas le texte complet de la table.
 const candidate=[...cells].sort((a,b)=>b.length-a.length)[0]||'';
 const c=cleanCompetition(candidate);
 if(candidate.length<3 || candidate.length>150) return null;
 if(!COMPETITION_TITLE_HINT.test(c)) return null;
 return candidate;
}

export function parseMackolikHtml(html){
 const rows=[...String(html||'').matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map(x=>x[0]);
 let current=null, currentRaw=''; const out=[];
 for(const row of rows){
   const text=clean(row); if(!text) continue;
   const heading=detectCompetitionHeading(row);
   if(heading){
     currentRaw=heading;
     current=canonicalCompetition(heading); // null = section non majeure, féminine, jeune, réserve ou D2
     continue;
   }
   if(!current) continue;
   const cells=cellsOf(row);
   const ti=cells.findIndex(x=>/^\d{1,2}:\d{2}$/.test(x));
   if(ti<0) continue; // une vraie ligne de match du programme possède une heure
   const mi=cells.findIndex(x=>/\s-\s/.test(x) && !/^\d/.test(x));
   if(mi<0) continue;
   const [home,...rest]=cells[mi].split(/\s+-\s+/); const away=rest.join(' - ');
   if(!home||!away||isExcludedParticipant(home)||isExcludedParticipant(away)) continue;

   const after=cells.slice(mi+1).map(num).filter(x=>x!==null);
   let odds={home:null,draw:null,away:null,under25:null,over25:null};
   for(let i=0;i<after.length-5;i++){
     if(after[i]>100 && after[i+1]>.9&&after[i+1]<30 && after[i+2]>.9&&after[i+2]<30 && after[i+3]>.9&&after[i+3]<30){
       odds={home:after[i+1],draw:after[i+2],away:after[i+3],under25:after[i+5]??null,over25:after[i+6]??null}; break;
     }
   }
   const time=cells[ti];
   out.push({
     id:`mk-${current.key}-${out.length}-${home}-${away}`,
     date:null,time,status:'NS',
     league:{id:0,name:current.name,canonicalKey:current.key,country:current.country,raw:currentRaw,flag:null,major:true},
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
  return Response.json({date:iso,requestedDate:requested,results:fixtures.length,fixtures,leagueCounts,source:'Maçkolik public program',live:true,filter:'major-mens-dynamic',parserVersion:'23.0.0'},
    {headers:{'Cache-Control':'public, max-age=120, s-maxage=300'}});
 }catch(e){return Response.json({error:'Programme Maçkolik indisponible',details:String(e.message||e)},{status:502})}
};
export const config={path:'/api/football'};
