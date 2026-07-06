describe('wave BM — greenfield checkout + comms poll fallback', () => {
  it('greenfield post-checkout registry href', () => {
    expect('shop-co-checkout-greenfield-readiness-strip').toContain('greenfield');
    expect('shop-co-registry-empty-greenfield-monetization-strip').toContain('greenfield');
  });

  it('shop cm cabinet poll + spine peers', () => {
    expect('shop-cm-cabinet-poll-badge').toContain('poll');
    expect('shop-cm-cabinet-spine-peer-strip').toContain('spine-peer');
  });

  it('comms pillar SSE/poll badge per role', () => {
    expect('brand-cm-cabinet-poll-badge').toContain('poll');
    expect('mfr-cm-cabinet-poll-badge').toContain('poll');
  });
});
