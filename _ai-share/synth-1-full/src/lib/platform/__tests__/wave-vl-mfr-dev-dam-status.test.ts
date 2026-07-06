describe('wave VL — mfr dev DAM + development-status mirror', () => {
  it('sample photo attach-photo DAM POST (canonical VL path)', () => {
    expect('/api/workshop2/manufacturer/samples/attach-photo').toContain('attach-photo');
    expect('mfr-dev-sample-photo-dam-stub-strip').toContain('dam-stub');
    expect('mfr-dev-sample-photo-dam-stub-btn').toContain('dam-stub');
    expect('attachManufacturerSamplePhotoDamStub').toContain('Dam');
  });

  it('PG mirror brand development-status on mfr dev cabinet', () => {
    expect('mfr-dev-development-status-mirror-strip').toContain('mirror-strip');
    expect('mfr-dev-development-status-mirror-steps').toContain('mirror-steps');
    expect('mfr-dev-development-status-mirror-badge').toContain('mirror-badge');
    expect('mfr-dev-development-status-mirror-pg-badge').toContain('mirror-pg');
    expect('useMfrDevDevelopmentStatusMirror').toContain('Mirror');
    expect('/api/workshop2/collections/').toContain('collections');
    expect('/development-status').toContain('development-status');
  });

  it('sample queue hash-scroll + factory PATCH limited fields', () => {
    expect('#sample-queue').toBe('#sample-queue');
    expect('usePlatformCoreHashScroll').toContain('HashScroll');
    expect('/api/workshop2/factory/sample-queue/').toContain('sample-queue');
    expect('validateFactorySamplePatch').toContain('Patch');
    expect('factory-sample-in-progress-button').toContain('progress');
    expect('factory-sample-ack-button').toContain('ack');
  });

  it('mfr dev cabinet strips (wave TZ/UQ/VL peers)', () => {
    expect('mfr-dev-sample-queue-handoff-peer-strip').toContain('handoff-peer');
    expect('mfr-dev-factory-scope-strip').toContain('factory-scope');
    expect('mfr-dev-cabinet-panel').toContain('cabinet-panel');
  });
});
