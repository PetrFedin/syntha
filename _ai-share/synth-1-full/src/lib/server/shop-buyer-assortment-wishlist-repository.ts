import 'server-only';

import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

export type ShopBuyerAssortmentWishlistEntry = {
  buyerId: string;
  collectionId: string;
  articleId: string;
  note?: string;
  addedAt: string;
};

const memory = new Map<string, ShopBuyerAssortmentWishlistEntry>();

function scopeKey(buyerId: string, collectionId: string, articleId: string): string {
  return `${buyerId}::${collectionId}::${articleId}`;
}

export async function listShopBuyerAssortmentWishlistServer(input: {
  buyerId: string;
  collectionId?: string;
}): Promise<{ items: ShopBuyerAssortmentWishlistEntry[]; storageMode: 'postgres' | 'memory' }> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const collectionId = input.collectionId?.trim();

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const params: unknown[] = [buyerId];
    let sql = `SELECT buyer_id, collection_id, article_id, note, added_at
               FROM shop_buyer_assortment_wishlist WHERE buyer_id = $1`;
    if (collectionId) {
      params.push(collectionId);
      sql += ` AND collection_id = $${params.length}`;
    }
    sql += ' ORDER BY added_at DESC LIMIT 48';
    const res = await getWorkshop2PgPool().query<{
      buyer_id: string;
      collection_id: string;
      article_id: string;
      note: string | null;
      added_at: Date;
    }>(sql, params);
    const items = res.rows.map((r) => ({
      buyerId: r.buyer_id,
      collectionId: r.collection_id,
      articleId: r.article_id,
      note: r.note ?? undefined,
      addedAt: r.added_at.toISOString(),
    }));
    for (const item of items) {
      memory.set(scopeKey(item.buyerId, item.collectionId, item.articleId), item);
    }
    return { items, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { items: [], storageMode: 'memory' };
  const items = [...memory.values()].filter(
    (e) => e.buyerId === buyerId && (!collectionId || e.collectionId === collectionId)
  );
  return { items, storageMode: 'memory' };
}

export async function upsertShopBuyerAssortmentWishlistServer(input: {
  buyerId: string;
  collectionId: string;
  articleId: string;
  note?: string;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  if (!collectionId || !articleId) return { ok: false, storageMode: 'memory' };

  const entry: ShopBuyerAssortmentWishlistEntry = {
    buyerId,
    collectionId,
    articleId,
    note: input.note?.trim() || undefined,
    addedAt: new Date().toISOString(),
  };
  memory.set(scopeKey(buyerId, collectionId, articleId), entry);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO shop_buyer_assortment_wishlist (buyer_id, collection_id, article_id, note, added_at)
       VALUES ($1,$2,$3,$4,$5::timestamptz)
       ON CONFLICT (buyer_id, collection_id, article_id) DO UPDATE SET
         note = COALESCE(EXCLUDED.note, shop_buyer_assortment_wishlist.note),
         added_at = EXCLUDED.added_at`,
      [buyerId, collectionId, articleId, entry.note ?? null, entry.addedAt]
    );
    return { ok: true, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  return { ok: true, storageMode: 'memory' };
}

/** Bulk replace wishlist rows for buyer+collection (Wave WV PUT polish). */
export async function replaceShopBuyerAssortmentWishlistServer(input: {
  buyerId: string;
  collectionId: string;
  items: { articleId: string; note?: string }[];
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const collectionId = input.collectionId.trim();
  if (!collectionId) return { ok: false, storageMode: 'memory' };

  const normalized = input.items
    .map((item) => ({
      articleId: item.articleId.trim(),
      note: item.note?.trim() || undefined,
    }))
    .filter((item) => item.articleId.length > 0);

  for (const key of [...memory.keys()]) {
    const entry = memory.get(key);
    if (entry?.buyerId === buyerId && entry.collectionId === collectionId) {
      memory.delete(key);
    }
  }
  for (const item of normalized) {
    memory.set(scopeKey(buyerId, collectionId, item.articleId), {
      buyerId,
      collectionId,
      articleId: item.articleId,
      note: item.note,
      addedAt: new Date().toISOString(),
    });
  }

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const pool = getWorkshop2PgPool();
    await pool.query(
      `DELETE FROM shop_buyer_assortment_wishlist WHERE buyer_id = $1 AND collection_id = $2`,
      [buyerId, collectionId]
    );
    for (const item of normalized) {
      await pool.query(
        `INSERT INTO shop_buyer_assortment_wishlist (buyer_id, collection_id, article_id, note, added_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [buyerId, collectionId, item.articleId, item.note ?? null]
      );
    }
    return { ok: true, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  return { ok: true, storageMode: 'memory' };
}

export async function removeShopBuyerAssortmentWishlistServer(input: {
  buyerId: string;
  collectionId: string;
  articleId: string;
}): Promise<{ removed: boolean }> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  memory.delete(scopeKey(buyerId, collectionId, articleId));

  if (!isWorkshop2PostgresEnabled()) return { removed: true };
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `DELETE FROM shop_buyer_assortment_wishlist
     WHERE buyer_id = $1 AND collection_id = $2 AND article_id = $3`,
    [buyerId, collectionId, articleId]
  );
  return { removed: (res.rowCount ?? 0) > 0 };
}
