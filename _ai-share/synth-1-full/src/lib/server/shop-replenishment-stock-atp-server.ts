import 'server-only';

import {
  aggregateReplenishmentStockRowsFromGrains,
  buildShopReplenishmentStockRows,
  type ReplenishmentStockAtpSource,
  type ReplenishmentStockRow,
} from '@/lib/platform/shop-replenishment-stock-atp';
import type { ReplenishmentStockSlice } from '@/lib/platform/shop-replenishment-stock-slices';
import type { InventoryGrain } from '@/lib/logic/inventory-ledger-core';
import { listShopInventoryLedgerAdjustments } from '@/lib/server/shop-inventory-ledger-adjust-repository';
import {
  listShopInventoryLedgerGrains,
  shopInventoryLedgerGrainsStorageMode,
} from '@/lib/server/shop-inventory-ledger-grains-repository';
import { listWorkshop2B2bOrdersForCollection } from '@/lib/server/workshop2-b2b-orders-repository';
import { isWorkshop2InternalWmsEnabled } from '@/lib/production/workshop2-internal-wms';
import { listWorkshop2WmsBalancesForCollection } from '@/lib/server/workshop2-wms-repository';

function mergeWmsAtpIntoRows(input: {
  rows: ReplenishmentStockRow[];
  wmsBalances: Awaited<ReturnType<typeof listWorkshop2WmsBalancesForCollection>>;
  shopId: string;
  limit: number;
}): ReplenishmentStockRow[] {
  const bySku = new Map(input.rows.map((r) => [r.sku, { ...r }]));
  for (const bal of input.wmsBalances) {
    const sku = bal.sku.trim();
    if (!sku) continue;
    const existing = bySku.get(sku);
    if (existing) {
      existing.onHand = Math.max(existing.onHand, bal.qtyOnHand);
      existing.reserved = Math.max(existing.reserved, bal.qtyReserved);
      existing.atp = Math.max(existing.atp, bal.qtyAvailable);
    } else {
      bySku.set(sku, {
        sku,
        name: bal.label || sku,
        onHand: bal.qtyOnHand,
        reserved: bal.qtyReserved,
        inTransit: 0,
        unconfirmed: 0,
        atp: bal.qtyAvailable,
        orgId: input.shopId,
      });
    }
  }
  return [...bySku.values()].sort((a, b) => a.sku.localeCompare(b.sku)).slice(0, input.limit);
}

function applyLedgerAdjustments(grains: InventoryGrain[], shopId: string, adjustments: Awaited<ReturnType<typeof listShopInventoryLedgerAdjustments>>): InventoryGrain[] {
  const deltaBySku = new Map<string, number>();
  for (const adj of adjustments) {
    if (adj.shopId !== shopId) continue;
    deltaBySku.set(adj.sku, (deltaBySku.get(adj.sku) ?? 0) + adj.delta);
  }
  if (deltaBySku.size === 0) return grains;

  const next = grains.map((g) => ({ ...g, metadata: { ...g.metadata } }));
  for (const [sku, delta] of deltaBySku) {
    if (delta === 0) continue;
    const onHand = next.find((g) => g.sku === sku && g.state === 'on_hand');
    if (onHand) {
      onHand.quantity = Math.max(0, onHand.quantity + delta);
      onHand.metadata.updatedAt = new Date().toISOString();
    } else if (delta > 0) {
      next.push({
        grainId: `${shopId}-${sku}-on-hand-adj`,
        productId: sku,
        sku,
        locationId: 'shop-main',
        state: 'on_hand',
        quantity: delta,
        ownerId: shopId,
        tenantId: shopId,
        channelId: 'b2b',
        metadata: { updatedAt: new Date().toISOString(), version: 1 },
      });
    }
  }
  return next;
}

