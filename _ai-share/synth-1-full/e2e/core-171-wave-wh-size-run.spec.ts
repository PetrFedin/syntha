import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WH: matrix size run validation API (PG) + RU hints + matrix↔checkout cross-links.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-171-wave-wh-size-run.spec.ts
 */
test.describe('core-171: wave WH matrix size run validation', () => {
  test('size-run validate batch POST flags MOQ (PG)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const postRes = await request.post('/api/shop/b2b/matrix/size-run-validate', {
      data: {
        collectionId: 'SS27',
        articles: [{ articleId: 'demo-ss27-01', qtyBySize: { M: 1 } }],
      },
    });
    expect(postRes.ok()).toBe(true);
    const postJson = (await postRes.json()) as {
      ok?: boolean;
      messageRu?: string;
      firstFailedArticleId?: string;
      results?: Array<{ articleId: string; ok: boolean }>;
    };
    expect(typeof postJson.messageRu).toBe('string');
    expect(Array.isArray(postJson.results)).toBe(true);
    if (postJson.ok === false) {
      expect(postJson.firstFailedArticleId).toBe('demo-ss27-01');
    }
  });

  test('size-run validate sessionId POST (PG cart)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const sessionId = `core171-cart-${Date.now()}`;
    const upsertRes = await request.post('/api/shop/b2b/cart/lines', {
      data: {
        sessionId,
        buyerId: 'shop1',
        tier: 'standard',
        line: {
          collectionId: 'SS27',
          articleId: 'demo-ss27-01',
          colorCode: 'default',
          size: 'M',
          qty: 1,
          wholesalePriceRub: 1000,
          moq: 6,
        },
      },
    });
    expect(upsertRes.ok()).toBe(true);

    const validateRes = await request.post('/api/shop/b2b/matrix/size-run-validate', {
      data: { collectionId: 'SS27', sessionId },
    });
    expect(validateRes.ok()).toBe(true);
    const validateJson = (await validateRes.json()) as { ok?: boolean; results?: unknown[] };
    expect(Array.isArray(validateJson.results)).toBe(true);
  });

  test('checkout preflight exposes sizeRunViolations when MOQ fails', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const sessionId = `core171-preflight-${Date.now()}`;
    await request.post('/api/shop/b2b/cart/lines', {
      data: {
        sessionId,
        buyerId: 'shop1',
        tier: 'standard',
        line: {
          collectionId: 'SS27',
          articleId: 'demo-ss27-01',
          colorCode: 'default',
          size: 'M',
          qty: 6,
          wholesalePriceRub: 1000,
          moq: 6,
        },
      },
    });

    const preflightRes = await request.get(
      `/api/shop/b2b/cart/lines?sessionId=${encodeURIComponent(sessionId)}&preflight=1`
    );
    expect(preflightRes.ok()).toBe(true);
    const json = (await preflightRes.json()) as {
      preflight?: {
        ready?: boolean;
        sizeRunViolations?: Array<{ articleId: string }>;
        firstFailedSizeRunArticleId?: string;
      };
    };
    expect(json.preflight?.ready).toBe(false);
    expect(json.preflight?.sizeRunViolations?.length).toBeGreaterThan(0);
  });

  test('matrix UI: low qty shows size-run hint and blocks checkout CTA', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const res = await page.goto('/shop/b2b/matrix?collection=SS27&article=demo-ss27-01', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-matrix-shell')).toBeVisible({ timeout: 60_000 });

    const qtyInput = page
      .locator('[data-testid="shop-co-matrix-qty-demo-ss27-01-M"], [data-testid^="shop-co-matrix-qty-"]')
      .first();
    await expect(qtyInput).toBeVisible({ timeout: 45_000 });
    await qtyInput.fill('6');
    await qtyInput.blur();

    await expect(page.getByTestId('shop-co-matrix-size-run-hint')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('shop-co-matrix-to-checkout')).toBeDisabled();
  });

  test('checkout UI: size-run hint links back to matrix article', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const sessionId = `core171-ui-${Date.now()}`;
    await request.post('/api/shop/b2b/cart/lines', {
      data: {
        sessionId,
        buyerId: 'shop1',
        tier: 'standard',
        line: {
          collectionId: 'SS27',
          articleId: 'demo-ss27-01',
          colorCode: 'default',
          size: 'M',
          qty: 6,
          wholesalePriceRub: 1000,
          moq: 6,
        },
      },
    });

    const res = await page.goto(
      `/shop/b2b/checkout?collection=SS27&cartSession=${encodeURIComponent(sessionId)}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-checkout-size-run-hint')).toBeVisible({
      timeout: 60_000,
    });
    const matrixLink = page.getByTestId('shop-co-checkout-size-run-matrix-link');
    await expect(matrixLink).toBeVisible({ timeout: 30_000 });
    await expect(matrixLink).toHaveAttribute('href', /article=demo-ss27-01/);
    await expect(page.getByTestId('shop-co-checkout-confirm')).toBeDisabled();
  });
});
