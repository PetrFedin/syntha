import { test, expect } from '@playwright/test';
import {
  WAVE_ZF_CLOSED_WAVE_CODES,
  WAVE_ZF_CROSS_CUTTING,
} from '../src/lib/platform/wave-zf-planner-runtime-sync';

/**
 * Wave ZF: planner-runtime.json final sync (YY…ZE + S1–S5 markers).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-247-wave-zf-planner.spec.ts
 */
test.describe('core-247: wave ZF planner-runtime sync', () => {
  test('planner GET — closedWaveGeneration ≥ 75 after ZF sync', async ({ request }) => {
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
    expect(json.plannerMeta?.closedWaveGeneration).toBeGreaterThanOrEqual(75);
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
    expect(json.closedWaveGeneration).toBeGreaterThanOrEqual(75);
    expect(json.counts?.done).toBeGreaterThan(0);
  });

  test('wave ZF SoT — YY…ZE batch + S1–S5 axes documented', async () => {
    expect(WAVE_ZF_CLOSED_WAVE_CODES[0]).toBe('YY');
    expect(WAVE_ZF_CLOSED_WAVE_CODES.at(-1)).toBe('ZE');
    expect(WAVE_ZF_CLOSED_WAVE_CODES.length).toBe(7);
    expect(Object.keys(WAVE_ZF_CROSS_CUTTING)).toEqual(['S1', 'S2', 'S3', 'S4', 'S5']);
  });

  test('platform spine health — workshop2 PG probe', async ({ request }) => {
    const res = await request.get('/api/workshop2/platform-core/health');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean };
    expect(typeof json.ok).toBe('boolean');
  });
});
