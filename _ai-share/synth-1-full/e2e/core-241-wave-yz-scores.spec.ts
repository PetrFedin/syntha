import { test, expect } from '@playwright/test';
import { gotoPlatformHubAudit } from './helpers/core-chain-overview';
import {
  WAVE_YZ_E2E_SPEC,
  WAVE_YZ_EXPORT_LABEL_RU,
  WAVE_YZ_READINESS_SCORE_EXPORT_JSON_LINK_TESTID,
  WAVE_YZ_READINESS_SCORE_EXPORT_STRIP_TESTID,
  WAVE_YZ_READINESS_SCORE_EXPORT_SUMMARY_TESTID,
  WAVE_YZ_READINESS_SCORES_API_PATH,
  waveYzReadinessScoreCellTestId,
} from '../src/lib/platform/wave-yz-cell-score-export';

const COLLECTION = 'SS27';

/**
 * Wave YZ: readiness cell 8.0 score export strip (hub audit) + JSON API stub.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-241-wave-yz-scores.spec.ts
 */
test.describe('core-241: wave YZ readiness score export', () => {
  test('GET readiness-scores — 20 cells + summary JSON', async ({ request }) => {
    const res = await request.get(
      `${WAVE_YZ_READINESS_SCORES_API_PATH}?collectionId=${COLLECTION}&mode=static`
    );
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      collectionId?: string;
      mode?: string;
      targetMaxScore?: number;
      matrixSize?: { cells?: number };
      cells?: { roleId: string; pillarId: string; scoreLabel: string; active: boolean }[];
      summary?: { allCellsAvg?: number };
      stripLineRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(json.collectionId).toBe(COLLECTION);
    expect(json.mode).toBe('static');
    expect(json.targetMaxScore).toBe(8);
    expect(json.matrixSize?.cells).toBe(20);
    expect(json.cells).toHaveLength(20);
    expect(json.summary?.allCellsAvg).toBeGreaterThan(5);
    expect(json.stripLineRu).toContain(WAVE_YZ_EXPORT_LABEL_RU);
    const active = json.cells!.filter((c) => c.active);
    expect(active.length).toBeGreaterThanOrEqual(14);
  });

  test('hub audit — export strip RU + active cell chips', async ({ page }) => {
    const res = await gotoPlatformHubAudit(page, '/platform', { collectionId: COLLECTION });
    expect(res?.status() ?? 599).toBeLessThan(500);

    const strip = page.getByTestId(WAVE_YZ_READINESS_SCORE_EXPORT_STRIP_TESTID);
    await expect(strip).toBeVisible({ timeout: 60_000 });
    await expect(strip).toHaveAttribute('data-compact', '1');
    await expect(strip).toContainText(WAVE_YZ_EXPORT_LABEL_RU);

    const summary = page.getByTestId(WAVE_YZ_READINESS_SCORE_EXPORT_SUMMARY_TESTID);
    await expect(summary).toBeVisible();
    await expect(summary).toContainText(/\/10/);
    await expect(summary).toContainText(/20/);

    await expect(page.getByTestId(WAVE_YZ_READINESS_SCORE_EXPORT_JSON_LINK_TESTID)).toBeVisible();
    await expect(page.getByTestId(waveYzReadinessScoreCellTestId('brand', 'development'))).toBeVisible();
    await expect(page.getByTestId(waveYzReadinessScoreCellTestId('shop', 'collection_order'))).toBeVisible();

    await expect(strip).not.toContainText(/static|live|good:|bad:|fix:/i);
  });

  test('hub audit — JSON link targets readiness-scores API', async ({ page }) => {
    await gotoPlatformHubAudit(page, '/platform', { collectionId: COLLECTION });

    const jsonLink = page.getByTestId(WAVE_YZ_READINESS_SCORE_EXPORT_JSON_LINK_TESTID);
    await expect(jsonLink).toBeVisible({ timeout: 60_000 });
    const href = await jsonLink.getAttribute('href');
    expect(href).toContain(WAVE_YZ_READINESS_SCORES_API_PATH);
    expect(href).toContain(`collectionId=${COLLECTION}`);
  });
});
