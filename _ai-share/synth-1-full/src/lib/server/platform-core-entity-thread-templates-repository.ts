import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { PlatformCoreEntityThreadKind } from '@/lib/communications/platform-core-entity-thread-templates';
import type { SavedPlatformCoreEntityThreadTemplate } from '@/lib/communications/platform-core-entity-thread-templates-storage';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

export type PlatformCoreEntityThreadTemplatesConfig = {
  ownerKey: string;
  templates: SavedPlatformCoreEntityThreadTemplate[];
  updatedAt: string;
};

const memory = new Map<string, PlatformCoreEntityThreadTemplatesConfig>();
const STORE_FILE = path.join(process.cwd(), 'data', 'platform-core-entity-thread-templates.json');
const MAX_SAVED = 24;
let fileHydrated = false;

async function ensureEntityThreadTemplatesTable(): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(`
    CREATE TABLE IF NOT EXISTS workshop2_entity_thread_templates (
      id TEXT NOT NULL,
      owner_key TEXT NOT NULL,
      label_ru TEXT NOT NULL,
      thread_kind TEXT NOT NULL,
      body_template TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (owner_key, id)
    )
  `);
}

async function readEntityThreadTemplatesFromPg(
  ownerKey: string
): Promise<SavedPlatformCoreEntityThreadTemplate[]> {
  if (!isWorkshop2PostgresEnabled()) return [];
  await ensureEntityThreadTemplatesTable();
  const res = await getWorkshop2PgPool().query<{
    id: string;
    label_ru: string;
    thread_kind: string;
    body_template: string;
    created_at: string;
  }>(
    `SELECT id, label_ru, thread_kind, body_template, created_at
     FROM workshop2_entity_thread_templates
     WHERE owner_key = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [ownerKey, MAX_SAVED]
  );
  return res.rows.map((row) => ({
    id: row.id,
    labelRu: row.label_ru,
    threadKind: row.thread_kind as PlatformCoreEntityThreadKind,
    bodyTemplate: row.body_template,
    createdAt: row.created_at,
  }));
}

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as PlatformCoreEntityThreadTemplatesConfig[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        if (row.ownerKey) memory.set(row.ownerKey.trim(), row);
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

export async function getPlatformCoreEntityThreadTemplatesServer(
  ownerKey: string
): Promise<PlatformCoreEntityThreadTemplatesConfig> {
  const key = ownerKey.trim() || 'platform-core';

  if (isWorkshop2PostgresEnabled()) {
    const templates = await readEntityThreadTemplatesFromPg(key);
    return {
      ownerKey: key,
      templates,
      updatedAt: templates[0]?.createdAt ?? new Date().toISOString(),
    };
  }

  if (isWorkshop2PgOnlyMode()) {
    return { ownerKey: key, templates: [], updatedAt: new Date().toISOString() };
  }

  hydrateFileIfNeeded();
  return (
    memory.get(key) ?? {
      ownerKey: key,
      templates: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function savePlatformCoreEntityThreadTemplateServer(input: {
  ownerKey: string;
  template: SavedPlatformCoreEntityThreadTemplate;
}): Promise<PlatformCoreEntityThreadTemplatesConfig> {
  const ownerKey = input.ownerKey.trim() || 'platform-core';

  if (isWorkshop2PostgresEnabled()) {
    await ensureEntityThreadTemplatesTable();
    const client = await getWorkshop2PgPool().connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO workshop2_entity_thread_templates
           (id, owner_key, label_ru, thread_kind, body_template, created_at)
         VALUES ($1, $2, $3, $4, $5, $6::timestamptz)
         ON CONFLICT (owner_key, id) DO UPDATE SET
           label_ru = EXCLUDED.label_ru,
           thread_kind = EXCLUDED.thread_kind,
           body_template = EXCLUDED.body_template,
           created_at = EXCLUDED.created_at`,
        [
          input.template.id,
          ownerKey,
          input.template.labelRu,
          input.template.threadKind,
          input.template.bodyTemplate,
          input.template.createdAt,
        ]
      );
      const countRes = await client.query<{ n: string }>(
        `SELECT COUNT(*)::text AS n FROM workshop2_entity_thread_templates WHERE owner_key = $1`,
        [ownerKey]
      );
      const extra = Number(countRes.rows[0]?.n ?? 0) - MAX_SAVED;
      if (extra > 0) {
        await client.query(
          `DELETE FROM workshop2_entity_thread_templates
           WHERE owner_key = $1 AND id IN (
             SELECT id FROM workshop2_entity_thread_templates
             WHERE owner_key = $1
             ORDER BY created_at ASC
             LIMIT $2
           )`,
          [ownerKey, extra]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    return getPlatformCoreEntityThreadTemplatesServer(ownerKey);
  }

  if (isWorkshop2PgOnlyMode()) {
    return { ownerKey, templates: [input.template], updatedAt: new Date().toISOString() };
  }

  hydrateFileIfNeeded();
  const prev = await getPlatformCoreEntityThreadTemplatesServer(ownerKey);
  const withoutDup = prev.templates.filter((row) => row.id !== input.template.id);
  const next: PlatformCoreEntityThreadTemplatesConfig = {
    ownerKey,
    templates: [input.template, ...withoutDup].slice(0, MAX_SAVED),
    updatedAt: new Date().toISOString(),
  };
  memory.set(ownerKey, next);
  persistFile();
  return next;
}

export async function deletePlatformCoreEntityThreadTemplateServer(input: {
  ownerKey: string;
  id: string;
}): Promise<PlatformCoreEntityThreadTemplatesConfig> {
  const ownerKey = input.ownerKey.trim() || 'platform-core';

  if (isWorkshop2PostgresEnabled()) {
    await ensureEntityThreadTemplatesTable();
    await getWorkshop2PgPool().query(
      `DELETE FROM workshop2_entity_thread_templates WHERE owner_key = $1 AND id = $2`,
      [ownerKey, input.id]
    );
    return getPlatformCoreEntityThreadTemplatesServer(ownerKey);
  }

  if (isWorkshop2PgOnlyMode()) {
    return { ownerKey, templates: [], updatedAt: new Date().toISOString() };
  }

  hydrateFileIfNeeded();
  const prev = await getPlatformCoreEntityThreadTemplatesServer(ownerKey);
  const next: PlatformCoreEntityThreadTemplatesConfig = {
    ownerKey,
    templates: prev.templates.filter((row) => row.id !== input.id),
    updatedAt: new Date().toISOString(),
  };
  memory.set(ownerKey, next);
  persistFile();
  return next;
}

export function platformCoreEntityThreadTemplatesStorageMode(): 'postgres' | 'file' | 'memory' {
  if (isWorkshop2PostgresEnabled()) return 'postgres';
  if (canUseDiskPersistence() && (fs.existsSync(STORE_FILE) || memory.size > 0)) return 'file';
  return 'memory';
}

export function platformCoreEntityThreadTemplatesStorageModeLabelRu(): string {
  const mode = platformCoreEntityThreadTemplatesStorageMode();
  if (mode === 'postgres') return 'PostgreSQL · шаблоны тредов';
  if (mode === 'file') return 'Файл · шаблоны тредов (dev)';
  return 'Память · шаблоны тредов';
}
