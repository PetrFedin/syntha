import {
  buildReadinessScoreBreakdown,
  calibrateHonestStaticScore,
  deriveHonestLiveScore,
} from '@/lib/platform-core-readiness-sections/scoring';

describe('platform-core-readiness scoring', () => {
  it('liveScore stays close to static — no flat 8.5', () => {
    const staticScore = 7.2;
    const good = ['E2E core-02', 'PG hydrate', 'PATCH chain-status'];
    const live = deriveHonestLiveScore(staticScore, good, [], []);
    expect(live).toBeGreaterThan(staticScore);
    expect(live).toBeLessThanOrEqual(8.3);
    expect(live).toBeLessThan(8.5);
  });

  it('penalizes bad/fix and stub signals', () => {
    const base = 7.3;
    const good = ['peer strip', 'nav core'];
    const withIssues = calibrateHonestStaticScore(
      base,
      'localStorage stub partial',
      good,
      ['нет push'],
      ['Inventory reserve'],
      0
    );
    expect(withIssues).toBeLessThan(base);
  });

  it('breakdown exposes section composition', () => {
    const b = buildReadinessScoreBreakdown(
      7.1,
      7.3,
      ['PG API', 'e2e core-01'],
      ['poll only'],
      [],
      'live'
    );
    expect(b.goodCount).toBe(2);
    expect(b.badCount).toBe(1);
    expect(b.pgSignals).toBe(2);
    expect(b.liveDelta).toBe(0.2);
  });
});
