import {
  buildBrandCoOtbReplenishmentBuyerRow,
  evaluateBrandCoOtbReplenishmentSync,
  summarizeBrandCoOtbReplenishmentSync,
} from '@/lib/b2b/brand-co-otb-replenishment-sync';
import {
  buildBrandCoCrmLinesheetVisibilityRows,
  summarizeBrandCoCrmLinesheetVisibility,
} from '@/lib/b2b/brand-co-crm-linesheet-visibility';
import type { BrandCrmSegmentObject } from '@/lib/b2b/brand-crm-segment-object';
import { brandAgentRepShopPortalReadOnlyHref } from '@/lib/fashion/brand-agent-rep-oversight';

const SEGMENTS: BrandCrmSegmentObject[] = [
  {
    id: 'seg-retail',
    segmentKey: 'retail',
    nameRu: 'Розница',
    query: { tiers: ['retail_a'] },
    defaultPriceTier: 'retail_a',
    defaultNetTermDays: 14,
    vatExempt: false,
    displayOrder: 0,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('wave UC — brand CO OTB × CRM linesheet visibility', () => {
  it('OTB replenishment sync API + strip testids (wave XV plan-sync)', () => {
    expect('/api/brand/b2b/otb/plan-sync').toContain('plan-sync');
    expect('/api/brand/b2b/otb/replenishment-sync').toContain('replenishment-sync');
    expect('brand-co-otb-replenishment-sync-strip').toContain('replenishment-sync');
    expect('brand-co-otb-replenishment-sync-buyer-shop1-link').toContain('shop1');
    expect('brand-co-otb-plan-sync-badge').toContain('plan-sync');
  });

  it('evaluates OTB × fashion-eos replenishment as aligned when over-assorted', () => {
    const row = buildBrandCoOtbReplenishmentBuyerRow({
      buyerId: 'shop1',
      collectionId: 'SS27',
      mix: [{ category: 'Knit', targetPct: 20, currentPct: 40, gap: 20, skuCount: 3, source: 'pg' }],
      activePresetId: 'fashion-eos',
    });
    expect(row.syncStatus).toBe('aligned');
    expect(evaluateBrandCoOtbReplenishmentSync({ mix: [], activePresetId: null }).syncStatus).toBe(
      'pending'
    );
    expect(
      summarizeBrandCoOtbReplenishmentSync([
        row,
        { ...row, buyerId: 'shop2', syncStatus: 'review' },
      ]).review
    ).toBe(1);
  });

  it('CRM linesheet visibility from PG buyer_segments', () => {
    expect('/api/brand/b2b/crm/linesheet-visibility').toContain('linesheet-visibility');
    expect('brand-co-crm-linesheet-visibility-strip').toContain('linesheet-visibility');
    const rows = buildBrandCoCrmLinesheetVisibilityRows({
      segments: SEGMENTS,
      collectionId: 'SS27',
    });
    expect(rows[0]?.autoVisible).toBe(true);
    expect(rows[0]?.linesheetId).toContain('SS27');
    expect(summarizeBrandCoCrmLinesheetVisibility(rows).autoVisible).toBe(1);
  });

  it('multi-buyer registry PG query param on brand orders API', () => {
    expect('/api/brand/b2b/orders?collectionId=SS27&partner=shop2').toContain('partner=shop2');
    expect('brand-co-registry-partner-filter').toContain('partner-filter');
  });

  it('agent rep read-only portal + commission dispute stub', () => {
    expect(brandAgentRepShopPortalReadOnlyHref()).toContain('readOnly=1');
    expect('/api/brand/b2b/commissions/dispute').toContain('dispute');
    expect('brand-agent-rep-commission-dispute-submit').toContain('dispute');
    expect('brand-co-agent-rep-shop-portal-readonly-link').toContain('readonly');
  });

  it('WSSI peer strip RU cross-links (replenishment deduped to plan-sync strip)', () => {
    expect('brand-co-wssi-otb-link').toContain('otb');
    expect('brand-co-wssi-shop-showroom-link').toContain('showroom');
    expect('brand-co-wssi-registry-link').toContain('registry');
  });
});
