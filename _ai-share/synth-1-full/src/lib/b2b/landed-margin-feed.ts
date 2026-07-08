import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
import type { Product } from '@/lib/types';
import { simulateMargin } from '@/lib/fashion/margin-simulator';

export type LandedMarginFeedSource = 'pg' | 'order' | 'catalog';

export type LandedMarginFeedRow = {
  lineId: string;
  sku: string;
  label: string;
  wholesaleRub: number;
  landedRub: number;
  marginPct: number;
  onTarget: boolean;
  source: LandedMarginFeedSource;
  orderId?: string;
  retailRub?: number;
  productionRub?: number;
};

export type LandedMarginFeedStorageMode = 'pg' | 'file' | 'memory' | 'demo';

export const LANDED_MARGIN_TARGET_PCT = 38;

export function computeLandedMarginPct(wholesaleRub: number, landedRub: number): number {
  if (wholesaleRub <= 0) return 0;
  return Math.round(((wholesaleRub - landedRub) / wholesaleRub) * 1000) / 10;
}

export function buildLandedMarginFeedRow(input: {
  lineId: string;
  sku: string;
  label: string;
  wholesaleRub: number;
  landedRub: number;
  source: LandedMarginFeedSource;
  orderId?: string;
  retailRub?: number;
  productionRub?: number;
}): LandedMarginFeedRow {
  const marginPct = computeLandedMarginPct(input.wholesaleRub, input.landedRub);
  return {
    lineId: input.lineId,
    sku: input.sku,
    label: input.label,
    wholesaleRub: input.wholesaleRub,
    landedRub: input.landedRub,
    marginPct,
    onTarget: marginPct >= LANDED_MARGIN_TARGET_PCT,
    source: input.source,
    orderId: input.orderId,
    retailRub: input.retailRub,
    productionRub: input.productionRub,
  };
}

export function buildLandedMarginRowsFromB2bOrder(
  order: Workshop2B2bOrderRecord
): LandedMarginFeedRow[] {
  const grouped = new Map<
    string,
    { label: string; wholesaleRub: number; landedRub: number; qty: number }
  >();

  for (const line of order.lines ?? []) {
    const key = `${line.articleId}:${line.colorCode || 'default'}`;
    const wholesale = line.wholesalePriceRub;
    const landed = Math.round(wholesale * 0.58);
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        label: `${line.articleId} · ${line.colorCode || 'core'}`,
        wholesaleRub: wholesale,
        landedRub: landed,
        qty: line.qty,
      });
      continue;
    }
    const totalQty = existing.qty + line.qty;
    existing.wholesaleRub = Math.round(
      (existing.wholesaleRub * existing.qty + wholesale * line.qty) / totalQty
    );
    existing.landedRub = Math.round(
      (existing.landedRub * existing.qty + landed * line.qty) / totalQty
    );
    existing.qty = totalQty;
  }

  return [...grouped.entries()].map(([key, row], index) =>
    buildLandedMarginFeedRow({
      lineId: `order-${order.id}-${index}`,
      sku: key.split(':')[0] ?? key,
      label: row.label,
      wholesaleRub: row.wholesaleRub,
      landedRub: row.landedRub,
      source: 'order',
      orderId: order.id,
    })
  );
}

export function buildLandedMarginCatalogSeedRows(input?: {
  collectionId?: string;
  orderId?: string;
}): LandedMarginFeedRow[] {
  const collectionId = input?.collectionId?.trim() || 'SS27';
  const orderId = input?.orderId?.trim() || 'demo';
  const seed = collectionId.length + orderId.length;
  const base = [
    {
      sku: 'FW-JKT-01',
      label: 'FW core · jacket',
      wholesaleRub: 8900,
      landedRub: 5200 + (seed % 3) * 120,
    },
    {
      sku: 'FW-TRS-02',
      label: 'FW core · trouser',
      wholesaleRub: 5400,
      landedRub: 3100 + (seed % 2) * 90,
    },
    { sku: 'SS-TEE-03', label: 'SS add-on · tee', wholesaleRub: 2200, landedRub: 1400 },
  ];
  return base.map((row, index) =>
    buildLandedMarginFeedRow({
      lineId: `catalog-${index}`,
      sku: row.sku,
      label: row.label,
      wholesaleRub: row.wholesaleRub,
      landedRub: row.landedRub,
      source: 'catalog',
      orderId,
    })
  );
}

export function buildBrandSimulatorFeedRows(
  products: Product[],
  limit = 12
): LandedMarginFeedRow[] {
  return products.slice(0, limit).map((product, index) => {
    const simulation = simulateMargin(product);
    const wholesaleRub = Math.round(simulation.retailPrice * 0.45);
    const landedRub = simulation.productionCost + simulation.logisticsCost;
    return buildLandedMarginFeedRow({
      lineId: `sim-${index}`,
      sku: product.sku,
      label: product.name,
      wholesaleRub,
      landedRub,
      source: 'catalog',
      retailRub: simulation.retailPrice,
      productionRub: simulation.productionCost,
    });
  });
}

export function mergeLandedMarginFeedRows(
  baseRows: readonly LandedMarginFeedRow[],
  persistedByLineId: ReadonlyMap<string, LandedMarginFeedRow>
): LandedMarginFeedRow[] {
  return baseRows.map((row) => {
    const persisted = persistedByLineId.get(row.lineId) ?? persistedByLineId.get(row.sku);
    if (!persisted) return row;
    return buildLandedMarginFeedRow({
      ...row,
      wholesaleRub: persisted.wholesaleRub,
      landedRub: persisted.landedRub,
      retailRub: persisted.retailRub ?? row.retailRub,
      productionRub: persisted.productionRub ?? row.productionRub,
      source: 'pg',
      orderId: row.orderId ?? persisted.orderId,
    });
  });
}

export function summarizeLandedMarginFeed(rows: readonly LandedMarginFeedRow[]): {
  total: number;
  onTarget: number;
  avgMarginPct: number;
  orderSourced: number;
  pgSourced: number;
} {
  if (!rows.length)
    return { total: 0, onTarget: 0, avgMarginPct: 0, orderSourced: 0, pgSourced: 0 };
  const onTarget = rows.filter((r) => r.onTarget).length;
  const avgMarginPct =
    Math.round((rows.reduce((sum, r) => sum + r.marginPct, 0) / rows.length) * 10) / 10;
  return {
    total: rows.length,
    onTarget,
    avgMarginPct,
    orderSourced: rows.filter((r) => r.source === 'order').length,
    pgSourced: rows.filter((r) => r.source === 'pg').length,
  };
}

/** @deprecated use buildLandedMarginCatalogSeedRows */
export function legacyShopLandedMarginRows(input?: {
  collectionId?: string;
  orderId?: string;
}): LandedMarginFeedRow[] {
  return buildLandedMarginCatalogSeedRows(input);
}
