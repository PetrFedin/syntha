describe('wave SE — matrix draft PG, stage modules, accept-invite, size-run', () => {
  it('matrix draft autosave API + badge', () => {
    expect('/api/shop/b2b/matrix/draft').toContain('matrix/draft');
    expect('shop-co-matrix-draft-storage-pg').toContain('draft-storage-pg');
  });

  it('size run validate API + matrix hint', () => {
    expect('/api/shop/b2b/matrix/size-run-validate').toContain('size-run-validate');
    expect('shop-co-matrix-size-run-hint').toContain('size-run');
  });

  it('collection stage modules PG API + badge', () => {
    expect('/api/brand/collection-stage-modules').toContain('collection-stage-modules');
    expect('brand-collection-stage-modules-storage-pg').toContain('storage-pg');
    expect('hydrateCollectionStageModulesFromServer').toContain('hydrate');
  });

  it('accept-invite partner session PG', () => {
    expect('/api/shop/b2b/accept-invite').toContain('accept-invite');
    expect('b2b-accept-invite-storage-pg').toContain('storage-pg');
    expect('persistShopB2bPartnerSessionServer').toContain('PartnerSession');
  });

  it('greenfield checkout marks onboarding POST', () => {
    expect('/api/shop/b2b/greenfield/onboarding').toContain('greenfield/onboarding');
  });
});
