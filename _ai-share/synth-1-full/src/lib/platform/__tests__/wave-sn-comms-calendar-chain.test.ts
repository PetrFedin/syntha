describe('wave SN — P2 comms calendar↔tracking + chain calendar task', () => {
  it('shop calendar event tracking strip', () => {
    expect('shop-cm-calendar-event-tracking-strip').toContain('tracking');
    expect('shop-cm-calendar-tracking-deep-link-').toContain('deep-link');
  });

  it('calendar user tasks tracking link for shop', () => {
    expect('shop-cm-calendar-tracking-deep-link-').toContain('deep-link');
  });

  it('chain-status creates PG calendar task', () => {
    expect('chain-materials_supplied-').toContain('chain-');
    expect('recordPlatformCoreChainNotificationEvents').toContain('ChainNotification');
  });

  it('collection stage modules no LS mirror in core', () => {
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
  });
});
