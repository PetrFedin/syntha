import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave YM: shop SC EMPTY27 onboarding — PG buyer profile read/write, greenfield dedupe, RU strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-228-wave-ym-empty27.spec.ts
 */
test.describe('core-228: wave YM EMPTY27 buyer profile onboarding', () => {
  test('buyer-crm-profile GET read + POST seed PG', async ({ request }) => {
    const getRes = await request.get('/api/shop/b2b/buyer-crm-profile?buyerId=shop1');
    expect(getRes.status()).toBeLessThan(500);
    const getJson = (await getRes.json()) as {
      ok?: boolean;
      profile?: { segmentNameRu?: string } | null;
      storageMode?: string;
      messageRu?: string;
    };
    expect(getJson.ok).toBe(true);
    expect(typeof getJson.messageRu).toBe('string');

    const postRes = await request.post('/api/shop/b2b/buyer-crm-profile', {
      data: {
        buyerId: 'shop1',
        collectionId: 'EMPTY27',
        action: 'seed',
        segmentKey: 'wholesale',
        onboardingNoteRu: 'EMPTY27 onboarding · shop1 seed',
      },
    });
    expect(postRes.status()).toBeLessThan(500);
    const postJson = (await postRes.json()) as {
      ok?: boolean;
      profile?: { segmentKey?: string };
      storageMode?: string;
      messageRu?: string;
    };
    expect(postJson.ok).toBe(true);
    expect(postJson.profile?.segmentKey).toBe('wholesale');
    expect(typeof postJson.messageRu).toBe('string');
  });

  test('EMPTY27 cabinet: onboarding strip + embedded buyer profile (no dup CTAs)', async ({
    page,
  }) => {
    const res = await page.goto('/shop/core?collection=EMPTY27&pillar=sample_collection', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('shop-sc-empty27-onboarding-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-sc-cabinet-buyer-profile-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-sc-empty27-onboarding-seed-profile')).toBeVisible({
      timeout: 45_000,
    });

    await expect(
      page
        .getByTestId('shop-sc-empty27-onboarding-pg')
        .or(page.getByTestId('shop-sc-empty27-onboarding-memory'))
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-pg'))
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-memory'))
    ).toBeVisible({ timeout: 45_000 });

    await expect(page.getByTestId('shop-sc-empty27-onboarding-partners-link')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-sc-empty27-onboarding-matrix-link')).toBeVisible({
      timeout: 45_000,
    });

    await expect(page.getByTestId('shop-sc-cabinet-buyer-profile-partners-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-sc-cabinet-buyer-profile-matrix-link')).toHaveCount(0);
  });

  test('EMPTY27 cabinet: seed profile button writes PG and refreshes strip', async ({ page }) => {
    await page.goto('/shop/core?collection=EMPTY27&pillar=sample_collection', GOTO);
    await expect(page.getByTestId('shop-sc-empty27-onboarding-seed-profile')).toBeVisible({
      timeout: 60_000,
    });

    await page.getByTestId('shop-sc-empty27-onboarding-seed-profile').click();

    await expect(
      page
        .getByTestId('shop-sc-cabinet-buyer-profile-segment')
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-no-segment'))
        .or(page.getByTestId('shop-sc-empty27-onboarding-seed-hint'))
    ).toBeVisible({ timeout: 45_000 });
  });

  test('EMPTY27 greenfield onboarding API returns CRM/pricelist snapshot', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/greenfield/onboarding?buyerId=shop1&collectionId=EMPTY27'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      state?: { crmReady?: boolean; pricelistReady?: boolean };
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.messageRu).toBe('string');
  });
});
