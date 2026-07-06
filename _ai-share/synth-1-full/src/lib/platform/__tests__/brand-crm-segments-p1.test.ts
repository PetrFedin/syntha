import {
  sortBrandCrmSegments,
  evaluateBrandCrmSegmentQuery,
  summarizeBrandCrmSegmentQuery,
} from '@/lib/b2b/brand-crm-segment-object';
import {
  clearBrandCrmSegmentsMemoryForTests,
  listBrandCrmSegmentsServer,
  patchBrandCrmSegmentServer,
  reorderBrandCrmSegmentsServer,
} from '@/lib/server/brand-crm-segments-repository';
import { listPlatformB2bPartnersOnboarding } from '@/lib/server/platform-b2b-partners-onboarding-server';

describe('brand-crm-segments-repository', () => {
  beforeEach(() => {
    clearBrandCrmSegmentsMemoryForTests();
  });

  it('seeds default segment objects', async () => {
    const result = await listBrandCrmSegmentsServer();
    expect(result.segments.length).toBeGreaterThanOrEqual(4);
    expect(result.segments.some((s) => s.segmentKey === 'retail')).toBe(true);
    expect(['pg', 'file', 'memory', 'demo']).toContain(result.storageMode);
  });

  it('patches net terms and discount', async () => {
    const listed = await listBrandCrmSegmentsServer();
    const retail = listed.segments.find((s) => s.segmentKey === 'retail');
    expect(retail).toBeTruthy();

    const saved = await patchBrandCrmSegmentServer({
      segmentKey: 'retail',
      defaultNetTermDays: 21,
      firstOrderDiscountPct: 7,
    });
    expect(saved.segment?.defaultNetTermDays).toBe(21);
    expect(saved.segment?.firstOrderDiscountPct).toBe(7);

    const again = await listBrandCrmSegmentsServer();
    expect(again.segments.find((s) => s.segmentKey === 'retail')?.defaultNetTermDays).toBe(21);
  });

  it('reorders segments by displayOrder', async () => {
    const listed = await listBrandCrmSegmentsServer();
    const keys = listed.segments.map((segment) => segment.segmentKey);
    expect(keys.length).toBeGreaterThan(1);

    const reversed = [...keys].reverse();
    const reordered = await reorderBrandCrmSegmentsServer({ segmentKeys: reversed });
    expect(reordered.segments.map((segment) => segment.segmentKey)).toEqual(reversed);
    expect(reordered.segments[0]?.displayOrder).toBe(0);
  });
});

describe('brand-crm-segment-object', () => {
  it('sorts segments by displayOrder then key', () => {
    const sorted = sortBrandCrmSegments([
      {
        id: 'b',
        segmentKey: 'b',
        nameRu: 'B',
        query: {},
        defaultPriceTier: 'retail_b',
        defaultNetTermDays: 30,
        vatExempt: false,
        displayOrder: 2,
        updatedAt: '',
      },
      {
        id: 'a',
        segmentKey: 'a',
        nameRu: 'A',
        query: {},
        defaultPriceTier: 'retail_a',
        defaultNetTermDays: 14,
        vatExempt: false,
        displayOrder: 1,
        updatedAt: '',
      },
    ]);
    expect(sorted[0]?.segmentKey).toBe('a');
  });

  it('summarizes query chips', () => {
    const chips = summarizeBrandCrmSegmentQuery({
      minLifetimeOrderRub: 1_000_000,
      tiers: ['retail_a'],
      regions: ['RU-MOW'],
    });
    expect(chips.some((c) => c.includes('LTV'))).toBe(true);
    expect(chips.some((c) => c.startsWith('tier'))).toBe(true);
  });

  it('evaluates segment query against account', () => {
    const ok = evaluateBrandCrmSegmentQuery(
      { minLifetimeOrderRub: 500_000, tiers: ['retail_b'] },
      { lifetimeOrderRub: 600_000, tier: 'retail_b' }
    );
    expect(ok).toBe(true);
    const fail = evaluateBrandCrmSegmentQuery(
      { minLifetimeOrderRub: 500_000, tiers: ['retail_b'] },
      { lifetimeOrderRub: 100_000, tier: 'retail_a' }
    );
    expect(fail).toBe(false);
  });
});

describe('platform-b2b-partners-onboarding-server', () => {
  it('lists onboarding rows with status counts', async () => {
    const result = await listPlatformB2bPartnersOnboarding({ collectionId: 'SS27' });
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.counts.connected + result.counts.requested + result.counts.profile).toBe(
      result.rows.length
    );
    expect(['pg', 'fallback']).toContain(result.storageMode);
  });
});
