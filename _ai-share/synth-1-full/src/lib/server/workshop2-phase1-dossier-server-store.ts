import 'server-only';

import type {
  Workshop2DossierPhase1,
  Workshop2FinalExportSnapshotMeta,
  Workshop2FinalExportSnapshotRecord,
} from '@/lib/production/workshop2-dossier-phase1.types';
import fs from 'node:fs';
import path from 'node:path';
import type { PoolClient } from 'pg';
import { buildWorkshop2FileStoreDemoDossier } from '@/lib/production/workshop2-file-store-demo-bootstrap';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { shouldWorkshop2PersistAuxiliaryJsonToFile } from '@/lib/server/platform-core-pg-primary-file-policy';
import {
  getWorkshop2PgPool,
  isWorkshop2PgConnectionError,
  isWorkshop2PostgresEnabled,
} from '@/lib/server/workshop2-pg-pool';

type Key = `${string}::${string}`;

export type Workshop2ServerDossierRecord = {
  collectionId: string;
  articleId: string;
  version: number;
  updatedAt: string;
  updatedBy?: string;
  dossier: Workshop2DossierPhase1;
};

export type Workshop2ServerDossierEventRecord = {
  id: string;
  collectionId: string;
  articleId: string;
  version: number;
  eventType: string;
  eventPayload: Record<string, unknown>;
  createdAt: string;
  createdBy?: string;
};

export type Workshop2ServerDossierVersionRecord = {
  id: string;
  collectionId: string;
  articleId: string;
  version: number;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
};

/** Только NODE_ENV=test — runtime без in-process Map (file или PG). */
let testFallbackStore: Map<Key, Workshop2ServerDossierRecord> | null = null;
const STORE_FILE_PATH = path.join(process.cwd(), 'data', 'workshop2-phase1-server-store.json');

export function getWorkshop2ServerDossierStoreMode(): 'server_postgres' | 'server_file_persist' {
  return shouldUseWorkshop2ServerDossierPostgres() ? 'server_postgres' : 'server_file_persist';
}

/** Unit-тесты без WORKSHOP2_TEST_USE_PG=1 — file test store, не локальный :5433. */
function shouldUseWorkshop2ServerDossierPostgres(): boolean {
  if (process.env.NODE_ENV === 'test' && process.env.WORKSHOP2_TEST_USE_PG !== '1') {
    return false;
  }
  return isWorkshop2PostgresEnabled();
}

function keyOf(collectionId: string, articleId: string): Key {
  return `${collectionId}::${articleId}`;
}

function shouldBlockFileFallbackInRuntime(): boolean {
  return !shouldWorkshop2PersistAuxiliaryJsonToFile();
}

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test' && !shouldBlockFileFallbackInRuntime();
}

function parseFallbackDossierRecords(raw: unknown): Map<Key, Workshop2ServerDossierRecord> {
  const map = new Map<Key, Workshop2ServerDossierRecord>();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return map;
  for (const [k, v] of Object.entries(raw as Record<string, Workshop2ServerDossierRecord>)) {
    if (!v || typeof v !== 'object') continue;
    if (typeof v.collectionId !== 'string' || typeof v.articleId !== 'string') continue;
    if (typeof v.version !== 'number' || typeof v.updatedAt !== 'string') continue;
    if (!v.dossier || !Array.isArray(v.dossier.assignments)) continue;
    map.set(k as Key, v);
  }
  return map;
}

function readFallbackDossierMap(): Map<Key, Workshop2ServerDossierRecord> {
  if (process.env.NODE_ENV === 'test') {
    return new Map(testFallbackStore ?? []);
  }
  if (!canUseDiskPersistence()) return new Map();
  try {
    if (!fs.existsSync(STORE_FILE_PATH)) return new Map();
    const raw = fs.readFileSync(STORE_FILE_PATH, 'utf8');
    return parseFallbackDossierRecords(JSON.parse(raw) as unknown);
  } catch {
    return new Map();
  }
}

function writeFallbackDossierMap(map: Map<Key, Workshop2ServerDossierRecord>): void {
  if (process.env.NODE_ENV === 'test') {
    testFallbackStore = map;
    return;
  }
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE_PATH), { recursive: true });
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(Object.fromEntries(map), null, 2), 'utf8');
  } catch {
    /* best-effort */
  }
}

