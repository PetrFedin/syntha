import { platformB2bMarketroomFeatureHref } from '@/lib/b2b/platform-b2b-marketroom';
import { shopB2bPartnersFeatureHref } from '@/lib/b2b/shop-b2b-partners-workspace';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { brandAgentRepLedgerHref } from '@/lib/fashion/brand-agent-rep-oversight';
import {
  ROUTES,
  shopB2bMatrixOrderContextHref,
  shopB2bCheckoutCollectionHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';

export const SHOP_AGENT_REP_DEMO_ID = 'rep-anna';

export type ShopAgentRepSession = {
  repId: string;
  demoOrderId: string;
  demoCollectionId: string;
  demoArticleId: string;
  demoCampaignId: string;
  matrixHref: string;
  collaborativeHref: string;
  commissionTabHref: string;
  portalTabHref: string;
  brandLedgerHref: string;
  shopPartnersRosterHref: string;
  platformMarketroomHref: string;
  checkoutHref: string;
  trackingHref: string;
};

export function buildShopAgentRepSession(input?: {
  repId?: string;
  orderId?: string;
  collectionId?: string;
  articleId?: string;
}): ShopAgentRepSession {
  const repId = input?.repId?.trim() || SHOP_AGENT_REP_DEMO_ID;
  const demoOrderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const demoCollectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const demoArticleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const demoCampaignId = `${demoCollectionId}::${demoArticleId}`;

  return {
    repId,
    demoOrderId,
    demoCollectionId,
    demoArticleId,
    demoCampaignId,
    matrixHref: shopB2bMatrixOrderContextHref(demoOrderId),
    collaborativeHref: `${ROUTES.shop.b2bCollaborativeOrder}?${PILLAR_CAPABILITY_FEATURE_PARAM}=session&order=${encodeURIComponent(demoOrderId)}`,
    commissionTabHref: `${ROUTES.shop.b2bSalesRepPortal}?${PILLAR_CAPABILITY_FEATURE_PARAM}=commission`,
    portalTabHref: `${ROUTES.shop.b2bSalesRepPortal}?${PILLAR_CAPABILITY_FEATURE_PARAM}=portal`,
    brandLedgerHref: brandAgentRepLedgerHref(),
    shopPartnersRosterHref: shopB2bPartnersFeatureHref('roster', demoCollectionId),
    platformMarketroomHref: platformB2bMarketroomFeatureHref('showcase', demoCollectionId),
    checkoutHref: shopB2bCheckoutCollectionHref(demoCollectionId),
    trackingHref: shopB2bTrackingOrderHref(demoOrderId),
  };
}
