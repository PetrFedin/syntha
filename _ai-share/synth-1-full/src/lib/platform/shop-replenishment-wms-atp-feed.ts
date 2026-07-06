import { shopReplenishmentMatrixPrefillHref } from '@/lib/b2b/shop-replenishment-matrix-prefill';

export type ShopReplenishmentWmsAtpFeedItem = {
  sku: string;
  label: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
};

export type ShopReplenishmentWmsAtpFeedSource = 'wms' | 'pg+wms' | 'pg' | 'demo';

export const SHOP_REPLENISHMENT_WMS_ATP_FEED_API = '/api/shop/b2b/replenishment/wms-atp-feed';

export const SHOP_REPLENISHMENT_WMS_ATP_BADGE_LOADING_RU = 'WMS · проверка ATP…';

export const SHOP_REPLENISHMENT_MATRIX_AUTO_LINES_STRIP_RU =
  'Автоперенос SKU из пополнения в матрицу дозаказа';

export function formatShopReplenishmentWmsAtpBadgeRu(input: {
  loading: boolean;
  liveWms: boolean;
  atpTotal: number;
  skuCount: number;
}): string {
  if (input.loading) return SHOP_REPLENISHMENT_WMS_ATP_BADGE_LOADING_RU;
  if (input.liveWms && input.atpTotal > 0) {
    return `WMS · ${input.atpTotal.toLocaleString('ru-RU')} ед. · ${input.skuCount} SKU`;
  }
  if (input.skuCount > 0) return `ATP · ${input.skuCount} SKU`;
  return 'WMS · нет данных';
}

export function formatShopReplenishmentWmsAtpSourceBadgeRu(
  source: ShopReplenishmentWmsAtpFeedSource | string | null | undefined
): string {
  if (!source?.trim()) return 'Источник неизвестен';
  if (source === 'pg+wms') return 'PG + WMS';
  if (source === 'wms') return 'WMS';
  if (source === 'pg') return 'PostgreSQL';
  if (source === 'demo') return 'Демо';
  return source;
}

/** Deep-link to matrix with auto-lines hint from replenishment workspace. */
export function shopReplenishmentMatrixAutoLinesHref(
  collectionId: string,
  orderId: string | undefined,
  opts: { lineCount: number; atpQtyTotal?: number; buyerId?: string }
): string {
  const base = shopReplenishmentMatrixPrefillHref(collectionId, orderId, {
    appliedLines: opts.lineCount,
    atpQtyTotal: opts.atpQtyTotal,
    buyerId: opts.buyerId,
  });
  const sp = new URLSearchParams(base.split('?')[1] ?? '');
  sp.set('replenishmentAutoLines', '1');
  return `/shop/b2b/matrix?${sp.toString()}`;
}

export function formatShopReplenishmentMatrixAutoLinesLinkRu(lineCount: number): string {
  if (lineCount <= 0) return 'Матрица · проверить ATP';
  return `Матрица · ${lineCount} SKU`;
}