/** Wave P — demo SS27 dossier seed в file-store (PG off). */
function ensureWorkshop2FileStoreDemoDossierRecord(
  collectionId: string,
  articleId: string
): Workshop2ServerDossierRecord | null {
  const demo = buildWorkshop2FileStoreDemoDossier({ collectionId, articleId });
  if (!demo) return null;
  const nowIso = new Date().toISOString();
  const next: Workshop2ServerDossierRecord = {
    collectionId,
    articleId,
    version: 1,
    updatedAt: nowIso,
    dossier: demo,
  };
  const map = readFallbackDossierMap();
  map.set(keyOf(collectionId, articleId), next);
  writeFallbackDossierMap(map);
  return next;
}

function getWorkshop2ServerDossierRecordFromFileStore(
  collectionId: string,
  articleId: string
): Workshop2ServerDossierRecord | null {
  const existing = readFallbackDossierMap().get(keyOf(collectionId, articleId)) ?? null;
  if (existing) return existing;
  return ensureWorkshop2FileStoreDemoDossierRecord(collectionId, articleId);
}

export async function getWorkshop2ServerDossierRecord(
  collectionId: string,
  articleId: string
): Promise<Workshop2ServerDossierRecord | null> {
  if (shouldUseWorkshop2ServerDossierPostgres()) {
    try {
      const fromPg = await getWorkshop2ServerDossierRecordFromPg(collectionId, articleId);
      if (fromPg) return fromPg;
    } catch (err) {
      if (!isWorkshop2PgConnectionError(err)) throw err;
    }
  }
  if (shouldBlockFileFallbackInRuntime()) return null;
  return getWorkshop2ServerDossierRecordFromFileStore(collectionId, articleId);
}

/** Снимок досье на конкретной версии (для diff после B2B handoff). */
export async function getWorkshop2ServerDossierAtVersion(
  collectionId: string,
  articleId: string,
  version: number
): Promise<Workshop2DossierPhase1 | null> {
  const targetVersion = Math.max(1, Math.floor(version));
  if (shouldUseWorkshop2ServerDossierPostgres()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ dossier_json: Workshop2DossierPhase1 }>(
      `SELECT dossier_json
       FROM workshop2_dossier_versions
       WHERE collection_id = $1 AND article_id = $2 AND version = $3
       LIMIT 1`,
      [collectionId, articleId, targetVersion]
    );
    const row = res.rows[0];
    if (row?.dossier_json) return row.dossier_json;
  }
  const current = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  if (!current || current.version !== targetVersion) return null;
  return current.dossier;
}

export async function putWorkshop2ServerDossierRecord(input: {
  collectionId: string;
  articleId: string;
  dossier: Workshop2DossierPhase1;
  baseVersion?: number;
  updatedBy?: string;
  /** Reserved for multi-tenant audit (PG). */
  organizationId?: string;
  txMeta?: {
    eventType?: string;
    eventPayload?: Record<string, unknown>;
    finalExportSnapshotRecord?: Workshop2FinalExportSnapshotRecord;
  };
}): Promise<
  | { ok: true; record: Workshop2ServerDossierRecord }
  | { ok: false; error: 'version_conflict'; currentVersion: number }
  | { ok: false; error: 'pg_only_required'; messageRu: string }
> {
  if (shouldUseWorkshop2ServerDossierPostgres()) return putWorkshop2ServerDossierRecordToPg(input);
  if (shouldBlockFileFallbackInRuntime()) {
    return {
      ok: false,
      error: 'pg_only_required',
      messageRu: 'WORKSHOP2_PG_ONLY: досье сохраняется только в PostgreSQL.',
    };
  }
  const nowIso = new Date().toISOString();
  const dossier: Workshop2DossierPhase1 = {
    ...input.dossier,
    updatedAt: input.dossier.updatedAt ?? nowIso,
    ...(input.updatedBy?.trim() ? { updatedBy: input.updatedBy.trim() } : {}),
  };
  const map = readFallbackDossierMap();
  const cur = map.get(keyOf(input.collectionId, input.articleId)) ?? null;
  if (!cur) {
    const next: Workshop2ServerDossierRecord = {
      collectionId: input.collectionId,
      articleId: input.articleId,
      version: 1,
      updatedAt: nowIso,
      updatedBy: input.updatedBy?.trim() || dossier.updatedBy,
      dossier,
    };
    map.set(keyOf(input.collectionId, input.articleId), next);
    writeFallbackDossierMap(map);
    return { ok: true, record: next };
  }
  const expected = input.baseVersion ?? cur.version;
  if (expected !== cur.version) {
    return { ok: false, error: 'version_conflict', currentVersion: cur.version };
  }
  const next: Workshop2ServerDossierRecord = {
    collectionId: input.collectionId,
    articleId: input.articleId,
    version: cur.version + 1,
    updatedAt: nowIso,
    updatedBy: input.updatedBy?.trim() || dossier.updatedBy,
    dossier,
  };
  map.set(keyOf(input.collectionId, input.articleId), next);
  writeFallbackDossierMap(map);
  return { ok: true, record: next };
}

