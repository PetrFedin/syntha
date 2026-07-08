import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };
const FACTORY_ID = 'fact-1';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

test.describe('core-12: bulk accept в реестре production-orders', () => {
  // Полный интерактивный путь: core-03 (handoff UI) → registry bulk → этот spec (toolbar hidden).
  test('toolbar + checkbox при pending_erp', async ({ page, request }) => {
    const queueRes = await request.get(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${FACTORY_ID}`
    );
    test.skip(!queueRes.ok(), 'нужен db:core:bootstrap');
    const queue = (await queueRes.json()) as {
      items?: Array<{ b2bOrderId: string; status: string; productionOrderId: string }>;
    };
    const pending = (queue.items ?? []).filter((i) => i.status === 'pending_erp');
    test.skip(
      pending.length === 0,
      'нет pending_erp (норма после приёмки — interactive seed для полного прогона)'
    );

    const res = await page.goto('/factory/production/orders?pillarCapabilityFeature=orders', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('factory-production-orders-core')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('factory-production-orders-bulk-toolbar')).toBeVisible();
    await expect(page.getByTestId('factory-production-orders-select-all')).toBeVisible();

    const demoPending = pending.find((i) => i.b2bOrderId === DEMO_ORDER) ?? pending[0]!;
    const rowSelect = page.getByTestId(`factory-production-order-select-${demoPending.b2bOrderId}`);
    if (await rowSelect.isVisible().catch(() => false)) {
      await rowSelect.click();
    } else {
      await page.getByTestId('factory-production-orders-select-all').click();
    }

    const bulkResponse = page.waitForResponse(
      (r) =>
        r.url().includes('/production-handoff-queue/bulk-acknowledge') &&
        r.request().method() === 'POST'
    );
    await page.getByTestId('factory-production-orders-bulk-accept').click();
    const bulkRes = await bulkResponse;
    expect(bulkRes.ok()).toBeTruthy();

    const statusBadge = page.getByTestId(
      `factory-production-order-status-${demoPending.b2bOrderId}`
    );
    await expect(statusBadge).toBeVisible({ timeout: 30_000 });
    await expect(statusBadge).not.toHaveText(/очереди цеха/i);
  });

  test('toolbar скрыт когда все серии приняты', async ({ page, request }) => {
    const queueRes = await request.get(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${FACTORY_ID}`
    );
    test.skip(!queueRes.ok(), 'нужен db:core:bootstrap');
    const queue = (await queueRes.json()) as { items?: Array<{ status: string }> };
    const pending = (queue.items ?? []).filter((i) => i.status === 'pending_erp');
    test.skip(pending.length > 0, 'только когда нет pending_erp');

    const res = await page.goto('/factory/production/orders?pillarCapabilityFeature=orders', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('factory-production-orders-core')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('factory-production-orders-bulk-toolbar')).toHaveCount(0);
  });
});
