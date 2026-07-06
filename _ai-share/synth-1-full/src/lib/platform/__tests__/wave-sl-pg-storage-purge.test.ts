describe('wave SL — S1 localStorage purge (core fail-closed)', () => {
  it('pg read-path policy blocks LS fallback in core', () => {
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
  });

  it('brand production ops PG-only client', () => {
    expect('/api/brand/production/operations-state').toContain('operations-state');
    expect('brand-production-ops-storage-unavailable').toContain('unavailable');
  });

  it('rep offline drafts + sketch templates no LS mirror in core', () => {
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('fetchOrgSketchPinTemplatesRemote').toContain('Remote');
  });
});