export async function __clearWorkshop2ServerDossierStoreForTests() {
  if (shouldUseWorkshop2ServerDossierPostgres()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      'TRUNCATE TABLE workshop2_dossier_events, workshop2_dossier_versions, workshop2_dossiers, workshop2_dossier_snapshots RESTART IDENTITY'
    );
  }
  testFallbackStore = new Map();
  if (!canUseDiskPersistence()) return;
  try {
    if (fs.existsSync(STORE_FILE_PATH)) fs.unlinkSync(STORE_FILE_PATH);
  } catch {
    // ignore cleanup errors in helper
  }
}

export async function saveWorkshop2FinalExportSnapshotRecord(input: {
  collectionId: string;
  articleId: string;
  snapshot: Workshop2FinalExportSnapshotRecord;
}): Promise<void> {
  if (!shouldUseWorkshop2ServerDossierPostgres()) return;
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_dossier_snapshots
      (collection_id, article_id, snapshot_id, version, created_at, dossier_json)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     ON CONFLICT (collection_id, article_id, snapshot_id)
     DO UPDATE SET version = EXCLUDED.version, created_at = EXCLUDED.created_at, dossier_json = EXCLUDED.dossier_json`,
    [
      input.collectionId,
      input.articleId,
      input.snapshot.snapshotId,
      input.snapshot.dossierVersion,
      input.snapshot.createdAt,
      JSON.stringify(input.snapshot),
    ]
  );
}

export async function getWorkshop2FinalExportSnapshotRecord(input: {
  collectionId: string;
  articleId: string;
  snapshotId: string;
}): Promise<Workshop2FinalExportSnapshotRecord | null> {
  if (shouldUseWorkshop2ServerDossierPostgres()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      dossier_json: Workshop2FinalExportSnapshotRecord;
    }>(
      `SELECT dossier_json
       FROM workshop2_dossier_snapshots
       WHERE collection_id = $1 AND article_id = $2 AND snapshot_id = $3
       LIMIT 1`,
      [input.collectionId, input.articleId, input.snapshotId]
    );
    const row = res.rows[0];
    if (row?.dossier_json) return row.dossier_json;
  }
  const record = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  if (!record) return null;
  return (
    (record.dossier.finalExportSnapshotRecords ?? []).find(
      (s) => s.snapshotId === input.snapshotId
    ) ?? null
  );
}

export async function listWorkshop2FinalExportSnapshotMetas(input: {
  collectionId: string;
  articleId: string;
  limit?: number;
}): Promise<Workshop2FinalExportSnapshotMeta[]> {
  const limit = Math.min(Math.max(Math.floor(input.limit ?? 30), 1), 100);
  if (shouldUseWorkshop2ServerDossierPostgres()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      dossier_json: Workshop2FinalExportSnapshotRecord;
    }>(
      `SELECT dossier_json
       FROM workshop2_dossier_snapshots
       WHERE collection_id = $1 AND article_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [input.collectionId, input.articleId, limit]
    );
    return res.rows
      .map((r) => r.dossier_json)
      .filter(Boolean)
      .map((s) => ({
        snapshotId: s.snapshotId,
        createdAt: s.createdAt,
        createdBy: s.createdBy,
        dossierVersion: s.dossierVersion,
        dossierUpdatedAtSnapshot: s.dossierUpdatedAtSnapshot,
        lifecycleState: s.lifecycleState,
      }));
  }
  const record = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  if (!record) return [];
  return (record.dossier.finalExportSnapshots ?? []).slice(0, limit);
}

