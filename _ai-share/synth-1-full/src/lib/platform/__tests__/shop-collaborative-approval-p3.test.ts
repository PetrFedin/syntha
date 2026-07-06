import {
  defaultShopCollaborativeApprovalState,
  shopCollaborativeApprovalCanAdvance,
  shopCollaborativeApprovalStepsFromState,
} from '@/lib/shop/shop-collaborative-approval-feed';
import {
  buildShopCollaborativeOrderSession,
  buildShopCollaborativeParticipants,
} from '@/lib/b2b/shop-collaborative-order';

describe('shop-collaborative-approval-feed', () => {
  it('steps advance sequentially matrix → margin → submit', () => {
    let state = defaultShopCollaborativeApprovalState({ buyerId: 'shop1', orderId: 'B2B-1' });
    expect(shopCollaborativeApprovalCanAdvance(state, 'matrix')).toBe(true);
    expect(shopCollaborativeApprovalCanAdvance(state, 'margin')).toBe(false);
    expect(shopCollaborativeApprovalCanAdvance(state, 'submit')).toBe(false);

    state = { ...state, matrixDone: true };
    expect(shopCollaborativeApprovalCanAdvance(state, 'margin')).toBe(true);
    expect(shopCollaborativeApprovalCanAdvance(state, 'submit')).toBe(false);

    state = { ...state, marginDone: true };
    expect(shopCollaborativeApprovalCanAdvance(state, 'submit')).toBe(true);
  });

  it('maps state to approval steps', () => {
    const state = {
      buyerId: 'shop1',
      orderId: 'B2B-1',
      matrixDone: true,
      marginDone: false,
      submitDone: false,
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    expect(shopCollaborativeApprovalStepsFromState(state)).toEqual([
      { id: 'matrix', labelRu: 'Матрица зафиксирована', done: true },
      { id: 'margin', labelRu: 'Маржа согласована брендом', done: false },
      { id: 'submit', labelRu: 'Отправлено бренду', done: false },
    ]);
  });
});

describe('shop-collaborative-order session', () => {
  it('derives participants from approval state (no random seed)', () => {
    const state = defaultShopCollaborativeApprovalState({ buyerId: 'shop1', orderId: 'B2B-9' });
    const a = buildShopCollaborativeOrderSession({
      orderId: 'B2B-9',
      collectionId: 'SS27',
      buyerId: 'shop1',
      approvalState: state,
    });
    const b = buildShopCollaborativeOrderSession({
      orderId: 'B2B-9',
      collectionId: 'SS27',
      buyerId: 'shop1',
      approvalState: state,
    });
    expect(a.approvals).toEqual(b.approvals);
    expect(a.participants).toEqual(b.participants);
    expect(a.participants[0]?.status).toBe('editing');
  });

  it('participants reflect completed steps', () => {
    const participants = buildShopCollaborativeParticipants('shop2', {
      buyerId: 'shop2',
      orderId: 'B2B-2',
      matrixDone: true,
      marginDone: true,
      submitDone: false,
      updatedAt: '',
    });
    expect(participants.map((p) => p.status)).toEqual(['approved', 'approved', 'editing']);
  });
});
