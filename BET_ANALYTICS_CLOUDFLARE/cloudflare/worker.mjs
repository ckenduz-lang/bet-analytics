import { handler as football } from '../netlify/functions/football.mjs';
import { handler as pronosoft } from '../netlify/functions/pronosoft-list.mjs';
import { handler as footballData } from '../netlify/functions/football-data.mjs';
import { handler as formHistory } from '../netlify/functions/form-history.mjs';
import { handler as matchAnalysis } from '../netlify/functions/match-analysis.mjs';

const routes = new Map([
  ['/api/football', football],
  ['/api/pronosoft-list', pronosoft],
  ['/api/football-data', footballData],
  ['/api/form-history', formHistory],
  ['/api/match-analysis', matchAnalysis],
]);

function qs(url){ return Object.fromEntries(url.searchParams.entries()); }
async function run(handler, request, env){
  // Existing modules read process.env. Cloudflare supplies env bindings.
  globalThis.process ??= { env: {} };
  process.env = {...process.env, ...env};
  const url=new URL(request.url);
  const body = request.method==='GET'||request.method==='HEAD' ? null : await request.text();
  const event={httpMethod:request.method,headers:Object.fromEntries(request.headers),queryStringParameters:qs(url),body};
  const r=await handler(event,{});
  return new Response(r?.body ?? '',{status:r?.statusCode ?? 200,headers:r?.headers ?? {'content-type':'application/json'}});
}
export default {
 async fetch(request,env){
   const url=new URL(request.url);
   const h=routes.get(url.pathname);
   if(h) return run(h,request,env);
   return env.ASSETS.fetch(request);
 }
};