export async function getWorkshop2FinalExportSnapshotMeta(input: {
  collectionId: string;
  articleId: string;
  snapshotId: string;
}): Promise<Workshop2FinalExportSnapshotMeta | null> {
  if (shouldUseWorkshop2ServerDossierPostgres()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      dossier_json: Workshop2FinalExportSnapshotRecord;
    }>(
      `SELECT dossier_json
       FROM workshop2_dossier_snapshots
       WHERE collection_id = $1 AND article_id = $2 AND snapshot_id = $3
       LIMIT 1`,
      [input.collectionId, input.articleId, input.snapshotId]
    );
    const row = res.rows[0];
    if (row?.dossier_json) {
      const s = row.dossier_json;
      return {
        snapshotId: s.snapshotId,
        createdAt: s.createdAt,
        createdBy: s.createdBy,
        dossierVersion: s.dossierVersion,
        dossierUpdatedAtSnapshot: s.dossierUpdatedAtSnapshot,
        lifecycleState: s.lifecycleState,
      };
    }
  }
  const record = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  if (!record) return null;
  return (
    (record.dossier.finalExportSnapshots ?? []).find((s) => s.snapshotId === input.snapshotId) ??
    null
  );
}

export async function listWorkshop2DossierEvents(input: {
  collectionId: string;
  articleId: string;
  limit?: number;
  eventType?: string;
  /** Reserved for multi-tenant audit filters (PG). */
  organizationId?: string;
}): Promise<Workshop2ServerDossierEventRecord[]> {
  const limit = Math.min(Math.max(Math.floor(input.limit ?? 40), 1), 200);
  if (shouldUseWorkshop2ServerDossierPostgres()) {
    await ensureWorkshop2PgSchema();
    const hasType = (input.eventType?.trim() ?? '').length > 0;
    const sql = hasType
      ? `SELECT id, collection_id, article_id, version, event_type, event_payload, created_at
         FROM workshop2_dossier_events
         WHERE collection_id = $1 AND article_id = $2 AND event_type = $3
         ORDER BY created_at DESC
         LIMIT $4`
      : `SELECT id, collection_id, article_id, version, event_type, event_payload, created_at
         FROM workshop2_dossier_events
         WHERE collection_id = $1 AND article_id = $2
         ORDER BY created_at DESC
         LIMIT $3`;
    const params = hasType
      ? [input.collectionId, input.articleId, input.eventType!.trim(), limit]
      : [input.collectionId, input.articleId, limit];
    const res = await getWorkshop2PgPool().query<{
      id: number;
      collection_id: string;
      article_id: string;
      version: number;
      event_type: string;
      event_payload: Record<string, unknown>;
      created_at: Date;
    }>(sql, params);
    return res.rows.map((r) => ({
      id: String(r.id),
      collectionId: r.collection_id,
      articleId: r.article_id,
      version: r.version,
      eventType: r.event_type,
      eventPayload: r.event_payload ?? {},
      createdAt: r.created_at.toISOString(),
    }));
  }
  const record = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  if (!record) return [];
  const typeFilter = (input.eventType ?? '').trim();
  const rows = (record.dossier.tzActionLog ?? []).map((e, idx) => ({
    id: e.entryId || `legacy-${idx + 1}`,
    collectionId: input.collectionId,
    articleId: input.articleId,
    version: record.version,
    eventType: `legacy_${e.action.type}`,
    eventPayload: { by: e.by, at: e.at, action: e.action },
    createdAt: e.at || record.updatedAt,
  }));
  const filtered = typeFilter ? rows.filter((r) => r.eventType === typeFilter) : rows;
  return filtered.slice(0, limit);
}

/** Append-only audit event (PG) или synthetic id в file-fallback. */
export async function appendWorkshop2ServerDossierEvent(input: {
  collectionId: string;
  articleId: string;
  eventType: string;
  eventPayload?: Record<string, unknown>;
  organizationId?: string;
  createdBy?: string;
}): Promise<
  | { ok: true; record: Workshop2ServerDossierEventRecord }
  | { ok: false; error: 'not_found' | 'invalid_event' }
