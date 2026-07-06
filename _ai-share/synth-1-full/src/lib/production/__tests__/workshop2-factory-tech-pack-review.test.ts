import {
  applyWorkshop2FactoryTechPackReview,
  findLatestWorkshop2FactoryTechPackHandoffForReview,
} from '@/lib/production/workshop2-factory-tech-pack-review';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

const baseDossier = (): Workshop2DossierPhase1 =>
  ({
    schemaVersion: 1,
    techPackFactoryHandoffs: [
      {
        handoffId: 'h1',
        createdAt: '2026-01-01T00:00:00.000Z',
        createdBy: 'brand',
        packageRevisionLabel: 'v1',
        channel: 'portal',
        status: 'sent',
        attachmentIds: [],
      },
    ],
  }) as Workshop2DossierPhase1;

describe('workshop2-factory-tech-pack-review', () => {
  it('finds latest sent handoff', () => {
    const hit = findLatestWorkshop2FactoryTechPackHandoffForReview(baseDossier());
    expect(hit?.handoffId).toBe('h1');
  });

  it('persists pin to fitComments and accept decision on handoff', () => {
    const result = applyWorkshop2FactoryTechPackReview({
      dossier: baseDossier(),
      actor: 'factory-mgr',
      pin: { xPct: 10, yPct: 20, text: 'Уточнить шов' },
      decision: 'accepted',
    });
    expect(result.dossier.fitComments).toHaveLength(1);
    expect(result.dossier.techPackFactoryHandoffs?.[0]?.status).toBe('accepted');
    expect(result.handoffId).toBe('h1');
  });
});
