export const PARSER_VERSION = '26.0.0';

const MAJOR = [
  ['turkiye-super-lig','Türkiye Süper Lig','Türkiye',[/\bturkiye\b.*\bsuper\s*lig\b/i,/\btrendyol\s+super\s+lig\b/i]],
  ['england-premier-league','İngiltere Premier Lig','İngiltere',[/\bingiltere\b.*\bpremier\s*(?:lig|league)\b/i]],
  ['spain-laliga','İspanya LaLiga','İspanya',[/\bispanya\b.*\b(?:laliga|la\s*liga)\b/i]],
  ['italy-serie-a','İtalya Serie A','İtalya',[/\bitalya\b.*\bserie\s*a\b/i]],
  ['france-ligue-1','Fransa Ligue 1','Fransa',[/\bfransa\b.*\bligue\s*1\b/i]],
  ['germany-bundesliga','Almanya Bundesliga','Almanya',[/\balmanya\b.*\bbundesliga\b/i]],
  ['netherlands-eredivisie','Hollanda Eredivisie','Hollanda',[/\bhollanda\b.*\beredivisie\b/i]],
  ['portugal-primeira','Portekiz Premier Lig','Portekiz',[/\bportekiz\b.*\b(?:premier\s*lig|primeira\s*liga)\b/i]],
  ['belgium-pro-league','Belçika Pro Lig','Belçika',[/\bbelcika\b.*\bpro\s*lig\b/i]],
  ['scotland-premiership','İskoçya Premiership','İskoçya',[/\biskocya\b.*\bpremiership\b/i]],
  ['switzerland-super-league','İsviçre Süper Lig','İsviçre',[/\bisvicre\b.*\b(?:super\s*lig|super\s*league)\b/i]],
  ['austria-bundesliga','Avusturya Bundesliga','Avusturya',[/\bavusturya\b.*\bbundesliga\b/i]],
  ['denmark-superliga','Danimarka Süper Lig','Danimarka',[/\bdanimarka\b.*\b(?:super\s*lig|superliga)\b/i]],
  ['norway-eliteserien','Norveç Eliteserien','Norveç',[/\bnorvec\b.*\beliteserien\b/i]],
  ['sweden-allsvenskan','İsveç Allsvenskan','İsveç',[/\bisvec\b.*\ballsvenskan\b/i]],
  ['finland-veikkausliiga','Finlandiya Veikkausliiga','Finlandiya',[/\bfinlandiya\b.*\bveikkausliiga\b/i]],
  ['poland-ekstraklasa','Polonya Ekstraklasa','Polonya',[/\bpolonya\b.*\bekstraklasa\b/i]],
  ['greece-super-league','Yunanistan Süper Lig','Yunanistan',[/\byunanistan\b.*\b(?:super\s*lig|super\s*league)\b/i]],
  ['czech-first-league','Çekya 1. Lig','Çekya',[/\b(?:cekya|cek\s*cumhuriyeti)\b.*\b1\.?\s*lig\b/i]],
  ['croatia-hnl','Hırvatistan HNL','Hırvatistan',[/\bhirvatistan\b.*\bhnl\b/i]],
  ['serbia-superliga','Sırbistan Süper Lig','Sırbistan',[/\bsirbistan\b.*\b(?:super\s*lig|superliga)\b/i]],
  ['romania-liga-i','Romanya Liga 1','Romanya',[/\bromanya\b.*\bliga\s*(?:1|i)\b/i]],
  ['hungary-nb-i','Macaristan NB I','Macaristan',[/\bmacaristan\b.*\bnb\s*i\b/i]],
  ['ukraine-premier','Ukrayna Premier Lig','Ukrayna',[/\bukrayna\b.*\bpremier\s*lig\b/i]],
  ['usa-mls','ABD Major League Soccer','ABD',[/\babd\b.*\bmajor\s*league\s*soccer\b/i,/\bmls\b/i]],
  ['brazil-serie-a','Brezilya Serie A','Brezilya',[/\bbrezilya\b.*\bserie\s*a\b/i]],
  ['argentina-primera','Arjantin Premier Lig','Arjantin',[/\barjantin\b.*\b(?:premier\s*lig|primera)\b/i]],
  ['mexico-liga-mx','Meksika Liga MX','Meksika',[/\bmeksika\b.*\bliga\s*mx\b/i]],
  ['colombia-primera-a','Kolombiya Primera A','Kolombiya',[/\bkolombiya\b.*\bprimera\s*a\b/i]],
  ['chile-primera','Şili Premier Lig','Şili',[/\bsili\b.*\b(?:premier\s*lig|primera)\b/i]],
  ['uruguay-primera','Uruguay Premier Lig','Uruguay',[/\buruguay\b.*\b(?:premier\s*lig|primera)\b/i]],
  ['paraguay-primera','Paraguay División Profesional','Paraguay',[/\bparaguay\b.*\bdivision\s*profesional\b/i]],
  ['ecuador-liga-pro','Ekvador Pro Lig','Ekvador',[/\bekvador\b.*\bpro\s*lig\b/i]],
  ['peru-liga-1','Peru Liga 1','Peru',[/\bperu\b.*\bliga\s*1\b/i]],
  ['venezuela-primera','Venezuela Premier Lig','Venezuela',[/\bvenezuela\b.*\b(?:premier\s*lig|primera)\b/i]],
  ['japan-j1','Japonya J1 Ligi','Japonya',[/\bjaponya\b.*\bj1\b/i]],
  ['korea-k1','Güney Kore K League 1','Güney Kore',[/\bguney\s*kore\b.*\bk\s*league\s*1\b/i]],
  ['china-csl','Çin Süper Lig','Çin',[/\bcin\b.*\b(?:super\s*lig|super\s*league)\b/i]],
  ['saudi-pro','Suudi Arabistan Pro Lig','Suudi Arabistan',[/\bsuudi\s*arabistan\b.*\bpro\s*lig\b/i]],
  ['qatar-stars','Katar Stars League','Katar',[/\bkatar\b.*\bstars\s*league\b/i]],
  ['uae-pro','BAE Pro Lig','BAE',[/\b(?:bae|birlesik\s*arap\s*emirlikleri)\b.*\bpro\s*lig\b/i]],
  ['australia-a-league','Avustralya A-League','Avustralya',[/\bavustralya\b.*\ba-?league\b/i]],
  ['uefa-ucl','UEFA Şampiyonlar Ligi','UEFA',[/\buefa\b.*\bsampiyonlar\s*ligi\b/i,/\bchampions\s*league\b/i]],
  ['uefa-uel','UEFA Avrupa Ligi','UEFA',[/\buefa\b.*\bavrupa\s*ligi\b/i,/\beuropa\s*league\b/i]],
  ['uefa-uecl','UEFA Konferans Ligi','UEFA',[/\buefa\b.*\bkonferans\s*ligi\b/i,/\bconference\s*league\b/i]],
  ['libertadores','Copa Libertadores','CONMEBOL',[/\bcopa\s*libertadores\b/i]],
  ['sudamericana','Copa Sudamericana','CONMEBOL',[/\bcopa\s*sudamericana\b/i]],
  ['afc-champions','AFC Şampiyonlar Ligi','AFC',[/\bafc\b.*\b(?:sampiyonlar\s*ligi|champions\s*league)\b/i]]
];

