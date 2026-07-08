/**
 * Wave 28 #9: зеркало matchmaker + gates sample-order / handoff-commit.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

const MATCHMAKER_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export function buildWorkshop2MatchmakerMirror(
  dossier: Workshop2DossierPhase1
): NonNullable<Workshop2DossierPhase1['matchmakerMirror']> | null {
  const mm = dossier.matchmakerResult;
  if (!mm?.recommendedContractorId) return null;

  const ageMs = Date.now() - new Date(mm.syncedAt).getTime();
  const lowConfidence = typeof mm.confidence === 'number' && mm.confidence < 0.45;
  const stale = ageMs > MATCHMAKER_MAX_AGE_MS;
  const blockerHandoff = stale || lowConfidence;
  const blockerSampleOrder = !mm.recommendedContractorId;

  let hintRu: string | undefined;
  if (stale) {
    hintRu = 'Matchmaker старше 14 дней — повторите подбор перед handoff.';
  } else if (lowConfidence) {
    hintRu = `Низкая уверенность matchmaker (${Math.round((mm.confidence ?? 0) * 100)}%).`;
  }

  return {
    mirroredAt: new Date().toISOString(),
    recommendedContractorId: mm.recommendedContractorId,
    confidence: mm.confidence,
    syncedAt: mm.syncedAt,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
  };
}

export function persistWorkshop2MatchmakerMirrorToDossier(
  dossier: Workshop2DossierPhase1
): Workshop2DossierPhase1 {
  const mirror = buildWorkshop2MatchmakerMirror(dossier);
  if (!mirror) return dossier;
  return { ...dossier, matchmakerMirror: mirror };
}

export function evaluateWorkshop2MatchmakerMirrorSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const needsFactory =
    Boolean(dossier.sewingPlan?.partnerId?.trim()) ||
    Boolean(dossier.techPackFactoryHandoffs?.length);
  if (!needsFactory) return null;

  const mirror = dossier.matchmakerMirror;
  if (!mirror) {
    return {
      id: 'matchmaker.mirror_missing',
      severity: 'warning',
      messageRu: 'Matchmaker не в PG — сохраните подбор и «Matchmaker → PG» на снабжении.',
    };
  }
  if (
    mirror.blockerSampleOrder === true ||
    workshop2PgMirrorStr(mirror, 'blockerSampleOrder') === 'true'
  ) {
    return {
      id: 'matchmaker.result.missing',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'Нет рекомендованного подрядчика — запустите matchmaker перед образцом.',
    };
  }
  return null;
}

export function evaluateWorkshop2MatchmakerMirrorHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.matchmakerMirror;
  if (!mirror) return null;
  if (mirror.blockerHandoff === true || workshop2PgMirrorStr(mirror, 'blockerHandoff') === 'true') {
    return {
      id: 'matchmaker.mirror_stale_or_low',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'Matchmaker в PG устарел или с низкой уверенностью — обновите перед commit.',
    };
  }
  return null;
}
