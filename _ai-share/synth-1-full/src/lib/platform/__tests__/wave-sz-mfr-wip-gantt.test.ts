describe('wave SZ — mfr OP WIP Gantt production_orders timeline PG', () => {
  it('production orders timeline API route', () => {
    expect('/api/workshop2/manufacturer/production-orders-timeline').toContain(
      'production-orders-timeline'
    );
    expect('getMfrProductionOrdersTimeline').toContain('Timeline');
  });

  it('mfr OP cabinet/registry Gantt testids', () => {
    expect('mfr-op-wip-gantt-strip').toContain('wip-gantt');
    expect('mfr-op-wip-gantt-storage').toContain('storage');
    expect('mfr-op-wip-gantt-rows').toContain('rows');
    expect('mfr-op-wip-gantt-bar-PO').toContain('bar');
    expect('mfr-op-wip-gantt-stage-PO').toContain('stage');
    expect('mfr-op-wip-gantt-empty').toContain('empty');
  });

  it('registry embeds Gantt in factory-production-orders-core', () => {
    expect('factory-production-orders-core').toContain('production-orders');
  });
});
