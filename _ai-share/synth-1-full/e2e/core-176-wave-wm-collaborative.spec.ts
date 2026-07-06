import { test, expect } from '@playwright/test';
import { b2bV1ActorBrandHeaders } from './helpers/b2b-v1-api-headers';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WM: shop collaborative real-time WS session + brand co-approve same PG session.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-176-wave-wm-collaborative.spec.ts
 */
test.describe('core-176: wave WM collaborative WS session', () => {
  test('session snapshot exposes matrix + working order hrefs', async ({ request }) => {
    const buyerId = 'shop1';
    const orderId = `B2B-WM176-${Date.now()}`;

    await request.patch('/api/shop/b2b/collaborative/approvals', {
      data: { buyerId, orderId, stepId: 'matrix' },
    });

    const sessionRes = await request.get(
      `/api/shop/b2b/collaborative/session?buyerId=${encodeURIComponent(buyerId)}&orderId=${encodeURIComponent(orderId)}&collection=SS27`
    );
    expect(sessionRes.ok()).toBe(true);
    const sessionJson = (await sessionRes.json()) as {
      ok?: boolean;
      brandCoApprovePortalHref?: string;
      session?: { matrixHref?: string; workingOrderHref?: string; waitingBrandMargin?: boolean };
      storageModeLabelRu?: string;
    };
    expect(sessionJson.ok).toBe(true);
    expect(sessionJson.brandCoApprovePortalHref).toContain('/brand/b2b-orders/');
    expect(sessionJson.session?.matrixHref).toContain('/shop/b2b/matrix');
    expect(sessionJson.session?.workingOrderHref).toContain('/shop/b2b/working-order');
    expect(sessionJson.session?.waitingBrandMargin).toBe(true);
    expect(sessionJson.storageModeLabelRu).toMatch(/PostgreSQL|файл|память/);
  });

  test('brand co-approve syncs journal in shared PG session', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG для journal');

    const buyerId = 'shop1';
    const orderId = `B2B-WM176-PG-${Date.now()}`;

    await request.patch('/api/shop/b2b/collaborative/approvals', {
      data: { buyerId, orderId, stepId: 'matrix' },
    });

    const brandRes = await request.post('/api/brand/b2b/collaborative/approve', {
      headers: b2bV1ActorBrandHeaders,
      data: { buyerId, orderId, brandActorLabel: 'brand' },
    });
    expect(brandRes.ok()).toBe(true);

    const sessionRes = await request.get(
      `/api/shop/b2b/collaborative/session?buyerId=${encodeURIComponent(buyerId)}&orderId=${encodeURIComponent(orderId)}&collection=SS27`
    );
    const sessionJson = (await sessionRes.json()) as {
      journal?: Array<{ eventType?: string }>;
      session?: { waitingBrandMargin?: boolean };
    };
    expect(sessionJson.journal?.some((e) => e.eventType === 'brand_margin_approve')).toBe(true);
    expect(sessionJson.session?.waitingBrandMargin).toBe(false);
  });

  test('shop session panel: live badge + cross-links', async ({ page }) => {
    const res = await page.goto(
      '/shop/b2b/collaborative-order?collection=SS27&pcf=session&order=B2B-SS27-DEMO-001',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-collaborative-order-session-panel')).toBeVisible({
      timeout: 60_000,
    });
    const liveBadge = page
      .getByTestId('shop-collaborative-session-sse-badge')
      .or(page.getByTestId('shop-collaborative-session-poll-badge'));
    await expect(liveBadge.first()).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-collaborative-matrix-link')).toBeVisible();
    await expect(page.getByTestId('shop-collaborative-working-order-versions-link')).toBeVisible();
    await expect(page.getByTestId('shop-collaborative-brand-portal-link')).toBeVisible();
  });

  test('brand detail strip: co-approve + shop link (no self detail link)', async ({ page }) => {
    const orderId = 'B2B-DEMO-SHOP1-SS27';
    const res = await page.goto(
      `/brand/b2b-orders/${encodeURIComponent(orderId)}?collection=SS27&pcf=detail`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-co-collaborative-margin-approve-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-collaborative-shop-link')).toBeVisible();
    await expect(page.getByTestId('brand-co-collaborative-order-detail-link')).toHaveCount(0);
  });
});