const WOMEN = /\b(kadin|women|woman|feminin|femenino|feminina|damen|frauen)\b|\((?:k|w)\)/i;
const YOUTH = /\b(?:u|under)[ -]?(?:17|18|19|20|21|23)\b|\byouth\b|\bgencler\b|\bakademi\b|\bacademy\b/i;
const RESERVE = /\brezerv\b|\breserve\b|\breservas\b|\b(?:ii|b)\s*(?:takim|team)?\b|\(b\)/i;
const LOWER = /\b(?:championship|league\s*(?:one|two)|lig\s*1|1\.\s*lig|2\.\s*lig|serie\s*b|serie\s*c|2\.\s*bundesliga|ligue\s*2|segunda|division\s*2|azadegan|intermedia|prva\s*liga\s*2)\b/i;
const DOMESTIC_CUP = /\b(?:kupasi|cup|pokal|coppa|coupe|copa\s+del\s+rey|taca)\b/i;

function stripTags(s){return String(s||'').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ')}
function entities(s){return String(s||'').replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(parseInt(d,10))).replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ccedil;/gi,'ç').replace(/&ouml;/gi,'ö').replace(/&uuml;/gi,'ü').replace(/&Ccedil;/g,'Ç').replace(/&Ouml;/g,'Ö').replace(/&Uuml;/g,'Ü')}
export function cleanText(s){return entities(stripTags(s)).replace(/\s+/g,' ').trim()}
function fold(s){return cleanText(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/İ/g,'I').replace(/ş/g,'s').replace(/Ş/g,'S').replace(/ğ/g,'g').replace(/Ğ/g,'G').replace(/ç/g,'c').replace(/Ç/g,'C').replace(/ö/g,'o').replace(/Ö/g,'O').replace(/ü/g,'u').replace(/Ü/g,'U').toLowerCase()}
function repairMojibake(s){
 let x=String(s||'');
 const map=[['TÃ¼rkiye','Türkiye'],['SÃ¼per','Süper'],['Ä°','İ'],['Åž','Ş'],['ÅŸ','ş'],['Ã§','ç'],['Ã¶','ö'],['Ã¼','ü'],['ÄŸ','ğ'],['Ä±','ı'],['Ã‡','Ç'],['Ã–','Ö'],['Ãœ','Ü']];
 for(const [a,b] of map)x=x.split(a).join(b);
 return x;
}
function decodeQuality(s){const x=String(s||'');return (x.match(/[ÃÅÄÂ�]/g)||[]).length*10-(x.match(/[çğıİöşüÇĞÖŞÜ]/g)||[]).length}
function decodeBuffer(buf,contentType=''){
 const labels=[];const m=String(contentType).match(/charset\s*=\s*([^;\s]+)/i);if(m)labels.push(m[1].replace(/["']/g,''));
 labels.push('windows-1254','iso-8859-9','utf-8');
 const seen=new Set(),c=[];
 for(const label of labels){const k=label.toLowerCase();if(seen.has(k))continue;seen.add(k);try{const text=new TextDecoder(label).decode(buf);c.push({label,text:repairMojibake(text),score:decodeQuality(text)})}catch{}}
 c.sort((a,b)=>a.score-b.score);return c[0]||{label:'utf-8',text:repairMojibake(new TextDecoder().decode(buf))};
}
export function classifyCompetition(raw){
 const name=repairMojibake(cleanText(raw));const f=fold(name);
 if(!name||name.length<3)return {accepted:false,reason:'empty'};
 if(WOMEN.test(f))return {accepted:false,reason:'women'};
 if(YOUTH.test(f))return {accepted:false,reason:'youth'};
 if(RESERVE.test(f))return {accepted:false,reason:'reserve'};
 if(DOMESTIC_CUP.test(f)&&!/uefa|libertadores|sudamericana|afc/i.test(f))return {accepted:false,reason:'domestic-cup'};
 for(const [key,canonical,country,patterns] of MAJOR){if(patterns.some(p=>p.test(f)))return {accepted:true,reason:'major-top-tier',canonical:{key,name:canonical,country}}}
 if(LOWER.test(f))return {accepted:false,reason:'lower-division'};
 return {accepted:false,reason:'not-major-catalog'};
}
function looksHeading(text){const f=fold(text);return /\b(lig(?:i)?|liga|league|serie|bundesliga|eredivisie|eliteserien|allsvenskan|veikkausliiga|ekstraklasa|premiership|libertadores|sudamericana|laliga|superliga|hnl|j1|mls)\b/.test(f)}
function collectHeadings(html){
 const out=[];const push=(index,text,origin)=>{text=repairMojibake(cleanText(text));if(text.length<3||text.length>160||!looksHeading(text))return;out.push({index,text,origin,classification:classifyCompetition(text)})};
 for(const m of String(html).matchAll(/\b(?:alt|title)\s*=\s*(["'])([\s\S]*?)\1/gi))push(m.index,m[2],'attribute');
 for(const m of String(html).matchAll(/<(?:td|th|div|span|a|b|strong|h[1-6])\b[^>]*>([\s\S]*?)<\/(?:td|th|div|span|a|b|strong|h[1-6])>/gi))push(m.index,m[1],'text');
 return out.sort((a,b)=>a.index-b.index);
}
function cells(row){return [...String(row).matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>repairMojibake(cleanText(m[1])))}
function dateIso(s){const m=String(s).match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:null}
function nearest(list,idx,max=16000){let f=null;for(const x of list){if(x.index>=idx)break;f=x}return f&&idx-f.index<=max?f:null}
function parseNumber(s){const v=Number(String(s).replace(',','.'));return Number.isFinite(v)?v:null}
function isBadTeam(s){const f=fold(s);return WOMEN.test(f)||YOUTH.test(f)||RESERVE.test(f)}
function parseOdds(cellsAfter){
 const vals=cellsAfter.map(parseNumber);
 for(let i=0;i<vals.length-3;i++){
   if(vals[i]!==null&&vals[i]>100&&vals[i+1]>1&&vals[i+1]<30&&vals[i+2]>1&&vals[i+2]<30&&vals[i+3]>1&&vals[i+3]<30){
     return {home:vals[i+1],draw:vals[i+2],away:vals[i+3]};
   }
 }
 return {home:null,draw:null,away:null};
}
export function parseMackolikHtml(html,{source='Maçkolik'}={}){
 const raw=repairMojibake(String(html||''));const headings=collectHeadings(raw);
 const dateMarks=[...raw.matchAll(/\b(\d{2}\.\d{2}\.\d{4})\b/g)].map(m=>({index:m.index,iso:dateIso(m[1])}));
 const fixtures=[];
 for(const rm of raw.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)){
   const cs=cells(rm[0]);if(cs.length<2)continue;
   const timeIdx=cs.findIndex(x=>/^\d{1,2}:\d{2}$/.test(x));if(timeIdx<0)continue;
   const matchIdx=cs.findIndex(x=>/\s+-\s+/.test(x)&&!/^[-\d.,\s]+$/.test(x));if(matchIdx<0)continue;
   const h=nearest(headings,rm.index);if(!h||!h.classification.accepted)continue;
   const d=nearest(dateMarks,rm.index)?.iso||null;
   const parts=cs[matchIdx].split(/\s+-\s+/);if(parts.length<2)continue;
   const home=parts.shift().trim(),away=parts.join(' - ').trim();if(!home||!away||isBadTeam(home)||isBadTeam(away))continue;
   const time=cs[timeIdx].padStart(5,'0'),league=h.classification.canonical;
   fixtures.push({
     id:`mk-${league.key}-${d||'nodate'}-${time}-${home}-${away}`.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]+/g,'-').slice(0,220),
     date:d?`${d}T${time}:00`:null,time,status:'NS',league:{name:league.name,key:league.key,country:league.country,raw:h.text},home:{name:home},away:{name:away},odds:parseOdds(cs.slice(matchIdx+1)),source
   });
 }
 const diag=[];const seen=new Set();for(const h of headings){const k=`${h.text}|${h.classification.reason}`;if(seen.has(k))continue;seen.add(k);diag.push({name:h.text,origin:h.origin,accepted:h.classification.accepted,reason:h.classification.reason})}
 return {fixtures,headings:diag};
}
function dedupe(xs){const out=[],seen=new Set();for(const x of xs){const k=[x.date?.slice(0,10),x.time,fold(x.home.name),fold(x.away.name)].join('|');if(seen.has(k))continue;seen.add(k);out.push(x)}return out}
async function fetchPage(url){try{const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 BET-ANALYTICS/26','accept':'text/html,application/xhtml+xml'}});if(!r.ok)return {url,ok:false,error:`HTTP ${r.status}`};const buf=await r.arrayBuffer();const d=decodeBuffer(buf,r.headers.get('content-type')||'');return {url,ok:true,html:d.text,encoding:d.label,bytes:buf.byteLength}}catch(e){return {url,ok:false,error:String(e?.message||e)}}}
export async function footballApi(request){
 const u=new URL(request.url);const localToday=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const requested=u.searchParams.get('date')||localToday;const debug=u.searchParams.get('debug')==='1';
 const urls=['https://arsiv.mackolik.com/Iddaa-Programi','https://arsiv.mackolik.com/Program/Program.aspx?st=1'];
 const fetched=await Promise.all(urls.map(fetchPage));const parsed=fetched.filter(x=>x.ok).map(x=>({url:x.url,...parseMackolikHtml(x.html,{source:x.url})}));
 if(!parsed.length)return json({version:PARSER_VERSION,error:'Maçkolik inaccessible',sourceStatus:fetched},502);
 const all=dedupe(parsed.flatMap(x=>x.fixtures));const dates=[...new Set(all.map(x=>x.date?.slice(0,10)).filter(Boolean))].sort();const exact=all.filter(x=>x.date?.slice(0,10)===requested);
 const counts=Object.fromEntries(exact.reduce((m,x)=>m.set(x.league.name,(m.get(x.league.name)||0)+1),new Map()));
 const body={version:PARSER_VERSION,parserVersion:PARSER_VERSION,date:requested,results:exact.length,fixtures:exact,leagueCounts:counts,availableDates:dates,source:'Maçkolik public program',sourceStatus:fetched.map(({url,ok,error,encoding,bytes})=>({url,ok,error,encoding,bytes}))};
 if(debug)body.diagnostics={totalRawFixtures:all.length,acceptedHeadings:parsed.flatMap(x=>x.headings.filter(h=>h.accepted)),rejectedHeadings:parsed.flatMap(x=>x.headings.filter(h=>!h.accepted)).slice(0,100),sourceParsers:parsed.map(x=>({url:x.url,fixtures:x.fixtures.length,headings:x.headings.length,attributeHeadings:x.headings.filter(h=>h.origin==='attribute').length}))};
 return json(body,200);
}
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
export function catalog(){return MAJOR.map(([key,name,country])=>({key,name,country}))}
