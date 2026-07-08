import {
  buildBrandMaterialPassportRollupRows,
  extractDossierCompositionText,
  mergeBrandMaterialPassportRollupRows,
  summarizeBrandMaterialPassportRollup,
} from '@/lib/fashion/brand-material-passport-rollup';
import {
  clearBrandMaterialPassportRollupMemoryForTests,
  listBrandMaterialPassportRollupServer,
  refreshBrandMaterialPassportRollupServer,
  seedBrandMaterialPassportRollupMemoryForTests,
} from '@/lib/server/brand-material-passport-rollup-repository';
import { products } from '@/lib/products';

describe('brand-material-passport-rollup merge', () => {
  it('overlays dossier composition on catalog rows by slug', () => {
    const catalog = buildBrandMaterialPassportRollupRows(products.slice(0, 3));
    const slug = catalog[0]!.slug;
    const merged = mergeBrandMaterialPassportRollupRows(
      catalog,
      new Map([[slug, '95% cotton, 5% elastane']]),
      new Map()
    );
    expect(merged[0]?.compositionText).toContain('95% cotton');
    expect(merged[0]?.source).toBe('dossier');
    expect(summarizeBrandMaterialPassportRollup(merged).dossierSourced).toBe(1);
  });

  it('prefers persisted PG row over dossier', () => {
    const catalog = buildBrandMaterialPassportRollupRows(products.slice(0, 2));
    const sku = catalog[0]!.sku;
    const merged = mergeBrandMaterialPassportRollupRows(
      catalog,
      new Map([[catalog[0]!.slug, 'from dossier']]),
      new Map([
        [
          sku,
          {
            ...catalog[0]!,
            compositionText: 'from pg',
            source: 'pg',
            persisted: true,
          },
        ],
      ])
    );
    expect(merged[0]?.compositionText).toBe('from pg');
    expect(merged[0]?.source).toBe('pg');
  });

  it('extracts composition from dossier assignments', () => {
    const text = extractDossierCompositionText({
      assignments: [
        {
          attributeId: 'composition',
          values: [{ text: '80% wool' }],
        },
      ],
    });
    expect(text).toBe('80% wool');
  });
});

describe('brand-material-passport-rollup-repository', () => {
  beforeEach(() => {
    clearBrandMaterialPassportRollupMemoryForTests();
  });

  it('seeds and lists rollup rows from catalog', async () => {
    const catalog = buildBrandMaterialPassportRollupRows(products.slice(0, 4));
    seedBrandMaterialPassportRollupMemoryForTests('SS27', {
      ...catalog[0]!,
      compositionText: 'persisted composition',
      source: 'pg',
      persisted: true,
    });

    const listed = await listBrandMaterialPassportRollupServer({
      collectionId: 'SS27',
      limit: 12,
      seedIfEmpty: false,
    });
    expect(listed.rows.length).toBeGreaterThan(0);
    expect(listed.storageMode).not.toBe('demo');
    expect(listed.summary.total).toBeGreaterThan(0);
  });

  it('refresh persists merged catalog slice', async () => {
    clearBrandMaterialPassportRollupMemoryForTests();
    const refreshed = await refreshBrandMaterialPassportRollupServer({
      collectionId: 'SS27',
      limit: 8,
    });
    expect(refreshed.rows.length).toBeGreaterThan(0);
    expect(refreshed.summary.withComposition).toBeGreaterThanOrEqual(0);
  });
});
