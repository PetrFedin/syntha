describe('wave UD — P1 shop CO collaborative session SSE + PG journal', () => {
  it('session journal migration + repository', () => {
    expect('061_wave_ud_shop_collaborative_session_journal').toContain(
      'collaborative_session_journal'
    );
    expect('shop_collaborative_session_journal').toContain('journal');
    expect('appendBrandCollaborativeMarginJournal').toContain('MarginJournal');
    expect('listShopCollaborativeSessionJournal').toContain('SessionJournal');
  });

  it('session GET + SSE stream + live hook', () => {
    expect('/api/shop/b2b/collaborative/session').toContain('collaborative/session');
    expect('/api/shop/b2b/collaborative/session/stream').toContain('session/stream');
    expect('useShopCollaborativeSessionLive').toContain('SessionLive');
    expect('fingerprintShopCollaborativeSession').toContain('CollaborativeSession');
  });

  it('SSE badge when push pref enabled + poll fallback', () => {
    expect('usePlatformCoreChainStatusPushEnabled').toContain('PushEnabled');
    expect('shop-collaborative-session-sse-badge').toContain('session-sse');
    expect('shop-collaborative-session-poll-badge').toContain('session-poll');
  });

  it('honest storage badge RU + participant status RU', () => {
    expect('shopCollaborativeApprovalStorageModeLabelRu').toContain('StorageModeLabelRu');
    expect('shop-collaborative-session-storage-pg').toContain('storage-pg');
    expect('shopCollaborativeParticipantStatusRu').toContain('StatusRu');
  });

  it('brand co-approve cross-links shop ↔ brand order detail', () => {
    expect('/api/brand/b2b/collaborative/approve').toContain('collaborative/approve');
    expect('brand-co-collaborative-margin-approve-btn').toContain('approve');
    expect('shop-collaborative-brand-portal-link').toContain('brand-portal');
    expect('brand-co-collaborative-shop-link').toContain('shop-link');
    expect('brandCoApprovePortalHref').toContain('PortalHref');
  });
});
