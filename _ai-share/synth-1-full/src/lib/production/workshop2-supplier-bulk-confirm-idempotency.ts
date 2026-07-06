/** Стабильный Idempotency-Key для POST supplier/material-request/bulk-confirm. */
export function buildWorkshop2SupplierBulkConfirmIdempotencyKey(input: {
  b2bOrderId: string;
  collectionId?: string;
  articleId?: string;
  productionOrderId?: string;
  confirmAllArticles?: boolean;
  partialShipQty?: number;
  backorderFlag?: boolean;
  notifyOnly?: boolean;
}): string {
  const orderId = input.b2bOrderId.trim();
  const po = input.productionOrderId?.trim() || 'no-po';
  const scope = input.confirmAllArticles
    ? 'all-articles'
    : `${input.collectionId?.trim() || 'no-col'}:${input.articleId?.trim() || 'no-art'}`;
  const qty =
    input.partialShipQty != null && Number.isFinite(input.partialShipQty)
      ? String(Math.max(0, Math.round(input.partialShipQty)))
      : 'full';
  const backorder = input.backorderFlag === true ? 'backorder' : 'no-backorder';
  const mode = input.notifyOnly === true ? 'notify' : 'confirm';
  return `sup-bulk-confirm:${mode}:${orderId}:${po}:${scope}:${qty}:${backorder}`;
}
