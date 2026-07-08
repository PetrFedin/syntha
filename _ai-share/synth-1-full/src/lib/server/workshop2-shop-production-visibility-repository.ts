import 'server-only';

import {
  DEFAULT_SHOP_PRODUCTION_VISIBILITY,
  getShopProductionVisibilityPolicy,
  isShopProductionVisibility,
  parseShopProductionVisibilityFromMetadata,
  type ShopProductionVisibility,
  type ShopProductionVisibilityPolicy,
} from '@/lib/platform-core-shop-production-visibility';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopProductionVisibilitySource = 'pg' | 'env_default';

export async function getCollectionShopProductionVisibility(
  collectionId: string
): Promise<{ visibility: ShopProductionVisibility; source: ShopProductionVisibilitySource }> {
  const cid = collectionId.trim();
  if (!cid || !isWorkshop2PostgresEnabled()) {
    return { visibility: DEFAULT_SHOP_PRODUCTION_VISIBILITY, source: 'env_default' };
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{ metadata: unknown }>(
    `SELECT metadata FROM workshop2_collections WHERE id = $1`,
    [cid]
  );
  const fromPg = parseShopProductionVisibilityFromMetadata(res.rows[0]?.metadata);
  if (fromPg) return { visibility: fromPg, source: 'pg' };
  return { visibility: DEFAULT_SHOP_PRODUCTION_VISIBILITY, source: 'env_default' };
}

export async function patchCollectionShopProductionVisibility(input: {
  collectionId: string;
  visibility: ShopProductionVisibility;
  organizationId?: string;
}): Promise<{ ok: true } | { ok: false; error: string; messageRu: string }> {
  const collectionId = input.collectionId.trim();
  if (!collectionId) {
    return { ok: false, error: 'missing_collection', messageRu: 'Не указана коллекция.' };
  }
  if (!isShopProductionVisibility(input.visibility)) {
    return { ok: false, error: 'invalid_visibility', messageRu: 'Недопустимый уровень раскрытия.' };
  }
  if (!isWorkshop2PostgresEnabled()) {
    return {
      ok: false,
      error: 'pg_disabled',
      messageRu: 'Регламент раскрытия доступен только при подключении к базе данных.',
    };
  }

  await ensureWorkshop2PgSchema();
  const pool = getWorkshop2PgPool();
  const res = await pool.query<{ metadata: unknown }>(
    `SELECT metadata FROM workshop2_collections WHERE id = $1`,
    [collectionId]
  );

  let metadata: Record<string, unknown> = {};
  const existing = res.rows[0]?.metadata;
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    metadata = { ...(existing as Record<string, unknown>) };
  }

  const b2bDisclosure =
    metadata.b2bDisclosure && typeof metadata.b2bDisclosure === 'object'
      ? { ...(metadata.b2bDisclosure as Record<string, unknown>) }
      : {};
  b2bDisclosure.shopProductionVisibility = input.visibility;
  metadata.b2bDisclosure = b2bDisclosure;

  await pool.query(
    `INSERT INTO workshop2_collections (id, organization_id, display_name, metadata, updated_at)
     VALUES ($1, $2, $3, $4::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       metadata = EXCLUDED.metadata,
       updated_at = NOW()`,
    [
      collectionId,
      input.organizationId?.trim() || 'org-brand-001',
      collectionId,
      JSON.stringify(metadata),
    ]
  );

  return { ok: true };
}

export async function resolveShopProductionVisibilityPolicyForCollection(
  collectionId?: string
): Promise<ShopProductionVisibilityPolicy> {
  const cid = collectionId?.trim() ?? '';
  if (!cid) return getShopProductionVisibilityPolicy();
  const { visibility } = await getCollectionShopProductionVisibility(cid);
  return getShopProductionVisibilityPolicy(visibility);
}

async function readOrderMetadataRow(
  orderId: string
): Promise<{ metadata: unknown; collectionId: string | null } | null> {
  const id = orderId.trim();
  if (!id || !isWorkshop2PostgresEnabled()) return null;
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{ metadata: unknown; collection_id: string | null }>(
    `SELECT metadata, collection_id FROM workshop2_b2b_orders WHERE id = $1`,
    [id]
  );
  const row = res.rows[0];
  if (!row) return null;
  return { metadata: row.metadata, collectionId: row.collection_id };
}

