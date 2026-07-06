describe('wave TE — rep commission ledger PG write + drafts sync', () => {
  it('commission ledger write API + RU strip', () => {
    expect('/api/shop/b2b/rep/commission-ledger').toContain('commission-ledger');
    expect('writeShopRepCommissionLedgerPayout').toContain('Payout');
    expect('shop-agent-rep-commission-ledger-ru-strip').toContain('ru-strip');
    expect('shop-agent-rep-commission-ledger-storage-pg').toContain('storage-pg');
    expect('shop-agent-rep-commission-ledger-payout-write-btn').toContain('payout-write');
  });

  it('fail-closed LS for rep drafts in core', () => {
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('shop_rep_offline_drafts_v1').toContain('offline_drafts');
    expect('offline_drafts_unavailable').toContain('unavailable');
  });

  it('offline drafts PG verify badge', () => {
    expect('/api/shop/b2b/rep/offline-drafts').toContain('offline-drafts');
    expect('shop-agent-rep-offline-drafts-storage-pg').toContain('storage-pg');
    expect('shopRepOfflineDraftsStorageMode').toContain('StorageMode');
  });

  it('payout_request legacy route still wired', () => {
    expect('/api/shop/b2b/commissions/payout-request').toContain('payout-request');
    expect('markWorkshop2B2bCommissionsPayoutPending').toContain('PayoutPending');
  });
});
