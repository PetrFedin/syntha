import { test, expect, type Page, type Response } from '@playwright/test';

const COLLECTION = 'SS27';
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 120_000 };

async function gotoCoreWorkspace(page: Page, url: string): Promise<Response | null> {
  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await page.goto(url, GOTO);
    if ((res?.status() ?? 599) < 500) break;
    await page.waitForTimeout(750);
  }
  return res;
}

/**
 * Wave YP: broken/missing peer href audit + RU labels on peer strips (all roles × pillars).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-231-wave-yp-cross-links.spec.ts
 */
test.describe('core-231: wave YP cross-link audit fix', () => {
  test('shop showroom — monetization partners href + B2B peer RU', async ({ page }) => {
    const res = await gotoCoreWorkspace(page, `/shop/b2b/showroom?collection=${COLLECTION}`);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-showroom-buy-golden-path-strip')).toBeVisible({
      timeout: 90_000,
    });

    const monetization = page.getByTestId('shop-sc-showroom-monetization-peer-strip');
    await expect(monetization).toBeVisible({ timeout: 60_000 });
    await expect(monetization).toContainText(/Партнёры|Лайншит/);
    await expect(monetization).not.toContainText(/Partners|Linesheet/i);

    const partnersLink = page.getByTestId('shop-sc-showroom-partners-link');
    await expect(partnersLink).toBeVisible();
    const partnersHref = await partnersLink.getAttribute('href');
    expect(partnersHref).toContain(`collection=${COLLECTION}`);

    const b2bPeer = page.getByTestId('shop-sc-showroom-b2b-peer-strip');
    await expect(b2bPeer).toBeVisible();
    await expect(b2bPeer).toContainText(/B2B-платформа|Витрина B2B|Партнёры/);
    await expect(b2bPeer).not.toContainText(/Platform B2B|Marketroom/i);
  });

  test('shop partners discover — B2B peer RU', async ({ page }) => {
    const res = await gotoCoreWorkspace(
      page,
      `/shop/b2b/partners/discover?collection=${COLLECTION}`
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const peer = page.getByTestId('shop-sc-partners-b2b-peer-strip');
    await expect(peer).toBeVisible({ timeout: 60_000 });
    await expect(peer).toContainText(/B2B-платформа|Витрина B2B/);
    await expect(peer).not.toContainText(/Platform B2B|Marketroom/i);
  });

  test('brand SC linesheets — retail peer RU release gate', async ({ page }) => {
    const res = await gotoCoreWorkspace(page, `/brand/linesheets?collection=${COLLECTION}`);
    expect(res?.status() ?? 599).toBeLessThan(500);

    const peer = page.getByTestId('brand-sc-linesheets-retail-peer-strip');
    await expect(peer).toBeVisible({ timeout: 60_000 });
    await expect(peer).toContainText(/Проверка релиза|Матрица магазина/);
    await expect(peer).not.toContainText(/Release gate/i);
  });

  test('brand dev passport — release gate peer RU', async ({ page }) => {
    const res = await gotoCoreWorkspace(
      page,
      `/brand/merch/fabric-passport?pcf=release&collection=${COLLECTION}`
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const peer = page.getByTestId('brand-dev-passport-release-gate-peer-strip');
    await expect(peer).toBeVisible({ timeout: 60_000 });
    await expect(peer).toContainText(/Чеклист релиза|Публикация витрины/);
    await expect(peer).not.toContainText(/Release checklist|Showroom publish/i);
  });

  test('supplier dev BOM — brand-dev peer RU (PG bootstrap)', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const contentType = healthRes.headers()['content-type'] ?? '';
    test.skip(!healthRes.ok() || !contentType.includes('json'), 'health API unavailable');
    const health = (await healthRes.json().catch(() => ({}))) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await gotoCoreWorkspace(
      page,
      `/factory/supplier/materials?collection=${COLLECTION}&pcf=bom&article=demo-ss27-01`
    );

    const peer = page.getByTestId('sup-dev-bom-brand-dev-peer-strip');
    await expect(peer).toBeVisible({ timeout: 60_000 });
    await expect(peer).toContainText(/Паспорт материала|Схема атрибутов/);
    await expect(peer).not.toContainText(/Material passport|Attribute schema/i);
  });
});
