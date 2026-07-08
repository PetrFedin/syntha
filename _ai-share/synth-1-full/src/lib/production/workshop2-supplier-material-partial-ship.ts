/** Wave TX · partial ship + backorder field aliases for supplier materials PATCH. */

export type SupplierMaterialPartialShipInput = {
  shippedQty?: number;
  backorder?: boolean;
  partialShipQty?: number;
  backorderFlag?: boolean;
};

export function parseSupplierMaterialPartialShipFields(body: Record<string, unknown>): {
  shippedQty?: number;
  backorder?: boolean;
} {
  const qtyRaw = body.partialShipQty ?? body.shippedQty;
  const shippedQty =
    qtyRaw != null && Number.isFinite(Number(qtyRaw))
      ? Math.max(0, Math.round(Number(qtyRaw)))
      : undefined;
  const backorder = body.backorderFlag === true || body.backorder === true;
  return { shippedQty, backorder };
}

export function supplierMaterialPartialShipJournalFields(input: {
  shippedQty: number | null;
  backorder: boolean;
  status: 'confirmed' | 'rejected';
}): Record<string, unknown> {
  if (input.status !== 'confirmed') {
    return {
      partialShipQty: null,
      backorderFlag: false,
    };
  }
  return {
    partialShipQty: input.shippedQty,
    backorderFlag: input.backorder,
  };
}
