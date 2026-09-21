const WOMEN=/\bkadin\b|women|women'?s|feminin|femenin|femenino|frauen|dames|femminile|kvinn|naiset|naisten|女足|女子/i;
const YOUTH=/\bu\s?\d{1,2}\b|\bu\d{1,2}\b|under\s?\d{1,2}|reserve|reserves|rezerv|academy|youth|b\s*takim|\(b\)|\bb\s*team\b/i;
const LOWER=/\b2\.?\s*(lig|liga|league|bundesliga)\b|\b(premier\s*(lig|league)|super\s*(lig|league))\s*2\b|\bsegunda\b|\bserie\s*b\b|\bligue\s*2\b|\bchampionship\b|\beerste\s*divisie\b|\b1\.?\s*lig\b|\bdivision\s*2\b/i;

export const CANON=[
 {key:'NO',name:'Norvège · Eliteserien',country:'Norway',rx:/norvec|norvege|norway|norge/i,comp:/eliteserien/i},
 {key:'FI',name:'Finlande · Veikkausliiga',country:'Finland',rx:/finland|finlande|finlandiya|suomi/i,comp:/veikkausliiga/i},
 {key:'TR',name:'Turquie · Süper Lig',country:'Turkey',rx:/turkiye|turquie|turkey/i,comp:/(trendyol\s*)?super\s*lig/i},
 {key:'MLS',name:'MLS',country:'USA',rx:/\babd\b|\busa\b|etats|united states|amerika|american|mls/i,comp:/\bmls\b|major league soccer/i},
 {key:'IT',name:'Italie · Serie A',country:'Italy',rx:/italya|italie|italy|italia/i,comp:/serie\s*a/i},
 {key:'FR',name:'France · Ligue 1',country:'France',rx:/fransa|france/i,comp:/ligue\s*1/i},
 {key:'EN',name:'Angleterre · Premier League',country:'England',rx:/ingiltere|angleterre|england/i,comp:/premier\s*(lig|league)/i},
 {key:'DK',name:'Danemark · Superliga',country:'Denmark',rx:/danimarka|danemark|denmark|danmark/i,comp:/superliga|super\s*lig/i},
 {key:'NL',name:'Pays-Bas · Eredivisie',country:'Netherlands',rx:/hollanda|pays[ -]?bas|netherlands|nederland/i,comp:/eredivisie/i},
 {key:'ES',name:'Espagne · LaLiga',country:'Spain',rx:/ispanya|espagne|spain|espana/i,comp:/laliga|la\s*liga|primera\s*division/i},
 {key:'DE',name:'Allemagne · Bundesliga',country:'Germany',rx:/almanya|allemagne|germany|deutschland/i,comp:/bundesliga/i},
 {key:'CN',name:'Chine · Chinese Super League',country:'China',rx:/\bcin\b|chine|china/i,comp:/chinese\s*super\s*league|super\s*league|super\s*lig|\bcsl\b/i},
 {key:'UCL',name:'Europe · UEFA Champions League',country:'Europe',rx:/uefa|europe|avrupa|champions|sampiyonlar/i,comp:/champions\s*league|sampiyonlar\s*ligi|ligue\s*des\s*champions/i},
];

export function cleanCompetition(x){
 return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/İ/g,'I').replace(/ş/g,'s').replace(/Ş/g,'S').replace(/ğ/g,'g').replace(/Ğ/g,'G').replace(/ç/g,'c').replace(/Ç/g,'C').replace(/ö/g,'o').replace(/Ö/g,'O').replace(/ü/g,'u').replace(/Ü/g,'U').replace(/\s+/g,' ').trim();
}

export function canonicalCompetition(raw=''){
 const s=cleanCompetition(raw);
 if(!s||WOMEN.test(s)||YOUTH.test(s)||LOWER.test(s)) return null;
 for(const c of CANON){
   if(c.key==='UCL'){
     if(c.comp.test(s)) return c;
   } else if(c.rx.test(s)&&c.comp.test(s)) return c;
 }
 return null;
}

export function isExcludedParticipant(name=''){ const s=cleanCompetition(name); return WOMEN.test(s)||YOUTH.test(s); }
