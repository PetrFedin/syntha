import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { brandAttributeSchemaFeatureHref } from '@/lib/fashion/brand-attribute-schema-workspace';

describe('wave BV — dev cabinet peers + mfr handoff CO spine', () => {
  it('brand dev PG sync peer on cabinet', () => {
    expect('brand-dev-pg-sync-peer-strip').toContain('pg-sync');
    expect('brand-dev-pg-sync-range-link').toContain('range');
    expect(brandAttributeSchemaFeatureHref('health', 'SS27')).toContain('attribute-health');
  });

  it('mfr dev sample queue handoff peer', () => {
    expect('mfr-dev-sample-queue-handoff-peer-strip').toContain('handoff-peer');
    expect('mfr-dev-sample-queue-production-ops-link').toContain('production');
  });

  it('mfr handoff queue CO spine session links', () => {
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'FACTORY-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.brandHandoffHref).toContain('handoff');
    expect(session.shopTrackingHref).toContain('tracking');
    expect('mfr-op-handoff-queue-co-spine-peer-strip').toContain('co-spine');
    expect('mfr-op-handoff-queue-techpack-ack-link').toContain('techpack');
  });

  it('brand SC linesheets retail peer wired', () => {
    expect('brand-sc-linesheets-retail-peer-strip').toContain('retail-peer');
  });
});
