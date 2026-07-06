import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XV · Brand CO: PG OTB plan sync × shop replenishment rules (deduped strip).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-211-wave-xv-otb-sync.spec.ts
 */
test.describe('core-211: wave XV brand OTB plan sync', () => {
  test('OTB plan-sync GET links PG OTB ledger × shop replenishment rules', async ({ request }) => {
    const res = await request.get('/api/brand/b2b/otb/plan-sync?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      rows?: Array<{ buyerId?: string; rulesHref?: string; activePresetId?: string | null }>;
      summary?: { buyers?: number; aligned?: number };
      planSync?: {
        otbStorageMode?: string;
        rulesStorageMode?: string;
        linkedPresetIds?: string[];
        buyersWithRules?: number;
      };
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.rows)).toBe(true);
    expect(typeof json.summary?.buyers).toBe('number');
    expect(typeof json.planSync?.otbStorageMode).toBe('string');
    expect(typeof json.planSync?.rulesStorageMode).toBe('string');
    expect(typeof json.messageRu).toBe('string');
    expect(json.messageRu).toMatch(/OTB/i);
    if (json.rows?.length) {
      expect(json.rows.some((row) => row.rulesHref?.includes('rules'))).toBe(true);
    }
  });

  test('legacy replenishment-sync GET still works (wave UC carry)', async ({ request }) => {
    const res = await request.get('/api/brand/b2b/otb/replenishment-sync?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; rows?: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.rows)).toBe(true);
  });

  test('shop replenishment rules GET (linked preset source)', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/replenishment/rules?buyerId=shop1');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      activePresetId?: string | null;
      storageMode?: string;
    };
    expect(json.ok).toBe(true);
  });

  test('WSSI OTB workspace: deduped sync strip + no duplicate peer replenishment link', async ({
    page,
  }) => {
    await page.goto('/brand/merch/assortment-mix-planner?collection=SS27&pcf=otb', GOTO);
    await expect(page.getByTestId('brand-co-otb-replenishment-sync-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-otb-replenishment-sync-summary-badge')).toContainText(
      'OTB × пополнение'
    );
    await expect(page.getByTestId('brand-co-otb-plan-sync-badge')).toContainText('Синхрон плана OTB');
    await expect(page.getByTestId('brand-co-wssi-otb-link')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('brand-co-wssi-replenishment-rules-link')).toHaveCount(0);
    await expect(page.getByTestId('brand-co-otb-replenishment-rules-link')).toHaveCount(0);
    await expect(page.getByTestId('brand-co-otb-replenishment-sync-otb-link')).toHaveCount(0);
  });

  test('WSSI mix tab hides OTB replenishment sync strip (dedupe)', async ({ page }) => {
    await page.goto('/brand/merch/assortment-mix-planner?collection=SS27&pcf=mix', GOTO);
    await expect(page.getByTestId('brand-co-wssi-co-peer-strip')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-co-otb-replenishment-sync-strip')).toHaveCount(0);
  });
});
