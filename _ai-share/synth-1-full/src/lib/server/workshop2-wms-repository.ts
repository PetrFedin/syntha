import 'server-only';

import { randomUUID } from 'node:crypto';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type Workshop2WmsMovementKind = 'reserve' | 'release' | 'receipt' | 'issue';

export type Workshop2WmsItem = {
  id: string;
  collectionId: string;
  sku: string;
  label: string;
  unit: string;
  materialRef?: string;
  externalId?: string;
};

export type Workshop2WmsBalance = {
  itemId: string;
  collectionId: string;
  sku: string;
  label: string;
  unit: string;
  locationCode: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
  supplyLineRef?: string;
  bomLineRef?: string;
};

export type Workshop2WmsMovement = {
  id: string;
  collectionId: string;
  articleId: string;
  kind: Workshop2WmsMovementKind;
  qty: number;
  bomLineRef?: string;
  supplyLineRef?: string;
  itemId?: string;
  locationCode: string;
  actor?: string;
  note?: string;
  createdAt: string;
};

export const WORKSHOP2_WMS_DEFAULT_LOCATION = 'WORKSHOP2-WH';

type MemoryStore = {
  items: Map<string, Workshop2WmsItem>;
  balances: Map<string, { qtyOnHand: number; qtyReserved: number }>;
  movements: Workshop2WmsMovement[];
};

const memoryByCollection = new Map<string, MemoryStore>();

function memoryKey(collectionId: string): string {
  return collectionId.trim();
}

function getMemoryStore(collectionId: string): MemoryStore {
  const key = memoryKey(collectionId);
  let store = memoryByCollection.get(key);
  if (!store) {
    store = { items: new Map(), balances: new Map(), movements: [] };
    memoryByCollection.set(key, store);
  }
  return store;
}

function balanceKey(itemId: string, locationCode: string): string {
  return `${itemId}::${locationCode}`;
}

function mapPgBalanceRow(r: {
  item_id: string;
  collection_id: string;
  sku: string;
  label: string;
  unit: string;
  location_code: string;
  qty_on_hand: string | number;
  qty_reserved: string | number;
}): Workshop2WmsBalance {
  const onHand = Number(r.qty_on_hand) || 0;
  const reserved = Number(r.qty_reserved) || 0;
  return {
    itemId: r.item_id,
    collectionId: r.collection_id,
    sku: r.sku,
    label: r.label,
    unit: r.unit,
    locationCode: r.location_code,
    qtyOnHand: onHand,
    qtyReserved: reserved,
    qtyAvailable: onHand - reserved,
  };
}

function mapPgMovementRow(r: {
  id: string;
  collection_id: string;
  article_id: string;
  kind: string;
  qty: string | number;
  bom_line_ref: string | null;
  supply_line_ref: string | null;
  item_id: string | null;
  location_code: string;
  actor: string | null;
  note: string | null;
  created_at: Date;
}): Workshop2WmsMovement {
  return {
    id: r.id,
    collectionId: r.collection_id,
    articleId: r.article_id,
    kind: r.kind as Workshop2WmsMovementKind,
    qty: Number(r.qty) || 0,
    bomLineRef: r.bom_line_ref ?? undefined,
    supplyLineRef: r.supply_line_ref ?? undefined,
    itemId: r.item_id ?? undefined,
    locationCode: r.location_code,
    actor: r.actor ?? undefined,
    note: r.note ?? undefined,
    createdAt: r.created_at.toISOString(),
  };
}

