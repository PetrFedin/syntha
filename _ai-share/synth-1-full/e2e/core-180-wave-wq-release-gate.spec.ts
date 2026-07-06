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
 * Wave WQ · full UI wire: passport blocks SC publish + dev passport peer strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-180-wave-wq-release-gate.spec.ts
 */
test.describe('core-180: wave WQ release gate block publish', () => {
  test('POST /api/brand/sample-collection/release-gate/check — blocked or ready', async ({
    request,
  }) => {
    const res = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: COLLECTION },
    });
    const json = (await res.json()) as {
      messageRu?: string;
      blocked?: boolean;
      apiPath?: string;
    };
    expect(json.messageRu?.length).toBeGreaterThan(0);
    expect(json.apiPath).toBe('/api/brand/sample-collection/release-gate/check');
    if (res.status() === 409) {
      expect(json.blocked).toBe(true);
      expect(json.messageRu).toContain('material passport');
    } else {
      expect(res.ok()).toBeTruthy();
      expect(json.blocked).toBe(false);
    }
  });

  test('blocked path: SC publish banner + disabled publish button', async ({ page, request }) => {
    await skipUnlessDemoSeeded(request);

    const gateRes = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: COLLECTION },
    });
    test.skip(gateRes.ok(), 'passport уже ready — blocked UI не воспроизводится');

    const res = await page.goto(`/brand/showroom?collection=${COLLECTION}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-showroom-publish-one-click-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-release-gate-block-strip')).toBeVisible();
    await expect(page.getByTestId('brand-sc-release-gate-block-publish-banner')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-publish-button')).toBeDisabled();
  });

  test('dev passport: release gate peer strip + block banner on release tab', async ({
    page,
    request,
  }) => {
    await skipUnlessDemoSeeded(request);

    const gateRes = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: COLLECTION },
    });
    test.skip(gateRes.ok(), 'passport уже ready — blocked banner skip');

    const res = await page.goto(
      `/brand/merch/fabric-passport?pcf=release&collection=${COLLECTION}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-material-passport-release-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-passport-release-gate-peer-strip')).toBeVisible();
    await expect(page.getByTestId('brand-dev-passport-release-gate-status-badge')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-dev-passport-release-gate-checklist-link')).toBeVisible();
    await expect(
      page.getByTestId('brand-dev-passport-release-gate-showroom-publish-link')
    ).toBeVisible();
    await expect(page.getByTestId('brand-material-passport-release-gate-block-banner')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('dev passport workspace: peer strip on certs tab', async ({ page, request }) => {
    await skipUnlessDemoSeeded(request);

    const res = await page.goto(
      `/brand/merch/fabric-passport?pcf=certs&collection=${COLLECTION}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-passport-release-gate-peer-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-schema-passport-peer-strip')).toBeVisible();
  });

  test('showroom-publish tab: publish banner + block strip', async ({ page, request }) => {
    await skipUnlessDemoSeeded(request);

    const res = await page.goto(
      `/brand/merch/launch-readiness?pcf=showroom-publish&collection=${COLLECTION}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-release-showroom-publish-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-release-gate-block-strip')).toBeVisible();
    const gateRes = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: COLLECTION },
    });
    if (!gateRes.ok()) {
      await expect(page.getByTestId('brand-sc-release-gate-block-publish-banner')).toBeVisible({
        timeout: 45_000,
      });
    }
  });

  test('happy path: passport ready → publish enabled + ready badge', async ({ page, request }) => {
    await skipUnlessDemoSeeded(request);
    await markEligibleCertsReady(request, COLLECTION);

    const gateRes = await request.post('/api/brand/sample-collection/release-gate/check', {
      data: { collectionId: COLLECTION },
    });
    test.skip(!gateRes.ok(), 'passport не полностью ready после PATCH');

    const res = await page.goto(`/brand/showroom?collection=${COLLECTION}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-release-gate-block-ready-badge')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-publish-button')).toBeEnabled({ timeout: 45_000 });
  });

  test('showroom core cabinet: release gate peer on publish flow', async ({ page, request }) => {
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
    await expect(page.getByTestId('brand-sc-release-gate-block-strip')).toBeVisible();
  });
});
