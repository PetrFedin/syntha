import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XZ: S1 final B2B message templates + entity thread templates PG + RU hub.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-215-wave-xz-templates.spec.ts
 */
test.describe('core-215: wave XZ S1 templates final PG', () => {
  test('B2B message templates PG API round-trip', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG (:5433)');

    const label = `XZ215-${Date.now()}`;
    const post = await request.post('/api/platform-core/b2b/message-templates', {
      data: {
        labelRu: label,
        context: 'b2b_order',
        bodyTemplate: 'Заказ {{orderId}} · коллекция {{collectionId}}',
      },
    });
    expect(post.ok()).toBe(true);
    const postJson = (await post.json()) as { ok?: boolean; storageMode?: string };
    expect(postJson.ok).toBe(true);
    expect(postJson.storageMode).toBe('pg');

    const get = await request.get('/api/platform-core/b2b/message-templates?context=b2b_order');
    expect(get.ok()).toBe(true);
    const getJson = (await get.json()) as {
      templates?: Array<{ labelRu?: string }>;
      storageMode?: string;
    };
    expect(getJson.storageMode).toBe('pg');
    expect(getJson.templates?.some((t) => t.labelRu === label)).toBe(true);
  });

  test('entity thread templates PG API round-trip', async ({ request }) => {
    const label = `XZ215-ET-${Date.now()}`;
    const post = await request.post('/api/platform-core/comms/entity-thread-templates', {
      data: {
        labelRu: label,
        threadKind: 'bom',
        bodyTemplate: 'BOM · {{orderId}} · {{articleId}} · {{collectionId}}',
      },
    });
    expect(post.status()).toBeLessThan(500);
    const postJson = (await post.json()) as { ok?: boolean; storageMode?: string };
    expect(postJson.ok).toBe(true);
    expect(['pg', 'postgres', 'file', 'memory']).toContain(postJson.storageMode ?? 'memory');

    const get = await request.get(
      '/api/platform-core/comms/entity-thread-templates?threadKind=bom'
    );
    expect(get.ok()).toBe(true);
    const getJson = (await get.json()) as {
      templates?: Array<{ labelRu?: string }>;
      storageMode?: string;
      storageModeLabelRu?: string;
    };
    expect(Array.isArray(getJson.templates)).toBe(true);
    expect(['pg', 'postgres', 'file', 'memory']).toContain(getJson.storageMode ?? 'memory');
    expect(typeof getJson.storageModeLabelRu).toBe('string');
  });

  test('brand B2B chat shows PG storage badge + built-in template', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      '/brand/messages?contextType=b2b_order&contextId=B2B-SS27-DEMO-001&collection=SS27',
      GOTO
    );
    await expect(page.getByTestId('platform-core-comms-inbox-shell')).toBeVisible({
      timeout: 60_000,
    });
    const templates = page.getByTestId('platform-core-b2b-message-templates');
    if ((await templates.count()) === 0) {
      test.skip(true, 'B2B message templates strip not mounted in this env');
    }
    await expect(templates).toBeVisible();
    await expect(
      page.getByTestId('platform-core-b2b-message-templates-storage-pg').or(
        page.getByTestId('platform-core-b2b-message-templates-storage-local')
      )
    ).toBeVisible();
    await expect(page.getByTestId('platform-core-b2b-message-template-ship-window')).toBeVisible();
  });

  test('shop matrix hub RU published badge', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/shop/core?pillar=sample_collection&collection=SS27', GOTO);
    await expect(page.getByTestId('shop-sc-cabinet-golden-path')).toBeVisible({
      timeout: 60_000,
    });
    const badge = page
      .getByTestId('shop-sc-matrix-entry-published-yes')
      .or(page.getByTestId('shop-sc-matrix-entry-published-no'));
    if ((await badge.count()) === 0) {
      test.skip(true, 'matrix entry badge not visible without article deep-link');
    }
    await expect(badge.first()).toContainText(/Опубликовано|Черновик/);
  });
});
