import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { pushJoorShipmentSpine } from '@/lib/integrations/spine/joor-shipment-spine.service';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

/** POST /api/integrations/v1/joor/tracking/sync · Wave C2 F-TRACKING OUT */
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
  const externalOrderId = String(body.externalOrderId ?? body.order_id ?? '').trim();

  if (!wholesaleOrderId && !externalOrderId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'BAD_REQUEST', message: 'wholesaleOrderId or externalOrderId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const result = await pushJoorShipmentSpine({
    wholesaleOrderId: wholesaleOrderId || undefined,
    externalOrderId: externalOrderId || undefined,
    trackingNumber: body.trackingNumber != null ? String(body.trackingNumber) : undefined,
    carrier: body.carrier != null ? String(body.carrier) : undefined,
    status: body.status != null ? String(body.status) : undefined,
    shippedAt: body.shippedAt != null ? String(body.shippedAt) : undefined,
    estimatedDelivery: body.estimatedDelivery != null ? String(body.estimatedDelivery) : undefined,
  });

  if (!result) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'NOT_FOUND', message: 'JOOR wholesale order not found' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 404, headers: { 'x-request-id': requestId } }
    );
  }

  enqueueSyncJob({ platform: 'joor', kind: 'tracking_sync', resultCount: 1 });

  return NextResponse.json(
    {
      ok: true as const,
      data: result,
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
