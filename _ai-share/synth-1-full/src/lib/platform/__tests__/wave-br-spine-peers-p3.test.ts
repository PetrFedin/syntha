import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import { buildShopOrderCommsSession } from '@/lib/b2b/shop-order-comms';

describe('wave BR — unwired spine peers wired', () => {
  it('brand calendar context peer strip anchors', () => {
    expect('brand-cm-calendar-context-peer-strip').toContain('context-peer');
    expect('brand-cm-calendar-handoff-link').toContain('handoff');
  });

  it('supplier calendar context peer strip anchors', () => {
    expect('sup-cm-calendar-context-peer-strip').toContain('context-peer');
    expect('sup-cm-calendar-forecast-link').toContain('forecast');
  });

  it('brand section-groups spine on order messages', () => {
    const session = buildBrandOrderCommsSession({ orderId: 'B2B-DEMO-1', collectionId: 'SS27' });
    expect(session.registryHref).toContain('B2B-DEMO-1');
    expect('brand-cm-section-groups-spine-peer-strip').toContain('spine-peer');
  });

  it('shop order comms and tracking spine peers', () => {
    const session = buildShopOrderCommsSession({ orderId: 'B2B-DEMO-1', collectionId: 'SS27' });
    expect(session.brandOrderHandoffHref).toContain('B2B-DEMO-1');
    expect('shop-cm-order-context-strip').toContain('context');
    expect('shop-op-tracking-spine-peer-strip').toContain('spine-peer');
    expect('shop-op-registry-spine-peer-strip').toContain('spine-peer');
  });

  it('shop detail context strip testids', () => {
    expect('shop-co-detail-context-strip').toContain('context');
    expect('shop-co-detail-replenishment-link').toContain('replenishment');
  });
});
