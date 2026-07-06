import {
  buildBrandCoOtbReplenishmentBuyerRow,
  brandCoOtbReplenishmentSyncRulesHref,
  evaluateBrandCoOtbReplenishmentSync,
  summarizeBrandCoOtbReplenishmentSync,
} from '@/lib/b2b/brand-co-otb-replenishment-sync';
import {
  buildBrandCoCrmLinesheetVisibilityRows,
  summarizeBrandCoCrmLinesheetVisibility,
} from '@/lib/b2b/brand-co-crm-linesheet-visibility';
import type { BrandCrmSegmentObject } from '@/lib/b2b/brand-crm-segment-object';
import {
  BRAND_PRICELIST_PUBLISH_API_PATH,
  brandPricelistPublishMessageRu,
} from '@/lib/b2b/brand-pricelist-publish';
import {
  brandWssiShopReplenishmentRulesHref,
} from '@/lib/fashion/brand-wssi-plan';

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

describe('wave VR — brand CO OTB × CRM × pricelist tier sync', () => {
  it('WSSI/OTB plan-sync stub + buyer rules href (wave XV dedup strip)', () => {
    expect('/api/brand/b2b/otb/plan-sync').toContain('plan-sync');
    expect('brand-co-otb-plan-sync-badge').toContain('plan-sync');
    expect(brandCoOtbReplenishmentSyncRulesHref('SS27')).toContain('rules');
    expect(brandWssiShopReplenishmentRulesHref('SS27', 'B2B-DEMO-SHOP1-SS27')).toContain('rules');
    expect('/api/brand/b2b/otb/replenishment-sync').toContain('replenishment-sync');
  });

  it('OTB × fashion-eos replenishment sync evaluation (wave UC carry)', () => {
    const row = buildBrandCoOtbReplenishmentBuyerRow({
      buyerId: 'shop1',
      collectionId: 'SS27',
      mix: [{ category: 'Knit', targetPct: 20, currentPct: 40, gap: 20, skuCount: 3, source: 'pg' }],
      activePresetId: 'fashion-eos',
    });
    expect(row.syncStatus).toBe('aligned');
    expect(row.rulesHref).toContain('rules');
    expect(
      summarizeBrandCoOtbReplenishmentSync([
        row,
        { ...row, buyerId: 'shop2', syncStatus: 'review' },
      ]).review
    ).toBe(1);
    expect(evaluateBrandCoOtbReplenishmentSync({ mix: [], activePresetId: null }).syncStatus).toBe(
      'pending'
    );
  });

  it('PG buyer_segments → auto linesheet visibility strip', () => {
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

  it('tier sync honesty strip on pricelist publish (wave TK verify)', () => {
    expect(BRAND_PRICELIST_PUBLISH_API_PATH).toBe('/api/brand/b2b/pricelist/publish');
    expect('brand-pricelist-tier-sync-honesty-strip').toContain('tier-sync');
    expect('brand-pricelist-tier-sync-push-link').toContain('push');
    expect('shop-landed-margin-tier-sync-honesty-strip').toContain('honesty');
    const message = brandPricelistPublishMessageRu({
      priceListName: 'Retail B −4% Q1',
      tierId: 'retail_b',
      tierSync: { ok: true, tierId: 'retail_b', shopSynced: true },
    });
    expect(message).toContain('retail_b');
  });

  it('partner count PG badge on brand CO cabinet', () => {
    expect('brand-co-cabinet-partner-count').toContain('partner-count');
    expect('brand-co-cabinet-pg-partner-badge').toContain('pg-partner');
    expect('/api/brand/retailers/b2b-orders-summary').toContain('b2b-orders-summary');
  });
});
