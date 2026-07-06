import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WB: brand-side alt-material approval strip + PG approve/reject stub.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-165-wave-wb-brand-bom-alt.spec.ts
 */
test.describe('core-165: wave WB brand BOM alt-material approval', () => {
  test('brand alt-material-approval API returns pending + postgres storageMode', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean; pgReachable?: boolean };
    test.skip(!health.demoSeeded || !health.pgReachable, 'нужен db:core:bootstrap + PG');

    await request.post('/api/workshop2/supplier/alt-material-approval', {
      data: {
        collectionId: 'SS27',
        articleId: 'SS27-001',
        primary: 'Shell',
        alternative: 'Alt-WB-E2E',
        action: 'submit',
      },
    });

    const getRes = await request.get(
      '/api/brand/merch/supplier-bom/alt-material-approval?collectionId=SS27&articleId=SS27-001'
    );
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as {
      ok?: boolean;
      storageMode?: string;
      pending?: Array<{ primary: string; alternative: string }>;
      summary?: { pending: number };
    };
    expect(getJson.ok).toBe(true);
    expect(getJson.storageMode).toBe('postgres');
    expect(getJson.pending?.some((p) => p.alternative === 'Alt-WB-E2E')).toBe(true);

    const approveRes = await request.post('/api/brand/merch/supplier-bom/alt-material-approval', {
      data: {
        collectionId: 'SS27',
        articleId: 'SS27-001',
        primary: 'Shell',
        alternative: 'Alt-WB-E2E',
        action: 'approve',
      },
    });
    expect(approveRes.ok()).toBe(true);
    const approveJson = (await approveRes.json()) as {
      ok?: boolean;
      status?: string;
      storageMode?: string;
      approvals?: Record<string, string>;
    };
    expect(approveJson.ok).toBe(true);
    expect(approveJson.status).toBe('approved');
    expect(approveJson.storageMode).toBe('postgres');
    expect(approveJson.approvals?.['Shell::Alt-WB-E2E']).toBe('approved');
  });

  test('brand supplier BOM shows approval strip with supplier cabinet link', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await request.post('/api/workshop2/supplier/alt-material-approval', {
      data: {
        collectionId: 'SS27',
        articleId: 'SS27-001',
        primary: 'Lining',
        alternative: 'Alt-WB-UI',
        action: 'submit',
      },
    });

    await page.goto('/brand/suppliers/rfq?collection=SS27&article=SS27-001&pcf=bom', GOTO);
    await expect(page.getByTestId('brand-dev-bom-alt-material-approval-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-bom-alt-material-status-strip')).toBeVisible();
    await expect(page.getByTestId('brand-dev-bom-alt-material-supplier-cabinet-link')).toBeVisible();
    await expect(page.getByTestId('brand-dev-bom-alt-material-supplier-peer-link')).toBeVisible();
    await expect(page.getByTestId('brand-dev-bom-alt-material-pending-list')).toBeVisible();
  });
});
