import { test, expect } from '@playwright/test';
import {
  expectCabinetAboveFold,
  expectCabinetAsidePanelLayout,
  expectCabinetPillarNav,
  gotoRoleCoreCabinet,
} from './helpers/core-chain-overview';

const CABINETS = [
  {
    roleId: 'manufacturer',
    path: '/factory/production/core?collection=SS27',
    testId: 'role-core-cabinet-manufacturer',
  },
  {
    roleId: 'supplier',
    path: '/factory/supplier/core?collection=SS27',
    testId: 'role-core-cabinet-supplier',
  },
] as const;

test.describe('core-94: manufacturer + supplier cabinet viewports', () => {
  test('iPhone 393 — above fold + horizontal nav', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 812 });
    for (const cabinet of CABINETS) {
      const res = await gotoRoleCoreCabinet(page, cabinet.path);
      expect(res?.status() ?? 599).toBeLessThan(500);
      await expect(page.getByTestId(cabinet.testId)).toBeVisible({ timeout: 60_000 });
      await expectCabinetPillarNav(page);
      await expect(page.getByTestId('role-pillar-primary-cta')).toBeVisible();
      await expectCabinetAboveFold(page);
    }
  });

  test('iPad 834 — aside + pillar panel + above fold', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    for (const cabinet of CABINETS) {
      const res = await gotoRoleCoreCabinet(page, `${cabinet.path}&pillar=development`);
      expect(res?.status() ?? 599).toBeLessThan(500);
      await expect(page.getByTestId(cabinet.testId)).toBeVisible({ timeout: 60_000 });
      await expectCabinetPillarNav(page);
      await expect(page.getByTestId('role-core-pillar-panel')).toBeVisible();
      await expectCabinetAsidePanelLayout(page);
      await expect(page.getByTestId('role-pillar-primary-cta')).toBeVisible();
      await expectCabinetAboveFold(page);
    }
  });

  test('desktop 1280 — aside + panel side-by-side', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const cabinet of CABINETS) {
      const res = await gotoRoleCoreCabinet(page, cabinet.path);
      expect(res?.status() ?? 599).toBeLessThan(500);
      await expect(page.getByTestId(cabinet.testId)).toBeVisible({ timeout: 60_000 });
      await expectCabinetPillarNav(page);
      await expectCabinetAsidePanelLayout(page);
    }
  });
});
