import 'server-only';

import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

export type ShopB2bMatrixDraftLine = {
  articleId: string;
  colorCode: string;
  size: string;
  qty: number;
};

export type ShopB2bMatrixDraftDoc = {
  v: 1;
  collectionId: string;
  lines: ShopB2bMatrixDraftLine[];
  updatedAt: string;
};

const memory = new Map<string, ShopB2bMatrixDraftDoc>();

function scopeKey(sessionId: string): string {
  return sessionId.trim();
}

export async function getShopB2bMatrixDraftServer(input: {
  sessionId: string;
}): Promise<{
  draft: ShopB2bMatrixDraftDoc | null;
  storageMode: 'postgres' | 'memory';
  updatedAt?: string;
}> {
  const sessionId = input.sessionId.trim();
  if (!sessionId) return { draft: null, storageMode: 'memory' };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      draft_json: ShopB2bMatrixDraftDoc;
      updated_at: Date | string;
    }>(
      `SELECT draft_json, updated_at FROM shop_b2b_matrix_drafts WHERE session_id = $1`,
      [sessionId]
    );
    const row = res.rows[0];
    const draftJson = row?.draft_json;
    if (draftJson && typeof draftJson === 'object' && draftJson.v === 1) {
      memory.set(scopeKey(sessionId), draftJson);
      const updatedAt =
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : String(row.updated_at ?? draftJson.updatedAt);
      return { draft: draftJson, storageMode: 'postgres', updatedAt };
    }
    return { draft: null, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { draft: null, storageMode: 'memory' };
  const draft = memory.get(scopeKey(sessionId)) ?? null;
  return { draft, storageMode: 'memory', updatedAt: draft?.updatedAt };
}

export async function putShopB2bMatrixDraftServer(input: {
  sessionId: string;
  buyerId: string;
  collectionId: string;
  draft: ShopB2bMatrixDraftDoc;
  expectedUpdatedAt?: string;
}): Promise<{
  ok: boolean;
  storageMode: 'postgres' | 'memory' | 'pg_only_blocked';
  conflict?: boolean;
  serverUpdatedAt?: string;
  serverDraft?: ShopB2bMatrixDraftDoc;
}> {
  const sessionId = input.sessionId.trim();
  const buyerId = input.buyerId.trim() || 'shop1';
  const collectionId = input.collectionId.trim();
  if (!sessionId || !collectionId) return { ok: false, storageMode: 'memory' };

  const draft: ShopB2bMatrixDraftDoc = {
    ...input.draft,
    v: 1,
    collectionId,
    updatedAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const existing = await getWorkshop2PgPool().query<{
      draft_json: ShopB2bMatrixDraftDoc;
      updated_at: Date | string;
    }>(`SELECT draft_json, updated_at FROM shop_b2b_matrix_drafts WHERE session_id = $1`, [
      sessionId,
    ]);
    const row = existing.rows[0];
    if (row && input.expectedUpdatedAt?.trim()) {
      const serverUpdatedAt =
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : String(row.updated_at ?? row.draft_json?.updatedAt ?? '');
      const expMs = Date.parse(input.expectedUpdatedAt.trim());
      const srvMs = Date.parse(serverUpdatedAt);
      if (Number.isFinite(expMs) && Number.isFinite(srvMs) && srvMs > expMs) {
        return {
          ok: false,
          storageMode: 'postgres',
          conflict: true,
          serverUpdatedAt,
          serverDraft: row.draft_json,
        };
      }
    }

    memory.set(scopeKey(sessionId), draft);
    await getWorkshop2PgPool().query(
      `INSERT INTO shop_b2b_matrix_drafts (session_id, buyer_id, collection_id, draft_json, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, NOW())
       ON CONFLICT (session_id) DO UPDATE SET
         buyer_id = EXCLUDED.buyer_id,
         collection_id = EXCLUDED.collection_id,
         draft_json = EXCLUDED.draft_json,
         updated_at = NOW()`,
      [sessionId, buyerId, collectionId, JSON.stringify(draft)]
    );
    return { ok: true, storageMode: 'postgres' };
  }

  memory.set(scopeKey(sessionId), draft);
  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  return { ok: true, storageMode: 'memory' };
}

export function shopB2bMatrixDraftStorageMode(): 'postgres' | 'memory' {
  return isWorkshop2PostgresEnabled() ? 'postgres' : 'memory';
}
