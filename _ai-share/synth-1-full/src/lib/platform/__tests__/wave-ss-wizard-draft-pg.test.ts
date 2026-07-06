describe('wave SS — create-article wizard draft PG + fail-closed LS', () => {
  it('PG API + migration', () => {
    expect('/api/brand/production/create-article-wizard-draft/').toContain('wizard-draft');
    expect('056_wave_ss_create_article_wizard_drafts').toContain('wizard_drafts');
    expect('brand_create_article_wizard_drafts').toContain('wizard');
  });

  it('client load/persist + store fail-closed', () => {
    expect('loadCreateArticleWizardDraftWithMode').toContain('DraftWithMode');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('brand-w2-create-article-draft-storage-pg').toContain('storage-pg');
  });
});

describe('wave SW — comms notification prefs PG', () => {
  it('fail-closed LS + PG API', () => {
    expect('/api/platform-core/comms/notification-prefs').toContain('notification-prefs');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('loadPlatformCoreCommsNotificationPrefs').toContain('NotificationPrefs');
  });
});

describe('wave ST/SU/SV — shop CO + dev bridge (already wired)', () => {
  it('matrix draft + size run validate', () => {
    expect('/api/shop/b2b/matrix/draft').toContain('matrix/draft');
    expect('/api/shop/b2b/matrix/size-run-validate').toContain('size-run-validate');
    expect('shop-co-matrix-draft-storage-pg').toContain('draft-storage');
  });

  it('CO cabinet tracking embed + calendar deep link', () => {
    expect('shop-co-cabinet-tracking-embed').toContain('tracking-embed');
    expect('shop-cm-calendar-tracking-deep-link').toContain('tracking-deep');
  });

  it('shop dev wishlist PG', () => {
    expect('/api/shop/b2b/development/assortment-wishlist').toContain('wishlist');
    expect('/api/shop/b2b/development/request-sample').toContain('request-sample');
  });
});
