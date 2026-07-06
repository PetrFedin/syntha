/**
 * POST — bulk confirm всех строк BOM под производственный заказ (один вызов).
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { NextRequest, NextResponse } from 'next/server';
import { parseSupplierMaterialPartialShipFields } from '@/lib/production/workshop2-supplier-material-partial-ship';
import { buildWorkshop2SupplierBulkConfirmIdempotencyKey } from '@/lib/production/workshop2-supplier-bulk-confirm-idempotency';
import {
  bulkConfirmWorkshop2SupplierMaterialSupply,
  bulkConfirmWorkshop2SupplierMaterialSupplyForOrder,
} from '@/lib/server/workshop2-supplier-material-request-confirm';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';

export const POST = withWorkshop2ApiErrorRu(async function postBulkConfirm(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const collectionId = String(body.collectionId ?? '').trim();
  const articleId = String(body.articleId ?? '').trim();
  const b2bOrderId = String(body.b2bOrderId ?? '').trim();
  const productionOrderId = String(body.productionOrderId ?? '').trim() || undefined;
  const confirmAllArticles = body.confirmAllArticles === true;
  const notifyOnly = body.notifyOnly === true;
  const { shippedQty, backorder } = parseSupplierMaterialPartialShipFields(body);

  const idempotencyKey =
    req.headers.get('Idempotency-Key')?.trim() ||
    String(body.idempotencyKey ?? '').trim() ||
    buildWorkshop2SupplierBulkConfirmIdempotencyKey({
      b2bOrderId,
      collectionId,
      articleId,
      productionOrderId,
      confirmAllArticles,
      partialShipQty: shippedQty,
      backorderFlag: backorder,
      notifyOnly,
    });

  if (!b2bOrderId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body', {
      messageRu: 'Укажите b2bOrderId.',
    });
  }

  const updatedBy = resolveWorkshop2UpdatedBy(req, String(body.updatedBy ?? ''), auth.actor);

  if (confirmAllArticles) {
    const result = await bulkConfirmWorkshop2SupplierMaterialSupplyForOrder({
      b2bOrderId,
      productionOrderId,
      updatedBy: updatedBy ?? undefined,
      shippedQty,
      backorder,
      idempotencyKey,
      notifyOnly,
    });
    if (!result.ok) {
      return jsonWorkshop2ErrorRu(400, 'bulk_confirm_failed', { messageRu: result.messageRu });
    }
    return NextResponse.json({
      ok: true,
      confirmed: result.confirmed,
      idempotent: result.idempotent,
      created: result.created,
      requisitionIds: result.requisitionIds,
      articlesProcessed: result.articlesProcessed,
      articleResults: result.articleResults,
      messageRu: result.messageRu,
      partialShipQty: result.partialShipQty ?? shippedQty ?? null,
      backorderFlag: result.backorderFlag ?? backorder,
      notifyOnly: result.notifyOnly ?? notifyOnly,
      idempotencyKey,
    });
  }

  if (!collectionId || !articleId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body', {
      messageRu: 'Укажите collectionId, articleId и b2bOrderId (или confirmAllArticles: true).',
    });
  }

  const result = await bulkConfirmWorkshop2SupplierMaterialSupply({
    collectionId,
    articleId,
    b2bOrderId,
    productionOrderId,
    updatedBy: updatedBy ?? undefined,
    shippedQty,
    backorder,
    idempotencyKey,
    notifyOnly,
  });

  if (!result.ok) {
    return jsonWorkshop2ErrorRu(400, 'bulk_confirm_failed', { messageRu: result.messageRu });
  }

  return NextResponse.json({
    ok: true,
    confirmed: result.confirmed,
    idempotent: result.idempotent,
    created: result.created,
    requisitionIds: result.requisitionIds,
    articlesProcessed: 1,
    messageRu: result.messageRu,
    partialShipQty: result.partialShipQty ?? shippedQty ?? null,
    backorderFlag: result.backorderFlag ?? backorder,
    notifyOnly: result.notifyOnly ?? notifyOnly,
    idempotencyKey,
  });
});
