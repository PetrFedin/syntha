import {
  extractShopMatrixSizeCurveFromDossier,
  normalizeShopMatrixSizeLabel,
} from '@/lib/b2b/shop-matrix-size-curve';
import {
  buildPrepackBreakdownForApply,
  readShopMatrixPrepackApplyFromSearchParams,
} from '@/lib/b2b/shop-matrix-prepack-apply';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

describe('shop-matrix-size-curve', () => {
  it('extracts curve from sampleBasePerSizeDimensions', () => {
    const dossier = {
      sampleBasePerSizeDimensions: {
        S: { chest: '90' },
        M: { chest: '94' },
        L: { chest: '98' },
      },
    } as Workshop2DossierPhase1;

    const extracted = extractShopMatrixSizeCurveFromDossier(dossier);
    expect(extracted.source).toBe('w2_sample_grid');
    expect(extracted.curve.S).toBe(1);
    expect(extracted.curve.M).toBe(1);
  });

  it('normalizes size labels', () => {
    expect(normalizeShopMatrixSizeLabel('m')).toBe('M');
  });
});

describe('shop-matrix-prepack-apply', () => {
  it('reads apply params from search params', () => {
    const sp = new URLSearchParams('prepackApply=1&prepackArticle=demo-ss27-01&prepackPacks=3');
    expect(readShopMatrixPrepackApplyFromSearchParams(sp)).toEqual({
      articleId: 'demo-ss27-01',
      packCount: 3,
    });
  });

  it('builds breakdown for apply with curve view', () => {
    const breakdown = buildPrepackBreakdownForApply({
      packCount: 2,
      curveView: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        source: 'default',
        sizes: ['S', 'M', 'L'],
        curve: { S: 1, M: 2, L: 1 },
        packSize: 4,
      },
    });
    expect(breakdown.totalUnits).toBe(8);
  });
});
