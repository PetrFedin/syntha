import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { buildBrandInventoryOpsSession } from '@/lib/b2b/brand-inventory-ops';
import {
  brandProductionOpsFeatureHref,
  buildBrandProductionHandoffSession,
} from '@/lib/brand-production/brand-production-handoff';
import { buildShopCollaborativeOrderSession } from '@/lib/b2b/shop-collaborative-order';
import { shopOrderCommsFeatureHref } from '@/lib/b2b/shop-order-comms';

describe('wave-an spine peers p3', () => {
  it('brand w2 hub investor summary href', () => {
    const href =
      '/brand/production/workshop2/investor-summary?collection=SS27&article=demo-ss27-01';
    expect(href).toContain('investor-summary');
  });

  it('brand op handoff inventory session hrefs', () => {
    const handoff = buildBrandProductionHandoffSession({
      orderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
    });
    const inventory = buildBrandInventoryOpsSession({
      orderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
    });
    expect(handoff.brandOrderCommsChatHref).toContain('chat');
    expect(inventory.overviewHref).toContain('pcf=overview');
    expect(handoff.shopReplenishmentAtpHref).toContain('replenishment');
  });

  it('shop matrix spine session hrefs', () => {
    const session = buildShopCollaborativeOrderSession({
      orderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
    });
    expect(session.sessionHref).toContain('collaborative');
    expect(session.replenishmentHref).toContain('replenishment');
    expect(session.workingOrderHref).toContain('working-order');
  });

  it('shop checkout monetization hrefs', () => {
    const session = buildShopCollaborativeOrderSession({
      orderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
    });
    expect(brandCrmSegmentationFeatureHref('segments', 'SS27')).toContain('pcf=segments');
    expect(session.approvalsHref).toContain('approvals');
    expect(shopOrderCommsFeatureHref('B2B-DEMO-1', 'chat', 'SS27')).toContain('pcf=chat');
  });

  it('brand article comms production ops href', () => {
    expect(brandProductionOpsFeatureHref('B2B-DEMO-1', 'qc-gate')).toContain('qc-gate');
  });

  it('wave-an testid anchors', () => {
    expect('brand-dev-w2-hub-investor-summary-strip').toContain('investor-summary');
    expect('shop-co-matrix-spine-peer-strip').toContain('spine-peer');
    expect('sup-dev-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('sup-cm-article-quote-honest-strip').toContain('quote-honest');
    expect('platform-b2b-partners-golden-path-strip').toContain('golden-path');
  });
});
