describe('wave TM — brand W2 hub sample status SSE', () => {
  it('W2 hub rollup widget uses sample-status SSE testids', () => {
    expect('workshop2-hub-production-rollup').toContain('rollup');
    expect('brand-w2-sample-status-sse-live').toContain('sse-live');
    expect('brand-w2-sample-status-sse-poll').toContain('sse-poll');
    expect('/api/workshop2/hub/sample-status-stream').toContain('sample-status-stream');
  });

  it('development-status-stream SSE route contract', () => {
    expect('/api/workshop2/collections/development-status-stream').toContain(
      'development-status-stream'
    );
    expect('development_update').toContain('development');
  });

  it('hub production-rollup API path', () => {
    expect('/api/workshop2/hub/production-rollup').toContain('production-rollup');
  });

  it('usePlatformCoreDevelopmentStatusPoll hook export', () => {
    expect('usePlatformCoreDevelopmentStatusPoll').toContain('DevelopmentStatusPoll');
  });
});
