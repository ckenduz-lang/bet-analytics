import {classifyCompetition, cleanCompetition, isExcludedParticipant, COMPETITION_TITLE_HINT, SUPPORTED_MAJOR_LEAGUES} from './_competition-filter.mjs';

function htmlEntityDecode(s){
 return String(s||'')
  .replace(/&#x([0-9a-f]+);/gi,(_,h)=>{try{return String.fromCodePoint(parseInt(h,16))}catch{return _}})
  .replace(/&#(\d+);/g,(_,d)=>{try{return String.fromCodePoint(parseInt(d,10))}catch{return _}})
  .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&apos;|&#39;/gi,"'").replace(/&quot;/gi,'"')
  .replace(/&ccedil;/gi,'ç').replace(/&ouml;/gi,'ö').replace(/&uuml;/gi,'ü')
  .replace(/&Ccedil;/g,'Ç').replace(/&Ouml;/g,'Ö').replace(/&Uuml;/g,'Ü');
}
function clean(s){return htmlEntityDecode(String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim()}

// Les anciennes pages ASP.NET de Maçkolik peuvent être servies en windows-1254.
// Response.text() suppose UTF-8 et produit alors "TÃ¼rkiye / Åžampiyonlar".
// On décode les octets avec plusieurs encodages puis on garde la version la plus saine.
function decodeScore(text){
 const s=String(text||'');
 const bad=(s.match(/[ÃÅÄÂ�]/g)||[]).length*8;
 const good=(s.match(/[çğıİöşüÇĞÖŞÜ]/g)||[]).length*2 + (s.match(/\b(?:Türkiye|Süper|İngiltere|İspanya|Şampiyonlar|Lig|League|Serie|Bundesliga|Eredivisie)\b/gi)||[]).length;
 return bad-good;
}
function decodeHtmlBuffer(buf,declared=''){
 const labels=[];
 const m=String(declared||'').match(/charset\s*=\s*([^;\s]+)/i); if(m)labels.push(m[1].replace(/["']/g,''));
 labels.push('utf-8','windows-1254','iso-8859-9');
 const seen=new Set(), candidates=[];
 for(const label of labels){
   const k=label.toLowerCase(); if(seen.has(k))continue; seen.add(k);
   try{const text=new TextDecoder(label).decode(buf);candidates.push({label,text,score:decodeScore(text)})}catch{}
 }
 candidates.sort((a,b)=>a.score-b.score);
 return candidates[0]||{label:'utf-8',text:new TextDecoder().decode(buf),score:999};
}
function num(s){const x=parseFloat(String(s||'').replace(',','.'));return Number.isFinite(x)?x:null}
function cellsOf(row){return [...String(row).matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>clean(x[1])).filter(Boolean)}
function isoDate(d){const m=String(d||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:null}
function looksLikeTime(s){return /^\d{1,2}:\d{2}$/.test(String(s||'').trim())}

// Collecte les titres potentiels dans TOUT le HTML, pas uniquement dans les <tr>.
// C'est le correctif central V24: une nouvelle section de ligue rejetée remet bien
// le contexte à zéro et empêche l'héritage de la ligue précédente.
function collectCompetitionCandidates(html){
 const raw=String(html||''), candidates=[];
 function push(index,text,origin){
   text=clean(text); if(!text||text.length<3||text.length>180)return;
   const c=cleanCompetition(text);
   if(!COMPETITION_TITLE_HINT.test(c))return;
   if(/^(futbol|basketbol|puan durumu|canli sonuclar|istatistik|iddaa|program|tumu)$/i.test(c))return;
   if(/\b(iy|ms|kod|2,5 gol|alt|ust|1-x|1-2|x-2)\b/i.test(c) && text.length<80)return;
   candidates.push({index,text,origin,classification:classifyCompetition(text)});
 }
 // Texte visible.
 const re=/<(td|th|div|span|a|b|strong|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
 for(const m of raw.matchAll(re))push(m.index,m[2],'text');
 // Correctif V25: Maçkolik met souvent le NOM DE LA LIGUE dans alt/title d'une image.
 // Le crawler web l'affiche sous la forme "Image Türkiye Süper Lig", mais V24 ignorait les attributs.
 const ar=/\b(?:alt|title)\s*=\s*(["'])([\s\S]*?)\1/gi;
 for(const m of raw.matchAll(ar))push(m.index,m[2],'attribute');
 const seen=new Set();
 return candidates.sort((a,b)=>a.index-b.index).filter(x=>{const k=`${x.index}|${x.text}`;if(seen.has(k))return false;seen.add(k);return true});
}
function nearestCandidate(candidates,idx,maxDistance=9000){
 let found=null;
 for(const c of candidates){if(c.index>=idx)break;found=c}
 return found && idx-found.index<=maxDistance?found:null;
}
function collectDates(html){return [...String(html||'').matchAll(/\b(\d{2}\.\d{2}\.\d{4})\b/g)].map(m=>({index:m.index,raw:m[1],iso:isoDate(m[1])}))}
function nearestDate(dates,idx,maxDistance=12000){let f=null;for(const d of dates){if(d.index>=idx)break;f=d}return f&&idx-f.index<=maxDistance?f:null}

export function parseMackolikHtml(html,{source='Maçkolik'}={}){
 const raw=String(html||'');
 const rows=[...raw.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)];
 const headings=collectCompetitionCandidates(raw), dates=collectDates(raw);
 const fixtures=[];
 for(const rm of rows){
   const row=rm[0], cells=cellsOf(row); if(!cells.length)continue;
   const ti=cells.findIndex(looksLikeTime); if(ti<0)continue;
   const mi=cells.findIndex(x=>/\s+-\s+/.test(x)&&!/^[\d.,\s-]+$/.test(x)); if(mi<0)continue;
   const heading=nearestCandidate(headings,rm.index); if(!heading||!heading.classification.accepted)continue;
   const current=heading.classification.canonical;
   const [home,...rest]=cells[mi].split(/\s+-\s+/);const away=rest.join(' - ').trim();
   if(!home||!away||isExcludedParticipant(home)||isExcludedParticipant(away))continue;
   const dateInfo=nearestDate(dates,rm.index);
   const after=cells.slice(mi+1).map(num).filter(x=>x!==null);
   let odds={home:null,draw:null,away:null,under25:null,over25:null};
   for(let i=0;i<after.length-2;i++){
     // Le premier nombre peut être un code à 4/5 chiffres; les 3 suivants sont les cotes 1-X-2.
     if(after[i]>100 && after[i+1]>.9&&after[i+1]<30 && after[i+2]>.9&&after[i+2]<30 && after[i+3]>.9&&after[i+3]<30){
       odds={home:after[i+1],draw:after[i+2],away:after[i+3],under25:after[i+5]??null,over25:after[i+6]??null};break;
     }
   }
   const time=cells[ti], d=dateInfo?.iso||null;
   fixtures.push({
     id:`mk-${current.key}-${d||'nodate'}-${time}-${home}-${away}`.replace(/\s+/g,'-').slice(0,220),
     date:d?`${d}T${time.padStart(5,'0')}:00`:null,time,status:'NS',
     league:{id:0,name:current.name,canonicalKey:current.key,country:current.country,raw:heading.text,major:true},
     home:{name:home.trim(),logo:null},away:{name:away.trim(),logo:null},venue:null,
     goals:{home:null,away:null},odds,source
   });
 }
 const diagHeadings=[];const seen=new Set();
 for(const h of headings){const k=`${h.text}|${h.classification.reason}`;if(seen.has(k))continue;seen.add(k);diagHeadings.push({name:h.text,accepted:h.classification.accepted,reason:h.classification.reason,origin:h.origin})}
 return {fixtures,diagnostics:{headings:diagHeadings}};
}

function dedupe(list){const out=[],seen=new Set();for(const f of list){const k=[f.date?.slice(0,10),f.time,cleanCompetition(f.home.name),cleanCompetition(f.away.name)].join('|');if(seen.has(k))continue;seen.add(k);out.push(f)}return out}
async function fetchText(url){
 try{
   const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 BET-ANALYTICS/25','Accept':'text/html,application/xhtml+xml'}});
   if(!r.ok)return {url,error:`HTTP ${r.status}`,html:null,encoding:null,bytes:0};
   const buf=await r.arrayBuffer();
   const decoded=decodeHtmlBuffer(buf,r.headers.get('content-type')||'');
   return {url,error:null,html:decoded.text,encoding:decoded.label,bytes:buf.byteLength};
 }catch(e){return {url,error:String(e.message||e),html:null,encoding:null,bytes:0}}
}

export default async(req)=>{
 const u=new URL(req.url), requested=u.searchParams.get('date')||new Date().toISOString().slice(0,10), debug=u.searchParams.get('debug')==='1';
 const urls=['https://arsiv.mackolik.com/Iddaa-Programi','https://arsiv.mackolik.com/Program/Program.aspx?st=1'];
 const fetched=await Promise.all(urls.map(fetchText));
 const parsed=fetched.filter(x=>x.html).map(x=>({url:x.url,...parseMackolikHtml(x.html,{source:`Maçkolik · ${x.url.includes('Iddaa-Programi')?'İddaa Programı':'Program'}`})}));
 if(!parsed.length)return Response.json({error:'Programme Maçkolik indisponible',sources:fetched.map(x=>({url:x.url,error:x.error}))},{status:502});
 const all=dedupe(parsed.flatMap(x=>x.fixtures));
 const availableDates=[...new Set(all.map(f=>f.date?.slice(0,10)).filter(Boolean))].sort();
 const fixtures=all.filter(f=>!f.date||f.date.slice(0,10)===requested);
 const leagueCounts=Object.fromEntries(fixtures.reduce((m,f)=>m.set(f.league.name,(m.get(f.league.name)||0)+1),new Map()));
 const rejected=[...new Map(parsed.flatMap(x=>x.diagnostics.headings.filter(h=>!h.accepted)).map(h=>[`${h.name}|${h.reason}`,h])).values()];
 const accepted=[...new Map(parsed.flatMap(x=>x.diagnostics.headings.filter(h=>h.accepted)).map(h=>[h.name,h])).values()];
 const body={
   date:requested,requestedDate:requested,results:fixtures.length,fixtures,leagueCounts,
   leagueCatalog:SUPPORTED_MAJOR_LEAGUES,availableDates,source:'Maçkolik public program',live:true,
   filter:'major-mens-top-tier-global',parserVersion:'25.0.0',
   sourceStatus:fetched.map(x=>({url:x.url,ok:!!x.html,error:x.error,encoding:x.encoding,bytes:x.bytes}))
 };
 if(debug)body.diagnostics={acceptedCompetitions:accepted,rejectedCompetitions:rejected,totalRawFixtures:all.length,sourceParsers:parsed.map(x=>({url:x.url,fixtureCount:x.fixtures.length,headingCount:x.diagnostics.headings.length,attributeHeadings:x.diagnostics.headings.filter(h=>h.origin==='attribute').length}))};
 return new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=90, s-maxage=180'}});
};
export const config={path:'/api/football'};
