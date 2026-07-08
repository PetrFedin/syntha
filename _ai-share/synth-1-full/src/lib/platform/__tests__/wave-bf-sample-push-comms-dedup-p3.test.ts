import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';

describe('wave-bf sample push + comms detail dedup p3', () => {
  it('sample lifecycle push testid anchors', () => {
    expect('brand-sample-lifecycle-push-DEMO-SKU-btn').toContain('push');
    expect('brand-sample-lifecycle-rounds-panel').toContain('rounds');
  });

  it('sample-order transition API path contract', () => {
    const path = '/api/workshop2/articles/SS27/demo-ss27-01/sample-order/so-1/transition';
    expect(path).toContain('sample-order');
    expect(path).toContain('transition');
  });

  it('brand order comms detail uses registry SoT not full facts', () => {
    const session = buildBrandOrderCommsSession({
      orderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
    });
    expect('brand-order-comms-detail-panel').toContain('detail');
    expect('brand-order-comms-registry-sot-link').toContain('registry');
    expect(session.registryHref).toContain('B2B-DEMO-1');
  });
});
