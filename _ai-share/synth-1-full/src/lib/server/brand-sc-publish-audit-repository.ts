import 'server-only';

import { randomUUID } from 'node:crypto';

import fs from 'node:fs';
import path from 'node:path';

import type {
  BrandScPublishAuditEntry,
  BrandScPublishAuditEventType,
} from '@/lib/production/brand-sc-publish-audit';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const memoryJournal: BrandScPublishAuditEntry[] = [];
const JOURNAL_FILE = path.join(process.cwd(), 'data', 'brand-sc-publish-audit-journal.json');

let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(JOURNAL_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(JOURNAL_FILE, 'utf8')) as BrandScPublishAuditEntry[];
    if (Array.isArray(parsed)) memoryJournal.splice(0, memoryJournal.length, ...parsed);
  } catch {
    /* ignore */
  }
}

function persistJournalFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(JOURNAL_FILE), { recursive: true });
    fs.writeFileSync(JOURNAL_FILE, JSON.stringify(memoryJournal.slice(-80), null, 2));
  } catch {
    /* best effort */
  }
}

export function brandScPublishAuditStorageMode(): 'postgres' | 'file' | 'memory' {
  if (isWorkshop2PostgresEnabled()) return 'postgres';
  if (canUseDiskPersistence() && fs.existsSync(JOURNAL_FILE)) return 'file';
  return 'memory';
}

export async function appendBrandScPublishAuditJournal(input: {
  collectionId: string;
  articleId: string;
  source?: string;
  campaignName?: string;
  payload?: Record<string, unknown>;
  organizationId?: string;
  eventType?: BrandScPublishAuditEventType | string;
}): Promise<BrandScPublishAuditEntry> {
  hydrateFileIfNeeded();
  const row: BrandScPublishAuditEntry = {
    id: `pub-${randomUUID().slice(0, 12)}`,
    collectionId: input.collectionId.trim(),
    articleId: input.articleId.trim(),
    eventType: input.eventType ?? 'showroom.published',
    source: input.source?.trim() || 'showroom_publish',
    campaignName: input.campaignName?.trim() || undefined,
    payload: input.payload ?? {},
    organizationId: input.organizationId?.trim() || 'org-brand-001',
    createdAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_sc_publish_audit_journal
         (id, collection_id, article_id, event_type, source, campaign_name, payload, organization_id, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::timestamptz)`,
      [
        row.id,
        row.collectionId,
        row.articleId,
        row.eventType,
        row.source,
        row.campaignName ?? null,
        JSON.stringify(row.payload),
        row.organizationId,
        row.createdAt,
      ]
    );
    return row;
  }

  memoryJournal.push(row);
  persistJournalFile();
  return row;
}

export async function listBrandScPublishAuditJournalForCollection(
  collectionId: string,
  limit = 20
): Promise<BrandScPublishAuditEntry[]> {
  hydrateFileIfNeeded();
  const cid = collectionId.trim();
  const cap = Math.min(Math.max(limit, 1), 200);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      id: string;
      collection_id: string;
      article_id: string;
      event_type: string;
      source: string;
      campaign_name: string | null;
      payload: Record<string, unknown>;
      organization_id: string;
      created_at: Date;
    }>(
      `SELECT id, collection_id, article_id, event_type, source, campaign_name, payload, organization_id, created_at
       FROM brand_sc_publish_audit_journal
       WHERE collection_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [cid, cap]
    );
    return res.rows.map((r) => ({
      id: r.id,
      collectionId: r.collection_id,
      articleId: r.article_id,
      eventType: r.event_type,
      source: r.source,
      campaignName: r.campaign_name ?? undefined,
      payload: r.payload ?? {},
      organizationId: r.organization_id,
      createdAt: r.created_at.toISOString(),
    }));
  }

  return memoryJournal
    .filter((r) => r.collectionId === cid)
    .slice(-cap)
    .reverse();
}

export function clearBrandScPublishAuditJournalMemoryForTests(): void {
  memoryJournal.splice(0, memoryJournal.length);
  fileHydrated = true;
}
