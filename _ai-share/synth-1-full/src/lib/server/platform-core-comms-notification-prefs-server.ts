import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { PlatformCoreCommsNotificationPrefs } from '@/lib/platform-core-comms-notification-prefs';
import { DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS } from '@/lib/platform-core-comms-notification-prefs';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type PlatformCoreCommsNotificationRole = 'shop' | 'brand' | 'manufacturer' | 'supplier';

const STORE_FILE = path.join(process.cwd(), 'data', 'platform-core-comms-notification-prefs.json');
const memory = new Map<string, PlatformCoreCommsNotificationPrefs>();

function prefsKey(role: PlatformCoreCommsNotificationRole, scopeKey: string): string {
  return `${role}::${scopeKey.trim() || 'default'}`;
}

export function normalizePlatformCoreCommsNotificationPrefs(
  raw: Partial<PlatformCoreCommsNotificationPrefs> | null | undefined
): PlatformCoreCommsNotificationPrefs {
  return {
    orderStatus: raw?.orderStatus !== false,
    chatMessages: raw?.chatMessages !== false,
    calendarReminders: raw?.calendarReminders !== false,
    chainStatusPush: raw?.chainStatusPush !== false,
  };
}

function hydrateFile(): void {
  if (process.env.NODE_ENV === 'test') return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as Record<
      string,
      PlatformCoreCommsNotificationPrefs
    >;
    for (const [key, prefs] of Object.entries(parsed)) {
      memory.set(key, normalizePlatformCoreCommsNotificationPrefs(prefs));
    }
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (process.env.NODE_ENV === 'test') return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(Object.fromEntries(memory.entries()), null, 2));
  } catch {
    /* ignore */
  }
}

export function platformCoreCommsNotificationPrefsStorageMode(): 'postgres' | 'file' | 'memory' {
  if (isWorkshop2PostgresEnabled()) return 'postgres';
  if (process.env.NODE_ENV === 'test') return 'memory';
  return 'file';
}

export async function getPlatformCoreCommsNotificationPrefsServer(input: {
  role: PlatformCoreCommsNotificationRole;
  scopeKey: string;
}): Promise<{
  prefs: PlatformCoreCommsNotificationPrefs;
  storageMode: 'postgres' | 'file' | 'memory';
}> {
  const role = input.role;
  const scope = input.scopeKey.trim() || (role === 'shop' ? 'shop1' : 'org-brand-001');
  const key = prefsKey(role, scope);

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        order_status: boolean;
        chat_messages: boolean;
        calendar_reminders: boolean;
        chain_status_push: boolean;
      }>(
        `SELECT order_status, chat_messages, calendar_reminders, chain_status_push
         FROM platform_core_comms_notification_prefs WHERE role = $1 AND scope_key = $2`,
        [role, scope]
      );
      const row = res.rows[0];
      if (row) {
        return {
          prefs: normalizePlatformCoreCommsNotificationPrefs({
            orderStatus: row.order_status,
            chatMessages: row.chat_messages,
            calendarReminders: row.calendar_reminders,
            chainStatusPush: row.chain_status_push,
          }),
          storageMode: 'postgres',
        };
      }
    } catch {
      /* fall through */
    }
  }

  hydrateFile();
  return {
    prefs: memory.get(key) ?? DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS,
    storageMode: platformCoreCommsNotificationPrefsStorageMode(),
  };
}

export async function putPlatformCoreCommsNotificationPrefsServer(input: {
  role: PlatformCoreCommsNotificationRole;
  scopeKey: string;
  prefs: PlatformCoreCommsNotificationPrefs;
}): Promise<{ ok: true; storageMode: 'postgres' | 'file' | 'memory' }> {
  const role = input.role;
  const scope = input.scopeKey.trim() || (role === 'shop' ? 'shop1' : 'org-brand-001');
  const key = prefsKey(role, scope);
  const normalized = normalizePlatformCoreCommsNotificationPrefs(input.prefs);

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `INSERT INTO platform_core_comms_notification_prefs
           (role, scope_key, order_status, chat_messages, calendar_reminders, chain_status_push, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (role, scope_key) DO UPDATE SET
           order_status = EXCLUDED.order_status,
           chat_messages = EXCLUDED.chat_messages,
           calendar_reminders = EXCLUDED.calendar_reminders,
           chain_status_push = EXCLUDED.chain_status_push,
           updated_at = NOW()`,
        [
          role,
          scope,
          normalized.orderStatus,
          normalized.chatMessages,
          normalized.calendarReminders,
          normalized.chainStatusPush,
        ]
      );
      return { ok: true, storageMode: 'postgres' };
    } catch {
      /* fall through */
    }
  }

  memory.set(key, normalized);
  persistFile();
  return { ok: true, storageMode: platformCoreCommsNotificationPrefsStorageMode() };
}