async function mergeB2bReservedGrains(
  grains: InventoryGrain[],
  shopId: string,
  collectionId?: string
): Promise<InventoryGrain[]> {
  const cid = collectionId?.trim() || 'SS27';
  const orders = await listWorkshop2B2bOrdersForCollection(cid);
  const reservedBySku = new Map<string, number>();
  for (const order of orders) {
    if (order.buyerId?.trim() && order.buyerId.trim() !== shopId) continue;
    if (!['submitted', 'confirmed', 'allocated'].includes(order.status)) continue;
    for (const line of order.lines) {
      const sku = line.articleId?.trim() || order.articleId?.trim();
      if (!sku) continue;
      reservedBySku.set(sku, (reservedBySku.get(sku) ?? 0) + (line.qty ?? 0));
    }
  }
  if (reservedBySku.size === 0) return grains;

  const next = grains.map((g) => ({ ...g, metadata: { ...g.metadata } }));
  for (const [sku, qty] of reservedBySku) {
    const existing = next.find((g) => g.sku === sku && g.state === 'reserved');
    if (existing) {
      existing.quantity = Math.max(existing.quantity, qty);
    } else {
      next.push({
        grainId: `${shopId}-${sku}-b2b-reserved`,
        productId: sku,
        sku,
        locationId: 'shop-main',
        state: 'reserved',
        quantity: qty,
        ownerId: shopId,
        tenantId: shopId,
        channelId: 'b2b',
        metadata: { updatedAt: new Date().toISOString(), version: 1 },
      });
    }
  }
  return next;
}

export type ShopReplenishmentStockAtpServerResult = {
  rows: ReplenishmentStockRow[];
  source: ReplenishmentStockAtpSource;
  grainCount: number;
  messageRu: string;
};

/** PG-backed ATP rows for replenishment workspace (P0 spine). */
export async function getShopReplenishmentStockAtpRows(input: {
  shopId?: string;
  collectionId?: string;
  slice?: ReplenishmentStockSlice;
  limit?: number;
}): Promise<ShopReplenishmentStockAtpServerResult> {
  const shopId = input.shopId?.trim() || 'shop1';
  const limit = input.limit ?? 12;
  const sliceCollection =
    input.slice?.collectionId && input.slice.collectionId !== 'all'
      ? input.slice.collectionId
      : input.collectionId;

  try {
    let grains = await listShopInventoryLedgerGrains({
      shopId,
      collectionId: sliceCollection,
    });
    const adjustments = await listShopInventoryLedgerAdjustments(shopId);
    grains = applyLedgerAdjustments(grains, shopId, adjustments);
    grains = await mergeB2bReservedGrains(grains, shopId, sliceCollection);

    const rows = aggregateReplenishmentStockRowsFromGrains({
      grains,
      shopId,
      limit,
      slice: input.slice,
    });

    const storageMode = shopInventoryLedgerGrainsStorageMode();
    let mergedRows = rows;
    let source: ReplenishmentStockAtpSource = storageMode;
    let wmsGrainCount = 0;

    const cid = sliceCollection?.trim() || input.collectionId?.trim() || 'SS27';
    if (isWorkshop2InternalWmsEnabled()) {
      const wmsBalances = await listWorkshop2WmsBalancesForCollection({
        collectionId: cid,
        limit: limit * 2,
      });
      wmsGrainCount = wmsBalances.length;
      if (wmsBalances.length > 0) {
        mergedRows = mergeWmsAtpIntoRows({
          rows,
          wmsBalances,
          shopId,
          limit,
        });
        source = storageMode === 'pg' ? 'pg+wms' : 'wms';
      }
    }

    return {
      rows: mergedRows,
      source,
      grainCount: grains.length + wmsGrainCount,
      messageRu:
        source === 'pg+wms'
          ? `ATP PostgreSQL + WMS · ${mergedRows.length} SKU.`
          : source === 'wms'
            ? `ATP из WMS · ${mergedRows.length} SKU.`
            : storageMode === 'pg'
              ? `ATP из PostgreSQL · ${grains.length} grains · ${rows.length} SKU.`
              : `ATP из ${storageMode} · ${rows.length} SKU.`,
    };
  } catch {
    const rows = buildShopReplenishmentStockRows(limit, input.slice);
    return {
      rows,
      source: 'demo',
      grainCount: 0,
      messageRu: 'Fallback demo grains — PG недоступен.',
    };
  }
}
