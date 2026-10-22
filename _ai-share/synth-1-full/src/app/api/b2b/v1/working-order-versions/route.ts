import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import type { WorkingOrderVersion } from '@/lib/b2b/working-order-version.types';
import { canUseLegacyB2bWorkingOrderVersionsStore } from '@/lib/b2b/legacy-working-order-versions-policy';
import {
  loadWorkingOrderVersionsPersisted,
  saveWorkingOrderVersionsPersisted,
} from '@/lib/b2b/b2b-working-order-versions-persistence.file';

/**
 * The legacy list/replace API has no organization scope. It is demo-only.
 * Do not rely on caller-controlled role headers to grant access to this store.
 */
function legacyDemoOnlyResponse(requestId: string, mode: ReturnType<typeof getApiContractMode>) {
  return NextResponse.json(
    {
      ok: false as const,
      error: {
        code: 'LEGACY_DEMO_STORE_DISABLED',
        message: 'Legacy Working Order versions store is disabled in production.',
      },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    {
      status: 403,
      headers: { 'x-request-id': requestId, 'Cache-Control': 'no-store' },
    }
  );
}

function isValidVersion(v: unknown): v is WorkingOrderVersion {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    o.id.length > 0 &&
    typeof o.createdAt === 'string' &&
    typeof o.uploadedBy === 'string' &&
    typeof o.fileName === 'string' &&
    Array.isArray(o.rows) &&
    typeof o.status === 'string'
  );
}

/**
 * GET /api/b2b/v1/working-order-versions
 * Query: `wholesaleOrderId` — опционально отфильтровать версии по оптовому заказу.
 */
export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  if (!canUseLegacyB2bWorkingOrderVersionsStore()) {
    return legacyDemoOnlyResponse(requestId, mode);
  }
  const wholesaleOrderId = req.nextUrl.searchParams.get('wholesaleOrderId')?.trim();
  let versions = loadWorkingOrderVersionsPersisted();
  if (wholesaleOrderId) {
    versions = versions.filter((v) => v.wholesaleOrderId === wholesaleOrderId);
  }
  return NextResponse.json(
    {
      ok: true as const,
      data: { versions },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId, 'Cache-Control': 'no-store' } }
  );
}

/**
 * PUT /api/b2b/v1/working-order-versions
 * Тело: `{ "versions": WorkingOrderVersion[] }` — полная замена списка на сервере (демо-модель).
 */
export async function PUT(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  if (!canUseLegacyB2bWorkingOrderVersionsStore()) {
    return legacyDemoOnlyResponse(requestId, mode);
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  const raw =
    typeof body === 'object' && body !== null
      ? (body as { versions?: unknown }).versions
      : undefined;
  if (!Array.isArray(raw)) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'BAD_REQUEST', message: 'Body must include array "versions"' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  if (!raw.every(isValidVersion)) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'BAD_REQUEST', message: 'Invalid version object in array' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  saveWorkingOrderVersionsPersisted(raw);
  return NextResponse.json(
    {
      ok: true as const,
      data: { count: raw.length },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId, 'Cache-Control': 'no-store' } }
  );
}
