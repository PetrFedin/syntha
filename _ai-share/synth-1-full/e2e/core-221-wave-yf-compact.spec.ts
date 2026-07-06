import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const COLLECTION = 'SS27';

/**
 * Wave YF: hub compact/core mode RU labels + peer dedup smoke (brand dev + shop SC cabinets).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-221-wave-yf-compact.spec.ts
 */
test.describe('core-221: wave YF hub compact RU + noise', () => {
  test('brand dev cabinet — compact context RU, BOM badge, investor dedup', async ({ page }) => {
    await gotoRoleCoreCabinet(page, `/brand/core?pillar=development&collection=${COLLECTION}`);
    const contextStrip = page.getByTestId('brand-dev-cabinet-context-strip');
    await expect(contextStrip).toBeVisible({ timeout: 60_000 });
    await expect(contextStrip).toContainText(/Новый SKU|Атрибуты/);
    await expect(contextStrip).not.toContainText(/New SKU|Schema attr/i);

    const investorPeer = page.getByTestId('brand-dev-investor-readiness-peer-strip');
    await expect(investorPeer).toBeVisible({ timeout: 60_000 });
    await expect(investorPeer).toContainText(/Все задачи/);
    await expect(investorPeer).not.toContainText(/Release gate/i);
    await expect(
      page.getByTestId('brand-dev-investor-readiness-release-gate-peer-link')
    ).toHaveCount(0);

    const bomBadge = page.getByTestId('development-bom-ready-badge');
    if ((await bomBadge.count()) > 0) {
      await expect(bomBadge).toContainText(/Спецификация/);
      await expect(bomBadge).not.toContainText(/^BOM /);
    }
  });

  test('shop SC cabinet — B2B peer RU без checkout dup', async ({ page }) => {
    await gotoRoleCoreCabinet(page, `/shop/core?pillar=sample_collection&collection=${COLLECTION}`);
    const panel = page.getByTestId('shop-sc-cabinet-panel');
    await expect(panel).toBeVisible({ timeout: 60_000 });

    const b2bPeer = page.getByTestId('shop-sc-cabinet-b2b-peer-strip');
    await expect(b2bPeer).toBeVisible({ timeout: 60_000 });
    await expect(b2bPeer).toContainText(/B2B-платформа|Витрина B2B/);
    await expect(b2bPeer).not.toContainText(/Platform B2B|Marketroom/i);
    await expect(page.getByTestId('shop-sc-cabinet-checkout-link')).toHaveCount(0);
  });

  test('brand dev passport workspace — schema passport peer RU', async ({ page }) => {
    const res = await page.goto(
      `/brand/merch/fabric-passport?pcf=certs&collection=${COLLECTION}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const peer = page.getByTestId('brand-dev-schema-passport-peer-strip');
    await expect(peer).toBeVisible({ timeout: 60_000 });
    await expect(peer).toContainText(/Сводка материалов|Сертификаты|Проверка релиза/);
    await expect(peer).not.toContainText(/Material rollup|Material certs|Release gate/i);
  });

  test('brand dev passport workspace — release gate loading RU', async ({ page }) => {
    const res = await page.goto(
      `/brand/merch/fabric-passport?pcf=release&collection=${COLLECTION}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const peer = page.getByTestId('brand-dev-passport-release-gate-peer-strip');
    await expect(peer).toBeVisible({ timeout: 60_000 });
    const text = (await peer.textContent()) ?? '';
    expect(text).not.toMatch(/Release gate/i);
  });
});
