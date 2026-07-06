/**
 * POST — WMS shipment confirm webhook → materials_supplied chain-status bump (Wave TX).
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { parseSupplierMaterialPartialShipFields } from '@/lib/production/workshop2-supplier-material-partial-ship';
import {
  isWorkshop2SupplierWmsConfirmWebhookEnabled,
  verifyWorkshop2SupplierWmsConfirmWebhookSecret,
} from '@/lib/production/workshop2-supplier-wms-confirm-webhook';
import { handleWorkshop2SupplierWmsConfirmWebhook } from '@/lib/server/workshop2-supplier-wms-confirm-handler';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withWorkshop2ApiErrorRu(async function postSupplierWmsConfirmWebhook(req: NextRequest) {
  if (!isWorkshop2SupplierWmsConfirmWebhookEnabled()) {
    return jsonWorkshop2ErrorRu(503, 'webhook_disabled', {
      messageRu:
        'WMS confirm webhook отключён (WORKSHOP2_SUPPLIER_WMS_CONFIRM_WEBHOOK_ENABLED=false).',
    });
  }

  const verify = verifyWorkshop2SupplierWmsConfirmWebhookSecret({
    signatureHeader: req.headers.get('x-wms-confirm-secret'),
  });
  if (!verify.ok) {
    return jsonWorkshop2ErrorRu(verify.status ?? 401, 'webhook_unauthorized', {
      messageRu: verify.messageRu ?? 'WMS confirm webhook: отказ авторизации.',
    });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const b2bOrderId = String(body.b2bOrderId ?? body.orderId ?? '').trim();
  const productionOrderId = String(body.productionOrderId ?? body.po ?? '').trim() || undefined;
  const { shippedQty, backorder } = parseSupplierMaterialPartialShipFields(body);

  const result = await handleWorkshop2SupplierWmsConfirmWebhook({
    b2bOrderId,
    productionOrderId,
    partialShipQty: shippedQty,
    backorderFlag: backorder,
    updatedBy: String(body.updatedBy ?? 'wms-confirm-webhook'),
  });

  if (!result.ok) {
    return jsonWorkshop2ErrorRu(400, 'wms_confirm_failed', { messageRu: result.messageRu });
  }

  return NextResponse.json({
    ok: true,
    idempotent: result.idempotent ?? false,
    confirmed: result.confirmed ?? 0,
    messageRu: result.messageRu,
  });
});
