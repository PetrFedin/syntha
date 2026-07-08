/**
 * Wave 24 #51: зеркало T&A milestones + gate sample-order.
 */
import { resolveWorkshop2TaMilestones } from '@/lib/production/workshop2-ta-milestones-status';
import type { TimeAndActionSnapshot } from '@/lib/production/article-workspace/types';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export function buildWorkshop2TaMilestonesMirror(
  dossier: Workshop2DossierPhase1,
  bundleTa?: TimeAndActionSnapshot | null
): NonNullable<Workshop2DossierPhase1['taMilestonesMirror']> {
  const resolved = resolveWorkshop2TaMilestones({ dossier, bundleTa });
  const milestoneCount = resolved.milestones.length;
  const persistedAt = dossier.taMilestonesPersistedAt;
  const blockerSampleOrder = milestoneCount === 0;

  let hintRu: string | undefined;
  if (blockerSampleOrder) {
    hintRu = 'Нет milestones T&A в досье — сохраните календарь на плане или снабжении.';
  } else if (!persistedAt) {
    hintRu = 'Milestones есть, но не зафиксированы в PG — нажмите «T&A → PG».';
  }

  return {
    mirroredAt: new Date().toISOString(),
    milestoneCount,
    source: resolved.source,
    persistedAt,
    blockerSampleOrder,
    hintRu,
  };
}

export function persistWorkshop2TaMilestonesMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  bundleTa?: TimeAndActionSnapshot | null
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    taMilestonesMirror: buildWorkshop2TaMilestonesMirror(dossier, bundleTa),
  };
}

export function evaluateWorkshop2TaMilestonesSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.taMilestonesMirror;
  if (!mirror) {
    const resolved = resolveWorkshop2TaMilestones({ dossier });
    if (resolved.milestones.length === 0) {
      return {
        id: 'ta.milestones.empty',
        severity: 'warning',
        messageRu: 'Календарь T&A пуст — рекомендуется заполнить до заказа образца.',
      };
    }
    return {
      id: 'ta.milestones.mirror_missing',
      severity: 'warning',
      messageRu: 'T&A snapshot не в PG — «T&A → PG» на плане или снабжении.',
    };
  }
  if (
    mirror.blockerSampleOrder === true ||
    workshop2PgMirrorStr(mirror, 'blockerSampleOrder') === 'true'
  ) {
    return {
      id: 'ta.milestones.empty',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') || 'Нет milestones T&A — заполните календарь плана.',
    };
  }
  const persistedAt =
    workshop2PgMirrorStr(mirror, 'persistedAt') || dossier.taMilestonesPersistedAt;
  if (!persistedAt) {
    return {
      id: 'ta.milestones.not_persisted',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'T&A не сохранён в PG — нажмите «Сохранить T&A в досье».',
    };
  }
  return null;
}
