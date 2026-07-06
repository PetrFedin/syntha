import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { gotoPlatformPageAudit, openReadinessWorkspaceFromScore } from './helpers/core-chain-overview';

const COLLECTION = 'SS27';
const WAVE_ZD_LINKS_FIXED_COUNT = 12;
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

const PKG_ROOT = path.join(__dirname, '..');

function readSource(rel: string): string {
  return fs.readFileSync(path.join(PKG_ROOT, 'src', rel), 'utf8');
}

/**
 * Wave ZD: hub navigation dead-end href fixes (YQ matrix peers + distributor nav).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-245-wave-zd-links.spec.ts
 */
test.describe('core-245: wave ZD dead-end link fixes', () => {
  test('contract — documents 12 closed href fixes', () => {
    const soT = readSource('lib/platform/wave-zd-dead-end-link-fix.ts');
    expect(WAVE_ZD_LINKS_FIXED_COUNT).toBe(12);
    expect(soT).toContain('WAVE_ZD_LINKS_FIXED_COUNT = WAVE_ZD_DEAD_END_LINK_FIXES.length');
    expect(soT.match(/id: '/g)?.length ?? 0).toBeGreaterThanOrEqual(12);
  });

  test('distributor nav — canonical B2B discover/matrix/orders (no legacy tails)', () => {
    const text = readSource('lib/data/distributor-navigation.ts');
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
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    await page.goto(`/brand/core?pillar=sample_collection&collection=${COLLECTION}`, GOTO);
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const linesheetLink = page.getByTestId('brand-sc-cabinet-error-linesheet-link');
    if ((await linesheetLink.count()) === 0) {
      test.skip(true, 'error state not shown — panel loaded OK');
    }

    const href = await linesheetLink.getAttribute('href');
    expect(href).toContain('/brand/linesheets');
    expect(href).toContain(`collection=${COLLECTION}`);
    expect(href).not.toContain('/brand/merch/linesheet');
    expect(href).toMatch(new RegExp(`/brand/linesheets\\?.*collection=${COLLECTION}`));
  });

  test('mfr empty SC peer — brand linesheet href golden path', async ({ page }) => {
    await page.goto(
      `/factory/production/core?pillar=sample_collection&collection=${COLLECTION}`,
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
});
