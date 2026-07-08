/**
 * Wave 10 RU: зеркало costingRub в паспорте — sync из BOM rollup (без обязательной кнопки).
 */
import type {
  Workshop2DossierPhase1,
  Workshop2PassportCostingRubMirror,
} from '@/lib/production/workshop2-dossier-phase1.types';
import { computeWorkshop2BomCostingRollup } from '@/lib/production/workshop2-bom-costing';
import { shouldShowWorkshop2RubInUi } from '@/lib/production/workshop2-rub-currency';

export type Workshop2CostingRubMirror = Workshop2PassportCostingRubMirror;

export function resolveWorkshop2CostingRubFromDossier(
  dossier: Workshop2DossierPhase1
): Workshop2CostingRubMirror | null {
  const snap = dossier.bomCostingSnapshot;
  const pb = dossier.passportProductionBrief;
  if (snap?.estimatedFob != null && snap.estimatedFob > 0) {
    return {
      estimatedFobRub: snap.estimatedFob,
      materialsRub: snap.materialsTotal,
      trimsRub: snap.trimsTotal,
      operationsRub: snap.operationsTotal,
      syncedAt: snap.computedAt,
      source: 'bom_rollup',
    };
  }
  if (pb?.costingRub?.estimatedFobRub != null) {
    return pb.costingRub;
  }
  if (pb?.targetFob != null && pb.targetFob > 0) {
    return {
      estimatedFobRub: pb.targetFob,
      materialsRub: 0,
      trimsRub: 0,
      operationsRub: 0,
      syncedAt: new Date().toISOString(),
      source: 'passport_target_fob',
    };
  }
  return null;
}

/** Обновляет passportProductionBrief.costingRub из rollup (вызывать при persist досье). */
export function syncWorkshop2CostingRubMirrorOnDossier(
  dossier: Workshop2DossierPhase1,
  env: Record<string, string | undefined> = process.env
): Workshop2DossierPhase1 {
  if (!shouldShowWorkshop2RubInUi(env)) return dossier;
  const rollup = computeWorkshop2BomCostingRollup(dossier);
  const mirror: Workshop2CostingRubMirror = {
    estimatedFobRub: rollup.estimatedFob,
    materialsRub: rollup.materialsTotal,
    trimsRub: rollup.trimsTotal,
    operationsRub: rollup.operationsTotal,
    syncedAt: new Date().toISOString(),
    source: 'bom_rollup',
  };
  return {
    ...dossier,
    passportProductionBrief: {
      ...dossier.passportProductionBrief,
      costingRub: mirror,
      targetFob:
        dossier.passportProductionBrief?.targetFob ??
        (rollup.estimatedFob > 0 ? rollup.estimatedFob : undefined),
    },
  };
}
