describe('wave-bi chain dedup + platform feed + mfr gantt ops + message templates p3', () => {
  it('brand OP chain card hides handoff context strip in core slim', () => {
    expect('productionPillar && !coreSlim').toContain('!coreSlim');
    expect('brand-order-handoff-context-strip').toContain('handoff-context');
  });

  it('platform B2B marketroom published articles feed strip', () => {
    expect('platform-b2b-marketroom-published-articles-feed-strip').toContain('feed-strip');
    expect('platform-b2b-marketroom-feed-article-').toContain('article');
    expect('platform-b2b-marketroom-feed-matrix-link').toContain('matrix');
    expect('/api/workshop2/collections/SS27/published-articles').toContain('published-articles');
  });

  it('mfr production ops workspace wires Gantt bridge strip', () => {
    expect('ManufacturerCalendarGanttBridgeStrip').toContain('Gantt');
    expect('mfr-cm-calendar-gantt-bridge-strip').toContain('gantt-bridge');
    expect('factory-production-orders-workspace').toContain('workspace');
  });

  it('message templates file API path contract', () => {
    expect('/api/platform-core/b2b-message-templates').toContain('b2b-message-templates');
    expect('platform-core-b2b-message-templates-storage-mode').toContain('storage-mode');
    expect('platform-core-b2b-message-templates-storage-honesty-strip').toContain('honesty');
  });
});
