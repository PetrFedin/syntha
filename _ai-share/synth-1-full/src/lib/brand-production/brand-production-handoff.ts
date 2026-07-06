import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  brandLandedMarginTabHref,
  brandOrderCommsTabHref,
} from '@/lib/b2b/brand-collection-order-hrefs';
import {
  shopCollaborativeTabHref,
  shopLandedMarginTabHref,
  shopOrderCommsTabHref,
  shopReplenishmentTabHref,
  shopWorkingOrderTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { manufacturerOrderCommsFeatureHref } from '@/lib/b2b/manufacturer-order-comms';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  ROUTES,
  brandProductionOperationsB2bOrderContextHref,
  factoryProductionHandoffQueueHref,
  factoryProductionOrdersOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';

export type BrandProductionHandoffSession = {
  orderId: string;
  collectionId: string;
  handoffTabHref: string;
  cutTicketTabHref: string;
  qcGateTabHref: string;
  factoryQueueHref: string;
  factoryOrdersHref: string;
  shopTrackingHref: string;
  shopWorkingOrderHref: string;
  productionFloorHref: string;
  shopOrderCommsHref: string;
  brandOrderCommsChatHref: string;
  brandOrderCommsHandoffHref: string;
  brandLandedMarginHref: string;
  shopCollaborativeApprovalsHref: string;
  shopReplenishmentAtpHref: string;
  shopLandedMarginHref: string;
  manufacturerOrderCommsHref: string;
};

export function buildBrandProductionHandoffSession(input?: {
  orderId?: string;
  collectionId?: string;
  factoryId?: string;
}): BrandProductionHandoffSession {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const factoryId = input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId;
  const opsBase = brandProductionOperationsB2bOrderContextHref(orderId);

  return {
    orderId,
    collectionId,
    handoffTabHref: `${opsBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=handoff`,
    cutTicketTabHref: `${opsBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=cut-ticket`,
    qcGateTabHref: `${opsBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=qc-gate`,
    factoryQueueHref: factoryProductionHandoffQueueHref(orderId, { factoryId, collectionId }),
    factoryOrdersHref: factoryProductionOrdersOrderContextHref(orderId, { factoryId }),
    shopTrackingHref: `${shopB2bTrackingOrderHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=tracking`,
    shopWorkingOrderHref: shopWorkingOrderTabHref('handoff', orderId, collectionId),
    productionFloorHref: ROUTES.brand.production,
    shopOrderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    brandOrderCommsChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    brandOrderCommsHandoffHref: brandOrderCommsTabHref('handoff', orderId, collectionId),
    brandLandedMarginHref: brandLandedMarginTabHref('simulator', collectionId, orderId),
    shopCollaborativeApprovalsHref: shopCollaborativeTabHref('approvals', orderId, collectionId),
    shopReplenishmentAtpHref: shopReplenishmentTabHref('stock-atp', collectionId, orderId),
    shopLandedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    manufacturerOrderCommsHref: manufacturerOrderCommsFeatureHref(orderId, collectionId, factoryId),
  };
}

export function brandProductionOpsFeatureHref(
  orderId: string,
  featureId: 'operations' | 'handoff' | 'cut-ticket' | 'qc-gate'
): string {
  return `${brandProductionOperationsB2bOrderContextHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=${featureId}`;
}
