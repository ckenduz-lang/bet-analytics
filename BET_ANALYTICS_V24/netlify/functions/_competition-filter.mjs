// BET ANALYTICS V24 — filtre "grandes ligues hommes"
// Principe: reconnaître largement les premières divisions masculines et les grandes
// compétitions continentales, tout en rejetant explicitement féminin, jeunes,
// réserves, divisions inférieures, amicaux et coupes nationales.

const WOMEN=/\bkadin(?:lar)?\b|\bbayan\b|\(k\)|women|women'?s|female|feminin|femenin|femenino|frauen|dames|femminile|kvinn|naisten|女子|女足/i;
const YOUTH=/\bu\s?-?\d{1,2}\b|under\s?-?\d{1,2}|academy|youth|development|gencler|gençler/i;
const RESERVE=/\brezerv\b|reserve|reserves|\(b\)|\bb\s*takim\b|\bb\s*team\b|\bii\b/i;
const FRIENDLY=/hazirlik|friendly|friendlies|amistoso|amichevole|club\s*friendlies/i;
const AMATEUR=/amator|amateur|regional|bolgesel|yerel\s*lig|non\s*league/i;

// Rejets de divisions inférieures. Les formes sont volontairement larges.
const LOWER=/\bazadegan\b|division\s*intermedia|divisi[oó]n\s*intermedia|\bligue\s*2\b|\bserie\s*[bcd]\b|\b2\.?\s*bundesliga\b|\bchampionship\b|league\s*(one|two)|premier\s*league\s*2|\beerste\s*divisie\b|\bchallenge\s*league\b|\bsegunda\b|la\s*liga\s*2|laliga\s*2|hypermotion|\b1\.?\s*lig\b|\b2\.?\s*lig\b|\b3\.?\s*lig\b|turkiye\s*(trendyol\s*)?1\.?\s*lig|\bprimera\s*nacional\b|\bprimera\s*b\b|\bj2\b|j2\s*league|\bj3\b|k\s*league\s*2|\busl\b|mls\s*next|\bnational\s*league\b|\bnational\s*1\b|liga\s*portugal\s*2|\bpro\s*league\s*2\b|\bascenso\b|\besiliiga\b|\bsegunda\s*division\b|\bsegunda\s*divisi[oó]n\b|\bserie\s*b\b|\bserie\s*c\b|\bserie\s*d\b/i;

const DOMESTIC_CUP=/lig\s*kupasi|kupa(?:si)?|\bcup\b|coppa|copa\s+del|coupe|pokal|trophy|super\s*cup|super\s*kupa|fa\s*cup|efl\s*cup/i;
const MAJOR_CONTINENTAL=/uefa\s*(sampiyonlar|champions)\s*(ligi|league)|champions\s*league|uefa\s*avrupa\s*ligi|europa\s*league|uefa\s*(konferans|conference)\s*(ligi|league)|conference\s*league|copa\s*libertadores|libertadores|copa\s*sudamericana|sudamericana|afc\s*champions\s*league|caf\s*champions\s*league|concacaf\s*champions/i;

// Indices de première division. On s'appuie sur les libellés réellement rencontrés
// sur Maçkolik (p. ex. "Belçika Pro Lig", "Arjantin Premier Lig 2. Aşama",
// "Kolombiya Primera A Clausura", "Ekvador Pro Lig").
const TOP_TIER_PATTERNS=[
 /\bpremier\s*(lig|league)\b/i,
 /\bpremiership\b/i,
 /\bsuper\s*(lig|league)\b/i,
 /\bsuperliga\b/i,
 /\bsuperligaen\b/i,
 /\bserie\s*a\b/i,
 /\bligue\s*1\b/i,
 /(?<!2\.?\s)\bbundesliga\b/i,
 /\blaliga\b/i,
 /\beredivisie\b/i,
 /\beliteserien\b/i,
 /\bveikkausliiga\b/i,
 /\ballsvenskan\b/i,
 /\bekstraklasa\b/i,
 /\bmajor\s*league\s*soccer\b|\bmls\b/i,
 /\bliga\s*mx\b/i,
 /\bliga\s*profesional\b/i,
 /\bprimera\s*a\b/i,
 /\bprimera\s*division\b|\bprimera\s*divisi[oó]n\b/i,
 /\bdivision\s*profesional\b|\bdivisi[oó]n\s*profesional\b/i,
 /\bliga\s*pro\b/i,
 /\bpro\s*(lig|league)\b/i,
 /\bj1\s*(lig|league)\b/i,
 /\bk\s*league\s*1\b/i,
 /\ba-?league\b/i,
 /\bstars\s*league\b/i,
 /\bbotola\s*pro\b/i,
 /\bpremier\s*division\b/i,
 /\b1\.?\s*hnl\b|\bhnl\b/i,
 /\bfortuna\s*liga\b/i,
 /\bparva\s*liga\b/i,
 /\bprva\s*liga\b/i,
 /\bvirsliga\b/i,
 /\bmeistriliiga\b/i,
 /\boptibet\s*virsliga\b/i,
 /\bnb\s*i\b/i,
 /\bbesta\s*deild\b/i,
 /\bveikkausliiga\b/i,
 /\bpro\s*division\b/i
];

