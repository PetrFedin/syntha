import 'server-only';

import {
  buildSupplierAltMaterialApprovalKey,
  type SupplierAltMaterialApprovalStatus,
} from '@/lib/production/workshop2-supplier-alt-material-approval';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type SupplierAltMaterialApprovalStorageMode = 'postgres' | 'memory' | 'pg_only_blocked';

const memory = new Map<string, Record<string, SupplierAltMaterialApprovalStatus>>();

function scopeKey(
  collectionId: string,
  articleId: string,
  organizationId = 'org-brand-001'
): string {
  return `${organizationId}::${collectionId}::${articleId}`;
}

function resolveStorageMode(pgUsed: boolean): SupplierAltMaterialApprovalStorageMode {
  if (pgUsed) return 'postgres';
  if (isWorkshop2PgOnlyMode() || !shouldAllowMemoryFallback()) {
    return 'pg_only_blocked';
  }
  return 'memory';
}

function shouldAllowMemoryFallback(): boolean {
  return process.env.NODE_ENV === 'test' || !isWorkshop2PgOnlyMode();
}

function rowsToMap(
  rows: Array<{ primary_material: string; alternative_material: string; status: string }>
): Record<string, SupplierAltMaterialApprovalStatus> {
  const out: Record<string, SupplierAltMaterialApprovalStatus> = {};
  for (const row of rows) {
    const key = buildSupplierAltMaterialApprovalKey(row.primary_material, row.alternative_material);
    out[key] = row.status as SupplierAltMaterialApprovalStatus;
  }
  return out;
}

async function loadFromPg(input: {
  organizationId: string;
  collectionId: string;
  articleId: string;
}): Promise<Record<string, SupplierAltMaterialApprovalStatus> | null> {
  if (!isWorkshop2PostgresEnabled()) return null;
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      primary_material: string;
      alternative_material: string;
      status: string;
    }>(
      `SELECT primary_material, alternative_material, status
       FROM supplier_alt_material_approvals
       WHERE organization_id = $1 AND collection_id = $2 AND article_id = $3
       ORDER BY updated_at DESC`,
      [input.organizationId, input.collectionId, input.articleId]
    );
    return rowsToMap(res.rows);
  } catch {
    return null;
  }
}

async function persistToPg(input: {
  organizationId: string;
  collectionId: string;
  articleId: string;
  primary: string;
  alternative: string;
  status: SupplierAltMaterialApprovalStatus;
  updatedBy?: string;
}): Promise<boolean> {
  if (!isWorkshop2PostgresEnabled()) return false;
  try {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO supplier_alt_material_approvals
         (organization_id, collection_id, article_id, primary_material, alternative_material, status, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
       ON CONFLICT (organization_id, collection_id, article_id, primary_material, alternative_material)
       DO UPDATE SET
         status = EXCLUDED.status,
         updated_at = NOW(),
         updated_by = EXCLUDED.updated_by`,
      [
        input.organizationId,
        input.collectionId,
        input.articleId,
        input.primary,
        input.alternative,
        input.status,
        input.updatedBy ?? null,
      ]
    );
    return true;
  } catch {
    return false;
  }
}

export async function getSupplierAltMaterialApprovalsServer(input: {
  collectionId: string;
  articleId: string;
  organizationId?: string;
  dossierSeed?: Record<string, SupplierAltMaterialApprovalStatus>;
}): Promise<{
  approvals: Record<string, SupplierAltMaterialApprovalStatus>;
  storageMode: SupplierAltMaterialApprovalStorageMode;
}> {
  const organizationId = input.organizationId?.trim() || 'org-brand-001';
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const key = scopeKey(collectionId, articleId, organizationId);

  const fromPg = await loadFromPg({ organizationId, collectionId, articleId });
  if (fromPg !== null) {
    if (Object.keys(fromPg).length > 0) {
      memory.set(key, fromPg);
      return { approvals: fromPg, storageMode: 'postgres' };
    }
    const seed = input.dossierSeed ?? {};
    if (Object.keys(seed).length > 0 && isWorkshop2PostgresEnabled()) {
      for (const [mapKey, status] of Object.entries(seed)) {
        const [primary, alternative] = mapKey.split('::');
        if (!primary || !alternative) continue;
        await persistToPg({
          organizationId,
          collectionId,
          articleId,
          primary,
          alternative,
          status,
          updatedBy: 'dossier-seed',
        });
      }
      const seeded = await loadFromPg({ organizationId, collectionId, articleId });
      if (seeded && Object.keys(seeded).length > 0) {
        memory.set(key, seeded);
        return { approvals: seeded, storageMode: 'postgres' };
      }
    }
    return { approvals: {}, storageMode: 'postgres' };
  }

  if (!shouldAllowMemoryFallback()) {
    return { approvals: {}, storageMode: 'pg_only_blocked' };
  }

  const cached = memory.get(key);
  if (cached) return { approvals: cached, storageMode: 'memory' };

  const seed = input.dossierSeed ?? {};
  if (Object.keys(seed).length > 0) {
    memory.set(key, seed);
    return { approvals: seed, storageMode: 'memory' };
  }

  return { approvals: {}, storageMode: resolveStorageMode(false) };
}

export async function upsertSupplierAltMaterialApprovalServer(input: {
  collectionId: string;
  articleId: string;
  primary: string;
  alternative: string;
  status: SupplierAltMaterialApprovalStatus;
  updatedBy?: string;
  organizationId?: string;
}): Promise<{
  ok: boolean;
  approvals: Record<string, SupplierAltMaterialApprovalStatus>;
  storageMode: SupplierAltMaterialApprovalStorageMode;
  changed: boolean;
}> {
  const organizationId = input.organizationId?.trim() || 'org-brand-001';
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const primary = input.primary.trim();
  const alternative = input.alternative.trim();
  const key = scopeKey(collectionId, articleId, organizationId);
  const mapKey = buildSupplierAltMaterialApprovalKey(primary, alternative);

  const current = await getSupplierAltMaterialApprovalsServer({
    collectionId,
    articleId,
    organizationId,
  });
  const previousStatus = current.approvals[mapKey];
  const changed = previousStatus !== input.status;

  const pgOk = await persistToPg({
    organizationId,
    collectionId,
    articleId,
    primary,
    alternative,
    status: input.status,
    updatedBy: input.updatedBy,
  });

  if (pgOk) {
    const next = { ...current.approvals, [mapKey]: input.status };
    memory.set(key, next);
    return { ok: true, approvals: next, storageMode: 'postgres', changed };
  }

  if (!shouldAllowMemoryFallback()) {
    return {
      ok: false,
      approvals: current.approvals,
      storageMode: 'pg_only_blocked',
      changed: false,
    };
  }

  const next = { ...current.approvals, [mapKey]: input.status };
  memory.set(key, next);
  return { ok: true, approvals: next, storageMode: 'memory', changed };
}

export function clearSupplierAltMaterialApprovalsMemoryForTests(): void {
  memory.clear();
}
