import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildBrandMaterialPassportRollupRows,
  extractDossierCompositionText,
  mergeBrandMaterialPassportRollupRows,
  summarizeBrandMaterialPassportRollup,
  type BrandMaterialPassportRollupRow,
  type BrandMaterialPassportRollupStorageMode,
} from '@/lib/fashion/brand-material-passport-rollup';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { products } from '@/lib/products';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const DEFAULT_COLLECTION = 'SS27';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-material-passport-rollup.json');
const memoryByKey = new Map<string, BrandMaterialPassportRollupRow>();
let fileHydrated = false;

function rollupKey(collectionId: string, sku: string): string {
  return `${collectionId}:${sku}`;
}

function rollupId(collectionId: string, sku: string): string {
  return `mp-rollup-${collectionId}-${sku}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
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
    const parsed = JSON.parse(
      fs.readFileSync(STORE_FILE, 'utf8')
    ) as BrandMaterialPassportRollupRow[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) memoryByKey.set(rollupKey(DEFAULT_COLLECTION, row.sku), row);
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

function catalogRowsForCollection(
  collectionId: string,
  limit = 60
): BrandMaterialPassportRollupRow[] {
  const seasonHint = collectionId.replace(/^\D+/, '').toUpperCase();
  const filtered = products.filter((p) => {
    const season = p.season?.toUpperCase() ?? '';
    if (!seasonHint) return true;
    return season.includes(seasonHint) || season.includes(collectionId.toUpperCase());
  });
  const slice = (filtered.length ? filtered : products).slice(0, limit);
  return buildBrandMaterialPassportRollupRows(slice);
}

function mapPgRow(row: {
  sku: string;
  slug: string;
  name: string;
  color: string;
  season: string;
  composition_text: string;
  care_ids: string;
  source: string;
}): BrandMaterialPassportRollupRow {
  return {
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    color: row.color,
    season: row.season,
    compositionText: row.composition_text,
    careIds: row.care_ids,
    source: row.source === 'pg' ? 'pg' : 'catalog',
    persisted: true,
  };
}

async function listDossierCompositionBySlug(
  org: string,
  collectionId: string
): Promise<Map<string, string>> {
  if (!isWorkshop2PostgresEnabled()) return new Map();
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{
    article_id: string;
    dossier_json: Workshop2DossierPhase1;
  }>(
    `SELECT article_id, dossier_json
     FROM workshop2_dossiers
     WHERE organization_id = $1 AND collection_id = $2`,
    [org, collectionId]
  );
  const out = new Map<string, string>();
  for (const row of res.rows) {
    const text = extractDossierCompositionText(row.dossier_json);
    if (text?.trim()) {
      out.set(row.article_id, text.trim());
      const sku = row.dossier_json.articleSkuSnapshot ?? row.dossier_json.sku;
      if (sku?.trim()) out.set(sku.trim(), text.trim());
    }
  }
  return out;
}

async function listPersistedPg(
  org: string,
  collectionId: string
): Promise<BrandMaterialPassportRollupRow[]> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT sku, slug, name, color, season, composition_text, care_ids, source
     FROM brand_material_passport_rollup
     WHERE organization_id = $1 AND collection_id = $2
     ORDER BY sku ASC`,
    [org, collectionId]
  );
  return res.rows.map((row) => mapPgRow(row as Parameters<typeof mapPgRow>[0]));
}

