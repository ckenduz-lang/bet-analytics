import {parseMackolikHtml} from '../netlify/functions/football.mjs';
import {classifyCompetition} from '../netlify/functions/_competition-filter.mjs';
const row=c=>`<tr>${c.map(x=>`<td>${x}</td>`).join('')}</tr>`;
const html=`
<div class="league-title">İngiltere Premier Lig</div>
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['19:00','Arsenal - Chelsea','12345','1.80','3.40','4.20'])}
<div class="league-title">İran Azadegan Ligi</div>
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['16:00','Shahin Bandar Ameri - Pars Jam Bushehr','22345','2.00','3.00','3.40'])}
<div class="league-title">Paraguay División Intermedia</div>
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['20:30','Benjamin Aceval - Atlético Tembetary','32345','2.10','3.10','3.20'])}
<div class="league-title">Belçika Pro Lig</div>
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['21:00','Standard Liege - Genk','42345','2.10','3.20','3.10'])}
<div class="league-title">Brezilya Serie B</div>
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['22:00','Goias - Londrina','52345','2.10','3.20','3.10'])}
<div class="league-title">Arjantin Premier Lig 2. Aşama</div>
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['23:00','Banfield - Belgrano','62345','2.10','3.20','3.10'])}
<div class="league-title">Türkiye Kadın Futbol Süper Ligi</div>
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['18:00','Galatasaray (K) - Beşiktaş (K)','72345','2.10','3.20','3.10'])}
<div class="league-title">İngiltere Premier League 2</div>
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['18:00','Bournemouth U21 - Stoke (B)','82345','2.10','3.20','3.10'])}
`;
const {fixtures}=parseMackolikHtml(html);
console.log(fixtures.map(x=>[x.league.name,x.home.name,x.away.name,x.date]));
if(fixtures.length!==3)throw new Error(`Expected 3, got ${fixtures.length}`);
if(fixtures.some(x=>/Shahin|Benjamin|Goias|\(K\)|U21|Stoke/i.test(`${x.home.name} ${x.away.name}`)))throw new Error('Excluded fixture leaked');
for(const league of ['İngiltere Premier Lig','Belçika Pro Lig','Arjantin Premier Lig 2. Aşama'])if(!fixtures.some(x=>x.league.name===league))throw new Error(`Missing ${league}`);
if(!fixtures.every(x=>x.date?.startsWith('2026-09-21')))throw new Error('Date binding failed');
const checks={
 'Hollanda Eredivisie':true,'Portekiz Premier Lig':true,'Kolombiya Primera A Clausura':true,'Ekvador Pro Lig':true,
 'İran Azadegan Ligi':false,'Brezilya Serie B':false,'Türkiye Kadın Futbol Süper Ligi':false,'İngiltere Premier League 2':false
};
for(const [name,want] of Object.entries(checks)){const got=classifyCompetition(name).accepted;if(got!==want)throw new Error(`${name}: ${got} != ${want}`)}
console.log('V24 parser tests: OK');
