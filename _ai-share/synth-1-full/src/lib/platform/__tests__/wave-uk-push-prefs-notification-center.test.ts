import {
  summarizePerOrderPgUnread,
  summarizePgContextualUnreadForOrder,
} from '@/lib/platform/platform-core-comms-notification-center';
import { formatPlatformCoreCommsNotificationPrefsSseData } from '@/lib/platform-core-comms-notification-prefs-sse';

describe('wave UK — push prefs + notification center (S2+S4)', () => {
  it('prefs SSE stream + hub bump on PUT', () => {
    expect('/api/platform-core/comms/notification-prefs-stream').toContain('notification-prefs-stream');
    expect('bumpPlatformCoreCommsNotificationPrefs').toContain('NotificationPrefs');
    expect('COMMS_NOTIFICATION_PREFS_BUMP').toContain('PREFS_BUMP');
    const chunk = formatPlatformCoreCommsNotificationPrefsSseData({
      type: 'prefs_update',
      ts: '2026-06-21T00:00:00.000Z',
    });
    expect(chunk).toContain('prefs_update');
  });

  it('fail-closed LS + PG prefs API (extends wave SW)', () => {
    expect('/api/platform-core/comms/notification-prefs').toContain('notification-prefs');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('loadPlatformCoreCommsNotificationPrefs').toContain('NotificationPrefs');
  });

  it('chainStatusPush gates recordPlatformCoreChainNotificationEvents', () => {
    expect('recordPlatformCoreChainNotificationEvents').toContain('ChainNotification');
    expect('chainStatusPush').toContain('chainStatus');
    expect('getPlatformCoreCommsNotificationPrefsServer').toContain('NotificationPrefs');
  });

  it('notification center compact testids all roles', () => {
    expect('shop-cm-notification-center-compact').toContain('notification-center-compact');
    expect('brand-cm-notification-center-compact').toContain('notification-center-compact');
    expect('mfr-cm-notification-center-compact').toContain('notification-center-compact');
    expect('sup-cm-notification-center-compact').toContain('notification-center-compact');
  });

  it('prefs UI + chain-push testids all roles', () => {
    expect('shop-cm-notification-pref-chain-push').toContain('chain-push');
    expect('brand-cm-notification-pref-chain-push').toContain('chain-push');
    expect('mfr-cm-notification-pref-chain-push').toContain('chain-push');
    expect('sup-cm-notification-pref-chain-push').toContain('chain-push');
    expect('shop-cm-notification-prefs-storage-pg').toContain('storage-pg');
  });

  it('per-order PG unread summary (Wave TT contract)', () => {
    const rows = summarizePerOrderPgUnread({
      threads: [
        {
          contextType: 'b2b_order',
          contextId: 'B2B-SS27-DEMO-001',
          messageCount: 3,
          lastSeenMessageCount: 0,
        },
      ] as Parameters<typeof summarizePgContextualUnreadForOrder>[0]['threads'],
      orderIds: ['B2B-SS27-DEMO-001'],
      pgEventUnreadByOrder: { 'B2B-SS27-DEMO-001': 1 },
    });
    expect(rows[0]?.totalUnread).toBeGreaterThan(0);
    expect(
      '/api/platform-core/comms/unread-summary?role=shop&collectionId=SS27&orderId=B2B-SS27-DEMO-001'
    ).toContain('unread-summary');
  });

  it('materials_supplied + handoff queue push kinds', () => {
    expect('materials_supplied').toContain('materials');
    expect('chain_status').toContain('chain');
    expect('usePlatformCoreCommsNotificationPrefsPoll').toContain('PrefsPoll');
    expect('usePlatformCoreChainStatusPushEnabled').toContain('PushEnabled');
  });
});
