import { test, expect } from '@playwright/test';
import { gotoPlatformHub } from './helpers/core-chain-overview';
import {
  WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID,
  BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID,
} from '../src/lib/platform/wave-xq-brand-dossier-dual-write-off';
import { WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID } from '../src/lib/platform/wave-xs-brand-w2-readpath-banner';
import { WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID } from '../src/lib/platform/wave-xu-mfr-tz-export-print';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave YE: readiness audit 8.0 closure batch — hub matrix + XQ–XZ spot checks.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-220-wave-ye-audit-final.spec.ts
 */
test.describe('core-220: wave YE readiness audit 8.0', () => {
  test('planner GET — closedWaveGeneration includes YE batch', async ({ request }) => {
    const res = await request.get('/api/dev/platform-core/planner?collection=SS27');
    if (res.status() === 404) {
      test.skip(true, 'dev planner API disabled');
    }
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      plannerMeta?: { closedWaveGeneration?: number };
    };
    expect(json.ok).toBe(true);
    expect(json.plannerMeta?.closedWaveGeneration).toBeGreaterThanOrEqual(73);
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

  test('XQ: W2 dossier offline-blocked banner + diff↔attach TZ cross strip', async ({
    page,
    request,
  }) => {
    const health = (await (
      await request.get('/api/workshop2/platform-core/health')
    ).json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/brand/production/workshop2/c/SS27/a/SS27-001?w2sec=general', GOTO);
    await expect(page.getByTestId(WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID)).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId(BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID)).toBeVisible();
  });

  test('XR: live process page PG storage badge', async ({ page }) => {
    await page.goto('/brand/process/production/live?context=SS27', GOTO);
    const pgBadge = page.getByTestId('live-process-runtime-storage-pg');
    const unavailBadge = page.getByTestId('live-process-runtime-storage-unavailable');
    await expect(pgBadge.or(unavailBadge)).toBeVisible({ timeout: 60_000 });
  });

  test('XS: W2 hub with PG — no readPath banner', async ({ page, request }) => {
    const health = (await (
      await request.get('/api/workshop2/platform-core/health')
    ).json()) as { pgReachable?: boolean; demoSeeded?: boolean };
    test.skip(!health.pgReachable || !health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/brand/production/workshop2?w2col=SS27&pcf=hub', GOTO);
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId(WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID)).toHaveCount(0);
  });

  test('XT: matrix draft PG badge + checkout autosave fail cross-link', async ({ page, request }) => {
    const health = (await (
      await request.get('/api/workshop2/platform-core/health')
    ).json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    await expect(page.getByTestId('shop-co-matrix-shell')).toBeVisible({ timeout: 60_000 });
    const qtyInput = page.locator('[data-testid^="shop-co-matrix-qty-"]').first();
    await expect(qtyInput).toBeVisible({ timeout: 45_000 });
    await qtyInput.fill('2');
    await qtyInput.blur();
    await expect(page.getByTestId('shop-co-matrix-draft-storage-pg')).toBeVisible({ timeout: 20_000 });

    await page.goto('/shop/b2b/checkout?collection=SS27&draftAutosaveFail=1', GOTO);
    await expect(page.getByTestId('shop-co-checkout-draft-autosave-fail-hint')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-co-checkout-draft-autosave-matrix-link')).toBeVisible();
  });

  test('XU: mfr dossier export-print strip visible', async ({ page }) => {
    await page.goto(
      '/factory/production/dossier/SS27-001?collection=SS27&pillar=order_production',
      GOTO
    );
    await expect(page.getByTestId(WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID)).toBeVisible({
      timeout: 60_000,
    });
  });

  test('XV: WSSI OTB sync strip deduped on otb tab', async ({ page }) => {
    await page.goto('/brand/merch/assortment-mix-planner?collection=SS27&pcf=otb', GOTO);
    await expect(page.getByTestId('brand-co-otb-replenishment-sync-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-otb-plan-sync-badge')).toContainText('Синхрон плана OTB');
    await expect(page.getByTestId('brand-co-wssi-replenishment-rules-link')).toHaveCount(0);
  });

  test('XX: shop2 CO cabinet greenfield registry buyer PG', async ({ page }) => {
    await page.goto('/shop/core?pillar=collection_order&collection=SS27&buyer=shop2', GOTO);
    await expect(page.getByTestId('shop-co-greenfield-registry-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-co-greenfield-registry-buyer-pg')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('XY: shop OP pillar redirects to CO tracking embed', async ({ page }) => {
    await page.goto('/shop/core?pillar=order_production&collection=SS27', GOTO);
    await expect(page).toHaveURL(/pillar=collection_order/, { timeout: 45_000 });
    await expect(page).toHaveURL(/#shop-co-buyer-tracking/);
    await expect(page.getByTestId('shop-co-cabinet-tracking-link')).toHaveCount(0);
  });
});
