import { test, expect } from '@playwright/test';

/**
 * Wave TR 4.1: supplier alt-material approval PG flow — BOM cabinet strip + materials workspace.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-118-wave-tr-alt-material-approval.spec.ts
 */
test.describe('core-118: wave TR alt-material approval', () => {
  test('supplier dev cabinet: alt-material approval strip visible', async ({ page }) => {
    const res = await page.goto('/factory/supplier/core?collection=SS27&pillar=development', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('supplier-bom-preview-mini')).toBeVisible({ timeout: 45_000 });
    const strip = page.getByTestId('sup-dev-bom-alt-material-approval-strip');
    await expect(strip).toBeVisible({ timeout: 45_000 });
    await expect(strip.getByTestId('sup-dev-bom-alt-material-workspace-link')).toBeVisible();
  });

  test('materials development: alt-materials panel or honest empty', async ({ page }) => {
    const res = await page.goto(
      '/factory/production/materials?collection=SS27&article=demo-ss27-01&view=development&role=supplier',
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('materials-supplier-reference')).toBeVisible({ timeout: 45_000 });
    const altBlock = page.getByTestId('materials-alt-materials');
    const altEmpty = page.getByTestId('materials-alt-materials-empty');
    await expect(altBlock.or(altEmpty)).toBeVisible({ timeout: 45_000 });
  });

  test('GET alt-material-approval API returns approvals map', async ({ request }) => {
    const res = await request.get(
      '/api/workshop2/supplier/alt-material-approval?collectionId=SS27&articleId=demo-ss27-01'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; approvals?: Record<string, string> };
    expect(json.ok).toBe(true);
    expect(json.approvals).toBeTruthy();
  });
});
