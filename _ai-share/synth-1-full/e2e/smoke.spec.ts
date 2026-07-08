import { test, expect, type Page } from '@playwright/test';

/**
 * Light smoke (ci-fast): v1 wholesale spine routes only.
 */

const GOTO_OPTS = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };

function pathPattern(path: string): RegExp {
  const pathOnly = path.split('?')[0]!;
  return new RegExp(pathOnly.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}

async function openSmokeRoute(page: Page, path: string): Promise<void> {
  const pattern = pathPattern(path);
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

async function waitForSmokeShell(page: Page): Promise<void> {
  const shell = page
    .locator('main')
    .first()
    .or(page.getByTestId('platform-core-hub-main-column'))
    .or(page.getByTestId('role-core-cabinet-brand'))
    .or(page.getByTestId('role-core-cabinet-shop'));
  await expect(shell.first()).toBeVisible({ timeout: 90_000 });
}

const SMOKE_ROUTES = [
  { path: '/shop/b2b/matrix?collection=SS27', name: 'Shop B2B matrix' },
  { path: '/shop/b2b/showroom?collection=SS27', name: 'Shop B2B showroom' },
  { path: '/shop/b2b/tracking?collection=SS27', name: 'Shop B2B tracking' },
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
