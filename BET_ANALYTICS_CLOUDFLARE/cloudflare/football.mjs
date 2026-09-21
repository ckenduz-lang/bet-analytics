export const PARSER_VERSION='27.0.0';
export const SOURCE_URL='https://www.pronosoft.com/fr/parions_sport/liste-parions-sport-plein-ecran.htm';

const MONTHS={janvier:1,fevrier:2,mars:3,avril:4,mai:5,juin:6,juillet:7,aout:8,septembre:9,octobre:10,novembre:11,decembre:12};
const TOP_LABELS=[
  ['france-l1','France Ligue 1',/\bL1\s+McDonald(?:'s)?\b/i],
  ['england-pl','Angleterre Premier League',/\bPremier League\b/i],
  ['spain-laliga','Espagne LaLiga',/\bLaLiga\b(?!\s*2)/i],
  ['italy-serie-a','Italie Serie A',/\bSerie A\b/i],
  ['germany-bundesliga','Allemagne Bundesliga',/\bBundesliga 1\b/i],
  ['portugal-liga','Portugal Liga Portugal',/\bLiga Portugal\b(?!\s*2)/i],
  ['ucl','UEFA Champions League',/\bChampions\s*League\b|\bChampionsLeague\b/i],
  ['uel','UEFA Europa League',/\bEuropa League\b/i],
  ['uecl','UEFA Conference League',/\bEuropa Conf\.?\b|\bConference League\b/i],
  ['libertadores','Copa Libertadores',/\bCopa Libertador(?:es)?\b/i],
  ['sudamericana','Copa Sudamericana',/\bCpaSudamericana\b|\bCopa Sudamericana\b/i],
  ['leagues-cup','Leagues Cup',/\bLeagues Cup\b/i],
  ['d1-generic','Première division',/\bD1(?:\.|\s)/i]
];
const EXCLUDED_COMP=/\b(?:D2|Ligue 2|LaLiga 2|Bundesliga 2|Championship|EFL Cup|Comm\.? Shield|Super Coupe|UEFA Super Cup|Troph\.?Champions|Cpe Ligue|Coupe|Cup)\b/i;
const FEMALE=/\b(?:Feminine|Féminine|Women|Femmes|Dames)\b|(?:^|\s)F(?:\s|$)/i;
const YOUTH=/\b(?:U|Under)[ -]?(?:17|18|19|20|21|23)\b|\bYouth\b|\bAcademy\b/i;
const RESERVE=/\bReserve\b|\bRéserve\b|\bB\b(?=\s|$)|\(B\)/i;

function deaccent(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function decodeEntities(s){return String(s||'').replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(parseInt(d,10))).replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")}
function textify(html){return decodeEntities(String(html||'').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/(?:tr|div|p|li|h[1-6]|table|section)>/gi,'\n').replace(/<\/(?:td|th)>/gi,' | ').replace(/<[^>]+>/g,' ').replace(/[\t\r]+/g,' ').replace(/ +/g,' ').replace(/\n +/g,'\n').replace(/ +\n/g,'\n'))}
function fold(s){return deaccent(String(s||'')).toLowerCase().replace(/\s+/g,' ').trim()}
function pad(n){return String(n).padStart(2,'0')}
function dateFromHeading(day,monthName,year){const m=MONTHS[fold(monthName)];return m?`${year}-${pad(m)}-${pad(day)}`:null}
function currentYearZurich(){return Number(new Intl.DateTimeFormat('en',{timeZone:'Europe/Zurich',year:'numeric'}).format(new Date()))}
function localToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function parseOdd(x){const n=Number(String(x).replace(',','.'));return Number.isFinite(n)&&n>1&&n<100?n:null}
function cleanTeam(s){return String(s||'').replace(/\[Input\]/gi,'').replace(/\s+/g,' ').trim()}
function isBadTeam(s){return FEMALE.test(s)||YOUTH.test(s)||RESERVE.test(s)}

export function classifyCompetition(raw){
  const name=String(raw||'').replace(/\s+/g,' ').trim();
  if(!name)return {accepted:false,reason:'empty'};
  if(FEMALE.test(name))return {accepted:false,reason:'women'};
  if(YOUTH.test(name))return {accepted:false,reason:'youth'};
  if(RESERVE.test(name))return {accepted:false,reason:'reserve'};
  if(EXCLUDED_COMP.test(name)&&!/Leagues Cup/i.test(name))return {accepted:false,reason:'non-top-tier-or-domestic-cup'};
  for(const [key,canonical,re] of TOP_LABELS){if(re.test(name))return {accepted:true,reason:'major-men',key,canonical:name.startsWith('D1')?name:canonical}}
  return {accepted:false,reason:'not-major-men'};
}

function extractCompetition(segment){
  const candidates=[];
  for(const [key,canonical,re] of TOP_LABELS){const m=segment.match(re);if(m)candidates.push({index:m.index,text:m[0],key,canonical})}
  candidates.sort((a,b)=>a.index-b.index);
  if(!candidates.length)return null;
  const c=candidates[0];
  if(c.key==='d1-generic'){
    const m=segment.slice(c.index).match(/\bD1(?:\.[A-Za-zÀ-ÿ.]+|\s+[A-Za-zÀ-ÿ. ]{2,30})/i);
    if(m)c.text=m[0].replace(/\s+/g,' ').trim();
    c.canonical=c.text;
  }
  return c;
}
function splitTeams(prefix){
  const x=cleanTeam(prefix).replace(/^\|+|\|+$/g,'').trim();
  const m=x.match(/^(.+?)\s+-\s+(.+)$/);
  if(m)return [m[1].trim(),m[2].trim()];
  const m2=x.match(/^(.+?)-(.+)$/);return m2?[m2[1].trim(),m2[2].trim()]:null;
}
function oddsFromSegment(seg){
  const nums=[...seg.matchAll(/(?:^|\|)\s*(\d+(?:[,.]\d+)?)\s*(?=\||$)/g)].map(m=>m[1]);
  for(let i=0;i+3<nums.length;i++){
    const id=Number(nums[i].replace(',','.')),a=parseOdd(nums[i+1]),b=parseOdd(nums[i+2]),c=parseOdd(nums[i+3]);
    if(id>0&&Number.isInteger(id)&&a&&b&&c)return {home:a,draw:b,away:c};
  }
  const loose=[...seg.matchAll(/\b(\d{1,4})\s*[| ]+([1-9]\d?(?:[,.]\d+)?)\s*[| ]+([1-9]\d?(?:[,.]\d+)?)\s*[| ]+([1-9]\d?(?:[,.]\d+)?)/g)];
  if(loose.length){const m=loose[0];return {home:parseOdd(m[2]),draw:parseOdd(m[3]),away:parseOdd(m[4])}}
  return {home:null,draw:null,away:null};
}

export function parsePronosoftHtml(html,{year=currentYearZurich()}={}){
  const text=textify(html);
  const dateMarks=[];
  for(const m of text.matchAll(/\b(?:Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s+(\d{1,2})\s+(Janvier|F[eé]vrier|Mars|Avril|Mai|Juin|Juillet|Ao[uû]t|Septembre|Octobre|Novembre|D[eé]cembre)\b/gi)){
    dateMarks.push({index:m.index,date:dateFromHeading(Number(m[1]),m[2],year)});
  }
  const times=[...text.matchAll(/\b(\d{1,2})h(\d{2})\b/g)];
  const fixtures=[];const rejected=[];
  for(let i=0;i<times.length;i++){
    const tm=times[i],start=tm.index+tm[0].length,end=i+1<times.length?times[i+1].index:Math.min(text.length,start+1800);
    const seg=text.slice(start,end).replace(/\n+/g,' ').replace(/\s+/g,' ').trim();
    const comp=extractCompetition(seg); if(!comp)continue;
    const classification=classifyCompetition(comp.text); if(!classification.accepted){rejected.push({competition:comp.text,reason:classification.reason});continue}
    const before=seg.slice(0,comp.index).replace(/^\s*\|?\s*/,'').trim();
    const teams=splitTeams(before); if(!teams)continue;
    const [home,away]=teams; if(!home||!away||isBadTeam(home)||isBadTeam(away))continue;
    let d=null;for(const mark of dateMarks){if(mark.index>tm.index)break;d=mark.date}
    const time=`${pad(tm[1])}:${tm[2]}`;const odds=oddsFromSegment(seg.slice(comp.index));
    fixtures.push({
      id:`ps-${d||'nodate'}-${time}-${home}-${away}`.replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-').slice(0,220),
      date:d?`${d}T${time}:00`:null,time,status:'NS',
      league:{name:classification.canonical,key:classification.key,country:null,raw:comp.text},
      home:{name:home},away:{name:away},odds,source:'Pronosoft ParionsSport 1N2'
    });
  }
  const seen=new Set();const unique=[];for(const f of fixtures){const k=[f.date,f.home.name,f.away.name].join('|').toLowerCase();if(seen.has(k))continue;seen.add(k);unique.push(f)}
  return {fixtures:unique,rejected,dateMarks};
}

async function fetchText(url){
  try{
    const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (compatible; BET-ANALYTICS/27.0; +https://bet-analytics.ckenduz.workers.dev)','accept':'text/html,application/xhtml+xml'}});
    if(!r.ok)return {ok:false,url,error:`HTTP ${r.status}`};
    const text=await r.text(); return {ok:true,url,text,bytes:text.length,contentType:r.headers.get('content-type')||''};
  }catch(e){return {ok:false,url,error:String(e?.message||e)}}
}
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
export async function footballApi(request){
  const u=new URL(request.url);const requested=u.searchParams.get('date')||localToday();const debug=u.searchParams.get('debug')==='1';
  const src=await fetchText(SOURCE_URL);if(!src.ok)return json({version:PARSER_VERSION,parserVersion:PARSER_VERSION,error:'Pronosoft inaccessible',sourceStatus:[src]},502);
  const parsed=parsePronosoftHtml(src.text,{year:Number(requested.slice(0,4))||currentYearZurich()});
  const availableDates=[...new Set(parsed.fixtures.map(f=>f.date?.slice(0,10)).filter(Boolean))].sort();
  let fixtures=parsed.fixtures.filter(f=>f.date?.slice(0,10)===requested);
  // If Pronosoft currently exposes today's programme but date heading parsing is unavailable, keep no-date rows only for today.
  if(!fixtures.length&&requested===localToday())fixtures=parsed.fixtures.filter(f=>!f.date);
  const leagueCounts=Object.fromEntries(fixtures.reduce((m,f)=>m.set(f.league.name,(m.get(f.league.name)||0)+1),new Map()));
  const body={version:PARSER_VERSION,parserVersion:PARSER_VERSION,date:requested,results:fixtures.length,fixtures,leagueCounts,availableDates,source:'Pronosoft public ParionsSport 1N2',sourceUrl:SOURCE_URL,sourceStatus:[{url:src.url,ok:true,bytes:src.bytes,contentType:src.contentType}]};
  if(debug)body.diagnostics={rawFixtures:parsed.fixtures.length,dateHeadings:parsed.dateMarks,rejected:parsed.rejected.slice(0,60),firstFixtures:parsed.fixtures.slice(0,8)};
  return json(body);
}
export function catalog(){return TOP_LABELS.filter(x=>x[0]!=='d1-generic').map(([key,name])=>({key,name})).concat([{key:'world-d1','name':'Toutes premières divisions D1 hommes'}])}
