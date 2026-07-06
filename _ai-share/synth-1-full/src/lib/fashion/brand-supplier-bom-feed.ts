import type { BrandSupplierBomLineRow } from '@/lib/fashion/brand-supplier-bom-lines';
import type { SupplierProcurementBomLine } from '@/lib/platform-core-pillar-snapshot.types';
import { mapSupplierProcurementBomLines } from '@/lib/fashion/brand-supplier-bom-lines';

export type BrandSupplierBomFeedSource = 'pg' | 'snapshot' | 'seed';

export type BrandSupplierBomFeedRow = BrandSupplierBomLineRow & {
  source: BrandSupplierBomFeedSource;
};

export type BrandSupplierBomFeedStorageMode = 'pg' | 'file' | 'memory' | 'demo';

export const DEFAULT_BRAND_SUPPLIER_BOM_SEED: Omit<BrandSupplierBomFeedRow, 'lineId' | 'filled' | 'source'>[] = [
  { materialName: 'Main fabric · cotton blend', qty: 1.8, unit: 'm' },
  { materialName: 'Lining · viscose', qty: 1.2, unit: 'm' },
  { materialName: 'Thread · polyester', qty: 120, unit: 'm' },
  { materialName: 'Label + care', qty: 1, unit: 'pc' },
];

export function buildBrandSupplierBomFeedRowsFromSnapshot(
  lines: readonly SupplierProcurementBomLine[]
): BrandSupplierBomFeedRow[] {
  return mapSupplierProcurementBomLines(lines).map((row) => ({
    ...row,
    source: 'snapshot' as const,
  }));
}

export function buildBrandSupplierBomSeedFeedRows(): BrandSupplierBomFeedRow[] {
  return DEFAULT_BRAND_SUPPLIER_BOM_SEED.map((line, index) => ({
    lineId: `bom-seed-${index}`,
    ...line,
    filled: Boolean(line.materialName && line.qty > 0),
    source: 'seed' as const,
  }));
}

export function mergeBrandSupplierBomFeedRows(
  snapshotRows: readonly BrandSupplierBomFeedRow[],
  persistedRows: readonly BrandSupplierBomFeedRow[]
): BrandSupplierBomFeedRow[] {
  if (persistedRows.length) {
    return persistedRows.map((row) => ({ ...row, source: row.source === 'seed' ? 'pg' : row.source }));
  }
  if (snapshotRows.length) return [...snapshotRows];
  return buildBrandSupplierBomSeedFeedRows().map((row) => ({ ...row, source: 'pg' as const }));
}

export function summarizeBrandSupplierBomFeed(rows: readonly BrandSupplierBomFeedRow[]): {
  total: number;
  filled: number;
  pgSourced: number;
} {
  return {
    total: rows.length,
    filled: rows.filter((r) => r.filled).length,
    pgSourced: rows.filter((r) => r.source === 'pg' || r.source === 'seed').length,
  };
}
