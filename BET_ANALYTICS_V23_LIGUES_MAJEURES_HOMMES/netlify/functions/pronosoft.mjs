const BASE='https://www.pronosoft.com/fr/bookmakers/meilleurs-pronostics';
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const tokens=s=>norm(s).split(' ').filter(x=>x.length>2);
function teamHit(text,name){const t=norm(text), a=tokens(name); return a.length&&a.filter(x=>t.includes(x)).length>=Math.max(1,Math.ceil(a.length*.5))}
function strip(html){return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim()}
function parseWindow(txt,home,away){
 const low=norm(txt), hs=tokens(home), as=tokens(away);
 let pos=-1;
 for(const h of hs){const p=low.indexOf(h);if(p>=0){const w=low.slice(Math.max(0,p-120),p+350);if(as.some(a=>w.includes(a))){pos=p;break}}}
 if(pos<0)return null;
 const w=txt.slice(Math.max(0,pos-180),pos+520);
 const ps=[...w.matchAll(/(\d{1,3})\s*%/g)].map(x=>+x[1]).filter(x=>x>=0&&x<=100);
 if(ps.length<5)return {matched:true,rawAvailable:false};
 return {matched:true,rawAvailable:true,home:ps[0],draw:ps[1],away:ps[2],under25:ps[3],over25:ps[4],
   advice:(w.match(/\b(1N|N2|12|1|N|2|U|O)\b/g)||[]).slice(-1)[0]||null};
}
export default async req=>{
 const u=new URL(req.url), date=u.searchParams.get('date'), home=u.searchParams.get('home'), away=u.searchParams.get('away');
 if(!date||!home||!away)return Response.json({error:'Paramètres manquants'},{status:400});
 const url=`${BASE}/${date}/`;
 try{
   const r=await fetch(url,{headers:{'User-Agent':'BET-ANALYTICS/1.0 public-reference'}});
   if(!r.ok)return Response.json({available:false,source:'Pronosoft Cyborg',url,http:r.status});
   const txt=strip(await r.text()), data=parseWindow(txt,home,away);
   if(!data)return Response.json({available:false,source:'Pronosoft Cyborg',url,reason:'match-not-found'});
   return Response.json({available:!!data.rawAvailable,matched:true,source:'Pronosoft Cyborg',url,...data},
     {headers:{'Cache-Control':'public, max-age=1800, s-maxage=7200'}});
 }catch(e){return Response.json({available:false,source:'Pronosoft Cyborg',url,reason:String(e.message||e)})}
};
export const config={path:'/api/pronosoft'};
