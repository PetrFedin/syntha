import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import {
  buildPlatformCoreGoldenCrossRoleStops,
  buildPlatformCoreGoldenCrossRoleStopsForUi,
  goldenCrossRoleOrderId,
} from '../src/lib/platform-core-golden-cross-role-path';
import { gotoPlatformHub, gotoRoleCoreCabinet } from './helpers/core-chain-overview';
import {
  clickCabinetSectionLink,
  filterGoldenStopsForHealth,
  readPlatformCoreHealth,
  visitGoldenCrossRoleStop,
} from './helpers/platform-core-golden-path';

/**
 * Wave 6 · Article Spine: brand + shop baseline (2 роли); mfr/sup — core-249-extended-roles-golden.spec.ts.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-249-wave-5-golden-cross-role-embedded.spec.ts
 */
test.describe.configure({ mode: 'serial' });

const demo = {
  collectionId: PLATFORM_CORE_DEMO.collectionId,
  demoOrderId: PLATFORM_CORE_DEMO.demoOrderId,
  demoArticleId: PLATFORM_CORE_DEMO.demoArticleId,
};

test.describe('core-249: wave 6 article spine golden cross-role embedded', () => {
  test('contract: native core hrefs for baseline spine stops', () => {
    const orderId = goldenCrossRoleOrderId(demo);
    const allStops = buildPlatformCoreGoldenCrossRoleStops(demo);
    const uiStops = buildPlatformCoreGoldenCrossRoleStopsForUi(demo);
    expect(orderId).toBe(PLATFORM_CORE_DEMO.demoOrderId);
    expect(allStops).toHaveLength(16); // 13 brand+shop + 3 mfr/sup backend path

    expect(uiStops).toHaveLength(13);
    expect(uiStops.every((s) => s.href.includes(`order=${encodeURIComponent(orderId)}`))).toBe(
      true
    );
    expect(uiStops.map((s) => s.roleId)).not.toContain('manufacturer');
  });


  test('brand dev embedded: w2 hub → dossier (article TZ)', async ({ page }) => {
    const devStops = buildPlatformCoreGoldenCrossRoleStops(demo).filter(
      (s) => s.roleId === 'brand' && s.pillarId === 'development'
    );
    expect(devStops.map((s) => s.sectionId)).toEqual(['brand-dev-w2-hub', 'brand-dev-dossier']);
    for (const stop of devStops) {
      await visitGoldenCrossRoleStop(page, stop);
    }
    await expect(page.getByTestId('brand-development-article-workspace')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('platform-core-article-creation-mode-strip')).toBeVisible();
    await expect(
      page.getByTestId('platform-core-article-creation-mode-full_production')
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('w2-article-tab-release')).toBeVisible();
    await page.getByTestId('platform-core-article-creation-mode-buy_or_import').click();
    await expect(
      page.getByTestId('platform-core-article-creation-mode-buy_or_import')
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('w2-article-tab-release')).toHaveCount(0);
    await expect(page.getByTestId('w2-article-tab-supply')).toHaveCount(0);
    await expect(page.getByTestId('w2-article-tab-tz')).toBeVisible();
    await expect(page.getByTestId('w2-article-tab-vault')).toBeVisible();
  });

  test('article spine strip: w2 hub → dossier via golden path', async ({ page }) => {
    const hub = buildPlatformCoreGoldenCrossRoleStops(demo).find(
      (s) => s.sectionId === 'brand-dev-w2-hub'
    )!;
    await visitGoldenCrossRoleStop(page, hub);
    const strip = page.getByTestId('platform-core-article-spine-golden-path-strip');
    await expect(strip).toBeVisible({ timeout: 60_000 });
    await strip.getByTestId('article-spine-golden-dossier-link').click();
    await expect(page.getByTestId('brand-development-article-workspace')).toBeVisible({
      timeout: 60_000,
    });
    expect(page.url()).toContain('section=brand-dev-dossier');
    expect(page.url()).toContain(`article=${encodeURIComponent(demo.demoArticleId)}`);
  });

    test('brand sample_collection: linesheets cabinet panel', async ({ page }) => {
    const stop = buildPlatformCoreGoldenCrossRoleStops(demo).find(
      (s) => s.sectionId === 'brand-sc-linesheets'
    );
    expect(stop).toBeTruthy();
    await visitGoldenCrossRoleStop(page, stop!);
  });

  test('shop CO embedded spine: matrix → checkout → registry → detail', async ({
    page,
    request,
  }) => {
    const health = await readPlatformCoreHealth(request);
    const shopStops = filterGoldenStopsForHealth(
      buildPlatformCoreGoldenCrossRoleStops(demo).filter((s) => s.roleId === 'shop'),
      health.demoSeeded === true
    );
    for (const stop of shopStops) {
      await visitGoldenCrossRoleStop(page, stop);
    }
  });

  test('brand CO embedded: registry → detail (same orderId)', async ({ page, request }) => {
    const health = await readPlatformCoreHealth(request);
    const brandStops = filterGoldenStopsForHealth(
      buildPlatformCoreGoldenCrossRoleStops(demo).filter((s) => s.roleId === 'brand'),
      health.demoSeeded === true
    );
    for (const stop of brandStops) {
      await visitGoldenCrossRoleStop(page, stop);
    }
    if (health.demoSeeded) {
      // embedded hub: context bar скрыт — orderId на comms detail panel
      await expect(page.getByTestId('brand-order-comms-detail-panel')).toContainText(
        PLATFORM_CORE_DEMO.demoOrderId,
        { timeout: 30_000 }
      );
    }
  });

  test('golden path switches shop matrix ↔ checkout without legacy URL', async ({ page }) => {
    const matrix = buildPlatformCoreGoldenCrossRoleStops(demo).find(
      (s) => s.sectionId === 'shop-co-matrix'
    )!;
    await gotoRoleCoreCabinet(page, matrix.href);
    await expect(page.getByTestId('shop-co-matrix-embedded-panel')).toBeVisible({
      timeout: 60_000,
    });
    await page.getByTestId('shop-co-golden-path-strip').getByRole('link', { name: /оформление/i }).click();
    await expect(page.getByTestId('shop-co-checkout-panel')).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('shop-co-golden-path-strip').getByRole('link', { name: /матрица/i }).click();
    await expect(page.getByTestId('shop-co-matrix-embedded-panel')).toBeVisible({
      timeout: 60_000,
    });
    expect(page.url()).not.toMatch(/\/shop\/b2b\//);
    expect(page.url()).toContain('section=shop-co-matrix');
  });

  test('shop matrix embedded: inspector ↔ prepack tabs stay on /shop/core', async ({ page }) => {
    const matrix = buildPlatformCoreGoldenCrossRoleStops(demo).find(
      (s) => s.sectionId === 'shop-co-matrix'
    )!;
    await gotoRoleCoreCabinet(page, matrix.href);
    const embedded = page.getByTestId('shop-co-matrix-embedded-panel');
    await expect(embedded).toBeVisible({ timeout: 60_000 });
    await expect(embedded.getByTestId('shop-co-matrix-inspector-prepack-peer-strip')).toBeVisible({
      timeout: 60_000,
    });
    await embedded.getByTestId('shop-co-matrix-tab-prepack-link').click();
    await expect(page.getByTestId('shop-matrix-prepack-panel')).toBeVisible({ timeout: 60_000 });
    expect(page.url()).toContain('/shop/core');
    expect(page.url()).toContain('section=shop-co-matrix');
    expect(page.url()).toContain('pcf=prepack');
    expect(page.url()).not.toMatch(/\/shop\/b2b\//);

    await embedded.getByTestId('shop-co-matrix-tab-inspector-link').click();
    await expect(
      page
        .getByTestId('shop-matrix-inspector-panel')
        .or(page.getByTestId('shop-matrix-inspector-empty'))
        .or(page.getByTestId('shop-matrix-inspector-loading'))
        .or(page.getByTestId('shop-matrix-inspector-error'))
        .or(page.getByTestId('shop-matrix-inspector-gate-blocked'))
    ).toBeVisible({ timeout: 90_000 });
    expect(page.url()).toContain('pcf=inspector');

    await embedded.getByTestId('shop-co-matrix-tab-matrix-link').click();
    await expect(
      page
        .getByTestId('shop-co-matrix-panel')
        .or(embedded)
    ).toBeVisible({ timeout: 90_000 });
    expect(page.url()).toContain('section=shop-co-matrix');
  });


  test('full spine: first four stops in order (brand → shop matrix)', async ({ page }) => {
    const spineIds = [
      'brand-dev-w2-hub',
      'brand-dev-dossier',
      'brand-sc-linesheets',
      'shop-co-matrix',
    ] as const;
    const stops = buildPlatformCoreGoldenCrossRoleStops(demo).filter((s) =>
      (spineIds as readonly string[]).includes(s.sectionId)
    );
    expect(stops.map((s) => s.sectionId)).toEqual([...spineIds]);
    for (const stop of stops) {
      await visitGoldenCrossRoleStop(page, stop);
    }
    await expect(page.getByTestId('shop-co-matrix-embedded-panel')).toBeVisible({
      timeout: 60_000,
    });
  });

  test('platform hub quick entry: only brand and shop roles', async ({ page }) => {
    await gotoPlatformHub(page, '/platform', { collectionId: demo.collectionId });
    const panel = page.getByTestId('platform-core-hub-quick-roles-panel');
    await expect(panel.getByTestId('role-block-brand')).toBeVisible({ timeout: 60_000 });
    await expect(panel.getByTestId('role-block-shop')).toBeVisible();
    await expect(panel.getByTestId('role-block-manufacturer')).toHaveCount(0);
    await expect(panel.getByTestId('role-block-supplier')).toHaveCount(0);
  });

  test('platform hub: roles column and readiness matrix (no chain strip)', async ({ page }) => {
    await gotoPlatformHub(page, '/platform', { collectionId: demo.collectionId });
    const panel = page.getByTestId('platform-core-hub-roles-audit-panel');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel.getByTestId('platform-core-hub-quick-roles-panel')).toBeVisible();
    await expect(page.getByTestId('platform-core-readiness-matrix')).toBeVisible();
    await expect(page.getByTestId('platform-core-hub-chain-strip')).toHaveCount(0);
    await expect(page.getByText('Средняя по столпу')).toHaveCount(0);
  });
});
