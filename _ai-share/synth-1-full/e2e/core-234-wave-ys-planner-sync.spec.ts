import { test, expect } from '@playwright/test';
import {
  WAVE_YS_CLOSED_WAVE_CODES,
  WAVE_YS_CROSS_CUTTING,
  WAVE_YS_TECH_DEBT_IDS,
} from '../src/lib/platform/wave-ys-planner-runtime-sync';

/**
 * Wave YS: planner-runtime.json final sync health (SS…YP + TECH_DEBT + S1–S5).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-234-wave-ys-planner-sync.spec.ts
 */
test.describe('core-234: wave YS planner-runtime sync', () => {
  test('planner GET — closedWaveGeneration ≥ 74 after YS sync', async ({ request }) => {
    const res = await request.get('/api/dev/platform-core/planner?collection=SS27');
    if (res.status() === 404) {
      test.skip(true, 'dev planner API disabled');
    }
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      plannerMeta?: { closedWaveGeneration?: number };
      counts?: { open?: number; done?: number };
    };
    expect(json.ok).toBe(true);
    expect(json.plannerMeta?.closedWaveGeneration).toBeGreaterThanOrEqual(74);
  });

  test('planner scrub POST — closed wave generation + counts', async ({ request }) => {
    const res = await request.post('/api/dev/platform-core/planner/scrub');
    if (res.status() === 404) {
      test.skip(true, 'dev planner API disabled');
    }
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      closedWaveGeneration?: number;
      counts?: { done?: number };
    };
    expect(json.ok).toBe(true);
    expect(json.closedWaveGeneration).toBeGreaterThanOrEqual(74);
    expect(json.counts?.done).toBeGreaterThan(0);
  });

  test('wave YS SoT — SS…YP batch + S1–S5 axes documented', async () => {
    expect(WAVE_YS_CLOSED_WAVE_CODES[0]).toBe('SS');
    expect(WAVE_YS_CLOSED_WAVE_CODES.at(-1)).toBe('YP');
    expect(WAVE_YS_TECH_DEBT_IDS.length).toBe(21);
    expect(Object.keys(WAVE_YS_CROSS_CUTTING)).toEqual(['S1', 'S2', 'S3', 'S4', 'S5']);
  });

  test('platform spine health — workshop2 PG probe', async ({ request }) => {
    const res = await request.get('/api/workshop2/platform-core/health');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean };
    expect(typeof json.ok).toBe('boolean');
  });
});
