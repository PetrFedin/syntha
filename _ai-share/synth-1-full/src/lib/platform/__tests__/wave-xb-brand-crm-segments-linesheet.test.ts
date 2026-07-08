import {
  buildBrandCoCrmLinesheetVisibilityRows,
  summarizeBrandCoCrmLinesheetVisibility,
} from '@/lib/b2b/brand-co-crm-linesheet-visibility';
import type { BrandCrmSegmentObject } from '@/lib/b2b/brand-crm-segment-object';
import {
  BRAND_CO_CRM_LINESHEET_BRAND_SHOWROOM_RU,
  BRAND_CO_CRM_LINESHEET_CRM_SEGMENTS_RU,
  BRAND_CO_CRM_LINESHEET_PG_SOURCE_RU,
  BRAND_CO_CRM_LINESHEET_SHOP_SHOWROOM_RU,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_API,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SEGMENTS_LINK_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_LINK_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_PEER_LINK_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOWROOM_LINK_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_STRIP_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SUMMARY_RU,
  brandCoCrmLinesheetSegmentLinkTestId,
  brandCoCrmLinesheetSegmentShopLinkTestId,
  brandCoCrmLinesheetShopShowroomHref,
  brandCoCrmLinesheetVisibilityMessageRu,
  filterBrandCoCrmAutoVisibleRows,
} from '@/lib/b2b/brand-co-crm-wave-xb';
import {
  buildBrandCoOtbReplenishmentBuyerRow,
  brandCoOtbReplenishmentSyncRulesHref,
  evaluateBrandCoOtbReplenishmentSync,
} from '@/lib/b2b/brand-co-otb-replenishment-sync';

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
  {
    id: 'seg-gated',
    segmentKey: 'gated',
    nameRu: 'Без tier',
    query: { tags: ['trial'] },
    defaultPriceTier: '',
    defaultNetTermDays: 14,
    vatExempt: false,
    displayOrder: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('wave XB — brand CO CRM segments → linesheet visibility PG wire', () => {
  it('API path + strip testids (extend wave VR/UC)', () => {
    expect(BRAND_CO_CRM_LINESHEET_VISIBILITY_API).toBe('/api/brand/b2b/crm/linesheet-visibility');
    expect(BRAND_CO_CRM_LINESHEET_VISIBILITY_STRIP_TESTID).toContain('linesheet-visibility');
    expect(BRAND_CO_CRM_LINESHEET_VISIBILITY_SEGMENTS_LINK_TESTID).toContain('segments-link');
    expect(BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOWROOM_LINK_TESTID).toContain('showroom-link');
    expect(BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_LINK_TESTID).toContain('shop-showroom');
    expect(BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_PEER_LINK_TESTID).toContain(
      'shop-showroom'
    );
    expect(brandCoCrmLinesheetSegmentLinkTestId('retail')).toContain('retail');
    expect(brandCoCrmLinesheetSegmentShopLinkTestId('retail')).toContain('shop-link');
  });

  it('RU strip labels', () => {
    expect(BRAND_CO_CRM_LINESHEET_VISIBILITY_SUMMARY_RU).toBe('Авто linesheet');
    expect(BRAND_CO_CRM_LINESHEET_PG_SOURCE_RU).toBe('PG buyer_segments');
    expect(BRAND_CO_CRM_LINESHEET_SHOP_SHOWROOM_RU).toBe('Шоурум магазина');
    expect(BRAND_CO_CRM_LINESHEET_BRAND_SHOWROOM_RU).toBe('Шоурум бренда');
    expect(BRAND_CO_CRM_LINESHEET_CRM_SEGMENTS_RU).toBe('Сегменты CRM');
  });

  it('PG buyer_segments → auto linesheet visibility filter', () => {
    const rows = buildBrandCoCrmLinesheetVisibilityRows({
      segments: SEGMENTS,
      collectionId: 'SS27',
    });
    expect(rows[0]?.autoVisible).toBe(true);
    expect(rows[1]?.autoVisible).toBe(false);
    expect(summarizeBrandCoCrmLinesheetVisibility(rows).autoVisible).toBe(1);
    expect(summarizeBrandCoCrmLinesheetVisibility(rows).gated).toBe(1);
    expect(filterBrandCoCrmAutoVisibleRows(rows)).toHaveLength(1);
    expect(filterBrandCoCrmAutoVisibleRows(rows)[0]?.segmentKey).toBe('retail');
  });

  it('shop showroom cross-link per auto-visible segment', () => {
    const rows = buildBrandCoCrmLinesheetVisibilityRows({
      segments: SEGMENTS,
      collectionId: 'SS27',
    });
    const retail = rows.find((row) => row.segmentKey === 'retail');
    expect(retail?.shopShowroomHref).toContain('/shop/b2b/showroom');
    expect(retail?.shopShowroomHref).toContain('focus=retail');
    expect(retail?.shopShowroomHref).toContain('collection=SS27');
    expect(
      brandCoCrmLinesheetShopShowroomHref({ collectionId: 'SS27', segmentKey: 'wholesale' })
    ).toContain('focus=wholesale');
  });

  it('PG messageRu helper', () => {
    expect(
      brandCoCrmLinesheetVisibilityMessageRu({
        autoVisible: 3,
        total: 4,
        storageMode: 'pg',
      })
    ).toContain('PG');
    expect(
      brandCoCrmLinesheetVisibilityMessageRu({
        autoVisible: 1,
        total: 2,
        storageMode: 'memory',
      })
    ).toContain('memory');
  });

  it('OTB replenishment rules cross-link carry (wave VR/UC)', () => {
    expect(brandCoOtbReplenishmentSyncRulesHref('SS27')).toContain('rules');
    expect('/api/brand/b2b/otb/replenishment-sync').toContain('replenishment-sync');
    const row = buildBrandCoOtbReplenishmentBuyerRow({
      buyerId: 'shop1',
      collectionId: 'SS27',
      mix: [
        { category: 'Knit', targetPct: 20, currentPct: 40, gap: 20, skuCount: 3, source: 'pg' },
      ],
      activePresetId: 'fashion-eos',
    });
    expect(row.syncStatus).toBe('aligned');
    expect(evaluateBrandCoOtbReplenishmentSync({ mix: [], activePresetId: null }).syncStatus).toBe(
      'pending'
    );
  });
});
