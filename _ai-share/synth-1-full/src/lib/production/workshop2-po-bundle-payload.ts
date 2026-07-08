/**
 * PO bundle export payload — BOM × серия + строки PO (supplier procurement).
 */
import type { Workshop2PurchaseOrderRecord } from '@/lib/server/workshop2-purchase-order-repository';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  computeSupplierBomFillRatePercent,
  computeSupplierBomWeightedFillRatePercent,
  type SupplierBomLineInput,
} from '@/lib/platform-core-supplier-materials-reference';

export type Workshop2PoBundlePayload = {
  schemaVersion: 1;
  collectionId: string;
  articleId: string;
  generatedAt: string;
  seriesQty: number;
  b2bOrderId?: string;
  bomFillPct: number;
  bomWeightedFillPct: number;
  purchaseOrders: Array<{
    id: string;
    supplierId?: string;
    qty: number;
    status: string;
    lineRef?: string;
  }>;
  bomLines: Array<{
    name: string;
    role?: string;
    perUnit: number;
    unit?: string;
    requiredQty: number;
    supplier?: string;
  }>;
  legalNoteRu: string;
};

function readBomLines(dossier: Workshop2DossierPhase1): SupplierBomLineInput[] {
  const lines = dossier.productionModel?.materialLines;
  return Array.isArray(lines) ? (lines as SupplierBomLineInput[]) : [];
}

export function buildWorkshop2PoBundlePayload(input: {
  collectionId: string;
  articleId: string;
  dossier: Workshop2DossierPhase1;
  purchaseOrders: Workshop2PurchaseOrderRecord[];
  seriesQty?: number;
  b2bOrderId?: string;
}): Workshop2PoBundlePayload {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const bomLines = readBomLines(input.dossier);
  const poRows = input.purchaseOrders ?? [];
  const poQtySum = poRows.reduce((s, po) => s + (Number(po.qty) || 0), 0);
  const planQty = input.dossier.planPoBundleSnapshot?.totalQty ?? 0;
  const seriesQty = Math.max(0, Math.round(input.seriesQty ?? poQtySum ?? planQty ?? 0)) || 0;

  const mappedBom = bomLines
    .filter((line) => line.materialName?.trim())
    .map((line) => {
      const perUnit = line.yieldPerUnit ?? line.consumption ?? 0;
      return {
        name: line.materialName!.trim(),
        role: line.role,
        perUnit,
        unit: line.unit,
        requiredQty: perUnit > 0 && seriesQty > 0 ? perUnit * seriesQty : 0,
        supplier: line.supplier?.trim() || undefined,
      };
    });

  return {
    schemaVersion: 1,
    collectionId,
    articleId,
    generatedAt: new Date().toISOString(),
    seriesQty,
    b2bOrderId: input.b2bOrderId?.trim() || undefined,
    bomFillPct: computeSupplierBomFillRatePercent(bomLines),
    bomWeightedFillPct: computeSupplierBomWeightedFillRatePercent(bomLines),
    purchaseOrders: poRows.map((po) => ({
      id: po.id,
      supplierId: po.supplierId,
      qty: po.qty,
      status: po.status,
      lineRef: po.lineRef,
    })),
    bomLines: mappedBom,
    legalNoteRu:
      'PO bundle (stub): расчёт потребности BOM × серия; не юридический заказ поставщику.',
  };
}
