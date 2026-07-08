import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import {
  ensureSpineOperationalStoreReady,
  SPINE_TRACKING_READ_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';
import { resolveUnifiedOrderTracking } from '@/lib/integrations/spine/order-tracking.service';
import { isPlatformCorePgLogisticsWholesaleOrderId } from '@/lib/platform-core-spine-active-order-fallback';

type RouteCtx = { params: Promise<{ orderId: string }> };

/** GET /api/integrations/v1/orders/:orderId/tracking — WIP + shipment + delivery (D1/D2/E2). */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  const { orderId } = await ctx.params;
  const wholesaleOrderId = decodeURIComponent(orderId).trim();

  if (!wholesaleOrderId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'BAD_REQUEST', message: 'orderId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  await ensureSpineOperationalStoreReady(SPINE_TRACKING_READ_SCOPES);
  let tracking = resolveUnifiedOrderTracking(wholesaleOrderId);

  if (
    !tracking.shipment?.trackingNumber?.trim() &&
    isPlatformCorePgLogisticsWholesaleOrderId(wholesaleOrderId)
  ) {
    const { resolveWorkshop2B2bLogisticsTracking } =
      await import('@/lib/server/workshop2-b2b-order-logistics-tracking');
    const snap = await resolveWorkshop2B2bLogisticsTracking(wholesaleOrderId);
    if (snap.trackingNumber) {
      tracking = {
        ...tracking,
        shipment: {
          wholesaleOrderId,
          platform: 'syntha',
          trackingNumber: snap.trackingNumber,
          carrier: snap.carrier ?? undefined,
          status: snap.status ?? 'in_transit',
          updatedAt: new Date().toISOString(),
        },
      };
    }
  }

  return NextResponse.json(
    {
      ok: true as const,
      data: tracking,
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
