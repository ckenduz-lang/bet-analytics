import {parseMackolikHtml} from '../netlify/functions/football.mjs';

const row=(cells,extra='')=>`<tr ${extra}>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`;
const html=[
 row(['İngiltere Premier Lig']),
 row(['21.09.2026','','İY','MS','1','X','2','2,5 Gol','Alt','Üst']),
 row(['19:00','Arsenal - Chelsea','12345','1.80','3.40','4.20','12346','1.70','1.80']),
 row(['İran Azadegan Ligi']),
 row(['16:00','Shahin Bandar Ameri - Pars Jam Bushehr','22345','2.00','3.00','3.40']),
 row(['Paraguay División Intermedia']),
 row(['20:30','Benjamin Aceval - Atlético Tembetary','32345','2.10','3.10','3.20']),
 row(['Portekiz Premier Lig']),
 row(['21:00','Sporting CP - Benfica','42345','2.10','3.20','3.10']),
 row(['Türkiye Kadın Futbol Süper Ligi']),
 row(['18:00','Galatasaray (K) - Beşiktaş (K)','52345','2.10','3.20','3.10']),
 row(['Belçika Rezerv Pro Lig']),
 row(['18:00','Club Brugge U21 - Gent U21','62345','2.10','3.20','3.10']),
].join('\n');
const out=parseMackolikHtml(html);
console.log(JSON.stringify(out.map(x=>[x.league.name,x.home.name,x.away.name]),null,2));
if(out.length!==2) throw new Error(`Expected 2 fixtures, got ${out.length}`);
if(out.some(x=>/Shahin|Benjamin|U21|\(K\)/i.test(`${x.home.name} ${x.away.name}`))) throw new Error('Excluded fixture leaked');
if(out[0].league.name!=='İngiltere Premier Lig'||out[1].league.name!=='Portekiz Premier Lig') throw new Error('Wrong competition mapping');
console.log('V23 parser test: OK');
