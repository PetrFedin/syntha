import type { Workshop2MaterialRequisitionRecord } from '@/lib/server/workshop2-material-requisition-repository';
import type { Workshop2PurchaseOrderRecord } from '@/lib/server/workshop2-purchase-order-repository';

export type BrandProductionOpsPoRow = {
  id: string;
  poCode: string;
  articleId: string;
  sku: string;
  supplierOrFactory: string;
  qty: number;
  status: string;
  mesReleaseStage?: string;
  b2bOrderId?: string;
};

export type BrandProductionOpsBomRow = {
  id: string;
  articleId: string;
  sku: string;
  materialLabel: string;
  bomLineRef?: string;
  qty?: number;
  unit?: string;
  status: string;
};

export type BrandProductionOpsSnapshot = {
  poRows: BrandProductionOpsPoRow[];
  bomRows: BrandProductionOpsBomRow[];
  storageMode: 'pg' | 'file' | 'empty';
};

export function workshop2PoToBrandProductionOpsRow(
  po: Workshop2PurchaseOrderRecord
): BrandProductionOpsPoRow {
  const payload = po.payload ?? {};
  const poCode =
    (payload.poCode as string | undefined)?.trim() || po.lineRef?.trim() || `PO-${po.id.slice(-6)}`;
  const sku = (payload.sku as string | undefined)?.trim() || po.articleId;
  const supplierOrFactory =
    (payload.factoryName as string | undefined)?.trim() ||
    (payload.supplierName as string | undefined)?.trim() ||
    po.supplierId?.trim() ||
    '—';
  const b2bOrderId = (payload.b2bOrderId as string | undefined)?.trim();

  return {
    id: po.id,
    poCode,
    articleId: po.articleId,
    sku,
    supplierOrFactory,
    qty: po.qty,
    status: po.status,
    mesReleaseStage: po.mesReleaseStage,
    b2bOrderId,
  };
}

export function workshop2RequisitionToBrandProductionOpsBomRow(
  req: Workshop2MaterialRequisitionRecord
): BrandProductionOpsBomRow {
  const payloadSku = req.bomLineRef?.split(':')[0];
  return {
    id: req.id,
    articleId: req.articleId,
    sku: payloadSku?.trim() || req.articleId,
    materialLabel: req.materialLabel?.trim() || req.bomLineRef?.trim() || 'Material line',
    bomLineRef: req.bomLineRef,
    qty: req.quantity,
    unit: req.unit,
    status: req.status,
  };
}

export function labelBrandProductionOpsPoStatusRu(status: string): string {
  switch (status) {
    case 'synced':
      return 'Confirmed · ERP';
    case 'pending_erp':
      return 'Sent · ERP pending';
    case 'error':
      return 'ERP error';
    case 'draft':
      return 'Draft';
    default:
      return status;
  }
}
