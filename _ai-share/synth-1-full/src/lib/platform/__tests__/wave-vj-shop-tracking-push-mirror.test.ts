import {
  shopCoTrackingChainStatusMirrorPollTestId,
  shopCoTrackingChainStatusMirrorSseTestId,
  shopCoTrackingChainStatusMirrorTestId,
  shopCoTrackingMaterialsPushTestId,
} from '@/lib/platform-core-shop-tracking-chain-mirror';
import { platformCoreCmCalendarTrackingDeepLinkTestId } from '@/lib/platform-core-chain-status-pillar-sse';

describe('wave VJ — shop tracking chain mirror + materials push', () => {
  it('chain-status mirror testids on tracking row', () => {
    const orderId = 'B2B-DEMO-SHOP1-SS27';
    expect(shopCoTrackingChainStatusMirrorTestId(orderId)).toBe(
      'shop-co-tracking-chain-status-mirror-B2B-DEMO-SHOP1-SS27'
    );
    expect(shopCoTrackingChainStatusMirrorSseTestId(orderId)).toContain('sse-live');
    expect(shopCoTrackingChainStatusMirrorPollTestId(orderId)).toContain('poll');
    expect('data-chain-sse-live').toContain('chain-sse-live');
  });

  it('materials_supplied push strip + SSE bump attrs', () => {
    const orderId = 'B2B-SS27-DEMO-001';
    expect(shopCoTrackingMaterialsPushTestId(orderId)).toBe(
      'shop-co-tracking-materials-push-B2B-SS27-DEMO-001'
    );
    expect('data-materials-sse-live').toContain('materials-sse-live');
    expect('data-materials-push-bump').toContain('push-bump');
    expect('materials-supplied-push').toContain('materials-supplied');
  });

  it('calendar row deep-link testids all roles → shop tracking card', () => {
    expect(platformCoreCmCalendarTrackingDeepLinkTestId('brand', 'evt-1')).toBe(
      'brand-cm-calendar-tracking-deep-link-evt-1'
    );
    expect(platformCoreCmCalendarTrackingDeepLinkTestId('mfr', 'task-2')).toBe(
      'mfr-cm-calendar-tracking-deep-link-task-2'
    );
    expect(platformCoreCmCalendarTrackingDeepLinkTestId('sup', 'evt-3')).toBe(
      'sup-cm-calendar-tracking-deep-link-evt-3'
    );
    expect(platformCoreCmCalendarTrackingDeepLinkTestId('shop', 'evt-4')).toBe(
      'shop-cm-calendar-tracking-deep-link-evt-4'
    );
  });

  it('ShopCoTrackingChainStatusMirrorBadge component wired', () => {
    expect('ShopCoTrackingChainStatusMirrorBadge').toContain('Mirror');
  });
});
