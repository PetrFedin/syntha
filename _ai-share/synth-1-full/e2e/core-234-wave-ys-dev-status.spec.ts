import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';
import {
  WAVE_YS_BRAND_DEV_STATUS_RU,
  WAVE_YS_MFR_DEV_PG_MIRROR_BADGE_RU,
  WAVE_YS_MFR_DEV_STATUS_MIRROR_STRIP_TESTID,
  WAVE_YS_MFR_DEV_STATUS_PEER_STRIP_TESTID,
  WAVE_YS_SAMPLE_QUEUE_RU,
} from '../src/lib/platform/wave-ys-mfr-dev-status-mirror';

const COLLECTION = 'SS27';

/**
 * Wave YS mfr dev 3.1: PG mirror brand development-status + peer strip + poll dedupe.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-234-wave-ys-dev-status.spec.ts
 */
test.describe('core-234: wave YS mfr dev status mirror', () => {
  test('development-status GET — factory-scoped PG mirror', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/collections/${COLLECTION}/development-status?skipRangePlanner=1&factoryId=fact-1`
    );
    test.skip(!res.ok(), 'PG development-status недоступен');
    const json = (await res.json()) as {
      ok?: boolean;
      status?: { steps?: unknown[]; articleCount?: number; sampleQueueCount?: number };
    };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.status?.steps)).toBe(true);
  });

  test('mfr dev cabinet — operator: peer strip RU, mirror + poll badge deduped', async ({
    page,
  }) => {
    await gotoRoleCoreCabinet(
      page,
      `/factory/production/core?pillar=development&collection=${COLLECTION}`
    );
    await expect(page.getByTestId('mfr-dev-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const peer = page.getByTestId(WAVE_YS_MFR_DEV_STATUS_PEER_STRIP_TESTID);
    await expect(peer).toBeVisible({ timeout: 30_000 });
    await expect(peer).toContainText(WAVE_YS_BRAND_DEV_STATUS_RU);
    await expect(peer).toContainText(WAVE_YS_SAMPLE_QUEUE_RU);
    await expect(peer).not.toContainText(/Brand dev status|Sample queue/i);

    const brandLink = page.getByTestId('mfr-dev-brand-dev-status-link');
    await expect(brandLink).toBeVisible();
    const brandHref = await brandLink.getAttribute('href');
    expect(brandHref).toContain('pillar=development');
    expect(brandHref).toContain(`collection=${COLLECTION}`);

    const queueLink = page.getByTestId('mfr-dev-sample-queue-peer-link');
    await expect(queueLink).toBeVisible();
    const queueHref = await queueLink.getAttribute('href');
    expect(queueHref).toContain('sample-queue');

    await expect(page.getByTestId(WAVE_YS_MFR_DEV_STATUS_MIRROR_STRIP_TESTID)).toHaveCount(0);
    await expect(page.getByTestId('mfr-dev-development-sse-live-badge')).toHaveCount(0);
  });

  test('mfr dev cabinet — audit ON: PG mirror RU badge visible', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    await page.addInitScript(() => {
      localStorage.setItem(
        'platform-core-hub-views',
        JSON.stringify({ business: true, audit: true, planner: false })
      );
    });

    await gotoRoleCoreCabinet(
      page,
      `/factory/production/core?pillar=development&collection=${COLLECTION}`
    );
    await expect(page.getByTestId('mfr-dev-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId(WAVE_YS_MFR_DEV_STATUS_PEER_STRIP_TESTID)).toBeVisible({
      timeout: 30_000,
    });

    const mirror = page.getByTestId(WAVE_YS_MFR_DEV_STATUS_MIRROR_STRIP_TESTID);
    await expect(mirror).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('mfr-dev-development-status-mirror-pg-badge')).toContainText(
      WAVE_YS_MFR_DEV_PG_MIRROR_BADGE_RU
    );
  });
});
