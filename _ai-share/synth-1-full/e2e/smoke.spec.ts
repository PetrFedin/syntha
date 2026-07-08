import { test, expect, type Page } from '@playwright/test';

/**
 * Light smoke (ci-fast): v1 wholesale spine routes only.
 * client-b2c / shop-longtail / b2b-advanced archived — see _platform-core-v1/TWO_ROLE_BASELINE.md.
 */

const GOTO_OPTS = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };

async function openSmokeRoute(page: Page, path: string): Promise<void> {
  const pattern = new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split('?')[0]!);
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await page.goto(path, GOTO_OPTS);
      if (page.url().startsWith('chrome-error:')) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      expect(res?.status() ?? 599).toBeLessThan(500);
      await expect(page).toHaveURL(pattern, { timeout: 25_000 });
      return;
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** После goto ждём `<main>` — cabinet/public layout; `body` может быть hidden при гидрации. */
async function waitForSmokeShell(page: Page): Promise<void> {
  await expect(page.locator('main').first()).toBeVisible({ timeout: 90_000 });
}

const SMOKE_ROUTES = [
  { path: '/platform', name: 'Platform hub' },
  { path: '/brand/core', name: 'Brand core cabinet' },
  { path: '/brand/b2b-orders', name: 'Brand B2B orders registry' },
  { path: '/shop/core', name: 'Shop core cabinet' },
  { path: '/shop/b2b/matrix?collection=SS27', name: 'Shop B2B matrix' },
  { path: '/shop/b2b/showroom?collection=SS27', name: 'Shop B2B showroom' },
  { path: '/factory/production/core', name: 'Manufacturer core cabinet' },
  { path: '/factory/supplier/core', name: 'Supplier core cabinet' },
] as const;

for (const { path, name } of SMOKE_ROUTES) {
  test(`smoke: ${name} (${path})`, async ({ page }) => {
    test.setTimeout(180_000);
    await openSmokeRoute(page, path);
    await waitForSmokeShell(page);
  });
}
