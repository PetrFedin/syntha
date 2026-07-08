import 'server-only';

import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopB2bPartnershipPgStatus = 'requested' | 'connected';

export type ShopB2bPartnershipPgRow = {
  id: string;
  buyerId: string;
  brandId: string;
  brandSlug: string;
  status: ShopB2bPartnershipPgStatus;
  collectionId?: string;
  createdAt: string;
  updatedAt: string;
  connectedAt?: string;
};

const memoryRows = new Map<string, ShopB2bPartnershipPgRow>();

function rowKey(buyerId: string, brandId: string): string {
  return `${buyerId}:${brandId}`;
}

function rowToPartnership(row: {
  id: string;
  buyer_id: string;
  brand_id: string;
  brand_slug: string;
  status: string;
  collection_id: string | null;
  created_at: Date;
  updated_at: Date;
  connected_at: Date | null;
}): ShopB2bPartnershipPgRow {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    brandId: row.brand_id,
    brandSlug: row.brand_slug,
    status: row.status as ShopB2bPartnershipPgStatus,
    collectionId: row.collection_id ?? undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    connectedAt: row.connected_at?.toISOString(),
  };
}

export function clearShopB2bPartnershipPgMemoryForTests(): void {
  memoryRows.clear();
}

export async function listShopB2bPartnershipRowsPg(
  buyerId: string
): Promise<ShopB2bPartnershipPgRow[]> {
  const bid = buyerId.trim();
  if (!bid) return [];

  if (!isWorkshop2PostgresEnabled()) {
    return [...memoryRows.values()].filter((r) => r.buyerId === bid);
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT id, buyer_id, brand_id, brand_slug, status, collection_id, created_at, updated_at, connected_at
     FROM shop_b2b_partnerships
     WHERE buyer_id = $1
     ORDER BY updated_at DESC`,
    [bid]
  );
  return res.rows.map((row) => rowToPartnership(row as Parameters<typeof rowToPartnership>[0]));
}

export async function upsertShopB2bPartnershipPg(input: {
  buyerId: string;
  brandId: string;
  brandSlug: string;
  status: ShopB2bPartnershipPgStatus;
  collectionId?: string;
}): Promise<ShopB2bPartnershipPgRow> {
  const buyerId = input.buyerId.trim();
  const brandId = input.brandId.trim();
  const brandSlug = input.brandSlug.trim();
  const collectionId = input.collectionId?.trim() || null;
  const now = new Date().toISOString();
  const id = `partnership-${buyerId}-${brandId}`;
  const connectedAt = input.status === 'connected' ? now : undefined;

  if (!isWorkshop2PostgresEnabled()) {
    const existing = memoryRows.get(rowKey(buyerId, brandId));
    const row: ShopB2bPartnershipPgRow = {
      id,
      buyerId,
      brandId,
      brandSlug,
      status: input.status,
      collectionId: collectionId ?? undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      connectedAt: input.status === 'connected' ? now : existing?.connectedAt,
    };
    memoryRows.set(rowKey(buyerId, brandId), row);
    return row;
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `INSERT INTO shop_b2b_partnerships
       (id, buyer_id, brand_id, brand_slug, status, collection_id, connected_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, NOW())
     ON CONFLICT (buyer_id, brand_id) DO UPDATE SET
       status = EXCLUDED.status,
       brand_slug = EXCLUDED.brand_slug,
       collection_id = COALESCE(EXCLUDED.collection_id, shop_b2b_partnerships.collection_id),
       connected_at = CASE
         WHEN EXCLUDED.status = 'connected' THEN COALESCE(shop_b2b_partnerships.connected_at, EXCLUDED.connected_at)
         ELSE shop_b2b_partnerships.connected_at
       END,
       updated_at = NOW()
     RETURNING id, buyer_id, brand_id, brand_slug, status, collection_id, created_at, updated_at, connected_at`,
    [id, buyerId, brandId, brandSlug, input.status, collectionId, connectedAt]
  );
  return rowToPartnership(res.rows[0] as Parameters<typeof rowToPartnership>[0]);
}
