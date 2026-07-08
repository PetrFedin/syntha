import type { BrandAttributeSchemaRow } from '@/lib/fashion/brand-attribute-schema';
import type {
  BrandSizeChartGradeRow,
  BrandSizeChartGradeState,
} from '@/lib/fashion/brand-size-chart-grade';
import type { Product } from '@/lib/types';
import { buildBrandAttributeSchemaRows } from '@/lib/fashion/brand-attribute-schema';
import { buildBrandSizeChartGradeRows } from '@/lib/fashion/brand-size-chart-grade';

export type BrandAttributeSchemaFeedSource = 'pg' | 'catalog';

export type BrandAttributeSchemaFeedRow = BrandAttributeSchemaRow & {
  source: BrandAttributeSchemaFeedSource;
};

export type BrandSizeChartGradeFeedRow = BrandSizeChartGradeRow & {
  source: BrandAttributeSchemaFeedSource;
};

export type BrandAttributeSchemaFeedStorageMode = 'pg' | 'file' | 'memory' | 'demo';

export function buildBrandAttributeSchemaFeedRows(
  products: Product[]
): BrandAttributeSchemaFeedRow[] {
  return buildBrandAttributeSchemaRows(products).map((row) => ({
    ...row,
    source: 'catalog' as const,
  }));
}

export function buildBrandSizeChartGradeFeedRows(
  products: Product[]
): BrandSizeChartGradeFeedRow[] {
  return buildBrandSizeChartGradeRows(products).map((row) => ({
    ...row,
    source: 'catalog' as const,
  }));
}

export function mergeBrandSizeChartGradeFeedRows(
  catalogRows: readonly BrandSizeChartGradeFeedRow[],
  persistedBySku: ReadonlyMap<string, BrandSizeChartGradeFeedRow>
): BrandSizeChartGradeFeedRow[] {
  return catalogRows.map((catalog) => {
    const persisted = persistedBySku.get(catalog.sku);
    if (!persisted) return catalog;
    return {
      ...catalog,
      gradeState: persisted.gradeState,
      hintRu: persisted.hintRu || catalog.hintRu,
      source: 'pg' as const,
    };
  });
}

export function summarizeBrandAttributeSchemaFeed(rows: readonly BrandAttributeSchemaFeedRow[]): {
  total: number;
  weak: number;
  leafCount: number;
  pgSourced: number;
} {
  const leafIds = new Set(rows.map((r) => r.leafId));
  return {
    total: rows.length,
    weak: rows.filter((r) => r.missingIds.length > 0).length,
    leafCount: leafIds.size,
    pgSourced: rows.filter((r) => r.source === 'pg').length,
  };
}

export function summarizeBrandSizeChartGradeFeed(rows: readonly BrandSizeChartGradeFeedRow[]): {
  total: number;
  ready: number;
  partial: number;
  empty: number;
  pgSourced: number;
} {
  return {
    total: rows.length,
    ready: rows.filter((r) => r.gradeState === 'ready').length,
    partial: rows.filter((r) => r.gradeState === 'partial').length,
    empty: rows.filter((r) => r.gradeState === 'empty').length,
    pgSourced: rows.filter((r) => r.source === 'pg').length,
  };
}

export function hintForSizeChartGradeState(state: BrandSizeChartGradeState): string {
  if (state === 'ready') return 'Grade rules + size scale готовы для pre-pack / matrix.';
  if (state === 'partial') return 'Есть шкала — дозаполните POM / grade rules в W2.';
  return 'Нет size chart SoT — откройте W2 · size или pack rules.';
}
