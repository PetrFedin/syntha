import type {
  Workshop2DossierPhase1,
  Workshop2FitCommentLogEntry,
  Workshop2TechPackFactoryHandoff,
} from '@/lib/production/workshop2-dossier-phase1.types';

export type Workshop2FactoryTechPackReviewDecision = 'accepted' | 'rejected';

export type Workshop2FactoryTechPackReviewPin = {
  xPct: number;
  yPct: number;
  text: string;
};

export function findLatestWorkshop2FactoryTechPackHandoffForReview(
  dossier: Workshop2DossierPhase1
): Workshop2TechPackFactoryHandoff | null {
  const handoffs = dossier.techPackFactoryHandoffs ?? [];
  if (handoffs.length === 0) return null;
  const open = [...handoffs]
    .reverse()
    .find((h) => h.status === 'sent' || h.status === 'acknowledged' || h.status === 'draft');
  return open ?? handoffs[handoffs.length - 1] ?? null;
}

export function applyWorkshop2FactoryTechPackReview(input: {
  dossier: Workshop2DossierPhase1;
  actor: string;
  decision?: Workshop2FactoryTechPackReviewDecision;
  comment?: string;
  pin?: Workshop2FactoryTechPackReviewPin;
}): { dossier: Workshop2DossierPhase1; handoffId?: string; pinId?: string } {
  const at = new Date().toISOString();
  let dossier = input.dossier;
  let handoffId: string | undefined;
  let pinId: string | undefined;

  if (input.pin?.text.trim()) {
    pinId = `factory-pin-${Date.now().toString(36)}`;
    const entry: Workshop2FitCommentLogEntry = {
      commentId: pinId,
      text: input.pin.text.trim(),
      author: input.actor.slice(0, 120),
      at,
      pin: {
        xPct: Math.max(0, Math.min(100, input.pin.xPct)),
        yPct: Math.max(0, Math.min(100, input.pin.yPct)),
      },
    };
    dossier = {
      ...dossier,
      fitComments: [...(dossier.fitComments ?? []), entry],
    };
  }

  if (input.decision) {
    const handoffs = dossier.techPackFactoryHandoffs ?? [];
    const target = findLatestWorkshop2FactoryTechPackHandoffForReview(dossier);
    if (target) {
      const idx = handoffs.findIndex((h) => h.handoffId === target.handoffId);
      if (idx >= 0) {
        const prev = handoffs[idx]!;
        const updated: Workshop2TechPackFactoryHandoff = {
          ...prev,
          status: input.decision,
          factoryResponseAt: at,
          factoryResponseBy: input.actor.slice(0, 120),
          factoryComment: input.comment?.trim() || prev.factoryComment,
        };
        const nextHandoffs = handoffs.map((h, i) => (i === idx ? updated : h));
        dossier = { ...dossier, techPackFactoryHandoffs: nextHandoffs };
        handoffId = updated.handoffId;
      }
    }
  }

  return { dossier, handoffId, pinId };
}
