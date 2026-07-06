import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

/**
 * Wave YL: brand dossier inline diff compact RU + locked badge ↔ attach TZ cross-links + UN/VQ dedupe.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-227-wave-yl-dossier-diff.spec.ts
 */
test.describe('core-227: wave YL brand dossier diff viewer', () => {
  const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;

  test('W2 dev — compact diff panel + attach TZ cross-strip (brand-dev context)', async ({
    page,
  }) => {
    await page.goto(
      `/brand/production/workshop2/c/${COLLECTION}/a/${ARTICLE}?w2sec=general`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );

    const panel = page.getByTestId('brand-dossier-factory-diff-panel');
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-dossier-factory-diff-panel-compact')).toBeAttached();
    await expect(panel.getByTestId('brand-dossier-factory-diff-brand-col')).toContainText(/Бренд/);
    await expect(panel.getByTestId('brand-dossier-factory-diff-factory-col')).toContainText(/Цех/);
    await expect(page.getByTestId('brand-dossier-diff-attach-tz-po-cross-strip')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-attach-tz-po-link')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('brand-dossier-factory-diff-strip')).toHaveCount(0);
  });

  test('brand OP order — locked cross-links + compact diff without duplicate attach TZ in panel', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/brand/b2b-orders/${encodeURIComponent(DEMO_ORDER)}?pillar=order_production&collection=${COLLECTION}#production-dossier`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );

    await expect(page.getByTestId('brand-op-dossier-card')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-op-dossier-locked-badge')).toBeVisible({
      timeout: 15_000,
    });

    const lockedCross = page.getByTestId('brand-op-dossier-locked-cross-strip');
    await expect(lockedCross).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('brand-op-dossier-locked-diff-link')).toBeVisible();
    await expect(page.getByTestId('brand-op-dossier-locked-attach-tz-link')).toBeVisible();

    const diffWrap = page.getByTestId('brand-op-dossier-factory-diff-wrap');
    await expect(diffWrap).toBeVisible({ timeout: 15_000 });
    await expect(diffWrap.getByTestId('brand-dossier-factory-diff-panel')).toBeVisible();
    await expect(diffWrap.getByTestId('brand-dossier-diff-attach-tz-po-cross-strip')).toHaveCount(
      0
    );
    await expect(diffWrap.getByTestId('brand-dossier-factory-diff-peer-strip')).toBeVisible();
    await expect(diffWrap.getByTestId('brand-op-attach-tz-po-link')).toHaveCount(0);

    await expect(page.getByTestId('brand-op-attach-tz-pdf-peer-strip')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-attach-tz-pdf-peer-strip').getByTestId('brand-op-attach-tz-po-link')).toBeVisible();
    await expect(page.getByTestId('brand-order-w2-dossier-diff-summary')).toHaveCount(0);
  });
});
