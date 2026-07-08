import 'server-only';

import { shopB2bMatrixReorderHref } from '@/lib/routes';
import { getShopBuyerCrmProfileServer } from '@/lib/server/shop-buyer-crm-profile-repository';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopGreenfieldOnboardingState = {
  buyerId: string;
  collectionId: string;
  crmReady: boolean;
  pricelistReady: boolean;
  firstOrderId?: string;
  matrixSeedHref?: string;
  updatedAt: string;
};

const memory = new Map<string, ShopGreenfieldOnboardingState>();

function scopeKey(buyerId: string, collectionId: string): string {
  return `${buyerId.trim()}::${collectionId.trim()}`;
}

async function readPgRow(
  buyerId: string,
  collectionId: string
): Promise<ShopGreenfieldOnboardingState | null> {
  if (!isWorkshop2PostgresEnabled()) return null;
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{
    buyer_id: string;
    collection_id: string;
    crm_ready: boolean;
    pricelist_ready: boolean;
    first_order_id: string | null;
    matrix_seed_href: string | null;
    updated_at: Date;
  }>(
    `SELECT buyer_id, collection_id, crm_ready, pricelist_ready, first_order_id, matrix_seed_href, updated_at
     FROM shop_greenfield_onboarding WHERE buyer_id = $1 AND collection_id = $2`,
    [buyerId, collectionId]
  );
  const row = res.rows[0];
  if (!row) return null;
  return {
    buyerId: row.buyer_id,
    collectionId: row.collection_id,
    crmReady: row.crm_ready,
    pricelistReady: row.pricelist_ready,
    firstOrderId: row.first_order_id ?? undefined,
    matrixSeedHref: row.matrix_seed_href ?? undefined,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getShopGreenfieldOnboardingServer(input: {
  buyerId: string;
  collectionId: string;
}): Promise<{ state: ShopGreenfieldOnboardingState; storageMode: 'postgres' | 'memory' }> {
  const buyerId = input.buyerId.trim() || 'shop2';
  const collectionId = input.collectionId.trim() || 'SS27';

  const { profile: crm } = await getShopBuyerCrmProfileServer({ buyerId });
  const crmReady = Boolean(crm?.segmentKey);

  let row = await readPgRow(buyerId, collectionId);
  if (!row && isWorkshop2PostgresEnabled()) {
    row = {
      buyerId,
      collectionId,
      crmReady,
      pricelistReady: crmReady,
      matrixSeedHref: shopB2bMatrixReorderHref(collectionId, ''),
      updatedAt: new Date().toISOString(),
    };
    await upsertShopGreenfieldOnboardingServer(row);
  }

  if (!row) {
    row = memory.get(scopeKey(buyerId, collectionId)) ?? {
      buyerId,
      collectionId,
      crmReady,
      pricelistReady: crmReady,
      matrixSeedHref: shopB2bMatrixReorderHref(collectionId, ''),
      updatedAt: new Date().toISOString(),
    };
    memory.set(scopeKey(buyerId, collectionId), row);
    return { state: row, storageMode: 'memory' };
  }

  const merged: ShopGreenfieldOnboardingState = {
    ...row,
    crmReady: row.crmReady || crmReady,
    pricelistReady: row.pricelistReady || crmReady,
    matrixSeedHref:
      row.matrixSeedHref ?? shopB2bMatrixReorderHref(collectionId, row.firstOrderId ?? ''),
  };
  memory.set(scopeKey(buyerId, collectionId), merged);
  return {
    state: merged,
    storageMode: isWorkshop2PostgresEnabled() ? 'postgres' : 'memory',
  };
}

export async function upsertShopGreenfieldOnboardingServer(
  state: ShopGreenfieldOnboardingState
): Promise<void> {
  const next = { ...state, updatedAt: new Date().toISOString() };
  memory.set(scopeKey(next.buyerId, next.collectionId), next);

  if (!isWorkshop2PostgresEnabled()) return;
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO shop_greenfield_onboarding
       (buyer_id, collection_id, crm_ready, pricelist_ready, first_order_id, matrix_seed_href, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7::timestamptz)
     ON CONFLICT (buyer_id, collection_id) DO UPDATE SET
       crm_ready = EXCLUDED.crm_ready,
       pricelist_ready = EXCLUDED.pricelist_ready,
       first_order_id = COALESCE(EXCLUDED.first_order_id, shop_greenfield_onboarding.first_order_id),
       matrix_seed_href = COALESCE(EXCLUDED.matrix_seed_href, shop_greenfield_onboarding.matrix_seed_href),
       updated_at = EXCLUDED.updated_at`,
    [
      next.buyerId,
      next.collectionId,
      next.crmReady,
      next.pricelistReady,
      next.firstOrderId ?? null,
      next.matrixSeedHref ?? null,
      next.updatedAt,
    ]
  );
}

export async function markShopGreenfieldFirstOrderServer(input: {
  buyerId: string;
  collectionId: string;
  orderId: string;
}): Promise<ShopGreenfieldOnboardingState> {
  const { state } = await getShopGreenfieldOnboardingServer(input);
  const next: ShopGreenfieldOnboardingState = {
    ...state,
    firstOrderId: input.orderId.trim(),
    matrixSeedHref: shopB2bMatrixReorderHref(input.collectionId, input.orderId.trim()),
    updatedAt: new Date().toISOString(),
  };
  await upsertShopGreenfieldOnboardingServer(next);
  return next;
}
