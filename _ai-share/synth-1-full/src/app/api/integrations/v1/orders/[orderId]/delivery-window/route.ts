import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { getDeliveryWindow } from '@/lib/integrations/spine/delivery-window-persistence.file';
import { syncDeliveryWindowForOrder } from '@/lib/integrations/spine/integration-calendar-bridge';
import {
  ensureSpineOperationalStoreReady,
  SPINE_DELIVERY_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';

type RouteCtx = { params: Promise<{ orderId: string }> };

/** GET/POST /api/integrations/v1/orders/:orderId/delivery-window · Wave E2 */
export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const requestId = getOrCreateRequestId(_req);
  const mode = getApiContractMode();
  const { orderId } = await ctx.params;
  await ensureSpineOperationalStoreReady(SPINE_DELIVERY_SCOPES);
  const record = getDeliveryWindow(orderId);

  return NextResponse.json(
    {
      ok: true as const,
      data: { deliveryWindow: record ?? null },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  const { orderId } = await ctx.params;
  await ensureSpineOperationalStoreReady(SPINE_DELIVERY_SCOPES);

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const label = String(body.label ?? body.deliveryDate ?? body.estimatedDelivery ?? '').trim();
  if (!label) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_LABEL', message: 'label or deliveryDate required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const record = syncDeliveryWindowForOrder({
    wholesaleOrderId: orderId,
    collectionId: body.collectionId as string | undefined,
    label,
    sourcePlatform: body.sourcePlatform as 'joor' | 'nuorder' | 'zedonk' | 'syntha' | undefined,
  });

  if (!record) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'INVALID_DATE', message: 'Could not parse delivery label' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  enqueueSyncJob({ platform: 'syntha', kind: 'delivery_sync', resultCount: 1 });
  bumpPlatformCoreChainStatus([orderId]);

  return NextResponse.json(
    {
      ok: true as const,
      data: { deliveryWindow: record },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
