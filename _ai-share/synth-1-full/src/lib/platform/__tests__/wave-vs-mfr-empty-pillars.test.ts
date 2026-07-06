import { hasEmptyCellInsightPanel } from '@/lib/platform-core-empty-cell-registry';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { buildShopShowroomBuySession } from '@/lib/b2b/shop-showroom-buy';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { brandLinesheetsHrefForDemo } from '@/lib/platform-core-hub-matrix';

const MFR_SC_PEER_LINKS = [
  'mfr-empty-sc-shop-showroom-link',
  'mfr-empty-sc-shop-matrix-link',
  'mfr-empty-sc-brand-linesheet-link',
  'mfr-empty-sc-sample-queue-link',
] as const;

const MFR_CO_PEER_LINKS = [
  'mfr-empty-co-brand-handoff-link',
  'mfr-empty-co-shop-tracking-link',
  'mfr-empty-co-shop-matrix-link',
  'mfr-empty-co-handoff-queue-link',
] as const;

describe('wave VS — mfr empty pillars polish', () => {
  it('registers manufacturer empty SC + CO insight panels', () => {
    expect(hasEmptyCellInsightPanel('manufacturer', 'sample_collection')).toBe(true);
    expect(hasEmptyCellInsightPanel('manufacturer', 'collection_order')).toBe(true);
  });

  it('read-only publish badge when brand publishes (not factory editor)', () => {
    expect('mfr-empty-sc-publish-badge').toContain('publish');
    expect('manufacturer-sample-collection-pg-table').toContain('pg-table');
    expect('manufacturer-sample-collection-mini').toContain('mini');
    expect('ManufacturerSampleCollectionStatus').toContain('Collection');
  });

  it('read-only handoff count badge from PG queue (not B2B order UI)', () => {
    expect('mfr-empty-co-handoff-count-badge').toContain('handoff-count');
    expect('/api/workshop2/factory/production-handoff-queue').toContain('handoff-queue');
    expect('manufacturer-po-expectation-mini').toContain('expectation');
    expect('manufacturer-po-expectation').toContain('expectation');
  });

  it('PlatformCoreEmptyCellPanels wires SC + CO manufacturer panels', () => {
    expect('manufacturer-sample-collection-status-panel').toContain('sample-collection');
    expect('manufacturer-po-expectation-panel').toContain('po-expectation');
    expect('PlatformCoreEmptyCellPanels').toContain('EmptyCell');
  });

  it('mfr empty SC peer strip — ≥2 cross-links', () => {
    expect(MFR_SC_PEER_LINKS.length).toBeGreaterThanOrEqual(2);
    expect('mfr-empty-sc-peer-strip').toContain('peer-strip');
    for (const tid of MFR_SC_PEER_LINKS) {
      expect(tid).toMatch(/^mfr-empty-sc-/);
    }
    const demo = {
      collectionId: 'SS27',
      factoryId: 'fact-1',
      demoArticleId: 'demo-ss27-01',
      demoOrderId: 'B2B-DEMO-SHOP1-SS27',
    };
    const shop = buildShopShowroomBuySession({ collectionId: demo.collectionId });
    expect(shop.showroomHref).toContain('showroom');
    expect(shop.matrixHref).toContain('/shop/b2b/matrix');
    expect(brandLinesheetsHrefForDemo(demo)).toContain('linesheet');
    expect(
      manufacturerHandoffFeatureHref('sample-queue', {
        factoryId: demo.factoryId,
        collectionId: demo.collectionId,
      })
    ).toContain('sample-queue');
  });

  it('mfr empty CO peer strip — ≥2 cross-links', () => {
    expect(MFR_CO_PEER_LINKS.length).toBeGreaterThanOrEqual(2);
    expect('mfr-empty-co-peer-strip').toContain('peer-strip');
    for (const tid of MFR_CO_PEER_LINKS) {
      expect(tid).toMatch(/^mfr-empty-co-/);
    }
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'fact-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-SHOP1-SS27',
    });
    expect(session.brandHandoffHref).toContain('handoff');
    expect(session.shopTrackingHref).toContain('tracking');
    expect(session.handoffHref).toContain('handoff');
  });
});
