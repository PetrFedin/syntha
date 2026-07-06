import {
  shopCollaborativeApprovalCanAdvance,
  shopCollaborativeApprovalWaitingBrandMargin,
  defaultShopCollaborativeApprovalState,
} from '@/lib/shop/shop-collaborative-approval-feed';

describe('shopCollaborativeApproval actor split', () => {
  it('shop can advance matrix and submit only', () => {
    const state = {
      ...defaultShopCollaborativeApprovalState({ buyerId: 'shop1', orderId: 'B2B-1' }),
      matrixDone: true,
      marginDone: true,
    };
    expect(shopCollaborativeApprovalCanAdvance(state, 'matrix', 'shop')).toBe(false);
    expect(shopCollaborativeApprovalCanAdvance(state, 'margin', 'shop')).toBe(false);
    expect(shopCollaborativeApprovalCanAdvance(state, 'submit', 'shop')).toBe(true);
  });

  it('brand can advance margin after matrix locked', () => {
    const state = {
      ...defaultShopCollaborativeApprovalState({ buyerId: 'shop1', orderId: 'B2B-1' }),
      matrixDone: true,
    };
    expect(shopCollaborativeApprovalCanAdvance(state, 'margin', 'brand')).toBe(true);
    expect(shopCollaborativeApprovalWaitingBrandMargin(state)).toBe(true);
  });
});

describe('wave SF — brand co-approve + wave SE contracts', () => {
  it('brand collaborative approve API + strip', () => {
    expect('/api/brand/b2b/collaborative/approve').toContain('collaborative/approve');
    expect('brand-co-collaborative-margin-approve-btn').toContain('approve');
    expect('brand-co-collaborative-storage-pg').toContain('storage-pg');
  });

  it('shop collaborative brand-only margin badge', () => {
    expect('shop-collaborative-approval-brand-only-margin').toContain('brand-only');
    expect('shop-collaborative-brand-margin-pending').toContain('pending');
  });

  it('wave SE matrix draft + greenfield APIs', () => {
    expect('/api/shop/b2b/matrix/draft').toContain('matrix/draft');
    expect('/api/shop/b2b/greenfield/onboarding').toContain('greenfield/onboarding');
  });
});
