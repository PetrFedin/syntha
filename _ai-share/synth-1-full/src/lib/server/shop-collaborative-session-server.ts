import 'server-only';

import {
  buildShopCollaborativeOrderSession,
  summarizeShopCollaborativeOrder,
} from '@/lib/b2b/shop-collaborative-order';
import {
  defaultShopCollaborativeApprovalState,
  shopCollaborativeApprovalStepsFromState,
  shopCollaborativeApprovalStorageModeLabelRu,
  shopCollaborativeApprovalWaitingBrandMargin,
  SHOP_COLLABORATIVE_SESSION_POLL_MS,
  type ShopCollaborativeApprovalState,
} from '@/lib/shop/shop-collaborative-approval-feed';
import {
  getShopCollaborativeApprovalServer,
  shopCollaborativeApprovalStorageMode,
} from '@/lib/server/shop-collaborative-approval-repository';
import {
  listShopCollaborativeSessionJournal,
  type ShopCollaborativeSessionJournalRow,
} from '@/lib/server/shop-collaborative-session-journal-repository';

export const SHOP_COLLABORATIVE_SESSION_SSE_POLL_MS = 5_000;

/** Fingerprint PG-сессии для poll/SSE dedup. */
export function fingerprintShopCollaborativeSession(state: ShopCollaborativeApprovalState): string {
  return [
    state.updatedAt,
    state.matrixDone ? '1' : '0',
    state.marginDone ? '1' : '0',
    state.submitDone ? '1' : '0',
    state.brandActor ?? '',
  ].join('|');
}

export function formatShopCollaborativeSessionSseData(payload: Record<string, unknown>): string {
  return `event: session_update\ndata: ${JSON.stringify(payload)}\n\n`;
}

export async function loadShopCollaborativeSessionSnapshot(input: {
  buyerId: string;
  orderId: string;
  collectionId: string;
}): Promise<{
  ok: true;
  buyerId: string;
  orderId: string;
  collectionId: string;
  storageMode: ReturnType<typeof shopCollaborativeApprovalStorageMode>;
  storageModeLabelRu: string | null;
  pollIntervalMs: number;
  sessionRevision: string;
  brandCoApprovePortalHref: string;
  journal: ShopCollaborativeSessionJournalRow[];
  session: {
    participants: ReturnType<typeof buildShopCollaborativeOrderSession>['participants'];
    approvals: ReturnType<typeof shopCollaborativeApprovalStepsFromState>;
    summary: ReturnType<typeof summarizeShopCollaborativeOrder>;
    waitingBrandMargin: boolean;
    matrixHref: string;
    trackingHref: string;
    workingOrderHref: string;
  };
  messageRu: string;
}> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const orderId = input.orderId.trim();
  const collectionId = input.collectionId.trim() || 'SS27';

  const approvalState =
    (await getShopCollaborativeApprovalServer({ buyerId, orderId })) ??
    defaultShopCollaborativeApprovalState({ buyerId, orderId });

  const session = buildShopCollaborativeOrderSession({
    orderId,
    collectionId,
    buyerId,
    approvalState,
  });
  const summary = summarizeShopCollaborativeOrder(session);
  const sessionRevision = fingerprintShopCollaborativeSession(approvalState);
  const storageMode = shopCollaborativeApprovalStorageMode();
  const journal = await listShopCollaborativeSessionJournal({ buyerId, orderId, limit: 6 });

  return {
    ok: true,
    buyerId,
    orderId,
    collectionId,
    storageMode,
    storageModeLabelRu: shopCollaborativeApprovalStorageModeLabelRu(storageMode),
    pollIntervalMs: SHOP_COLLABORATIVE_SESSION_POLL_MS,
    sessionRevision,
    brandCoApprovePortalHref: session.brandCoApprovePortalHref,
    journal,
    session: {
      participants: session.participants,
      approvals: shopCollaborativeApprovalStepsFromState(approvalState),
      summary,
      waitingBrandMargin: shopCollaborativeApprovalWaitingBrandMargin(approvalState),
      matrixHref: session.matrixHref,
      trackingHref: session.trackingHref,
      workingOrderHref: session.workingOrderHref,
    },
    messageRu: `Сессия · ${summary.editing}`,
  };
}
