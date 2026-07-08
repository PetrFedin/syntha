import {
  buildBrandCoOtbReplenishmentBuyerRow,
  evaluateBrandCoOtbReplenishmentSync,
  summarizeBrandCoOtbReplenishmentSync,
} from '@/lib/b2b/brand-co-otb-replenishment-sync';
import {
  BRAND_CO_OTB_PLAN_SYNC_API,
  BRAND_CO_OTB_PLAN_SYNC_RU,
  BRAND_CO_OTB_REPLENISHMENT_SYNC_STRIP_TESTID,
  BRAND_CO_OTB_REPLENISHMENT_SYNC_SUMMARY_RU,
  BRAND_CO_OTB_SYNC_STATUS_RU,
  brandCoOtbPlanSyncMessageRu,
  brandCoOtbReplenishmentSyncBuyerLinkTestId,
} from '@/lib/b2b/brand-co-otb-wave-xv';

describe('wave XV — brand CO OTB plan sync × shop replenishment rules', () => {
  it('plan-sync API path + deduped strip testids (no WG/WL/UC cross-link dupes)', () => {
    expect(BRAND_CO_OTB_PLAN_SYNC_API).toBe('/api/brand/b2b/otb/plan-sync');
    expect(BRAND_CO_OTB_REPLENISHMENT_SYNC_STRIP_TESTID).toContain('replenishment-sync');
    expect(brandCoOtbReplenishmentSyncBuyerLinkTestId('shop1')).toContain('shop1');
    expect('brand-co-otb-plan-sync-badge').toContain('plan-sync');
    expect('brand-co-otb-plan-sync-message').toContain('plan-sync');
  });

  it('RU strip labels', () => {
    expect(BRAND_CO_OTB_REPLENISHMENT_SYNC_SUMMARY_RU).toBe('OTB × пополнение');
    expect(BRAND_CO_OTB_PLAN_SYNC_RU).toBe('Синхрон плана OTB');
    expect(BRAND_CO_OTB_SYNC_STATUS_RU.pending).toBe('Нет правил');
    expect(BRAND_CO_OTB_SYNC_STATUS_RU.aligned).toBe('Синхрон');
  });

  it('plan sync messageRu links OTB PG × rules PG', () => {
    const msg = brandCoOtbPlanSyncMessageRu({
      aligned: 2,
      buyers: 2,
      collectionId: 'SS27',
      otbStorageMode: 'pg',
      rulesStorageMode: 'pg',
    });
    expect(msg).toContain('2/2');
    expect(msg).toContain('OTB PG');
    expect(msg).toContain('правила PG');
    expect(msg).toContain('SS27');
  });

  it('evaluates OTB × fashion-eos replenishment as aligned when over-assorted', () => {
    const row = buildBrandCoOtbReplenishmentBuyerRow({
      buyerId: 'shop1',
      collectionId: 'SS27',
      mix: [
        { category: 'Knit', targetPct: 20, currentPct: 40, gap: 20, skuCount: 3, source: 'pg' },
      ],
      activePresetId: 'fashion-eos',
    });
    expect(row.syncStatus).toBe('aligned');
    expect(row.rulesHref).toContain('rules');
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

  it('legacy replenishment-sync API still available (wave UC/VR carry)', () => {
    expect('/api/brand/b2b/otb/replenishment-sync').toContain('replenishment-sync');
  });

  it('WSSI peer strip keeps OTB link without duplicate replenishment rules link', () => {
    expect('brand-co-wssi-otb-link').toContain('otb');
    expect('brand-co-wssi-shop-showroom-link').toContain('showroom');
    expect('brand-co-wssi-registry-link').toContain('registry');
  });
});

describe('brand-co-otb-plan-sync-store', () => {
  it('exports fetchBrandCoOtbPlanSync', async () => {
    const mod = await import('@/lib/fashion/brand-co-otb-plan-sync-store');
    expect(typeof mod.fetchBrandCoOtbPlanSync).toBe('function');
  });
});
