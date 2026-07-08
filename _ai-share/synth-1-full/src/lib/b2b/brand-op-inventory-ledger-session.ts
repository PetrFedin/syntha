import {
  factoryMaterialsProcurementHrefForDemo,
  getPlatformCoreDemoByOrderId,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';

export type BrandOpInventoryLedgerSession = {
  collectionId: string;
  articleId: string;
  orderId: string;
  productionOrderId: string;
  inventoryReserveHref: string;
  wmsBalancesHref: string;
  wmsReserveSampleHref: string;
  supplierProcurementPatchHref: string;
};

export function buildBrandOpInventoryLedgerSession(input?: {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  productionOrderId?: string;
}): BrandOpInventoryLedgerSession {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const demo = getPlatformCoreDemoByOrderId(orderId);
  const collectionId = input?.collectionId?.trim() || demo.collectionId;
  const articleId = input?.articleId?.trim() || demo.demoArticleId;
  const productionOrderId = input?.productionOrderId?.trim() || demo.productionOrderId;

  return {
    collectionId,
    articleId,
    orderId,
    productionOrderId,
    inventoryReserveHref: `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/inventory-reserve`,
    wmsBalancesHref: `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/wms/balances`,
    wmsReserveSampleHref: `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/wms/reserve-sample`,
    supplierProcurementPatchHref: factoryMaterialsProcurementHrefForDemo(
      { ...demo, demoOrderId: orderId, productionOrderId, collectionId, demoArticleId: articleId },
      { role: 'supplier' }
    ),
  };
}

/** Parse reserved qty from GET inventory/reserve payload (Wave S3). */
export function resolveBrandOpInventoryReserveQty(payload: {
  reservedQty?: number;
  inventoryReserve?: { reserved?: boolean; reservedQty?: number };
}): number | null {
  const raw =
    payload.inventoryReserve?.reservedQty ??
    payload.reservedQty ??
    (payload.inventoryReserve?.reserved ? 0 : null);
  if (raw == null) return null;
  const qty = Number(raw);
  return Number.isFinite(qty) ? qty : null;
}

/** Sum reserved qty from WMS balance rows (Wave UG live badge). */
export function sumWmsReservedQty(
  balances: ReadonlyArray<{ qtyReserved?: number; qty_reserved?: number }>
): number {
  return balances.reduce((acc, row) => {
    const reserved =
      row.qtyReserved != null
        ? Number(row.qtyReserved)
        : row.qty_reserved != null
          ? Number(row.qty_reserved)
          : 0;
    return acc + (Number.isFinite(reserved) ? reserved : 0);
  }, 0);
}