> {
  const eventType = input.eventType.trim();
  if (!eventType) return { ok: false, error: 'invalid_event' };

  const dossierRecord = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  if (!dossierRecord) return { ok: false, error: 'not_found' };

  const nowIso = new Date().toISOString();
  const eventPayload: Record<string, unknown> = {
    ...(input.eventPayload ?? {}),
    ...(input.createdBy ? { createdBy: input.createdBy } : {}),
    ...(input.organizationId ? { organizationId: input.organizationId } : {}),
  };

  if (shouldUseWorkshop2ServerDossierPostgres()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ id: number; created_at: Date }>(
      `INSERT INTO workshop2_dossier_events (collection_id, article_id, version, event_type, event_payload)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id, created_at`,
      [
        input.collectionId,
        input.articleId,
        dossierRecord.version,
        eventType,
        JSON.stringify({ updatedAt: nowIso, ...eventPayload }),
      ]
    );
    const row = res.rows[0]!;
    return {
      ok: true,
      record: {
        id: String(row.id),
        collectionId: input.collectionId,
        articleId: input.articleId,
        version: dossierRecord.version,
        eventType,
        eventPayload,
        createdAt: row.created_at.toISOString(),
        createdBy: input.createdBy,
      },
    };
  }

  return {
    ok: true,
    record: {
      id: `file-evt-${Date.now()}`,
      collectionId: input.collectionId,
      articleId: input.articleId,
      version: dossierRecord.version,
      eventType,
      eventPayload,
      createdAt: nowIso,
      createdBy: input.createdBy,
    },
  };
}

export async function listWorkshop2DossierVersions(input: {
  collectionId: string;
  articleId: string;
  limit?: number;
}): Promise<Workshop2ServerDossierVersionRecord[]> {
  const limit = Math.min(Math.max(Math.floor(input.limit ?? 40), 1), 200);
  if (shouldUseWorkshop2ServerDossierPostgres()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      id: number;
      collection_id: string;
      article_id: string;
      version: number;
      created_at: Date;
      dossier_json: Workshop2DossierPhase1;
    }>(
      `SELECT id, collection_id, article_id, version, created_at, dossier_json
       FROM workshop2_dossier_versions
       WHERE collection_id = $1 AND article_id = $2
       ORDER BY version DESC
       LIMIT $3`,
      [input.collectionId, input.articleId, limit]
    );
    return res.rows.map((r) => ({
      id: String(r.id),
      collectionId: r.collection_id,
      articleId: r.article_id,
      version: r.version,
      createdAt: r.created_at.toISOString(),
      updatedBy: r.dossier_json?.updatedBy,
      updatedAt: r.dossier_json?.updatedAt,
    }));
  }
  const record = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  if (!record) return [];
  return [
    {
      id: `legacy-v${record.version}`,
      collectionId: input.collectionId,
      articleId: input.articleId,
      version: record.version,
      createdAt: record.updatedAt,
      updatedBy: record.dossier.updatedBy,
      updatedAt: record.dossier.updatedAt,
    },
  ];
}

async function getWorkshop2ServerDossierRecordFromPg(
  collectionId: string,
  articleId: string
): Promise<Workshop2ServerDossierRecord | null> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{
    version: number;
    updated_at: Date;
    dossier_json: Workshop2DossierPhase1;
  }>(
    `SELECT version, updated_at, dossier_json
     FROM workshop2_dossiers
     WHERE collection_id = $1 AND article_id = $2`,
    [collectionId, articleId]
  );
  const row = res.rows[0];
  if (!row) return null;
  let dossier = row.dossier_json;
  const demoDossier = buildWorkshop2FileStoreDemoDossier({ collectionId, articleId });
  if (
    demoDossier &&
    !dossier.b2bIntegrationDraft?.wholesalePrice &&
    demoDossier.b2bIntegrationDraft?.wholesalePrice
  ) {
    dossier = {
      ...dossier,
      b2bIntegrationDraft: {
        ...demoDossier.b2bIntegrationDraft,
        ...dossier.b2bIntegrationDraft,
      },
      showroomB2bMirror: dossier.showroomB2bMirror ?? demoDossier.showroomB2bMirror,
    };
  }
  return {
    collectionId,
    articleId,
    version: row.version,
    updatedAt: row.updated_at.toISOString(),
    dossier,
  };
}

async function putWorkshop2ServerDossierRecordToPg(input: {
  collectionId: string;
  articleId: string;
  dossier: Workshop2DossierPhase1;
  baseVersion?: number;
  updatedBy?: string;
  txMeta?: {
    eventType?: string;
    eventPayload?: Record<string, unknown>;
    finalExportSnapshotRecord?: Workshop2FinalExportSnapshotRecord;
  };
}): Promise<
  | { ok: true; record: Workshop2ServerDossierRecord }
  | { ok: false; error: 'version_conflict'; currentVersion: number }
