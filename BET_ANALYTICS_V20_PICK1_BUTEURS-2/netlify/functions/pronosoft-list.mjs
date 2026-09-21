import { canonicalCompetition } from './_competition-filter.mjs';
const SRC='https://www.pronosoft.com/fr/parions_sport/imprimer-liste.php?ps_sort=date';
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const compact=s=>norm(s).replace(/\s+/g,'');
function strip(s){return String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim()}
function parse(html){
 const out=[];
 for(const m of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
  const cells=[...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>strip(x[1])).filter(Boolean);
  if(cells.length<6 || !/^F\s*\//i.test(cells[0])) continue;
  const time=(cells[1]||'').replace('h',':');
  const teams=cells[2]||'';
  // Pronosoft often concatenates team names around a hyphen.
  const parts=teams.split(/\s*-\s*/);
  if(parts.length<2) continue;
  const odds=cells.slice(3).map(x=>parseFloat(x.replace(',','.'))).filter(x=>Number.isFinite(x));
  // first numeric is generally bet number; next 3 are 1/X/2
  let oi=odds.findIndex((x,i)=>x>100 && odds[i+1]>1 && odds[i+2]>1 && odds[i+3]>1);
  if(oi<0) continue;
  const rawCompetition=cells[0].replace(/^F\s*\/\s*/i,''); const canon=canonicalCompetition(rawCompetition); if(!canon) continue; const competition=canon.name;
  out.push({competition,time,home:parts[0],away:parts.slice(1).join('-'),
    odds:{home:odds[oi+1],draw:odds[oi+2],away:odds[oi+3]},source:'Pronosoft'});
 }
 return out;
}
export default async(req)=>{
 try{
  const r=await fetch(SRC,{headers:{'User-Agent':'Mozilla/5.0 BET-ANALYTICS'}});
  if(!r.ok)return Response.json({error:`Pronosoft HTTP ${r.status}`},{status:502});
  const rows=parse(await r.text());
  return Response.json({results:rows.length,rows,source:'Pronosoft public ParionsSport list'},
   {headers:{'Cache-Control':'public, max-age=120, s-maxage=300'}});
 }catch(e){return Response.json({error:'Pronosoft indisponible',details:String(e.message||e)},{status:502})}
};
export const config={path:'/api/pronosoft-list'};
