import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave UV · SC release gate: passport blocks linesheet/showroom publish (409 RU).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-142-wave-uv-release-gate.spec.ts
 */
test.describe('core-142: wave UV release gate passport', () => {
  test('POST /api/brand/sample-collection/release-gate/check — 409 or ready', async ({
    request,
  }) => {
    const res = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: 'SS27' },
    });
    const json = (await res.json()) as {
      messageRu?: string;
      summary?: { total: number; ready: number };
      apiPath?: string;
      blocked?: boolean;
    };
    expect(json.messageRu?.length).toBeGreaterThan(0);
    expect(json.apiPath).toBe('/api/brand/sample-collection/release-gate/check');
    if (res.status() === 409) {
      expect(json.messageRu).toContain('material passport');
      expect(json.blocked).toBe(true);
    } else {
      expect(res.ok()).toBeTruthy();
      expect(json.blocked).toBe(false);
    }
  });

  test('syndicate publish blocked when passport incomplete (409)', async ({ request }) => {
    const gateRes = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: 'SS27' },
    });
    test.skip(gateRes.ok(), 'passport уже ready — блокировка не воспроизводится');

    const syndRes = await request.post('/api/brand/linesheets/syndicate', {
      data: {
        collectionId: 'SS27',
        articleIds: ['demo-ss27-01'],
        shopBuyerId: 'shop1',
        publish: true,
      },
    });
    expect(syndRes.status()).toBe(409);
    const syndJson = (await syndRes.json()) as { messageRu?: string; code?: string };
    expect(syndJson.code).toBe('material_passport_release_gate');
    expect(syndJson.messageRu).toContain('material passport');
  });

  test('launch-readiness: schema/passport peer strip + block strip', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto(
      '/brand/merch/launch-readiness?pcf=checklist&collection=SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-release-gate-schema-passport-peer-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-release-gate-block-strip')).toBeVisible();
    await expect(page.getByTestId('brand-sc-release-gate-schema-link')).toBeVisible();
    await expect(page.getByTestId('brand-sc-release-gate-passport-certs-link')).toBeVisible();
  });

  test('linesheets batch publish: release gate block strip', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/brand/linesheets?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheets-batch-publish')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-release-gate-block-strip')).toBeVisible();
  });

  test('showroom-publish tab: block strip on publish panel', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto(
      '/brand/merch/launch-readiness?pcf=showroom-publish&collection=SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-release-showroom-publish-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-release-gate-block-strip')).toBeVisible();
  });
});
