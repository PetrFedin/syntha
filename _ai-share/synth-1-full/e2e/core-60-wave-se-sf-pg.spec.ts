import { test, expect } from '@playwright/test';
import { b2bV1ActorBrandHeaders } from './helpers/b2b-v1-api-headers';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave SE+SF: PG happy-path на matrix draft, greenfield onboarding, brand co-approve margin.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-60-wave-se-sf-pg.spec.ts
 */
test.describe('core-60: wave SE+SF PG contracts', () => {
  test('matrix draft + size-run validate API (PG health)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const sessionId = `core60-draft-${Date.now()}`;
    const putRes = await request.put('/api/shop/b2b/matrix/draft', {
      data: {
        sessionId,
        buyerId: 'shop1',
        collectionId: 'SS27',
        draft: {
          v: 1,
          collectionId: 'SS27',
          lines: [{ articleId: 'demo-ss27-01', colorCode: 'default', size: 'M', qty: 2 }],
          updatedAt: new Date().toISOString(),
        },
      },
    });
    expect(putRes.ok()).toBe(true);
    const putJson = (await putRes.json()) as { ok?: boolean; storageMode?: string };
    expect(putJson.ok).toBe(true);

    const getRes = await request.get(
      `/api/shop/b2b/matrix/draft?sessionId=${encodeURIComponent(sessionId)}`
    );
    expect(getRes.ok()).toBe(true);

    const validateRes = await request.post('/api/shop/b2b/matrix/size-run-validate', {
      data: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        qtyBySize: { XS: 1, S: 2, M: 3, L: 2, XL: 1 },
      },
    });
    expect(validateRes.ok()).toBe(true);
  });

  test('brand co-approve margin → shop session sees margin done', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const buyerId = 'shop1';
    const orderId = `B2B-CORE60-${Date.now()}`;

    const matrixRes = await request.patch('/api/shop/b2b/collaborative/approvals', {
      data: { buyerId, orderId, stepId: 'matrix' },
    });
    expect(matrixRes.ok()).toBe(true);

    const brandRes = await request.post('/api/brand/b2b/collaborative/approve', {
      headers: b2bV1ActorBrandHeaders,
      data: { buyerId, orderId, brandActorLabel: 'brand' },
    });
    expect(brandRes.ok()).toBe(true);
    const brandJson = (await brandRes.json()) as { advanced?: boolean; state?: { marginDone?: boolean } };
    expect(brandJson.advanced).toBe(true);
    expect(brandJson.state?.marginDone).toBe(true);

    const sessionRes = await request.get(
      `/api/shop/b2b/collaborative/session?buyerId=${encodeURIComponent(buyerId)}&orderId=${encodeURIComponent(orderId)}&collection=SS27`
    );
    expect(sessionRes.ok()).toBe(true);
    const sessionJson = (await sessionRes.json()) as {
      session?: { waitingBrandMargin?: boolean; approvals?: Array<{ id: string; done: boolean }> };
    };
    expect(sessionJson.session?.waitingBrandMargin).toBe(false);
    const margin = sessionJson.session?.approvals?.find((a) => a.id === 'margin');
    expect(margin?.done).toBe(true);
  });

  test('brand order detail: collaborative margin strip visible', async ({ page }) => {
    const orderId = 'B2B-DEMO-SHOP1-SS27';
    const res = await page.goto(
      `/brand/b2b-orders/${encodeURIComponent(orderId)}?collection=SS27`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-co-collaborative-margin-approve-strip')).toBeVisible({
      timeout: 60_000,
    });
  });
});
