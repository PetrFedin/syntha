import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import { BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR } from '../src/lib/production/mfr-dossier-comments-wave-xn';
import {
  WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LABEL_RU,
  WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LINK_TESTID,
  WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_RU,
  WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_TESTID,
  WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_RU,
  WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_TESTID,
  WAVE_YA_MFR_DOSSIER_SOURCE_STRIP_TESTID,
} from '../src/lib/platform/wave-ya-mfr-dossier-pg-sot';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave YA: mfr factory dossier PG SoT in core + honest source badge + brand diff peer.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-216-wave-ya-mfr-dossier.spec.ts
 */
test.describe('core-216: wave YA mfr dossier PG SoT', () => {
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;

  test('mfr dev dossier — PG source badge + read-only + brand diff peer', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(ARTICLE)}?collection=${COLLECTION}`,
      GOTO
    );

    await expect(page.getByTestId(WAVE_YA_MFR_DOSSIER_SOURCE_STRIP_TESTID)).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId(WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_TESTID)).toContainText(
      WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_RU
    );
    await expect(page.getByTestId(WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_TESTID)).toContainText(
      WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_RU
    );

    const brandDiffLink = page.getByTestId(WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LINK_TESTID);
    await expect(brandDiffLink).toContainText(WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LABEL_RU);
    const brandDiffHref = await brandDiffLink.getAttribute('href');
    expect(brandDiffHref).toContain('/brand/production/workshop2/');
    expect(brandDiffHref).toContain(`#${BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR}`);

    await page.goto(brandDiffHref!, GOTO);
    await expect(page.getByTestId('brand-dossier-factory-diff-panel')).toBeVisible({
      timeout: 60_000,
    });
    const factoryLink = page.getByTestId('brand-dossier-factory-diff-factory-link');
    await expect(factoryLink).toBeVisible();
    const factoryHref = await factoryLink.getAttribute('href');
    expect(factoryHref).toContain('/factory/production/dossier/');
    expect(factoryHref).toContain(ARTICLE);
  });

  test('resolveFactoryDossier PG-only contract via health (core mode)', async ({ request }) => {
    const res = await request.get('/api/workshop2/platform-core/health');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { platformCoreMode?: boolean; pgReachable?: boolean };
    expect(json.platformCoreMode).toBe(true);
    expect(json.pgReachable).toBe(true);
  });
});
