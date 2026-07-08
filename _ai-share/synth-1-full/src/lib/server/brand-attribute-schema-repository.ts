import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildBrandAttributeSchemaFeedRows,
  buildBrandSizeChartGradeFeedRows,
  hintForSizeChartGradeState,
  mergeBrandSizeChartGradeFeedRows,
  summarizeBrandAttributeSchemaFeed,
  summarizeBrandSizeChartGradeFeed,
  type BrandAttributeSchemaFeedRow,
  type BrandAttributeSchemaFeedStorageMode,
  type BrandSizeChartGradeFeedRow,
} from '@/lib/fashion/brand-attribute-schema-feed';
import type { BrandSizeChartGradeState } from '@/lib/fashion/brand-size-chart-grade';
import { products } from '@/lib/products';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const DEFAULT_COLLECTION = 'SS27';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-attribute-schema-feed.json');
const memoryByKey = new Map<string, BrandAttributeSchemaFeedRow | BrandSizeChartGradeFeedRow>();
let fileHydrated = false;

function feedKey(collectionId: string, sku: string, kind: string): string {
  return `${collectionId}:${sku}:${kind}`;
}

function feedId(collectionId: string, sku: string, kind: string): string {
  return `attr-feed-${collectionId}-${sku}-${kind}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
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
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as Array<
      BrandAttributeSchemaFeedRow | BrandSizeChartGradeFeedRow
    > & { _kind?: string };
    if (!Array.isArray(parsed)) return;
    for (const row of parsed) {
      const kind = 'gradeState' in row ? 'size_chart' : 'schema';
      memoryByKey.set(feedKey(DEFAULT_COLLECTION, row.sku, kind), row);
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

function catalogProductsForCollection(collectionId: string, limit = 80) {
  const seasonHint = collectionId.replace(/^\D+/, '').toUpperCase();
  const filtered = products.filter((p) => {
    const season = p.season?.toUpperCase() ?? '';
    if (!seasonHint) return true;
    return season.includes(seasonHint) || season.includes(collectionId.toUpperCase());
  });
  return (filtered.length ? filtered : products).slice(0, limit);
}

async function listPg(
  org: string,
  collectionId: string,
  kind: 'schema' | 'size_chart'
): Promise<Array<BrandAttributeSchemaFeedRow | BrandSizeChartGradeFeedRow>> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{ sku: string; payload: Record<string, unknown> }>(
    `SELECT sku, payload
     FROM brand_attribute_schema_feed
     WHERE organization_id = $1 AND collection_id = $2 AND row_kind = $3`,
    [org, collectionId, kind]
  );
  return res.rows.map((row) => ({ ...(row.payload as object), source: 'pg' as const })) as Array<
    BrandAttributeSchemaFeedRow | BrandSizeChartGradeFeedRow
  >;
}

async function upsertPg(
  org: string,
  collectionId: string,
  kind: 'schema' | 'size_chart',
  sku: string,
  payload: BrandAttributeSchemaFeedRow | BrandSizeChartGradeFeedRow
): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO brand_attribute_schema_feed
       (id, organization_id, collection_id, sku, row_kind, payload, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [feedId(collectionId, sku, kind), org, collectionId, sku, kind, JSON.stringify(payload)]
  );
}

async function seedRows(
  org: string,
  collectionId: string,
  storageMode: BrandAttributeSchemaFeedStorageMode
): Promise<void> {
  const slice = catalogProductsForCollection(collectionId);
  const schemaRows = buildBrandAttributeSchemaFeedRows(slice).map((row) => ({
    ...row,
    source: 'pg' as const,
  }));
  const sizeRows = buildBrandSizeChartGradeFeedRows(slice).map((row) => ({
    ...row,
    source: 'pg' as const,
  }));

  if (storageMode === 'pg') {
    for (const row of schemaRows) await upsertPg(org, collectionId, 'schema', row.sku, row);
    for (const row of sizeRows) await upsertPg(org, collectionId, 'size_chart', row.sku, row);
    return;
  }

  for (const row of schemaRows) memoryByKey.set(feedKey(collectionId, row.sku, 'schema'), row);
  for (const row of sizeRows) memoryByKey.set(feedKey(collectionId, row.sku, 'size_chart'), row);
  persistFile();
}

export function clearBrandAttributeSchemaFeedMemoryForTests(): void {
  memoryByKey.clear();
  fileHydrated = false;
}

export async function listBrandAttributeSchemaFeedServer(input?: {
  collectionId?: string;
  organizationId?: string;
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  schemas: BrandAttributeSchemaFeedRow[];
  schemaSummary: ReturnType<typeof summarizeBrandAttributeSchemaFeed>;
  storageMode: BrandAttributeSchemaFeedStorageMode;
}> {
  const org = input?.organizationId ?? DEFAULT_ORG;
  const collectionId = input?.collectionId?.trim() || DEFAULT_COLLECTION;
  const catalog = buildBrandAttributeSchemaFeedRows(catalogProductsForCollection(collectionId));

  if (isWorkshop2PostgresEnabled()) {
    let persisted = (await listPg(org, collectionId, 'schema')) as BrandAttributeSchemaFeedRow[];
    if (!persisted.length && input?.seedIfEmpty !== false) {
      await seedRows(org, collectionId, 'pg');
      persisted = (await listPg(org, collectionId, 'schema')) as BrandAttributeSchemaFeedRow[];
    }
    const bySku = new Map(persisted.map((row) => [row.sku, row]));
    const merged = catalog.map((row) => bySku.get(row.sku) ?? row);
    return {
      collectionId,
      schemas: merged,
      schemaSummary: summarizeBrandAttributeSchemaFeed(merged),
      storageMode: 'pg',
    };
  }

  hydrateFileIfNeeded();
  const persisted = [...memoryByKey.values()].filter(
    (row): row is BrandAttributeSchemaFeedRow => 'schemaAttrCount' in row && 'missingIds' in row
  );
  if (!persisted.length && input?.seedIfEmpty !== false) {
    await seedRows(org, collectionId, canUseDiskPersistence() ? 'file' : 'memory');
  }
  const bySku = new Map(
    [...memoryByKey.values()]
      .filter((row): row is BrandAttributeSchemaFeedRow => 'schemaAttrCount' in row)
      .map((row) => [row.sku, row])
  );
  const merged = catalog.map((row) => bySku.get(row.sku) ?? row);
  return {
    collectionId,
    schemas: merged,
    schemaSummary: summarizeBrandAttributeSchemaFeed(merged),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
  };
}

export async function listBrandSizeChartGradeFeedServer(input?: {
  collectionId?: string;
  organizationId?: string;
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  rows: BrandSizeChartGradeFeedRow[];
  summary: ReturnType<typeof summarizeBrandSizeChartGradeFeed>;
  storageMode: BrandAttributeSchemaFeedStorageMode;
}> {
  const org = input?.organizationId ?? DEFAULT_ORG;
  const collectionId = input?.collectionId?.trim() || DEFAULT_COLLECTION;
  const catalog = buildBrandSizeChartGradeFeedRows(catalogProductsForCollection(collectionId));

  if (isWorkshop2PostgresEnabled()) {
    let persisted = (await listPg(org, collectionId, 'size_chart')) as BrandSizeChartGradeFeedRow[];
    if (!persisted.length && input?.seedIfEmpty !== false) {
      await seedRows(org, collectionId, 'pg');
      persisted = (await listPg(org, collectionId, 'size_chart')) as BrandSizeChartGradeFeedRow[];
    }
    const bySku = new Map(persisted.map((row) => [row.sku, row]));
    const merged = mergeBrandSizeChartGradeFeedRows(catalog, bySku);
    return {
      collectionId,
      rows: merged,
      summary: summarizeBrandSizeChartGradeFeed(merged),
      storageMode: 'pg',
    };
  }

  hydrateFileIfNeeded();
  if (
    ![...memoryByKey.values()].some((row) => 'gradeState' in row) &&
    input?.seedIfEmpty !== false
  ) {
    await seedRows(org, collectionId, canUseDiskPersistence() ? 'file' : 'memory');
  }
  const bySku = new Map(
    [...memoryByKey.values()]
      .filter((row): row is BrandSizeChartGradeFeedRow => 'gradeState' in row)
      .map((row) => [row.sku, row])
  );
  const merged = mergeBrandSizeChartGradeFeedRows(catalog, bySku);
  return {
    collectionId,
    rows: merged,
    summary: summarizeBrandSizeChartGradeFeed(merged),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
  };
}

export async function patchBrandSizeChartGradeFeedServer(input: {
  collectionId: string;
  sku: string;
  gradeState: BrandSizeChartGradeState;
  organizationId?: string;
}): Promise<{
  row: BrandSizeChartGradeFeedRow | null;
  storageMode: BrandAttributeSchemaFeedStorageMode;
}> {
  const listed = await listBrandSizeChartGradeFeedServer({
    collectionId: input.collectionId,
    organizationId: input.organizationId,
    seedIfEmpty: true,
  });
  const existing = listed.rows.find((row) => row.sku === input.sku.trim());
  if (!existing) return { row: null, storageMode: listed.storageMode };

  const next: BrandSizeChartGradeFeedRow = {
    ...existing,
    gradeState: input.gradeState,
    hintRu: hintForSizeChartGradeState(input.gradeState),
    source: 'pg',
  };

  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();

  if (listed.storageMode === 'pg') {
    await upsertPg(org, collectionId, 'size_chart', next.sku, next);
    return { row: next, storageMode: 'pg' };
  }

  memoryByKey.set(feedKey(collectionId, next.sku, 'size_chart'), next);
  persistFile();
  return { row: next, storageMode: listed.storageMode };
}

export async function refreshBrandAttributeSchemaFeedServer(input: {
  collectionId: string;
  organizationId?: string;
}): Promise<{
  schemaSummary: ReturnType<typeof summarizeBrandAttributeSchemaFeed>;
  storageMode: BrandAttributeSchemaFeedStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const mode: BrandAttributeSchemaFeedStorageMode = isWorkshop2PostgresEnabled()
    ? 'pg'
    : canUseDiskPersistence()
      ? 'file'
      : 'memory';
  await seedRows(org, collectionId, mode);
  const listed = await listBrandAttributeSchemaFeedServer({ collectionId, seedIfEmpty: false });
  return { schemaSummary: listed.schemaSummary, storageMode: listed.storageMode };
}
