/**
 * Wave 26 #61: зеркало T&A на вкладке «План» (surface plan) + gate sample-order.
 */
import type { TimeAndActionSnapshot } from '@/lib/production/article-workspace/types';
import { summarizeWorkshop2TaMilestonesStatus } from '@/lib/production/workshop2-ta-milestones-status';
import { buildWorkshop2TaPlanFactSummary } from '@/lib/production/workshop2-ta-plan-fact';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import {
  workshop2PgMirrorStr,
  workshop2PgMirrorNum,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export function buildWorkshop2PlanTaMirror(
  dossier: Workshop2DossierPhase1,
  bundleTa?: TimeAndActionSnapshot | null
): NonNullable<Workshop2DossierPhase1['planTaMirror']> {
  const planFact = buildWorkshop2TaPlanFactSummary({ dossier, bundleTa });
  const status = summarizeWorkshop2TaMilestonesStatus({
    dossier,
    bundleTa,
    surface: 'plan',
  });
  const persistedAt = dossier.taMilestonesPersistedAt;
  const blockerSampleOrder = status.state === 'empty' || status.state === 'at_risk';

  return {
    mirroredAt: new Date().toISOString(),
    milestoneCount: status.milestoneCount,
    source: status.source,
    state: status.state,
    delayedCount: status.delayedCount,
    overdueCount: status.overdueCount,
    persistedAt,
    blockerSampleOrder,
    hintRu: planFact.planFactLabelRu ?? status.hintRu,
  };
}

export function persistWorkshop2PlanTaMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  bundleTa?: TimeAndActionSnapshot | null
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    planTaMirror: buildWorkshop2PlanTaMirror(dossier, bundleTa),
  };
}

export function evaluateWorkshop2PlanTaSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.planTaMirror;
  if (!mirror) {
    return {
      id: 'plan.ta.mirror_missing',
      severity: 'warning',
      messageRu: 'T&A плана не в PG — «Plan T&A → PG» на вкладке План заказа.',
    };
  }
  const state = workshop2PgMirrorStr(mirror, 'state');
  const hintRu = workshop2PgMirrorStr(mirror, 'hintRu');
  const delayedCount = workshop2PgMirrorNum(mirror, 'delayedCount');
  const overdueCount = workshop2PgMirrorNum(mirror, 'overdueCount');
  const persistedAt = workshop2PgMirrorStr(mirror, 'persistedAt');
  const blockerSampleOrder =
    mirror.blockerSampleOrder === true ||
    workshop2PgMirrorStr(mirror, 'blockerSampleOrder') === 'true';

  if (state === 'empty') {
    return {
      id: 'plan.ta.empty',
      severity: 'warning',
      messageRu: hintRu || 'Календарь T&A пуст на плане — добавьте вехи до заказа образца.',
    };
  }
  if (blockerSampleOrder && state === 'at_risk') {
    return {
      id: 'plan.ta.at_risk',
      severity: 'warning',
      messageRu: hintRu ?? `T&A плана: ${delayedCount} задержек, ${overdueCount} просрочено.`,
    };
  }
  if (!persistedAt && !dossier.taMilestonesPersistedAt) {
    return {
      id: 'plan.ta.not_persisted',
      severity: 'warning',
      messageRu: hintRu || 'Вехи только в workspace — «Сохранить T&A в досье» на плане.',
    };
  }
  return null;
}
