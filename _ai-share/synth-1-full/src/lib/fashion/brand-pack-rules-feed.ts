import type { PackRuleRow } from '@/lib/fashion/types';
import type { Product } from '@/lib/types';
import { buildPackRuleRow } from '@/lib/fashion/pack-rules-rollup';

export type BrandPackRulesFeedSource = 'pg' | 'catalog';

export type BrandPackRulesFeedRow = PackRuleRow & {
  source: BrandPackRulesFeedSource;
  persisted?: boolean;
};

export type BrandPackRulesFeedStorageMode = 'pg' | 'file' | 'memory' | 'demo';

export function buildBrandPackRulesFeedRows(
  products: Product[],
  limit = 80
): BrandPackRulesFeedRow[] {
  return products.slice(0, limit).map((product) => ({
    ...buildPackRuleRow(product),
    source: 'catalog' as const,
  }));
}

export function mergeBrandPackRulesFeedRows(
  catalogRows: readonly BrandPackRulesFeedRow[],
  persistedBySku: ReadonlyMap<string, BrandPackRulesFeedRow>
): BrandPackRulesFeedRow[] {
  return catalogRows.map((catalog) => {
    const persisted = persistedBySku.get(catalog.sku);
    if (!persisted) return catalog;
    return {
      ...catalog,
      moq: persisted.moq ?? catalog.moq,
      casePack: persisted.casePack ?? catalog.casePack,
      leadWeeks: persisted.leadWeeks ?? catalog.leadWeeks,
      incoterm: persisted.incoterm || catalog.incoterm,
      shipFrom: persisted.shipFrom || catalog.shipFrom,
      source: 'pg' as const,
      persisted: true,
    };
  });
}

export function summarizeBrandPackRulesFeed(rows: readonly BrandPackRulesFeedRow[]): {
  total: number;
  withMoq: number;
  withCasePack: number;
  pgSourced: number;
} {
  const withMoq = rows.filter((r) => r.moq != null && r.moq > 0).length;
  const withCasePack = rows.filter((r) => r.casePack != null && r.casePack > 0).length;
  return {
    total: rows.length,
    withMoq,
    withCasePack,
    pgSourced: rows.filter((r) => r.source === 'pg').length,
  };
}

export { packRulesToCsv } from '@/lib/fashion/pack-rules-rollup';
