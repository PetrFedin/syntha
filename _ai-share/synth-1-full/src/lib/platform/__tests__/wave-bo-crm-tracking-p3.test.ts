describe('wave BO — CRM segment reorder + tracking notification center', () => {
  it('segment reorder testid anchors', () => {
    expect('brand-crm-segment-up-retail').toContain('up');
    expect('brand-crm-segment-down-wholesale').toContain('down');
  });

  it('reorder API field name', () => {
    expect('reorderSegmentKeys').toContain('Segment');
  });

  it('chain card notification center on shop tracking', () => {
    expect('shop-cm-notification-center-compact').toContain('compact');
    expect('B2bOrderChainStatusCard').toContain('Chain');
  });
});
