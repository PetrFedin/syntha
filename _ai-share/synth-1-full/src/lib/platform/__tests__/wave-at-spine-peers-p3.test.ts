import { buildPlatformB2bHubSession } from '@/lib/b2b/platform-b2b-hub';
import { buildPlatformB2bMarketroomSession } from '@/lib/b2b/platform-b2b-marketroom';
import { buildBrandProductionHandoffSession } from '@/lib/brand-production/brand-production-handoff';
import { buildManufacturerOrderCommsSession } from '@/lib/b2b/manufacturer-order-comms';
import { buildShopB2bPartnersSession } from '@/lib/b2b/shop-b2b-partners-workspace';
import { buildShopShowroomBuySession } from '@/lib/b2b/shop-showroom-buy';

describe('wave-at spine peers p3', () => {
  it('platform B2B hub + marketroom session hrefs', () => {
    const hub = buildPlatformB2bHubSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    const marketroom = buildPlatformB2bMarketroomSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(hub.buyPathHref).toContain('buy-path');
    expect(hub.shopMatrixHref).toContain('matrix');
    expect(marketroom.platformHubHref).toContain('platform');
    expect(marketroom.shopBuyHref).toContain('buy');
    expect(hub.collaborativeHref).toContain('collaborative');
  });

  it('brand SC/OP + shop SC session hrefs', () => {
    const handoff = buildBrandProductionHandoffSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    const showroom = buildShopShowroomBuySession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    const partners = buildShopB2bPartnersSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(handoff.qcGateTabHref).toContain('qc-gate');
    expect(showroom.checkoutHref).toContain('checkout');
    expect(partners.shopMatrixHref).toContain('matrix');
  });

  it('wave-at testid anchors', () => {
    const mfr = buildManufacturerOrderCommsSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
      factoryId: 'fact-1',
    });
    expect('platform-b2b-hub-co-spine-peer-strip').toContain('co-spine');
    expect('brand-sc-showroom-retail-peer-strip').toContain('retail-peer');
    expect('brand-op-chain-co-spine-peer-strip').toContain('co-spine');
    expect('shop-sc-partners-b2b-peer-strip').toContain('b2b-peer');
    expect('mfr-cm-order-context-strip').toContain('context-strip');
    expect(mfr.handoffHref).toContain('handoff');
  });
});
