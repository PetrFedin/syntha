import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';
import {
  WAVE_YT_HUB_READPATH_OWNER_TESTID,
} from '../src/lib/platform/wave-yt-hub-noise-pass2';
import {
  WAVE_ZE_PARTNER_COUNT_LOADING_RU,
  WAVE_ZE_READ_PATH_API_BADGE_RU,
  WAVE_ZE_SC_COLLECTION_ERROR_RU,
} from '../src/lib/platform/wave-ze-hub-diagnostics-ru';
import { BRAND_CO_CABINET_PARTNER_COUNT_LOADING_TESTID } from '../src/lib/b2b/brand-co-wave-yg';

const COLLECTION = 'SS27';

/**
 * Wave ZE: hub diagnostics RU microcopy pass 3 — no English PG/API/SSE noise in compact cabinets.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-246-wave-ze-ru.spec.ts
 */
test.describe('core-246: wave ZE hub diagnostics RU', () => {
  test('brand SC cabinet — readpath badge RU, no PG/localStorage/API noise', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await gotoRoleCoreCabinet(page, `/brand/core?pillar=sample_collection&collection=${COLLECTION}`);
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId(WAVE_YT_HUB_READPATH_OWNER_TESTID)).toBeVisible({
      timeout: 45_000,
    });

    const readpathBadge = page.getByTestId('brand-sc-published-readpath-api');
    await expect(readpathBadge).toBeVisible({ timeout: 30_000 });
    await expect(readpathBadge).toContainText(WAVE_ZE_READ_PATH_API_BADGE_RU);
    const ownerText = (await page.getByTestId(WAVE_YT_HUB_READPATH_OWNER_TESTID).textContent()) ?? '';
    expect(ownerText).not.toMatch(/PG ·|localStorage|publishedArticlesReadPath/i);
  });

  test('brand CO cabinet — partner loading RU without PG prefix', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    await gotoRoleCoreCabinet(page, `/brand/core?pillar=collection_order&collection=${COLLECTION}`);
    await expect(page.getByTestId('collection-order-pillar-card')).toBeVisible({
      timeout: 60_000,
    });

    const loadingBadge = page.getByTestId(BRAND_CO_CABINET_PARTNER_COUNT_LOADING_TESTID);
    if ((await loadingBadge.count()) > 0) {
      await expect(loadingBadge).toContainText(WAVE_ZE_PARTNER_COUNT_LOADING_RU);
      await expect(loadingBadge).not.toContainText(/^PG /);
    }

    const panelText = (await page.getByTestId('collection-order-pillar-card').textContent()) ?? '';
    expect(panelText).not.toMatch(/\bpostgres\b|\bmemory\b/i);
  });

  test('brand SC error copy — база not PG when snapshot fails', async ({ page }) => {
    await page.route('**/api/workshop2/platform-core/pillar-snapshot**', async (route) => {
      await route.fulfill({ status: 503, body: '{}' });
    });

    await gotoRoleCoreCabinet(page, `/brand/core?pillar=sample_collection&collection=${COLLECTION}`);
    const errorPanel = page.getByTestId('brand-sc-cabinet-error');
    if ((await errorPanel.count()) > 0) {
      await expect(errorPanel).toContainText(WAVE_ZE_SC_COLLECTION_ERROR_RU);
      await expect(errorPanel).not.toContainText(/\bPG\b/);
    }
  });

  test('audit ON — pillar diagnostics hint without SSE token', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    await page.addInitScript(() => {
      localStorage.setItem(
        'platform-core-hub-views',
        JSON.stringify({ business: true, audit: true, planner: false })
      );
    });

    await gotoRoleCoreCabinet(page, `/brand/core?pillar=comms&collection=${COLLECTION}`);
    await expect(page.getByTestId('comms-pillar-card')).toBeVisible({ timeout: 60_000 });

    const diagnostics = page.getByTestId('pillar-cabinet-diagnostics');
    if ((await diagnostics.count()) > 0) {
      const text = (await diagnostics.textContent()) ?? '';
      expect(text).not.toMatch(/\bSSE\b/);
      expect(text).toMatch(/аудит|поток|шаги цепочки/i);
    }
  });
});
