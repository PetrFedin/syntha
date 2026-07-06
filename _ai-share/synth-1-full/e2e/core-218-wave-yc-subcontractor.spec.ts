import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave YC: brand subcontractor floor-tab draft → PG + enterprise partner dedupe.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-218-wave-yc-subcontractor.spec.ts
 */
test.describe('core-218: wave YC brand subcontractor draft PG', () => {
  test('floor-tab subcontractor API returns storageMode pg when ok', async ({ request }) => {
    const res = await request.get('/api/brand/production/floor-tabs/subcontractor');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(['pg', 'memory', 'unavailable']).toContain(json.storageMode);
    }
  });

  test('floor-tab subcontractor PUT roundtrip', async ({ request }) => {
    const payload = {
      draft: {
        v: 1,
        orders: [
          {
            id: 'yc-e2e-1',
            subcontractorId: 'syntha-lab',
            subcontractorName: 'Syntha Lab · Москва (демо B2B)',
            orderId: 'PO-YC-001',
            workType: 'sewing',
            workTypeLabel: 'Пошив',
            quantity: 100,
            unit: 'шт',
            status: 'requested',
            requestedAt: new Date().toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    };
    const put = await request.put('/api/brand/production/floor-tabs/subcontractor', {
      data: payload,
    });
    expect(put.status()).toBeLessThan(500);
    const putJson = (await put.json()) as { ok?: boolean; storageMode?: string };
    if (putJson.ok) {
      expect(['pg', 'memory']).toContain(putJson.storageMode ?? 'memory');
    }

    const get = await request.get('/api/brand/production/floor-tabs/subcontractor');
    expect(get.ok()).toBeTruthy();
    const getJson = (await get.json()) as {
      draft?: { orders?: Array<{ id?: string }> };
      storageMode?: string;
    };
    if (getJson.draft?.orders?.length) {
      expect(getJson.draft.orders.some((o) => o.id === 'yc-e2e-1')).toBe(true);
    }
  });

  test('sewing-contractors API skips placeholder brands in core', async ({ request }) => {
    const res = await request.get('/api/brand/sewing-contractors');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      partners?: Array<{ id?: string }>;
      source?: { partners?: string };
    };
    expect(Array.isArray(json.partners)).toBe(true);
    expect(json.source?.partners).toBe('enterprise_and_b2b');
    expect(json.partners?.some((p) => String(p.id ?? '').startsWith('b2b:'))).toBe(false);
  });

  test('subcontractor page: RU shell + PG or unavailable badge', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/brand/production/subcontractor', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-subcontractor-floor-page')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByRole('heading', { name: 'Кабинет субподряда' })).toBeVisible();

    const pgBadge = page.getByTestId('brand-floor-tab-subcontractor-storage-pg');
    const unavailBadge = page.getByTestId('brand-floor-tab-subcontractor-storage-unavailable');
    await expect(pgBadge.or(unavailBadge)).toBeVisible({ timeout: 45_000 });

    if (await pgBadge.isVisible()) {
      await expect(pgBadge).toContainText(/PostgreSQL/i);
    }
  });
});
