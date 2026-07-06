import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type {
  ShopRepOfflineDraft,
  ShopRepOfflineDraftsConfig,
} from '@/lib/shop/shop-rep-offline-drafts-store.types';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';
import { shouldUseShopRepOfflineDraftsFileMemoryFallback } from '@/lib/production/workshop2-pg-read-path-policy';

const memory = new Map<string, ShopRepOfflineDraftsConfig>();
const STORE_FILE = path.join(process.cwd(), 'data', 'shop-rep-offline-drafts.json');
let fileHydrated = false;
let pgAvailable = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as ShopRepOfflineDraftsConfig[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        if (row.repId) memory.set(row.repId.trim(), row);
      }
    }
  } catch {
    /* ignore */
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

async function readDraftsFromPg(repId: string): Promise<ShopRepOfflineDraft[] | null> {
  if (!isWorkshop2PostgresEnabled()) return null;
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{ drafts_json: ShopRepOfflineDraft[] }>(
    `SELECT drafts_json FROM shop_rep_offline_drafts WHERE rep_id = $1`,
    [repId]
  );
  pgAvailable = true;
  const rows = res.rows[0]?.drafts_json;
  return Array.isArray(rows) ? rows : [];
}

async function writeDraftsToPg(repId: string, drafts: ShopRepOfflineDraft[]): Promise<boolean> {
  if (!isWorkshop2PostgresEnabled()) return false;
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO shop_rep_offline_drafts (rep_id, drafts_json, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (rep_id) DO UPDATE SET
       drafts_json = EXCLUDED.drafts_json,
       updated_at = NOW()`,
    [repId, JSON.stringify(drafts)]
  );
  pgAvailable = true;
  return true;
}

export async function getShopRepOfflineDraftsServer(
  repId: string
): Promise<ShopRepOfflineDraftsConfig> {
  const rid = repId.trim() || 'rep-demo';

  if (isWorkshop2PostgresEnabled()) {
    try {
      const drafts = (await readDraftsFromPg(rid)) ?? [];
      const config: ShopRepOfflineDraftsConfig = {
        repId: rid,
        drafts,
        updatedAt: new Date().toISOString(),
      };
      memory.set(rid, config);
      return config;
    } catch {
      pgAvailable = false;
    }
  }

  if (isWorkshop2PgOnlyMode() || !shouldUseShopRepOfflineDraftsFileMemoryFallback()) {
    return { repId: rid, drafts: [], updatedAt: new Date().toISOString() };
  }

  hydrateFileIfNeeded();
  return (
    memory.get(rid) ?? {
      repId: rid,
      drafts: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function appendShopRepOfflineDraftServer(input: {
  repId: string;
  draft: ShopRepOfflineDraft;
}): Promise<ShopRepOfflineDraftsConfig> {
  const repId = input.repId.trim() || 'rep-demo';
  const prev = await getShopRepOfflineDraftsServer(repId);
  const next: ShopRepOfflineDraftsConfig = {
    repId,
    drafts: [...prev.drafts, input.draft],
    updatedAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    try {
      await writeDraftsToPg(repId, next.drafts);
      memory.set(repId, next);
      persistFile();
      return next;
    } catch {
      pgAvailable = false;
    }
  }

  if (isWorkshop2PgOnlyMode() || !shouldUseShopRepOfflineDraftsFileMemoryFallback()) {
    return { repId, drafts: [], updatedAt: new Date().toISOString() };
  }

  hydrateFileIfNeeded();
  memory.set(repId, next);
  persistFile();
  return next;
}

export function shopRepOfflineDraftsStorageMode(): 'postgres' | 'file' | 'memory' | 'unavailable' {
  if ((isWorkshop2PgOnlyMode() || !shouldUseShopRepOfflineDraftsFileMemoryFallback()) && !pgAvailable) {
    return 'unavailable';
  }
  if (pgAvailable && isWorkshop2PostgresEnabled()) return 'postgres';
  if (isWorkshop2PostgresEnabled() && !pgAvailable) return 'unavailable';
  if (!shouldUseShopRepOfflineDraftsFileMemoryFallback()) return 'unavailable';
  if (canUseDiskPersistence() && (fs.existsSync(STORE_FILE) || memory.size > 0)) return 'file';
  return 'memory';
}
