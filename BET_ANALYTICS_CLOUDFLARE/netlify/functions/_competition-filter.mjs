
const WOMEN=/kad[iı]n|women|women'?s|feminin|féminin|femenin|femenino|frauen|dames|femminile|kvinn|naiset|n[aă]isten|女足|女子/i;
const LOWER=/\b2\.?\s*(lig|liga|league|bundesliga)\b|\bsegunda\b|\bserie\s*b\b|\bligue\s*2\b|\bchampionship\b|\beerste\s*divisie\b|\b1\.\s*lig\b|\bdivision\s*2\b/i;
export const CANON=[
 {key:'NO',name:'Norvège · Eliteserien',rx:/norve|norway|norge/i,comp:/eliteserien/i},
 {key:'FI',name:'Finlande · Veikkausliiga',rx:/finland|finlande|finlandiya|suomi/i,comp:/veikkausliiga/i},
 {key:'TR',name:'Turquie · Süper Lig',rx:/t[uü]rkiye|turquie|turkey/i,comp:/s[uü]per\s*lig/i},
 {key:'MLS',name:'MLS',rx:/abd|usa|etats|united states|amerika|mls/i,comp:/\bmls\b|major league soccer/i},
 {key:'IT',name:'Italie · Serie A',rx:/i[ṫ]talya|italya|italie|italy|italia/i,comp:/serie\s*a/i},
 {key:'FR',name:'France · Ligue 1',rx:/fransa|france/i,comp:/ligue\s*1/i},
 {key:'EN',name:'Angleterre · Premier League',rx:/i[ṅ]ngiltere|ingiltere|angleterre|england/i,comp:/premier\s*(lig|league)/i},
 {key:'DK',name:'Danemark · Superliga',rx:/danimarka|danemark|denmark|danmark/i,comp:/superliga/i},
 {key:'NL',name:'Pays-Bas · Eredivisie',rx:/hollanda|pays.bas|netherlands|nederland/i,comp:/eredivisie/i},
 {key:'ES',name:'Espagne · LaLiga',rx:/ispanya|espagne|spain|espa[nñ]a/i,comp:/laliga|la\s*liga|primera\s*division/i},
 {key:'DE',name:'Allemagne · Bundesliga',rx:/almanya|allemagne|germany|deutschland/i,comp:/bundesliga/i},
 {key:'CN',name:'Chine · Chinese Super League',rx:/[cç]in|chine|china/i,comp:/super\s*league|s[uü]per\s*lig/i},
 {key:'UCL',name:'Europe · UEFA Champions League',rx:/uefa|europe|avrupa|champions/i,comp:/champions\s*league|şampiyonlar\s*ligi|sampiyonlar\s*ligi|ligue\s*des\s*champions/i},
];
function clean(x){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
export function canonicalCompetition(raw=''){
 const s=clean(raw); if(!s||WOMEN.test(s)||LOWER.test(s)) return null;
 for(const c of CANON){if(c.key==='UCL'){if(c.comp.test(s))return c}else if(c.rx.test(s)&&c.comp.test(s))return c}
 return null;
}
