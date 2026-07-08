import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { getAllocationQueue } from '@/lib/integrations/spine/allocation-queue-persistence.file';
import {
  ensureSpineOperationalStoreReady,
  SPINE_ALLOCATION_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';

type RouteCtx = { params: Promise<{ orderId: string }> };

/** GET /api/integrations/v1/allocation/:orderId · Wave D6 */
export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const requestId = getOrCreateRequestId(_req);
  const mode = getApiContractMode();
  const { orderId } = await ctx.params;
  await ensureSpineOperationalStoreReady(SPINE_ALLOCATION_SCOPES);
  const allocation = getAllocationQueue(orderId);

  return NextResponse.json(
    {
      ok: true as const,
      data: { allocation: allocation ?? null },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
