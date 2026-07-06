import 'server-only';

import type { RangePlannerOverlayDoc } from '@/lib/production/workshop2-range-planner-overlay';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

const DEFAULT_ORG = 'org-brand-001';
const memory = new Map<string, RangePlannerOverlayDoc>();

function scopeKey(orgId: string, collectionId: string): string {
  return `${orgId.trim()}::${collectionId.trim()}`;
}

export async function getBrandRangePlannerOverlayServer(input: {
  collectionId: string;
  organizationId?: string;
}): Promise<RangePlannerOverlayDoc | null> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) return null;

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ overlay_json: RangePlannerOverlayDoc }>(
      `SELECT overlay_json FROM brand_range_planner_overlay
       WHERE organization_id = $1 AND collection_id = $2`,
      [orgId, collectionId]
    );
    const row = res.rows[0]?.overlay_json;
    if (row && typeof row === 'object') {
      memory.set(scopeKey(orgId, collectionId), row);
      return row;
    }
    return null;
  }

  if (isWorkshop2PgOnlyMode()) return null;
  return memory.get(scopeKey(orgId, collectionId)) ?? null;
}

export async function putBrandRangePlannerOverlayServer(input: {
  collectionId: string;
  overlay: RangePlannerOverlayDoc;
  organizationId?: string;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) return { ok: false, storageMode: 'memory' };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_range_planner_overlay (organization_id, collection_id, overlay_json, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (organization_id, collection_id) DO UPDATE SET
         overlay_json = EXCLUDED.overlay_json,
         updated_at = NOW()`,
      [orgId, collectionId, JSON.stringify(input.overlay)]
    );
    memory.set(scopeKey(orgId, collectionId), input.overlay);
    return { ok: true, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  memory.set(scopeKey(orgId, collectionId), input.overlay);
  return { ok: true, storageMode: 'memory' };
}

export function brandRangePlannerOverlayStorageMode(): 'postgres' | 'memory' {
  return isWorkshop2PostgresEnabled() ? 'postgres' : 'memory';
}
