import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave UC · Brand CO: OTB×replenishment, multi-buyer registry, agent dispute, CRM linesheet.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-129-wave-uc-brand-co.spec.ts
 */
test.describe('core-129: wave UC brand collection order', () => {
  test('OTB replenishment sync GET', async ({ request }) => {
    const res = await request.get('/api/brand/b2b/otb/replenishment-sync?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      rows?: Array<{ buyerId?: string; syncStatus?: string }>;
      summary?: { buyers?: number; aligned?: number };
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.rows)).toBe(true);
    expect(typeof json.messageRu).toBe('string');
    if (json.rows?.length) {
      expect(json.rows.some((row) => row.buyerId === 'shop1')).toBe(true);
    }
  });

  test('brand registry API filters by partner query', async ({ request }) => {
    const allRes = await request.get('/api/brand/b2b/orders?collectionId=SS27');
    expect(allRes.ok()).toBeTruthy();
    const allJson = (await allRes.json()) as { orders?: unknown[] };
    const shop2Res = await request.get('/api/brand/b2b/orders?collectionId=SS27&partner=shop2');
    expect(shop2Res.ok()).toBeTruthy();
    const shop2Json = (await shop2Res.json()) as { partner?: string; orders?: unknown[] };
    expect(shop2Json.partner).toBe('shop2');
    if (Array.isArray(allJson.orders) && Array.isArray(shop2Json.orders)) {
      expect(shop2Json.orders.length).toBeLessThanOrEqual(allJson.orders.length);
    }
  });

  test('CRM linesheet visibility GET from buyer_segments', async ({ request }) => {
    const res = await request.get('/api/brand/b2b/crm/linesheet-visibility?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      rows?: Array<{ segmentKey?: string; autoVisible?: boolean }>;
      summary?: { total?: number; autoVisible?: number };
      storageMode?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.summary?.total).toBe('number');
  });

  test('commission dispute POST stub', async ({ request }) => {
    const res = await request.post('/api/brand/b2b/commissions/dispute', {
      data: {
        commissionId: 'comm-e2e-129',
        reasonRu: 'E2E: расхождение ставки комиссии',
        repName: 'Rep Demo',
      },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      dispute?: { disputeId?: string; status?: string };
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(json.dispute?.disputeId).toBeTruthy();
    expect(json.dispute?.status).toBe('received');
  });

  test('WSSI workspace shows OTB replenishment sync strip', async ({ page }) => {
    await page.goto('/brand/merch/assortment-mix-planner?collection=SS27&pcf=otb', GOTO);
    await expect(page.getByTestId('brand-co-otb-replenishment-sync-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-wssi-otb-link')).toBeVisible({ timeout: 45_000 });
  });

  test('CRM workspace shows linesheet visibility strip', async ({ page }) => {
    await page.goto('/brand/b2b/customer-groups?collection=SS27&pcf=segments', GOTO);
    await expect(page.getByTestId('brand-co-crm-linesheet-visibility-strip')).toBeVisible({
      timeout: 60_000,
    });
  });

  test('agent rep ledger shows dispute strip + read-only portal link', async ({ page }) => {
    await page.goto('/brand/distributor/commissions?pcf=ledger', GOTO);
    await expect(page.getByTestId('brand-agent-rep-commission-dispute-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-agent-rep-shop-portal-readonly-link')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('brand registry partner filter visible', async ({ page }) => {
    await page.goto('/brand/b2b-orders?collection=SS27', GOTO);
    await expect(page.getByTestId('brand-co-registry-partner-filter')).toBeVisible({
      timeout: 60_000,
    });
  });
});