async function upsertPersistedPg(
  org: string,
  collectionId: string,
  row: BrandMaterialPassportRollupRow
): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO brand_material_passport_rollup
       (id, organization_id, collection_id, sku, slug, name, color, season,
        composition_text, care_ids, source, rollup_json, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       slug = EXCLUDED.slug,
       name = EXCLUDED.name,
       color = EXCLUDED.color,
       season = EXCLUDED.season,
       composition_text = EXCLUDED.composition_text,
       care_ids = EXCLUDED.care_ids,
       source = EXCLUDED.source,
       rollup_json = EXCLUDED.rollup_json,
       updated_at = NOW()`,
    [
      rollupId(collectionId, row.sku),
      org,
      collectionId,
      row.sku,
      row.slug,
      row.name,
      row.color,
      row.season,
      row.compositionText,
      row.careIds,
      row.source === 'dossier' ? 'dossier' : 'pg',
      JSON.stringify({ persisted: true }),
    ]
  );
}

function listPersistedMemory(collectionId: string): BrandMaterialPassportRollupRow[] {
  hydrateFileIfNeeded();
  return [...memoryByKey.entries()]
    .filter(([key]) => key.startsWith(`${collectionId}:`))
    .map(([, row]) => row)
    .sort((a, b) => a.sku.localeCompare(b.sku));
}

function upsertPersistedMemory(collectionId: string, row: BrandMaterialPassportRollupRow): void {
  hydrateFileIfNeeded();
  memoryByKey.set(rollupKey(collectionId, row.sku), row);
  persistFile();
}

async function seedPersistedFromMerged(
  org: string,
  collectionId: string,
  mergedRows: BrandMaterialPassportRollupRow[],
  storageMode: BrandMaterialPassportRollupStorageMode
): Promise<BrandMaterialPassportRollupRow[]> {
  const seeded = mergedRows.map((row) => ({
    ...row,
    source: row.source === 'catalog' ? ('pg' as const) : row.source,
    persisted: true,
  }));
  if (storageMode === 'pg') {
    for (const row of seeded) {
      await upsertPersistedPg(org, collectionId, row);
    }
    return listPersistedPg(org, collectionId);
  }
  for (const row of seeded) upsertPersistedMemory(collectionId, row);
  return listPersistedMemory(collectionId);
}

export function clearBrandMaterialPassportRollupMemoryForTests(): void {
  memoryByKey.clear();
  fileHydrated = false;
}

/** @internal tests */
export function seedBrandMaterialPassportRollupMemoryForTests(
  collectionId: string,
  row: BrandMaterialPassportRollupRow
): void {
  hydrateFileIfNeeded();
  memoryByKey.set(rollupKey(collectionId, row.sku), row);
}

export async function listBrandMaterialPassportRollupServer(input?: {
  collectionId?: string;
  organizationId?: string;
  limit?: number;
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  rows: BrandMaterialPassportRollupRow[];
  summary: ReturnType<typeof summarizeBrandMaterialPassportRollup>;
  storageMode: BrandMaterialPassportRollupStorageMode;
  dossierLinked: boolean;
}> {
  const org = input?.organizationId ?? DEFAULT_ORG;
  const collectionId = input?.collectionId?.trim() || DEFAULT_COLLECTION;
  const catalogRows = catalogRowsForCollection(collectionId, input?.limit ?? 60);
  const dossierBySlug = await listDossierCompositionBySlug(org, collectionId);
  const dossierLinked = dossierBySlug.size > 0;

  if (isWorkshop2PostgresEnabled()) {
    let persisted = await listPersistedPg(org, collectionId);
    const mergedPreview = mergeBrandMaterialPassportRollupRows(
      catalogRows,
      dossierBySlug,
      new Map(persisted.map((row) => [row.sku, row]))
    );
    if (!persisted.length && input?.seedIfEmpty !== false) {
      persisted = await seedPersistedFromMerged(org, collectionId, mergedPreview, 'pg');
    }
    const merged = mergeBrandMaterialPassportRollupRows(
      catalogRows,
      dossierBySlug,
      new Map(persisted.map((row) => [row.sku, row]))
    );
    return {
      collectionId,
      rows: merged,
      summary: summarizeBrandMaterialPassportRollup(merged),
      storageMode: 'pg',
      dossierLinked,
    };
  }

  hydrateFileIfNeeded();
  let persisted = listPersistedMemory(collectionId);
  const mergedPreview = mergeBrandMaterialPassportRollupRows(
    catalogRows,
    dossierBySlug,
    new Map(persisted.map((row) => [row.sku, row]))
  );
  if (!persisted.length && input?.seedIfEmpty !== false) {
    persisted = await seedPersistedFromMerged(org, collectionId, mergedPreview, 'file');
  }
  const merged = mergeBrandMaterialPassportRollupRows(
    catalogRows,
    dossierBySlug,
    new Map(persisted.map((row) => [row.sku, row]))
  );
  return {
    collectionId,
    rows: merged,
    summary: summarizeBrandMaterialPassportRollup(merged),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
    dossierLinked,
  };
}

export async function refreshBrandMaterialPassportRollupServer(input: {
  collectionId: string;
  organizationId?: string;
  limit?: number;
}): Promise<{
  rows: BrandMaterialPassportRollupRow[];
  summary: ReturnType<typeof summarizeBrandMaterialPassportRollup>;
  storageMode: BrandMaterialPassportRollupStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const catalogRows = catalogRowsForCollection(collectionId, input.limit ?? 60);
  const dossierBySlug = await listDossierCompositionBySlug(org, collectionId);
  const mergedPreview = mergeBrandMaterialPassportRollupRows(catalogRows, dossierBySlug, new Map());

  if (isWorkshop2PostgresEnabled()) {
    for (const row of mergedPreview) {
      await upsertPersistedPg(org, collectionId, {
        ...row,
        source: row.source === 'catalog' ? 'pg' : row.source,
        persisted: true,
      });
    }
    const listed = await listBrandMaterialPassportRollupServer({
      collectionId,
      organizationId: org,
      seedIfEmpty: false,
    });
    return {
      rows: listed.rows,
      summary: listed.summary,
      storageMode: 'pg',
    };
  }

  for (const row of mergedPreview) {
    upsertPersistedMemory(collectionId, {
      ...row,
      source: row.source === 'catalog' ? 'pg' : row.source,
      persisted: true,
    });
  }
  const listed = await listBrandMaterialPassportRollupServer({
    collectionId,
    organizationId: org,
    seedIfEmpty: false,
  });
  return {
    rows: listed.rows,
    summary: listed.summary,
    storageMode: listed.storageMode === 'demo' ? 'memory' : listed.storageMode,
  };
}
