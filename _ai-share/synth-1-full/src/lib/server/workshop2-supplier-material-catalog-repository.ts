import 'server-only';

import type {
  SupplierMaterialCatalogListing,
  SupplierMaterialCatalogStatus,
} from '@/lib/platform-core-supplier-material-catalog.types';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

const memory = new Map<string, SupplierMaterialCatalogListing[]>();

async function ensureCatalogTable(): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(`
    CREATE TABLE IF NOT EXISTS workshop2_supplier_material_catalog (
      id TEXT NOT NULL,
      supplier_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      material_type TEXT NOT NULL DEFAULT '',
      origin TEXT NOT NULL DEFAULT '',
      price_label TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (supplier_id, id)
    )
  `);
}

function rowToListing(row: {
  id: string;
  supplier_id: string;
  name: string;
  category: string;
  material_type: string;
  origin: string;
  price_label: string;
  status: string;
  updated_at: string;
}): SupplierMaterialCatalogListing {
  const status = row.status.trim();
  const normalized: SupplierMaterialCatalogStatus =
    status === 'review' || status === 'archived' ? status : 'active';
  return {
    id: row.id,
    supplierId: row.supplier_id,
    name: row.name,
    category: row.category,
    materialType: row.material_type,
    origin: row.origin,
    priceLabel: row.price_label,
    status: normalized,
    updatedAt: row.updated_at,
  };
}

export async function listWorkshop2SupplierMaterialCatalog(
  supplierId: string
): Promise<SupplierMaterialCatalogListing[]> {
  const sid = supplierId.trim() || 'supplier-demo';

  if (isWorkshop2PostgresEnabled()) {
    await ensureCatalogTable();
    const res = await getWorkshop2PgPool().query<{
      id: string;
      supplier_id: string;
      name: string;
      category: string;
      material_type: string;
      origin: string;
      price_label: string;
      status: string;
      updated_at: string;
    }>(
      `SELECT id, supplier_id, name, category, material_type, origin, price_label, status, updated_at
       FROM workshop2_supplier_material_catalog
       WHERE supplier_id = $1 AND status <> 'archived'
       ORDER BY updated_at DESC`,
      [sid]
    );
    return res.rows.map(rowToListing);
  }

  if (isWorkshop2PgOnlyMode()) {
    return [];
  }

  return memory.get(sid) ?? [];
}

export async function upsertWorkshop2SupplierMaterialCatalogListing(input: {
  supplierId: string;
  listing: Omit<SupplierMaterialCatalogListing, 'supplierId' | 'updatedAt'> & {
    updatedAt?: string;
  };
}): Promise<SupplierMaterialCatalogListing> {
  const sid = input.supplierId.trim() || 'supplier-demo';
  const updatedAt = input.listing.updatedAt ?? new Date().toISOString();
  const row: SupplierMaterialCatalogListing = {
    supplierId: sid,
    id: input.listing.id.trim(),
    name: input.listing.name.trim(),
    category: input.listing.category.trim(),
    materialType: input.listing.materialType.trim(),
    origin: input.listing.origin.trim(),
    priceLabel: input.listing.priceLabel.trim(),
    status: input.listing.status,
    updatedAt,
  };

  if (!row.id || !row.name) {
    throw new Error('INVALID_LISTING');
  }

  if (isWorkshop2PostgresEnabled()) {
    await ensureCatalogTable();
    await getWorkshop2PgPool().query(
      `INSERT INTO workshop2_supplier_material_catalog
         (id, supplier_id, name, category, material_type, origin, price_label, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz)
       ON CONFLICT (supplier_id, id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         material_type = EXCLUDED.material_type,
         origin = EXCLUDED.origin,
         price_label = EXCLUDED.price_label,
         status = EXCLUDED.status,
         updated_at = EXCLUDED.updated_at`,
      [
        row.id,
        sid,
        row.name,
        row.category,
        row.materialType,
        row.origin,
        row.priceLabel,
        row.status,
        updatedAt,
      ]
    );
    return row;
  }

  if (isWorkshop2PgOnlyMode()) {
    return row;
  }

  const prev = memory.get(sid) ?? [];
  const next = [row, ...prev.filter((x) => x.id !== row.id)];
  memory.set(sid, next);
  return row;
}

export async function archiveWorkshop2SupplierMaterialCatalogListing(input: {
  supplierId: string;
  id: string;
}): Promise<boolean> {
  const sid = input.supplierId.trim() || 'supplier-demo';
  const id = input.id.trim();
  if (!id) return false;

  if (isWorkshop2PostgresEnabled()) {
    await ensureCatalogTable();
    const res = await getWorkshop2PgPool().query(
      `UPDATE workshop2_supplier_material_catalog
       SET status = 'archived', updated_at = NOW()
       WHERE supplier_id = $1 AND id = $2`,
      [sid, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  if (isWorkshop2PgOnlyMode()) {
    return false;
  }

  const prev = memory.get(sid) ?? [];
  const next = prev.filter((x) => x.id !== id);
  memory.set(sid, next);
  return prev.length !== next.length;
}
