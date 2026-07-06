describe('wave SP — P1 collaborative SSE session + working order diff/merge', () => {
  it('collaborative session GET/POST + SSE stream', () => {
    expect('/api/shop/b2b/collaborative/session').toContain('collaborative/session');
    expect('/api/shop/b2b/collaborative/session/stream').toContain('session/stream');
    expect('fingerprintShopCollaborativeSession').toContain('CollaborativeSession');
  });

  it('shop session panel SSE + PG badge', () => {
    expect('shop-collaborative-session-poll-badge').toContain('session-poll');
    expect('shop-collaborative-session-storage-pg').toContain('storage-pg');
    expect('shopCollaborativeParticipantStatusRu').toContain('StatusRu');
  });

  it('brand co-approve shared PG session', () => {
    expect('/api/brand/b2b/collaborative/approve').toContain('collaborative/approve');
    expect('brand-co-collaborative-margin-approve-btn').toContain('approve');
  });

  it('working order version diff lines + merge matrix link', () => {
    expect('/api/shop/b2b/working-order/INT-demo/version-diff').toContain('version-diff');
    expect('shop-working-order-version-diff-lines').toContain('diff-lines');
    expect('shop-working-order-merge-matrix-link').toContain('merge-matrix');
  });
});
