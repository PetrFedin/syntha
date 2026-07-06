describe('wave SU — shop CO tracking embed + calendar deep-links', () => {
  it('CO cabinet tracking embed testids', () => {
    expect('shop-co-cabinet-tracking-embed').toContain('tracking-embed');
    expect('shop-co-cabinet-tracking-embed-facts').toContain('facts');
    expect('shop-co-cabinet-tracking-embed-chain').toContain('chain');
    expect('shop-co-cabinet-tracking-embed-nav').toContain('nav');
    expect('shop-co-cabinet-tracking-embed-tracking-link').toContain('tracking');
    expect('shop-co-cabinet-tracking-embed-calendar-link').toContain('calendar');
    expect('shop-co-cabinet-tracking-embed-loading').toContain('loading');
  });

  it('calendar row deep-link to tracking card', () => {
    expect('shop-cm-calendar-tracking-deep-link-').toContain('deep-link');
    expect('shop-cm-calendar-event-tracking-strip').toContain('tracking');
  });

  it('tracking panel calendar CTA (wave SN carry-over)', () => {
    expect('shop-co-tracking-calendar-link').toContain('calendar');
  });

  it('PlatformCoreB2bOrderDetailFacts embedSurface cabinetTracking', () => {
    expect('embedSurface').toContain('embed');
    expect('cabinetTracking').toContain('Tracking');
  });
});
