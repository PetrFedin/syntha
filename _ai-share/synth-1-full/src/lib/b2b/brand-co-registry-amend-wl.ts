import { brandB2bOrderHref } from '@/lib/routes';

/** GET — pending amend queue for brand CO registry (wave WL). */
export const BRAND_CO_REGISTRY_AMENDMENTS_API_PATH = '/api/brand/b2b/registry/amendments';

export const BRAND_CO_REGISTRY_AMEND_QUEUE_STRIP_TESTID = 'brand-co-registry-amend-queue-strip';
export const BRAND_CO_REGISTRY_AMEND_QUEUE_COUNT_TESTID = 'brand-co-registry-amend-queue-count';
export const BRAND_CO_REGISTRY_SHOP_TRACKING_PEER_STRIP_TESTID =
  'brand-co-registry-shop-tracking-peer-strip';
export const BRAND_CO_REGISTRY_SHOP_TRACKING_LINK_TESTID = 'brand-co-registry-shop-tracking-link';

export function brandCoRegistryAmendmentsApiPath(
  collectionId: string,
  partner?: string | null
): string {
  const qs = new URLSearchParams({ collectionId });
  if (partner?.trim() && partner !== 'all') qs.set('partner', partner.trim());
  return `${BRAND_CO_REGISTRY_AMENDMENTS_API_PATH}?${qs}`;
}

export function brandCoRegistryAmendApproveApiPath(orderId: string, amendmentId: string): string {
  return `/api/brand/b2b/orders/${encodeURIComponent(orderId)}/amendments/${encodeURIComponent(
    amendmentId
  )}/approve`;
}

export function brandCoRegistryAmendRejectApiPath(orderId: string, amendmentId: string): string {
  return `/api/brand/b2b/orders/${encodeURIComponent(orderId)}/amendments/${encodeURIComponent(
    amendmentId
  )}/reject`;
}

export function brandCoRegistryAmendDetailHref(orderId: string): string {
  return brandB2bOrderHref(orderId);
}

export const BRAND_CO_REGISTRY_AMEND_QUEUE_EMPTY_RU = 'Нет активных заявок на изменение заказа.';
export const BRAND_CO_REGISTRY_AMEND_QUEUE_SUMMARY_RU = 'Заявки на изменение в реестре';
