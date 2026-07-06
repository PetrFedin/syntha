describe('wave VB — rep commission payout PG ledger + workspace honesty', () => {
  it('commissions payout POST route + ledger write helper', () => {
    expect('/api/shop/b2b/commissions/payout').toContain('commissions/payout');
    expect('writeShopRepCommissionLedgerPayout').toContain('Payout');
    expect('shop-agent-rep-workspace-honesty-strip-ru').toContain('honesty-strip');
    expect('shop-agent-rep-section-ru-strip').toContain('section-ru-strip');
    expect('shop-agent-rep-workspace-ledger-storage-pg').toContain('ledger-storage');
  });

  it('commission ledger RU strip still wired (Wave TE)', () => {
    expect('/api/shop/b2b/rep/commission-ledger').toContain('commission-ledger');
    expect('shop-agent-rep-commission-ledger-ru-strip').toContain('ru-strip');
    expect('shop-agent-rep-commission-ledger-payout-write-btn').toContain('payout-write');
  });

  it('offline drafts PG sync queue polish (Wave TE verify)', () => {
    expect('/api/shop/b2b/rep/offline-drafts').toContain('offline-drafts');
    expect('shop-agent-rep-offline-drafts-sync-queue-badge').toContain('sync-queue');
    expect('shop-agent-rep-offline-drafts-honesty-strip').toContain('honesty');
    expect('shopRepOfflineDraftsStorageMode').toContain('StorageMode');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });

  it('legacy payout-request route still available', () => {
    expect('/api/shop/b2b/commissions/payout-request').toContain('payout-request');
    expect('markWorkshop2B2bCommissionsPayoutPending').toContain('PayoutPending');
  });
});