> {
  await ensureWorkshop2PgSchema();
  const client = await getWorkshop2PgPool().connect();
  const nowIso = new Date().toISOString();
  const dossier: Workshop2DossierPhase1 = {
    ...input.dossier,
    updatedAt: input.dossier.updatedAt ?? nowIso,
    ...(input.updatedBy?.trim() ? { updatedBy: input.updatedBy.trim() } : {}),
  };
  try {
    await client.query('BEGIN');
    const cur = await client.query<{ version: number }>(
      `SELECT version FROM workshop2_dossiers
       WHERE collection_id = $1 AND article_id = $2
       FOR UPDATE`,
      [input.collectionId, input.articleId]
    );
    if (cur.rowCount === 0) {
      const next: Workshop2ServerDossierRecord = {
        collectionId: input.collectionId,
        articleId: input.articleId,
        version: 1,
        updatedAt: nowIso,
        updatedBy: input.updatedBy?.trim() || dossier.updatedBy,
        dossier,
      };
      await writePgVersionedRecord(
        client,
        next,
        input.txMeta?.eventType ?? 'create',
        input.txMeta?.eventPayload
      );
      if (input.txMeta?.finalExportSnapshotRecord) {
        await writePgSnapshotRecord(
          client,
          next.collectionId,
          next.articleId,
          input.txMeta.finalExportSnapshotRecord
        );
      }
      await client.query('COMMIT');
      return { ok: true, record: next };
    }
    const currentVersion = cur.rows[0]!.version;
    const expected = input.baseVersion ?? currentVersion;
    if (expected !== currentVersion) {
      await client.query('ROLLBACK');
      return { ok: false, error: 'version_conflict', currentVersion };
    }
    const next: Workshop2ServerDossierRecord = {
      collectionId: input.collectionId,
      articleId: input.articleId,
      version: currentVersion + 1,
      updatedAt: nowIso,
      updatedBy: input.updatedBy?.trim() || dossier.updatedBy,
      dossier,
    };
    await writePgVersionedRecord(
      client,
      next,
      input.txMeta?.eventType ?? 'update',
      input.txMeta?.eventPayload
    );
    if (input.txMeta?.finalExportSnapshotRecord) {
      await writePgSnapshotRecord(
        client,
        next.collectionId,
        next.articleId,
        input.txMeta.finalExportSnapshotRecord
      );
    }
    await client.query('COMMIT');
    return { ok: true, record: next };
  } catch {
    await client.query('ROLLBACK');
    throw new Error('workshop2_dossier_store_pg_write_failed');
  } finally {
    client.release();
  }
}

async function writePgSnapshotRecord(
  client: PoolClient,
  collectionId: string,
  articleId: string,
  snapshot: Workshop2FinalExportSnapshotRecord
): Promise<void> {
  await client.query(
    `INSERT INTO workshop2_dossier_snapshots
      (collection_id, article_id, snapshot_id, version, created_at, dossier_json)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     ON CONFLICT (collection_id, article_id, snapshot_id)
     DO UPDATE SET version = EXCLUDED.version, created_at = EXCLUDED.created_at, dossier_json = EXCLUDED.dossier_json`,
    [
      collectionId,
      articleId,
      snapshot.snapshotId,
      snapshot.dossierVersion,
      snapshot.createdAt,
      JSON.stringify(snapshot),
    ]
  );
}

async function writePgVersionedRecord(
  client: PoolClient,
  record: Workshop2ServerDossierRecord,
  eventType: string,
  eventPayload?: Record<string, unknown>
): Promise<void> {
  await client.query(
    `INSERT INTO workshop2_dossiers (collection_id, article_id, version, updated_at, dossier_json)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     ON CONFLICT (collection_id, article_id)
     DO UPDATE SET version = EXCLUDED.version, updated_at = EXCLUDED.updated_at, dossier_json = EXCLUDED.dossier_json`,
    [
      record.collectionId,
      record.articleId,
      record.version,
      record.updatedAt,
      JSON.stringify(record.dossier),
    ]
  );
  await client.query(
    `INSERT INTO workshop2_dossier_versions (collection_id, article_id, version, dossier_json)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [record.collectionId, record.articleId, record.version, JSON.stringify(record.dossier)]
  );
  await client.query(
    `INSERT INTO workshop2_dossier_events (collection_id, article_id, version, event_type, event_payload)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [
      record.collectionId,
      record.articleId,
      record.version,
      eventType,
      JSON.stringify({ updatedAt: record.updatedAt, ...(eventPayload ?? {}) }),
    ]
  );
}
