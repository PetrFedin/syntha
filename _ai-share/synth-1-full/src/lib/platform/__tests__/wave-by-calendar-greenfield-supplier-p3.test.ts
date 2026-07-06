import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';

describe('wave BY — calendar pcTask + greenfield pricelist + supplier push/WMS', () => {
  it('calendar pcTask deep-link param wired on all roles', () => {
    expect('brand-cm-calendar-user-tasks-strip').toContain('user-tasks');
    expect('shop-cm-calendar-user-tasks-strip').toContain('user-tasks');
    expect('mfr-cm-calendar-user-tasks-strip').toContain('user-tasks');
    expect('pcTask').toBe('pcTask');
  });

  it('greenfield empty registry pricelist CTA', () => {
    expect('shop-co-registry-empty-greenfield-brand-pricelist-link').toContain('pricelist');
    expect(brandCrmSegmentationFeatureHref('pricelist', 'SS27')).toContain('pricelist');
  });

  it('supplier procurement CO spine + brand push on materials/BOM', () => {
    expect('sup-op-procurement-co-peer-strip').toContain('co-peer');
    expect('sup-op-procurement-mfr-handoff-link').toContain('handoff');
    expect('sup-op-procurement-brand-push-strip').toContain('brand-push');
    expect('sup-op-procurement-brand-push-submit').toContain('push-submit');
    expect('sup-op-procurement-bom-wms-reserve-strip').toContain('wms-reserve');
  });
});
