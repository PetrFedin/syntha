import { test, expect } from '@playwright/test';

/**
 * Wave SS: create-article wizard draft → PG (fail-closed LS in core).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-104-wave-ss-wizard-draft-pg.spec.ts
 */
test.describe('core-104: wave SS wizard draft PG', () => {
  test('wizard draft GET API', async ({ request }) => {
    const res = await request.get('/api/brand/production/create-article-wizard-draft/SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string; draft?: unknown };
    expect(typeof json.ok).toBe('boolean');
    if (json.storageMode) expect(['postgres', 'memory']).toContain(json.storageMode);
  });

  test('wizard draft POST + PATCH clear roundtrip', async ({ request }) => {
    const payload = {
      draft: {
        v: 1,
        mode: 'new',
        baseLineId: '',
        baseSearch: '',
        sku: 'E2E-DRAFT-SKU',
        name: 'E2E draft name',
        comment: 'core-104',
        audienceId: 'women',
        l1Name: '',
        l2Name: '',
        l3Name: '',
      },
    };
    const postRes = await request.post('/api/brand/production/create-article-wizard-draft/SS27', {
      data: payload,
    });
    expect(postRes.status()).toBeLessThan(500);

    const getRes = await request.get('/api/brand/production/create-article-wizard-draft/SS27');
    expect(getRes.ok()).toBeTruthy();
    const getJson = (await getRes.json()) as { draft?: { sku?: string } };
    if (getJson.draft) {
      expect(getJson.draft.sku).toBe('E2E-DRAFT-SKU');
    }

    const patchRes = await request.patch(
      '/api/brand/production/create-article-wizard-draft/SS27',
      { data: { clear: true } }
    );
    expect(patchRes.status()).toBeLessThan(500);
  });

  test('create-article dialog PG badge when core', async ({ page }) => {
    await page.goto('/brand/production/workshop2?w2col=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('brand-w2-create-article-btn').click();
    await expect(page.getByTestId('brand-w2-create-article-dialog')).toBeVisible({
      timeout: 15_000,
    });
    const badge = page.getByTestId('brand-w2-create-article-draft-storage-pg');
    if ((await badge.count()) > 0) {
      await expect(badge).toContainText(/PG/i);
    }
  });
});
