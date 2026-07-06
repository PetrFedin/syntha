import 'server-only';

import type { FloorTabScope } from '@/lib/production-data/port';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

const DEFAULT_ORG = 'org-brand-001';
const memory = new Map<string, unknown>();

function scopeKey(orgId: string, scope: FloorTabScope): string {
  return `${orgId.trim()}::${scope}`;
}

export async function getBrandFloorTabDraftServer(input: {
  scope: FloorTabScope;
  organizationId?: string;
}): Promise<{ draft: unknown | null; storageMode: 'postgres' | 'memory' }> {
  const scope = input.scope;
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ draft_json: unknown }>(
      `SELECT draft_json FROM brand_floor_tab_drafts
       WHERE organization_id = $1 AND scope = $2`,
      [orgId, scope]
    );
    const row = res.rows[0]?.draft_json;
    if (row && typeof row === 'object') {
      memory.set(scopeKey(orgId, scope), row);
      return { draft: row, storageMode: 'postgres' };
    }
    return { draft: null, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { draft: null, storageMode: 'memory' };
  return { draft: memory.get(scopeKey(orgId, scope)) ?? null, storageMode: 'memory' };
}

export async function putBrandFloorTabDraftServer(input: {
  scope: FloorTabScope;
  draft: unknown;
  organizationId?: string;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const scope = input.scope;
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  const draft = input.draft;

  memory.set(scopeKey(orgId, scope), draft);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_floor_tab_drafts (organization_id, scope, draft_json, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (organization_id, scope) DO UPDATE SET
         draft_json = EXCLUDED.draft_json,
         updated_at = NOW()`,
      [orgId, scope, JSON.stringify(draft)]
    );
    return { ok: true, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  return { ok: true, storageMode: 'memory' };
}

export function brandFloorTabDraftStorageMode(): 'postgres' | 'memory' {
  return isWorkshop2PostgresEnabled() ? 'postgres' : 'memory';
}
