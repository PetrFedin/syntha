import { test, expect } from '@playwright/test';
import { gotoPlatformHub } from './helpers/core-chain-overview';

/**
 * Wave VZ: финальное закрытие readiness bad/fix + hub audit happy path.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-163-wave-vz-audit-closure.spec.ts
 */
test.describe('core-163: wave VZ audit closure', () => {
  test('planner GET — readiness planner snapshot (dev API)', async ({ request }) => {
    const res = await request.get('/api/dev/platform-core/planner?collection=SS27');
    if (res.status() === 404) {
      test.skip(true, 'dev planner API disabled');
    }
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      counts?: { p0?: number; total?: number };
      plannerMeta?: { closedWaveGeneration?: number };
    };
    expect(json.ok).toBe(true);
    expect(json.counts).toBeTruthy();
    expect(typeof json.plannerMeta?.closedWaveGeneration).toBe('number');
  });

  test('hub audit view — readiness matrix без npm-команд', async ({ page }) => {
    const res = await gotoPlatformHub(page, '/platform', { collectionId: 'SS27' });
    expect(res?.status() ?? 599).toBeLessThan(500);

    await page.getByTestId('platform-core-hub-view-audit').click();

    const mode = page.getByTestId('platform-core-readiness-mode');
    await expect(mode).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('platform-core-readiness-matrix')).toBeVisible({
      timeout: 60_000,
    });

    const text = (await mode.textContent()) ?? '';
    expect(text).not.toMatch(/npm run/i);
    expect(text).toMatch(/готовност|ориентировочн|Цепочка активна|База недоступна/i);
  });

  test('brand CO hub card — RU оформление label (не UAT checkout)', async ({ page }) => {
    await page.goto('/brand/core?pillar=collection_order&collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    const checkout = page.getByTestId('brand-pillar-to-shop-checkout');
    if ((await checkout.count()) === 0) {
      test.skip(true, 'no active order — checkout peer hidden');
    }
    await expect(checkout).toContainText(/оформление/i);
    await expect(checkout).not.toContainText(/checkout/i);
  });
});
