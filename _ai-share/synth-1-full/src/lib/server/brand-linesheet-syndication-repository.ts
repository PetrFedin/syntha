import 'server-only';

import { randomUUID } from 'node:crypto';

import fs from 'node:fs';
import path from 'node:path';

import type {
  BrandLinesheetSyndicateResult,
  BrandLinesheetSyndicateSource,
  BrandLinesheetUnpublishRollbackSnapshot,
} from '@/lib/production/brand-linesheet-syndication';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const syndicationMemory: BrandLinesheetSyndicateResult[] = [];
const rollbackMemory: BrandLinesheetUnpublishRollbackSnapshot[] = [];
const ingestMemory: Array<{
  id: string;
  buyerId: string;
  collectionId: string;
  articleIds: string[];
  source: string;
  createdAt: string;
}> = [];

const SYNDICATION_FILE = path.join(
  process.cwd(),
  'data',
  'brand-linesheet-syndication-journal.json'
);
const ROLLBACK_FILE = path.join(process.cwd(), 'data', 'brand-linesheet-unpublish-rollback.json');
const INGEST_FILE = path.join(process.cwd(), 'data', 'shop-showroom-auto-ingest-journal.json');

let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (fs.existsSync(SYNDICATION_FILE)) {
      const parsed = JSON.parse(
        fs.readFileSync(SYNDICATION_FILE, 'utf8')
      ) as BrandLinesheetSyndicateResult[];
      if (Array.isArray(parsed)) syndicationMemory.splice(0, syndicationMemory.length, ...parsed);
    }
    if (fs.existsSync(ROLLBACK_FILE)) {
      const parsed = JSON.parse(
        fs.readFileSync(ROLLBACK_FILE, 'utf8')
      ) as BrandLinesheetUnpublishRollbackSnapshot[];
      if (Array.isArray(parsed)) rollbackMemory.splice(0, rollbackMemory.length, ...parsed);
    }
    if (fs.existsSync(INGEST_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(INGEST_FILE, 'utf8')) as typeof ingestMemory;
      if (Array.isArray(parsed)) ingestMemory.splice(0, ingestMemory.length, ...parsed);
    }
  } catch {
    /* ignore */
  }
}

function persistSyndicationFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(SYNDICATION_FILE), { recursive: true });
    fs.writeFileSync(SYNDICATION_FILE, JSON.stringify(syndicationMemory.slice(-40), null, 2));
  } catch {
    /* best effort */
  }
}

function persistRollbackFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(ROLLBACK_FILE), { recursive: true });
    fs.writeFileSync(ROLLBACK_FILE, JSON.stringify(rollbackMemory.slice(-20), null, 2));
  } catch {
    /* best effort */
  }
}

function persistIngestFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(INGEST_FILE), { recursive: true });
    fs.writeFileSync(INGEST_FILE, JSON.stringify(ingestMemory.slice(-40), null, 2));
  } catch {
    /* best effort */
  }
}

export function brandLinesheetSyndicationStorageMode(): 'postgres' | 'file' | 'memory' {
  if (isWorkshop2PostgresEnabled()) return 'postgres';
  if (canUseDiskPersistence() && fs.existsSync(SYNDICATION_FILE)) return 'file';
  return 'memory';
}

export async function appendBrandLinesheetSyndicationJournal(input: {
  collectionId: string;
  articleIds: string[];
  shopBuyerId: string;
  ingestedCount: number;
  source: BrandLinesheetSyndicateSource;
  messageRu: string;
}): Promise<BrandLinesheetSyndicateResult & { id: string }> {
  hydrateFileIfNeeded();
  const row: BrandLinesheetSyndicateResult & { id: string } = {
    id: `syn-${randomUUID().slice(0, 12)}`,
    syndicatedAt: new Date().toISOString(),
    collectionId: input.collectionId.trim(),
    articleIds: [...new Set(input.articleIds.map((id) => id.trim()).filter(Boolean))],
    ingestedCount: input.ingestedCount,
    shopBuyerId: input.shopBuyerId.trim() || 'shop1',
    source: input.source,
    messageRu: input.messageRu.trim(),
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_linesheet_syndication_journal
         (id, collection_id, article_ids, shop_buyer_id, ingested_count, source, message_ru, created_at)
       VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7,$8::timestamptz)`,
      [
        row.id,
        row.collectionId,
        JSON.stringify(row.articleIds),
        row.shopBuyerId,
        row.ingestedCount,
        row.source,
        row.messageRu,
        row.syndicatedAt,
      ]
    );
    return row;
  }

  syndicationMemory.push(row);
  persistSyndicationFile();
  return row;
}

export async function listBrandLinesheetSyndicationJournal(
  collectionId: string,
  limit = 10
): Promise<BrandLinesheetSyndicateResult[]> {
  hydrateFileIfNeeded();
  const cid = collectionId.trim();
  const cap = Math.min(Math.max(limit, 1), 24);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      id: string;
      collection_id: string;
      article_ids: string[];
      shop_buyer_id: string;
      ingested_count: number;
      source: string;
      message_ru: string | null;
      created_at: Date;
    }>(
      `SELECT id, collection_id, article_ids, shop_buyer_id, ingested_count, source, message_ru, created_at
       FROM brand_linesheet_syndication_journal
       WHERE collection_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [cid, cap]
    );
    return res.rows.map((r) => ({
      syndicatedAt: r.created_at.toISOString(),
      collectionId: r.collection_id,
      articleIds: Array.isArray(r.article_ids) ? r.article_ids.map(String) : [],
      ingestedCount: r.ingested_count,
      shopBuyerId: r.shop_buyer_id,
      source: r.source as BrandLinesheetSyndicateSource,
      messageRu: r.message_ru ?? '',
    }));
  }

  return syndicationMemory
    .filter((e) => e.collectionId === cid)
    .slice(-cap)
    .reverse();
}

