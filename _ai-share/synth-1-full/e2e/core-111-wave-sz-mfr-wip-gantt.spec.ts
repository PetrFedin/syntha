import { test, expect } from '@playwright/test';

/**
 * Wave SZ: mfr OP WIP Gantt — production_orders timeline from PG.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-111-wave-sz-mfr-wip-gantt.spec.ts
 */
test.describe('core-111: wave SZ mfr WIP Gantt', () => {
  test('production orders timeline API', async ({ request }) => {
    const res = await request.get(
      '/api/workshop2/manufacturer/production-orders-timeline?factoryId=fact-1&limit=5'
    );
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as {
      ok?: boolean;
      timeline?: { rows?: unknown[]; storageMode?: string; messageRu?: string };
    };
    expect(Array.isArray(json.timeline?.rows)).toBe(true);
    expect(typeof json.timeline?.messageRu).toBe('string');
    if (json.timeline?.storageMode) {
      expect(['postgres', 'file', 'memory']).toContain(json.timeline.storageMode);
    }
  });

  test('mfr OP cabinet shows WIP Gantt strip', async ({ page }) => {
    await page.goto('/factory/core?collection=SS27');
    await expect(page.getByTestId('mfr-op-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    const gantt = page.getByTestId('mfr-op-wip-gantt-strip');
    const empty = page.getByTestId('mfr-op-wip-gantt-empty');
    await expect(gantt.or(empty)).toBeVisible({ timeout: 30_000 });
  });

  test('production orders registry shows WIP Gantt', async ({ page }) => {
    await page.goto('/factory/production/orders?collection=SS27');
    await expect(page.getByTestId('factory-production-orders-core')).toBeVisible({
      timeout: 60_000,
    });
    const gantt = page.getByTestId('mfr-op-wip-gantt-strip');
    const empty = page.getByTestId('mfr-op-wip-gantt-empty');
    await expect(gantt.or(empty)).toBeVisible({ timeout: 30_000 });
  });
});
