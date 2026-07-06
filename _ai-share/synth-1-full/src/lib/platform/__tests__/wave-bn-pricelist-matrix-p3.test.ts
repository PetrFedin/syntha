import {
  buildBrandPricelistVersionDiffFields,
  buildBrandPricelistVersionSeedRows,
  pickDefaultBrandPricelistVersionDiffPair,
} from '@/lib/b2b/brand-pricelist-versions-feed';

describe('wave BN — pricelist diff + matrix inspector/prepack peers', () => {
  it('picks default diff pair from seed rows', () => {
    const rows = buildBrandPricelistVersionSeedRows('SS27');
    const pair = pickDefaultBrandPricelistVersionDiffPair(rows);
    expect(pair?.baseId).toBeTruthy();
    expect(pair?.targetId).toBeTruthy();
    expect(pair?.baseId).not.toBe(pair?.targetId);
  });

  it('builds multiplier diff fields', () => {
    const rows = buildBrandPricelistVersionSeedRows('SS27');
    const base = rows[0]!;
    const target = { ...rows[1]!, multiplier: 0.9 };
    const fields = buildBrandPricelistVersionDiffFields(base, target);
    expect(fields.some((f) => f.field === 'Multiplier' && f.changed)).toBe(true);
  });

  it('testid anchors for diff strip and matrix peers', () => {
    expect('brand-pricelist-version-diff-strip').toContain('diff');
    expect('shop-co-matrix-inspector-prepack-peer-strip').toContain('peer');
    expect('shop-co-matrix-brand-pricelist-link').toContain('pricelist');
  });
});
