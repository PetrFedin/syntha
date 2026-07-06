import { test, expect } from '@playwright/test';

/**
 * Wave UH: entity thread templates PG + chain calendar POST + contextual thread.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-134-wave-uh-comms-threads.spec.ts
 */
test.describe('core-134: wave UH comms threads calendar', () => {
  test('entity thread templates PG API', async ({ request }) => {
    const res = await request.get(
      '/api/platform-core/comms/entity-thread-templates?threadKind=bom'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      storageMode?: string;
      templates?: unknown[];
      storageModeLabelRu?: string;
    };
    if (json.storageMode) expect(['postgres', 'file', 'memory']).toContain(json.storageMode);
    expect(Array.isArray(json.templates)).toBe(true);
    expect(typeof json.storageModeLabelRu).toBe('string');
  });

  test('POST calendar-events chain-status step', async ({ request }) => {
    const orderId = `B2B-UH134-${Date.now()}`;
    const res = await request.post('/api/workshop2/platform-core/calendar-events', {
      data: {
        source: 'chain_status',
        orderId,
        collectionId: 'SS27',
        stepKind: 'chain_status',
        titleRu: `Chain UH test · ${orderId}`,
        bodyRu: 'Wave UH calendar hook',
      },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; taskIds?: string[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.taskIds)).toBe(true);
  });

  test('POST contextual thread order + article', async ({ request }) => {
    const orderId = 'B2B-SS27-DEMO-001';
    const orderRes = await request.post('/api/platform-core/comms/contextual-thread', {
      data: { orderId, pillarId: 'comms', sectionId: 'core-134-order' },
    });
    expect(orderRes.status()).toBeLessThan(500);
    const orderJson = (await orderRes.json()) as { ok?: boolean; chatId?: string };
    expect(orderJson.ok).toBe(true);
    expect(typeof orderJson.chatId).toBe('string');

    const articleRes = await request.post('/api/platform-core/comms/contextual-thread', {
      data: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        pillarId: 'comms',
        sectionId: 'core-134-article',
      },
    });
    expect(articleRes.status()).toBeLessThan(500);
    const articleJson = (await articleRes.json()) as { ok?: boolean; chatId?: string };
    expect(articleJson.ok).toBe(true);
    expect(articleJson.chatId).toContain('workshop2_article');
  });

  test('brand comms pillar compact notification strip', async ({ page }) => {
    const res = await page.goto('/brand/core?pillar=comms&collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-cm-notification-center-compact')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('manufacturer entity threads template strip', async ({ page }) => {
    const res = await page.goto(
      '/factory/core?pillar=comms&collection=SS27&pcf=entities&role=manufacturer',
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('manufacturer-comms-entity-threads-panel')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('manufacturer-comms-entity-thread-templates')).toBeVisible();
  });
});
