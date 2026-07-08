import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildBrandMaterialPassportCertRows,
  mergeBrandMaterialPassportCertRows,
  materialPassportCertsBlockRelease,
  summarizeBrandMaterialPassportCerts,
  type BrandMaterialPassportCertRow,
  type BrandMaterialPassportCertStorageMode,
} from '@/lib/fashion/brand-material-passport-certs';
import { products } from '@/lib/products';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const DEFAULT_COLLECTION = 'SS27';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-material-passport-certs.json');
const memoryByKey = new Map<string, BrandMaterialPassportCertRow>();
let fileHydrated = false;

function certKey(collectionId: string, sku: string): string {
  return `${collectionId}:${sku}`;
}

function certId(collectionId: string, sku: string): string {
  return `mp-cert-${collectionId}-${sku}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
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
    ) as BrandMaterialPassportCertRow[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) memoryByKey.set(certKey(DEFAULT_COLLECTION, row.sku), row);
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
): BrandMaterialPassportCertRow[] {
  const seasonHint = collectionId.replace(/^\D+/, '').toUpperCase();
  const filtered = products.filter((p) => {
    const season = p.season?.toUpperCase() ?? '';
    if (!seasonHint) return true;
    return season.includes(seasonHint) || season.includes(collectionId.toUpperCase());
  });
  const slice = (filtered.length ? filtered : products).slice(0, limit);
  return buildBrandMaterialPassportCertRows(slice);
}

function mapPgRow(row: {
  sku: string;
  slug: string;
  name: string;
  has_composition: boolean;
  has_care: boolean;
  sustainability_tags: number;
  cert_ready: boolean;
  gap_ru: string;
  cert_json: { releasedAt?: string } | string;
  updated_at: Date;
}): BrandMaterialPassportCertRow {
  const certJsonRaw = row.cert_json;
  const certJson =
    typeof certJsonRaw === 'string'
      ? (JSON.parse(certJsonRaw) as { releasedAt?: string })
      : (certJsonRaw ?? {});
  return {
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    hasComposition: row.has_composition,
    hasCare: row.has_care,
    sustainabilityTags: row.sustainability_tags,
    certReady: row.cert_ready,
    gapRu: row.gap_ru,
    releasedAt: certJson.releasedAt,
    persistedReady: row.cert_ready,
  };
}

async function listPersistedPg(
  org: string,
  collectionId: string
): Promise<BrandMaterialPassportCertRow[]> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT sku, slug, name, has_composition, has_care, sustainability_tags,
            cert_ready, gap_ru, cert_json, updated_at
     FROM brand_material_passport_certs
     WHERE organization_id = $1 AND collection_id = $2
     ORDER BY sku ASC`,
    [org, collectionId]
  );
  return res.rows.map((row) => mapPgRow(row as Parameters<typeof mapPgRow>[0]));
}

