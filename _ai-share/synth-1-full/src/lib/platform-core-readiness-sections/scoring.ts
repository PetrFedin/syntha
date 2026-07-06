/**
 * Честная калибровка readiness: static = UI/nav/peers без live PG;
 * live = static + ограниченный бонус за PG/e2e/API (не flat 8.5).
 */

const PG_SIGNAL =
  /e2e|core-\d+|PG|API|PATCH|POST|SSE|hydrate|persist|chain-status|bootstrap|seed|round-trip|idempotent/i;
const STUB_SIGNAL =
  /localStorage|stub|mock|partial|file mode|placeholder only|legacy side|read-only|poll only|без push|нет push|WMS — после handoff/i;
const PEER_SIGNAL = /peer|cross-link|cross-spine|golden path|CTA \(/i;

export function roundReadinessScore(n: number): number {
  return Math.round(n * 10) / 10;
}

export function clampReadinessScore(n: number, min = 5.5, max = 8.3): number {
  return roundReadinessScore(Math.min(max, Math.max(min, n)));
}

/** Бонус live поверх static: от +0.1 (UI-only) до +0.4 (PG golden). */
export function deriveHonestLiveScore(
  staticScore: number,
  good: readonly string[],
  bad: readonly string[],
  fix: readonly string[]
): number {
  const pgHits = good.filter((g) => PG_SIGNAL.test(g)).length;
  const peerHits = good.filter((g) => PEER_SIGNAL.test(g)).length;

  let delta = 0.12;
  if (pgHits >= 4) delta = 0.38;
  else if (pgHits >= 2) delta = 0.28;
  else if (pgHits >= 1) delta = 0.2;
  if (peerHits >= 2 && pgHits >= 1) delta += 0.05;

  delta -= bad.length * 0.07;
  delta -= fix.length * 0.05;
  if (STUB_SIGNAL.test([...good, ...bad, ...fix].join(' '))) delta -= 0.08;

  delta = Math.max(0.08, Math.min(staticScore < 6.5 ? 0.28 : 0.42, delta));

  const live = staticScore + delta;
  return clampReadinessScore(live, staticScore, 8.3);
}

/**
 * Корректировка static от HEAD-базы по содержимому аудита (не +1.0 bulk).
 * headStatic — предыдущая ручная оценка; waveBoost — +0.1 если раздел усилен peer/e2e.
 */
export function calibrateHonestStaticScore(
  headStatic: number,
  summary: string,
  good: readonly string[],
  bad: readonly string[],
  fix: readonly string[],
  waveBoost = 0
): number {
  const text = [summary, ...good, ...bad, ...fix].join(' ');
  let score = headStatic + waveBoost;

  const pgHits = good.filter((g) => PG_SIGNAL.test(g)).length;
  const peerHits = good.filter((g) => PEER_SIGNAL.test(g)).length;

  if (peerHits >= 3 && pgHits >= 1) score += 0.05;
  if (bad.length >= 2) score -= 0.1;
  else if (bad.length === 1) score -= 0.05;
  if (fix.length >= 2) score -= 0.08;
  if (STUB_SIGNAL.test(text)) score -= 0.15;
  if (good.length <= 3) score -= 0.1;

  return clampReadinessScore(score, 5.5, 8.0);
}

export type ReadinessScoreBreakdown = {
  mode: 'static' | 'live';
  score: number;
  staticScore: number;
  liveScore: number;
  liveDelta: number;
  goodCount: number;
  badCount: number;
  fixCount: number;
  pgSignals: number;
};

export function buildReadinessScoreBreakdown(
  staticScore: number,
  liveScore: number,
  good: readonly string[],
  bad: readonly string[],
  fix: readonly string[],
  mode: 'static' | 'live'
): ReadinessScoreBreakdown {
  return {
    mode,
    score: mode === 'live' ? liveScore : staticScore,
    staticScore,
    liveScore,
    liveDelta: roundReadinessScore(liveScore - staticScore),
    goodCount: good.length,
    badCount: bad.length,
    fixCount: fix.length,
    pgSignals: good.filter((g) => PG_SIGNAL.test(g)).length,
  };
}
