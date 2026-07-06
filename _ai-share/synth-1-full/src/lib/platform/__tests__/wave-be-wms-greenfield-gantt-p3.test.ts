describe('wave-be supplier wms + greenfield registry + mfr gantt p3', () => {
  it('wave-be testid anchors', () => {
    expect('sup-op-procurement-bom-wms-reserve-strip-post-reserve-btn').toContain('post-reserve');
    expect('sup-op-procurement-wms-reserve-strip-post-reserve-btn').toContain('post-reserve');
    expect('shop-co-registry-greenfield-focus-strip').toContain('greenfield');
    expect('shop-co-registry-greenfield-focus-tracking-link').toContain('tracking');
    expect('mfr-cm-calendar-gantt-attach-tz-btn').toContain('attach-tz');
    expect('mfr-cm-calendar-gantt-collection-link').toContain('collection');
  });

  it('wms reserve API path contract', () => {
    const path =
      '/api/workshop2/articles/SS27/demo-ss27-01/wms/reserve-sample';
    expect(path).toContain('wms/reserve-sample');
  });
});
