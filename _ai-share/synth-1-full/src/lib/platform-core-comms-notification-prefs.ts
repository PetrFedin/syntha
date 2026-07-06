/** Comms prefs — PG API по role×scope; LS только вне core (Wave SH / SW). */

import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

export type PlatformCoreCommsNotificationPrefs = {
  orderStatus: boolean;
  chatMessages: boolean;
  calendarReminders: boolean;
  chainStatusPush: boolean;
};

export type PlatformCoreCommsNotificationRole = 'shop' | 'brand' | 'manufacturer' | 'supplier';

export function platformCoreCommsNotificationPrefsStorageKey(
  role: PlatformCoreCommsNotificationRole
): string {
  return `platform-core:${role}-comms-notification-prefs`;
}

export const DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS: PlatformCoreCommsNotificationPrefs =
  {
    orderStatus: true,
    chatMessages: true,
    calendarReminders: true,
    chainStatusPush: true,
  };

/** @deprecated use platformCoreCommsNotificationPrefsStorageKey('shop') */
export const PLATFORM_CORE_SHOP_COMMS_NOTIFICATION_PREFS_KEY =
  platformCoreCommsNotificationPrefsStorageKey('shop');

export function readPlatformCoreCommsNotificationPrefs(
  role: PlatformCoreCommsNotificationRole = 'shop'
): PlatformCoreCommsNotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS;
  if (!shouldUseLocalStorageClientFallbackInCore()) return DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS;
  try {
    const raw = localStorage.getItem(platformCoreCommsNotificationPrefsStorageKey(role));
    if (!raw) return DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS;
    const parsed = JSON.parse(raw) as Partial<PlatformCoreCommsNotificationPrefs>;
    return {
      orderStatus: parsed.orderStatus !== false,
      chatMessages: parsed.chatMessages !== false,
      calendarReminders: parsed.calendarReminders !== false,
      chainStatusPush: parsed.chainStatusPush !== false,
    };
  } catch {
    return DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS;
  }
}

export function writePlatformCoreCommsNotificationPrefs(
  prefs: PlatformCoreCommsNotificationPrefs,
  role: PlatformCoreCommsNotificationRole = 'shop'
): void {
  if (typeof window === 'undefined') return;
  if (!shouldMirrorPgClientStoreToLocalStorage()) return;
  try {
    localStorage.setItem(platformCoreCommsNotificationPrefsStorageKey(role), JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

/** PG/file API с fallback на localStorage (S2/S4). */
export async function loadPlatformCoreCommsNotificationPrefs(input?: {
  role?: PlatformCoreCommsNotificationRole;
  scopeKey?: string;
}): Promise<{
  prefs: PlatformCoreCommsNotificationPrefs;
  storageMode?: string;
}> {
  const role = input?.role ?? 'shop';
  if (typeof window === 'undefined') {
    return { prefs: DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS };
  }
  try {
    const { fetchPlatformCoreCommsNotificationPrefs } = await import(
      '@/lib/platform-core-comms-notification-prefs-client'
    );
    const remote = await fetchPlatformCoreCommsNotificationPrefs({ role, scopeKey: input?.scopeKey });
    if (shouldMirrorPgClientStoreToLocalStorage()) {
      writePlatformCoreCommsNotificationPrefs(remote.prefs, role);
    }
    return remote;
  } catch {
    if (!shouldUseLocalStorageClientFallbackInCore()) {
      return { prefs: DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS, storageMode: 'unavailable' };
    }
    return { prefs: readPlatformCoreCommsNotificationPrefs(role), storageMode: 'local' };
  }
}

export async function persistPlatformCoreCommsNotificationPrefs(
  prefs: PlatformCoreCommsNotificationPrefs,
  input?: { role?: PlatformCoreCommsNotificationRole; scopeKey?: string }
): Promise<{ storageMode?: string }> {
  const role = input?.role ?? 'shop';
  if (shouldMirrorPgClientStoreToLocalStorage()) {
    writePlatformCoreCommsNotificationPrefs(prefs, role);
  }
  if (typeof window === 'undefined') return {};
  try {
    const { savePlatformCoreCommsNotificationPrefs } = await import(
      '@/lib/platform-core-comms-notification-prefs-client'
    );
    return await savePlatformCoreCommsNotificationPrefs({
      role,
      scopeKey: input?.scopeKey,
      prefs,
    });
  } catch {
    return { storageMode: shouldUseLocalStorageClientFallbackInCore() ? 'local' : 'unavailable' };
  }
}
