import {parseMackolikHtml, classifyCompetition, PARSER_VERSION} from '../cloudflare/football.mjs';
const row=c=>`<tr>${c.map(x=>`<td>${x}</td>`).join('')}</tr>`;
const league=x=>`<tr><td colspan="20"><img src="flag.gif" alt="${x}"></td></tr>`;
const html=`
${league('İngiltere Premier Lig')}
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['19:00','','','','','','','Arsenal - Manchester City','','12345','2.10','3.40','3.20'])}
${league('İran Azadegan Ligi')}
${row(['21.09.2026','','İY','MS'])}
${row(['20:00','','Shahin Bandar - Pars Jam Bushehr','22345','2.00','3.00','3.40'])}
${league('Belçika Pro Lig')}
${row(['21.09.2026','','İY','MS'])}
${row(['21:00','Standard Liege - Genk','42345','2.10','3.20','3.10'])}
${league('Türkiye Kadın Futbol Süper Ligi')}
${row(['21.09.2026','','İY','MS'])}
${row(['18:00','Galatasaray (K) - Beşiktaş (K)','72345','2.10','3.20','3.10'])}
${league('Brezilya Serie A')}
${row(['21.09.2026','','İY','MS'])}
${row(['22:00','Flamengo - Palmeiras','99999','2.20','3.20','3.00'])}`;
const out=parseMackolikHtml(html);console.log(PARSER_VERSION,out.fixtures.map(x=>`${x.league.name}: ${x.home.name} - ${x.away.name}`));
if(PARSER_VERSION!=='26.0.0')throw new Error('Wrong version');
if(out.fixtures.length!==3)throw new Error(`Expected 3 fixtures, got ${out.fixtures.length}`);
if(out.fixtures.some(x=>/Shahin|\(K\)/.test(x.home.name+x.away.name)))throw new Error('Excluded fixture leaked');
if(!classifyCompetition('Hollanda Eredivisie').accepted)throw new Error('Eredivisie should be accepted');
if(classifyCompetition('Brezilya Serie B').accepted)throw new Error('Serie B should be rejected');
if(!classifyCompetition('TÃ¼rkiye SÃ¼per Lig').accepted)throw new Error('Mojibake Turkish league should be repaired');
console.log('Parser tests: OK');
