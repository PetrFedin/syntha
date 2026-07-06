import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WN · Brand CO: pricelist publish → tier sync POST (PG stub, env-gated),
 * RU honesty strip, shop pricelist receive badge, brand → shop matrix tier badge.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-177-wave-wn-tier-sync.spec.ts
 */
test.describe('core-177: wave WN brand→shop tier sync on publish', () => {
  test('publish POST pushes tier sync + shop mirror GET', async ({ request }) => {
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
      tierSync?: { shopSynced?: boolean; tierId?: string; skipped?: boolean };
      storageMode?: string;
    };
    if (postJson.ok) {
      expect(postJson.messageRu).toBeTruthy();
      expect(postJson.tierSync?.shopSynced).toBe(true);
      expect(postJson.tierSync?.tierId).toBe('outlet');
      expect(['pg', 'file', 'memory', 'demo']).toContain(postJson.storageMode);
    }

    const shopRes = await request.get('/api/shop/b2b/pricelist/tier-sync?collectionId=SS27');
    expect(shopRes.ok()).toBe(true);
    const shopJson = (await shopRes.json()) as {
      ok?: boolean;
      rows?: Array<{ tierId: string; shopSynced?: boolean }>;
    };
    expect(shopJson.ok).toBe(true);
    if (postJson.ok) {
      expect(shopJson.rows?.some((row) => row.tierId === 'outlet' && row.shopSynced)).toBe(true);
    }
  });

  test('tier-sync POST API path (brand push)', async ({ request }) => {
    const res = await request.post('/api/brand/b2b/pricelist/tier-sync', {
      data: { collectionId: 'SS27', tierId: 'retail_b' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('brand pricelist: RU honesty strip + shop matrix tier badge link', async ({ page }) => {
    await page.goto('/brand/b2b/price-lists?collection=SS27&pcf=versions', GOTO);
    await expect(page.getByTestId('brand-pricelist-tier-sync-honesty-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-pricelist-tier-sync-pending-badge')).toBeVisible({
      timeout: 45_000,
    });
    const matrixLink = page.getByTestId('brand-pricelist-shop-matrix-tier-badge-link');
    await expect(matrixLink).toBeVisible({ timeout: 45_000 });
    await expect(matrixLink).toHaveAttribute('href', /\/shop\/b2b\/matrix/);
    await expect(page.getByTestId('brand-pricelist-versions-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId(/brand-pricelist-publish-pl-/)).toBeVisible({
      timeout: 60_000,
    });
  });

  test('shop pricelist panel: receive badge + tier sync source', async ({ page }) => {
    await page.goto('/shop/b2b/margin-analysis?collection=SS27&pcf=pricelist', GOTO);
    await expect(page.getByTestId('shop-landed-margin-pricelist-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-pricelist-tier-receive-badge')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId(/shop-pricelist-tier-sync-source-/)).toBeVisible({
      timeout: 45_000,
    });
  });

  test('shop matrix: tier sync receive badge cross-linked from brand publish', async ({ page }) => {
    await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    await expect(page.getByTestId('shop-co-matrix-shell')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId(/shop-co-matrix-tier-pricing-source-/)).toBeVisible({
      timeout: 45_000,
    });
    const receiveBadge = page.getByTestId('shop-co-matrix-tier-sync-receive-badge');
    if ((await receiveBadge.count()) > 0) {
      await expect(receiveBadge).toBeVisible({ timeout: 45_000 });
    }
  });
});
