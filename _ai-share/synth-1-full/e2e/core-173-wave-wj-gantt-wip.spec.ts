import { test, expect } from '@playwright/test';

/**
 * Wave WJ: mfr production_orders Gantt/WIP timeline PG + handoff SoT dedup.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-173-wave-wj-gantt-wip.spec.ts
 */
test.describe('core-173: wave WJ mfr Gantt WIP', () => {
  test('production orders timeline PG read API', async ({ request }) => {
    const res = await request.get(
      '/api/workshop2/manufacturer/production-orders-timeline?factoryId=fact-1&limit=5'
    );
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as {
      ok?: boolean;
      storageModeLabelRu?: string;
      timeline?: {
        rows?: unknown[];
        storageMode?: string;
        storageModeLabelRu?: string;
        source?: string;
        messageRu?: string;
      };
    };
    expect(Array.isArray(json.timeline?.rows)).toBe(true);
    expect(typeof json.timeline?.messageRu).toBe('string');
    expect(json.timeline?.source).toBe('handoff_queue');
    expect(typeof json.storageModeLabelRu).toBe('string');
    expect(json.storageModeLabelRu).toMatch(/WIP ·/);
    if (json.timeline?.storageMode) {
      expect(['postgres', 'file', 'memory']).toContain(json.timeline.storageMode);
    }
  });

  test('mfr OP cabinet shows WIP Gantt strip + handoff SoT', async ({ page }) => {
    await page.goto('/factory/core?collection=SS27');
    await expect(page.getByTestId('mfr-op-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    const gantt = page.getByTestId('mfr-op-wip-gantt-strip');
    const empty = page.getByTestId('mfr-op-wip-gantt-empty');
    await expect(gantt.or(empty)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-op-wip-gantt-handoff-sot-strip')).toBeVisible();
    await expect(page.getByTestId('mfr-op-wip-gantt-handoff-sot-link')).toBeVisible();
    await expect(page.getByTestId('mfr-op-queue-snippet')).toHaveCount(0);
  });

  test('production orders registry shows WIP Gantt + SoT strip', async ({ page }) => {
    await page.goto('/factory/production/orders?collection=SS27');
    await expect(page.getByTestId('factory-production-orders-core')).toBeVisible({
      timeout: 60_000,
    });
    const gantt = page.getByTestId('mfr-op-wip-gantt-strip');
    const empty = page.getByTestId('mfr-op-wip-gantt-empty');
    await expect(gantt.or(empty)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-op-wip-gantt-handoff-sot-strip')).toBeVisible();
  });

  test('handoff panel links to registry Gantt (no duplicate WIP list)', async ({ page }) => {
    await page.goto('/factory/production?collection=SS27');
    await expect(page.getByTestId('mfr-op-handoff-queue-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-op-handoff-wip-gantt-sot-strip')).toBeVisible();
    await expect(page.getByTestId('mfr-op-handoff-wip-gantt-sot-link')).toBeVisible();
  });
});
