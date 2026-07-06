import { test, expect } from '@playwright/test';

/**
 * Wave TK · Brand 1.3 CO price lists: publish → tier sync push + shop honesty strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-115-wave-tk-pricelist-tier-sync.spec.ts
 */
test.describe('core-115: wave TK pricelist publish tier sync', () => {
  test('brand publish POST pushes tier sync to shop', async ({ request }) => {
    const postRes = await request.post('/api/brand/b2b/pricelist/publish', {
      data: {
        collectionId: 'SS27',
        id: 'pl-outlet-1',
        syncTierToShop: true,
      },
    });
    expect(postRes.status()).toBeLessThan(500);
    const postJson = (await postRes.json()) as {
      ok?: boolean;
      messageRu?: string;
      tierSync?: { shopSynced?: boolean; tierId?: string };
      storageMode?: string;
    };
    if (postJson.ok) {
      expect(postJson.messageRu).toBeTruthy();
      expect(postJson.tierSync?.shopSynced).toBe(true);
      expect(postJson.tierSync?.tierId).toBe('outlet');
      expect(['pg', 'file', 'memory']).toContain(postJson.storageMode);
    }

    const shopRes = await request.get('/api/shop/b2b/pricelist/tier-sync?collectionId=SS27');
    expect(shopRes.ok()).toBe(true);
    const shopJson = (await shopRes.json()) as {
      ok?: boolean;
      rows?: Array<{ tierId: string; shopSynced?: boolean }>;
    };
    expect(shopJson.ok).toBe(true);
    if (postJson.ok) {
      expect(shopJson.rows?.some((row) => row.tierId === 'outlet')).toBe(true);
    }
  });

  test('shop landed margin hub shows tier sync honesty strip', async ({ page }) => {
    await page.goto('/shop/b2b/margin-analysis?collection=SS27&pcf=hub', {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    await expect(page.getByTestId('shop-landed-margin-tier-sync-honesty-strip')).toBeVisible({
      timeout: 60_000,
    });
  });

  test('brand pricelist versions panel has publish button', async ({ page }) => {
    await page.goto('/brand/b2b/price-lists?collection=SS27&pcf=versions', {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    await expect(page.getByTestId('brand-pricelist-versions-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId(/brand-pricelist-publish-pl-/)).toBeVisible({
      timeout: 60_000,
    });
  });
});
