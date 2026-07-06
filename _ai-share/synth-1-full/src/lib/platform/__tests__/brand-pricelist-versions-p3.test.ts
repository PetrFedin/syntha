import {
  buildBrandPricelistVersionDiffFields,
  buildBrandPricelistVersionSeedRows,
  filterBrandPricelistVersions,
  pickDefaultBrandPricelistVersionDiffPair,
  summarizeBrandPricelistVersionRows,
} from '@/lib/b2b/brand-pricelist-versions-feed';
import {
  clearBrandPricelistVersionsMemoryForTests,
  listBrandPricelistVersionsServer,
  patchBrandPricelistVersionServer,
  refreshBrandPricelistVersionsServer,
  seedBrandPricelistVersionMemoryForTests,
} from '@/lib/server/brand-pricelist-versions-repository';

describe('brand-pricelist-versions-feed', () => {
  it('builds seed rows for collection', () => {
    const rows = buildBrandPricelistVersionSeedRows('SS27');
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows[0]?.collectionId).toBe('SS27');
  });

  it('filters by customer group when set', () => {
    const rows = buildBrandPricelistVersionSeedRows('SS27').map((row, index) =>
      index === 0 ? { ...row, customerGroupIds: ['vip'] as const } : row
    );
    expect(filterBrandPricelistVersions(rows, 'vip')).toHaveLength(1);
  });

  it('builds version diff fields for multiplier delta', () => {
    const rows = buildBrandPricelistVersionSeedRows('SS27');
    const pair = pickDefaultBrandPricelistVersionDiffPair(rows);
    expect(pair).not.toBeNull();
    const base = rows.find((row) => row.id === pair!.baseId)!;
    const target = rows.find((row) => row.id === pair!.targetId)!;
    const fields = buildBrandPricelistVersionDiffFields(base, target);
    expect(fields.length).toBeGreaterThan(3);
  });
});

describe('brand-pricelist-versions-repository', () => {
  beforeEach(() => {
    clearBrandPricelistVersionsMemoryForTests();
  });

  it('seeds and lists pricelist version rows', async () => {
    const seed = buildBrandPricelistVersionSeedRows('SS27')[0]!;
    seedBrandPricelistVersionMemoryForTests('SS27', { ...seed, source: 'pg' });

    const listed = await listBrandPricelistVersionsServer({
      collectionId: 'SS27',
      seedIfEmpty: false,
    });
    expect(listed.rows.length).toBeGreaterThan(0);
    expect(listed.storageMode).not.toBe('demo');
    expect(summarizeBrandPricelistVersionRows(listed.rows).total).toBeGreaterThan(0);
  });

  it('patches multiplier for pricelist row', async () => {
    clearBrandPricelistVersionsMemoryForTests();
    const seed = buildBrandPricelistVersionSeedRows('SS27')[0]!;
    seedBrandPricelistVersionMemoryForTests('SS27', { ...seed, source: 'pg' });

    const patched = await patchBrandPricelistVersionServer({
      collectionId: 'SS27',
      id: seed.id,
      multiplier: 0.88,
    });
    expect(patched.row?.multiplier).toBe(0.88);
  });

  it('refresh persists seed slice', async () => {
    clearBrandPricelistVersionsMemoryForTests();
    const refreshed = await refreshBrandPricelistVersionsServer({ collectionId: 'SS27' });
    expect(refreshed.rows.length).toBeGreaterThan(0);
  });
});
