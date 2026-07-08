import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import {
  addWorkingOrderEditVersion,
  getWholesaleExport,
} from '@/lib/integrations/spine/wholesale-export.service';
import { listWorkingOrderVersions } from '@/lib/integrations/spine/working-order-persistence.file';
import { getImportedLineItems } from '@/lib/integrations/spine/imported-orders-persistence';
import {
  ensureSpineOperationalStoreReady,
  SPINE_WORKING_ORDER_READ_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

type RouteCtx = { params: Promise<{ orderId: string }> };

/** GET/POST /api/integrations/v1/working-order/:orderId · F-WORKING-ORDER */
export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const requestId = getOrCreateRequestId(_req);
  const mode = getApiContractMode();
  const { orderId } = await ctx.params;
  await ensureSpineOperationalStoreReady(SPINE_WORKING_ORDER_READ_SCOPES);
  const versions = listWorkingOrderVersions(orderId);
  const exportRecord = getWholesaleExport(orderId);

  return NextResponse.json(
    {
      ok: true as const,
      data: { wholesaleOrderId: orderId, versions, export: exportRecord ?? null },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  const { orderId } = await ctx.params;
  await ensureSpineOperationalStoreReady(SPINE_WORKING_ORDER_READ_SCOPES);
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const lines =
    (body.lines as Parameters<typeof addWorkingOrderEditVersion>[0]['lines']) ??
    getImportedLineItems(orderId) ??
    [];
  const version = addWorkingOrderEditVersion({
    wholesaleOrderId: orderId,
    label: String(body.label ?? `edit v${listWorkingOrderVersions(orderId).length + 1}`),
    lines,
  });
  enqueueSyncJob({ platform: 'syntha', kind: 'working_order', resultCount: 1 });
  return NextResponse.json(
    { ok: true as const, data: { version }, meta: { requestId, mode, apiVersion: 'v1' as const } },
    { headers: { 'x-request-id': requestId } }
  );
}
