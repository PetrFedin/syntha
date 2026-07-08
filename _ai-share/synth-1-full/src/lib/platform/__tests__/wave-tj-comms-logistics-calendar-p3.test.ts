import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import {
  buildSupplierLogisticsEtaMapStub,
  formatSupplierLogisticsDeliveryWindowLabel,
  SUP_CM_CALENDAR_LOGISTICS_PEER_STRIP_TESTID,
  SUP_CM_LOGISTICS_ETA_BADGE_TESTID,
  SUP_CM_LOGISTICS_ETA_MAP_STUB_TESTID,
  SUP_CM_LOGISTICS_ETA_STRIP_TESTID,
  SUP_CM_LOGISTICS_ETA_TRACKING_LINK_TESTID,
} from '@/lib/fashion/supplier-logistics-wave-vo';
import { shopB2bTrackingOrderHref } from '@/lib/routes';

describe('wave TJ — supplier comms logistics calendar ETA/map', () => {
  it('supplier logistics ETA map stub is deterministic without external keys', () => {
    const a = buildSupplierLogisticsEtaMapStub('B2B-DEMO-1');
    const b = buildSupplierLogisticsEtaMapStub('B2B-DEMO-1');
    expect(a).toEqual(b);
    expect(a.originRu.length).toBeGreaterThan(0);
    expect(a.destinationRu.length).toBeGreaterThan(0);
    expect(a.routeLabelRu).toContain('→');
  });

  it('delivery window label prefers label then estimatedDelivery', () => {
    expect(formatSupplierLogisticsDeliveryWindowLabel({ label: 'W12–14' })).toBe('W12–14');
    expect(formatSupplierLogisticsDeliveryWindowLabel({ estimatedDelivery: '2026-07-01' })).toBe(
      '2026-07-01'
    );
    expect(formatSupplierLogisticsDeliveryWindowLabel(null)).toBeNull();
  });

  it('supplier calendar logistics peer session + tracking hrefs', () => {
    const session = buildSupplierOrderCommsSession({
      orderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
    });
    expect(session.calendarHref).toContain('calendar');
    expect(shopB2bTrackingOrderHref('B2B-DEMO-1')).toContain('B2B-DEMO-1');
  });

  it('wave-tj testid anchors on logistics ETA overlay', () => {
    expect(SUP_CM_LOGISTICS_ETA_STRIP_TESTID).toContain('logistics-eta');
    expect(SUP_CM_LOGISTICS_ETA_MAP_STUB_TESTID).toContain('map-stub');
    expect(SUP_CM_LOGISTICS_ETA_BADGE_TESTID).toContain('eta-badge');
    expect(SUP_CM_LOGISTICS_ETA_TRACKING_LINK_TESTID).toContain('tracking');
    expect(SUP_CM_CALENDAR_LOGISTICS_PEER_STRIP_TESTID).toContain('logistics-peer');
  });
});
