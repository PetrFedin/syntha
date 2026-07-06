import { test, expect } from '@playwright/test';
import { b2bV1ActorBrandHeaders } from './helpers/b2b-v1-api-headers';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave UD: collaborative session PG journal + SSE/poll badge + brand portal cross-link.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-130-wave-ud-collaborative-session.spec.ts
 */
test.describe('core-130: wave UD collaborative session', () => {
  test('session snapshot exposes journal + brand portal href', async ({ request }) => {
    const buyerId = 'shop1';
    const orderId = `B2B-UD130-${Date.now()}`;

    const matrixRes = await request.patch('/api/shop/b2b/collaborative/approvals', {
      data: { buyerId, orderId, stepId: 'matrix' },
    });
    expect(matrixRes.ok()).toBe(true);

    const sessionRes = await request.get(
      `/api/shop/b2b/collaborative/session?buyerId=${encodeURIComponent(buyerId)}&orderId=${encodeURIComponent(orderId)}&collection=SS27`
    );
    expect(sessionRes.ok()).toBe(true);
    const sessionJson = (await sessionRes.json()) as {
      ok?: boolean;
      brandCoApprovePortalHref?: string;
      journal?: unknown[];
      storageModeLabelRu?: string;
      session?: { waitingBrandMargin?: boolean };
    };
    expect(sessionJson.ok).toBe(true);
    expect(sessionJson.brandCoApprovePortalHref).toContain('/brand/b2b-orders/');
    expect(Array.isArray(sessionJson.journal)).toBe(true);
    expect(typeof sessionJson.storageModeLabelRu).toBe('string');
    expect(sessionJson.session?.waitingBrandMargin).toBe(true);
  });

  test('brand co-approve appends journal visible in session GET', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG для journal');

    const buyerId = 'shop1';
    const orderId = `B2B-UD130-PG-${Date.now()}`;

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
      journal?: Array<{ eventType?: string; stepId?: string }>;
      session?: { waitingBrandMargin?: boolean };
    };
    const brandEvent = sessionJson.journal?.find((e) => e.eventType === 'brand_margin_approve');
    expect(brandEvent?.stepId).toBe('margin');
    expect(sessionJson.session?.waitingBrandMargin).toBe(false);
  });

  test('session SSE stream responds with event-stream', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/collaborative/session/stream?orderId=B2B-SS27-DEMO-001&collection=SS27&buyerId=shop1'
    );
    expect(res.status()).toBeLessThan(500);
    const ct = res.headers()['content-type'] ?? '';
    expect(ct).toContain('text/event-stream');
  });

  test('shop session panel: storage + live badge + brand portal link', async ({ page }) => {
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
  });

  test('brand order detail strip links back to shop session', async ({ page }) => {
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
  });
});
