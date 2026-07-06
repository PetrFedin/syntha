import type { Product } from '@/lib/types';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { buildFabricRollupRows, fabricRollupToCsv } from '@/lib/fashion/fabric-rollup';
import type { FabricRollupRow } from '@/lib/fashion/types';

export type BrandMaterialPassportRollupSource = 'pg' | 'dossier' | 'catalog';

export type BrandMaterialPassportRollupRow = FabricRollupRow & {
  slug: string;
  source: BrandMaterialPassportRollupSource;
  persisted?: boolean;
};

export type BrandMaterialPassportRollupStorageMode = 'pg' | 'file' | 'memory' | 'demo';

export function extractDossierCompositionText(dossier: Workshop2DossierPhase1): string | undefined {
  for (const attributeId of ['composition', 'fabricCompositionPresetOptions', 'mat']) {
    const labels =
      dossier.assignments
        ?.find((a) => a.attributeId === attributeId)
        ?.values?.map((v) => v.displayLabel || v.text || String(v.number ?? ''))
        .filter(Boolean) ?? [];
    if (labels.length) return labels.join(', ');
  }
  const line = dossier.productionModel?.materialLines?.find((m) => m.compositionText?.trim());
  return line?.compositionText?.trim() || undefined;
}

export function buildBrandMaterialPassportRollupRows(products: Product[]): BrandMaterialPassportRollupRow[] {
  return buildFabricRollupRows(products).map((row, index) => ({
    ...row,
    slug: products[index]?.slug ?? row.sku.toLowerCase(),
    source: 'catalog' as const,
  }));
}

export function mergeBrandMaterialPassportRollupRows(
  catalogRows: readonly BrandMaterialPassportRollupRow[],
  dossierBySlug: ReadonlyMap<string, string>,
  persistedBySku: ReadonlyMap<string, BrandMaterialPassportRollupRow>
): BrandMaterialPassportRollupRow[] {
  return catalogRows.map((catalog) => {
    const persisted = persistedBySku.get(catalog.sku);
    if (persisted) {
      return {
        ...catalog,
        ...persisted,
        slug: persisted.slug || catalog.slug,
        source: 'pg' as const,
        persisted: true,
      };
    }
    const dossierComposition = dossierBySlug.get(catalog.slug) ?? dossierBySlug.get(catalog.sku);
    if (dossierComposition?.trim()) {
      return {
        ...catalog,
        compositionText: dossierComposition.replace(/"/g, '""'),
        source: 'dossier' as const,
      };
    }
    return catalog;
  });
}

export function summarizeBrandMaterialPassportRollup(rows: BrandMaterialPassportRollupRow[]): {
  total: number;
  withComposition: number;
  dossierSourced: number;
  pgSourced: number;
} {
  const withComposition = rows.filter((r) => r.compositionText.trim()).length;
  const dossierSourced = rows.filter((r) => r.source === 'dossier').length;
  const pgSourced = rows.filter((r) => r.source === 'pg').length;
  return { total: rows.length, withComposition, dossierSourced, pgSourced };
}

export function brandMaterialPassportRollupToCsv(rows: BrandMaterialPassportRollupRow[]): string {
  return fabricRollupToCsv(rows);
}
