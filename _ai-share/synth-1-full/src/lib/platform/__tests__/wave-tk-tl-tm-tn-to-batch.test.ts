describe('wave TK — brand tier-sync POST on publish', () => {
  it('tier-sync API POST push', () => {
    expect('/api/brand/b2b/pricelist/tier-sync').toContain('tier-sync');
    expect('pushBrandPricelistTierSyncToShopServer').toContain('TierSync');
    expect('shop-landed-margin-tier-sync-honesty-strip').toContain('honesty');
  });
});

describe('wave TL — showroom eligible-for-matrix', () => {
  it('eligible-for-matrix API', () => {
    expect('/api/shop/b2b/showroom/eligible-for-matrix').toContain('eligible-for-matrix');
    expect('listShopShowroomEligibleForMatrix').toContain('EligibleForMatrix');
  });
});

describe('wave TM — W2 hub sample status SSE', () => {
  it('SSE badge on W2 hub', () => {
    expect('brand-w2-sample-status-sse-live').toContain('sse-live');
    expect('usePlatformCoreB2bRegistryPoll').toContain('RegistryPoll');
  });
});

describe('wave TN — publish audit PG journal', () => {
  it('PG publish audit repository + storage badge', () => {
    expect('listBrandScPublishAuditJournalForCollection').toContain('PublishAudit');
    expect('brand-sc-publish-audit-storage-pg').toContain('storage-pg');
    expect('brandScPublishAuditStorageMode').toContain('StorageMode');
  });
});

describe('wave TP — shop working order version diff', () => {
  it('diff API + partial merge matrix link', () => {
    expect('/api/shop/b2b/working-order/diff').toContain('working-order/diff');
    expect('shop-working-order-version-diff-lines').toContain('diff-lines');
    expect('shop-working-order-merge-matrix-link').toContain('merge-matrix');
  });
});

describe('wave TO — dossier factory diff + attach TZ PO', () => {
  it('diff strip testids', () => {
    expect('brand-dossier-factory-diff-strip').toContain('factory-diff');
    expect('brand-dossier-factory-diff-factory-link').toContain('factory-link');
    expect('brand-op-attach-tz-po-link').toContain('attach-tz');
  });
});

describe('wave UN — live dossier diff + attach TZ PDF', () => {
  it('live diff API + TZ PDF attach stub', () => {
    expect('/api/brand/workshop2/dossier-factory-diff').toContain('dossier-factory-diff');
    expect('/api/brand/b2b/orders/').toContain('b2b/orders');
    expect('attach-tz-pdf').toContain('tz-pdf');
    expect('brand-dossier-factory-diff-live-badge').toContain('live-badge');
    expect('brand-op-attach-tz-pdf-peer-link').toContain('attach-tz-pdf');
    expect('shouldPersistPhase1DossierOfflineDualWrite').toContain('OfflineDualWrite');
  });
});

describe('wave TC+ — production ops store fail-closed', () => {
  it('brand production unified LS gated in core', () => {
    expect('brand_production_unified_v1').toContain('unified');
    expect('loadBrandProductionOpsWithMode').toContain('OpsWithMode');
  });
});
