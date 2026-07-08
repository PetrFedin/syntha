import type { Product } from '@/lib/types';
import { defaultSizeScaleIdForLeaf, getAttributeById } from '@/lib/production/attribute-catalog';
import { findHandbookLeafById } from '@/lib/production/category-handbook-leaves';
import { getWorkshopParametersForSampleScale } from '@/lib/production/workshop-size-handbook';
import { resolveLeafIdForMerchCategory } from '@/lib/fashion/brand-attribute-schema';

export type BrandSizeChartGradeState = 'empty' | 'partial' | 'ready';

export type BrandSizeChartGradeRow = {
  sku: string;
  slug: string;
  name: string;
  leafId: string;
  sizeScaleId: string;
  sizeCount: number;
  gradeState: BrandSizeChartGradeState;
  hintRu: string;
};

function hintForState(state: BrandSizeChartGradeState): string {
  if (state === 'ready') return 'Grade rules + size scale готовы для pre-pack / matrix.';
  if (state === 'partial') return 'Есть шкала — дозаполните POM / grade rules в W2.';
  return 'Нет size chart SoT — откройте W2 · size или pack rules.';
}

function defaultGradeStateFromSizeCount(sizeCount: number): BrandSizeChartGradeState {
  if (sizeCount === 0) return 'empty';
  if (sizeCount < 4) return 'partial';
  return 'ready';
}

export function buildBrandSizeChartGradeRows(products: Product[]): BrandSizeChartGradeRow[] {
  return products.map((product) => {
    const leafId = resolveLeafIdForMerchCategory(product.category ?? '');
    const leaf = findHandbookLeafById(leafId);
    const sizeScaleId = defaultSizeScaleIdForLeaf(leaf ?? undefined);
    const params = getWorkshopParametersForSampleScale(leaf ?? undefined, sizeScaleId);
    const gradeState = defaultGradeStateFromSizeCount(params.length);
    return {
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      leafId,
      sizeScaleId,
      sizeCount: params.length,
      gradeState,
      hintRu: hintForState(gradeState),
    };
  });
}

export function summarizeBrandSizeChartGrade(rows: BrandSizeChartGradeRow[]): {
  total: number;
  ready: number;
  partial: number;
  empty: number;
} {
  return {
    total: rows.length,
    ready: rows.filter((r) => r.gradeState === 'ready').length,
    partial: rows.filter((r) => r.gradeState === 'partial').length,
    empty: rows.filter((r) => r.gradeState === 'empty').length,
  };
}

export function brandSizeChartGradeLabel(state: BrandSizeChartGradeState): string {
  if (state === 'ready') return 'ready';
  if (state === 'partial') return 'partial';
  return 'empty';
}

export function brandSizeChartGradeToCsv(rows: BrandSizeChartGradeRow[]): string {
  const header = ['sku', 'leafId', 'sizeScaleId', 'sizeCount', 'gradeState'];
  const lines = rows.map((r) =>
    [r.sku, r.leafId, r.sizeScaleId, String(r.sizeCount), r.gradeState].join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

/** Для тестов / UI — human label шкалы (без импорта всего handbook). */
export function brandSizeChartScaleTitle(sizeScaleId: string): string {
  return getAttributeById('size_range')?.name ?? sizeScaleId;
}
