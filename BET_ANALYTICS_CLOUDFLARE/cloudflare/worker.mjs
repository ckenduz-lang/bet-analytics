import { footballApi, catalog, PARSER_VERSION } from './football.mjs';

const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(url.pathname==='/api/version') return json({app:'BET ANALYTICS',version:'27.0.0',parserVersion:PARSER_VERSION,source:'Pronosoft'});
    if(url.pathname==='/api/football') return footballApi(request);
    if(url.pathname==='/api/leagues') return json({version:PARSER_VERSION,source:'Pronosoft',leagues:catalog()});
    const res=await env.ASSETS.fetch(request);
    const h=new Headers(res.headers); h.set('cache-control','no-store, max-age=0');
    return new Response(res.body,{status:res.status,statusText:res.statusText,headers:h});
  }
};
