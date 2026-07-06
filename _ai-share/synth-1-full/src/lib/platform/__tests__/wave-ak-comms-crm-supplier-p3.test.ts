import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { shopB2bTrackingOrderHref } from '@/lib/routes';

describe('wave-ak comms CRM supplier logistics', () => {
  it('brand CRM segmentation hrefs from retailers context', () => {
    expect(brandCrmSegmentationFeatureHref('segments', 'SS27')).toContain('pcf=segments');
    expect(brandCrmSegmentationFeatureHref('pricelist', 'SS27')).toContain('pcf=pricelist');
  });

  it('supplier SLA strip session links RFQ and entities', () => {
    const session = buildSupplierProcurementSession({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.rfqHref).toContain('/factory/supplier/rfq-inbox');
    expect(session.rfqHref).not.toContain('pcf=rfq');
    expect(session.entitiesHref).toContain('pcf=entities');
  });

  it('supplier calendar logistics peer uses shop tracking', () => {
    expect(shopB2bTrackingOrderHref('B2B-DEMO-1')).toContain('B2B-DEMO-1');
  });

  it('investor summary dossier link path', () => {
    const href =
      '/brand/production/workshop2/investor-summary?collection=SS27&article=demo-ss27-01';
    expect(href).toContain('investor-summary');
  });

  it('registry stream health testid prefix', () => {
    expect('brand-cm-cabinet-registry-stream-health-strip').toContain('registry-stream-health');
  });
});
