import 'server-only';

import type { PlatformCoreCommsNotificationPrefs } from '@/lib/platform-core-comms-notification-prefs';
import {
  getPlatformCoreCommsNotificationPrefsServer,
  platformCoreCommsNotificationPrefsStorageMode,
  putPlatformCoreCommsNotificationPrefsServer,
} from '@/lib/server/platform-core-comms-notification-prefs-server';

export function shopCommsNotificationPrefsStorageMode(): 'postgres' | 'file' | 'memory' {
  return platformCoreCommsNotificationPrefsStorageMode();
}

export async function getShopCommsNotificationPrefsServer(buyerId: string): Promise<{
  prefs: PlatformCoreCommsNotificationPrefs;
  storageMode: 'postgres' | 'file' | 'memory';
}> {
  return getPlatformCoreCommsNotificationPrefsServer({
    role: 'shop',
    scopeKey: buyerId.trim() || 'shop1',
  });
}

export async function putShopCommsNotificationPrefsServer(
  buyerId: string,
  prefs: PlatformCoreCommsNotificationPrefs
): Promise<{ ok: true; storageMode: 'postgres' | 'file' | 'memory' }> {
  return putPlatformCoreCommsNotificationPrefsServer({
    role: 'shop',
    scopeKey: buyerId.trim() || 'shop1',
    prefs,
  });
}
