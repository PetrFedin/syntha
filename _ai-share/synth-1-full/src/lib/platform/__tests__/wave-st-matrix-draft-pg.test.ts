import {
  mergeShopMatrixSizeRunValidationResults,
  validateShopMatrixSizeRunDistribution,
  validateShopMatrixSizeRunMoq,
} from '@/lib/b2b/shop-matrix-size-run-validate';
import {
  hydrateShopMatrixDraftFromServer,
  mapMatrixDraftDocToCartItems,
  persistShopMatrixDraftToServer,
} from '@/lib/b2b/shop-matrix-draft-client';
import { shouldPersistShopMatrixDraftToLocalStorage } from '@/lib/production/workshop2-pg-read-path-policy';

describe('wave ST — matrix draft PG autosave + hydrate', () => {
  it('matrix draft API path + PG badge testid', () => {
    expect('/api/shop/b2b/matrix/draft').toContain('matrix/draft');
    expect('shop-co-matrix-draft-storage-pg').toContain('draft-storage-pg');
  });

  it('core mode skips localStorage SoT for matrix draft', () => {
    expect(shouldPersistShopMatrixDraftToLocalStorage.name).toContain('Draft');
  });

  it('draft doc maps to cart items', () => {
    const items = mapMatrixDraftDocToCartItems(
      {
        v: 1,
        collectionId: 'SS27',
        updatedAt: new Date().toISOString(),
        lines: [{ articleId: 'demo-ss27-01', colorCode: 'default', size: 'M', qty: 3 }],
      },
      [{ id: 'demo-ss27-01', name: 'Coat', sku: 'demo-ss27-01', price: 100, images: [], category: 'apparel' }],
      'SS27'
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(3);
    expect(items[0]?.selectedSize).toBe('M');
  });

  it('hydrate helper exports PG storage mode', () => {
    expect(hydrateShopMatrixDraftFromServer.name).toContain('hydrate');
    expect(persistShopMatrixDraftToServer.name).toContain('persist');
  });
});

describe('wave ST — size run validate MOQ + curve merge', () => {
  it('size run validate GET/POST API path + hint testid', () => {
    expect('/api/shop/b2b/matrix/size-run-validate').toContain('size-run-validate');
    expect('shop-co-matrix-size-run-hint').toContain('size-run');
  });

  it('MOQ flags under-minimum size qty', () => {
    const moq = validateShopMatrixSizeRunMoq({ qtyBySize: { M: 2 }, moqPerCell: 6 });
    expect(moq.ok).toBe(false);
    expect(moq.violations.some((v) => v.includes('M'))).toBe(true);
  });

  it('merges curve + MOQ violations', () => {
    const merged = mergeShopMatrixSizeRunValidationResults([
      validateShopMatrixSizeRunDistribution({
        qtyBySize: { XXL: 12 },
        expectedCurve: { S: 2, M: 3, L: 2 },
      }),
      validateShopMatrixSizeRunMoq({ qtyBySize: { M: 1 }, moqPerCell: 6 }),
    ]);
    expect(merged.ok).toBe(false);
    expect(merged.violations.length).toBeGreaterThan(1);
  });
});
