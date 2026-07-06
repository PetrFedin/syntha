import 'server-only';

import type { CollectionStageModulesDoc } from '@/lib/production/collection-stage-modules-store';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

const DEFAULT_ORG = 'org-brand-001';
const memory = new Map<string, CollectionStageModulesDoc>();

function scopeKey(orgId: string, collectionId: string): string {
  return `${orgId.trim()}::${collectionId.trim()}`;
}

export async function getBrandCollectionStageModulesServer(input: {
  collectionId: string;
  organizationId?: string;
}): Promise<{ doc: CollectionStageModulesDoc | null; storageMode: 'postgres' | 'memory' }> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) return { doc: null, storageMode: 'memory' };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ modules_json: CollectionStageModulesDoc }>(
      `SELECT modules_json FROM brand_collection_stage_modules
       WHERE organization_id = $1 AND collection_id = $2`,
      [orgId, collectionId]
    );
    const row = res.rows[0]?.modules_json;
    if (row && typeof row === 'object' && row.v === 1) {
      memory.set(scopeKey(orgId, collectionId), row);
      return { doc: row, storageMode: 'postgres' };
    }
    return { doc: null, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { doc: null, storageMode: 'memory' };
  return { doc: memory.get(scopeKey(orgId, collectionId)) ?? null, storageMode: 'memory' };
}

export async function putBrandCollectionStageModulesServer(input: {
  collectionId: string;
  doc: CollectionStageModulesDoc;
  organizationId?: string;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) return { ok: false, storageMode: 'memory' };

  const doc: CollectionStageModulesDoc = { ...input.doc, v: 1 };
  memory.set(scopeKey(orgId, collectionId), doc);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_collection_stage_modules (organization_id, collection_id, modules_json, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (organization_id, collection_id) DO UPDATE SET
         modules_json = EXCLUDED.modules_json,
         updated_at = NOW()`,
      [orgId, collectionId, JSON.stringify(doc)]
    );
    return { ok: true, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  return { ok: true, storageMode: 'memory' };
}

export function brandCollectionStageModulesStorageMode(): 'postgres' | 'memory' {
  return isWorkshop2PostgresEnabled() ? 'postgres' : 'memory';
}
