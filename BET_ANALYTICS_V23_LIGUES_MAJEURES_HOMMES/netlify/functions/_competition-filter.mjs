// BET ANALYTICS V23 — filtre des compétitions Maçkolik
// Objectif: accepter les grandes compétitions masculines, rejeter femmes, jeunes,
// réserves et divisions inférieures. Le libellé affiché reste celui de Maçkolik.

const WOMEN=/\bkadin(?:lar)?\b|\bbayan\b|\(k\)|women|women'?s|female|feminin|femenin|femenino|frauen|dames|femminile|kvinn|naisten|女子|女足/i;
const YOUTH=/\bu\s?\d{1,2}\b|under\s?\d{1,2}|\brezerv\b|reserve|reserves|academy|youth|development|b\s*takim|\(b\)|\bb\s*team\b|\bii\b/i;
const FRIENDLY=/hazirlik|friendly|friendlies|amistoso|amichevole|club\s*friendlies/i;
const AMATEUR=/amator|amateur|regional|bolgesel|yerel\s*lig/i;

// Divisions inférieures connues / explicites. Les deux exemples qui posaient problème
// sont ici: Azadegan Ligi (Iran D2) et División Intermedia (Paraguay D2).
const LOWER=/\bazadegan\b|division\s*intermedia|divisi[oó]n\s*intermedia|\bligue\s*2\b|\bserie\s*[bcd]\b|\b2\.?\s*bundesliga\b|\bchampionship\b|league\s*(one|two)|\beerste\s*divisie\b|\bchallenge\s*league\b|\bsegunda\b|la\s*liga\s*2|laliga\s*2|hypermotion|\b2\.?\s*lig\b|\b3\.?\s*lig\b|turkiye\s*(trendyol\s*)?1\.?\s*lig|\bprimera\s*nacional\b|\bprimera\s*b\b|\bserie\s*b\b|\bj2\b|j2\s*league|\bj3\b|k\s*league\s*2|\busl\b|mls\s*next|\bnational\s*league\b|\bnational\s*1\b|liga\s*portugal\s*2|\bpro\s*league\s*2\b|\bascenso\b/i;

// Coupes nationales. Les compétitions continentales majeures sont autorisées plus bas.
const DOMESTIC_CUP=/lig\s*kupasi|kupa(?:si)?|\bcup\b|coppa|copa\s+del|coupe|pokal|trophy|super\s*cup|super\s*kupa/i;

const MAJOR_CONTINENTAL=/uefa\s*(sampiyonlar|champions)\s*(ligi|league)|champions\s*league|uefa\s*avrupa\s*ligi|europa\s*league|uefa\s*(konferans|conference)\s*(ligi|league)|conference\s*league|copa\s*libertadores|libertadores|copa\s*sudamericana|sudamericana|afc\s*champions\s*league|caf\s*champions\s*league/i;

// Marqueurs de premières divisions / grandes ligues en turc et en anglais.
// On garde une liste de formes de nom, mais PAS une liste limitée à 13 pays.
const TOP_TIER=/\bpremier\s*(lig|league)\b|\bpremiership\b|\bsuper\s*(lig|league)\b|\bsuperliga\b|\bsuperligaen\b|\bserie\s*a\b|\bligue\s*1\b|(?<!2\.\s)\bbundesliga\b|\beredivisie\b|\beliteserien\b|\bveikkausliiga\b|\ballsvenskan\b|\bekstraklasa\b|\bmajor\s*league\s*soccer\b|\bmls\b|\bliga\s*mx\b|\bliga\s*profesional\b|\bprimera\s*division\b|\bprimera\s*divisi[oó]n\b|\bprimera\s*a\b|\bliga\s*pro\b|\bliga\s*1\b|\bpro\s*(lig|league)\b|\bj1\s*(lig|league)\b|\bk\s*league\s*1\b|\ba-?league\b|\bstars\s*league\b|\bbotola\s*pro\b|\bpremier\s*division\b|\bdivision\s*profesional\b|\bdivisi[oó]n\s*profesional\b|\b1\.?\s*hnl\b|\bhnl\b|\bfortuna\s*liga\b|\bparva\s*liga\b|\bprva\s*liga\b|\bvirsliga\b|\bmeistriliiga\b|\boptibet\s*virsliga\b/i;

// Sert uniquement à reconnaître qu'une ligne est bien un titre de compétition afin de
// remettre current à null si cette compétition est rejetée. Cela empêche l'héritage
// erroné de "Premier League" vers un match iranien/paraguayen.
export const COMPETITION_TITLE_HINT=/\blig(?:i|ue|a)?\b|league|division|divisi[oó]n|serie|bundesliga|eredivisie|eliteserien|veikkausliiga|superliga|premiership|mls|allsvenskan|ekstraklasa|hnl|kupasi|kupa|cup|copa|coupe|pokal|champions|sampiyonlar|libertadores|sudamericana/i;

export function cleanCompetition(x){
 return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/ı/g,'i').replace(/İ/g,'I').replace(/ş/g,'s').replace(/Ş/g,'S')
  .replace(/ğ/g,'g').replace(/Ğ/g,'G').replace(/ç/g,'c').replace(/Ç/g,'C')
  .replace(/ö/g,'o').replace(/Ö/g,'O').replace(/ü/g,'u').replace(/Ü/g,'U')
  .replace(/\s+/g,' ').trim();
}

function keyOf(s){return cleanCompetition(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'league'}
function displayName(raw){return String(raw||'').replace(/\s+/g,' ').trim()}

export function isWomenCompetition(raw=''){return WOMEN.test(cleanCompetition(raw))}
export function isYouthReserveCompetition(raw=''){return YOUTH.test(cleanCompetition(raw))}

export function canonicalCompetition(raw=''){
 const original=displayName(raw), s=cleanCompetition(original);
 if(!s || WOMEN.test(s) || YOUTH.test(s) || FRIENDLY.test(s) || AMATEUR.test(s) || LOWER.test(s)) return null;
 // Les grandes compétitions continentales passent même si leur nom contient "Cup/Copa".
 if(MAJOR_CONTINENTAL.test(s)) return {key:keyOf(s),name:original,country:'International',raw:original,major:true};
 // Pas de coupes nationales dans la vue "ligues majeures".
 if(DOMESTIC_CUP.test(s)) return null;
 if(!TOP_TIER.test(s)) return null;
 return {key:keyOf(s),name:original,country:null,raw:original,major:true};
}

export function isExcludedParticipant(name=''){
 const s=cleanCompetition(name);
 return WOMEN.test(s)||YOUTH.test(s);
}
