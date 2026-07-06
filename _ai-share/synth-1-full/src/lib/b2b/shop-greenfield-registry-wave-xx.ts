import { shopCoreBuyerLabelRu } from '@/lib/order/shop-core-buyer-context';
import { shopB2bMatrixReorderHref } from '@/lib/routes';

/** Wave XX — shop2 full greenfield registry PG buyer + pricelist + matrix seed (extends VN). */
export const SHOP_GREENFIELD_ONBOARDING_API = '/api/shop/b2b/greenfield/onboarding' as const;

export const SHOP_GREENFIELD_PG_TABLE = 'shop_greenfield_onboarding' as const;

export const SHOP_GREENFIELD_BUYER_CRM_PG_TABLE = 'shop_buyer_crm_profiles' as const;

export const SHOP_GREENFIELD_WAVE_XX_MIGRATION = '040_wave_sd_s4_greenfield_ops' as const;

export const SHOP_GREENFIELD_DEFAULT_BUYER_ID = 'shop2' as const;

export const SHOP_GREENFIELD_DEFAULT_COLLECTION_ID = 'SS27' as const;

/** Cabinet CO · greenfield registry strip (VN + XX). */
export const SHOP_CO_GREENFIELD_REGISTRY_STRIP_TESTID = 'shop-co-greenfield-registry-strip' as const;
export const SHOP_CO_GREENFIELD_REGISTRY_BUYER_TESTID = 'shop-co-greenfield-registry-buyer' as const;
export const SHOP_CO_GREENFIELD_REGISTRY_BUYER_PG_TESTID =
  'shop-co-greenfield-registry-buyer-pg' as const;
export const SHOP_CO_GREENFIELD_REGISTRY_PG_TESTID = 'shop-co-greenfield-registry-pg' as const;
export const SHOP_CO_GREENFIELD_REGISTRY_MEMORY_TESTID =
  'shop-co-greenfield-registry-memory' as const;
export const SHOP_CO_GREENFIELD_REGISTRY_CRM_TESTID = 'shop-co-greenfield-registry-crm' as const;
export const SHOP_CO_GREENFIELD_REGISTRY_PRICELIST_TESTID =
  'shop-co-greenfield-registry-pricelist' as const;
export const SHOP_CO_GREENFIELD_REGISTRY_PATH_TESTID = 'shop-co-greenfield-registry-path' as const;
export const SHOP_CO_GREENFIELD_REGISTRY_MATRIX_SEED_LINK_TESTID =
  'shop-co-greenfield-registry-matrix-seed-link' as const;
export const SHOP_CO_GREENFIELD_REGISTRY_STATUS_TESTID = 'shop-co-greenfield-registry-status' as const;

/** Registry empty · PG onboarding strip. */
export const SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_STRIP_TESTID =
  'shop-co-registry-greenfield-onboarding-strip' as const;
export const SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PG_TESTID =
  'shop-co-registry-greenfield-onboarding-pg' as const;
export const SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_MEMORY_TESTID =
  'shop-co-registry-greenfield-onboarding-memory' as const;
export const SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_CRM_TESTID =
  'shop-co-registry-greenfield-onboarding-crm' as const;
export const SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PRICELIST_TESTID =
  'shop-co-registry-greenfield-onboarding-pricelist' as const;
export const SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_MATRIX_SEED_LINK_TESTID =
  'shop-co-registry-greenfield-onboarding-matrix-seed-link' as const;

/** Registry post-checkout focus strip. */
export const SHOP_CO_REGISTRY_GREENFIELD_FOCUS_STRIP_TESTID =
  'shop-co-registry-greenfield-focus-strip' as const;
export const SHOP_CO_REGISTRY_GREENFIELD_FOCUS_MATRIX_SEED_LINK_TESTID =
  'shop-co-registry-greenfield-focus-matrix-seed-link' as const;

/** Empty registry monetization spine. */
export const SHOP_CO_REGISTRY_EMPTY_GREENFIELD_MONETIZATION_STRIP_TESTID =
  'shop-co-registry-empty-greenfield-monetization-strip' as const;

export const SHOP_GREENFIELD_REGISTRY_TITLE_RU = 'Новый магазин';
export const SHOP_GREENFIELD_REGISTRY_PG_PROFILE_RU = 'Профиль PG';
export const SHOP_GREENFIELD_MATRIX_SEED_CTA_RU = 'Первый seed матрицы';
export const SHOP_GREENFIELD_ONBOARDING_PENDING_RU =
  'Назначьте сегмент CRM бренда и синхронизируйте прайс-лист для первого заказа.';
