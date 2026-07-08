import type { AssortmentMixV1 } from '@/lib/fashion/types';
import type { Product } from '@/lib/types';
import {
  buildBrandWssiCapacityRows,
  type BrandWssiCapacityRow,
} from '@/lib/fashion/brand-wssi-plan';
import { calculateAssortmentMix } from '@/lib/fashion/assortment-mix-logic';

export type BrandWssiFeedSource = 'pg' | 'catalog';

export type BrandWssiMixFeedRow = AssortmentMixV1 & {
  source: BrandWssiFeedSource;
};

export type BrandWssiCapacityFeedRow = BrandWssiCapacityRow & {
  source: BrandWssiFeedSource;
};

export type BrandWssiFeedStorageMode = 'pg' | 'file' | 'memory' | 'demo';

export function buildBrandWssiMixFeedRows(products: readonly Product[]): BrandWssiMixFeedRow[] {
  return calculateAssortmentMix([...products]).map((row) => ({
    ...row,
    source: 'catalog' as const,
  }));
}

export function buildBrandWssiCapacityFeedRows(collectionId: string): BrandWssiCapacityFeedRow[] {
  return buildBrandWssiCapacityRows({ collectionId }).map((row) => ({
    ...row,
    source: 'catalog' as const,
  }));
}

export function summarizeBrandWssiMixFeed(rows: readonly BrandWssiMixFeedRow[]): {
  categories: number;
  overAssorted: number;
  underAssorted: number;
  pgSourced: number;
} {
  const overAssorted = rows.filter((r) => r.gap > 10).length;
  const underAssorted = rows.filter((r) => r.gap < -10).length;
  return {
    categories: rows.length,
    overAssorted,
    underAssorted,
    pgSourced: rows.filter((r) => r.source === 'pg').length,
  };
}
