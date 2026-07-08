import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { brandOrderCommsTabHref } from '@/lib/b2b/brand-collection-order-hrefs';
import { manufacturerOrderCommsFeatureHref } from '@/lib/b2b/manufacturer-order-comms';
import {
  shopLandedMarginTabHref,
  shopOrderCommsTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import {
  ROUTES,
  brandProductionOperationsB2bOrderContextHref,
  factoryProductionDossierContextHref,
  factoryProductionHandoffQueueHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';

export type ManufacturerProductionOpsSession = {
  factoryId: string;
  orderId: string;
  collectionId: string;
  articleId: string;
  ordersHref: string;
  wipHref: string;
  cutTicketHref: string;
  brandCutTicketHref: string;
  handoffQueueHref: string;
  shopFloorHref: string;
  dossierHref: string;
  shopTrackingHref: string;
  shopOrderCommsHref: string;
  materialsHref: string;
  brandOrderHandoffHref: string;
  manufacturerOrderCommsHref: string;
  shopLandedMarginHref: string;
};

export function buildManufacturerProductionOpsSession(input?: {
  factoryId?: string;
  orderId?: string;
  collectionId?: string;
  articleId?: string;
}): ManufacturerProductionOpsSession {
  const factoryId = input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01';
  const base = `${EXTENDED_ROUTES.factory.productionOrders}?factoryId=${encodeURIComponent(factoryId)}&collection=${encodeURIComponent(collectionId)}&order=${encodeURIComponent(orderId)}`;

  return {
    factoryId,
    orderId,
    collectionId,
    articleId,
    ordersHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=orders`,
    wipHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=wip`,
    cutTicketHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=cut-ticket`,
    brandCutTicketHref: `${brandProductionOperationsB2bOrderContextHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=cut-ticket`,
    handoffQueueHref: factoryProductionHandoffQueueHref(orderId, { factoryId, collectionId }),
    shopFloorHref: `/factory/production/shop-floor?collection=${encodeURIComponent(collectionId)}`,
    dossierHref: factoryProductionDossierContextHref(articleId, { collectionId, orderId }),
    shopTrackingHref: `${shopB2bTrackingOrderHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=tracking`,
    shopOrderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    materialsHref: `${EXTENDED_ROUTES.factory.productionMaterials}?factoryId=${encodeURIComponent(factoryId)}&order=${encodeURIComponent(orderId)}&collection=${encodeURIComponent(collectionId)}`,
    brandOrderHandoffHref: brandOrderCommsTabHref('handoff', orderId, collectionId),
    manufacturerOrderCommsHref: manufacturerOrderCommsFeatureHref(orderId, collectionId, factoryId),
    shopLandedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
  };
}

export function manufacturerProductionOpsFeatureHref(
  featureId: 'orders' | 'wip' | 'cut-ticket',
  opts?: { factoryId?: string; collectionId?: string; orderId?: string }
): string {
  const session = buildManufacturerProductionOpsSession(opts);
  if (featureId === 'orders') return session.ordersHref;
  if (featureId === 'wip') return session.wipHref;
  return session.cutTicketHref;
}
