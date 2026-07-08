import {
  shopCollaborativeTabHref,
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
  shopReplenishmentTabHref,
  shopWorkingOrderTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { shopB2bCheckoutCollectionHref } from '@/lib/routes';
import {
  brandOrderCommsTabHref,
  brandLandedMarginTabHref,
} from '@/lib/b2b/brand-collection-order-hrefs';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_MARKETROOM_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  brandB2bOrdersCollectionRegistryHref,
  brandB2bOrdersProductionRegistryHref,
  brandCalendarB2bOrderContextHref,
  brandMessagesB2bOrderContextHref,
  brandProductionOperationsB2bOrderContextHref,
  factoryProductionHandoffQueueHref,
  ROUTES,
} from '@/lib/routes';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';

export type BrandOrderCommsSession = {
  orderId: string;
  collectionId: string;
  articleId: string;
  detailHref: string;
  chatHref: string;
  handoffHref: string;
  messagesHref: string;
  calendarHref: string;
  productionOpsHref: string;
  factoryQueueHref: string;
  shopTrackingHref: string;
  shopChatHref: string;
  shopLandedMarginHref: string;
  shopMatrixHref: string;
  shopCheckoutHref: string;
  shopCollaborativeHref: string;
  shopCollaborativeApprovalsHref: string;
  shopWorkingOrderHref: string;
  brandLandedMarginHref: string;
  productionRegistryHref: string;
  registryHref: string;
  w2SupplyHref: string;
  replenishmentAtpHref: string;
  inventoryOverviewHref: string;
  platformMarketroomHref: string;
  platformHubHref: string;
};

export function buildBrandOrderCommsSession(input?: {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  factoryId?: string;
}): BrandOrderCommsSession {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01';
  const factoryId = input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId;

  return {
    orderId,
    collectionId,
    articleId,
    detailHref: brandOrderCommsTabHref('detail', orderId, collectionId),
    chatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    handoffHref: brandOrderCommsTabHref('handoff', orderId, collectionId),
    messagesHref: brandMessagesB2bOrderContextHref(orderId),
    calendarHref: brandCalendarB2bOrderContextHref(orderId),
    productionOpsHref: `${brandProductionOperationsB2bOrderContextHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=handoff&collection=${encodeURIComponent(collectionId)}`,
    factoryQueueHref: factoryProductionHandoffQueueHref(orderId, { factoryId, collectionId }),
    shopTrackingHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    shopChatHref: shopOrderCommsTabHref('chat', orderId, collectionId),
    shopLandedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    shopMatrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    shopCheckoutHref: shopB2bCheckoutCollectionHref(collectionId),
    shopCollaborativeHref: shopCollaborativeTabHref('session', orderId, collectionId),
    shopCollaborativeApprovalsHref: shopCollaborativeTabHref('approvals', orderId, collectionId),
    shopWorkingOrderHref: shopWorkingOrderTabHref('versions', orderId, collectionId),
    brandLandedMarginHref: brandLandedMarginTabHref('simulator', collectionId, orderId),
    productionRegistryHref: brandB2bOrdersProductionRegistryHref(orderId),
    registryHref: brandB2bOrdersCollectionRegistryHref(orderId),
    w2SupplyHref: workshop2ArticleHref(collectionId, articleId, { w2pane: 'supply' }),
    replenishmentAtpHref: shopReplenishmentTabHref('stock-atp', collectionId, orderId),
    inventoryOverviewHref: `${ROUTES.shop.inventory}?${PILLAR_CAPABILITY_FEATURE_PARAM}=overview&collection=${encodeURIComponent(collectionId)}`,
    platformMarketroomHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase`,
    platformHubHref: `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`,
  };
}

export function brandOrderCommsFeatureHref(
  orderId: string,
  featureId: 'detail' | 'chat' | 'handoff',
  collectionId?: string
): string {
  return brandOrderCommsTabHref(featureId, orderId, collectionId);
}
