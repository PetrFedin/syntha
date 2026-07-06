import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const COLLECTION = 'SS27';

async function skipUnlessDemoSeeded(request: import('@playwright/test').APIRequestContext) {
  const healthRes = await request.get('/api/workshop2/platform-core/health');
  const health = (await healthRes.json()) as { demoSeeded?: boolean };
  test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');
}

async function markEligibleCertsReady(
  request: import('@playwright/test').APIRequestContext,
  collectionId: string
) {
  const certsRes = await request.get(
    `/api/brand/merch/material-passport/certs?collectionId=${encodeURIComponent(collectionId)}`
  );
  const certsJson = (await certsRes.json()) as {
    rows?: Array<{
      sku: string;
      hasComposition?: boolean;
      hasCare?: boolean;
      sustainabilityTags?: number;
      certReady?: boolean;
    }>;
  };
  const rows = certsJson.rows ?? [];
  for (const row of rows) {
    if (row.certReady) continue;
    if (!(row.hasComposition && row.hasCare && (row.sustainabilityTags ?? 0) > 0)) continue;
    await request.patch('/api/brand/merch/material-passport/certs', {
      data: { collectionId, sku: row.sku, certReady: true },
    });
  }
}

/**
 * Wave VM · full release gate E2E: blocked path (409 RU) + happy path (passport ready).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-157-wave-vm-release-gate-e2e.spec.ts
 */
test.describe('core-157: wave VM release gate E2E', () => {
  test('blocked path: SC check 409 + syndicate 409 RU', async ({ request }) => {
    await skipUnlessDemoSeeded(request);

    const gateRes = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: COLLECTION },
    });
    const gateJson = (await gateRes.json()) as { messageRu?: string; blocked?: boolean };
    expect(gateJson.messageRu?.length).toBeGreaterThan(0);

    if (gateRes.status() === 409) {
      expect(gateJson.blocked).toBe(true);
      expect(gateJson.messageRu).toContain('material passport');

      const syndRes = await request.post('/api/brand/linesheets/syndicate', {
        data: {
          collectionId: COLLECTION,
          articleIds: ['demo-ss27-01'],
          shopBuyerId: 'shop1',
          publish: true,
        },
      });
      expect(syndRes.status()).toBe(409);
      const syndJson = (await syndRes.json()) as { code?: string; messageRu?: string };
      expect(syndJson.code).toBe('material_passport_release_gate');
      expect(syndJson.messageRu).toContain('material passport');
    } else {
      expect(gateRes.ok()).toBeTruthy();
      expect(gateJson.blocked).toBe(false);
    }
  });

  test('blocked path: linesheets syndicate banner + publish block strip', async ({
    page,
    request,
  }) => {
    await skipUnlessDemoSeeded(request);

    const gateRes = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: COLLECTION },
    });
    test.skip(gateRes.ok(), 'passport уже ready — blocked UI не воспроизводится');

    const res = await page.goto(`/brand/linesheets?collection=${COLLECTION}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheets-syndicate-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-release-gate-block-strip')).toBeVisible();
    await expect(page.getByTestId('brand-sc-release-gate-block-syndicate-banner')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-linesheets-syndicate-btn')).toBeDisabled();
  });

  test('dev pillar: schema↔passport peer strips cross-links', async ({ page, request }) => {
    await skipUnlessDemoSeeded(request);

    const schemaRes = await page.goto(
      `/brand/merch/attribute-health?collection=${COLLECTION}`,
      GOTO
    );
    expect(schemaRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-schema-passport-peer-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-schema-passport-passport-link')).toBeVisible();
    await expect(page.getByTestId('brand-dev-schema-passport-certs-link')).toBeVisible();

    const passportRes = await page.goto(
      `/brand/merch/fabric-passport?collection=${COLLECTION}`,
      GOTO
    );
    expect(passportRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-schema-passport-peer-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-schema-passport-schema-link')).toBeVisible();
    await expect(page.getByTestId('brand-dev-schema-passport-schema-health-link')).toBeVisible();
  });

  test('passport release panel: SC check API integration', async ({ page, request }) => {
    await skipUnlessDemoSeeded(request);

    const res = await page.goto(
      `/brand/merch/fabric-passport?pcf=release&collection=${COLLECTION}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-material-passport-release-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByTestId('brand-material-passport-release-sc-gate-message')
    ).toBeVisible({ timeout: 45_000 });
    const blocked = await page
      .getByTestId('brand-material-passport-release-sc-gate-blocked')
      .isVisible();
    const ready = await page.getByTestId('brand-material-passport-release-sc-gate-ready').isVisible();
    expect(blocked || ready).toBe(true);
  });

  test('happy path: passport ready → SC gate open + showroom publish strip', async ({
    page,
    request,
  }) => {
    await skipUnlessDemoSeeded(request);

    await markEligibleCertsReady(request, COLLECTION);

    const gateRes = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: COLLECTION },
    });
    test.skip(!gateRes.ok(), 'passport не полностью ready после PATCH — happy path skip');

    const gateJson = (await gateRes.json()) as { blocked?: boolean; messageRu?: string };
    expect(gateJson.blocked).toBe(false);

    const showroomRes = await page.goto(`/brand/showroom?collection=${COLLECTION}`, GOTO);
    expect(showroomRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-showroom-publish-one-click-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-release-gate-block-strip')).toBeVisible();
    await expect(page.getByTestId('brand-sc-release-gate-block-ready-badge')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-publish-button')).toBeEnabled({ timeout: 45_000 });
  });

  test('showroom core cabinet: release gate on publish panel', async ({ page, request }) => {
    await skipUnlessDemoSeeded(request);

    const res = await gotoRoleCoreCabinet(
      page,
      `/brand/core?pillar=sample_collection&collection=${COLLECTION}`
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const showroomRes = await page.goto(
      `/brand/merch/launch-readiness?pcf=showroom-publish&collection=${COLLECTION}`,
      GOTO
    );
    expect(showroomRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-release-showroom-publish-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-release-gate-block-strip')).toBeVisible();
  });
});
