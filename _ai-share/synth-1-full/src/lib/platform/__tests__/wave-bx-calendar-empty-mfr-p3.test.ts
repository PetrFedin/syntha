import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { shopMatrixWorkspaceTabHref } from '@/lib/b2b/shop-collection-order-hrefs';

describe('wave BX — mfr calendar CO spine + empty-cell peer wiring', () => {
  it('mfr calendar context peer strip on production + shared calendar', () => {
    expect('mfr-cm-calendar-context-peer-strip').toContain('context-peer');
    expect('mfr-cm-calendar-prod-orders-link').toContain('prod-orders');
    expect('mfr-cm-calendar-techpack-ack-link').toContain('techpack');
    expect('mfr-cm-calendar-shop-comms-link').toContain('comms');
  });

  it('mfr calendar session spine hrefs', () => {
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'FACTORY-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.techpackAckHref).toContain('techpack');
    expect(session.shopOrderCommsHref).toContain('tracking');
    expect(session.factoryOrdersHref).toContain('production');
  });

  it('mfr empty SC + CO peer strips wired in panels', () => {
    expect('mfr-empty-sc-peer-strip').toContain('sc-peer');
    expect('mfr-empty-sc-shop-matrix-link').toContain('matrix');
    expect('mfr-empty-co-peer-strip').toContain('co-peer');
    expect(shopMatrixWorkspaceTabHref('matrix', 'SS27', 'B2B-DEMO-1')).toContain('matrix');
    expect('mfr-empty-co-brand-handoff-link').toContain('handoff');
  });
});
