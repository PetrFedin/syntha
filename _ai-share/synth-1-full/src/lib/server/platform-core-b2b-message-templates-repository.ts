import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { SavedPlatformCoreB2bMessageTemplate } from '@/lib/communications/platform-core-b2b-message-templates-storage';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

export type PlatformCoreB2bMessageTemplatesConfig = {
  ownerKey: string;
  templates: SavedPlatformCoreB2bMessageTemplate[];
  updatedAt: string;
};

const memory = new Map<string, PlatformCoreB2bMessageTemplatesConfig>();
const STORE_FILE = path.join(process.cwd(), 'data', 'platform-core-b2b-message-templates.json');
const MAX_SAVED = 24;
let fileHydrated = false;

async function ensureMessageTemplatesTable(): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(`
    CREATE TABLE IF NOT EXISTS workshop2_b2b_message_templates (
      id TEXT NOT NULL,
      owner_key TEXT NOT NULL,
      label_ru TEXT NOT NULL,
      context TEXT NOT NULL,
      body_template TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (owner_key, id)
    )
  `);
}

async function readMessageTemplatesFromPg(ownerKey: string): Promise<SavedPlatformCoreB2bMessageTemplate[]> {
  if (!isWorkshop2PostgresEnabled()) return [];
  await ensureMessageTemplatesTable();
  const res = await getWorkshop2PgPool().query<{
    id: string;
    label_ru: string;
    context: string;
    body_template: string;
    created_at: string;
  }>(
    `SELECT id, label_ru, context, body_template, created_at
     FROM workshop2_b2b_message_templates
     WHERE owner_key = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [ownerKey, MAX_SAVED]
  );
  return res.rows.map((row) => ({
    id: row.id,
    labelRu: row.label_ru,
    context: row.context as SavedPlatformCoreB2bMessageTemplate['context'],
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
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as PlatformCoreB2bMessageTemplatesConfig[];
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

export async function getPlatformCoreB2bMessageTemplatesServer(
  ownerKey: string
): Promise<PlatformCoreB2bMessageTemplatesConfig> {
  const key = ownerKey.trim() || 'platform-core';

  if (isWorkshop2PostgresEnabled()) {
    const templates = await readMessageTemplatesFromPg(key);
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

export async function savePlatformCoreB2bMessageTemplateServer(input: {
  ownerKey: string;
  template: SavedPlatformCoreB2bMessageTemplate;
}): Promise<PlatformCoreB2bMessageTemplatesConfig> {
  const ownerKey = input.ownerKey.trim() || 'platform-core';

  if (isWorkshop2PostgresEnabled()) {
    await ensureMessageTemplatesTable();
    const client = await getWorkshop2PgPool().connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO workshop2_b2b_message_templates
           (id, owner_key, label_ru, context, body_template, created_at)
         VALUES ($1, $2, $3, $4, $5, $6::timestamptz)
         ON CONFLICT (owner_key, id) DO UPDATE SET
           label_ru = EXCLUDED.label_ru,
           context = EXCLUDED.context,
           body_template = EXCLUDED.body_template,
           created_at = EXCLUDED.created_at`,
        [
          input.template.id,
          ownerKey,
          input.template.labelRu,
          input.template.context,
          input.template.bodyTemplate,
          input.template.createdAt,
        ]
      );
      const countRes = await client.query<{ n: string }>(
        `SELECT COUNT(*)::text AS n FROM workshop2_b2b_message_templates WHERE owner_key = $1`,
        [ownerKey]
      );
      const extra = Number(countRes.rows[0]?.n ?? 0) - MAX_SAVED;
      if (extra > 0) {
        await client.query(
          `DELETE FROM workshop2_b2b_message_templates
           WHERE owner_key = $1 AND id IN (
             SELECT id FROM workshop2_b2b_message_templates
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
    return getPlatformCoreB2bMessageTemplatesServer(ownerKey);
  }

  if (isWorkshop2PgOnlyMode()) {
    return { ownerKey, templates: [input.template], updatedAt: new Date().toISOString() };
  }

  hydrateFileIfNeeded();
  const prev = await getPlatformCoreB2bMessageTemplatesServer(ownerKey);
  const withoutDup = prev.templates.filter((row) => row.id !== input.template.id);
  const next: PlatformCoreB2bMessageTemplatesConfig = {
    ownerKey,
    templates: [input.template, ...withoutDup].slice(0, MAX_SAVED),
    updatedAt: new Date().toISOString(),
  };
  memory.set(ownerKey, next);
  persistFile();
  return next;
}

export async function deletePlatformCoreB2bMessageTemplateServer(input: {
  ownerKey: string;
  id: string;
}): Promise<PlatformCoreB2bMessageTemplatesConfig> {
  const ownerKey = input.ownerKey.trim() || 'platform-core';

  if (isWorkshop2PostgresEnabled()) {
    await ensureMessageTemplatesTable();
    await getWorkshop2PgPool().query(
      `DELETE FROM workshop2_b2b_message_templates WHERE owner_key = $1 AND id = $2`,
      [ownerKey, input.id]
    );
    return getPlatformCoreB2bMessageTemplatesServer(ownerKey);
  }

  if (isWorkshop2PgOnlyMode()) {
    return { ownerKey, templates: [], updatedAt: new Date().toISOString() };
  }

  hydrateFileIfNeeded();
  const prev = await getPlatformCoreB2bMessageTemplatesServer(ownerKey);
  const next: PlatformCoreB2bMessageTemplatesConfig = {
    ownerKey,
    templates: prev.templates.filter((row) => row.id !== input.id),
    updatedAt: new Date().toISOString(),
  };
  memory.set(ownerKey, next);
  persistFile();
  return next;
}

export function platformCoreB2bMessageTemplatesStorageMode(): 'postgres' | 'file' | 'memory' {
  if (isWorkshop2PostgresEnabled()) return 'postgres';
  if (canUseDiskPersistence() && (fs.existsSync(STORE_FILE) || memory.size > 0)) return 'file';
  return 'memory';
}
