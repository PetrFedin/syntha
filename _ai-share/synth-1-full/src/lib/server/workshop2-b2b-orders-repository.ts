import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  canTransitionWorkshop2B2bOrderStatus,
  isWorkshop2B2bOrderStatus,
  type Workshop2B2bOrderRecord,
  type Workshop2B2bOrderStatus,
  type Workshop2B2bPaymentTermsRu,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { isWorkshop2B2bPaymentTermsRu } from '@/lib/production/workshop2-b2b-wave22-parity';
import { resolveWorkshop2RetailerBuyerIds } from '@/lib/b2b/workshop2-retailer-buyer-bridge';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';
import { shouldWorkshop2PersistAuxiliaryJsonToFile } from '@/lib/server/platform-core-pg-primary-file-policy';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PLATFORM_CORE_PINNED_B2B_ORDER_IDS } from '@/lib/platform-core-demo-context';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const STORE_FILE = path.join(process.cwd(), 'data', 'workshop2-b2b-orders.json');

/** Только NODE_ENV=test — runtime без in-process Map (file или PG). */
let testFallbackStore: Map<string, Workshop2B2bOrderRecord> | null = null;

const B2B_ORDER_SELECT_COLUMNS = `id, collection_id, article_id, buyer_id, rep_id, status, tier, total_rub,
              lines, commission_preview, metadata, created_at, updated_at`;

