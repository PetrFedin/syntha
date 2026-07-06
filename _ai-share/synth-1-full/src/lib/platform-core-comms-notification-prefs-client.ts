import type {
  PlatformCoreCommsNotificationPrefs,
  PlatformCoreCommsNotificationRole,
} from '@/lib/platform-core-comms-notification-prefs';

function buildPrefsUrl(role: PlatformCoreCommsNotificationRole, scopeKey?: string): string {
  const sp = new URLSearchParams({ role });
  if (scopeKey?.trim()) sp.set('scopeKey', scopeKey.trim());
  return `/api/platform-core/comms/notification-prefs?${sp.toString()}`;
}

export async function fetchPlatformCoreCommsNotificationPrefs(input: {
  role: PlatformCoreCommsNotificationRole;
  scopeKey?: string;
}): Promise<{
  prefs: PlatformCoreCommsNotificationPrefs;
  storageMode?: string;
}> {
  const res = await fetch(buildPrefsUrl(input.role, input.scopeKey), { cache: 'no-store' });
  if (!res.ok) throw new Error('prefs_fetch_failed');
  const json = (await res.json()) as {
    ok?: boolean;
    prefs?: PlatformCoreCommsNotificationPrefs;
    storageMode?: string;
  };
  if (!json.ok || !json.prefs) throw new Error('prefs_invalid');
  return { prefs: json.prefs, storageMode: json.storageMode };
}

export async function savePlatformCoreCommsNotificationPrefs(input: {
  role: PlatformCoreCommsNotificationRole;
  scopeKey?: string;
  prefs: PlatformCoreCommsNotificationPrefs;
}): Promise<{ storageMode?: string }> {
  const sp = new URLSearchParams({ role: input.role });
  if (input.scopeKey?.trim()) sp.set('scopeKey', input.scopeKey.trim());
  const res = await fetch(`/api/platform-core/comms/notification-prefs?${sp.toString()}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefs: input.prefs }),
  });
  if (!res.ok) throw new Error('prefs_save_failed');
  const json = (await res.json()) as { ok?: boolean; storageMode?: string };
  return { storageMode: json.storageMode };
}

/** @deprecated use fetchPlatformCoreCommsNotificationPrefs({ role: 'shop' }) */
export async function fetchShopCommsNotificationPrefs(): Promise<{
  prefs: PlatformCoreCommsNotificationPrefs;
  storageMode?: string;
}> {
  return fetchPlatformCoreCommsNotificationPrefs({ role: 'shop' });
}

/** @deprecated use savePlatformCoreCommsNotificationPrefs */
export async function saveShopCommsNotificationPrefs(
  prefs: PlatformCoreCommsNotificationPrefs
): Promise<{ storageMode?: string }> {
  return savePlatformCoreCommsNotificationPrefs({ role: 'shop', prefs });
}
