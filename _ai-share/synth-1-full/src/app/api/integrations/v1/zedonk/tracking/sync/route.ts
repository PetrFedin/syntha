import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { syncZedonkTracking } from '@/lib/integrations/spine/order-tracking.service';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

/** POST /api/integrations/v1/zedonk/tracking/sync */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const wholesaleOrderId = String(
    body.wholesaleOrderId ?? body.orderId ?? body.b2bOrderId ?? ''
  ).trim();

  if (!wholesaleOrderId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'BAD_REQUEST', message: 'wholesaleOrderId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const shipment = syncZedonkTracking({
    wholesaleOrderId,
    trackingNumber: body.trackingNumber != null ? String(body.trackingNumber) : undefined,
    carrier: body.carrier != null ? String(body.carrier) : undefined,
    status: body.status != null ? String(body.status) : undefined,
    shippedAt: body.shippedAt != null ? String(body.shippedAt) : undefined,
    estimatedDelivery: body.estimatedDelivery != null ? String(body.estimatedDelivery) : undefined,
  });

  enqueueSyncJob({ platform: 'zedonk', kind: 'tracking_sync', resultCount: 1 });

  return NextResponse.json(
    {
      ok: true as const,
      data: { shipment },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