export const COMPETITION_TITLE_HINT=/\blig(?:i|ue|a)?\b|league|division|divisi[oó]n|serie|bundesliga|eredivisie|eliteserien|veikkausliiga|superliga|premiership|mls|allsvenskan|ekstraklasa|hnl|kupasi|kupa|cup|copa|coupe|pokal|champions|sampiyonlar|libertadores|sudamericana|primera|pro\s+lig/i;

export function cleanCompetition(x){
 return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/ı/g,'i').replace(/İ/g,'I').replace(/ş/g,'s').replace(/Ş/g,'S')
  .replace(/ğ/g,'g').replace(/Ğ/g,'G').replace(/ç/g,'c').replace(/Ç/g,'C')
  .replace(/ö/g,'o').replace(/Ö/g,'O').replace(/ü/g,'u').replace(/Ü/g,'U')
  .replace(/\s+/g,' ').trim();
}
function keyOf(s){return cleanCompetition(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90)||'league'}
function displayName(raw){return String(raw||'').replace(/\s+/g,' ').trim()}

export function classifyCompetition(raw=''){
 const original=displayName(raw), s=cleanCompetition(original);
 if(!s) return {accepted:false,reason:'empty',raw:original};
 if(WOMEN.test(s)) return {accepted:false,reason:'women',raw:original};
 if(YOUTH.test(s)) return {accepted:false,reason:'youth',raw:original};
 if(RESERVE.test(s)) return {accepted:false,reason:'reserve',raw:original};
 if(FRIENDLY.test(s)) return {accepted:false,reason:'friendly',raw:original};
 if(AMATEUR.test(s)) return {accepted:false,reason:'amateur',raw:original};
 if(LOWER.test(s)) return {accepted:false,reason:'lower-division',raw:original};
 if(MAJOR_CONTINENTAL.test(s)) return {accepted:true,reason:'major-continental',raw:original,canonical:{key:keyOf(s),name:original,country:'International',raw:original,major:true}};
 if(DOMESTIC_CUP.test(s)) return {accepted:false,reason:'domestic-cup',raw:original};
 if(!TOP_TIER_PATTERNS.some(r=>r.test(s))) return {accepted:false,reason:'not-recognized-top-tier',raw:original};
 return {accepted:true,reason:'top-tier',raw:original,canonical:{key:keyOf(s),name:original,country:null,raw:original,major:true}};
}

export function canonicalCompetition(raw=''){return classifyCompetition(raw).canonical||null}
export function isWomenCompetition(raw=''){return WOMEN.test(cleanCompetition(raw))}
export function isYouthReserveCompetition(raw=''){const s=cleanCompetition(raw);return YOUTH.test(s)||RESERVE.test(s)}

export function isExcludedParticipant(name=''){
 const s=cleanCompetition(name);
 // Participant-level guards: (K), U21, reserves, "II", and a terminal " B".
 return WOMEN.test(s)||YOUTH.test(s)||RESERVE.test(s)||/\s+b$/i.test(s)||/\s+ii$/i.test(s);
}

export const SUPPORTED_MAJOR_LEAGUES=[
 'Türkiye Süper Lig','İngiltere Premier Lig','İspanya LaLiga','İtalya Serie A','Fransa Ligue 1','Almanya Bundesliga',
 'Hollanda Eredivisie','Portekiz Premier Lig','Belçika Pro Lig','İskoçya Premiership','İsviçre Süper Lig','Avusturya Bundesliga',
 'Danimarka Süper Lig','Norveç Eliteserien','İsveç Allsvenskan','Finlandiya Veikkausliiga','Polonya Ekstraklasa',
 'ABD Major League Soccer','Brezilya Serie A','Arjantin Premier Lig','Meksika Liga MX','Kolombiya Primera A','Şili Premier Lig',
 'Uruguay Premier Lig','Paraguay División Profesional','Ekvador Pro Lig','Peru Liga 1','Venezuela Premier Lig',
 'Japonya J1 Lig','Güney Kore K League 1','Çin Süper Lig','Suudi Arabistan Pro Lig','Katar Stars League','Avustralya A-League',
 'UEFA Şampiyonlar Ligi','UEFA Avrupa Ligi','UEFA Konferans Ligi','Copa Libertadores','Copa Sudamericana'
];
