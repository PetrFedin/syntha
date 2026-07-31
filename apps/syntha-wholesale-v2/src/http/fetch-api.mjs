import { randomUUID } from 'node:crypto';
import { DomainError, invariant } from '../core/errors.mjs';
import { normalizeHttpError } from './api.mjs';
import { wholesaleV2OpenApi } from './openapi.mjs';
import { createWholesaleRoutes, matchWholesaleRoute } from './routes.mjs';

export function createWholesaleFetchHandler({ authenticate, maxBodyBytes = 256 * 1024, nextRequestId = randomUUID, ...services } = {}) {
  invariant(typeof authenticate === 'function', 'HTTP_AUTHENTICATOR_REQUIRED', 'HTTP authenticator is required');
  const routes = createWholesaleRoutes(services);
  return async function handleWholesaleFetchRequest(request) {
    const requestId = request.headers.get('x-request-id') || nextRequestId();
    try {
      const url = new URL(request.url);
      if (request.method === 'GET' && url.pathname === '/health') return json(200, { status: 'ok', service: 'syntha-wholesale-v2', requestId }, requestId);
      if (request.method === 'GET' && url.pathname === '/openapi.json') return json(200, wholesaleV2OpenApi, requestId);
      invariant(url.pathname.startsWith('/v2/'), 'HTTP_ROUTE_NOT_FOUND', 'Route not found', { method: request.method, path: url.pathname });
      const actorId = await authenticateBearer(request, authenticate);
      const route = matchWholesaleRoute(routes, request.method, url.pathname);
      invariant(route, 'HTTP_ROUTE_NOT_FOUND', 'Route not found', { method: request.method, path: url.pathname });
      const body = route.mutation ? await readJson(request, maxBodyBytes) : {};
      const commandId = route.mutation ? requireIdempotencyKey(request) : undefined;
      const data = await route.execute({ actorId, commandId, body, params: route.params });
      return json(200, { data, requestId }, requestId);
    } catch (error) {
      const normalized = normalizeHttpError(error);
      return json(normalized.status, { error: { code: normalized.code, message: normalized.message, details: normalized.details }, requestId }, requestId);
    }
  };
}

async function authenticateBearer(request, authenticate) {
  const authorization = request.headers.get('authorization');
  invariant(authorization?.startsWith('Bearer '), 'HTTP_AUTH_REQUIRED', 'Bearer authentication is required');
  const actor = await authenticate(authorization.slice(7).trim());
  invariant(actor?.actorId, 'HTTP_AUTH_INVALID', 'Authentication token is invalid');
  return actor.actorId;
}
function requireIdempotencyKey(request) {
  const value = request.headers.get('idempotency-key')?.trim();
  invariant(value, 'HTTP_IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key header is required for mutations');
  return value;
}
async function readJson(request, limit) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  invariant(!Number.isFinite(contentLength) || contentLength <= limit, 'HTTP_BODY_TOO_LARGE', 'Request body exceeds configured limit', { maxBodyBytes: limit });
  const buffer = await request.arrayBuffer();
  invariant(buffer.byteLength <= limit, 'HTTP_BODY_TOO_LARGE', 'Request body exceeds configured limit', { maxBodyBytes: limit });
  if (!buffer.byteLength) return {};
  try { return JSON.parse(Buffer.from(buffer).toString('utf8')); }
  catch { throw new DomainError('HTTP_JSON_INVALID', 'Request body must be valid JSON'); }
}
function json(status, payload, requestId) {
  return Response.json(payload, { status, headers: { 'x-request-id': requestId } });
}
