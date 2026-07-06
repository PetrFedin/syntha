import 'server-only';

import type {
  ShopReplenishmentWmsAtpFeedItem,
  ShopReplenishmentWmsAtpFeedSource,
} from '@/lib/platform/shop-replenishment-wms-atp-feed';
import { buildShopReplenishmentStockRows } from '@/lib/platform/shop-replenishment-stock-atp';
import { getShopReplenishmentStockAtpRows } from '@/lib/server/shop-replenishment-stock-atp-server';
import { isWorkshop2InternalWmsEnabled } from '@/lib/production/workshop2-internal-wms';
import { listWorkshop2WmsBalancesForCollection } from '@/lib/server/workshop2-wms-repository';

export type ShopReplenishmentWmsAtpFeedResult = {
  items: ShopReplenishmentWmsAtpFeedItem[];
  source: ShopReplenishmentWmsAtpFeedSource;
  skuCount: number;
  atpTotal: number;
  wmsEnabled: boolean;
  messageRu: string;
};

/** WMS ATP feed stub for replenishment workspace badge (wave WG). */
export async function getShopReplenishmentWmsAtpFeed(input: {
  shopId?: string;
  collectionId?: string;
  limit?: number;
}): Promise<ShopReplenishmentWmsAtpFeedResult> {
  const shopId = input.shopId?.trim() || 'shop1';
  const collectionId = input.collectionId?.trim() || 'SS27';
  const limit = input.limit ?? 24;
  const wmsEnabled = isWorkshop2InternalWmsEnabled();

  const atpResult = await getShopReplenishmentStockAtpRows({
    shopId,
    collectionId,
    limit,
  });

  let items: ShopReplenishmentWmsAtpFeedItem[] = atpResult.rows.map((row) => ({
    sku: row.sku,
    label: row.name,
    qtyOnHand: row.onHand,
    qtyReserved: row.reserved,
    qtyAvailable: row.atp,
  }));

  let source: ShopReplenishmentWmsAtpFeedSource =
    atpResult.source === 'pg+wms' || atpResult.source === 'wms'
      ? atpResult.source
      : atpResult.source === 'pg'
        ? 'pg'
        : 'demo';

  if (wmsEnabled) {
    const wmsBalances = await listWorkshop2WmsBalancesForCollection({
      collectionId,
      limit: limit * 2,
    });
    if (wmsBalances.length > 0) {
      const bySku = new Map(items.map((item) => [item.sku, { ...item }]));
      for (const bal of wmsBalances) {
        const sku = bal.sku.trim();
        if (!sku) continue;
        const existing = bySku.get(sku);
        if (existing) {
          existing.qtyOnHand = Math.max(existing.qtyOnHand, bal.qtyOnHand);
          existing.qtyReserved = Math.max(existing.qtyReserved, bal.qtyReserved);
          existing.qtyAvailable = Math.max(existing.qtyAvailable, bal.qtyAvailable);
        } else {
          bySku.set(sku, {
            sku,
            label: bal.label || sku,
            qtyOnHand: bal.qtyOnHand,
            qtyReserved: bal.qtyReserved,
            qtyAvailable: bal.qtyAvailable,
          });
        }
      }
      items = [...bySku.values()].sort((a, b) => a.sku.localeCompare(b.sku)).slice(0, limit);
      source = atpResult.source === 'pg' ? 'pg+wms' : 'wms';
    }
  }

  if (items.length === 0) {
    const demoRows = buildShopReplenishmentStockRows(limit);
    items = demoRows.map((row) => ({
      sku: row.sku,
      label: row.name,
      qtyOnHand: row.onHand,
      qtyReserved: row.reserved,
      qtyAvailable: row.atp,
    }));
    source = 'demo';
  }

  const atpTotal = items.reduce((sum, item) => sum + Math.max(0, item.qtyAvailable), 0);

  return {
    items,
    source,
    skuCount: items.length,
    atpTotal,
    wmsEnabled,
    messageRu:
      source === 'pg+wms'
        ? `Лента WMS + PG · ${items.length} SKU · ATP ${atpTotal}.`
        : source === 'wms'
          ? `Лента WMS · ${items.length} SKU · ATP ${atpTotal}.`
          : source === 'pg'
            ? `ATP PostgreSQL · ${items.length} SKU.`
            : `Демо-лента ATP · ${items.length} SKU.`,
  };
}
