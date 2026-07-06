import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';
import {
  MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID,
  MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID,
} from '../src/lib/platform/wave-yv-mfr-empty-pillars-final';
import { WAVE_ZA_ADR_READONLY_BACKLOG } from '../src/lib/platform/wave-za-adr-readonly-backlog';

const COLLECTION = 'SS27';

/**
 * Wave ZA: intentional read-only empty cells — ADR-003 backlog, no checkout/write UI.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-242-wave-za-adr.spec.ts
 */
test.describe('core-242: wave ZA ADR read-only empty cells', () => {
  test('shop empty dev: development bridge read-only (no W2 editor)', async ({ page }) => {
    const res = await gotoRoleCoreCabinet(
      page,
      `/shop/core?pillar=development&collection=${COLLECTION}`
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-shop')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-development-bridge')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-co-checkout-panel')).toHaveCount(0);
  });

  test('mfr empty SC/CO: read-only panels without B2B checkout', async ({ page }) => {
    const scRes = await gotoRoleCoreCabinet(
      page,
      `/factory/production/core?pillar=sample_collection&collection=${COLLECTION}`
    );
    expect(scRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId(MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID)).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-checkout-payment-intent-strip')).toHaveCount(0);

    const coRes = await gotoRoleCoreCabinet(
      page,
      `/factory/production/core?pillar=collection_order&collection=${COLLECTION}`
    );
    expect(coRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId(MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID)).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-checkout-panel')).toHaveCount(0);
  });

  test('supplier empty SC/CO: forecast/BOM read-only anchors', async ({ page }) => {
    const scRes = await gotoRoleCoreCabinet(
      page,
      `/factory/supplier/core?pillar=sample_collection&collection=${COLLECTION}`
    );
    expect(scRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('supplier-bom-preview-mini')).toBeVisible({ timeout: 45_000 });

    const coRes = await gotoRoleCoreCabinet(
      page,
      `/factory/supplier/core?pillar=collection_order&collection=${COLLECTION}`
    );
    expect(coRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('supplier-collection-order-forecast')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-checkout-panel')).toHaveCount(0);
  });

  test('ADR backlog registry — five empty-cell anchors', async () => {
    expect(WAVE_ZA_ADR_READONLY_BACKLOG.length).toBe(5);
    const roles = new Set(WAVE_ZA_ADR_READONLY_BACKLOG.map((i) => i.role));
    expect(roles.has('shop')).toBe(true);
    expect(roles.has('manufacturer')).toBe(true);
    expect(roles.has('supplier')).toBe(true);
  });
});
