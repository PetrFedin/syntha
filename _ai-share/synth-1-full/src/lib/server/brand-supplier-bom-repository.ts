import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildBrandSupplierBomFeedRowsFromSnapshot,
  buildBrandSupplierBomSeedFeedRows,
  mergeBrandSupplierBomFeedRows,
  summarizeBrandSupplierBomFeed,
  type BrandSupplierBomFeedRow,
  type BrandSupplierBomFeedStorageMode,
} from '@/lib/fashion/brand-supplier-bom-feed';
import type { SupplierProcurementBomLine } from '@/lib/platform-core-pillar-snapshot.types';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-supplier-bom-lines.json');
const memoryByScope = new Map<string, BrandSupplierBomFeedRow[]>();
let fileHydrated = false;

function scopeKey(collectionId: string, articleId: string): string {
  return `${collectionId}:${articleId}`;
}

function lineId(collectionId: string, articleId: string, index: number): string {
  return `brand-bom-${collectionId}-${articleId}-${index}`
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
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as Array<{
      collectionId: string;
      articleId: string;
      rows: BrandSupplierBomFeedRow[];
    }>;
    if (!Array.isArray(parsed)) return;
    for (const snap of parsed)
      memoryByScope.set(scopeKey(snap.collectionId, snap.articleId), snap.rows);
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    const snapshots = [...memoryByScope.entries()].map(([key, rows]) => {
      const [collectionId, articleId] = key.split(':');
      return { collectionId: collectionId!, articleId: articleId!, rows };
    });
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(snapshots, null, 2));
  } catch {
    /* ignore */
  }
}

async function listPg(
  org: string,
  collectionId: string,
  articleId: string
): Promise<BrandSupplierBomFeedRow[]> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{
    line_index: number;
    material_name: string;
    qty: string | number;
    unit: string;
    source: string;
  }>(
    `SELECT line_index, material_name, qty, unit, source
     FROM brand_supplier_bom_lines
     WHERE organization_id = $1 AND collection_id = $2 AND article_id = $3
     ORDER BY line_index ASC`,
    [org, collectionId, articleId]
  );
  return res.rows.map((row) => ({
    lineId: lineId(collectionId, articleId, row.line_index),
    materialName: row.material_name,
    qty: Number(row.qty) || 0,
    unit: row.unit,
    filled: Boolean(row.material_name && Number(row.qty) > 0),
    source: 'pg' as const,
  }));
}

async function seedPersisted(
  org: string,
  collectionId: string,
  articleId: string,
  rows: BrandSupplierBomFeedRow[],
  storageMode: BrandSupplierBomFeedStorageMode
): Promise<BrandSupplierBomFeedRow[]> {
  const seeded = rows.map((row, index) => ({
    ...row,
    lineId: lineId(collectionId, articleId, index),
    source: 'pg' as const,
    filled: Boolean(row.materialName && row.qty > 0),
  }));

  if (storageMode === 'pg') {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `DELETE FROM brand_supplier_bom_lines
       WHERE organization_id = $1 AND collection_id = $2 AND article_id = $3`,
      [org, collectionId, articleId]
    );
    for (let i = 0; i < seeded.length; i++) {
      const row = seeded[i]!;
      await getWorkshop2PgPool().query(
        `INSERT INTO brand_supplier_bom_lines
           (id, organization_id, collection_id, article_id, line_index, material_name, qty, unit, source, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [
          lineId(collectionId, articleId, i),
          org,
          collectionId,
          articleId,
          i,
          row.materialName,
          row.qty,
          row.unit,
          'pg',
        ]
      );
    }
    return listPg(org, collectionId, articleId);
  }

  memoryByScope.set(scopeKey(collectionId, articleId), seeded);
  persistFile();
  return seeded;
}

export function clearBrandSupplierBomMemoryForTests(): void {
  memoryByScope.clear();
  fileHydrated = false;
}

export async function listBrandSupplierBomFeedServer(input: {
  collectionId: string;
  articleId: string;
  snapshotLines?: readonly SupplierProcurementBomLine[];
  organizationId?: string;
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  articleId: string;
  rows: BrandSupplierBomFeedRow[];
  summary: ReturnType<typeof summarizeBrandSupplierBomFeed>;
  storageMode: BrandSupplierBomFeedStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const snapshotRows = buildBrandSupplierBomFeedRowsFromSnapshot(input.snapshotLines ?? []);

  if (isWorkshop2PostgresEnabled()) {
    let persisted = await listPg(org, collectionId, articleId);
    if (!persisted.length && input?.seedIfEmpty !== false) {
      const seedSource = snapshotRows.length ? snapshotRows : buildBrandSupplierBomSeedFeedRows();
      persisted = await seedPersisted(org, collectionId, articleId, seedSource, 'pg');
    }
    const merged = mergeBrandSupplierBomFeedRows(snapshotRows, persisted);
    return {
      collectionId,
      articleId,
      rows: merged,
      summary: summarizeBrandSupplierBomFeed(merged),
      storageMode: 'pg',
    };
  }

  hydrateFileIfNeeded();
  let persisted = memoryByScope.get(scopeKey(collectionId, articleId)) ?? [];
  if (!persisted.length && input?.seedIfEmpty !== false) {
    const seedSource = snapshotRows.length ? snapshotRows : buildBrandSupplierBomSeedFeedRows();
    persisted = await seedPersisted(
      org,
      collectionId,
      articleId,
      seedSource,
      canUseDiskPersistence() ? 'file' : 'memory'
    );
  }
  const merged = mergeBrandSupplierBomFeedRows(snapshotRows, persisted);
  return {
    collectionId,
    articleId,
    rows: merged,
    summary: summarizeBrandSupplierBomFeed(merged),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
  };
}

export async function refreshBrandSupplierBomFeedServer(input: {
  collectionId: string;
  articleId: string;
  snapshotLines?: readonly SupplierProcurementBomLine[];
  organizationId?: string;
}): Promise<{
  summary: ReturnType<typeof summarizeBrandSupplierBomFeed>;
  storageMode: BrandSupplierBomFeedStorageMode;
}> {
  const snapshotRows = buildBrandSupplierBomFeedRowsFromSnapshot(input.snapshotLines ?? []);
  const seedSource = snapshotRows.length ? snapshotRows : buildBrandSupplierBomSeedFeedRows();
  const mode: BrandSupplierBomFeedStorageMode = isWorkshop2PostgresEnabled()
    ? 'pg'
    : canUseDiskPersistence()
      ? 'file'
      : 'memory';
  const seeded = await seedPersisted(
    input.organizationId ?? DEFAULT_ORG,
    input.collectionId.trim(),
    input.articleId.trim(),
    seedSource,
    mode
  );
  return {
    summary: summarizeBrandSupplierBomFeed(seeded),
    storageMode: mode,
  };
}