function mergeB2bOrdersById(
  primary: Workshop2B2bOrderRecord[],
  extra: Workshop2B2bOrderRecord[]
): Workshop2B2bOrderRecord[] {
  const byId = new Map<string, Workshop2B2bOrderRecord>();
  for (const order of extra) byId.set(order.id, order);
  for (const order of primary) {
    if (!byId.has(order.id)) byId.set(order.id, order);
  }
  return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function fetchPinnedPlatformCoreB2bOrdersForCollection(
  collectionId: string
): Promise<Workshop2B2bOrderRecord[]> {
  if (!isPlatformCoreMode()) return [];
  const pinnedIds = PLATFORM_CORE_PINNED_B2B_ORDER_IDS[collectionId.trim()] ?? [];
  if (pinnedIds.length === 0) return [];
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT ${B2B_ORDER_SELECT_COLUMNS}
       FROM workshop2_b2b_orders WHERE collection_id = $1 AND id = ANY($2::text[])`,
    [collectionId.trim(), pinnedIds]
  );
  return res.rows.map(rowToRecord);
}

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test' && shouldWorkshop2PersistAuxiliaryJsonToFile();
}

function readFallbackOrdersFromFile(): Workshop2B2bOrderRecord[] {
  if (!canUseDiskPersistence()) return [];
  try {
    if (!fs.existsSync(STORE_FILE)) return [];
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as Workshop2B2bOrderRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFallbackOrdersToFile(orders: Workshop2B2bOrderRecord[]): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch {
    /* best-effort */
  }
}

function readFallbackOrderMap(): Map<string, Workshop2B2bOrderRecord> {
  if (process.env.NODE_ENV === 'test') {
    return new Map(testFallbackStore ?? []);
  }
  return new Map(readFallbackOrdersFromFile().map((o) => [o.id, o]));
}

function writeFallbackOrderMap(map: Map<string, Workshop2B2bOrderRecord>): void {
  if (process.env.NODE_ENV === 'test') {
    testFallbackStore = map;
    return;
  }
  writeFallbackOrdersToFile([...map.values()]);
}

function metadataToOrderFields(
  metadata: unknown
): Pick<
  Workshop2B2bOrderRecord,
  'requestedDeliveryDate' | 'paymentTermsRu' | 'paymentTermsDays' | 'buyerDeliveryAcknowledgedAt'
> {
  if (!metadata || typeof metadata !== 'object') return {};
  const m = metadata as Record<string, unknown>;
  const paymentTermsRu = String(m.paymentTermsRu ?? '');
  return {
    requestedDeliveryDate:
      typeof m.requestedDeliveryDate === 'string' ? m.requestedDeliveryDate : undefined,
    paymentTermsRu: isWorkshop2B2bPaymentTermsRu(paymentTermsRu)
      ? (paymentTermsRu as Workshop2B2bPaymentTermsRu)
      : undefined,
    paymentTermsDays: typeof m.paymentTermsDays === 'number' ? m.paymentTermsDays : undefined,
    buyerDeliveryAcknowledgedAt:
      typeof m.buyerDeliveryAcknowledgedAt === 'string' ? m.buyerDeliveryAcknowledgedAt : undefined,
  };
}

function orderToMetadata(order: Workshop2B2bOrderRecord): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  if (order.requestedDeliveryDate) meta.requestedDeliveryDate = order.requestedDeliveryDate;
  if (order.paymentTermsRu) meta.paymentTermsRu = order.paymentTermsRu;
  if (order.paymentTermsDays != null) meta.paymentTermsDays = order.paymentTermsDays;
  if (order.buyerDeliveryAcknowledgedAt) {
    meta.buyerDeliveryAcknowledgedAt = order.buyerDeliveryAcknowledgedAt;
  }
  return meta;
}

function rowToRecord(row: {
  id: string;
  collection_id: string | null;
  article_id: string | null;
  buyer_id: string | null;
  rep_id: string | null;
  status: string;
  tier: string;
  total_rub: string;
  lines: unknown;
  commission_preview: unknown;
  metadata?: unknown;
  created_at: Date;
  updated_at: Date;
}): Workshop2B2bOrderRecord {
  const tierRaw = String(row.tier ?? 'standard');
  const tier = tierRaw === 'vip' || tierRaw === 'prebook' ? tierRaw : ('standard' as const);
  const status = isWorkshop2B2bOrderStatus(row.status) ? row.status : 'draft';
  return {
    id: row.id,
    collectionId: row.collection_id ?? undefined,
    articleId: row.article_id ?? undefined,
    buyerId: row.buyer_id ?? undefined,
    repId: row.rep_id ?? undefined,
    status,
    tier,
    totalRub: Number(row.total_rub) || 0,
    lines: Array.isArray(row.lines) ? (row.lines as Workshop2B2bOrderRecord['lines']) : [],
    commissionPreview:
      row.commission_preview && typeof row.commission_preview === 'object'
        ? (row.commission_preview as Workshop2B2bOrderRecord['commissionPreview'])
        : undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    ...metadataToOrderFields(row.metadata),
  };
}

export async function getWorkshop2B2bOrder(
  orderId: string
): Promise<Workshop2B2bOrderRecord | null> {
  const id = orderId.trim();
  if (!id) return null;

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query(
      `SELECT id, collection_id, article_id, buyer_id, rep_id, status, tier, total_rub,
              lines, commission_preview, metadata, created_at, updated_at
       FROM workshop2_b2b_orders WHERE id = $1`,
      [id]
    );
    const row = res.rows[0];
    return row ? rowToRecord(row) : null;
  }

  if (isWorkshop2PgOnlyMode()) return null;

  return readFallbackOrderMap().get(id) ?? null;
}

export async function putWorkshop2B2bOrder(
  order: Workshop2B2bOrderRecord,
  organizationId = 'org-brand-001'
): Promise<{ persisted: boolean; mode: 'postgres' | 'file' | 'memory' | 'pg_only_blocked' }> {
  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO workshop2_b2b_orders
         (id, organization_id, collection_id, article_id, buyer_id, rep_id, status, tier,
          total_rub, lines, commission_preview, metadata, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13::timestamptz,$14::timestamptz)
       ON CONFLICT (id) DO UPDATE SET
         collection_id = EXCLUDED.collection_id,
         article_id = EXCLUDED.article_id,
         buyer_id = EXCLUDED.buyer_id,
         rep_id = EXCLUDED.rep_id,
         status = EXCLUDED.status,
         tier = EXCLUDED.tier,
         total_rub = EXCLUDED.total_rub,
         lines = EXCLUDED.lines,
         commission_preview = EXCLUDED.commission_preview,
         metadata = EXCLUDED.metadata,
         updated_at = EXCLUDED.updated_at`,
      [
        order.id,
        organizationId,
        order.collectionId ?? null,
        order.articleId ?? null,
        order.buyerId ?? null,
        order.repId ?? null,
        order.status,
        order.tier,
        order.totalRub,
        JSON.stringify(order.lines),
        order.commissionPreview ? JSON.stringify(order.commissionPreview) : null,
        JSON.stringify(orderToMetadata(order)),
        order.createdAt,
        order.updatedAt,
      ]
    );
    void import('@/lib/server/workshop2-b2b-invoice-repository')
      .then(({ upsertWorkshop2B2bInvoiceForOrder }) =>
        upsertWorkshop2B2bInvoiceForOrder({
          orderId: order.id,
          brandId: order.brandId,
          tenantId: order.buyerId ?? order.brandId,
          totalRub: order.totalRub,
          status: order.status === 'draft' ? 'draft' : 'issued',
        })
      )
      .catch(() => {});
    return { persisted: true, mode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) {
    return { persisted: false, mode: 'pg_only_blocked' };
  }

  const map = readFallbackOrderMap();
  map.set(order.id, order);
  writeFallbackOrderMap(map);
  return { persisted: true, mode: canUseDiskPersistence() ? 'file' : 'memory' };
}

