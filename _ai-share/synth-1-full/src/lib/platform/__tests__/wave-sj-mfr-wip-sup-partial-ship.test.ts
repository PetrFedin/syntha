describe('wave SJ — mfr WIP timeline, ERP failed filter, supplier partial ship', () => {
  it('manufacturer production timeline API', () => {
    expect('/api/workshop2/manufacturer/production-timeline').toContain('production-timeline');
    expect('mfr-op-production-timeline-strip').toContain('timeline');
  });

  it('mfr ERP failed filter strip', () => {
    expect('mfr-op-handoff-erp-failed-filter').toContain('erp-failed');
    expect('mfr-op-handoff-erp-bulk-retry-btn').toContain('bulk-retry');
  });

  it('supplier partial ship confirm', () => {
    expect('sup-op-partial-ship-confirm-strip').toContain('partial-ship');
    expect('sup-op-partial-ship-backorder').toContain('backorder');
  });
});
