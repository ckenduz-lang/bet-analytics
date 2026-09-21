import assert from 'node:assert/strict';
import {parsePronosoftHtml,classifyCompetition,PARSER_VERSION} from '../cloudflare/football.mjs';
assert.equal(PARSER_VERSION,'27.0.0');
assert.equal(classifyCompetition('D1 Turquie').accepted,true);
assert.equal(classifyCompetition('D2 Portugal').accepted,false);
assert.equal(classifyCompetition('Championship').accepted,false);
assert.equal(classifyCompetition('Europa League').accepted,true);
const html=`<h3>Lundi 21 Septembre</h3><table>
<tr><td>19h00</td><td>Galatasaray - Besiktas D1 Turquie</td><td>101</td><td>1,80</td><td>3,50</td><td>4,10</td></tr>
<tr><td>20h00</td><td>Benfica B - Leixoes D2 Portugal</td><td>102</td><td>2,00</td><td>3,20</td><td>3,40</td></tr>
<tr><td>21h00</td><td>Arsenal - Liverpool Premier League</td><td>103</td><td>2,10</td><td>3,40</td><td>3,10</td></tr>
</table>`;
const p=parsePronosoftHtml(html,{year:2026});
assert.equal(p.fixtures.length,2);
assert.equal(p.fixtures[0].date.slice(0,10),'2026-09-21');
assert.equal(p.fixtures[0].home.name,'Galatasaray');
assert.equal(p.fixtures[0].odds.home,1.8);
assert.equal(p.fixtures[1].league.name,'Angleterre Premier League');
console.log('Pronosoft parser tests OK:',p.fixtures.length);
