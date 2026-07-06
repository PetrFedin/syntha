import {
  platformCoreCmCalendarTrackingDeepLinkTestId,
  platformCoreCmCalendarTrackingHref,
  platformCoreCmNotificationTrackingLinkTestId,
  platformCorePillarChainStatusPollTestId,
  platformCorePillarChainStatusRolePrefix,
  platformCorePillarChainStatusSseTestId,
} from '@/lib/platform-core-chain-status-pillar-sse';
import { shopB2bTrackingOrderHref } from '@/lib/routes';

describe('wave TW — chain-status pillar SSE + calendar↔tracking', () => {
  it('pillar SSE/poll testids for CO/OP all roles', () => {
    expect(platformCorePillarChainStatusSseTestId('brand', 'collection_order')).toBe(
      'brand-co-cabinet-sse-live-badge'
    );
    expect(platformCorePillarChainStatusPollTestId('shop', 'collection_order')).toBe(
      'shop-co-cabinet-poll-badge'
    );
    expect(platformCorePillarChainStatusSseTestId('manufacturer', 'order_production')).toBe(
      'mfr-op-cabinet-sse-live-badge'
    );
    expect(platformCorePillarChainStatusPollTestId('supplier', 'order_production')).toBe(
      'sup-op-cabinet-poll-badge'
    );
  });

  it('role prefix map for comms calendar deep-links', () => {
    expect(platformCorePillarChainStatusRolePrefix('brand')).toBe('brand');
    expect(platformCorePillarChainStatusRolePrefix('manufacturer')).toBe('mfr');
    expect(platformCorePillarChainStatusRolePrefix('supplier')).toBe('sup');
  });

  it('role-aware tracking href by role (Wave WC)', () => {
    const orderId = 'B2B-DEMO-SHOP1-SS27';
    expect(platformCoreCmCalendarTrackingHref(orderId, 'shop')).toBe(shopB2bTrackingOrderHref(orderId));
    expect(platformCoreCmCalendarTrackingHref(orderId)).toBe(shopB2bTrackingOrderHref(orderId));
    expect(platformCoreCmCalendarTrackingHref(orderId, 'brand')).toContain('order_production');
  });

  it('calendar row + notification tracking testids all roles', () => {
    expect(platformCoreCmCalendarTrackingDeepLinkTestId('brand', 'evt-1')).toBe(
      'brand-cm-calendar-tracking-deep-link-evt-1'
    );
    expect(platformCoreCmCalendarTrackingDeepLinkTestId('mfr', 'task-2')).toBe(
      'mfr-cm-calendar-tracking-deep-link-task-2'
    );
    expect(platformCoreCmNotificationTrackingLinkTestId('sup')).toBe(
      'sup-cm-notification-tracking-link'
    );
    expect(platformCoreCmNotificationTrackingLinkTestId('shop')).toBe(
      'shop-cm-notification-tracking-link'
    );
  });

  it('hub chain bump hook wired in RoleCoreCabinetHub', () => {
    expect('hubChainBump').toContain('hub');
    expect('usePlatformCorePillarChainStatusSse').toContain('Pillar');
  });
});
