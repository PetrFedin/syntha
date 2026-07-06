import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import {
  BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LINK_TESTID,
  BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID,
  WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID,
} from '../src/lib/platform/wave-xq-brand-dossier-dual-write-off';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XQ: phase1-dossier PG-only in core (offline dual-write OFF) + diff↔attach TZ cross-links.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-206-wave-xq-dossier-core.spec.ts
 */
test.describe('core-206: wave XQ dossier core PG-only', () => {
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;
  const ORDER = PLATFORM_CORE_DEMO.demoOrderId;

  test('W2 article: offline-blocked banner + diff↔attach TZ cross strip', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto(
      `/brand/production/workshop2/c/${COLLECTION}/a/${ARTICLE}?w2sec=general`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const banner = page.getByTestId(WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID);
    await expect(banner).toBeVisible({ timeout: 45_000 });
    await expect(banner).toContainText(/офлайн/i);
    await expect(banner).toContainText(/PostgreSQL/i);

    await expect(page.getByTestId('brand-dossier-factory-diff-panel')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId(BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID)).toBeVisible();
    await expect(page.getByTestId('brand-op-attach-tz-po-link')).toBeVisible();
    await expect(page.getByTestId('brand-op-attach-tz-pdf-peer-link')).toBeVisible();
  });

  test('brand OP order: attach TZ strip cross-links back to diff viewer', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto(
      `/brand/b2b-orders/${encodeURIComponent(ORDER)}?collection=${COLLECTION}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-op-attach-tz-po-strip')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId(BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LINK_TESTID)).toBeVisible();
    await expect(page.getByTestId('brand-op-attach-tz-po-link')).toBeVisible();
  });

  test('dossier storage map fail-closed: no LS key write contract via health', async ({
    request,
  }) => {
    const res = await request.get('/api/workshop2/platform-core/health');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { platformCoreMode?: boolean; pgReachable?: boolean };
    expect(json.platformCoreMode).toBe(true);
  });
});
