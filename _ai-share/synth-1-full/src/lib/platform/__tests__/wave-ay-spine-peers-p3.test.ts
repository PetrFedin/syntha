import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { buildShopOrderCommsSession } from '@/lib/b2b/shop-order-comms';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';

describe('wave-ay spine peers p3', () => {
  it('shop tracking spine session hrefs', () => {
    const session = buildShopOrderCommsSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.brandOrderHandoffHref).toContain('handoff');
    expect(session.inventoryOverviewHref).toContain('inventory');
    expect(session.platformHubHref).toContain('/platform/b2b');
  });

  it('mfr calendar context session hrefs', () => {
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'factory-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.handoffHref).toContain('handoff');
    expect(session.shopTrackingHref).toContain('tracking');
    expect(session.brandQcGateHref).toContain('qc-gate');
  });

  it('brand section-groups session hrefs', () => {
    const session = buildBrandOrderCommsSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.registryHref).toContain('b2b-orders');
    expect(session.calendarHref).toContain('calendar');
    expect(brandCrmSegmentationFeatureHref('pricelist', 'SS27')).toContain('pricelist');
  });

  it('wave-ay testid anchors', () => {
    expect('shop-op-tracking-spine-peer-strip').toContain('spine-peer');
    expect('mfr-cm-calendar-context-peer-strip').toContain('context-peer');
    expect('brand-cm-section-groups-spine-peer-strip').toContain('spine-peer');
    expect('brand-cm-calendar-context-peer-strip').toContain('context-peer');
    expect('mfr-cm-calendar-gantt-peer-link').toContain('gantt');
  });
});
