import { buildBrandAgentRepTerritoryHints } from '@/lib/fashion/brand-agent-rep-oversight';
import type { BrandCrmSegmentObject } from '@/lib/b2b/brand-crm-segment-object';

describe('wave BP — agent rep territory + pack/margin honesty', () => {
  it('builds territory hints from reps and CRM segments', () => {
    const segments: BrandCrmSegmentObject[] = [
      {
        id: 'seg-retail',
        segmentKey: 'retail',
        nameRu: 'Розница',
        query: { regions: ['RU-MOW', 'RU-SPB'] },
        defaultPriceTier: 'retail_a',
        defaultNetTermDays: 14,
        vatExempt: false,
        displayOrder: 0,
        updatedAt: '',
      },
    ];
    const hints = buildBrandAgentRepTerritoryHints(['Rep A'], segments, 'SS27');
    expect(hints).toHaveLength(1);
    expect(hints[0]?.regionLabel).toContain('RU-MOW');
    expect(hints[0]?.crmSegmentHref).toContain('segments');
  });

  it('testid anchors for BP strips', () => {
    expect('brand-agent-rep-territory-peer-strip').toContain('territory');
    expect('brand-pack-rules-prepack-matrix-honesty-strip').toContain('honesty');
    expect('shop-landed-margin-tier-sync-honesty-strip').toContain('tier-sync');
    expect('brand-landed-margin-tier-sync-mirror-strip').toContain('mirror');
  });
});
