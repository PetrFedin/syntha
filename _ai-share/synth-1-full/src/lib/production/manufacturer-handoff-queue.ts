import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { brandOrderCommsTabHref } from '@/lib/b2b/brand-collection-order-hrefs';
import {
  shopLandedMarginTabHref,
  shopOrderCommsTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  ROUTES,
  brandProductionOperationsB2bOrderContextHref,
  factoryProductionHandoffQueueHref,
  factoryProductionOrdersOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';

export type ManufacturerHandoffQueueSession = {
  factoryId: string;
  orderId: string;
  collectionId: string;
  sampleQueueHref: string;
  handoffHref: string;
  ordersBridgeHref: string;
  factoryOrdersHref: string;
  brandHandoffHref: string;
  brandOrderChatHref: string;
  brandQcGateHref: string;
  shopTrackingHref: string;
  shopOrderCommsHref: string;
  shopLandedMarginHref: string;
  manufacturerOrderCommsHref: string;
  productionOpsCutTicketHref: string;
  materialsHref: string;
  techpackAckHref: string;
};

export function buildManufacturerHandoffQueueSession(input?: {
  factoryId?: string;
  orderId?: string;
  collectionId?: string;
}): ManufacturerHandoffQueueSession {
  const factoryId = input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const base = `${EXTENDED_ROUTES.factory.production}?factoryId=${encodeURIComponent(factoryId)}&collection=${encodeURIComponent(collectionId)}`;

  return {
    factoryId,
    orderId,
    collectionId,
    sampleQueueHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=sample-queue`,
    handoffHref: factoryProductionHandoffQueueHref(orderId, { factoryId, collectionId }),
    ordersBridgeHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=orders-bridge`,
    factoryOrdersHref: factoryProductionOrdersOrderContextHref(orderId, { factoryId }),
    brandHandoffHref: `${brandProductionOperationsB2bOrderContextHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=handoff`,
    brandOrderChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    brandQcGateHref: `${brandProductionOperationsB2bOrderContextHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=qc-gate`,
    shopTrackingHref: `${shopB2bTrackingOrderHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=tracking`,
    shopOrderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    shopLandedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    manufacturerOrderCommsHref: `${EXTENDED_ROUTES.factory.messages}?order=${encodeURIComponent(orderId)}&collection=${encodeURIComponent(collectionId)}&factoryId=${encodeURIComponent(factoryId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=order`,
    productionOpsCutTicketHref: `${EXTENDED_ROUTES.factory.productionOrders}?factoryId=${encodeURIComponent(factoryId)}&collection=${encodeURIComponent(collectionId)}&order=${encodeURIComponent(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=cut-ticket`,
    materialsHref: `${EXTENDED_ROUTES.factory.productionMaterials}?factoryId=${encodeURIComponent(factoryId)}&order=${encodeURIComponent(orderId)}`,
    techpackAckHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=techpack-ack&article=${encodeURIComponent(PLATFORM_CORE_DEMO.demoArticleId)}`,
  };
}

export function manufacturerHandoffFeatureHref(
  featureId: 'sample-queue' | 'handoff' | 'orders-bridge' | 'qc-gate' | 'techpack-ack',
  opts?: { factoryId?: string; collectionId?: string; orderId?: string; articleId?: string }
): string {
  const session = buildManufacturerHandoffQueueSession(opts);
  if (featureId === 'handoff') return session.handoffHref;
  if (featureId === 'techpack-ack') {
    const sp = new URLSearchParams({
      factoryId: session.factoryId,
      collection: session.collectionId,
      [PILLAR_CAPABILITY_FEATURE_PARAM]: 'techpack-ack',
      article: opts?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId,
    });
    if (opts?.orderId?.trim()) sp.set('order', opts.orderId.trim());
    return `${EXTENDED_ROUTES.factory.production}?${sp.toString()}`;
  }
  const sp = new URLSearchParams({
    factoryId: session.factoryId,
    collection: session.collectionId,
  });
  if (opts?.orderId?.trim()) sp.set('order', opts.orderId.trim());
  sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, featureId);
  const url = `${EXTENDED_ROUTES.factory.production}?${sp.toString()}`;
  return url;
}
