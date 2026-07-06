import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const COLLECTION_ID = 'SS27';

/**
 * Wave YD: brand SKU create-article wizard draft — PG stub API + fail-closed localStorage in core.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-219-wave-yd-sku-wizard.spec.ts
 */
test.describe('core-219: wave YD brand SKU wizard draft PG', () => {
  test('wizard draft GET API returns ok + storageMode', async ({ request }) => {
    const res = await request.get(
      `/api/brand/production/create-article-wizard-draft/${COLLECTION_ID}`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      storageMode?: string;
      draft?: unknown;
    };
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
        sku: 'E2E-YD-DRAFT-SKU',
        name: 'core-219 draft',
        comment: 'wave-yd',
        audienceId: 'women',
        l1Name: '',
        l2Name: '',
        l3Name: '',
      },
    };
    const postRes = await request.post(
      `/api/brand/production/create-article-wizard-draft/${COLLECTION_ID}`,
      { data: payload }
    );
    expect(postRes.status()).toBeLessThan(500);

    const getRes = await request.get(
      `/api/brand/production/create-article-wizard-draft/${COLLECTION_ID}`
    );
    expect(getRes.ok()).toBeTruthy();
    const getJson = (await getRes.json()) as { draft?: { sku?: string } };
    if (getJson.draft) {
      expect(getJson.draft.sku).toBe('E2E-YD-DRAFT-SKU');
    }

    const patchRes = await request.patch(
      `/api/brand/production/create-article-wizard-draft/${COLLECTION_ID}`,
      { data: { clear: true } }
    );
    expect(patchRes.status()).toBeLessThan(500);
  });

  test('create-article dialog: PG badge or fail-closed banner in core', async ({ page }) => {
    await page.goto(`/brand/production/workshop2?w2col=${COLLECTION_ID}`, GOTO);
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 60_000 });

    await page.getByTestId('brand-w2-create-article-btn').click();
    await expect(page.getByTestId('brand-w2-create-article-dialog')).toBeVisible({
      timeout: 15_000,
    });

    const pgBadge = page.getByTestId('brand-w2-create-article-draft-storage-pg');
    const unavailBadge = page.getByTestId('brand-w2-create-article-draft-storage-pg-unavailable');
    const failBanner = page.getByTestId('brand-w2-create-article-draft-fail-closed-banner');

    await expect(pgBadge.or(unavailBadge).or(failBanner)).toBeVisible({ timeout: 15_000 });

    if (await unavailBadge.isVisible().catch(() => false)) {
      await expect(failBanner).toBeVisible();
      await expect(failBanner).toContainText(/PostgreSQL|core:bootstrap/i);
    } else if (await pgBadge.isVisible().catch(() => false)) {
      await expect(pgBadge).toContainText(/PostgreSQL/i);
    }
  });
});
