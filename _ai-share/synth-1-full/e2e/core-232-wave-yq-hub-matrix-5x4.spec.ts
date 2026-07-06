import { test, expect, type Page } from '@playwright/test';
import { openReadinessWorkspaceFromScore } from './helpers/core-chain-overview';
import {
  WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS,
  WAVE_YQ_HUB_MATRIX_CELLS,
  WAVE_YQ_HUB_MATRIX_INACTIVE_HUB_CELLS,
} from '../src/lib/platform/wave-yq-hub-matrix-5x4';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/** Hub audit matrix — inline в режиме views=audit. */
async function openHubAuditMatrix(page: Page) {
  let res = await page.goto('/platform?collection=SS27&views=audit', GOTO);
  for (let attempt = 0; attempt < 2 && (res?.status() ?? 599) >= 500; attempt++) {
    await page.waitForTimeout(750);
    res = await page.goto('/platform?collection=SS27&views=audit', GOTO);
  }
  expect(res?.status() ?? 599).toBeLessThan(500);

  const matrix = page.getByTestId('platform-core-readiness-matrix');
  await expect(matrix).toBeVisible({ timeout: 120_000 });
  return res;
}

/**
 * Wave YQ: live hub matrix 5×4 smoke — navigate hub cells (brand/shop/mfr/sup × 5 pillars).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-232-wave-yq-hub-matrix-5x4.spec.ts
 */
test.describe.configure({ mode: 'serial' });

test.describe('core-232: wave YQ hub matrix 5×4 smoke', () => {
  test('hub audit — all 20 matrix cells mounted', async ({ page }) => {
    await openHubAuditMatrix(page);

    for (const cell of WAVE_YQ_HUB_MATRIX_CELLS) {
      await expect(page.getByTestId(cell.hubCellTestId)).toBeVisible();
    }
  });

  test('hub audit — inactive cells show em dash (no hub navigation)', async ({ page }) => {
    await openHubAuditMatrix(page);

    for (const cell of WAVE_YQ_HUB_MATRIX_INACTIVE_HUB_CELLS) {
      const score = page.getByTestId(cell.hubScoreTestId);
      await expect(score).toBeVisible();
      await expect(score).toHaveText('—');
    }
  });

  for (const cell of WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS) {
    test(`hub → workspace: ${cell.id}`, async ({ page }) => {
      test.setTimeout(180_000);
      await openHubAuditMatrix(page);

      await expect(page.getByTestId(cell.hubScoreTestId)).toBeVisible({ timeout: 60_000 });
      await openReadinessWorkspaceFromScore(page, cell.roleId, cell.pillarId);
      await expect(page).toHaveURL(cell.urlPattern, { timeout: 60_000 });

      const anchor = cell.anchorTestIds.reduce(
        (acc, tid, index) => (index === 0 ? page.getByTestId(tid) : acc.or(page.getByTestId(tid))),
        page.getByTestId(cell.anchorTestIds[0]!)
      );
      await expect(anchor.first()).toBeVisible({ timeout: 60_000 });

      for (const peerId of cell.peerStripMinimums) {
        const peer = page.getByTestId(peerId);
        if ((await peer.count()) > 0) {
          await expect(peer.first()).toBeVisible({ timeout: 30_000 });
        }
      }

      const notFound = page.getByRole('heading', { name: /404|not found|не найден/i });
      expect(await notFound.count()).toBe(0);
    });
  }
});
