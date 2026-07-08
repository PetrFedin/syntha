import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { syncAims360Allocation } from '@/lib/integrations/spine/aims360-allocation.service';
import {
  ensureSpineOperationalStoreReady,
  SPINE_ALLOCATION_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

/** POST /api/integrations/v1/aims360/allocation/sync · Wave D6 P3-AIMS-ALLOC */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'INVALID_BODY', message: 'JSON body required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const wholesaleOrderId = String(body.wholesaleOrderId ?? body.b2bOrderId ?? '').trim();
  if (!wholesaleOrderId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_ORDER_ID', message: 'wholesaleOrderId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  await ensureSpineOperationalStoreReady(SPINE_ALLOCATION_SCOPES);

  const record = await syncAims360Allocation({
    wholesaleOrderId,
    locations: body.locations as Parameters<typeof syncAims360Allocation>[0]['locations'],
  });

  enqueueSyncJob({ platform: 'aims360', kind: 'allocation_sync', resultCount: 1 });

  return NextResponse.json(
    {
      ok: true as const,
      data: { allocation: record },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
