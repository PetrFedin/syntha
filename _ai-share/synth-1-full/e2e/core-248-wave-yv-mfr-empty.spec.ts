import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';
import {
  MFR_EMPTY_CO_HANDOFF_COUNT_BADGE_TESTID,
  MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID,
  MFR_EMPTY_SC_PUBLISH_BADGE_TESTID,
  MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID,
  WAVE_YV_MFR_HANDOFF_QUEUE_EMPTY_RU,
  WAVE_YV_MFR_PUBLISH_BADGE_PREFIX_RU,
} from '../src/lib/platform/wave-yv-mfr-empty-pillars-final';

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
 * Wave YV: mfr empty SC/CO final polish — compact RU publish panel + handoff count read-only.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-248-wave-yv-mfr-empty.spec.ts
 */
test.describe('core-248: wave YV mfr empty pillars final', () => {
  test('empty SC: compact publish status panel RU (no checkout UI)', async ({ page }) => {
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

    const publishPanel = page.getByTestId(MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID);
    await expect(publishPanel).toBeVisible({ timeout: 30_000 });

    const publishBadge = page.getByTestId(MFR_EMPTY_SC_PUBLISH_BADGE_TESTID);
    const pgTable = page.getByTestId('manufacturer-sample-collection-mini-pg-table');
    await expect(publishBadge.or(pgTable)).toBeVisible({ timeout: 30_000 });

    const badgeVisible = await publishBadge.isVisible().catch(() => false);
    if (badgeVisible) {
      await expect(publishBadge).toContainText(WAVE_YV_MFR_PUBLISH_BADGE_PREFIX_RU);
      await expect(publishBadge).not.toContainText('Готово для байеров');
    }

    await expect(page.getByTestId('shop-co-checkout-payment-intent-strip')).toHaveCount(0);
    await expect(page.getByTestId('mfr-empty-sc-peer-strip')).toBeVisible({ timeout: 30_000 });

    let visiblePeerLinks = 0;
    for (const tid of MFR_SC_PEER_LINKS) {
      if (await page.getByTestId(tid).isVisible().catch(() => false)) visiblePeerLinks += 1;
    }
    expect(visiblePeerLinks).toBeGreaterThanOrEqual(2);
  });

  test('empty CO: handoff count panel read-only (not B2B checkout)', async ({ page }) => {
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

    const handoffPanel = page.getByTestId(MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID);
    await expect(handoffPanel).toBeVisible({ timeout: 30_000 });

    const handoffBadge = page.getByTestId(MFR_EMPTY_CO_HANDOFF_COUNT_BADGE_TESTID);
    await expect(handoffBadge).toBeVisible({ timeout: 30_000 });
    await expect(handoffBadge).toContainText(
      new RegExp(`${WAVE_YV_MFR_HANDOFF_QUEUE_EMPTY_RU}|В очереди:`)
    );

    await expect(page.getByTestId('shop-co-checkout-payment-intent-strip')).toHaveCount(0);
    await expect(page.getByTestId('shop-co-checkout-panel')).toHaveCount(0);
    await expect(page.getByTestId('mfr-empty-co-peer-strip')).toBeVisible({ timeout: 30_000 });

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
