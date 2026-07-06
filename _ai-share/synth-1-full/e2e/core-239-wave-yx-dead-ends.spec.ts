import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { gotoPlatformPageAudit, openReadinessWorkspaceFromScore } from './helpers/core-chain-overview';
import {
  WAVE_YX_COLLECTION_ID,
  WAVE_YX_CORE_E2E_SPEC,
  waveYxBrandLinesheetsHref,
} from '../src/lib/platform/wave-yx-hub-dead-end-fix';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

const PKG_ROOT = path.join(__dirname, '..');

function readDistributorNavSource(): string {
  return fs.readFileSync(path.join(PKG_ROOT, 'src/lib/data/distributor-navigation.ts'), 'utf8');
}

/**
 * Wave YX: hub dead-end + broken href audit fix (all roles × hub matrix peers).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-239-wave-yx-dead-ends.spec.ts
 */
test.describe('core-239: wave YX hub dead-end fixes', () => {
  test('contract — wave YX SoT spec registered', () => {
    expect(WAVE_YX_CORE_E2E_SPEC).toBe('core-239-wave-yx-dead-ends.spec.ts');
  });

  test('distributor nav — canonical B2B discover/matrix/orders (no legacy tails)', () => {
    const text = readDistributorNavSource();
    expect(text).not.toMatch(/ROUTES\.shop\.b2bDiscover[^P]/);
    expect(text).not.toContain('ROUTES.shop.b2bOrderMode');
    expect(text).not.toContain('ROUTES.shop.b2bOrderDrafts');
    expect(text).toContain('ROUTES.shop.b2bPartnersDiscover');
    expect(text).toContain('ROUTES.shop.b2bMatrix');
    expect(text).toContain('ROUTES.shop.b2bCalendar');
  });

  test('brand SC hub → linesheets workspace (golden path, no 404)', async ({ page }) => {
    test.setTimeout(180_000);
    const res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('readiness-score-brand-sample_collection')).toBeVisible({
      timeout: 60_000,
    });
    await openReadinessWorkspaceFromScore(page, 'brand', 'sample_collection');
    await expect(page).toHaveURL(/\/brand\/linesheets/, { timeout: 60_000 });

    const notFound = page.getByRole('heading', { name: /404|not found|не найден/i });
    expect(await notFound.count()).toBe(0);
  });

  test('brand SC cabinet error linesheet link — /brand/linesheets not merch/linesheet', async ({
    page,
  }) => {
    await page.goto(
      `/brand/core?pillar=sample_collection&collection=${WAVE_YX_COLLECTION_ID}`,
      GOTO
    );
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const linesheetLink = page.getByTestId('brand-sc-cabinet-error-linesheet-link');
    if ((await linesheetLink.count()) === 0) {
      test.skip(true, 'error state not shown — panel loaded OK');
    }

    const href = await linesheetLink.getAttribute('href');
    expect(href).toContain('/brand/linesheets');
    expect(href).toContain(`collection=${WAVE_YX_COLLECTION_ID}`);
    expect(href).not.toContain('/brand/merch/linesheet');
    expect(href).toBe(waveYxBrandLinesheetsHref(WAVE_YX_COLLECTION_ID));
  });

  test('mfr empty SC peer — brand linesheet href golden path', async ({ page }) => {
    await page.goto(
      `/factory/production/core?pillar=sample_collection&collection=${WAVE_YX_COLLECTION_ID}`,
      GOTO
    );

    const peer = page.getByTestId('mfr-empty-sc-peer-strip');
    await expect(peer).toBeVisible({ timeout: 60_000 });

    const linesheetLink = page.getByTestId('mfr-empty-sc-brand-linesheet-link');
    await expect(linesheetLink).toBeVisible();
    const href = await linesheetLink.getAttribute('href');
    expect(href).toContain('/brand/linesheets');
    expect(href).not.toContain('/brand/merch/linesheet');
  });

  test('brand dev cabinet — read-only peer link RU tooltip (shop inactive dev)', async ({ page }) => {
    await page.goto(`/brand/core?pillar=development&collection=${WAVE_YX_COLLECTION_ID}`, GOTO);
    const peerLink = page.getByTestId('cross-role-cabinet-shop-development');
    if ((await peerLink.count()) === 0) {
      test.skip(true, 'cross-role strip not mounted');
    }
    await expect(peerLink).toBeVisible({ timeout: 45_000 });
    const title = await peerLink.getAttribute('title');
    expect(title ?? '').toMatch(/read-only/i);
    expect(title ?? '').toMatch(/Магазин/);
  });
});
