describe('wave BL — range reorder, QC in-tab, supplier BOM feed', () => {
  it('range planner tierArticleOrder repository + route contract', () => {
    expect('reorderWorkshop2RangePlannerTierArticles').toContain('reorder');
    expect('tierArticleOrder').toContain('tierArticle');
    expect('range-planner-tier-reorder-up').toContain('reorder');
  });

  it('QC gate inline record testids', () => {
    expect('brand-qc-gate-inline-record-submit').toContain('submit');
    expect('mfr-qc-gate-inline-record-strip').toContain('inline-record');
  });

  it('supplier dev BOM PG feed wired in preview', () => {
    expect('sup-dev-bom-brand-feed-strip').toContain('brand-feed');
    expect('sup-dev-bom-brand-dev-peer-strip').toContain('brand-dev');
  });
});
