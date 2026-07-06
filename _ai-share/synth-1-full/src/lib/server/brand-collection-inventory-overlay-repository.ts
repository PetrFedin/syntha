import 'server-only';

import type { CollectionInventoryOverlayDoc } from '@/lib/production/collection-inventory-overlay-store';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

const DEFAULT_ORG = 'org-brand-001';
const memory = new Map<string, CollectionInventoryOverlayDoc>();

function scopeKey(orgId: string, collectionId: string): string {
  return `${orgId.trim()}::${collectionId.trim()}`;
}

export async function getBrandCollectionInventoryOverlayServer(input: {
  collectionId: string;
  organizationId?: string;
}): Promise<{ doc: CollectionInventoryOverlayDoc | null; storageMode: 'postgres' | 'memory' }> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) return { doc: null, storageMode: 'memory' };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ overlay_json: CollectionInventoryOverlayDoc }>(
      `SELECT overlay_json FROM brand_collection_inventory_overlay
       WHERE organization_id = $1 AND collection_id = $2`,
      [orgId, collectionId]
    );
    const row = res.rows[0]?.overlay_json;
    if (row && typeof row === 'object' && row.v === 1 && Array.isArray(row.articles)) {
      memory.set(scopeKey(orgId, collectionId), row);
      return { doc: row, storageMode: 'postgres' };
    }
    return { doc: { v: 1, articles: [] }, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { doc: null, storageMode: 'memory' };
  return { doc: memory.get(scopeKey(orgId, collectionId)) ?? null, storageMode: 'memory' };
}

export async function putBrandCollectionInventoryOverlayServer(input: {
  collectionId: string;
  doc: CollectionInventoryOverlayDoc;
  organizationId?: string;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) return { ok: false, storageMode: 'memory' };

  const doc: CollectionInventoryOverlayDoc = {
    v: 1,
    articles: Array.isArray(input.doc.articles) ? input.doc.articles : [],
  };
  memory.set(scopeKey(orgId, collectionId), doc);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_collection_inventory_overlay (organization_id, collection_id, overlay_json, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (organization_id, collection_id) DO UPDATE SET
         overlay_json = EXCLUDED.overlay_json,
         updated_at = NOW()`,
      [orgId, collectionId, JSON.stringify(doc)]
    );
    return { ok: true, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  return { ok: true, storageMode: 'memory' };
}

export function brandCollectionInventoryOverlayStorageMode(): 'postgres' | 'memory' {
  return isWorkshop2PostgresEnabled() ? 'postgres' : 'memory';
}
