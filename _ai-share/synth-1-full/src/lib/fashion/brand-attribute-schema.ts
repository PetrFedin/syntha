import type { Product } from '@/lib/types';
import { getAttributeById, resolveAttributeIdsForLeaf } from '@/lib/production/attribute-catalog';
import { getHandbookCategoryLeaves } from '@/lib/production/category-handbook-leaves';

export type BrandAttributeSchemaRow = {
  sku: string;
  slug: string;
  name: string;
  leafId: string;
  pathLabel: string;
  schemaAttrCount: number;
  filledCount: number;
  missingIds: string[];
};

const FALLBACK_LEAF_ID = 'catalog-apparel-g5-l0';

const leafByCategoryCache = new Map<string, string>();

export function resolveLeafIdForMerchCategory(category: string): string {
  const key = category.trim().toLowerCase();
  if (!key) return FALLBACK_LEAF_ID;
  const cached = leafByCategoryCache.get(key);
  if (cached) return cached;

  const leaves = getHandbookCategoryLeaves();
  const hit =
    leaves.find((l) => l.l3Name.trim().toLowerCase() === key) ??
    leaves.find((l) => l.l2Name.trim().toLowerCase().includes(key)) ??
    leaves.find((l) => l.l1Name.trim().toLowerCase().includes(key));

  const leafId = hit?.leafId ?? FALLBACK_LEAF_ID;
  leafByCategoryCache.set(key, leafId);
  return leafId;
}

function productHasAttributeValue(product: Product, attributeId: string): boolean {
  const attrs = product.attributes as Record<string, unknown> | undefined;
  if (!attrs) return false;
  const val = attrs[attributeId];
  if (val == null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'number') return Number.isFinite(val);
  return true;
}

export function buildBrandAttributeSchemaRows(products: Product[]): BrandAttributeSchemaRow[] {
  return products.map((product) => {
    const leafId = resolveLeafIdForMerchCategory(product.category ?? '');
    const leaves = getHandbookCategoryLeaves();
    const leaf = leaves.find((l) => l.leafId === leafId);
    const attrIds = resolveAttributeIdsForLeaf(leafId, 1);
    const missingIds = attrIds.filter((id) => !productHasAttributeValue(product, id));
    return {
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      leafId,
      pathLabel: leaf?.pathLabel ?? leafId,
      schemaAttrCount: attrIds.length,
      filledCount: attrIds.length - missingIds.length,
      missingIds,
    };
  });
}

export function summarizeBrandAttributeSchema(rows: BrandAttributeSchemaRow[]): {
  total: number;
  weak: number;
  leafCount: number;
} {
  const leafIds = new Set(rows.map((r) => r.leafId));
  return {
    total: rows.length,
    weak: rows.filter((r) => r.missingIds.length > 0).length,
    leafCount: leafIds.size,
  };
}

export function brandAttributeSchemaMissingLabels(missingIds: readonly string[]): string {
  return missingIds
    .slice(0, 4)
    .map((id) => getAttributeById(id)?.name ?? id)
    .join(', ');
}

export function brandAttributeSchemaToCsv(rows: BrandAttributeSchemaRow[]): string {
  const header = ['sku', 'leafId', 'pathLabel', 'filled', 'schemaAttrCount', 'missingIds'];
  const lines = rows.map((r) =>
    [
      r.sku,
      r.leafId,
      `"${r.pathLabel.replace(/"/g, '""')}"`,
      String(r.filledCount),
      String(r.schemaAttrCount),
      `"${r.missingIds.join('|')}"`,
    ].join(',')
  );
  return [header.join(','), ...lines].join('\n');
}
