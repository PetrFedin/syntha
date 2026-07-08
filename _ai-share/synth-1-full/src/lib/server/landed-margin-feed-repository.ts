import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildBrandSimulatorFeedRows,
  buildLandedMarginCatalogSeedRows,
  buildLandedMarginFeedRow,
  buildLandedMarginRowsFromB2bOrder,
  mergeLandedMarginFeedRows,
  summarizeLandedMarginFeed,
  type LandedMarginFeedRow,
  type LandedMarginFeedStorageMode,
} from '@/lib/b2b/landed-margin-feed';
import { products } from '@/lib/products';
import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const DEFAULT_COLLECTION = 'SS27';
const STORE_FILE = path.join(process.cwd(), 'data', 'workshop2-landed-margin-feed.json');
const memoryByKey = new Map<string, LandedMarginFeedRow>();
let fileHydrated = false;

function feedKey(collectionId: string, orderId: string, lineId: string): string {
  return `${collectionId}:${orderId}:${lineId}`;
}

function feedId(collectionId: string, orderId: string, lineId: string): string {
  return `lm-feed-${collectionId}-${orderId}-${lineId}`
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 120);
}

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as LandedMarginFeedRow[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        memoryByKey.set(feedKey(DEFAULT_COLLECTION, row.orderId ?? '', row.lineId), row);
      }
    }
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify([...memoryByKey.values()], null, 2));
  } catch {
    /* ignore */
  }
}

async function resolveBaseRows(input: {
  collectionId: string;
  orderId?: string;
  scope: 'shop' | 'brand';
}): Promise<{ rows: LandedMarginFeedRow[]; orderLinked: boolean }> {
  const orderId = input.orderId?.trim() ?? '';
  if (orderId) {
    const order = await getWorkshop2B2bOrder(orderId);
    if (order?.lines?.length) {
      return { rows: buildLandedMarginRowsFromB2bOrder(order), orderLinked: true };
    }
  }

  if (input.scope === 'brand') {
    return {
      rows: buildBrandSimulatorFeedRows(products, 12),
      orderLinked: false,
    };
  }

  return {
    rows: buildLandedMarginCatalogSeedRows({
      collectionId: input.collectionId,
      orderId: orderId || 'demo',
    }),
    orderLinked: false,
  };
}

function mapPgRow(row: {
  line_id: string;
  order_id: string;
  sku: string;
  label: string;
  wholesale_rub: number;
  landed_rub: number;
  retail_rub: number | null;
  production_rub: number | null;
  source: string;
}): LandedMarginFeedRow {
  return buildLandedMarginFeedRow({
    lineId: row.line_id,
    sku: row.sku,
    label: row.label,
    wholesaleRub: row.wholesale_rub,
    landedRub: row.landed_rub,
    source:
      row.source === 'pg' || row.source === 'order' ? (row.source as 'pg' | 'order') : 'catalog',
    orderId: row.order_id || undefined,
    retailRub: row.retail_rub ?? undefined,
    productionRub: row.production_rub ?? undefined,
  });
}

async function listPersistedPg(
  org: string,
  collectionId: string,
  orderId: string
): Promise<LandedMarginFeedRow[]> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT line_id, order_id, sku, label, wholesale_rub, landed_rub, retail_rub, production_rub, source
     FROM workshop2_landed_margin_feed
     WHERE organization_id = $1 AND collection_id = $2 AND order_id = $3
     ORDER BY line_id ASC`,
    [org, collectionId, orderId]
  );
  return res.rows.map((row) => mapPgRow(row as Parameters<typeof mapPgRow>[0]));
}

async function upsertPersistedPg(
  org: string,
  collectionId: string,
  orderId: string,
  row: LandedMarginFeedRow
): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_landed_margin_feed
       (id, organization_id, collection_id, order_id, line_id, sku, label,
        wholesale_rub, landed_rub, retail_rub, production_rub, source, feed_json, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       sku = EXCLUDED.sku,
       label = EXCLUDED.label,
       wholesale_rub = EXCLUDED.wholesale_rub,
       landed_rub = EXCLUDED.landed_rub,
       retail_rub = EXCLUDED.retail_rub,
       production_rub = EXCLUDED.production_rub,
       source = EXCLUDED.source,
       feed_json = EXCLUDED.feed_json,
       updated_at = NOW()`,
    [
      feedId(collectionId, orderId, row.lineId),
      org,
      collectionId,
      orderId,
      row.lineId,
      row.sku,
      row.label,
      row.wholesaleRub,
      row.landedRub,
      row.retailRub ?? null,
      row.productionRub ?? null,
      row.source === 'order' ? 'order' : 'pg',
      JSON.stringify({ marginPct: row.marginPct }),
    ]
  );
}

function listPersistedMemory(collectionId: string, orderId: string): LandedMarginFeedRow[] {
  hydrateFileIfNeeded();
  return [...memoryByKey.entries()]
    .filter(([key]) => key.startsWith(`${collectionId}:${orderId}:`))
    .map(([, row]) => row)
    .sort((a, b) => a.lineId.localeCompare(b.lineId));
}

function upsertPersistedMemory(
  collectionId: string,
  orderId: string,
  row: LandedMarginFeedRow
): void {
  hydrateFileIfNeeded();
  memoryByKey.set(feedKey(collectionId, orderId, row.lineId), {
    ...row,
    orderId: orderId || row.orderId,
  });
  persistFile();
}

