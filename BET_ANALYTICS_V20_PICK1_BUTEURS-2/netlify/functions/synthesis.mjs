const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const toks=s=>norm(s).split(' ').filter(x=>x.length>2);
function sim(a,b){const A=toks(a),B=toks(b);if(!A.length||!B.length)return 0;let hit=0;for(const x of A)if(B.some(y=>x===y||x.includes(y)||y.includes(x)))hit++;return hit/Math.max(A.length,B.length)}
function implied(o){if(!o||!o.home||!o.draw||!o.away)return null;const a=[1/o.home,1/o.draw,1/o.away],s=a.reduce((x,y)=>x+y,0);return {home:100*a[0]/s,draw:100*a[1]/s,away:100*a[2]/s}}
function blend(a,b){if(!a&&!b)return null;if(!a)return b;if(!b)return a;return {home:(a.home+b.home)/2,draw:(a.draw+b.draw)/2,away:(a.away+b.away)/2}}
export default async(req)=>{
 const origin=new URL(req.url).origin, u=new URL(req.url), date=u.searchParams.get('date')||new Date().toISOString().slice(0,10);
 try{
  const [mr,pr]=await Promise.all([fetch(`${origin}/api/football?date=${date}`).then(r=>r.json()),fetch(`${origin}/api/pronosoft-list`).then(r=>r.json()).catch(()=>({rows:[]}))]);
  const pro=pr.rows||[];
  const rows=(mr.fixtures||[]).map(m=>{
    let best=null,score=0;
    for(const p of pro){const s=(sim(m.home.name,p.home)+sim(m.away.name,p.away))/2;if(s>score){score=s;best=p}}
    if(score<.48)best=null;
    const mi=implied(m.odds), pi=best?implied(best.odds):null, consensus=blend(mi,pi);
    const agreement=mi&&pi?Math.max(0,100-(Math.abs(mi.home-pi.home)+Math.abs(mi.draw-pi.draw)+Math.abs(mi.away-pi.away))/3):null;
    let pick=null,pickProb=null;
    if(consensus){const es=Object.entries(consensus).sort((a,b)=>b[1]-a[1]);pick=es[0][0];pickProb=+es[0][1].toFixed(1)}
    return {...m,pronosoft:best?{matched:true,matchScore:+score.toFixed(2),competition:best.competition,odds:best.odds}:null,
      synthesis:{oneXtwo:consensus?{home:+consensus.home.toFixed(1),draw:+consensus.draw.toFixed(1),away:+consensus.away.toFixed(1)}:null,
      pick,pickProb,agreement:agreement===null?null:+agreement.toFixed(1),sources:[mi?'Maçkolik':null,pi?'Pronosoft':null].filter(Boolean)}};
  });
  return Response.json({date,results:rows.length,rows,pronosoftRows:pro.length,source:'BET ANALYTICS synthesis'},
    {headers:{'Cache-Control':'public, max-age=120, s-maxage=300'}});
 }catch(e){return Response.json({error:'Synthèse indisponible',details:String(e.message||e)},{status:502})}
};
export const config={path:'/api/synthesis'};
