/**
 * Wave YK — shop CO golden path: matrix → checkout → replenishment → registry → tracking.
 * Consolidates duplicate CTAs across CO sections 7.1–7.6 (core-226).
 */
import { buildShopWholesaleMatrixSession } from '@/lib/b2b/shop-wholesale-matrix-workspace';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES, shopB2bTrackingOrderHref } from '@/lib/routes';

export type ShopCoGoldenPathStepId =
  | 'matrix'
  | 'checkout'
  | 'replenishment'
  | 'registry'
  | 'tracking';

export const WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID = 'shop-co-golden-path-strip';

export const WAVE_YK_SHOP_CO_GOLDEN_PATH_MATRIX_LINK = 'shop-co-golden-path-matrix-link';
export const WAVE_YK_SHOP_CO_GOLDEN_PATH_CHECKOUT_LINK = 'shop-co-golden-path-checkout-link';
export const WAVE_YK_SHOP_CO_GOLDEN_PATH_REPLENISHMENT_LINK =
  'shop-co-golden-path-replenishment-link';
export const WAVE_YK_SHOP_CO_GOLDEN_PATH_REGISTRY_LINK = 'shop-co-golden-path-registry-link';
export const WAVE_YK_SHOP_CO_GOLDEN_PATH_TRACKING_LINK = 'shop-co-golden-path-tracking-link';

export const SHOP_CO_GOLDEN_PATH_STEPS: ReadonlyArray<{
  id: ShopCoGoldenPathStepId;
  labelRu: string;
  linkTestId: string;
}> = [
  { id: 'matrix', labelRu: 'Матрица', linkTestId: WAVE_YK_SHOP_CO_GOLDEN_PATH_MATRIX_LINK },
  { id: 'checkout', labelRu: 'Оформление', linkTestId: WAVE_YK_SHOP_CO_GOLDEN_PATH_CHECKOUT_LINK },
  {
    id: 'replenishment',
    labelRu: 'Пополнение',
    linkTestId: WAVE_YK_SHOP_CO_GOLDEN_PATH_REPLENISHMENT_LINK,
  },
  { id: 'registry', labelRu: 'Реестр', linkTestId: WAVE_YK_SHOP_CO_GOLDEN_PATH_REGISTRY_LINK },
  { id: 'tracking', labelRu: 'Трекинг', linkTestId: WAVE_YK_SHOP_CO_GOLDEN_PATH_TRACKING_LINK },
];

/** Legacy per-surface link testids preserved for core-01/02 smoke. */
export const SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE = {
  checkout: {
    strip: 'shop-co-checkout-context-strip',
    matrix: 'shop-co-checkout-matrix-link',
    registry: 'shop-co-checkout-registry-link',
  },
  registry: {
    strip: 'shop-co-registry-context-strip',
    matrix: 'shop-co-registry-matrix-link',
    tracking: 'shop-co-registry-tracking-link',
  },
  detail: {
    strip: 'shop-co-detail-context-strip',
    matrix: 'shop-co-detail-matrix-link',
    checkout: 'shop-co-detail-checkout-link',
    replenishment: 'shop-co-detail-replenishment-link',
    tracking: 'shop-co-detail-tracking-link',
  },
  matrix: {
    strip: WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID,
  },
} as const;

export type ShopCoGoldenPathSession = {
  collectionId: string;
  orderId: string;
  matrixHref: string;
  checkoutHref: string;
  replenishmentHref: string;
  registryHref: string;
  trackingHref: string;
};

export function buildShopCoGoldenPathSession(input?: {
  collectionId?: string;
  orderId?: string;
}): ShopCoGoldenPathSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const matrixSession = buildShopWholesaleMatrixSession({ collectionId, orderId });
  const trackingHref = input?.orderId?.trim()
    ? shopB2bTrackingOrderHref(input.orderId.trim())
    : ROUTES.shop.b2bTracking;

  return {
    collectionId,
    orderId,
    matrixHref: matrixSession.matrixHref,
    checkoutHref: matrixSession.checkoutHref,
    replenishmentHref: matrixSession.replenishmentHref,
    registryHref: matrixSession.registryHref,
    trackingHref,
  };
}

export function shopCoGoldenPathHrefForStep(
  session: ShopCoGoldenPathSession,
  step: ShopCoGoldenPathStepId
): string {
  if (step === 'matrix') return session.matrixHref;
  if (step === 'checkout') return session.checkoutHref;
  if (step === 'replenishment') return session.replenishmentHref;
  if (step === 'registry') return session.registryHref;
  return session.trackingHref;
}
