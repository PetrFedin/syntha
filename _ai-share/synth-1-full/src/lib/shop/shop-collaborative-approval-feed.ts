/** PG-backed collaborative order approval steps (shop collection_order). */

export type ShopCollaborativeApprovalStepId = 'matrix' | 'margin' | 'submit';

export type ShopCollaborativeApprovalState = {
  buyerId: string;
  orderId: string;
  matrixDone: boolean;
  marginDone: boolean;
  submitDone: boolean;
  brandActor?: string;
  updatedAt: string;
};

export type ShopCollaborativeApprovalActor = 'shop' | 'brand';

export const SHOP_COLLABORATIVE_APPROVAL_STEP_ORDER: readonly ShopCollaborativeApprovalStepId[] = [
  'matrix',
  'margin',
  'submit',
] as const;

/** Интервал poll fallback для collaborative session (мс). */
export const SHOP_COLLABORATIVE_SESSION_POLL_MS = 15_000;

export function shopCollaborativeApprovalStepDone(
  state: ShopCollaborativeApprovalState,
  stepId: ShopCollaborativeApprovalStepId
): boolean {
  if (stepId === 'matrix') return state.matrixDone;
  if (stepId === 'margin') return state.marginDone;
  return state.submitDone;
}

export function shopCollaborativeApprovalCanAdvance(
  state: ShopCollaborativeApprovalState,
  stepId: ShopCollaborativeApprovalStepId,
  actor: ShopCollaborativeApprovalActor = 'shop'
): boolean {
  if (shopCollaborativeApprovalStepDone(state, stepId)) return false;
  const idx = SHOP_COLLABORATIVE_APPROVAL_STEP_ORDER.indexOf(stepId);
  if (idx <= 0) {
    return actor === 'shop' && stepId === 'matrix';
  }
  const prev = SHOP_COLLABORATIVE_APPROVAL_STEP_ORDER[idx - 1];
  if (!shopCollaborativeApprovalStepDone(state, prev)) return false;
  if (stepId === 'margin') return actor === 'brand';
  if (stepId === 'submit') return actor === 'shop';
  return actor === 'shop';
}

export function shopCollaborativeApprovalWaitingBrandMargin(
  state: ShopCollaborativeApprovalState
): boolean {
  return state.matrixDone && !state.marginDone;
}

export function shopCollaborativeApprovalStepsFromState(state: ShopCollaborativeApprovalState): {
  id: ShopCollaborativeApprovalStepId;
  labelRu: string;
  done: boolean;
}[] {
  return [
    { id: 'matrix', labelRu: 'Матрица зафиксирована', done: state.matrixDone },
    { id: 'margin', labelRu: 'Маржа согласована брендом', done: state.marginDone },
    { id: 'submit', labelRu: 'Отправлено бренду', done: state.submitDone },
  ];
}

/** Честная подпись режима хранения согласований (RU, без EN placeholder). */
export function shopCollaborativeApprovalStorageModeLabelRu(
  mode: 'pg' | 'file' | 'memory' | string | null | undefined
): string | null {
  if (mode === 'pg') return 'Сессия · PostgreSQL';
  if (mode === 'file') return 'Сессия · файл';
  if (mode === 'memory') return 'Сессия · память';
  return null;
}

/** Подпись live-бейджа сессии (SSE push vs poll fallback). */
export function formatShopCollaborativeSessionLiveBadgeRu(input: {
  sseConnected: boolean;
  pushEnabled: boolean;
}): string {
  if (input.pushEnabled && input.sseConnected) return 'Сессия · push';
  return 'Сессия · опрос';
}

export function shopCollaborativeSessionLiveBadgeTestId(input: {
  sseConnected: boolean;
  pushEnabled: boolean;
}): 'shop-collaborative-session-sse-badge' | 'shop-collaborative-session-poll-badge' {
  return input.pushEnabled && input.sseConnected
    ? 'shop-collaborative-session-sse-badge'
    : 'shop-collaborative-session-poll-badge';
}

export function shopCollaborativeSessionStorageBadgeTestId(
  mode: string | null | undefined
): 'shop-collaborative-session-storage-pg' | null {
  return mode === 'pg' ? 'shop-collaborative-session-storage-pg' : null;
}

export function defaultShopCollaborativeApprovalState(input: {
  buyerId: string;
  orderId: string;
}): ShopCollaborativeApprovalState {
  return {
    buyerId: input.buyerId,
    orderId: input.orderId,
    matrixDone: false,
    marginDone: false,
    submitDone: false,
    updatedAt: new Date().toISOString(),
  };
}
