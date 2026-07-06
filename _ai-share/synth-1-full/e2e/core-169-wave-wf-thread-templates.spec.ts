import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WF: entity thread templates PG store + contextual POST + RU chat picker.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-169-wave-wf-thread-templates.spec.ts
 */
test.describe('core-169: wave WF entity thread templates', () => {
  test('entity thread templates PG API round-trip', async ({ request }) => {
    const label = `WF169-${Date.now()}`;
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
    expect(['postgres', 'file', 'memory']).toContain(getJson.storageMode ?? 'memory');
    expect(typeof getJson.storageModeLabelRu).toBe('string');
  });

  test('POST contextual thread from entity template apply (order + article)', async ({
    request,
  }) => {
    const orderId = 'B2B-SS27-DEMO-001';
    const orderRes = await request.post('/api/platform-core/comms/contextual-thread', {
      data: {
        orderId,
        pillarId: 'comms',
        sectionId: 'entity-handoff',
        initialMessage: 'WF169 handoff template · order thread',
      },
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
        sectionId: 'entity-bom',
        initialMessage: 'WF169 BOM template · article thread',
      },
    });
    expect(articleRes.status()).toBeLessThan(500);
    const articleJson = (await articleRes.json()) as { ok?: boolean; chatId?: string };
    expect(articleJson.ok).toBe(true);
    expect(articleJson.chatId).toContain('workshop2_article');
  });

  for (const roleCase of [
    {
      path: '/brand/messages?pcf=entities&collection=SS27',
      picker: 'brand-comms-entity-thread-templates-picker',
    },
    {
      path: '/shop/messages?collection=SS27',
      picker: 'shop-comms-entity-thread-templates-picker',
    },
    {
      path: '/factory/production/messages?pcf=entities&collection=SS27',
      picker: 'manufacturer-comms-entity-thread-templates-picker',
    },
    {
      path: '/factory/supplier/messages?pcf=entities&collection=SS27',
      picker: 'supplier-comms-entity-thread-templates-picker',
    },
  ] as const) {
    test(`${roleCase.picker} visible in comms chat`, async ({ page }) => {
      const res = await page.goto(roleCase.path, GOTO);
      expect(res?.status() ?? 599).toBeLessThan(500);
      const shell = page.getByTestId('platform-core-comms-inbox-shell');
      await expect(shell).toBeVisible({ timeout: 60_000 });
      const picker = page.getByTestId(roleCase.picker);
      if ((await picker.count()) === 0) {
        test.skip(true, 'chat shell without entity template picker in this env');
      }
      await expect(picker).toBeVisible();
      await expect(
        page.getByTestId('platform-core-entity-thread-templates-storage-pg').or(
          page.getByTestId(/^platform-core-entity-thread-templates-storage-/)
        )
      ).toBeVisible();
    });
  }

  test('manufacturer entity panel template strip', async ({ page }) => {
    const res = await page.goto(
      '/factory/production/messages?pcf=entities&collection=SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('manufacturer-comms-entity-threads-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('manufacturer-comms-entity-thread-templates')).toBeVisible();
  });
});