export const SHOP_GREENFIELD_ONBOARDING_REGISTRY_PENDING_RU =
  'Назначьте сегмент CRM бренда и синхронизируйте прайс-лист.';

/** Dev bridge · greenfield CRM strip (wave XX RU polish). */
export const SHOP_GREENFIELD_CRM_STRIP_TITLE_RU = 'CRM покупателя';
export const SHOP_GREENFIELD_CRM_LOADING_RU = 'Загрузка сегмента и условий…';
export const SHOP_GREENFIELD_CRM_UNAVAILABLE_RU =
  'CRM-сегмент временно недоступен — откройте витрину или прайс-лист бренда.';
export const SHOP_GREENFIELD_CRM_SHOWROOM_RU = 'Шоурум';
export const SHOP_GREENFIELD_CRM_MATRIX_RU = 'Матрица';
export const SHOP_GREENFIELD_CRM_ATP_RU = 'ATP';
export const SHOP_GREENFIELD_CRM_PARTNERS_RU = 'Партнёры';
export const SHOP_GREENFIELD_CRM_BRAND_PRICELIST_RU = 'Прайс-лист бренда';
export const SHOP_GREENFIELD_CRM_BRAND_SEGMENTS_RU = 'Сегменты CRM';
export const SHOP_GREENFIELD_CRM_LANDED_MARGIN_RU = 'Landed margin';
export const SHOP_GREENFIELD_CRM_CHECKOUT_RU = 'Оформление';

export type ShopGreenfieldOnboardingSnapshot = {
  crmReady?: boolean;
  pricelistReady?: boolean;
  matrixSeedHref?: string;
  firstOrderId?: string;
};

export function shopGreenfieldOnboardingApiPath(
  buyerId: string,
  collectionId: string
): string {
  const params = new URLSearchParams({
    buyerId: buyerId.trim() || SHOP_GREENFIELD_DEFAULT_BUYER_ID,
    collectionId: collectionId.trim() || SHOP_GREENFIELD_DEFAULT_COLLECTION_ID,
  });
  return `${SHOP_GREENFIELD_ONBOARDING_API}?${params.toString()}`;
}

export function shopGreenfieldRegistryReady(state: ShopGreenfieldOnboardingSnapshot): boolean {
  return Boolean(state.crmReady && state.pricelistReady);
}

export function shopGreenfieldMatrixSeedHref(input: {
  collectionId: string;
  buyerId: string;
  state?: ShopGreenfieldOnboardingSnapshot | null;
}): string {
  const collectionId = input.collectionId.trim() || SHOP_GREENFIELD_DEFAULT_COLLECTION_ID;
  const buyerId = input.buyerId.trim() || SHOP_GREENFIELD_DEFAULT_BUYER_ID;
  return (
    input.state?.matrixSeedHref ??
    shopB2bMatrixReorderHref(collectionId, input.state?.firstOrderId ?? '', { buyerId })
  );
}

export function shopGreenfieldBuyerLabelRu(buyerId: string): string {
  return shopCoreBuyerLabelRu(buyerId.trim() || SHOP_GREENFIELD_DEFAULT_BUYER_ID);
}

export function shopGreenfieldOnboardingMessageRu(input: {
  crmReady: boolean;
  pricelistReady: boolean;
  storageMode?: string | null;
  buyerId?: string;
}): string {
  const buyer = shopGreenfieldBuyerLabelRu(input.buyerId ?? SHOP_GREENFIELD_DEFAULT_BUYER_ID);
  const storage =
    input.storageMode === 'postgres' ? 'PG' : input.storageMode === 'memory' ? 'память' : '—';
  if (input.crmReady && input.pricelistReady) {
    return `${buyer}: CRM и прайс готовы · ${storage} · seed матрицы доступен.`;
  }
  return `${buyer}: назначьте CRM-сегмент бренда и синхронизируйте прайс · ${storage}.`;
}

export function shopGreenfieldStorageBadgeTestId(
  storageMode: string | null | undefined,
  surface: 'cabinet' | 'registry'
): string | null {
  if (storageMode === 'postgres') {
    return surface === 'cabinet'
      ? SHOP_CO_GREENFIELD_REGISTRY_PG_TESTID
      : SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PG_TESTID;
  }
  if (storageMode === 'memory') {
    return surface === 'cabinet'
      ? SHOP_CO_GREENFIELD_REGISTRY_MEMORY_TESTID
      : SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_MEMORY_TESTID;
  }
  return null;
}
