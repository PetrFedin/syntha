import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave VR · Brand CO: OTB×replenishment rules, CRM linesheet visibility, pricelist tier honesty, PG partner badge.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-161-wave-vr-brand-co-otb.spec.ts
 */
test.describe('core-161: wave VR brand CO OTB × CRM × tier sync', () => {
  test('OTB replenishment sync GET + rules href in rows', async ({ request }) => {
    const res = await request.get('/api/brand/b2b/otb/replenishment-sync?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      rows?: Array<{ buyerId?: string; rulesHref?: string; syncStatus?: string }>;
      summary?: { buyers?: number; aligned?: number };
    };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.rows)).toBe(true);
    if (json.rows?.length) {
      expect(json.rows.some((row) => row.rulesHref?.includes('rules'))).toBe(true);
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

  test('pricelist publish POST pushes tier sync (wave TK verify)', async ({ request }) => {
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
      tierSync?: { shopSynced?: boolean; tierId?: string };
    };
    if (postJson.ok) {
      expect(postJson.tierSync?.shopSynced).toBe(true);
    }
  });

  test('retailers summary API for cabinet partner count', async ({ request }) => {
    const res = await request.get('/api/brand/retailers/b2b-orders-summary');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; rows?: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.rows)).toBe(true);
  });

  test('WSSI workspace: OTB replenishment sync strip (wave XV plan-sync)', async ({ page }) => {
    await page.goto('/brand/merch/assortment-mix-planner?collection=SS27&pcf=otb', GOTO);
    await expect(page.getByTestId('brand-co-otb-replenishment-sync-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-otb-plan-sync-badge')).toContainText('Синхрон плана OTB');
    await expect(page.getByTestId('brand-co-wssi-otb-link')).toBeVisible({ timeout: 45_000 });
  });

  test('CRM workspace shows linesheet visibility strip', async ({ page }) => {
    await page.goto('/brand/b2b/customer-groups?collection=SS27&pcf=segments', GOTO);
    await expect(page.getByTestId('brand-co-crm-linesheet-visibility-strip')).toBeVisible({
      timeout: 60_000,
    });
  });

  test('brand pricelist versions shows tier sync honesty strip', async ({ page }) => {
    await page.goto('/brand/b2b/price-lists?collection=SS27&pcf=versions', GOTO);
    await expect(page.getByTestId('brand-pricelist-tier-sync-honesty-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-pricelist-versions-panel')).toBeVisible({
      timeout: 60_000,
    });
  });

  test('brand CO cabinet partner count + PG badge', async ({ page }) => {
    await page.goto('/brand/core?pillar=collection_order&collection=SS27', GOTO);
    const partnerCount = page.getByTestId('brand-co-cabinet-partner-count');
    const pgBadge = page.getByTestId('brand-co-cabinet-pg-partner-badge');
    if ((await partnerCount.count()) > 0) {
      await expect(partnerCount).toBeVisible({ timeout: 45_000 });
      await expect(pgBadge).toContainText('PG');
    }
  });
});
