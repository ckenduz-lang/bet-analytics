import { canonicalCompetition } from './_competition-filter.mjs';
function clean(s){return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function num(s){const x=parseFloat(String(s||'').replace(',','.'));return Number.isFinite(x)?x:null}
function countryLeague(raw){
 const map=[['Türkiye Süper Lig','Turkey','Süper Lig'],['İngiltere Premier Lig','England','Premier League'],['İspanya LaLiga','Spain','La Liga'],['İtalya Serie A','Italy','Serie A'],['Fransa Ligue 1','France','Ligue 1'],['Almanya Bundesliga','Germany','Bundesliga'],['Norveç Eliteserien','Norway','Eliteserien'],['İsveç','Sweden','Allsvenskan'],['Finlandiya Veikkausliiga','Finland','Veikkausliiga'],['MLS','USA','MLS'],['Hollanda Eredivisie','Netherlands','Eredivisie'],['Belçika Pro Lig','Belgium','Pro League'],['İngiltere Championship','England','Championship'],['İspanya 2.Lig','Spain','LaLiga 2'],['Danimarka','Denmark','Superliga']];
 for(const [k,c,l] of map)if(raw.includes(k))return {country:c,name:l}; return {country:'',name:raw.replace(/^Image\s*/,'').trim()||'Football'}
}
function parse(html){
  const rows = [...html.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map(x => x[0]);
  let leagueRaw = "";
  const out = [];

  for (const row of rows) {
    const text = clean(row);
    if (!text) continue;

    // Détection stricte des en-têtes de championnats Maçkolik

// Tout nouvel en-tête de compétition coupe l'héritage du championnat précédent.
// On remet d'abord le championnat courant à zéro.
const isCompetitionHeader =
  /(?:Lig|League|Liga|Ligue|Serie|Bundesliga|Eredivisie|Eliteserien|Veikkausliiga|Superliga|MLS|Şampiyonlar)/i.test(text) &&
  !/\d{1,2}:\d{2}/.test(text);

if (isCompetitionHeader) {
  leagueRaw = "";
 } const leaguePatterns = [}["Hollanda Eredivisie", /Hollanda\s+Eredivisie/i],
  ["Türkiye Süper Lig", /(?:Türkiye|Turkiye)\s+Süper\s+Lig/i],
  ["İngiltere Premier Lig", /(?:İngiltere|Ingiltere)\s+Premier\s+Lig/i],
  ["İspanya LaLiga", /(?:İspanya|Ispanya)\s+LaLiga/i],
  ["İtalya Serie A", /(?:İtalya|Italya)\s+Serie\s+A/i],
  ["Fransa Ligue 1", /Fransa\s+Ligue\s+1/i],
  ["Almanya Bundesliga", /Almanya\s+Bundesliga/i],
  ["Norveç Eliteserien", /(?:Norveç|Norvec)\s+Eliteserien/i],
  ["Finlandiya Veikkausliiga", /Finlandiya\s+Veikkausliiga/i],
  ["Danimarka Superliga", /Danimarka\s+Superliga/i],
  ["ABD MLS", /\bABD\s+MLS\b/i],
  ["Çin Süper Lig", /(?:Çin|Cin)\s+Süper\s+Lig/i],
  ["UEFA Şampiyonlar Ligi", /(?:UEFA\s+)?Şampiyonlar\s+Ligi/i]
];

const detectedLeague = leaguePatterns.find(([, rx]) => rx.test(text));

if (detectedLeague) {
  leagueRaw = detectedLeague[0];
  continue;
}
    if (!leagueRaw) continue;

    const canon = canonicalCompetition(leagueRaw);
    if (!canon) continue;

    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)]
      .map(x => clean(x[1]));

    if (!cells.length) continue;

    const timeIndex = cells.findIndex(x => /^\d{1,2}:\d{2}$/.test(x));
    if (timeIndex < 0) continue;

    const matchIndex = cells.findIndex(x =>
      /\s+-\s+/.test(x) &&
      !/^\d/.test(x)
    );

    if (matchIndex < 0) continue;

    const teams = cells[matchIndex].split(/\s+-\s+/);
    if (teams.length !== 2) continue;

    const home = clean(teams[0]);
    const away = clean(teams[1]);

    if (!home || !away) continue;

    const after = cells
      .slice(matchIndex + 1)
      .map(num)
      .filter(x => x !== null);

    let odds = {
      home: null,
      draw: null,
      away: null,
      under25: null,
      over25: null
    };

    // Maçkolik : code, 1, X, 2, code, Under, Over...
    for (let i = 0; i + 3 < after.length; i++) {
      if (
        after[i] > 100 &&
        after[i + 1] >= 1 &&
        after[i + 1] < 30 &&
        after[i + 2] >= 1 &&
        after[i + 2] < 30 &&
        after[i + 3] >= 1 &&
        after[i + 3] < 30
      ) {
        odds.home = after[i + 1];
        odds.draw = after[i + 2];
        odds.away = after[i + 3];

        if (
          after[i + 4] > 100 &&
          after[i + 5] >= 1 &&
          after[i + 5] < 30 &&
          after[i + 6] >= 1 &&
          after[i + 6] < 30
        ) {
          odds.under25 = after[i + 5];
          odds.over25 = after[i + 6];
        }

        break;
      }
    }

    const time = cells[timeIndex];

    out.push({
      id: `mk-${out.length}-${home}-${away}`,
      date: null,
      time,
      status: "NS",
      league: {
        id: 0,
        country: canon.country || "",
        name: canon.name,
        flag: null
      },
      home: { name: home, logo: null },
      away: { name: away, logo: null },
      odds
    });
  }

  return out;
}export default async(req)=>{
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
