import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStandaloneHandler } from '../src/web/static-handler.mjs';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
async function withServer(handler, work) {
  const server = createServer(handler);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  try { return await work(`http://127.0.0.1:${server.address().port}`); }
  finally { server.close(); await once(server, 'close'); }
}

test('serves standalone workspace with security headers', async () => {
  await withServer(createStandaloneHandler({ publicDir, apiHandler: (_req,res)=>{res.statusCode=404;res.end();} }), async base => {
    const response = await fetch(`${base}/`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
    assert.match(await response.text(), /Syntha V2/);
    const script = await fetch(`${base}/app.js`);
    assert.equal(script.status, 200);
    assert.match(script.headers.get('content-type'), /text\/javascript/);
  });
});

test('delegates API and unknown paths to API handler', async () => {
  const seen = [];
  await withServer(createStandaloneHandler({ publicDir, apiHandler: (req,res)=>{seen.push(req.url);res.statusCode=202;res.end('api');} }), async base => {
    assert.equal((await fetch(`${base}/v2/auth/me`)).status, 202);
    assert.equal((await fetch(`${base}/unknown`)).status, 202);
  });
  assert.deepEqual(seen, ['/v2/auth/me','/unknown']);
});
