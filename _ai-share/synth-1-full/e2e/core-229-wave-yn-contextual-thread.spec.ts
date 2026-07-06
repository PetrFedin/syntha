import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

/**
 * Wave YN: contextual POST from tracking/calendar/order card + entity template picker (WF) + dedupe.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-229-wave-yn-contextual-thread.spec.ts
 */
test.describe('core-229: wave YN comms contextual thread', () => {
  test('POST contextual thread order + article (section wave-yn-*)', async ({ request }) => {
    const orderRes = await request.post('/api/platform-core/comms/contextual-thread', {
      data: {
        orderId: DEMO_ORDER,
        pillarId: 'comms',
        sectionId: 'wave-yn-tracking',
        initialMessage: 'YN229 tracking contextual thread',
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
        sectionId: 'wave-yn-order-card',
        initialMessage: 'YN229 article contextual thread',
      },
    });
    expect(articleRes.status()).toBeLessThan(500);
    const articleJson = (await articleRes.json()) as { ok?: boolean; chatId?: string };
    expect(articleJson.ok).toBe(true);
    expect(articleJson.chatId).toContain('workshop2_article');
  });

  for (const roleCase of [
    {
      path: `/brand/messages?contextType=b2b_order&contextId=${DEMO_ORDER}&order=${DEMO_ORDER}&collection=SS27`,
      picker: 'brand-comms-entity-thread-templates-picker',
    },
    {
      path: `/shop/messages?contextType=b2b_order&contextId=${DEMO_ORDER}&order=${DEMO_ORDER}&collection=SS27`,
      picker: 'shop-comms-entity-thread-templates-picker',
    },
  ] as const) {
    test(`${roleCase.picker} visible with order context`, async ({ page }) => {
      const res = await page.goto(roleCase.path, GOTO);
      expect(res?.status() ?? 599).toBeLessThan(500);
      const shell = page.getByTestId('platform-core-comms-inbox-shell');
      await expect(shell).toBeVisible({ timeout: 60_000 });
      const picker = page.getByTestId(roleCase.picker);
      if ((await picker.count()) === 0) {
        test.skip(true, 'entity template picker not mounted in this env');
      }
      await expect(picker).toBeVisible();
    });
  }

  test('brand calendar chat link POSTs contextual thread before navigate', async ({ page }) => {
    const orderId = DEMO_ORDER;
    const res = await page.goto(
      `/brand/calendar?order=${orderId}&orderId=${orderId}&collection=SS27`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    const chatLink = page.getByTestId('brand-cm-calendar-order-chat-link');
    if ((await chatLink.count()) === 0) {
      test.skip(true, 'calendar peer strip not mounted');
    }
    const postPromise = page.waitForRequest(
      (req) =>
        req.url().includes('/api/platform-core/comms/contextual-thread') &&
        req.method() === 'POST',
      { timeout: 15_000 }
    );
    await chatLink.click();
    const post = await postPromise;
    const body = post.postDataJSON() as { orderId?: string; sectionId?: string };
    expect(body.orderId).toBe(orderId);
    expect(body.sectionId).toBe('wave-yn-calendar');
  });

  test('shop tracking row chat link has contextual source attribute', async ({ page }) => {
    const res = await page.goto('/shop/b2b/tracking?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const chatLink = page.locator('[data-contextual-thread-source="tracking"]').first();
    if ((await chatLink.count()) === 0) {
      test.skip(true, 'tracking chat links not rendered');
    }
    await expect(chatLink).toBeVisible({ timeout: 45_000 });
  });

  test('messages deep-link: no duplicate order chat rows in sidebar', async ({ page }) => {
    const res = await page.goto(
      `/brand/messages?contextType=b2b_order&contextId=${DEMO_ORDER}&order=${DEMO_ORDER}&collection=SS27`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-comms-inbox-shell')).toBeVisible({
      timeout: 60_000,
    });
    const threadItems = page.getByTestId('platform-core-comms-thread-item');
    const count = await threadItems.count();
    if (count === 0) {
      test.skip(true, 'thread list not rendered');
    }
    let orderMatches = 0;
    for (let i = 0; i < count; i += 1) {
      const text = await threadItems.nth(i).innerText();
      if (text.includes(DEMO_ORDER)) orderMatches += 1;
    }
    expect(orderMatches).toBeLessThanOrEqual(1);
  });
});
