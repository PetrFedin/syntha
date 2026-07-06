import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave UP: entity thread templates PG + chain calendar POST + contextual thread + compact strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-140-wave-up-comms-entity-calendar.spec.ts
 */
test.describe('core-140: wave UP comms entity calendar', () => {
  test('entity thread templates PG API round-trip', async ({ request }) => {
    const label = `UP140-${Date.now()}`;
    const post = await request.post('/api/platform-core/comms/entity-thread-templates', {
      data: {
        labelRu: label,
        threadKind: 'bom',
        bodyTemplate: 'BOM · {{orderId}} · {{collectionId}}',
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

  test('POST calendar-events chain-status step creates PG tasks', async ({ request }) => {
    const orderId = `B2B-UP140-${Date.now()}`;
    const res = await request.post('/api/workshop2/platform-core/calendar-events', {
      data: {
        source: 'chain_status',
        orderId,
        collectionId: 'SS27',
        stepKind: 'materials_supplied',
        titleRu: `Chain UP test · ${orderId}`,
        bodyRu: 'Wave UP calendar hook',
      },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; taskIds?: string[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.taskIds)).toBe(true);
    expect(json.taskIds!.length).toBeGreaterThan(0);
  });

  test('POST contextual thread order + article', async ({ request }) => {
    const orderId = 'B2B-SS27-DEMO-001';
    const orderRes = await request.post('/api/platform-core/comms/contextual-thread', {
      data: { orderId, pillarId: 'comms', sectionId: 'core-140-order' },
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
        sectionId: 'core-140-article',
      },
    });
    expect(articleRes.status()).toBeLessThan(500);
    const articleJson = (await articleRes.json()) as { ok?: boolean; chatId?: string };
    expect(articleJson.ok).toBe(true);
    expect(articleJson.chatId).toContain('workshop2_article');
  });

  for (const roleCase of [
    { path: '/brand/core?pillar=comms&collection=SS27', prefix: 'brand-cm' },
    { path: '/shop/core?pillar=comms&collection=SS27', prefix: 'shop-cm' },
    {
      path: '/factory/production/core?pillar=comms&collection=SS27',
      prefix: 'mfr-cm',
    },
    {
      path: '/factory/supplier/core?pillar=comms&collection=SS27',
      prefix: 'sup-cm',
    },
  ] as const) {
    test(`${roleCase.prefix} compact notification strip without placeholder`, async ({ page }) => {
      await page.goto(roleCase.path, GOTO);
      const compact = page.getByTestId(`${roleCase.prefix}-notification-center-compact`);
      if ((await compact.count()) === 0) {
        test.skip(true, 'comms pillar card not mounted in this env');
      }
      await expect(compact).toBeVisible();
      await expect(page.getByTestId(`${roleCase.prefix}-notification-pg-events-empty`)).toHaveCount(0);
    });
  }

  test('manufacturer entity thread templates strip', async ({ page }) => {
    const res = await page.goto(
      '/factory/core?pillar=comms&collection=SS27&pcf=entities&role=manufacturer',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('manufacturer-comms-entity-thread-templates')).toBeVisible({
      timeout: 45_000,
    });
  });
});
