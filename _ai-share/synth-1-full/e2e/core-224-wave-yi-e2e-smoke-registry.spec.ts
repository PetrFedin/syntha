import { test, expect, type APIRequestContext } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import {
  WAVE_YI_CORE_E2E_MAX_SPEC_NUMBER,
  WAVE_YI_CORE_E2E_MIN_SPEC_NUMBER,
  WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS,
  WAVE_YI_E2E_SMOKE_API_PROBES,
  type WaveYiE2eSmokeApiProbe,
} from '../src/lib/platform/wave-yi-e2e-smoke-registry';

const PG_OPTIONAL_WAVES = new Set(['YB', 'YD', 'YG', 'YH', 'XT', 'comms']);

async function readPlatformCoreHealth(request: APIRequestContext) {
  const res = await request.get('/api/workshop2/platform-core/health');
  expect(res.status()).toBeLessThan(500);
  return (await res.json()) as { ok?: boolean; pgReachable?: boolean; demoSeeded?: boolean };
}

function needsPg(probe: WaveYiE2eSmokeApiProbe): boolean {
  return PG_OPTIONAL_WAVES.has(probe.wave);
}

/**
 * Wave YI: meta E2E smoke registry — platform health + sample APIs from recent waves (YA–YH).
 * Batch window core-156…223 is verified in wave-yi-e2e-smoke-registry.test.ts (playwright.core.config.ts).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-224-wave-yi-e2e-smoke-registry.spec.ts
 */
test.describe('core-224: wave YI E2E smoke registry', () => {
  test('registry batch — core-156…223 spec count', async () => {
    expect(WAVE_YI_CORE_E2E_MIN_SPEC_NUMBER).toBe(156);
    expect(WAVE_YI_CORE_E2E_MAX_SPEC_NUMBER).toBe(223);
    expect(WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS.length).toBe(68);
    expect(WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS[0]).toBe('core-156-wave-vl-mfr-dev-dam.spec.ts');
    expect(WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS.at(-1)).toBe(
      'core-223-wave-yh-wms-reserve.spec.ts'
    );
  });

  test('platform-core health — pgReachable + demoSeeded shape', async ({ request }) => {
    const json = await readPlatformCoreHealth(request);
    expect(typeof json.pgReachable).toBe('boolean');
    if (json.ok) expect(typeof json.demoSeeded).toBe('boolean');
  });

  for (const probe of WAVE_YI_E2E_SMOKE_API_PROBES) {
    test(`API smoke [${probe.wave}] GET ${probe.path}`, async ({ request }) => {
      if (needsPg(probe)) {
        const health = await readPlatformCoreHealth(request);
        test.skip(!health.pgReachable, 'нужен PG (:5433 + db:core:bootstrap)');
      }

      const res = await request.get(probe.path);
      const max = probe.maxStatus ?? 499;
      expect(res.status()).toBeLessThanOrEqual(max);
      if (res.status() === 404 && probe.path.includes('/api/dev/platform-core/planner')) {
        test.skip(true, 'dev planner API disabled');
      }
    });
  }

  test('YH WMS balances for demo article', async ({ request }) => {
    const health = await readPlatformCoreHealth(request);
    test.skip(!health.pgReachable, 'нужен PG');

    const { collectionId, demoArticleId } = PLATFORM_CORE_DEMO;
    const res = await request.get(
      `/api/workshop2/articles/${collectionId}/${demoArticleId}/wms/balances`
    );
    expect(res.status()).toBeLessThan(500);
  });
});
