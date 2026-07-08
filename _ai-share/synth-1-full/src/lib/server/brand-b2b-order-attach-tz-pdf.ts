import { workshop2B2bProductionHandoffPoId } from '@/lib/server/workshop2-b2b-production-handoff';
import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import {
  getWorkshop2PurchaseOrderById,
  updateWorkshop2PurchaseOrderErpSync,
} from '@/lib/server/workshop2-purchase-order-repository';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type BrandB2bOrderAttachTzPdfResult = {
  ok: boolean;
  orderId: string;
  productionOrderId?: string;
  collectionId?: string;
  articleId?: string;
  tzPdfHref?: string;
  attachedAt?: string;
  messageRu: string;
  storageMode: 'pg' | 'file';
};

/** Stub POST · attach TZ PDF metadata to production PO payload (Wave UN). */
export async function attachBrandB2bOrderTzPdfToPo(input: {
  orderId: string;
  collectionId?: string;
  articleId?: string;
  productionOrderId?: string;
  actor?: string;
}): Promise<BrandB2bOrderAttachTzPdfResult> {
  const orderId = input.orderId.trim();
  const order = await getWorkshop2B2bOrder(orderId);
  if (!order) {
    return {
      ok: false,
      orderId,
      messageRu: 'B2B-заказ не найден.',
      storageMode: isWorkshop2PostgresEnabled() ? 'pg' : 'file',
    };
  }

  const collectionId = input.collectionId?.trim() || order.collectionId?.trim() || 'SS27';
  const articleId =
    input.articleId?.trim() ||
    order.lines[0]?.articleId?.trim() ||
    order.articleId?.trim() ||
    'demo-ss27-01';
  const productionOrderId =
    input.productionOrderId?.trim() || workshop2B2bProductionHandoffPoId(orderId);
  const attachedAt = new Date().toISOString();
  const tzPdfHref = `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/export-tz-bundle.pdf`;

  const po = await getWorkshop2PurchaseOrderById(productionOrderId);
  if (!po) {
    return {
      ok: false,
      orderId,
      productionOrderId,
      collectionId,
      articleId,
      messageRu: `PO ${productionOrderId} не найден — attach TZ PDF stub.`,
      storageMode: isWorkshop2PostgresEnabled() ? 'pg' : 'file',
    };
  }

  const updated = await updateWorkshop2PurchaseOrderErpSync({
    id: productionOrderId,
    collectionId: po.collectionId,
    articleId: po.articleId,
    status: po.status,
    payloadPatch: {
      tzPdfAttachment: {
        attachedAt,
        attachedBy: input.actor?.trim() || 'brand-op',
        tzPdfHref,
        b2bOrderId: orderId,
        collectionId,
        articleId,
      },
    },
  });

  if (!updated) {
    return {
      ok: false,
      orderId,
      productionOrderId,
      messageRu: 'Не удалось обновить PO (attach TZ PDF).',
      storageMode: isWorkshop2PostgresEnabled() ? 'pg' : 'file',
    };
  }

  return {
    ok: true,
    orderId,
    productionOrderId,
    collectionId,
    articleId,
    tzPdfHref,
    attachedAt,
    messageRu: `ТЗ PDF прикреплено к PO ${productionOrderId}.`,
    storageMode: isWorkshop2PostgresEnabled() ? 'pg' : 'file',
  };
}
