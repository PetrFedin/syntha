import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const COLLECTION = 'SS27';

const MFR_SC_PEER_LINKS = [
  'mfr-empty-sc-shop-showroom-link',
  'mfr-empty-sc-shop-matrix-link',
  'mfr-empty-sc-brand-linesheet-link',
  'mfr-empty-sc-sample-queue-link',
] as const;

const MFR_CO_PEER_LINKS = [
  'mfr-empty-co-brand-handoff-link',
  'mfr-empty-co-shop-tracking-link',
  'mfr-empty-co-shop-matrix-link',
  'mfr-empty-co-handoff-queue-link',
] as const;

/**
 * Wave VS: manufacturer empty pillars — publish badge, handoff count, peer strips.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-162-wave-vs-mfr-empty-pillars.spec.ts
 */
test.describe('core-162: wave VS mfr empty pillars', () => {
  test('empty SC: publish status panel + peer strip (≥2 links)', async ({ page }) => {
    const res = await gotoRoleCoreCabinet(
      page,
      `/factory/production/core?pillar=sample_collection&collection=${COLLECTION}`
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-manufacturer')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('manufacturer-sample-collection-mini')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('mfr-empty-sc-publish-badge')
        .or(page.getByTestId('manufacturer-sample-collection-mini-pg-table'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-empty-sc-peer-strip')).toBeVisible({ timeout: 30_000 });
    let visiblePeerLinks = 0;
    for (const tid of MFR_SC_PEER_LINKS) {
      if (await page.getByTestId(tid).isVisible().catch(() => false)) visiblePeerLinks += 1;
    }
    expect(visiblePeerLinks).toBeGreaterThanOrEqual(2);
  });

  test('empty CO: handoff count badge + peer strip (≥2 links, not checkout)', async ({
    page,
  }) => {
    const res = await gotoRoleCoreCabinet(
      page,
      `/factory/production/core?pillar=collection_order&collection=${COLLECTION}`
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-manufacturer')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('manufacturer-po-expectation-mini')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('mfr-empty-co-handoff-count-badge')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-empty-co-peer-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-checkout-payment-intent-strip')).toHaveCount(0);
    let visiblePeerLinks = 0;
    for (const tid of MFR_CO_PEER_LINKS) {
      if (await page.getByTestId(tid).isVisible().catch(() => false)) visiblePeerLinks += 1;
    }
    expect(visiblePeerLinks).toBeGreaterThanOrEqual(2);
  });

  test('handoff count API read-only (production-handoff-queue)', async ({ request }) => {
    const res = await request.get(
      '/api/workshop2/factory/production-handoff-queue?factoryId=fact-1'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; items?: unknown[] };
    expect(typeof json.ok).toBe('boolean');
    if (json.ok) expect(Array.isArray(json.items)).toBe(true);
  });
});