export async function getOrderShopProductionVisibility(
  orderId: string
): Promise<{ visibility?: ShopProductionVisibility; collectionId?: string }> {
  const row = await readOrderMetadataRow(orderId);
  if (!row) return {};
  const fromOrder = parseShopProductionVisibilityFromMetadata(row.metadata);
  return {
    visibility: fromOrder,
    collectionId: row.collectionId?.trim() || undefined,
  };
}

export async function patchOrderShopProductionVisibility(input: {
  orderId: string;
  visibility: ShopProductionVisibility | null;
}): Promise<{ ok: true } | { ok: false; error: string; messageRu: string }> {
  const orderId = input.orderId.trim();
  if (!orderId) {
    return { ok: false, error: 'missing_order', messageRu: 'Не указан заказ.' };
  }
  if (input.visibility != null && !isShopProductionVisibility(input.visibility)) {
    return { ok: false, error: 'invalid_visibility', messageRu: 'Недопустимый уровень раскрытия.' };
  }
  if (!isWorkshop2PostgresEnabled()) {
    return {
      ok: false,
      error: 'pg_disabled',
      messageRu: 'Переопределение доступно только при подключении к базе данных.',
    };
  }

  await ensureWorkshop2PgSchema();
  const pool = getWorkshop2PgPool();
  const res = await pool.query<{ metadata: unknown }>(
    `SELECT metadata FROM workshop2_b2b_orders WHERE id = $1`,
    [orderId]
  );
  if (!res.rows[0]) {
    return { ok: false, error: 'not_found', messageRu: 'B2B заказ не найден.' };
  }

  let metadata: Record<string, unknown> = {};
  const existing = res.rows[0].metadata;
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    metadata = { ...(existing as Record<string, unknown>) };
  }

  const b2bDisclosure =
    metadata.b2bDisclosure && typeof metadata.b2bDisclosure === 'object'
      ? { ...(metadata.b2bDisclosure as Record<string, unknown>) }
      : {};

  if (input.visibility == null) {
    delete b2bDisclosure.shopProductionVisibility;
  } else {
    b2bDisclosure.shopProductionVisibility = input.visibility;
  }

  if (Object.keys(b2bDisclosure).length > 0) {
    metadata.b2bDisclosure = b2bDisclosure;
  } else {
    delete metadata.b2bDisclosure;
  }

  await pool.query(
    `UPDATE workshop2_b2b_orders SET metadata = $2::jsonb, updated_at = NOW() WHERE id = $1`,
    [orderId, JSON.stringify(metadata)]
  );

  return { ok: true };
}

export type ShopProductionVisibilityResolveSource = 'order' | 'collection' | 'env_default';

export async function resolveShopProductionVisibilityPolicyForOrder(input: {
  orderId?: string;
  collectionId?: string;
}): Promise<
  ShopProductionVisibilityPolicy & {
    visibility: ShopProductionVisibility;
    source: ShopProductionVisibilityResolveSource;
  }
> {
  const orderId = input.orderId?.trim() ?? '';
  if (orderId) {
    const orderRow = await getOrderShopProductionVisibility(orderId);
    if (orderRow.visibility) {
      const visibility = orderRow.visibility;
      return {
        ...getShopProductionVisibilityPolicy(visibility),
        visibility,
        source: 'order',
      };
    }
    const collectionId = input.collectionId?.trim() || orderRow.collectionId || '';
    if (collectionId) {
      const { visibility, source } = await getCollectionShopProductionVisibility(collectionId);
      return {
        ...getShopProductionVisibilityPolicy(visibility),
        visibility,
        source: source === 'pg' ? 'collection' : 'env_default',
      };
    }
  }

  const collectionId = input.collectionId?.trim() ?? '';
  if (collectionId) {
    const { visibility, source } = await getCollectionShopProductionVisibility(collectionId);
    return {
      ...getShopProductionVisibilityPolicy(visibility),
      visibility,
      source: source === 'pg' ? 'collection' : 'env_default',
    };
  }

  const visibility = DEFAULT_SHOP_PRODUCTION_VISIBILITY;
  return {
    ...getShopProductionVisibilityPolicy(visibility),
    visibility,
    source: 'env_default',
  };
}
