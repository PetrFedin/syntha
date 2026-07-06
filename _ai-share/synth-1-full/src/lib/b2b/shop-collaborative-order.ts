import { brandOrderCommsFeatureHref } from '@/lib/b2b/brand-order-comms';
import {
  defaultShopCollaborativeApprovalState,
  shopCollaborativeApprovalStepsFromState,
  type ShopCollaborativeApprovalState,
} from '@/lib/shop/shop-collaborative-approval-feed';
import { shopCoreBuyerLabelRu } from '@/lib/order/shop-core-buyer-context';
import {
  brandLandedMarginTabHref,
  brandOrderCommsTabHref,
} from '@/lib/b2b/brand-collection-order-hrefs';
import {
  shopCollaborativeTabHref,
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopReplenishmentTabHref,
  shopShowroomTabHref,
  shopWorkingOrderTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { shopLandedMarginFeatureHref } from '@/lib/b2b/shop-landed-margin';
import { shopOrderCommsFeatureHref } from '@/lib/b2b/shop-order-comms';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_MARKETROOM_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
  shopB2bCheckoutCollectionHref,
  ROUTES,
} from '@/lib/routes';

export type ShopCollaborativeParticipantStatus = 'editing' | 'approved' | 'pending';

export function shopCollaborativeParticipantStatusRu(
  status: ShopCollaborativeParticipantStatus
): string {
  switch (status) {
    case 'editing':
      return 'редактирует';
    case 'approved':
      return 'согласовано';
    case 'pending':
      return 'ожидание';
    default:
      return status;
  }
}

export type ShopCollaborativeParticipant = {
  id: string;
  name: string;
  status: ShopCollaborativeParticipantStatus;
};

export type ShopCollaborativeApprovalStep = {
  id: string;
  labelRu: string;
  done: boolean;
};

export type ShopCollaborativeOrderSession = {
  orderId: string;
  collectionId: string;
  participants: ShopCollaborativeParticipant[];
  approvals: ShopCollaborativeApprovalStep[];
  sessionHref: string;
  approvalsHref: string;
  commsHref: string;
  matrixHref: string;
  prepackHref: string;
  showroomHref: string;
  messagesHref: string;
  calendarHref: string;
  trackingHref: string;
  workingOrderHref: string;
  workingOrderBulkHref: string;
  replenishmentHref: string;
  replenishmentRulesHref: string;
  landedMarginHref: string;
  brandOrderChatHref: string;
  brandOrderHandoffHref: string;
  /** Read-only ссылка на co-approve strip бренда (та же PG-сессия). */
  brandCoApprovePortalHref: string;
  brandLandedMarginHref: string;
  shopMarginPricelistHref: string;
  inventoryOverviewHref: string;
  platformMarketroomHref: string;
  platformHubHref: string;
  checkoutHref: string;
};

export function shopCollaborativeOrderFeatureHref(
  orderId: string,
  featureId: 'session' | 'approvals' | 'comms',
  collectionId?: string
): string {
  return shopCollaborativeTabHref(featureId, orderId, collectionId);
}

export function buildShopCollaborativeParticipants(
  buyerId: string,
  approvalState?: ShopCollaborativeApprovalState | null
): ShopCollaborativeParticipant[] {
  const state =
    approvalState ?? defaultShopCollaborativeApprovalState({ buyerId, orderId: 'pending' });
  const leadStatus: ShopCollaborativeParticipantStatus = state.matrixDone
    ? 'approved'
    : 'editing';
  const categoryStatus: ShopCollaborativeParticipantStatus = !state.matrixDone
    ? 'pending'
    : state.marginDone
      ? 'approved'
      : 'editing';
  const financeStatus: ShopCollaborativeParticipantStatus = !state.marginDone
    ? 'pending'
    : state.submitDone
      ? 'approved'
      : 'editing';

  return [
    { id: 'buyer-1', name: `${shopCoreBuyerLabelRu(buyerId)} · закупки`, status: leadStatus },
    { id: 'buyer-2', name: 'Категорийный менеджер', status: categoryStatus },
    { id: 'buyer-3', name: 'Финансы', status: financeStatus },
  ];
}

export function buildShopCollaborativeOrderSession(input?: {
  orderId?: string;
  collectionId?: string;
  buyerId?: string;
  approvalState?: ShopCollaborativeApprovalState | null;
}): ShopCollaborativeOrderSession {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const buyerId = input?.buyerId?.trim() || 'shop1';
  const approvalState =
    input?.approvalState ??
    defaultShopCollaborativeApprovalState({ buyerId, orderId });

  return {
    orderId,
    collectionId,
    participants: buildShopCollaborativeParticipants(buyerId, approvalState),
    approvals: shopCollaborativeApprovalStepsFromState(approvalState),
    sessionHref: shopCollaborativeTabHref('session', orderId, collectionId),
    approvalsHref: shopCollaborativeTabHref('approvals', orderId, collectionId),
    commsHref: shopCollaborativeTabHref('comms', orderId, collectionId),
    matrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    prepackHref: shopMatrixWorkspaceTabHref('prepack', collectionId, orderId),
    showroomHref: shopShowroomTabHref('showroom', collectionId, orderId),
    messagesHref: shopMessagesB2bOrderContextHref(orderId),
    calendarHref: shopCalendarB2bOrderContextHref(orderId),
    trackingHref: shopOrderCommsFeatureHref(orderId, 'tracking', collectionId),
    workingOrderHref: shopWorkingOrderTabHref('versions', orderId, collectionId),
    workingOrderBulkHref: shopWorkingOrderTabHref('bulk', orderId, collectionId),
    replenishmentHref: shopReplenishmentTabHref('stock-atp', collectionId, orderId),
    replenishmentRulesHref: shopReplenishmentTabHref('rules', collectionId, orderId),
    landedMarginHref: shopLandedMarginFeatureHref('rollup', collectionId, orderId),
    brandOrderChatHref: brandOrderCommsFeatureHref(orderId, 'chat', collectionId),
    brandOrderHandoffHref: brandOrderCommsTabHref('handoff', orderId, collectionId),
    brandCoApprovePortalHref: brandOrderCommsTabHref('detail', orderId, collectionId),
    brandLandedMarginHref: brandLandedMarginTabHref('simulator', collectionId, orderId),
    shopMarginPricelistHref: shopLandedMarginTabHref('pricelist', collectionId, orderId),
    inventoryOverviewHref: `${ROUTES.shop.inventory}?${PILLAR_CAPABILITY_FEATURE_PARAM}=overview&collection=${encodeURIComponent(collectionId)}`,
    platformMarketroomHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase`,
    platformHubHref: `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`,
    checkoutHref: shopB2bCheckoutCollectionHref(collectionId),
  };
}

export function summarizeShopCollaborativeOrder(session: ShopCollaborativeOrderSession): {
  participants: number;
  editing: number;
  approvalsDone: number;
  approvalsTotal: number;
} {
  return {
    participants: session.participants.length,
    editing: session.participants.filter((p) => p.status === 'editing').length,
    approvalsDone: session.approvals.filter((a) => a.done).length,
    approvalsTotal: session.approvals.length,
  };
}
