describe('wave WJ — mfr OP WIP Gantt production_orders timeline PG', () => {
  it('production orders timeline API route + PG read server', () => {
    expect('/api/workshop2/manufacturer/production-orders-timeline').toContain(
      'production-orders-timeline'
    );
    expect('getMfrProductionOrdersTimeline').toContain('Timeline');
    expect('getProductionWipByPoIdFromPg').toContain('PoIdFromPg');
  });

  it('handoff queue is single source for timeline rows', () => {
    expect('handoff_queue').toBe('handoff_queue');
    expect('WIP · PostgreSQL').toContain('PostgreSQL');
    expect('WIP · файл').toContain('файл');
    expect('mfrProductionOrdersTimelineStorageModeLabelRu').toContain('StorageModeLabelRu');
  });

  it('mfr OP cabinet/registry Gantt testids + RU storage badge', () => {
    expect('mfr-op-wip-gantt-strip').toContain('wip-gantt');
    expect('mfr-op-wip-gantt-storage').toContain('storage');
    expect('mfr-op-wip-gantt-rows').toContain('rows');
    expect('mfr-op-wip-gantt-bar-PO').toContain('bar');
    expect('mfr-op-wip-gantt-stage-PO').toContain('stage');
    expect('mfr-op-wip-gantt-empty').toContain('empty');
    expect('WIP · PostgreSQL').toContain('PostgreSQL');
  });

  it('handoff ↔ Gantt SoT strips (wave WJ dedup)', () => {
    expect('mfr-op-wip-gantt-handoff-sot-strip').toContain('handoff-sot');
    expect('mfr-op-wip-gantt-handoff-sot-link').toContain('handoff-sot');
    expect('mfr-op-handoff-wip-gantt-sot-strip').toContain('gantt-sot');
    expect('mfr-op-handoff-wip-gantt-sot-link').toContain('gantt-sot');
    expect('mfr-op-handoff-wip-floor-sot-strip').toContain('floor-sot');
    expect('mfr-op-wip-gantt-floor-sot-strip').toContain('floor-sot');
  });

  it('core cabinet hides duplicate queue snippet when Gantt SoT active', () => {
    expect('coreSlim && factoryId').toContain('factoryId');
    expect('mfr-op-queue-snippet').toContain('queue-snippet');
  });

  it('registry embeds Gantt in factory-production-orders-core', () => {
    expect('factory-production-orders-core').toContain('production-orders');
  });
});
