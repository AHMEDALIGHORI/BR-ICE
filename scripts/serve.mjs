import http from 'node:http';
import {stat,readFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.mjs':'application/javascript','.json':'application/json','.mp4':'video/mp4','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/')pathname='/index.html';const target=path.resolve(root,'.'+pathname);if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}const s=await stat(target);if(!s.isFile())throw Error('Not a file');const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/);if(!m){res.writeHead(416).end();return}const start=+m[1],end=m[2]?Math.min(+m[2],s.size-1):s.size-1;if(start>=s.size||start>end){res.writeHead(416).end();return}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${s.size}`,'Content-Length':end-start+1});createReadStream(target,{start,end}).pipe(res)}else{res.writeHead(200,{...headers,'Content-Length':s.size});if(req.method==='HEAD')res.end();else createReadStream(target).pipe(res)}}catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found')}});
server.listen(4173,'127.0.0.1',()=>console.log('BR-ICE local preview: http://127.0.0.1:4173'));
