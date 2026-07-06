describe('wave TE — shop agent rep commission PG ledger', () => {
  it('commissions API + payout', () => {
    expect('/api/shop/b2b/commissions').toContain('commissions');
    expect('/api/shop/b2b/commissions/payout-request').toContain('payout-request');
    expect('shop-agent-rep-commission-panel').toContain('commission-panel');
    expect('shop-agent-rep-commission-source-postgres').toContain('commission-source');
  });

  it('offline drafts PG sync queue', () => {
    expect('/api/shop/b2b/rep/offline-drafts').toContain('offline-drafts');
    expect('shop-agent-rep-offline-drafts-honesty-strip').toContain('honesty');
  });
});

describe('wave TF — linesheet syndication', () => {
  it('syndicate + rollback + shop auto-ingest APIs', () => {
    expect('/api/brand/linesheets/syndicate').toContain('syndicate');
    expect('/api/brand/linesheets/batch-unpublish-rollback').toContain('unpublish-rollback');
    expect('/api/shop/b2b/showroom/auto-ingest').toContain('auto-ingest');
  });
});

describe('wave TG — handoff ERP hardening', () => {
  it('retry + bulk idempotency UI', () => {
    expect('brand-b2b-handoff-retry').toContain('handoff-retry');
    expect('/api/workshop2/factory/production-handoff-queue/retry-erp').toContain('retry-erp');
    expect('factory-handoff-bulk-erp-retry').toContain('bulk-erp-retry');
  });
});

describe('wave TL — shop SC showroom eligible-for-matrix', () => {
  it('filter API + partner logo + qty carry', () => {
    expect('/api/shop/b2b/showroom/eligible-for-matrix').toContain('eligible-for-matrix');
    expect('shop-sc-showroom-eligible-filter-toggle').toContain('eligible-filter');
    expect('shop-sc-showroom-partner-logo-source-pg').toContain('source-pg');
    expect('carryQty').toBeTruthy();
  });
});