export async function upsertWorkshop2WmsItem(input: {
  collectionId: string;
  sku: string;
  label: string;
  unit?: string;
  materialRef?: string;
  externalId?: string;
  id?: string;
}): Promise<Workshop2WmsItem> {
  const collectionId = input.collectionId.trim();
  const sku = input.sku.trim();
  const label = input.label.trim() || sku;
  const unit = (input.unit ?? 'ед.').trim() || 'ед.';
  const id =
    input.id?.trim() || `wms-${collectionId}-${sku.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 48)}`;

  if (!isWorkshop2PostgresEnabled()) {
    const store = getMemoryStore(collectionId);
    const item: Workshop2WmsItem = {
      id,
      collectionId,
      sku,
      label,
      unit,
      materialRef: input.materialRef?.trim() || undefined,
      externalId: input.externalId?.trim() || undefined,
    };
    store.items.set(id, item);
    const bKey = balanceKey(id, WORKSHOP2_WMS_DEFAULT_LOCATION);
    if (!store.balances.has(bKey)) {
      store.balances.set(bKey, { qtyOnHand: 0, qtyReserved: 0 });
    }
    return item;
  }

  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_wms_items (id, collection_id, sku, label, unit, material_ref, external_id, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (collection_id, sku) DO UPDATE SET
       label = EXCLUDED.label,
       unit = EXCLUDED.unit,
       material_ref = COALESCE(EXCLUDED.material_ref, workshop2_wms_items.material_ref),
       external_id = COALESCE(EXCLUDED.external_id, workshop2_wms_items.external_id),
       updated_at = NOW()
     RETURNING id`,
    [id, collectionId, sku, label, unit, input.materialRef ?? null, input.externalId ?? null]
  );

  const res = await getWorkshop2PgPool().query<{
    id: string;
    collection_id: string;
    sku: string;
    label: string;
    unit: string;
    material_ref: string | null;
    external_id: string | null;
  }>(
    `SELECT id, collection_id, sku, label, unit, material_ref, external_id
     FROM workshop2_wms_items WHERE collection_id = $1 AND sku = $2`,
    [collectionId, sku]
  );
  const row = res.rows[0]!;
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_wms_balances (item_id, location_code, qty_on_hand, qty_reserved, updated_at)
     VALUES ($1, $2, 0, 0, NOW())
     ON CONFLICT (item_id, location_code) DO NOTHING`,
    [row.id, WORKSHOP2_WMS_DEFAULT_LOCATION]
  );
  return {
    id: row.id,
    collectionId: row.collection_id,
    sku: row.sku,
    label: row.label,
    unit: row.unit,
    materialRef: row.material_ref ?? undefined,
    externalId: row.external_id ?? undefined,
  };
}

export async function listWorkshop2WmsBalancesForArticle(input: {
  collectionId: string;
  articleId: string;
  locationCode?: string;
  supplyLineRefs?: string[];
}): Promise<Workshop2WmsBalance[]> {
  const locationCode = input.locationCode?.trim() || WORKSHOP2_WMS_DEFAULT_LOCATION;

  if (!isWorkshop2PostgresEnabled()) {
    const store = getMemoryStore(input.collectionId);
    const balances: Workshop2WmsBalance[] = [];
    for (const [itemId, item] of store.items) {
      const b = store.balances.get(balanceKey(itemId, locationCode)) ?? {
        qtyOnHand: 0,
        qtyReserved: 0,
      };
      balances.push({
        itemId,
        collectionId: item.collectionId,
        sku: item.sku,
        label: item.label,
        unit: item.unit,
        locationCode,
        qtyOnHand: b.qtyOnHand,
        qtyReserved: b.qtyReserved,
        qtyAvailable: b.qtyOnHand - b.qtyReserved,
      });
    }
    return balances;
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT i.id AS item_id, i.collection_id, i.sku, i.label, i.unit,
            b.location_code, b.qty_on_hand, b.qty_reserved
     FROM workshop2_wms_items i
     JOIN workshop2_wms_balances b ON b.item_id = i.id
     WHERE i.collection_id = $1 AND b.location_code = $2
     ORDER BY i.label`,
    [input.collectionId, locationCode]
  );
  return res.rows.map((r) => mapPgBalanceRow(r as Parameters<typeof mapPgBalanceRow>[0]));
}

/** Wave SG · все WMS balances коллекции (ATP feed для replenishment). */
export async function listWorkshop2WmsBalancesForCollection(input: {
  collectionId: string;
  locationCode?: string;
  limit?: number;
}): Promise<Workshop2WmsBalance[]> {
  const collectionId = input.collectionId.trim();
  const locationCode = input.locationCode?.trim() || WORKSHOP2_WMS_DEFAULT_LOCATION;
  const limit = Math.min(Math.max(input.limit ?? 48, 1), 96);

  if (!isWorkshop2PostgresEnabled()) {
    const store = getMemoryStore(collectionId);
    const balances: Workshop2WmsBalance[] = [];
    for (const [itemId, item] of store.items) {
      if (item.collectionId !== collectionId) continue;
      const b = store.balances.get(balanceKey(itemId, locationCode)) ?? {
        qtyOnHand: 0,
        qtyReserved: 0,
      };
      balances.push({
        itemId,
        collectionId: item.collectionId,
        sku: item.sku,
        label: item.label,
        unit: item.unit,
        locationCode,
        qtyOnHand: b.qtyOnHand,
        qtyReserved: b.qtyReserved,
        qtyAvailable: b.qtyOnHand - b.qtyReserved,
      });
    }
    return balances.slice(0, limit);
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT i.id AS item_id, i.collection_id, i.sku, i.label, i.unit,
            b.location_code, b.qty_on_hand, b.qty_reserved
     FROM workshop2_wms_items i
     JOIN workshop2_wms_balances b ON b.item_id = i.id
     WHERE i.collection_id = $1 AND b.location_code = $2
     ORDER BY i.label
     LIMIT $3`,
    [collectionId, locationCode, limit]
  );
  return res.rows.map((r) => mapPgBalanceRow(r as Parameters<typeof mapPgBalanceRow>[0]));
}

