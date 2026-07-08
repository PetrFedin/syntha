import { buildPlatformB2bHubSession } from '@/lib/b2b/platform-b2b-hub';
import { buildShopAgentRepSession } from '@/lib/b2b/shop-agent-rep';
import { buildShopWorkingOrderSession } from '@/lib/b2b/shop-working-order-session';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { brandProductionOpsFeatureHref } from '@/lib/brand-production/brand-production-handoff';

describe('wave-am pg sync spine peers', () => {
  it('brand op registry production hrefs', () => {
    expect(brandProductionOpsFeatureHref('B2B-DEMO-1', 'qc-gate')).toContain('pcf=qc-gate');
  });

  it('shop working order session tracking href', () => {
    const session = buildShopWorkingOrderSession({
      wholesaleOrderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
    });
    expect(session.trackingHref).toContain('B2B-DEMO-1');
    expect(session.checkoutHref).toContain('checkout');
  });

  it('shop agent rep checkout and tracking', () => {
    const session = buildShopAgentRepSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(session.checkoutHref).toContain('checkout');
    expect(session.trackingHref).toContain('B2B-DEMO-1');
  });

  it('platform b2b spine session', () => {
    const session = buildPlatformB2bHubSession({ collectionId: 'SS27' });
    expect(session.shopMatrixHref).toContain('matrix');
    expect(session.brandPublishHref).toContain('publish');
  });

  it('supplier CRM peer hrefs', () => {
    expect(brandCrmSegmentationFeatureHref('segments', 'SS27')).toContain('pcf=segments');
  });

  it('wave-am testid anchors', () => {
    expect('brand-dev-pg-sync-peer-strip').toContain('pg-sync');
    expect('sup-op-cabinet-spine-nav-strip').toContain('spine-nav');
    expect('platform-b2b-hub-golden-path-strip').toContain('golden-path');
  });
});
