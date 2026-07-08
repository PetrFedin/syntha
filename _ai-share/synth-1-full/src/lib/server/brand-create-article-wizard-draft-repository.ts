import 'server-only';

import type { CreateArticleWizardDraftV1 } from '@/lib/production/create-article-wizard-draft.types';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

const DEFAULT_ORG = 'org-brand-001';
const memory = new Map<string, CreateArticleWizardDraftV1>();

function draftKey(orgId: string, collectionId: string): string {
  return `${orgId.trim()}::${collectionId.trim()}`;
}

export async function getBrandCreateArticleWizardDraftServer(input: {
  collectionId: string;
  organizationId?: string;
}): Promise<{ draft: CreateArticleWizardDraftV1 | null; storageMode: 'postgres' | 'memory' }> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) return { draft: null, storageMode: 'memory' };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ draft_json: CreateArticleWizardDraftV1 }>(
      `SELECT draft_json FROM brand_create_article_wizard_drafts
       WHERE organization_id = $1 AND collection_id = $2`,
      [orgId, collectionId]
    );
    const row = res.rows[0]?.draft_json;
    if (row && typeof row === 'object' && row.v === 1) {
      memory.set(draftKey(orgId, collectionId), row);
      return { draft: row, storageMode: 'postgres' };
    }
    return { draft: null, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { draft: null, storageMode: 'memory' };
  return { draft: memory.get(draftKey(orgId, collectionId)) ?? null, storageMode: 'memory' };
}

export async function putBrandCreateArticleWizardDraftServer(input: {
  collectionId: string;
  draft: CreateArticleWizardDraftV1;
  organizationId?: string;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) return { ok: false, storageMode: 'memory' };

  memory.set(draftKey(orgId, collectionId), input.draft);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_create_article_wizard_drafts (organization_id, collection_id, draft_json, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (organization_id, collection_id) DO UPDATE SET
         draft_json = EXCLUDED.draft_json,
         updated_at = NOW()`,
      [orgId, collectionId, JSON.stringify(input.draft)]
    );
    return { ok: true, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  return { ok: true, storageMode: 'memory' };
}

export async function patchBrandCreateArticleWizardDraftServer(input: {
  collectionId: string;
  patch?: Partial<CreateArticleWizardDraftV1>;
  clear?: boolean;
  organizationId?: string;
}): Promise<{
  ok: boolean;
  draft: CreateArticleWizardDraftV1 | null;
  storageMode: 'postgres' | 'memory' | 'pg_only_blocked';
}> {
  const collectionId = input.collectionId.trim();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  if (!collectionId) {
    return { ok: false, draft: null, storageMode: 'memory' };
  }

  if (input.clear) {
    memory.delete(draftKey(orgId, collectionId));
    if (isWorkshop2PostgresEnabled()) {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `DELETE FROM brand_create_article_wizard_drafts
         WHERE organization_id = $1 AND collection_id = $2`,
        [orgId, collectionId]
      );
      return { ok: true, draft: null, storageMode: 'postgres' };
    }
    if (isWorkshop2PgOnlyMode()) return { ok: false, draft: null, storageMode: 'pg_only_blocked' };
    return { ok: true, draft: null, storageMode: 'memory' };
  }

  const current = (
    await getBrandCreateArticleWizardDraftServer({ collectionId, organizationId: orgId })
  ).draft;
  if (!current || !input.patch) {
    return { ok: false, draft: current, storageMode: brandCreateArticleWizardDraftStorageMode() };
  }

  const next: CreateArticleWizardDraftV1 = { ...current, ...input.patch, v: 1 };
  const put = await putBrandCreateArticleWizardDraftServer({
    collectionId,
    draft: next,
    organizationId: orgId,
  });
  return { ok: put.ok, draft: put.ok ? next : current, storageMode: put.storageMode };
}

export async function clearBrandCreateArticleWizardDraftServer(input: {
  collectionId: string;
  organizationId?: string;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const result = await patchBrandCreateArticleWizardDraftServer({
    collectionId: input.collectionId,
    clear: true,
    organizationId: input.organizationId,
  });
  return { ok: result.ok, storageMode: result.storageMode };
}

export function brandCreateArticleWizardDraftStorageMode(): 'postgres' | 'memory' {
  return isWorkshop2PostgresEnabled() ? 'postgres' : 'memory';
}
