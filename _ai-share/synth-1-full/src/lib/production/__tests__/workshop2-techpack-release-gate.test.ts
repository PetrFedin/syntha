/**
 * @jest-environment node
 */
import { getHandbookCategoryLeaves } from '@/lib/production/category-handbook-leaves';
import { assessWorkshop2TechPackReleaseGate } from '@/lib/production/workshop2-techpack-release-gate';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

function emptyDossier(): Workshop2DossierPhase1 {
  return { schemaVersion: 1, assignments: [] };
}

function exportCtx() {
  const leaf = getHandbookCategoryLeaves()[0]!;
  return {
    articleSku: 'SKU-1',
    articleName: 'Test',
    pathLabel: 'L1 / L2',
    l2Name: leaf.l2Name,
    tzPhase: '1' as const,
    categoryLeafId: leaf.leafId,
    measurementsLeaf: leaf,
    preflightOk: false,
    preflightIssueCount: 1,
    sectionSignoffsFull: 0,
    gateLifecycleState: 'draft',
    exportLanguage: 'ru_en' as const,
  };
}

describe('workshop2-techpack-release-gate', () => {
  it('blocks when sheets incomplete and no qty bridge', () => {
    const gate = assessWorkshop2TechPackReleaseGate({
      dossier: emptyDossier(),
      ctx: exportCtx(),
    });
    expect(gate.ready).toBe(false);
    expect(gate.blockersRu.some((b) => b.includes('Qty color×size'))).toBe(true);
  });

  it('passes when all sheets ready and qty bridged', () => {
    const dossier: Workshop2DossierPhase1 = {
      ...emptyDossier(),
      assignments: [
        {
          kind: 'canonical',
          attributeId: 'sampleBaseSize',
          values: [
            {
              valueSource: 'handbook_parameter',
              parameterId: 'size_m',
              displayLabel: 'M',
            },
          ],
        },
        {
          kind: 'canonical',
          attributeId: 'color',
          values: [{ valueSource: 'free_text', text: 'Navy' }],
        },
      ],
      sampleBasePerSizePieceQty: { size_m: 10 },
      sketchSheets: [
        {
          sheetId: 'f1',
          viewKind: 'front',
          annotations: [
            { annotationId: 'a1', categoryLeafId: 'x', xPct: 1, yPct: 1, text: 'collar' },
          ],
        },
        { sheetId: 'b1', viewKind: 'back', annotations: [] },
      ],
      compositionLabelSpec: { labelWidthMm: '40', labelHeightMm: '20' },
    };
    const gate = assessWorkshop2TechPackReleaseGate({
      dossier,
      ctx: exportCtx(),
      exportOptions: {
        qtyByColorSize: [{ colorLabel: 'Navy', sizeLabel: 'M', qty: 10 }],
        qtyBridgeNote: 'test',
      },
    });
    expect(gate.qtyBridged).toBe(true);
    expect(gate.sheetsReady).toBeGreaterThan(0);
  });
});
