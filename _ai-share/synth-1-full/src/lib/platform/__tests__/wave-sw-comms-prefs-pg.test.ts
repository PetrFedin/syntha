describe('wave SW — S2 + P2-comms chain-status push prefs PG', () => {
  it('notification prefs API + postgres storageMode', () => {
    expect('/api/platform-core/comms/notification-prefs').toContain('notification-prefs');
    expect("storageMode: 'postgres'").toContain('postgres');
    expect('platform_core_comms_notification_prefs').toContain('notification_prefs');
  });

  it('fail-closed LS read/write in core mode', () => {
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('readPlatformCoreCommsNotificationPrefs').toContain('NotificationPrefs');
  });

  it('chain push pref gates hub/pillar SSE poll', () => {
    expect('usePlatformCoreChainStatusPushEnabled').toContain('PushEnabled');
    expect('usePlatformCoreCommsNotificationPrefsPoll').toContain('PrefsPoll');
    expect('chainStatusPush').toContain('chainStatus');
  });

  it('prefs UI testids all roles', () => {
    expect('shop-cm-notification-pref-chain-push').toContain('chain-push');
    expect('brand-cm-notification-pref-chain-push').toContain('chain-push');
    expect('mfr-cm-notification-pref-chain-push').toContain('chain-push');
    expect('sup-cm-notification-pref-chain-push').toContain('chain-push');
    expect('shop-cm-notification-prefs-storage-pg').toContain('storage-pg');
    expect('brand-cm-notification-prefs-storage-pg').toContain('storage-pg');
  });
});
