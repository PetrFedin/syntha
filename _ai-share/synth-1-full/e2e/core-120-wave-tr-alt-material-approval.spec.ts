import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave TR: supplier alt-material approval PG + brand read-only peer strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-120-wave-tr-alt-material-approval.spec.ts
 */
test.describe('core-120: wave TR alt-material approval PG', () => {
  test('alt-material-approval API returns postgres storageMode', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean; pgReachable?: boolean };
    test.skip(!health.demoSeeded || !health.pgReachable, 'нужен db:core:bootstrap + PG');

    const getRes = await request.get(
      '/api/workshop2/supplier/alt-material-approval?collectionId=SS27&articleId=SS27-001'
    );
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as {
      ok?: boolean;
      storageMode?: string;
      approvals?: Record<string, string>;
    };
    expect(getJson.ok).toBe(true);
    expect(getJson.storageMode).toBe('postgres');

    const postRes = await request.post('/api/workshop2/supplier/alt-material-approval', {
      data: {
        collectionId: 'SS27',
        articleId: 'SS27-001',
        primary: 'Shell',
        alternative: 'Alt-TR-E2E',
        action: 'submit',
      },
    });
    expect(postRes.ok()).toBe(true);
    const postJson = (await postRes.json()) as {
      ok?: boolean;
      status?: string;
      storageMode?: string;
      approvals?: Record<string, string>;
    };
    expect(postJson.ok).toBe(true);
    expect(postJson.status).toBe('pending');
    expect(postJson.storageMode).toBe('postgres');
    expect(postJson.approvals?.['Shell::Alt-TR-E2E']).toBe('pending');
  });

  test('supplier cabinet strip + materials workspace panel', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/factory/supplier/core?pillar=development&collection=SS27', GOTO);
    await expect(page.getByTestId('sup-dev-bom-alt-material-approval-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('sup-dev-cabinet-alt-materials-link')).toBeVisible({
      timeout: 30_000,
    });

    await page.goto(
      '/factory/production/materials?collection=SS27&article=SS27-001&view=development&role=supplier',
      GOTO
    );
    await expect(page.getByTestId('materials-alt-materials-nav')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('materials-alt-materials-catalog-link')).toBeVisible();
    await expect(
      page.getByTestId('materials-alt-materials').or(page.getByTestId('materials-alt-materials-empty'))
    ).toBeVisible();
  });

  test('brand supplier BOM shows read-only alt-material status strip', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      '/brand/suppliers/rfq?collection=SS27&article=SS27-001&pcf=bom',
      GOTO
    );
    await expect(page.getByTestId('brand-dev-bom-alt-material-status-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-bom-alt-material-supplier-peer-link')).toBeVisible();
  });
});
