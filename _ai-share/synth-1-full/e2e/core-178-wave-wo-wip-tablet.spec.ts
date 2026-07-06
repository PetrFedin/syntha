import { test, expect } from '@playwright/test';

const FACTORY_ID = 'fact-1';
const COLLECTION = 'SS27';

/**
 * Wave WO: mfr floor tablet WIP PATCH + PG wip_status + UL/WJ handoff/Gantt SoT dedup.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-178-wave-wo-wip-tablet.spec.ts
 */
test.describe('core-178: wave WO mfr WIP floor tablet', () => {
  test('WIP status PATCH from floor tablet API returns wipStatus', async ({ request }) => {
    const queueRes = await request.get(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${FACTORY_ID}`
    );
    test.skip(!queueRes.ok(), 'handoff queue недоступен');
    const queue = (await queueRes.json()) as {
      items?: Array<{
        productionOrderId: string;
        collectionId: string;
        articleId: string;
        status: string;
        wipStatus?: string;
        mesReleaseStage?: string;
      }>;
    };
    const row = queue.items?.find((i) => i.status === 'synced') ?? queue.items?.[0];
    test.skip(!row, 'нет PO в очереди');

    const patch = await request.patch(
      `/api/workshop2/manufacturer/production-orders/${encodeURIComponent(row.productionOrderId)}/wip-status`,
      {
        data: {
          factoryId: FACTORY_ID,
          collectionId: row.collectionId,
          articleId: row.articleId,
          advance: row.status === 'synced',
        },
      }
    );
    if (row.status !== 'synced') {
      expect([409, 403]).toContain(patch.status());
      return;
    }
    expect(patch.ok()).toBeTruthy();
    const json = (await patch.json()) as { ok?: boolean; wipStatus?: string; stage?: string };
    expect(json.ok).toBe(true);
    expect(typeof (json.wipStatus ?? json.stage)).toBe('string');
  });

  test('handoff queue exposes wipStatus from PG', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${FACTORY_ID}`
    );
    test.skip(!res.ok(), 'handoff queue недоступен');
    const json = (await res.json()) as {
      items?: Array<{ wipStatus?: string; mesReleaseStage?: string }>;
    };
    const row = json.items?.[0];
    test.skip(!row, 'нет PO');
    expect(typeof (row.wipStatus ?? row.mesReleaseStage)).toBe('string');
  });

  test('mfr OP cabinet shows floor tablet strip + Gantt peer', async ({ page }) => {
    await page.goto(`/factory/core?collection=${COLLECTION}`);
    await expect(page.getByTestId('mfr-op-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    const tablet = page.getByTestId('mfr-op-wip-floor-tablet-strip');
    const gantt = page.getByTestId('mfr-op-wip-gantt-strip');
    const ganttEmpty = page.getByTestId('mfr-op-wip-gantt-empty');
    await expect(tablet.or(gantt).or(ganttEmpty)).toBeVisible({ timeout: 30_000 });
    if (await tablet.isVisible()) {
      await expect(page.getByTestId('mfr-op-wip-floor-gantt-link')).toBeVisible();
      await expect(page.getByTestId('mfr-op-wip-floor-stage-badge')).toBeVisible();
    }
    await expect(page.getByTestId('mfr-op-queue-snippet')).toHaveCount(0);
  });

  test('production orders registry shows floor tablet + handoff SoT dedup', async ({ page }) => {
    await page.goto(`/factory/production/orders?collection=${COLLECTION}`);
    await expect(page.getByTestId('factory-production-orders-core')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-op-wip-gantt-handoff-sot-strip')).toBeVisible();
    const tablet = page.getByTestId('mfr-op-wip-floor-tablet-strip');
    const gantt = page.getByTestId('mfr-op-wip-gantt-strip');
    const ganttEmpty = page.getByTestId('mfr-op-wip-gantt-empty');
    await expect(tablet.or(gantt).or(ganttEmpty)).toBeVisible({ timeout: 30_000 });
  });

  test('handoff panel links to registry for floor tablet PATCH (no duplicate WIP PATCH)', async ({
    page,
  }) => {
    await page.goto(`/factory/production?collection=${COLLECTION}`);
    await expect(page.getByTestId('mfr-op-handoff-queue-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-op-handoff-wip-gantt-sot-strip')).toBeVisible();
    await expect(page.getByTestId('mfr-op-handoff-wip-floor-sot-strip')).toBeVisible();
    await expect(page.getByTestId('mfr-op-handoff-wip-floor-sot-link')).toBeVisible();
    await expect(page.getByTestId('mfr-op-wip-floor-tablet-strip')).toHaveCount(0);
  });
});
