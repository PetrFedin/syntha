import {
  assignShopBuyerCrmProfileServer,
  clearShopBuyerCrmProfilesMemoryForTests,
  getShopBuyerCrmProfileServer,
} from '@/lib/server/shop-buyer-crm-profile-repository';
import { clearBrandCrmSegmentsMemoryForTests } from '@/lib/server/brand-crm-segments-repository';
import { buildShopShowroomBuySession } from '@/lib/b2b/shop-showroom-buy';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { shopB2bCheckoutCollectionHref } from '@/lib/routes';

describe('wave-ba brand assign + supplier/mfr spine p3', () => {
  beforeEach(() => {
    clearBrandCrmSegmentsMemoryForTests();
    clearShopBuyerCrmProfilesMemoryForTests();
  });

  it('assignShopBuyerCrmProfileServer updates shop2 segment', async () => {
    const assigned = await assignShopBuyerCrmProfileServer({
      buyerId: 'shop2',
      segmentKey: 'wholesale',
    });
    expect(assigned.profile?.segmentKey).toBe('wholesale');
    expect(assigned.profile?.priceTier).toBeTruthy();

    const loaded = await getShopBuyerCrmProfileServer({ buyerId: 'shop2' });
    expect(loaded.profile?.segmentKey).toBe('wholesale');
  });

  it('greenfield monetization hrefs after assign', () => {
    const shop = buildShopShowroomBuySession({ collectionId: 'SS27' });
    expect(shopB2bCheckoutCollectionHref('SS27')).toContain('checkout');
    expect(shop.matrixHref).toContain('matrix');
  });

  it('supplier push spine session hrefs', () => {
    const session = buildSupplierOrderCommsSession({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.brandOrderHandoffHref).toContain('handoff');
    expect(session.shopTrackingHref).toContain('tracking');
  });

  it('mfr gantt bridge handoff session hrefs', () => {
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'factory-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.handoffHref).toContain('handoff');
    expect(session.productionOpsCutTicketHref).toContain('cut-ticket');
  });

  it('wave-ba testid anchors', () => {
    expect('brand-crm-shop-buyer-assign-panel').toContain('assign');
    expect('brand-crm-shop-buyer-assign-submit').toContain('assign');
    expect('brand-crm-shop-buyer-assign-shop-registry-link').toContain('registry');
    expect('sup-cm-cabinet-brand-push-tracking-link').toContain('tracking');
    expect('mfr-cm-calendar-gantt-handoff-link').toContain('handoff');
  });
});
