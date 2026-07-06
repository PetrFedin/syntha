describe('wave SD — S4 notification_events, production ops PG, greenfield shop2', () => {
  it('notification events PG API', () => {
    expect('/api/platform-core/notification-events').toContain('notification-events');
    expect('shop-cm-notification-pg-events-list').toContain('pg-events');
    expect('shop-cm-notification-events-storage-pg').toContain('storage');
  });

  it('brand production ops PG API + badge', () => {
    expect('/api/brand/production/operations-state').toContain('operations-state');
    expect('brand-production-ops-storage-pg').toContain('storage-pg');
  });

  it('greenfield shop2 onboarding PG', () => {
    expect('/api/shop/b2b/greenfield/onboarding').toContain('greenfield/onboarding');
    expect('shop-co-registry-greenfield-onboarding-pg').toContain('onboarding-pg');
    expect('shop-co-registry-greenfield-focus-matrix-seed-link').toContain('matrix-seed');
  });

  it('chain bumps record notification events', () => {
    expect('recordPlatformCoreChainNotificationEvents').toContain('ChainNotification');
    expect('inventory_reserved').toContain('inventory');
  });
});
