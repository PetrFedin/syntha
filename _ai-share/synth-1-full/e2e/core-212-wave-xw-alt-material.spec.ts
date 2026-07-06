import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XW: supplier alt-material PG approve/reject + brand notification + WB strip ↔ supplier BOM cabinet.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-212-wave-xw-alt-material.spec.ts
 */
test.describe('core-212: wave XW alt-material approval cross-link', () => {
  const COLLECTION = 'SS27';
  const ARTICLE = 'SS27-001';
  const PRIMARY = 'Lining';
  const ALT = `Alt-XW-E2E-${Date.now()}`;

  test('supplier approve/reject PG + brand notification-events', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean; pgReachable?: boolean };
    test.skip(!health.demoSeeded || !health.pgReachable, 'нужен db:core:bootstrap + PG');

    const submitRes = await request.post('/api/workshop2/supplier/alt-material-approval', {
      data: {
        collectionId: COLLECTION,
        articleId: ARTICLE,
        primary: PRIMARY,
        alternative: ALT,
        action: 'submit',
      },
    });
    expect(submitRes.ok()).toBe(true);
    const submitJson = (await submitRes.json()) as { status?: string; storageMode?: string };
    expect(submitJson.status).toBe('pending');
    expect(submitJson.storageMode).toBe('postgres');

    const brandEventsRes = await request.get(
      `/api/platform-core/notification-events?role=brand&collectionId=${COLLECTION}&articleId=${ARTICLE}&limit=8`
    );
    expect(brandEventsRes.ok()).toBe(true);
    const brandEvents = (await brandEventsRes.json()) as {
      events?: Array<{ titleRu?: string; bodyRu?: string }>;
    };
    expect(
      brandEvents.events?.some(
        (e) =>
          (e.titleRu?.includes('Поставщик') || e.titleRu?.includes('альтернатив')) &&
          e.bodyRu?.includes(ALT)
      )
    ).toBe(true);

    const approveRes = await request.post('/api/workshop2/supplier/alt-material-approval', {
      data: {
        collectionId: COLLECTION,
        articleId: ARTICLE,
        primary: PRIMARY,
        alternative: ALT,
        action: 'approve',
      },
    });
    expect(approveRes.ok()).toBe(true);
    const approveJson = (await approveRes.json()) as {
      ok?: boolean;
      status?: string;
      approvals?: Record<string, string>;
    };
    expect(approveJson.ok).toBe(true);
    expect(approveJson.status).toBe('approved');
    expect(approveJson.approvals?.[`${PRIMARY}::${ALT}`]).toBe('approved');

    const brandAfterRes = await request.get(
      `/api/platform-core/notification-events?role=brand&collectionId=${COLLECTION}&articleId=${ARTICLE}&limit=12`
    );
    const brandAfter = (await brandAfterRes.json()) as {
      events?: Array<{ titleRu?: string; bodyRu?: string }>;
    };
    expect(
      brandAfter.events?.some(
        (e) => e.bodyRu?.includes(ALT) && (e.titleRu?.includes('согласован') || e.titleRu?.includes('Поставщик'))
      )
    ).toBe(true);
  });

  test('brand BOM strip ↔ supplier BOM cabinet cross-links', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/brand/suppliers/rfq?collection=${COLLECTION}&article=${ARTICLE}&pcf=bom`,
      GOTO
    );
    await expect(page.getByTestId('brand-dev-bom-alt-material-approval-strip')).toBeVisible({
      timeout: 60_000,
    });
    const cabinetLink = page.getByTestId('brand-dev-bom-alt-material-supplier-cabinet-link');
    await expect(cabinetLink).toBeVisible();
    const cabinetHref = await cabinetLink.getAttribute('href');
    expect(cabinetHref).toContain('/factory/supplier/core');
    expect(cabinetHref).toContain('pillar=development');
    expect(cabinetHref).toContain(`collection=${COLLECTION}`);

    await page.goto(cabinetHref!, GOTO);
    await expect(page.getByTestId('sup-dev-bom-alt-material-approval-strip')).toBeVisible({
      timeout: 60_000,
    });
    const brandAltLink = page.getByTestId('sup-dev-bom-brand-alt-material-link');
    await expect(brandAltLink).toBeVisible();
    const brandHref = await brandAltLink.getAttribute('href');
    expect(brandHref).toContain('/brand/suppliers/rfq');
    expect(brandHref).toContain('pcf=bom');
    expect(brandHref).toContain(`article=${ARTICLE}`);
  });

  test('materials workspace: alt-materials nav + RU note', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/factory/production/materials?collection=${COLLECTION}&article=${ARTICLE}&view=development&role=supplier`,
      GOTO
    );
    await expect(page.getByTestId('materials-alt-materials-nav')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('materials-alt-materials-catalog-link')).toBeVisible();
    await expect(page.getByTestId('materials-alt-materials-cabinet-link')).toBeVisible();
    await expect(page.getByTestId('materials-alt-materials-brand-bom-link')).toBeVisible();
    await expect(page.getByTestId('materials-alt-materials-note')).toContainText('substitutes');
    await expect(
      page.getByTestId('materials-alt-materials').or(page.getByTestId('materials-alt-materials-empty'))
    ).toBeVisible();
  });
});
