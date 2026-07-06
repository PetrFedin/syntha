import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XB · Brand CO CRM: PG buyer_segments → auto linesheet visibility + shop showroom cross-link.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-191-wave-xb-crm-segments.spec.ts
 */
test.describe('core-191: wave XB brand CRM segments linesheet visibility', () => {
  test('CRM linesheet visibility GET from PG buyer_segments + messageRu', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };

    const res = await request.get('/api/brand/b2b/crm/linesheet-visibility?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      rows?: Array<{
        segmentKey?: string;
        nameRu?: string;
        autoVisible?: boolean;
        shopShowroomHref?: string;
      }>;
      summary?: { total?: number; autoVisible?: number; gated?: number };
      storageMode?: string;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.summary?.total).toBe('number');
    expect(typeof json.messageRu).toBe('string');
    if (health.pgReachable) {
      expect(json.storageMode).toBe('pg');
      expect(json.messageRu).toContain('PG');
    }
    if (json.rows?.length) {
      const autoRow = json.rows.find((row) => row.autoVisible);
      if (autoRow?.segmentKey) {
        expect(autoRow.shopShowroomHref).toContain('/shop/b2b/showroom');
        expect(autoRow.shopShowroomHref).toContain(`focus=${autoRow.segmentKey}`);
      }
    }
  });

  test('OTB replenishment sync GET (wave VR/UC carry)', async ({ request }) => {
    const res = await request.get('/api/brand/b2b/otb/replenishment-sync?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; rows?: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.rows)).toBe(true);
  });

  test('CRM workspace: RU segment strip + shop showroom cross-links', async ({ page }) => {
    await page.goto('/brand/b2b/customer-groups?collection=SS27&pcf=segments', GOTO);
    await expect(page.getByTestId('brand-co-crm-linesheet-visibility-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-crm-linesheet-visibility-summary-badge')).toContainText(
      'Авто linesheet'
    );
    await expect(page.getByTestId('brand-co-crm-linesheet-visibility-shop-showroom-link')).toBeVisible({
      timeout: 45_000,
    });
    const shopLink = page.getByTestId('brand-co-crm-linesheet-visibility-shop-showroom-link');
    await expect(shopLink).toHaveAttribute('href', /\/shop\/b2b\/showroom/);

    const retailShopLink = page.getByTestId(
      'brand-co-crm-linesheet-visibility-segment-retail-shop-link'
    );
    if ((await retailShopLink.count()) > 0) {
      await expect(retailShopLink).toBeVisible({ timeout: 45_000 });
      await expect(retailShopLink).toHaveAttribute('href', /focus=retail/);
    }
  });

  test('CRM peer strip shop showroom link', async ({ page }) => {
    await page.goto('/brand/b2b/customer-groups?collection=SS27&pcf=segments', GOTO);
    await expect(page.getByTestId('brand-co-crm-shop-showroom-link')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-crm-shop-showroom-link')).toHaveAttribute(
      'href',
      /\/shop\/b2b\/showroom/
    );
  });
});
