import 'server-only';

import type { Workshop2SketchPinTemplate } from '@/lib/production/workshop2-dossier-phase1.types';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

const DEFAULT_ORG = 'org-brand-001';
const MAX_TEMPLATES = 48;
const memory = new Map<string, Workshop2SketchPinTemplate[]>();

function scopeKey(orgId: string, collectionId: string): string {
  return `${orgId.trim()}::${collectionId.trim()}`;
}

export async function listBrandSketchOrgTemplatesServer(input: {
  collectionId: string;
  organizationId?: string;
}): Promise<Workshop2SketchPinTemplate[]> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) return [];

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ templates_json: Workshop2SketchPinTemplate[] }>(
      `SELECT templates_json FROM brand_sketch_org_templates
       WHERE organization_id = $1 AND collection_id = $2`,
      [orgId, collectionId]
    );
    const rows = res.rows[0]?.templates_json;
    const list = Array.isArray(rows) ? rows.slice(0, MAX_TEMPLATES) : [];
    memory.set(scopeKey(orgId, collectionId), list);
    return list;
  }

  if (isWorkshop2PgOnlyMode()) return [];
  return memory.get(scopeKey(orgId, collectionId)) ?? [];
}

export async function replaceBrandSketchOrgTemplatesServer(input: {
  collectionId: string;
  templates: Workshop2SketchPinTemplate[];
  organizationId?: string;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  const templates = input.templates.slice(-MAX_TEMPLATES);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_sketch_org_templates (organization_id, collection_id, templates_json, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (organization_id, collection_id) DO UPDATE SET
         templates_json = EXCLUDED.templates_json,
         updated_at = NOW()`,
      [orgId, collectionId, JSON.stringify(templates)]
    );
    memory.set(scopeKey(orgId, collectionId), templates);
    return { ok: true, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  memory.set(scopeKey(orgId, collectionId), templates);
  return { ok: true, storageMode: 'memory' };
}

export function brandSketchOrgTemplatesStorageMode(): 'postgres' | 'memory' {
  return isWorkshop2PostgresEnabled() ? 'postgres' : 'memory';
}
