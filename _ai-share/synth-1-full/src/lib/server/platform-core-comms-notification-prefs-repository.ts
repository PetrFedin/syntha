import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { PlatformCoreCommsNotificationPrefs } from '@/lib/platform-core-comms-notification-prefs';
import { DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS } from '@/lib/platform-core-comms-notification-prefs';

export type PlatformCoreCommsNotificationPrefsConfig = {
  shopId: string;
  prefs: PlatformCoreCommsNotificationPrefs;
  updatedAt: string;
};

const memory = new Map<string, PlatformCoreCommsNotificationPrefsConfig>();
const STORE_FILE = path.join(process.cwd(), 'data', 'platform-core-comms-notification-prefs.json');
let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as PlatformCoreCommsNotificationPrefsConfig[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        if (row.shopId) memory.set(row.shopId.trim(), row);
      }
    }
  } catch {
    /* ignore corrupt file */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify([...memory.values()], null, 2));
  } catch {
    /* best effort */
  }
}

export async function getPlatformCoreCommsNotificationPrefsServer(
  shopId: string
): Promise<PlatformCoreCommsNotificationPrefsConfig> {
  const sid = shopId.trim() || 'shop1';
  hydrateFileIfNeeded();
  return (
    memory.get(sid) ?? {
      shopId: sid,
      prefs: { ...DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS },
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function savePlatformCoreCommsNotificationPrefsServer(input: {
  shopId: string;
  prefs: PlatformCoreCommsNotificationPrefs;
}): Promise<PlatformCoreCommsNotificationPrefsConfig> {
  const shopId = input.shopId.trim() || 'shop1';
  hydrateFileIfNeeded();
  const next: PlatformCoreCommsNotificationPrefsConfig = {
    shopId,
    prefs: {
      orderStatus: input.prefs.orderStatus !== false,
      chatMessages: input.prefs.chatMessages !== false,
      calendarReminders: input.prefs.calendarReminders !== false,
      chainStatusPush: input.prefs.chainStatusPush !== false,
    },
    updatedAt: new Date().toISOString(),
  };
  memory.set(shopId, next);
  persistFile();
  return next;
}

export function platformCoreCommsNotificationPrefsStorageMode(): 'file' | 'memory' {
  if (canUseDiskPersistence() && fs.existsSync(STORE_FILE)) return 'file';
  if (canUseDiskPersistence() && memory.size > 0) return 'file';
  return 'memory';
}
