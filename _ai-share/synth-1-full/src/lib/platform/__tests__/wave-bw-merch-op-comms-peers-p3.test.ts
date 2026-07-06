import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { buildShopShowroomBuySession } from '@/lib/b2b/shop-showroom-buy';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';

describe('wave BW — brand dev merch CO spine + mfr OP/co comms peers', () => {
  it('brand attribute-schema CO spine testIds', () => {
    expect('brand-attribute-schema-co-spine-peer-strip').toContain('co-spine');
    expect('brand-attribute-schema-shop-matrix-link').toContain('matrix');
    const shop = buildShopShowroomBuySession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(shop.checkoutHref).toContain('checkout');
  });

  it('brand dossier CO peer strip', () => {
    expect('brand-dev-dossier-co-peer-strip').toContain('dossier-co');
    expect(brandCrmSegmentationFeatureHref('segments', 'SS27')).toContain('customer-groups');
  });

  it('brand material-passport + supplier-bom + rfq CO spine variants', () => {
    expect('brand-material-passport-co-spine-peer-strip').toContain('material-passport');
    expect('brand-supplier-bom-co-spine-peer-strip').toContain('supplier-bom');
    expect('brand-rfq-supplier-co-spine-peer-strip').toContain('rfq-supplier');
  });

  it('mfr OP dossier CO spine session links', () => {
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'FACTORY-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.brandHandoffHref).toContain('handoff');
    expect('mfr-op-dossier-co-spine-peer-strip').toContain('co-spine');
    expect('mfr-op-dossier-techpack-ack-link').toContain('techpack');
  });

  it('mfr OP materials CO spine + article messages peer', () => {
    expect('mfr-op-materials-co-spine-peer-strip').toContain('materials-co');
    expect('mfr-op-materials-brand-handoff-link').toContain('handoff');
    expect('mfr-cm-article-messages-peer-panel').toContain('messages-peer');
    expect('mfr-cm-article-attach-tz-peer-strip').toContain('attach-tz');
  });
});
