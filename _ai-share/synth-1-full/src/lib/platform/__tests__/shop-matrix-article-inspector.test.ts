import { extractShopMatrixArticleInspectorView } from '@/lib/server/shop-matrix-article-inspector';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

describe('shop-matrix-article-inspector', () => {
  it('extracts read-only shop view from dossier + published meta', () => {
    const dossier = {
      passportProductionBrief: {
        articleCardOwnerName: 'Пальто SS27',
        moqTargetMaxPieces: 6,
        sewingRegionPlanNote: 'Турция · CMT',
        targetFob: 4500,
        targetRetailPrice: 12900,
      },
      productionModel: {
        version: 1 as const,
        nodes: [],
        materialLines: [
          {
            id: 'm1',
            nodeId: 'n1',
            role: 'shell' as const,
            materialName: 'Wool blend',
            compositionText: '80% wool',
            supplier: 'Supplier A',
            isPrimary: true,
          },
        ],
        trimLines: [],
        operations: [],
        measurements: [],
      },
      assignments: [
        {
          assignmentId: 'a1',
          kind: 'canonical' as const,
          attributeId: 'composition',
          values: [
            {
              valueId: 'v1',
              valueSource: 'free_text' as const,
              displayLabel: '80% wool · 20% poly',
            },
          ],
        },
      ],
    } as Workshop2DossierPhase1;

    const view = extractShopMatrixArticleInspectorView({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      dossier,
      published: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        name: 'Пальто SS27',
        wholesalePriceRub: 4500,
        moq: 6,
      },
      campaignPublished: true,
    });

    expect(view.name).toBe('Пальто SS27');
    expect(view.moq).toBe(6);
    expect(view.compositionSummary).toContain('wool');
    expect(view.fabricLines).toHaveLength(1);
    expect(view.supplierModelNote).toContain('Турция');
    expect(view.published).toBe(true);
  });
});
