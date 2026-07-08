import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { listAllocationQueue } from '@/lib/integrations/spine/allocation-queue-persistence.file';
import {
  ensureSpineOperationalStoreReady,
  SPINE_ALLOCATION_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';

/** GET /api/integrations/v1/allocation/queue · brand post-confirm queue (D6) */
export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Math.min(50, Math.max(1, Number(limitRaw) || 20)) : 20;
  await ensureSpineOperationalStoreReady(SPINE_ALLOCATION_SCOPES);
  const items = listAllocationQueue(limit);

  return NextResponse.json(
    {
      ok: true as const,
      data: { items, count: items.length },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
