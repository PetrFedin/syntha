import 'server-only';

import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopPartnershipInviteJournalRow = {
  id: string;
  buyerId: string;
  brandId: string;
  collectionId?: string;
  action: 'request' | 'connect';
  status: string;
  createdAt: string;
};

const memoryJournal: ShopPartnershipInviteJournalRow[] = [];

export function clearShopPartnershipInviteJournalForTests(): void {
  memoryJournal.length = 0;
}

export async function appendShopPartnershipInviteJournal(input: {
  buyerId: string;
  brandId: string;
  collectionId?: string;
  action: 'request' | 'connect';
  status: string;
}): Promise<ShopPartnershipInviteJournalRow> {
  const row: ShopPartnershipInviteJournalRow = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    buyerId: input.buyerId.trim(),
    brandId: input.brandId.trim(),
    collectionId: input.collectionId?.trim(),
    action: input.action,
    status: input.status.trim(),
    createdAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `INSERT INTO shop_b2b_partnership_invite_journal
          (id, buyer_id, brand_id, collection_id, action, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [row.id, row.buyerId, row.brandId, row.collectionId ?? null, row.action, row.status]
      );
    } catch {
      memoryJournal.push(row);
    }
  } else {
    memoryJournal.push(row);
  }

  return row;
}

export async function listShopPartnershipInviteJournal(input: {
  buyerId: string;
  brandId?: string;
  limit?: number;
}): Promise<ShopPartnershipInviteJournalRow[]> {
  const buyerId = input.buyerId.trim();
  const brandId = input.brandId?.trim();
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const params: string[] = [buyerId];
      let sql = `SELECT id, buyer_id, brand_id, collection_id, action, status, created_at
                 FROM shop_b2b_partnership_invite_journal
                 WHERE buyer_id = $1`;
      if (brandId) {
        params.push(brandId);
        sql += ` AND brand_id = $${params.length}`;
      }
      params.push(String(limit));
      sql += ` ORDER BY created_at DESC LIMIT $${params.length}`;
      const res = await getWorkshop2PgPool().query(sql, params);
      return res.rows.map((r) => ({
        id: r.id as string,
        buyerId: r.buyer_id as string,
        brandId: r.brand_id as string,
        collectionId: (r.collection_id as string | null) ?? undefined,
        action: r.action as 'request' | 'connect',
        status: r.status as string,
        createdAt: (r.created_at as Date).toISOString(),
      }));
    } catch {
      /* fall through to memory */
    }
  }

  return memoryJournal
    .filter((r) => r.buyerId === buyerId && (!brandId || r.brandId === brandId))
    .slice(-limit)
    .reverse();
}

export function shopPartnershipInviteJournalStorageMode(): 'pg' | 'memory' {
  return isWorkshop2PostgresEnabled() ? 'pg' : 'memory';
}
