import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { SupplySnapshot } from '@/lib/production/article-workspace/types';
import {
  computeSupplyRiskPrediction,
  type SupplyRiskPrediction,
} from '@/lib/production/workshop2-operational-heuristics';

/** BOM досье → строки снабжения для эвристики рисков. */
export function dossierBomToSupplyLines(dossier: Workshop2DossierPhase1): SupplySnapshot['lines'] {
  const model = dossier.productionModel;
  if (!model?.materialLines?.length) return [];

  return model.materialLines.map((line, idx) => ({
    id: line.id ?? `mat-${idx}`,
    label: line.materialName || `Материал ${idx + 1}`,
    status: line.sourceAssignmentId ? 'ordered' : 'draft',
    qty: line.consumption,
    unit: line.unit,
    leadTimeDays: line.isPrimary ? 10 : 18,
    sourceNote: line.supplier,
  }));
}

export type Workshop2SupplyRiskSnapshot = SupplyRiskPrediction & {
  computedAt: string;
  source: 'dossier_bom';
  inputsUsed?: string[];
};

export function computeWorkshop2RiskFromDossier(
  dossier: Workshop2DossierPhase1
): Workshop2SupplyRiskSnapshot {
  const lines = dossierBomToSupplyLines(dossier);
  const prediction = computeSupplyRiskPrediction(lines);
  return {
    ...prediction,
    computedAt: new Date().toISOString(),
    source: 'dossier_bom',
  };
}
