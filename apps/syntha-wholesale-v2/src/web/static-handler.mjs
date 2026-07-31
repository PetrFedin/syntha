import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { invariant } from '../core/errors.mjs';

const DEFAULT_PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');
const ASSETS = Object.freeze({
  '/': ['index.html', 'text/html; charset=utf-8', 'no-store'],
  '/index.html': ['index.html', 'text/html; charset=utf-8', 'no-store'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8', 'public, max-age=300'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8', 'public, max-age=300'],
});

export function createStandaloneHandler({ apiHandler, publicDir = DEFAULT_PUBLIC_DIR } = {}) {
  invariant(typeof apiHandler === 'function', 'HTTP_API_HANDLER_REQUIRED', 'API handler is required');
  return async function standaloneHandler(request, response) {
    const url = new URL(request.url ?? '/', 'http://syntha.local');
    const asset = ASSETS[url.pathname];
    if (!asset || !['GET', 'HEAD'].includes(request.method ?? 'GET')) return apiHandler(request, response);
    try {
      const [filename, contentType, cacheControl] = asset;
      const body = await readFile(path.join(publicDir, filename));
      response.statusCode = 200;
      response.setHeader('content-type', contentType);
      response.setHeader('content-length', body.length);
      response.setHeader('cache-control', cacheControl);
      response.setHeader('x-content-type-options', 'nosniff');
      response.setHeader('referrer-policy', 'no-referrer');
      response.setHeader('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
      if (request.method === 'HEAD') response.end();
      else response.end(body);
    } catch {
      response.statusCode = 500;
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({ error: { code: 'STATIC_ASSET_UNAVAILABLE', message: 'Web workspace asset is unavailable' } }));
    }
  };
}
