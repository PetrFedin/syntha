import type { BrandProductionState } from './types';
import { workshop2QcInspectionBlocksShipment } from '@/lib/production/workshop2-qc-gate-shipment';

export type BrandProductionQcGateRow = {
  id: string;
  poId: string;
  articleId?: string;
  result: string;
  blocksShipment: boolean;
  inspectorLabel: string;
  inspectedAt: string;
  checklistTemplateId?: string;
};

export type BrandProductionQcGateSummary = {
  plannedCount: number;
  passCount: number;
  failCount: number;
  blockedShipments: number;
  rows: BrandProductionQcGateRow[];
};

/** AQL gate summary из localStorage-модели (Inspectorio pattern). */
export function buildBrandProductionQcGateSummary(
  state: BrandProductionState
): BrandProductionQcGateSummary {
  const templateByPlan = new Map(state.qcPlans.map((p) => [p.id, p.checklistTemplateId]));
  const rows: BrandProductionQcGateRow[] = state.qcInspections.map((i) => ({
    id: i.id,
    poId: i.poId,
    articleId: i.articleId,
    result: i.result,
    blocksShipment: i.blocksShipment,
    inspectorLabel: i.inspectorLabel,
    inspectedAt: i.inspectedAt,
    checklistTemplateId: templateByPlan.get(i.planId),
  }));

  return {
    plannedCount: state.qcPlans.filter((p) => p.status === 'planned').length,
    passCount: rows.filter((r) => r.result === 'pass').length,
    failCount: rows.filter((r) => r.result === 'fail' || r.result === 'rework').length,
    blockedShipments: rows.filter((r) => r.blocksShipment).length,
    rows,
  };
}

/** Число инспекций, блокирующих handoff (fail/rework + blocksShipment). */
export function brandProductionQcBlocksHandoffCount(state: BrandProductionState): number {
  return state.qcInspections.filter((i) =>
    workshop2QcInspectionBlocksShipment({
      blocksShipment: i.blocksShipment,
      result: i.result as 'pass' | 'fail' | 'rework' | 'pending',
    })
  ).length;
}