async function seedPersisted(
  org: string,
  collectionId: string,
  orderId: string,
  rows: LandedMarginFeedRow[],
  storageMode: LandedMarginFeedStorageMode
): Promise<LandedMarginFeedRow[]> {
  const seeded = rows.map((row) =>
    buildLandedMarginFeedRow({
      ...row,
      source: row.source === 'catalog' ? 'pg' : row.source,
      orderId: orderId || row.orderId,
    })
  );
  if (storageMode === 'pg') {
    for (const row of seeded) {
      await upsertPersistedPg(org, collectionId, orderId, row);
    }
    return listPersistedPg(org, collectionId, orderId);
  }
  for (const row of seeded) upsertPersistedMemory(collectionId, orderId, row);
  return listPersistedMemory(collectionId, orderId);
}

export function clearLandedMarginFeedMemoryForTests(): void {
  memoryByKey.clear();
  fileHydrated = false;
}

/** @internal tests */
export function seedLandedMarginFeedMemoryForTests(
  collectionId: string,
  orderId: string,
  row: LandedMarginFeedRow
): void {
  hydrateFileIfNeeded();
  memoryByKey.set(feedKey(collectionId, orderId, row.lineId), row);
}

export async function listLandedMarginFeedServer(input?: {
  collectionId?: string;
  orderId?: string;
  organizationId?: string;
  scope?: 'shop' | 'brand';
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  orderId: string;
  rows: LandedMarginFeedRow[];
  summary: ReturnType<typeof summarizeLandedMarginFeed>;
  storageMode: LandedMarginFeedStorageMode;
  orderLinked: boolean;
}> {
  const org = input?.organizationId ?? DEFAULT_ORG;
  const collectionId = input?.collectionId?.trim() || DEFAULT_COLLECTION;
  const orderId = input?.orderId?.trim() ?? '';
  const scope = input?.scope ?? 'shop';
  const { rows: baseRows, orderLinked } = await resolveBaseRows({ collectionId, orderId, scope });

  if (isWorkshop2PostgresEnabled()) {
    let persisted = await listPersistedPg(org, collectionId, orderId);
    if (!persisted.length && input?.seedIfEmpty !== false) {
      persisted = await seedPersisted(org, collectionId, orderId, baseRows, 'pg');
    }
    const merged = mergeLandedMarginFeedRows(
      baseRows,
      new Map(persisted.map((row) => [row.lineId, row]))
    );
    return {
      collectionId,
      orderId,
      rows: merged,
      summary: summarizeLandedMarginFeed(merged),
      storageMode: 'pg',
      orderLinked,
    };
  }

  hydrateFileIfNeeded();
  let persisted = listPersistedMemory(collectionId, orderId);
  if (!persisted.length && input?.seedIfEmpty !== false) {
    persisted = await seedPersisted(org, collectionId, orderId, baseRows, 'file');
  }
  const merged = mergeLandedMarginFeedRows(
    baseRows,
    new Map(persisted.map((row) => [row.lineId, row]))
  );
  return {
    collectionId,
    orderId,
    rows: merged,
    summary: summarizeLandedMarginFeed(merged),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
    orderLinked,
  };
}

export async function refreshLandedMarginFeedServer(input: {
  collectionId: string;
  orderId?: string;
  organizationId?: string;
  scope?: 'shop' | 'brand';
}): Promise<{
  rows: LandedMarginFeedRow[];
  summary: ReturnType<typeof summarizeLandedMarginFeed>;
  storageMode: LandedMarginFeedStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const orderId = input.orderId?.trim() ?? '';
  const scope = input.scope ?? 'shop';
  const { rows: baseRows } = await resolveBaseRows({ collectionId, orderId, scope });

  if (isWorkshop2PostgresEnabled()) {
    for (const row of baseRows) {
      await upsertPersistedPg(org, collectionId, orderId, {
        ...row,
        source: row.source === 'catalog' ? 'pg' : row.source,
      });
    }
  } else {
    for (const row of baseRows) {
      upsertPersistedMemory(collectionId, orderId, {
        ...row,
        source: row.source === 'catalog' ? 'pg' : row.source,
      });
    }
  }

  const listed = await listLandedMarginFeedServer({
    collectionId,
    orderId,
    organizationId: org,
    scope,
    seedIfEmpty: false,
  });
  return {
    rows: listed.rows,
    summary: listed.summary,
    storageMode: listed.storageMode === 'demo' ? 'memory' : listed.storageMode,
  };
}

export async function getLandedMarginFeedSkuDefaultsServer(input: {
  collectionId?: string;
  orderId?: string;
  sku: string;
}): Promise<{
  sku: string;
  retailRub?: number;
  productionRub?: number;
  wholesaleRub?: number;
  landedRub?: number;
  storageMode: LandedMarginFeedStorageMode;
} | null> {
  const listed = await listLandedMarginFeedServer({
    collectionId: input.collectionId,
    orderId: input.orderId,
    scope: 'brand',
  });
  const row = listed.rows.find((item) => item.sku === input.sku.trim());
  if (!row) return null;
  return {
    sku: row.sku,
    retailRub: row.retailRub,
    productionRub: row.productionRub,
    wholesaleRub: row.wholesaleRub,
    landedRub: row.landedRub,
    storageMode: listed.storageMode,
  };
}
