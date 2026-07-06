import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

/**
 * Wave WZ: hub pillar cards RU labels + dedup smoke (all roles · compact cabinet).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-189-wave-wz-ru-dedup.spec.ts
 */
test.describe('core-189: wave WZ RU noise + dedup', () => {
  test('brand dev cabinet — sample badge RU, co-peer без EN', async ({ page }) => {
    await gotoRoleCoreCabinet(page, '/brand/core?pillar=development&collection=SS27');
    const coPeer = page.getByTestId('brand-dev-cabinet-co-peer-strip');
    await expect(coPeer).toBeVisible({ timeout: 60_000 });
    await expect(coPeer).toContainText(/Лайншиты|Витрина магазина|Сегменты CRM/);
    await expect(coPeer).not.toContainText(/Linesheets|Sample lifecycle|Shop showroom/);
    const sampleBadge = page.getByTestId('development-sample-queue-badge');
    if ((await sampleBadge.count()) > 0) {
      await expect(sampleBadge).not.toContainText(/^(sent|draft|in_progress)$/);
    }
  });

  test('brand SC cabinet — golden path RU + retail peer dedup', async ({ page }) => {
    await gotoRoleCoreCabinet(page, '/brand/core?pillar=sample_collection&collection=SS27');
    await expect(page.getByTestId('brand-sc-unified-audit-path')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-sc-unified-audit-path')).toContainText(/Проверка релиза/);
    await expect(page.getByTestId('brand-sc-unified-audit-path')).not.toContainText(/Release gate/i);
    const retailPeer = page.getByTestId('brand-sc-cabinet-retail-peer-strip');
    await expect(retailPeer).toContainText(/Синдикация|B2B-платформа/);
    await expect(retailPeer).not.toContainText(/Syndication|Platform B2B|Checkout ·/i);
    await expect(page.getByTestId('brand-sc-cabinet-shop-buyer-checkout')).toHaveCount(0);
  });

  test('shop CO cabinet — spine peers RU, без dup tracking CTA', async ({ page }) => {
    await gotoRoleCoreCabinet(page, '/shop/core?pillar=collection_order&collection=SS27');
    const spinePeer = page.getByTestId('shop-co-cabinet-co-spine-peer-strip');
    if ((await spinePeer.count()) === 0) {
      test.skip(true, 'no active order — spine peer hidden');
    }
    await expect(spinePeer).toContainText(/Оформление|Матрица/);
    await expect(page.getByTestId('shop-co-cabinet-tracking-link')).toHaveCount(0);
    const pricelist = page.getByTestId('shop-co-cabinet-brand-pricelist-link');
    await expect(pricelist).toBeVisible();
    await expect(pricelist).toHaveAttribute('href', /\/shop\//);
  });

  test('mfr OP cabinet — subtitle RU без wholesale EN', async ({ page }) => {
    await gotoRoleCoreCabinet(page, '/factory/production/core?pillar=order_production&collection=SS27');
    const panel = page.getByTestId('mfr-op-cabinet-panel');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    const text = (await panel.textContent()) ?? '';
    expect(text).not.toMatch(/wholesale-заказ|confirm\/handoff/i);
  });
});
