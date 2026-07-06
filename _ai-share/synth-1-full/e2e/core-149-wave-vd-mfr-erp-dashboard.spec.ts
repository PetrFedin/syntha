import { test, expect } from '@playwright/test';

const FACTORY_ID = 'fact-1';
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };

/**
 * Wave VD: mfr ERP retry dashboard + failed PO queue filter + registry SoT dedup.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-149-wave-vd-mfr-erp-dashboard.spec.ts
 */
test.describe('core-149: wave VD mfr ERP dashboard', () => {
  test('handoff queue: registry SoT strip + failed PO filter toggle', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/factory/production?collection=SS27&factoryId=${FACTORY_ID}&pcf=handoff`,
      GOTO
    );
    await expect(page.getByTestId('mfr-op-handoff-queue-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-op-handoff-queue-registry-sot-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-op-handoff-queue-registry-sot-link')).toBeVisible();

    const filter = page.getByTestId('mfr-op-handoff-failed-po-filter');
    if ((await filter.count()) > 0) {
      await expect(filter).toBeVisible();
      await expect(page.getByTestId('mfr-op-handoff-failed-po-filter-toggle')).toBeVisible();
      await page.getByTestId('mfr-op-handoff-failed-po-filter-toggle').click();
      await expect(page).toHaveURL(/failedPo=1/);
    }
  });

  test('manufacturer cabinet: ERP retry dashboard strip when attention rows exist', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const queueRes = await request.get(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${FACTORY_ID}`
    );
    test.skip(!queueRes.ok(), 'handoff queue недоступен');

    await page.goto('/factory/core?pillar=order_production&collection=SS27', GOTO);
    await expect(page.getByTestId('mfr-op-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const dashboard = page.getByTestId('mfr-op-erp-retry-dashboard-strip');
    if ((await dashboard.count()) > 0) {
      await expect(dashboard).toBeVisible();
      await expect(page.getByTestId('mfr-op-erp-retry-dashboard-count')).toBeVisible();
      await expect(page.getByTestId('mfr-op-erp-retry-dashboard-bulk-retry-btn')).toBeVisible();
      await expect(page.getByTestId('mfr-op-erp-retry-dashboard-hint')).toContainText('3');
    }
  });

  test('production orders: bulk-ack SoT strip points to handoff queue (no duplicate ack)', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const queueRes = await request.get(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${FACTORY_ID}`
    );
    test.skip(!queueRes.ok(), 'handoff queue недоступен');
    const queue = (await queueRes.json()) as { items?: Array<{ status: string }> };
    const hasPending = (queue.items ?? []).some((i) => i.status === 'pending_erp');
    test.skip(!hasPending, 'нет pending PO для SoT strip');

    await page.goto(
      `/factory/production/orders?collection=SS27&factoryId=${FACTORY_ID}`,
      GOTO
    );
    await expect(page.getByTestId('factory-production-orders-core')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('factory-production-orders-bulk-sot-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('factory-production-orders-bulk-sot-handoff-link')).toBeVisible();
    await expect(page.getByTestId('factory-production-orders-bulk-accept')).toHaveCount(0);
  });
});
