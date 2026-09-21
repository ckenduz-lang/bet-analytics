import football from '../netlify/functions/football.mjs';
import pronosoft from '../netlify/functions/pronosoft-list.mjs';
import { handler as footballData } from '../netlify/functions/football-data.mjs';
import { handler as formHistory } from '../netlify/functions/form-history.mjs';
import matchAnalysis from '../netlify/functions/match-analysis.mjs';
import scorerPremium from '../netlify/functions/scorer-premium.mjs';

const direct = new Map([
  ['/api/football', football],
  ['/api/pronosoft-list', pronosoft],
  ['/api/match-analysis', matchAnalysis],
  ['/api/scorer-premium', scorerPremium],
]);
const legacy = new Map([
  ['/api/football-data', footballData],
  ['/api/form-history', formHistory],
]);

function query(url){ return Object.fromEntries(url.searchParams.entries()); }

async function runLegacy(handler, request, env){
  globalThis.process ??= { env: {} };
  process.env = {...process.env, ...env};
  const url = new URL(request.url);
  const body = ['GET','HEAD'].includes(request.method) ? null : await request.text();
  const event = {
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers),
    queryStringParameters: query(url),
    body
  };
  const r = await handler(event, {});
  return new Response(r?.body ?? '', {
    status: r?.statusCode ?? 200,
    headers: r?.headers ?? {'content-type':'application/json'}
  });
}

export default {
  async fetch(request, env) {
    globalThis.process ??= { env: {} };
    process.env = {...process.env, ...env};
    const path = new URL(request.url).pathname;
    if (direct.has(path)) return direct.get(path)(request, {});
    if (legacy.has(path)) return runLegacy(legacy.get(path), request, env);
    return env.ASSETS.fetch(request);
  }
};
