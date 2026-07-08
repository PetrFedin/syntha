import type { Product } from '@/lib/types';
import { parseComposition } from '@/lib/fashion/parse-composition';
import { resolveCareSymbolIds } from '@/lib/fashion/care-symbols';

export type BrandMaterialPassportCertRow = {
  sku: string;
  slug: string;
  name: string;
  hasComposition: boolean;
  hasCare: boolean;
  sustainabilityTags: number;
  certReady: boolean;
  gapRu: string;
  releasedAt?: string;
  persistedReady?: boolean;
};

export type BrandMaterialPassportCertStorageMode = 'pg' | 'file' | 'memory' | 'demo';

export function mergeBrandMaterialPassportCertRows(
  catalogRows: readonly BrandMaterialPassportCertRow[],
  persistedBySku: ReadonlyMap<string, BrandMaterialPassportCertRow>
): BrandMaterialPassportCertRow[] {
  return catalogRows.map((catalog) => {
    const persisted = persistedBySku.get(catalog.sku);
    if (!persisted) return catalog;
    const catalogReady = catalog.certReady;
    const persistedReady = persisted.certReady;
    return {
      ...catalog,
      hasComposition: persisted.hasComposition || catalog.hasComposition,
      hasCare: persisted.hasCare || catalog.hasCare,
      sustainabilityTags: Math.max(persisted.sustainabilityTags, catalog.sustainabilityTags),
      certReady: persistedReady,
      persistedReady,
      gapRu: persistedReady ? 'ok' : catalog.gapRu,
      releasedAt: persisted.releasedAt,
    };
  });
}

export function materialPassportCertsBlockRelease(summary: {
  total: number;
  ready: number;
}): boolean {
  if (summary.total === 0) return true;
  return summary.ready < summary.total;
}

function hasExplicitCare(p: Product): boolean {
  const c = p.attributes?.care;
  if (Array.isArray(c) && c.length) return true;
  if (typeof c === 'string' && c.trim()) return true;
  return false;
}

export function buildBrandMaterialPassportCertRows(
  products: Product[]
): BrandMaterialPassportCertRow[] {
  return products.map((p) => {
    const hasComposition = parseComposition(p).length > 0 || Boolean(p.material?.trim());
    const hasCare = hasExplicitCare(p);
    const sustainabilityTags = p.sustainability?.length ?? 0;
    const certReady = hasComposition && hasCare && sustainabilityTags > 0;
    const gaps: string[] = [];
    if (!hasComposition) gaps.push('composition');
    if (!hasCare) gaps.push('care');
    if (sustainabilityTags === 0) gaps.push('sustainability');
    return {
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      hasComposition,
      hasCare,
      sustainabilityTags,
      certReady,
      gapRu: gaps.join(', ') || 'ok',
    };
  });
}

export function summarizeBrandMaterialPassportCerts(rows: BrandMaterialPassportCertRow[]): {
  total: number;
  ready: number;
  blocked: number;
} {
  const ready = rows.filter((r) => r.certReady).length;
  return { total: rows.length, ready, blocked: rows.length - ready };
}

export function brandMaterialPassportCertsToCsv(rows: BrandMaterialPassportCertRow[]): string {
  const header = ['sku', 'composition', 'care', 'sustainabilityTags', 'certReady'];
  const lines = rows.map((r) =>
    [
      r.sku,
      r.hasComposition ? '1' : '0',
      r.hasCare ? '1' : '0',
      String(r.sustainabilityTags),
      r.certReady ? '1' : '0',
    ].join(',')
  );
  return [header.join(','), ...lines].join('\n');
}
