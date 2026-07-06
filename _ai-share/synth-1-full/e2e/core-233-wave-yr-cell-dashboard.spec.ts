import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const COLLECTION = 'SS27';

/**
 * Wave YR: compact readiness cell score dashboard strip in hub cabinet (RU, no verbose audit).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-233-wave-yr-cell-dashboard.spec.ts
 */
test.describe('core-233: wave YR readiness cell dashboard strip', () => {
  test('brand dev cabinet — cell score + section chips RU', async ({ page }) => {
    await gotoRoleCoreCabinet(page, `/brand/core?pillar=development&collection=${COLLECTION}`);

    const strip = page.getByTestId('wave-yr-readiness-cell-dashboard-strip');
    await expect(strip).toBeVisible({ timeout: 60_000 });
    await expect(strip).toHaveAttribute('data-compact', '1');
    await expect(strip).toContainText(/Готовность ячейки/);
    await expect(strip).toContainText(/Разделы/);
    await expect(strip).not.toContainText(/static|live|good:|bad:|fix:/i);

    const cellScore = page.getByTestId('wave-yr-readiness-cell-score');
    await expect(cellScore).toBeVisible();
    await expect(cellScore).toContainText(/\/10/);

    const w2Section = page.getByTestId('wave-yr-readiness-section-brand-dev-w2-hub');
    await expect(w2Section).toBeVisible();
    await expect(w2Section).toContainText(/цех|коллекц/i);
  });

  test('shop SC cabinet — cell score strip RU без verbose audit', async ({ page }) => {
    await gotoRoleCoreCabinet(page, `/shop/core?pillar=sample_collection&collection=${COLLECTION}`);

    const strip = page.getByTestId('wave-yr-readiness-cell-dashboard-strip');
    await expect(strip).toBeVisible({ timeout: 60_000 });
    await expect(strip).toContainText(/Готовность ячейки/);
    await expect(strip).not.toContainText(/static|live|good:|bad:|fix:/i);

    const showroomSection = page.getByTestId('wave-yr-readiness-section-shop-sc-showroom');
    if ((await showroomSection.count()) > 0) {
      await expect(showroomSection).toContainText(/Витрина/i);
    }
  });

  test('manufacturer OP cabinet — strip visible for order_production', async ({ page }) => {
    await gotoRoleCoreCabinet(
      page,
      `/factory/core?pillar=order_production&collection=${COLLECTION}`
    );

    const strip = page.getByTestId('wave-yr-readiness-cell-dashboard-strip');
    await expect(strip).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('wave-yr-readiness-cell-score')).toBeVisible();
  });
});
