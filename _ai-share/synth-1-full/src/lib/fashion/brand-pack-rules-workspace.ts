import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  ROUTES,
  shopB2bCheckoutCollectionHref,
  shopB2bMatrixPrepackHref,
  shopB2bMatrixReorderHref,
} from '@/lib/routes';

export type BrandPackRulesSession = {
  collectionId: string;
  orderId: string;
  rulesHref: string;
  curveHref: string;
  shopPrepackHref: string;
  shopMatrixPrepackHref: string;
  shopMatrixHref: string;
  shopCheckoutHref: string;
  sizeChartHref: string;
};

export function brandPackRulesFeatureHref(
  featureId: 'rules' | 'curve' | 'shop-prepack',
  collectionId?: string,
  orderId?: string
): string {
  const session = buildBrandPackRulesSession({ collectionId, orderId });
  if (featureId === 'rules') return session.rulesHref;
  if (featureId === 'curve') return session.curveHref;
  return session.shopPrepackHref;
}

export function buildBrandPackRulesSession(input?: {
  collectionId?: string;
  orderId?: string;
}): BrandPackRulesSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const base = `${ROUTES.brand.packRules}?collection=${encodeURIComponent(collectionId)}`;
  const matrixBase = shopB2bMatrixReorderHref(collectionId, orderId);

  return {
    collectionId,
    orderId,
    rulesHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=rules`,
    curveHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=curve`,
    shopPrepackHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=shop-prepack`,
    shopMatrixPrepackHref: shopB2bMatrixPrepackHref(collectionId, orderId),
    shopMatrixHref: `${matrixBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=matrix`,
    shopCheckoutHref: shopB2bCheckoutCollectionHref(collectionId),
    sizeChartHref: `${ROUTES.brand.attributeHealth}?${PILLAR_CAPABILITY_FEATURE_PARAM}=size-chart&collection=${encodeURIComponent(collectionId)}`,
  };
}
