import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { DomainError, invariant } from '../core/errors.mjs';
import { wholesaleV2OpenApi } from './openapi.mjs';
import { createWholesaleRoutes, matchWholesaleRoute } from './routes.mjs';

export function createWholesaleHttpHandler({ authenticate, maxBodyBytes = 256 * 1024, nextRequestId = randomUUID, ...services } = {}) {
  invariant(typeof authenticate === 'function', 'HTTP_AUTHENTICATOR_REQUIRED', 'HTTP authenticator is required');
  const routes = createWholesaleRoutes(services);
  return async (request, response) => {
    const requestId = header(request, 'x-request-id') || nextRequestId();
    response.setHeader('x-request-id', requestId);
    try {
      const url = new URL(request.url ?? '/', 'http://syntha.local');
      if (request.method === 'GET' && url.pathname === '/health') return send(response, 200, { status: 'ok', service: 'syntha-wholesale-v2', requestId });
      if (request.method === 'GET' && url.pathname === '/openapi.json') return send(response, 200, wholesaleV2OpenApi);
      invariant(url.pathname.startsWith('/v2/'), 'HTTP_ROUTE_NOT_FOUND', 'Route not found', routeDetails(request, url));
      const actorId = await authenticateRequest(request, authenticate);
      const route = matchWholesaleRoute(routes, request.method, url.pathname);
      invariant(route, 'HTTP_ROUTE_NOT_FOUND', 'Route not found', routeDetails(request, url));
      const body = route.mutation ? await readJson(request, maxBodyBytes) : {};
      const commandId = route.mutation ? idempotencyKey(request) : undefined;
      const data = await route.execute({ actorId, commandId, body, params: route.params });
      return send(response, 200, { data, requestId });
    } catch (error) {
      const normalized = normalize(error);
      return send(response, normalized.status, { error: { code: normalized.code, message: normalized.message, details: normalized.details }, requestId });
    }
  };
}

export function createWholesaleHttpServer(options) { return createServer(createWholesaleHttpHandler(options)); }

async function authenticateRequest(request, authenticate) {
  const value = header(request, 'authorization');
  invariant(value?.startsWith('Bearer '), 'HTTP_AUTH_REQUIRED', 'Bearer authentication is required');
  const token = value.slice(7).trim();
  invariant(token, 'HTTP_AUTH_REQUIRED', 'Bearer authentication is required');
  const actor = await authenticate(token);
  invariant(actor?.actorId, 'HTTP_AUTH_INVALID', 'Authentication token is invalid');
  return actor.actorId;
}

function idempotencyKey(request) {
  const value = header(request, 'idempotency-key')?.trim();
  invariant(value, 'HTTP_IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key header is required for mutations');
  return value;
}

async function readJson(request, limit) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    invariant(size <= limit, 'HTTP_BODY_TOO_LARGE', 'Request body exceeds configured limit', { maxBodyBytes: limit });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new DomainError('HTTP_JSON_INVALID', 'Request body must be valid JSON'); }
}

function normalize(error) {
  if (!(error instanceof DomainError)) return { status: 500, code: 'INTERNAL_ERROR', message: 'Unexpected server error', details: {} };
  const code = error.code;
  let status = 422;
  if (code === 'HTTP_ROUTE_NOT_FOUND' || code.endsWith('_NOT_FOUND')) status = 404;
  else if (code === 'HTTP_AUTH_REQUIRED' || code === 'HTTP_AUTH_INVALID') status = 401;
  else if (code === 'CAPABILITY_DENIED' || code.includes('MEMBERSHIP_REQUIRED')) status = 403;
  else if (['HTTP_JSON_INVALID', 'HTTP_IDEMPOTENCY_KEY_REQUIRED', 'HTTP_IDENTIFIER_MISMATCH'].includes(code)) status = 400;
  else if (code === 'HTTP_BODY_TOO_LARGE') status = 413;
  else if (code.includes('CONFLICT') || code.includes('ALREADY_EXISTS')) status = 409;
  return { status, code, message: error.message, details: error.details ?? {} };
}

function header(request, name) { const value = request.headers[name]; return Array.isArray(value) ? value[0] : value; }
function routeDetails(request, url) { return { method: request.method, path: url.pathname }; }
function send(response, status, payload) {
  const body = JSON.stringify(payload);
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('content-length', Buffer.byteLength(body));
  response.end(body);
}