export async function listWorkshop2WmsMovements(input: {
  collectionId: string;
  articleId: string;
  limit?: number;
}): Promise<Workshop2WmsMovement[]> {
  const limit = Math.min(200, Math.max(1, input.limit ?? 50));

  if (!isWorkshop2PostgresEnabled()) {
    const store = getMemoryStore(input.collectionId);
    return store.movements
      .filter(
        (m) =>
          m.collectionId === input.collectionId.trim() && m.articleId === input.articleId.trim()
      )
      .slice(-limit)
      .reverse();
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT * FROM workshop2_wms_movements
     WHERE collection_id = $1 AND article_id = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [input.collectionId, input.articleId, limit]
  );
  return res.rows.map((r) => mapPgMovementRow(r as Parameters<typeof mapPgMovementRow>[0]));
}

export async function recordWorkshop2WmsMovement(input: {
  collectionId: string;
  articleId: string;
  kind: Workshop2WmsMovementKind;
  qty: number;
  itemId: string;
  locationCode?: string;
  bomLineRef?: string;
  supplyLineRef?: string;
  actor?: string;
  note?: string;
}): Promise<{ movement: Workshop2WmsMovement; balance: Workshop2WmsBalance }> {
  const qty = Math.max(0, Number(input.qty) || 0);
  const locationCode = input.locationCode?.trim() || WORKSHOP2_WMS_DEFAULT_LOCATION;
  const id = randomUUID();
  const now = new Date().toISOString();

  if (!isWorkshop2PostgresEnabled()) {
    const store = getMemoryStore(input.collectionId);
    const item = store.items.get(input.itemId);
    if (!item) throw new Error('WMS_ITEM_NOT_FOUND');
    const bKey = balanceKey(input.itemId, locationCode);
    const bal = store.balances.get(bKey) ?? { qtyOnHand: 0, qtyReserved: 0 };
    if (input.kind === 'reserve') bal.qtyReserved += qty;
    else if (input.kind === 'release') bal.qtyReserved = Math.max(0, bal.qtyReserved - qty);
    else if (input.kind === 'receipt') bal.qtyOnHand += qty;
    else if (input.kind === 'issue') {
      bal.qtyOnHand = Math.max(0, bal.qtyOnHand - qty);
      bal.qtyReserved = Math.max(0, bal.qtyReserved - qty);
    }
    store.balances.set(bKey, bal);
    const movement: Workshop2WmsMovement = {
      id,
      collectionId: input.collectionId,
      articleId: input.articleId,
      kind: input.kind,
      qty,
      itemId: input.itemId,
      locationCode,
      bomLineRef: input.bomLineRef,
      supplyLineRef: input.supplyLineRef,
      actor: input.actor,
      note: input.note,
      createdAt: now,
    };
    store.movements.push(movement);
    return {
      movement,
      balance: {
        itemId: item.id,
        collectionId: item.collectionId,
        sku: item.sku,
        label: item.label,
        unit: item.unit,
        locationCode,
        qtyOnHand: bal.qtyOnHand,
        qtyReserved: bal.qtyReserved,
        qtyAvailable: bal.qtyOnHand - bal.qtyReserved,
        supplyLineRef: input.supplyLineRef,
        bomLineRef: input.bomLineRef,
      },
    };
  }

  await ensureWorkshop2PgSchema();
  const client = await getWorkshop2PgPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO workshop2_wms_movements
         (id, collection_id, article_id, kind, qty, bom_line_ref, supply_line_ref, item_id, location_code, actor, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        id,
        input.collectionId,
        input.articleId,
        input.kind,
        qty,
        input.bomLineRef ?? null,
        input.supplyLineRef ?? null,
        input.itemId,
        locationCode,
        input.actor ?? null,
        input.note ?? null,
      ]
    );

    if (input.kind === 'reserve') {
      await client.query(
        `UPDATE workshop2_wms_balances SET qty_reserved = qty_reserved + $3, updated_at = NOW()
         WHERE item_id = $1 AND location_code = $2`,
        [input.itemId, locationCode, qty]
      );
    } else if (input.kind === 'release') {
      await client.query(
        `UPDATE workshop2_wms_balances SET qty_reserved = GREATEST(0, qty_reserved - $3), updated_at = NOW()
         WHERE item_id = $1 AND location_code = $2`,
        [input.itemId, locationCode, qty]
      );
    } else if (input.kind === 'receipt') {
      await client.query(
        `UPDATE workshop2_wms_balances SET qty_on_hand = qty_on_hand + $3, updated_at = NOW()
         WHERE item_id = $1 AND location_code = $2`,
        [input.itemId, locationCode, qty]
      );
    } else if (input.kind === 'issue') {
      await client.query(
        `UPDATE workshop2_wms_balances
         SET qty_on_hand = GREATEST(0, qty_on_hand - $3),
             qty_reserved = GREATEST(0, qty_reserved - $3),
             updated_at = NOW()
         WHERE item_id = $1 AND location_code = $2`,
        [input.itemId, locationCode, qty]
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  const balRes = await getWorkshop2PgPool().query(
    `SELECT i.id AS item_id, i.collection_id, i.sku, i.label, i.unit,
            b.location_code, b.qty_on_hand, b.qty_reserved
     FROM workshop2_wms_items i
     JOIN workshop2_wms_balances b ON b.item_id = i.id
     WHERE i.id = $1 AND b.location_code = $2`,
    [input.itemId, locationCode]
  );
  const movRes = await getWorkshop2PgPool().query(
    `SELECT * FROM workshop2_wms_movements WHERE id = $1`,
    [id]
  );
  return {
    movement: mapPgMovementRow(movRes.rows[0] as Parameters<typeof mapPgMovementRow>[0]),
    balance: mapPgBalanceRow(balRes.rows[0] as Parameters<typeof mapPgBalanceRow>[0]),
  };
}

/** Тестовый сброс in-memory WMS (unit tests). */
export function resetWorkshop2WmsMemoryForTests(): void {
  memoryByCollection.clear();
}

/** Проверка идемпотентности резерва под заказ образца (note = sample-order:{id}). */
export async function hasWorkshop2WmsReserveForSampleOrder(input: {
  collectionId: string;
  articleId: string;
  sampleOrderId: string;
}): Promise<boolean> {
  const note = `sample-order:${input.sampleOrderId.trim()}`;
  if (!note || note === 'sample-order:') return false;
  const movements = await listWorkshop2WmsMovements({
    collectionId: input.collectionId,
    articleId: input.articleId,
    limit: 200,
  });
  return movements.some((m) => m.kind === 'reserve' && m.note === note);
}

/** Идемпотентность release при intake (note = intake-release:{id}). */
export async function hasWorkshop2WmsReleaseForSampleIntake(input: {
  collectionId: string;
  articleId: string;
  sampleOrderId: string;
}): Promise<boolean> {
  const note = `intake-release:${input.sampleOrderId.trim()}`;
  const movements = await listWorkshop2WmsMovements({
    collectionId: input.collectionId,
    articleId: input.articleId,
    limit: 200,
  });
  return movements.some((m) => m.kind === 'release' && m.note === note);
}
