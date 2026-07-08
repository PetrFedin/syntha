import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import {
  acknowledgeApparelMagicVendorPo,
  importApparelMagicVendorPo,
} from '@/lib/integrations/spine/apparel-magic-vendor-po.service';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

/** POST /api/integrations/v1/apparel-magic/vendor-po/import · Wave D6 P4-AM-VENDOR-PO */
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
        error: { code: 'INVALID_BODY', message: 'JSON required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  const b2bOrderId = String(body.b2bOrderId ?? body.wholesaleOrderId ?? '').trim();
  if (!b2bOrderId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_ORDER', message: 'b2bOrderId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  const record = await importApparelMagicVendorPo({
    b2bOrderId,
    vendorPoId: body.vendorPoId as string | undefined,
    productionOrderId: body.productionOrderId as string | undefined,
    lines: body.lines as Parameters<typeof importApparelMagicVendorPo>[0]['lines'],
  });
  enqueueSyncJob({ platform: 'apparel_magic', kind: 'vendor_po_import', resultCount: 1 });
  return NextResponse.json(
    {
      ok: true as const,
      data: { vendorPo: record },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}

/** PATCH ack · supplier confirms qty/date */
export async function PATCH(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const vendorPoId = String(body.vendorPoId ?? '').trim();
  if (!vendorPoId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_ID', message: 'vendorPoId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  const record = await acknowledgeApparelMagicVendorPo({
    vendorPoId,
    ackLines: body.ackLines as Parameters<typeof acknowledgeApparelMagicVendorPo>[0]['ackLines'],
  });
  if (!record) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'NOT_FOUND', message: 'vendor PO not found' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 404, headers: { 'x-request-id': requestId } }
    );
  }
  enqueueSyncJob({ platform: 'apparel_magic', kind: 'vendor_po_ack', resultCount: 1 });
  return NextResponse.json(
    {
      ok: true as const,
      data: { vendorPo: record },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
