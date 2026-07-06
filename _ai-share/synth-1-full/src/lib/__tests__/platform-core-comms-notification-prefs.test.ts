import {
  DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS,
  platformCoreCommsNotificationPrefsStorageKey,
  readPlatformCoreCommsNotificationPrefs,
  writePlatformCoreCommsNotificationPrefs,
} from '@/lib/platform-core-comms-notification-prefs';

describe('platform-core-comms-notification-prefs', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  beforeEach(() => {
    localStorage.clear();
    delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
  });

  afterEach(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
  });

  it('defaults when empty', () => {
    expect(readPlatformCoreCommsNotificationPrefs()).toEqual(
      DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS
    );
  });

  it('round-trips write outside core', () => {
    writePlatformCoreCommsNotificationPrefs({
      orderStatus: false,
      chatMessages: true,
      calendarReminders: false,
      chainStatusPush: false,
    });
    expect(readPlatformCoreCommsNotificationPrefs()).toEqual({
      orderStatus: false,
      chatMessages: true,
      calendarReminders: false,
      chainStatusPush: false,
    });
  });

  it('fail-closed LS read in core mode', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    localStorage.setItem(
      platformCoreCommsNotificationPrefsStorageKey('shop'),
      JSON.stringify({ orderStatus: false, chainStatusPush: false })
    );
    expect(readPlatformCoreCommsNotificationPrefs('shop')).toEqual(
      DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS
    );
  });

  it('fail-closed LS write in core mode', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    writePlatformCoreCommsNotificationPrefs({
      orderStatus: false,
      chatMessages: false,
      calendarReminders: false,
      chainStatusPush: false,
    });
    expect(localStorage.getItem(platformCoreCommsNotificationPrefsStorageKey('shop'))).toBeNull();
  });
});
