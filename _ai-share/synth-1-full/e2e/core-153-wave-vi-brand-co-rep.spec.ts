import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave VI · Brand CO: commission dispute GET/POST, collaborative read-only link, multi-buyer registry PG.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-153-wave-vi-brand-co-rep.spec.ts
 */
test.describe('core-153: wave VI brand CO rep + collaborative', () => {
  test('commission dispute GET list + POST stub', async ({ request }) => {
    const getRes = await request.get('/api/brand/b2b/commissions/dispute');
    expect(getRes.status()).toBeLessThan(500);
    const getJson = (await getRes.json()) as {
      ok?: boolean;
      disputes?: unknown[];
      storageMode?: string;
      messageRu?: string;
    };
    expect(getJson.ok).toBe(true);
    expect(Array.isArray(getJson.disputes)).toBe(true);
    expect(typeof getJson.messageRu).toBe('string');

    const postRes = await request.post('/api/brand/b2b/commissions/dispute', {
      data: {
        commissionId: 'comm-e2e-153',
        reasonRu: 'E2E wave VI: расхождение комиссии',
        repName: 'Rep Demo',
      },
    });
    expect(postRes.status()).toBeLessThan(500);
    const postJson = (await postRes.json()) as {
      ok?: boolean;
      dispute?: { disputeId?: string; status?: string };
    };
    expect(postJson.ok).toBe(true);
    expect(postJson.dispute?.disputeId).toBeTruthy();
    expect(postJson.dispute?.status).toBe('received');
  });

  test('brand registry API exposes partner PG filter + partnerIds', async ({ request }) => {
    const allRes = await request.get('/api/brand/b2b/orders?collectionId=SS27');
    expect(allRes.ok()).toBeTruthy();
    const allJson = (await allRes.json()) as {
      orders?: unknown[];
      partnerIds?: string[];
      storageMode?: string;
    };
    expect(Array.isArray(allJson.partnerIds)).toBe(true);

    const shop2Res = await request.get('/api/brand/b2b/orders?collectionId=SS27&partner=shop2');
    expect(shop2Res.ok()).toBeTruthy();
    const shop2Json = (await shop2Res.json()) as { partner?: string; orders?: unknown[] };
    expect(shop2Json.partner).toBe('shop2');
    if (Array.isArray(allJson.orders) && Array.isArray(shop2Json.orders)) {
      expect(shop2Json.orders.length).toBeLessThanOrEqual(allJson.orders.length);
    }
  });

  test('brand order detail: collaborative read-only link to shop session', async ({ page }) => {
    const orderId = 'B2B-DEMO-SHOP1-SS27';
    const res = await page.goto(
      `/brand/b2b-orders/${encodeURIComponent(orderId)}?collection=SS27&pcf=detail`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-co-collaborative-margin-approve-strip')).toBeVisible({
      timeout: 60_000,
    });
    const readonlyLink = page.getByTestId('brand-co-collaborative-readonly-link');
    await expect(readonlyLink).toBeVisible({ timeout: 45_000 });
    await expect(readonlyLink).toHaveAttribute('href', /readOnly=1/);
    await expect(readonlyLink).toHaveAttribute('href', /collaborative-order/);
  });

  test('brand registry partner filter + PG partner badge', async ({ page }) => {
    await page.goto('/brand/b2b-orders?collection=SS27', GOTO);
    await expect(page.getByTestId('brand-co-registry-partner-filter')).toBeVisible({
      timeout: 60_000,
    });
    const pgBadge = page.getByTestId('brand-co-registry-pg-partner-badge');
    if ((await pgBadge.count()) > 0) {
      await expect(pgBadge).toContainText('PG');
    }
  });

  test('agent rep ledger dispute strip + read-only portal link', async ({ page }) => {
    await page.goto('/brand/distributor/commissions?pcf=ledger', GOTO);
    await expect(page.getByTestId('brand-agent-rep-commission-dispute-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-agent-rep-shop-portal-readonly-link')).toBeVisible({
      timeout: 45_000,
    });
  });
});
