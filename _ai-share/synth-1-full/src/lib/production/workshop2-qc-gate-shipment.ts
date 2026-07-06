import type { BrandProductionQcGateRow } from '@/lib/brand-production/qc-gate';

export type Workshop2QcInspectionRecord = {
  id: string;
  orderId: string;
  poId?: string;
  collectionId?: string;
  articleId?: string;
  result: 'pass' | 'fail' | 'rework' | 'pending';
  blocksShipment: boolean;
  inspectorLabel?: string;
  inspectedAt: string;
};

export function workshop2QcInspectionBlocksShipment(
  inspection: Pick<Workshop2QcInspectionRecord, 'blocksShipment' | 'result'>
): boolean {
  if (!inspection.blocksShipment) return false;
  return inspection.result !== 'pass';
}

export function workshop2QcGateBlocksOrderShipment(
  inspections: readonly Pick<Workshop2QcInspectionRecord, 'blocksShipment' | 'result'>[]
): boolean {
  return inspections.some(workshop2QcInspectionBlocksShipment);
}

/** QC gate блокирует handoff — та же семантика, что блок отгрузки до pass. */
export function workshop2QcGateBlocksHandoff(
  inspections: readonly Pick<Workshop2QcInspectionRecord, 'blocksShipment' | 'result'>[]
): boolean {
  return workshop2QcGateBlocksOrderShipment(inspections);
}

export function workshop2QcInspectionToBrandRow(
  row: Workshop2QcInspectionRecord
): BrandProductionQcGateRow {
  return {
    id: row.id,
    poId: row.poId ?? row.orderId,
    articleId: row.articleId,
    result: row.result,
    blocksShipment: workshop2QcInspectionBlocksShipment(row),
    inspectorLabel: row.inspectorLabel ?? 'PG inspector',
    inspectedAt: row.inspectedAt,
  };
}