export async function patchWorkshop2B2bOrderStatus(input: {
  orderId: string;
  status: Workshop2B2bOrderStatus;
  commissionPreview?: Workshop2B2bOrderRecord['commissionPreview'];
}): Promise<
  | { ok: true; order: Workshop2B2bOrderRecord; previousStatus: Workshop2B2bOrderStatus }
  | { ok: false; code: 'not_found' | 'invalid_transition' | 'qc_gate_blocked'; messageRu: string }
> {
  const existing = await getWorkshop2B2bOrder(input.orderId);
  if (!existing) {
    return { ok: false, code: 'not_found', messageRu: 'B2B заказ не найден.' };
  }
  if (
    existing.status !== input.status &&
    !canTransitionWorkshop2B2bOrderStatus(existing.status, input.status)
  ) {
    return {
      ok: false,
      code: 'invalid_transition',
      messageRu: `Переход ${existing.status} → ${input.status} запрещён.`,
    };
  }
  if (input.status === 'shipped' && existing.status !== 'shipped') {
    const { assertWorkshop2QcGateAllowsOrderShipment } =
      await import('@/lib/server/workshop2-qc-gate-repository');
    const qc = await assertWorkshop2QcGateAllowsOrderShipment(input.orderId);
    if (!qc.ok) {
      return { ok: false, code: qc.code, messageRu: qc.messageRu };
    }
  }
  const now = new Date().toISOString();
  const next: Workshop2B2bOrderRecord = {
    ...existing,
    status: input.status,
    updatedAt: now,
    commissionPreview: input.commissionPreview ?? existing.commissionPreview,
  };
  await putWorkshop2B2bOrder(next);
  if (existing.status !== next.status) {
    const { bumpPlatformCoreChainStatus } =
      await import('@/lib/server/platform-core-chain-status-hub');
    bumpPlatformCoreChainStatus([next.id]);
    const { bumpPlatformCoreB2bRegistry } =
      await import('@/lib/server/platform-core-b2b-registry-hub');
    bumpPlatformCoreB2bRegistry('b2b.order.status_changed');
  }
  return { ok: true, order: next, previousStatus: existing.status };
}

export function clearWorkshop2B2bOrdersMemoryForTests(): void {
  testFallbackStore = new Map();
}

/** Wave 26: все B2B-заказы для credit scoring (file-store / PG). */
export async function listWorkshop2B2bOrdersAll(): Promise<Workshop2B2bOrderRecord[]> {
  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query(
      `SELECT id, collection_id, article_id, buyer_id, rep_id, status, tier, total_rub,
              lines, commission_preview, metadata, created_at, updated_at
       FROM workshop2_b2b_orders ORDER BY updated_at DESC LIMIT 500`
    );
    return res.rows.map(rowToRecord);
  }

  if (isWorkshop2PgOnlyMode()) return [];

  return [...readFallbackOrderMap().values()];
}

