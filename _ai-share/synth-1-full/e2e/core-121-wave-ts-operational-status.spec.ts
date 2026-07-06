import { test, expect } from '@playwright/test';
import { checkoutPgOrderViaMatrix } from './helpers/core-checkout-pg';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };

async function submitShopAmendRequest(
  request: import('@playwright/test').APIRequestContext,
  orderId: string,
  noteRu: string
): Promise<{ amendmentId: string }> {
  const res = await request.post(`/api/shop/b2b/orders/${encodeURIComponent(orderId)}/amend-request`, {
    data: { noteRu },
  });
  expect(res.ok()).toBeTruthy();
  const json = (await res.json()) as { ok?: boolean; amendment?: { id?: string } };
  expect(json.ok).toBe(true);
  const amendmentId = json.amendment?.id ?? '';
  expect(amendmentId.length).toBeGreaterThan(0);
  return { amendmentId };
}

async function approveBrandAmendRequest(
  request: import('@playwright/test').APIRequestContext,
  orderId: string,
  amendmentId: string
): Promise<void> {
  const res = await request.post(
    `/api/brand/b2b/orders/${encodeURIComponent(orderId)}/amendments/${encodeURIComponent(amendmentId)}/approve`,
    { data: {} }
  );
  expect(res.ok()).toBeTruthy();
  const json = (await res.json()) as { ok?: boolean };
  expect(json.ok).toBe(true);
}

/**
 * Wave TS: brand amend approve → shop CO operational status mirror live (PG journal).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-121-wave-ts-operational-status.spec.ts
 */
test.describe('core-121: wave TS operational status mirror', () => {
  test('brand amend approve → shop cabinet badge live без reload', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const orderId = await checkoutPgOrderViaMatrix(page);
    expect(orderId).toMatch(/^B2B-\d+$/);

    const noteRu = 'Уменьшить размер M до 8 шт. для теста wave TS';
    const { amendmentId } = await submitShopAmendRequest(request, orderId, noteRu);

    const cabinetUrl = `/shop/core?pillar=collection_order&collection=SS27&order=${encodeURIComponent(orderId)}`;
    const res = await page.goto(cabinetUrl, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('shop-co-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-co-cabinet-operational-status')).toContainText(
      /ожидает бренда/i,
      { timeout: 45_000 }
    );

    await approveBrandAmendRequest(request, orderId, amendmentId);

    await expect(page.getByTestId('shop-co-cabinet-operational-status')).toContainText(
      /одобрен/i,
      { timeout: 45_000 }
    );

    const statusRes = await request.get(
      `/api/shop/b2b/orders/${encodeURIComponent(orderId)}/operational-status`
    );
    expect(statusRes.ok()).toBeTruthy();
    const statusJson = (await statusRes.json()) as { ok?: boolean; status?: string };
    expect(statusJson.ok).toBe(true);
    expect(statusJson.status).toBe('amendment_approved');
  });
});
