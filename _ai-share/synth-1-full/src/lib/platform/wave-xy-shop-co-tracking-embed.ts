import { shopCoreCollectionOrderCabinetHref } from '@/lib/routes';

/** Wave XY — компактные RU-подписи tracking embed в кабинете CO (без дубля OP-столпа). */
export const WAVE_XY_SHOP_CO_TRACKING_EMBED_STRIP_RU = 'Трекинг заказа';
export const WAVE_XY_SHOP_CO_BRAND_MIRROR_PREFIX_RU = 'Бренд';
export const WAVE_XY_SHOP_CO_CHAIN_LIVE_PREFIX_RU = 'Цепочка';
export const WAVE_XY_SHOP_OP_CO_TRACKING_DEDUP_LINK_RU = 'Трекинг в столпе «Оптовый заказ» →';

export function shopCoCabinetTrackingEmbedChainMirrorTestId(orderId: string): string {
  return `shop-co-cabinet-tracking-embed-chain-mirror-${orderId.trim()}`;
}

export function shopCoCabinetTrackingEmbedChainMirrorSseTestId(orderId: string): string {
  return `${shopCoCabinetTrackingEmbedChainMirrorTestId(orderId)}-sse-live`;
}

export function shopCoCabinetTrackingEmbedChainMirrorPollTestId(orderId: string): string {
  return `${shopCoCabinetTrackingEmbedChainMirrorTestId(orderId)}-poll`;
}

/** Deep-link на embed в кабинете CO (shop OP pillar redirect + hash). */
export function shopCoCabinetTrackingEmbedAnchorHref(
  collectionId: string,
  orderId?: string | null
): string {
  return `${shopCoreCollectionOrderCabinetHref(collectionId, orderId)}#shop-co-buyer-tracking`;
}
