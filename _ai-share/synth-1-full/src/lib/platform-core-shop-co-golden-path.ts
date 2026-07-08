import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
/**
 * Shop CO golden path — native `/shop/core?section=…` (без legacy `/shop/b2b/*`).
 */
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  platformCoreCabinetSectionHref,
  shopCoMatrixEmbeddedTabHref,
} from '@/lib/platform-core-cabinet-workspace';
import { ROUTES } from '@/lib/platform-core-routes';

export type PlatformCoreShopCoGoldenPathStepId =
  | 'matrix'
  | 'checkout'
  | 'replenishment'
  | 'registry'
  | 'tracking';

export const PLATFORM_CORE_SHOP_CO_GOLDEN_PATH_STEPS: ReadonlyArray<{
  id: PlatformCoreShopCoGoldenPathStepId;
  labelRu: string;
  linkTestId: string;
}> = [
  { id: 'matrix', labelRu: 'Матрица', linkTestId: 'shop-co-golden-path-matrix-link' },
  { id: 'checkout', labelRu: 'Оформление', linkTestId: 'shop-co-golden-path-checkout-link' },
  {
    id: 'replenishment',
    labelRu: 'Пополнение',
    linkTestId: 'shop-co-golden-path-replenishment-link',
  },
  { id: 'registry', labelRu: 'Реестр', linkTestId: 'shop-co-golden-path-registry-link' },
  { id: 'tracking', labelRu: 'Трекинг', linkTestId: 'shop-co-golden-path-tracking-link' },
];

export type PlatformCoreShopCoGoldenPathSession = {
  collectionId: string;
  orderId: string;
  matrixHref: string;
  checkoutHref: string;
  replenishmentHref: string;
  registryHref: string;
  trackingHref: string;
};

function shopReplenishmentHref(collectionId: string, orderId: string): string {
  const sp = new URLSearchParams({
    collection: collectionId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: 'replenishment',
  });
  if (orderId.trim()) sp.set('order', orderId.trim());
  return `${LEGACY_ROUTES.shop.b2bReplenishment}?${sp.toString()}`;
}

export function buildPlatformCoreShopCoGoldenPathSession(input?: {
  collectionId?: string;
  orderId?: string;
}): PlatformCoreShopCoGoldenPathSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const demo = {
    collectionId,
    demoOrderId: orderId,
    demoArticleId: PLATFORM_CORE_DEMO.demoArticleId,
  };

  const matrixHref = shopCoMatrixEmbeddedTabHref('matrix', { collectionId, orderId });
  const checkoutHref = platformCoreCabinetSectionHref(
    'shop',
    'collection_order',
    'shop-co-checkout',
    demo
  );
  const registryHref = platformCoreCabinetSectionHref(
    'shop',
    'collection_order',
    'shop-co-registry',
    demo
  );
  const trackingHref = platformCoreCabinetSectionHref(
    'shop',
    'collection_order',
    'shop-co-buyer-tracking',
    demo
  );

  return {
    collectionId,
    orderId,
    matrixHref,
    checkoutHref,
    replenishmentHref: shopReplenishmentHref(collectionId, orderId),
    registryHref,
    trackingHref,
  };
}

export function platformCoreShopCoGoldenPathHrefForStep(
  session: PlatformCoreShopCoGoldenPathSession,
  step: PlatformCoreShopCoGoldenPathStepId
): string {
  if (step === 'matrix') return session.matrixHref;
  if (step === 'checkout') return session.checkoutHref;
  if (step === 'replenishment') return session.replenishmentHref;
  if (step === 'registry') return session.registryHref;
  return session.trackingHref;
}

export function shopCoGoldenPathStepFromFeature(
  featureId: string | null | undefined
): PlatformCoreShopCoGoldenPathStepId | undefined {
  if (featureId === 'matrix') return 'matrix';
  if (featureId === 'checkout') return 'checkout';
  if (featureId === 'replenishment' || featureId === 'stock-atp' || featureId === 'rules') {
    return 'replenishment';
  }
  if (featureId === 'registry') return 'registry';
  if (featureId === 'tracking') return 'tracking';
  return undefined;
}
