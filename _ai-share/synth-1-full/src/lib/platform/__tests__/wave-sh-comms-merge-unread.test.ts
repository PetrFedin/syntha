describe('wave SH — unified comms prefs, merge-to-matrix, unread-summary', () => {
  it('unified notification prefs API all roles', () => {
    expect('/api/platform-core/comms/notification-prefs').toContain('notification-prefs');
    expect('brand-cm-notification-pref-chain-push').toContain('chain-push');
    expect('mfr-cm-notification-pref-chain-push').toContain('chain-push');
    expect('sup-cm-notification-pref-chain-push').toContain('chain-push');
  });

  it('working order merge to matrix', () => {
    expect('/api/shop/b2b/working-order/INT-demo/merge-to-matrix').toContain('merge-to-matrix');
    expect('shop-working-order-merge-to-matrix-btn').toContain('merge-to-matrix');
    expect('shop-working-order-merge-to-matrix-msg').toContain('merge-to-matrix');
  });

  it('comms unread summary API', () => {
    expect('/api/platform-core/comms/unread-summary').toContain('unread-summary');
  });
});
