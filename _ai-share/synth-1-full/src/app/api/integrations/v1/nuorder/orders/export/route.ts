import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { exportWholesaleOrderAfterConfirm } from '@/lib/integrations/spine/wholesale-export.service';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

/** POST /api/integrations/v1/nuorder/orders/export · F-NU-EXPORT */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const wholesaleOrderId = String(body.wholesaleOrderId ?? body.b2bOrderId ?? '').trim();
  const force = body.force === true || body.forceReexport === true;
  if (!wholesaleOrderId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_ORDER', message: 'wholesaleOrderId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  const record = await exportWholesaleOrderAfterConfirm(wholesaleOrderId, undefined, { force });
  if (!record || record.platform !== 'nuorder') {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'NOT_NUORDER', message: 'Order is not NuOrder-sourced' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  enqueueSyncJob({ platform: 'nuorder', kind: 'order_export', resultCount: 1 });
  return NextResponse.json(
    {
      ok: true as const,
      data: { export: record },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
