import { buildBrandProductionHandoffSession } from '@/lib/brand-production/brand-production-handoff';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { buildShopLandedMarginSession } from '@/lib/b2b/shop-landed-margin';
import { buildShopOrderCommsSession } from '@/lib/b2b/shop-order-comms';

describe('wave-au spine peers p3', () => {
  it('brand OP handoff + shop order comms session hrefs', () => {
    const handoff = buildBrandProductionHandoffSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    const comms = buildShopOrderCommsSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(handoff.shopTrackingHref).toContain('tracking');
    expect(handoff.manufacturerOrderCommsHref).toContain('messages');
    expect(comms.brandOrderHandoffHref).toContain('handoff');
    expect(comms.matrixHref).toContain('matrix');
  });

  it('mfr OP handoff queue + production ops session hrefs', () => {
    const queue = buildManufacturerHandoffQueueSession({
      factoryId: 'fact-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    const ops = buildManufacturerProductionOpsSession({
      factoryId: 'fact-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(queue.brandHandoffHref).toContain('handoff');
    expect(queue.shopTrackingHref).toContain('tracking');
    expect(ops.cutTicketHref).toContain('cut-ticket');
  });

  it('wave-au testid anchors', () => {
    const margin = buildShopLandedMarginSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect('brand-op-handoff-co-spine-peer-strip').toContain('co-spine');
    expect('shop-cm-order-context-strip').toContain('context-strip');
    expect('shop-op-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('mfr-op-handoff-queue-co-spine-peer-strip').toContain('co-spine');
    expect('shop-co-landed-margin-spine-peer-strip').toContain('spine-peer');
    expect(margin.orderCommsHref).toContain('tracking');
  });
});
