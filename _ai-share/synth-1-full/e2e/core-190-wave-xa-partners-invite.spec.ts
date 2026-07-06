import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XA · Shop SC partners catalog: invite PG stub, UAT golden path RU, eligible-for-matrix cross-link.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-190-wave-xa-partners-invite.spec.ts
 */
test.describe('core-190: wave XA shop partners invite + eligible cross-link', () => {
  test('partnerships/invite POST PG + journal GET', async ({ request }) => {
    const postRes = await request.post('/api/shop/b2b/partnerships/invite', {
      data: {
        action: 'request',
        brandId: 'brand_nordic_wool',
        buyerId: 'shop1',
        collectionId: 'SS27',
      },
    });
    expect([200, 400, 503]).toContain(postRes.status());
    const postJson = (await postRes.json()) as {
      ok?: boolean;
      messageRu?: string;
      action?: string;
      journalId?: string;
      storageMode?: string;
    };
    expect(typeof postJson.messageRu).toBe('string');
    if (postJson.ok) {
      expect(postJson.action).toBe('request');
      expect(typeof postJson.journalId).toBe('string');
      expect(['pg', 'memory']).toContain(postJson.storageMode);
    }

    const getRes = await request.get(
      '/api/shop/b2b/partnerships/invite?buyerId=shop1&brandId=brand_nordic_wool&limit=5'
    );
    expect([200, 503]).toContain(getRes.status());
    const getJson = (await getRes.json()) as { ok?: boolean; journal?: unknown[] };
    if (getJson.ok) {
      expect(Array.isArray(getJson.journal)).toBe(true);
    }
  });

  test('partners discover: UAT golden path RU + invite panel (no duplicate cabinet strip)', async ({
    page,
  }) => {
    const res = await page.goto('/shop/b2b/partners/discover?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-b2b-partners-golden-path-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-b2b-partners-uat-golden-path-hint')).toContainText(
      /invite PG/i
    );
    await expect(page.getByTestId('shop-b2b-partners-uat-golden-path-hint')).toContainText(
      /eligible-for-matrix/i
    );
    await expect(page.getByTestId('shop-sc-cabinet-golden-path')).toHaveCount(0);
    await expect(page.getByTestId('shop-sc-partners-showroom-eligible-for-matrix-link')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-partners-invite-panel-brand_nordic_wool')
        .or(page.locator('[data-testid^="shop-sc-partners-invite-panel-"]').first())
    ).toBeVisible({ timeout: 45_000 });
    await expect(
      page
        .getByTestId('shop-sc-partners-chat-brand_nordic_wool')
        .or(page.locator('[data-testid^="shop-sc-partners-chat-"]').first())
    ).toBeVisible({ timeout: 45_000 });
  });

  test('eligible-for-matrix cross-link opens showroom with filter active', async ({ page }) => {
    const res = await page.goto(
      '/shop/b2b/showroom?collection=SS27&eligibleOnly=1&partnersPeer=eligible-matrix',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-toggle')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-toggle')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
