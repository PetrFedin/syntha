import { test, expect } from '@playwright/test';
import {
  WAVE_YW_BATTLE_READY_PROBES,
  WAVE_YW_CLOSED_WAVE_CODES,
  WAVE_YW_E2E_SPEC,
} from '../src/lib/platform/wave-yw-battle-ready-alignment';

/**
 * Wave YW: minimal health smoke aligned with npm run agent:battle-ready (read-only BFF only).
 * Does not probe FastAPI :8000, pytest, or 120s platform-ai/task POST.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-238-wave-yw-battle-ready.spec.ts
 */
test.describe('core-238: wave YW battle-ready alignment smoke', () => {
  test('SoT — YI…YP batch + e2e spec basename', async () => {
    expect(WAVE_YW_CLOSED_WAVE_CODES[0]).toBe('YI');
    expect(WAVE_YW_CLOSED_WAVE_CODES.at(-1)).toBe('YP');
    expect(WAVE_YW_E2E_SPEC).toBe('core-238-wave-yw-battle-ready.spec.ts');
    expect(WAVE_YW_BATTLE_READY_PROBES.every((p) => p.method === 'GET' && p.e2eSafe)).toBe(true);
  });

  for (const probe of WAVE_YW_BATTLE_READY_PROBES) {
    test(`GET [${probe.layer}] ${probe.path}`, async ({ request }) => {
      const res = await request.get(probe.path);
      const max = probe.maxStatus ?? 499;
      expect(res.status()).toBeLessThanOrEqual(max);

      if (res.status() === 404 && probe.path.includes('/api/dev/platform-core/planner')) {
        test.skip(true, 'dev planner API disabled');
      }

      if (probe.id === 'syntha-status' && res.ok()) {
        const json = (await res.json()) as {
          ok?: boolean;
          plannerLive?: boolean;
          ollamaOk?: boolean;
        };
        expect(json.ok).toBe(true);
        expect(typeof json.plannerLive).toBe('boolean');
        expect(typeof json.ollamaOk).toBe('boolean');
      }

      if (probe.id === 'payment-intent-probe' && res.ok()) {
        const json = (await res.json()) as { ok?: boolean; messageRu?: string };
        expect(json.ok).toBe(true);
        expect(typeof json.messageRu).toBe('string');
      }

      if (probe.id === 'platform-spine-health') {
        const json = (await res.json()) as { ok?: boolean };
        expect(typeof json.ok).toBe('boolean');
      }
    });
  }
});