/** CRM bridge: заказы по buyerId / repId партнёра. */
export async function listWorkshop2B2bOrdersForBuyer(
  buyerId: string
): Promise<Workshop2B2bOrderRecord[]> {
  const buyerIds = resolveWorkshop2RetailerBuyerIds(buyerId);
  if (!buyerIds.length) return [];

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query(
      `SELECT id, collection_id, article_id, buyer_id, rep_id, status, tier, total_rub,
              lines, commission_preview, metadata, created_at, updated_at
       FROM workshop2_b2b_orders
       WHERE buyer_id = ANY($1::text[]) OR rep_id = ANY($1::text[])
       ORDER BY updated_at DESC
       LIMIT 50`,
      [buyerIds]
    );
    return res.rows.map(rowToRecord);
  }

  if (isWorkshop2PgOnlyMode()) return [];

  const set = new Set(buyerIds);
  return [...readFallbackOrderMap().values()].filter(
    (o) => (o.buyerId && set.has(o.buyerId)) || (o.repId && set.has(o.repId))
  );
}

/** Wave 22: заказы коллекции для brand analytics. */
export async function listWorkshop2B2bOrdersForCollection(
  collectionId: string
): Promise<Workshop2B2bOrderRecord[]> {
  const cid = collectionId.trim();
  if (!cid) return [];

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query(
      `SELECT ${B2B_ORDER_SELECT_COLUMNS}
       FROM workshop2_b2b_orders WHERE collection_id = $1 ORDER BY updated_at DESC LIMIT 200`,
      [cid]
    );
    const recent = res.rows.map(rowToRecord);
    const pinned = await fetchPinnedPlatformCoreB2bOrdersForCollection(cid);
    return mergeB2bOrdersById(recent, pinned);
  }

  if (isWorkshop2PgOnlyMode()) return [];

  return [...readFallbackOrderMap().values()].filter((o) => o.collectionId === cid);
}

export async function patchWorkshop2B2bOrderCheckoutFields(input: {
  orderId: string;
  requestedDeliveryDate?: string;
  paymentTermsRu?: Workshop2B2bPaymentTermsRu;
  paymentTermsDays?: number;
}): Promise<
  { ok: true; order: Workshop2B2bOrderRecord } | { ok: false; code: 'not_found'; messageRu: string }
> {
  const existing = await getWorkshop2B2bOrder(input.orderId);
  if (!existing) {
    return { ok: false, code: 'not_found', messageRu: 'B2B заказ не найден.' };
  }
  const next: Workshop2B2bOrderRecord = {
    ...existing,
    requestedDeliveryDate: input.requestedDeliveryDate ?? existing.requestedDeliveryDate,
    paymentTermsRu: input.paymentTermsRu ?? existing.paymentTermsRu,
    paymentTermsDays: input.paymentTermsDays ?? existing.paymentTermsDays,
    updatedAt: new Date().toISOString(),
  };
  await putWorkshop2B2bOrder(next);
  return { ok: true, order: next };
}

/** Wave 23: заказы по articleId для chip в W2 header. */
export async function listWorkshop2B2bOrdersForArticle(input: {
  articleId: string;
  collectionId?: string;
}): Promise<Workshop2B2bOrderRecord[]> {
  const aid = input.articleId.trim();
  if (!aid) return [];

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query(
      `SELECT id, collection_id, article_id, buyer_id, rep_id, status, tier, total_rub,
              lines, commission_preview, metadata, created_at, updated_at
       FROM workshop2_b2b_orders
       WHERE article_id = $1 OR lines::text LIKE $2
       ORDER BY updated_at DESC
       LIMIT 50`,
      [aid, `%${aid}%`]
    );
    return res.rows.map(rowToRecord);
  }

  if (isWorkshop2PgOnlyMode()) return [];

  return [...readFallbackOrderMap().values()].filter(
    (o) => o.articleId === aid || o.lines.some((l) => l.articleId === aid)
  );
}