export async function saveBrandLinesheetUnpublishRollbackSnapshot(input: {
  collectionId: string;
  articleIds: string[];
}): Promise<BrandLinesheetUnpublishRollbackSnapshot> {
  hydrateFileIfNeeded();
  const snapshot: BrandLinesheetUnpublishRollbackSnapshot = {
    snapshotId: `rb-${randomUUID().slice(0, 12)}`,
    collectionId: input.collectionId.trim(),
    articleIds: [...new Set(input.articleIds.map((id) => id.trim()).filter(Boolean))],
    createdAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_linesheet_unpublish_rollback_snapshots
         (id, collection_id, article_ids, created_at)
       VALUES ($1,$2,$3::jsonb,$4::timestamptz)`,
      [
        snapshot.snapshotId,
        snapshot.collectionId,
        JSON.stringify(snapshot.articleIds),
        snapshot.createdAt,
      ]
    );
    return snapshot;
  }

  rollbackMemory.push(snapshot);
  persistRollbackFile();
  return snapshot;
}

export async function getLatestBrandLinesheetUnpublishRollbackSnapshot(
  collectionId: string
): Promise<BrandLinesheetUnpublishRollbackSnapshot | null> {
  hydrateFileIfNeeded();
  const cid = collectionId.trim();

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      id: string;
      collection_id: string;
      article_ids: string[];
      rolled_back_at: Date | null;
      created_at: Date;
    }>(
      `SELECT id, collection_id, article_ids, rolled_back_at, created_at
       FROM brand_linesheet_unpublish_rollback_snapshots
       WHERE collection_id = $1 AND rolled_back_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [cid]
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      snapshotId: row.id,
      collectionId: row.collection_id,
      articleIds: Array.isArray(row.article_ids) ? row.article_ids.map(String) : [],
      createdAt: row.created_at.toISOString(),
      rolledBackAt: row.rolled_back_at?.toISOString(),
    };
  }

  const latest = [...rollbackMemory]
    .reverse()
    .find((s) => s.collectionId === cid && !s.rolledBackAt);
  return latest ?? null;
}

export async function markBrandLinesheetUnpublishRollbackApplied(
  snapshotId: string
): Promise<void> {
  hydrateFileIfNeeded();
  const at = new Date().toISOString();

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `UPDATE brand_linesheet_unpublish_rollback_snapshots
       SET rolled_back_at = $2::timestamptz
       WHERE id = $1`,
      [snapshotId.trim(), at]
    );
    return;
  }

  const idx = rollbackMemory.findIndex((s) => s.snapshotId === snapshotId);
  if (idx >= 0) rollbackMemory[idx] = { ...rollbackMemory[idx], rolledBackAt: at };
  persistRollbackFile();
}

export async function appendShopShowroomAutoIngestJournal(input: {
  buyerId: string;
  collectionId: string;
  articleIds: string[];
  source?: string;
}): Promise<{ id: string; ingestedCount: number }> {
  hydrateFileIfNeeded();
  const articleIds = [...new Set(input.articleIds.map((id) => id.trim()).filter(Boolean))];
  const row = {
    id: `ing-${randomUUID().slice(0, 12)}`,
    buyerId: input.buyerId.trim() || 'shop1',
    collectionId: input.collectionId.trim(),
    articleIds,
    source: input.source?.trim() || 'linesheet_syndicate',
    createdAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO shop_showroom_auto_ingest_journal
         (id, buyer_id, collection_id, article_ids, source, created_at)
       VALUES ($1,$2,$3,$4::jsonb,$5,$6::timestamptz)`,
      [
        row.id,
        row.buyerId,
        row.collectionId,
        JSON.stringify(row.articleIds),
        row.source,
        row.createdAt,
      ]
    );
    return { id: row.id, ingestedCount: articleIds.length };
  }

  ingestMemory.push(row);
  persistIngestFile();
  return { id: row.id, ingestedCount: articleIds.length };
}

export async function listShopShowroomAutoIngestJournal(input: {
  buyerId: string;
  collectionId?: string;
  limit?: number;
}): Promise<Array<{ id: string; collectionId: string; articleIds: string[]; createdAt: string }>> {
  hydrateFileIfNeeded();
  const buyerId = input.buyerId.trim() || 'shop1';
  const collectionId = input.collectionId?.trim();
  const limit = Math.min(Math.max(input.limit ?? 8, 1), 24);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const conditions = ['buyer_id = $1'];
    const params: unknown[] = [buyerId];
    if (collectionId) {
      params.push(collectionId);
      conditions.push(`collection_id = $${params.length}`);
    }
    params.push(limit);
    const res = await getWorkshop2PgPool().query<{
      id: string;
      collection_id: string;
      article_ids: string[];
      created_at: Date;
    }>(
      `SELECT id, collection_id, article_ids, created_at
       FROM shop_showroom_auto_ingest_journal
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${params.length}`,
      params
    );
    return res.rows.map((r) => ({
      id: r.id,
      collectionId: r.collection_id,
      articleIds: Array.isArray(r.article_ids) ? r.article_ids.map(String) : [],
      createdAt: r.created_at.toISOString(),
    }));
  }

  return ingestMemory
    .filter((e) => e.buyerId === buyerId)
    .filter((e) => !collectionId || e.collectionId === collectionId)
    .slice(-limit)
    .reverse()
    .map((e) => ({
      id: e.id,
      collectionId: e.collectionId,
      articleIds: e.articleIds,
      createdAt: e.createdAt,
    }));
}
