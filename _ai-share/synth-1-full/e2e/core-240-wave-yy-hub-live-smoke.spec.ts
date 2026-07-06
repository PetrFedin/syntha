import { test, expect } from '@playwright/test';
import {
  gotoPlatformHubAudit,
  gotoPlatformPageAudit,
  openReadinessWorkspaceFromScore,
} from './helpers/core-chain-overview';
import { WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS } from '../src/lib/platform/wave-yy-hub-live-smoke';

/**
 * Wave YY: live hub matrix 5×4 — navigate 14 active cells on :3001, no 404 (extends YQ routes).
 * npm run test:e2e:core:hub-matrix
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-240-wave-yy-hub-live-smoke.spec.ts
 */
test.describe.configure({ mode: 'serial' });

test.describe('core-240: wave YY hub live smoke (14 active cells)', () => {
  test('hub audit — readiness matrix + 14 active cells', async ({ page }) => {
    const res = await gotoPlatformHubAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-readiness-matrix')).toBeVisible({
      timeout: 60_000,
    });
    expect(WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS).toHaveLength(14);
    for (const cell of WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS) {
      await expect(page.getByTestId(cell.hubCellTestId)).toBeVisible();
    }
  });

  for (const cell of WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS) {
    test(`hub → workspace no 404: ${cell.id}`, async ({ page }) => {
      test.setTimeout(180_000);
      const res = await gotoPlatformPageAudit(page);
      expect(res?.status() ?? 599).toBeLessThan(500);

      await expect(page.getByTestId(cell.hubScoreTestId)).toBeVisible({ timeout: 60_000 });
      await openReadinessWorkspaceFromScore(page, cell.roleId, cell.pillarId);
      await expect(page).toHaveURL(cell.urlPattern, { timeout: 60_000 });

      const notFound = page.getByRole('heading', { name: /404|not found|не найден/i });
      expect(await notFound.count()).toBe(0);
      expect(page.url()).not.toMatch(/\/404/i);
    });
  }
});
