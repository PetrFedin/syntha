import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave UW: partnership invite PG journal, EMPTY27 onboarding, partners UAT golden path, logo honesty.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-143-wave-uw-partners-invite.spec.ts
 */
test.describe('core-143: wave UW partners invite + EMPTY27', () => {
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
    };
    expect(typeof postJson.messageRu).toBe('string');
    if (postJson.ok) {
      expect(postJson.action).toBe('request');
      expect(typeof postJson.journalId).toBe('string');
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

  test('partners discover: UAT golden path strip RU + invite panel', async ({ page }) => {
    const res = await page.goto('/shop/b2b/partners/discover?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-b2b-partners-golden-path-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-b2b-partners-uat-golden-path-hint')).toContainText(
      /invite PG/i
    );
    await expect(
      page
        .getByTestId('shop-sc-partners-invite-panel-brand_nordic_wool')
        .or(page.locator('[data-testid^="shop-sc-partners-invite-panel-"]').first())
    ).toBeVisible({ timeout: 45_000 });
  });

  test('EMPTY27 cabinet: empty27 onboarding + buyer profile PG', async ({ page }) => {
    const res = await page.goto(
      '/shop/core?collection=EMPTY27&pillar=sample_collection',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-empty27-onboarding-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-sc-cabinet-buyer-profile-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-empty27-onboarding-pg')
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-pg'))
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-segment'))
    ).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-sc-empty27-onboarding-partners-link')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('showroom SS27: partner logo source badge honesty', async ({ page }) => {
    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-partner-logo-row')).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-showroom-partner-logo-source-pg')
        .or(page.getByTestId('shop-sc-showroom-partner-logo-source-dossier-fallback'))
        .or(page.getByTestId('shop-sc-showroom-partner-logo-source-catalog-fallback'))
    ).toBeVisible({ timeout: 45_000 });
  });
});