async function upsertPersistedPg(
  org: string,
  collectionId: string,
  row: BrandMaterialPassportCertRow
): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO brand_material_passport_certs
       (id, organization_id, collection_id, sku, slug, name,
        has_composition, has_care, sustainability_tags, cert_ready, gap_ru, cert_json, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       slug = EXCLUDED.slug,
       name = EXCLUDED.name,
       has_composition = EXCLUDED.has_composition,
       has_care = EXCLUDED.has_care,
       sustainability_tags = EXCLUDED.sustainability_tags,
       cert_ready = EXCLUDED.cert_ready,
       gap_ru = EXCLUDED.gap_ru,
       cert_json = EXCLUDED.cert_json,
       updated_at = NOW()`,
    [
      certId(collectionId, row.sku),
      org,
      collectionId,
      row.sku,
      row.slug,
      row.name,
      row.hasComposition,
      row.hasCare,
      row.sustainabilityTags,
      row.certReady,
      row.gapRu,
      JSON.stringify({ releasedAt: row.releasedAt }),
    ]
  );
}

function listPersistedMemory(collectionId: string): BrandMaterialPassportCertRow[] {
  hydrateFileIfNeeded();
  return [...memoryByKey.entries()]
    .filter(([key]) => key.startsWith(`${collectionId}:`))
    .map(([, row]) => row)
    .sort((a, b) => a.sku.localeCompare(b.sku));
}

function upsertPersistedMemory(collectionId: string, row: BrandMaterialPassportCertRow): void {
  hydrateFileIfNeeded();
  memoryByKey.set(certKey(collectionId, row.sku), row);
  persistFile();
}

async function seedPersistedFromCatalog(
  org: string,
  collectionId: string,
  catalogRows: BrandMaterialPassportCertRow[],
  storageMode: BrandMaterialPassportCertStorageMode
): Promise<BrandMaterialPassportCertRow[]> {
  const seeded = catalogRows.map((row) => ({
    ...row,
    certReady: row.certReady,
    persistedReady: row.certReady,
    releasedAt: row.certReady ? new Date().toISOString() : undefined,
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

export function clearBrandMaterialPassportCertsMemoryForTests(): void {
  memoryByKey.clear();
  fileHydrated = false;
}

/** @internal tests */
export function seedBrandMaterialPassportCertMemoryForTests(
  collectionId: string,
  row: BrandMaterialPassportCertRow
): void {
  hydrateFileIfNeeded();
  memoryByKey.set(certKey(collectionId, row.sku), row);
}

export async function listBrandMaterialPassportCertsServer(input?: {
  collectionId?: string;
  organizationId?: string;
  limit?: number;
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  rows: BrandMaterialPassportCertRow[];
  summary: ReturnType<typeof summarizeBrandMaterialPassportCerts>;
  releaseBlocked: boolean;
  storageMode: BrandMaterialPassportCertStorageMode;
}> {
  const org = input?.organizationId ?? DEFAULT_ORG;
  const collectionId = input?.collectionId?.trim() || DEFAULT_COLLECTION;
  const catalogRows = catalogRowsForCollection(collectionId, input?.limit ?? 60);

  if (isWorkshop2PostgresEnabled()) {
    let persisted = await listPersistedPg(org, collectionId);
    if (!persisted.length && input?.seedIfEmpty !== false) {
      persisted = await seedPersistedFromCatalog(org, collectionId, catalogRows, 'pg');
    }
    const merged = mergeBrandMaterialPassportCertRows(
      catalogRows,
      new Map(persisted.map((row) => [row.sku, row]))
    );
    const summary = summarizeBrandMaterialPassportCerts(merged);
    return {
      collectionId,
      rows: merged,
      summary,
      releaseBlocked: materialPassportCertsBlockRelease(summary),
      storageMode: 'pg',
    };
  }

  hydrateFileIfNeeded();
  let persisted = listPersistedMemory(collectionId);
  if (!persisted.length && input?.seedIfEmpty !== false) {
    persisted = await seedPersistedFromCatalog(org, collectionId, catalogRows, 'file');
  }
  const merged = mergeBrandMaterialPassportCertRows(
    catalogRows,
    new Map(persisted.map((row) => [row.sku, row]))
  );
  const summary = summarizeBrandMaterialPassportCerts(merged);
  return {
    collectionId,
    rows: merged,
    summary,
    releaseBlocked: materialPassportCertsBlockRelease(summary),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
  };
}

export async function patchBrandMaterialPassportCertReadyServer(input: {
  collectionId: string;
  sku: string;
  certReady: boolean;
  organizationId?: string;
}): Promise<{
  row: BrandMaterialPassportCertRow | null;
  storageMode: BrandMaterialPassportCertStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const sku = input.sku.trim();
  const listed = await listBrandMaterialPassportCertsServer({
    collectionId,
    organizationId: org,
    seedIfEmpty: true,
  });
  const existing = listed.rows.find((row) => row.sku === sku);
  if (!existing) return { row: null, storageMode: listed.storageMode };

  if (
    input.certReady &&
    !(existing.hasComposition && existing.hasCare && existing.sustainabilityTags > 0)
  ) {
    throw new Error('CERT_GAPS');
  }

  const next: BrandMaterialPassportCertRow = {
    ...existing,
    certReady: input.certReady,
    persistedReady: input.certReady,
    gapRu: input.certReady ? 'ok' : existing.gapRu,
    releasedAt: input.certReady ? new Date().toISOString() : undefined,
  };

  if (listed.storageMode === 'pg') {
    await upsertPersistedPg(org, collectionId, next);
    return { row: next, storageMode: 'pg' };
  }

  upsertPersistedMemory(collectionId, next);
  return {
    row: next,
    storageMode: listed.storageMode === 'demo' ? 'memory' : listed.storageMode,
  };
}
