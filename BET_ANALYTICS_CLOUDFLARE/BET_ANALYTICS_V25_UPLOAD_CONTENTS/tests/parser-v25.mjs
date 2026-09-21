import {parseMackolikHtml} from '../netlify/functions/football.mjs';
const row=c=>`<tr>${c.map(x=>`<td>${x}</td>`).join('')}</tr>`;
const heading=x=>`<tr class="league"><td colspan="20"><img src="x" alt="${x}"></td></tr>`;
const html=`
${heading('Türkiye Süper Lig')}
${row(['21.09.2026','','İY','MS','1','X','2'])}
${row(['20:00','','','', '<img alt="">','', '<img>', 'Trabzonspor - Galatasaray','','04708','2.64','3.58','2.13'])}
${heading('İran Azadegan Ligi')}
${row(['21.09.2026','','İY','MS'])}
${row(['16:00','Shahin Bandar Ameri - Pars Jam Bushehr','22345','2.00','3.00','3.40'])}
${heading('Belçika Pro Lig')}
${row(['21.09.2026','','İY','MS'])}
${row(['21:00','Standard Liege - Genk','42345','2.10','3.20','3.10'])}
${heading('Türkiye Kadın Futbol Süper Ligi')}
${row(['21.09.2026','','İY','MS'])}
${row(['18:00','Galatasaray (K) - Beşiktaş (K)','72345','2.10','3.20','3.10'])}`;
const out=parseMackolikHtml(html);
console.log(out.fixtures.map(x=>[x.league.name,x.home.name,x.away.name]));
if(out.fixtures.length!==2)throw new Error(`Expected 2 accepted fixtures, got ${out.fixtures.length}`);
if(!out.fixtures.some(x=>x.league.name==='Türkiye Süper Lig'))throw new Error('Missing Türkiye Süper Lig from alt');
if(!out.fixtures.some(x=>x.league.name==='Belçika Pro Lig'))throw new Error('Missing Belçika Pro Lig from alt');
if(out.fixtures.some(x=>/Shahin|\(K\)/.test(x.home.name+x.away.name)))throw new Error('Excluded fixture leaked');
console.log('V25 parser alt/title test: OK');
