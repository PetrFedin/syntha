describe('wave SK — universal inbox, mfr empty badges, supplier RFQ route', () => {
  it('universal inbox strip on messages workspaces', () => {
    expect('comms-universal-inbox-strip').toContain('universal-inbox');
    expect('shop-cm-universal-inbox-po-list').toContain('universal-inbox');
    expect('PlatformCoreCommsUniversalInboxStrip').toContain('UniversalInbox');
  });

  it('mfr empty pillar badges', () => {
    expect('mfr-empty-sc-publish-badge').toContain('publish');
    expect('mfr-empty-co-handoff-count-badge').toContain('handoff-count');
  });

  it('supplier RFQ inbox separate route', () => {
    expect('/factory/supplier/rfq-inbox').toContain('rfq-inbox');
    expect('supplier-rfq-inbox-core').toContain('rfq-inbox');
    expect('factorySupplierRfqInboxHref').toContain('RfqInbox');
  });
});
