import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave UE: brand SC cross-matrix open shop + mini-matrix + read-path badge + PDF empty.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-131-wave-ue-brand-sc-matrix.spec.ts
 */
test.describe('core-131: wave UE brand SC cross-matrix', () => {
  test('brand SC cabinet: mini-matrix + read-path api badge', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoRoleCoreCabinet(
      page,
      '/brand/core?pillar=sample_collection&collection=SS27'
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-sample-collection-mini-matrix')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-mini-matrix-qty-hint')).toContainText(/SKU|матриц/i);
    await expect(page.getByTestId('brand-sc-published-readpath-api')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('linesheets: open shop matrix CTA carries linesheetArticleIds', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/linesheets?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheets-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-sc-cross-matrix-open-shop-btn')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-published-readpath-api')).toBeVisible({
      timeout: 30_000,
    });

    const href = await page.getByTestId('brand-sc-cross-matrix-open-shop-btn').getAttribute('href');
    expect(href).toMatch(/linesheetArticleIds=/);
    expect(href).toMatch(/linesheetPrefill=1/);

    await page.getByTestId('brand-sc-cross-matrix-open-shop-btn').click();
    await page.waitForURL(/\/shop\/b2b\/matrix/, { timeout: 60_000 });
    expect(page.url()).toMatch(/linesheetArticleIds=/);
    await expect(page.getByTestId('shop-sc-matrix-linesheet-prefill-hint')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('EMPTY27 linesheets PDF: disabled UI + API 404 RU (no crash)', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/linesheets?collection=EMPTY27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheet-pdf-empty-disabled')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-sc-linesheet-pdf-empty-hint')).toContainText(
      /пустая коллекция|SS27/i
    );

    const pdfRes = await request.get('/api/workshop2/collections/EMPTY27/linesheet.pdf');
    expect(pdfRes.status()).toBe(404);
    const json = (await pdfRes.json()) as { messageRu?: string };
    expect(json.messageRu).toMatch(/PDF|артикул|EMPTY/i);
  });

  test('brand showroom: cross-matrix peer links (≥2)', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-cross-matrix-open-shop-btn')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-showroom-retail-peer-strip')).toBeVisible();
    await expect(page.getByTestId('brand-sc-showroom-shop-checkout-link')).toBeVisible();
    const href = await page.getByTestId('brand-sc-cross-matrix-open-shop-btn').getAttribute('href');
    expect(href).toMatch(/linesheetArticleIds=|collection=SS27/);
  });
});
