import type { BrandProductionCutTicketPgPayload } from '@/lib/production/brand-production-cut-ticket-spine';

/** Cut ticket stub persisted on production order (workshop2_purchase_orders.cut_ticket). */
export type ProductionOrderCutTicketStub = {
  ticketNo?: string;
  status?: string;
  statusLabelRu?: string;
  totalQty?: number;
  sizeSummary?: string;
  targetCutDate?: string;
  factoryName?: string;
  sku?: string;
  articleName?: string;
  b2bOrderId?: string;
  source?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export function buildProductionOrderCutTicketStub(input: {
  productionOrderId: string;
  collectionId: string;
  articleId: string;
  b2bOrderId?: string;
  payload?: BrandProductionCutTicketPgPayload;
  qty?: number;
  brandStatus?: string;
  ticketNo?: string;
}): ProductionOrderCutTicketStub {
  const payload = input.payload ?? {};
  const status = payload.brandStatus ?? input.brandStatus ?? 'ready';
  return {
    ticketNo: input.ticketNo ?? payload.poCode ?? `CT-${input.productionOrderId.slice(-6)}`,
    status,
    statusLabelRu:
      status === 'issued'
        ? 'Выпущена'
        : status === 'in_wip'
          ? 'В раскрое'
          : status === 'ready'
            ? 'Готова к выпуску'
            : 'Черновик',
    totalQty: input.qty,
    sizeSummary: payload.sizeSummary,
    targetCutDate: payload.targetCutDate,
    factoryName: payload.factoryName,
    sku: payload.sku ?? input.articleId,
    articleName: payload.articleName ?? input.articleId,
    b2bOrderId: payload.b2bOrderId ?? input.b2bOrderId,
    source: payload.source ?? 'brand_ops_sync',
  };
}

export function summarizeProductionOrderCutTicketRu(
  stub: ProductionOrderCutTicketStub | null | undefined
): string {
  if (!stub?.ticketNo) return 'Техкарта раскроя не привязана к PO.';
  const qty = stub.totalQty != null ? ` · ${stub.totalQty} ед.` : '';
  const status = stub.statusLabelRu ?? stub.status ?? '—';
  return `Техкарта ${stub.ticketNo} · ${status}${qty}`;
}

export function isProductionOrderCutTicketEmpty(
  stub: ProductionOrderCutTicketStub | Record<string, unknown> | null | undefined
): boolean {
  if (!stub || typeof stub !== 'object') return true;
  return Object.keys(stub).length === 0;
}
