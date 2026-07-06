/**
 * Read-model для вкладки Stock·ATP (replenishment workspace).
 * Demo builder + aggregate from PG grains via calculateATP.
 */
import { products } from '@/lib/products';
import { calculateATP, type InventoryGrain } from '@/lib/logic/inventory-ledger-core';
import {
  rowMatchesReplenishmentStockSlice,
  type ReplenishmentStockSlice,
} from '@/lib/platform/shop-replenishment-stock-slices';

export type ReplenishmentStockRow = {
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
  inTransit: number;
  unconfirmed: number;
  atp: number;
  seasonTag?: string;
  orgId?: string;
};

export type ReplenishmentStockAtpSource = 'pg' | 'pg+wms' | 'wms' | 'file' | 'memory' | 'demo';

const SHOP_ACTOR = { actorId: 'shop1', actorType: 'shop' as const };

function demoGrainsForSku(sku: string, storeStock: number, index: number): InventoryGrain[] {
  const reserved = Math.min(Math.max(storeStock - 1, 0), (index % 4) + 1);
  const onHandQty = Math.max(storeStock - reserved, 0);
  const base = {
    productId: sku,
    sku,
    locationId: 'shop-main',
    ownerId: 'shop1',
    tenantId: 'shop1',
    metadata: { updatedAt: new Date().toISOString() },
  };
  const grains: InventoryGrain[] = [];
  if (onHandQty > 0) {
    grains.push({
      grainId: `${sku}-on-hand`,
      ...base,
      state: 'on_hand',
      quantity: onHandQty,
    });
  }
  if (reserved > 0) {
    grains.push({
      grainId: `${sku}-reserved`,
      ...base,
      state: 'reserved',
      quantity: reserved,
    });
  }
  if (index % 4 === 0) {
    grains.push({
      grainId: `${sku}-transit`,
      ...base,
      state: 'in_transit',
      quantity: 2,
    });
  }
  if (index % 7 === 0) {
    grains.push({
      grainId: `${sku}-unconfirmed`,
      ...base,
      state: 'ex_factory',
      quantity: 1,
    });
  }
  return grains;
}

export function aggregateReplenishmentStockRowsFromGrains(input: {
  grains: InventoryGrain[];
  shopId?: string;
  limit?: number;
  slice?: ReplenishmentStockSlice;
}): ReplenishmentStockRow[] {
  const shopId = input.shopId?.trim() || 'shop1';
  const bySku = new Map<string, InventoryGrain[]>();
  for (const grain of input.grains) {
    const list = bySku.get(grain.sku) ?? [];
    list.push(grain);
    bySku.set(grain.sku, list);
  }

  const rows: ReplenishmentStockRow[] = [];
  for (const [sku, skuGrains] of bySku) {
    const product = products.find((p) => p.sku === sku);
    const onHand =
      skuGrains.filter((g) => g.state === 'on_hand').reduce((s, g) => s + g.quantity, 0) +
      skuGrains.filter((g) => g.state === 'reserved').reduce((s, g) => s + g.quantity, 0);
    const reserved = skuGrains
      .filter((g) => g.state === 'reserved' || g.state === 'reserved_for_channel')
      .reduce((s, g) => s + g.quantity, 0);
    const inTransit = skuGrains
      .filter((g) => g.state === 'in_transit')
      .reduce((s, g) => s + g.quantity, 0);
    const unconfirmed = skuGrains
      .filter((g) => g.state === 'ex_factory')
      .reduce((s, g) => s + g.quantity, 0);
    const atp = calculateATP({
      grains: skuGrains,
      channelId: 'b2b',
      ...SHOP_ACTOR,
      actorId: shopId,
      includeInTransit: false,
    });
    rows.push({
      sku,
      name: product?.name ?? sku,
      onHand,
      reserved,
      inTransit,
      unconfirmed,
      atp,
      seasonTag: (product?.season as string | undefined) ?? 'SS27',
      orgId: shopId,
    });
  }

  rows.sort((a, b) => a.sku.localeCompare(b.sku));
  const limited = input.limit ? rows.slice(0, input.limit) : rows;
  if (!input.slice) return limited;
  return limited.filter((row) => rowMatchesReplenishmentStockSlice(row, input.slice));
}

export function buildShopReplenishmentStockRows(
  limit = 12,
  slice?: ReplenishmentStockSlice
): ReplenishmentStockRow[] {
  const rows = products.slice(5, 5 + limit).map((p, i) => {
    const storeStock = (i * 3 + 2) % 18;
    const grains = demoGrainsForSku(p.sku, storeStock, i);
    const onHand =
      grains.filter((g) => g.state === 'on_hand').reduce((s, g) => s + g.quantity, 0) +
      grains.filter((g) => g.state === 'reserved').reduce((s, g) => s + g.quantity, 0);
    const reserved = grains
      .filter((g) => g.state === 'reserved' || g.state === 'reserved_for_channel')
      .reduce((s, g) => s + g.quantity, 0);
    const inTransit = grains
      .filter((g) => g.state === 'in_transit')
      .reduce((s, g) => s + g.quantity, 0);
    const unconfirmed = grains
      .filter((g) => g.state === 'ex_factory')
      .reduce((s, g) => s + g.quantity, 0);
    const atp = calculateATP({
      grains,
      channelId: 'b2b',
      ...SHOP_ACTOR,
      includeInTransit: false,
    });

    return {
      sku: p.sku,
      name: p.name,
      onHand,
      reserved,
      inTransit,
      unconfirmed,
      atp,
      seasonTag: (p.season as string | undefined) ?? (i % 2 === 0 ? 'SS27' : 'FW27'),
      orgId: SHOP_ACTOR.actorId,
    };
  });
  if (!slice) return rows;
  return rows.filter((row) => rowMatchesReplenishmentStockSlice(row, slice));
}
