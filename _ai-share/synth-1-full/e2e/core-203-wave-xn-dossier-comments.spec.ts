import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import {
  BRAND_DOSSIER_FACTORY_DIFF_MFR_COMMENTS_LINK_TESTID,
  BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR,
  FACTORY_DOSSIER_COMMENTS_API_PATH,
  MFR_DEV_DOSSIER_ANNOTATION_BRAND_DIFF_LINK_TESTID,
  MFR_DEV_DOSSIER_ANNOTATION_PANEL_TESTID,
} from '../src/lib/production/mfr-dossier-comments-wave-xn';
import {
  WAVE_XN_MFR_DOSSIER_ANNOTATION_INPUT_TESTID,
  WAVE_XN_MFR_DOSSIER_ANNOTATION_PEER_STRIP_TESTID,
  WAVE_XN_MFR_DOSSIER_ANNOTATION_SUBMIT_TESTID,
  WAVE_XN_MFR_DOSSIER_COMMENT_BRAND_DIFF_LINK_TESTID,
  WAVE_XN_MFR_DOSSIER_COMMENT_PEER_STRIP_TESTID,
  WAVE_XN_MFR_DOSSIER_PEER_BRAND_DIFF_RU,
  WAVE_XN_MFR_DOSSIER_PEER_CHAT_RU,
  WAVE_XN_MFR_DOSSIER_PEER_MATERIALS_RU,
  WAVE_XN_MFR_DOSSIER_PEER_SAMPLE_QUEUE_RU,
  WAVE_XN_MFR_DOSSIER_SUBMIT_LABEL_RU,
} from '../src/lib/platform/wave-xn-mfr-dossier-comments';

/**
 * Wave XN: mfr factory dossier comment-only API + dev dossier peer strips (RU).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-203-wave-xn-dossier-comments.spec.ts
 */
test.describe('core-203: wave XN mfr dossier comments', () => {
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;

  test('factory dossier comments API POST + GET (PG journal stub)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const marker = `e2e-core-203-${Date.now()}`;
    const post = await request.post(FACTORY_DOSSIER_COMMENTS_API_PATH, {
      data: {
        collectionId: COLLECTION,
        articleId: ARTICLE,
        text: marker,
        actor: 'e2e-core-203',
      },
    });
    expect(post.ok()).toBeTruthy();
    const posted = (await post.json()) as {
      ok?: boolean;
      comment?: { commentId?: string; text?: string };
      apiPath?: string;
    };
    expect(posted.ok).toBe(true);
    expect(posted.apiPath).toBe(FACTORY_DOSSIER_COMMENTS_API_PATH);
    expect(posted.comment?.commentId).toBeTruthy();
    expect(posted.comment?.text).toBe(marker);

    const get = await request.get(
      `${FACTORY_DOSSIER_COMMENTS_API_PATH}?collectionId=${COLLECTION}&articleId=${ARTICLE}`
    );
    expect(get.ok()).toBeTruthy();
    const listed = (await get.json()) as { comments?: Array<{ text?: string }> };
    expect(Array.isArray(listed.comments)).toBe(true);
    expect(listed.comments?.some((c) => c.text === marker)).toBe(true);
  });

  test('mfr dev dossier — comment peer strip RU labels', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(ARTICLE)}?collection=${COLLECTION}`,
      { waitUntil: 'domcontentloaded', timeout: 90_000 }
    );

    const peerStrip = page.getByTestId(WAVE_XN_MFR_DOSSIER_COMMENT_PEER_STRIP_TESTID);
    await expect(peerStrip).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId(WAVE_XN_MFR_DOSSIER_COMMENT_BRAND_DIFF_LINK_TESTID)).toContainText(
      WAVE_XN_MFR_DOSSIER_PEER_BRAND_DIFF_RU
    );
    await expect(page.getByTestId('mfr-dev-dossier-comment-chat-link')).toContainText(
      WAVE_XN_MFR_DOSSIER_PEER_CHAT_RU
    );
    await expect(page.getByTestId('mfr-dev-dossier-comment-sample-queue-link')).toContainText(
      WAVE_XN_MFR_DOSSIER_PEER_SAMPLE_QUEUE_RU
    );
    await expect(page.getByTestId('mfr-dev-dossier-comment-materials-link')).toContainText(
      WAVE_XN_MFR_DOSSIER_PEER_MATERIALS_RU
    );
  });

  test('mfr dev dossier — annotation panel POST via UI', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(ARTICLE)}?collection=${COLLECTION}`,
      { waitUntil: 'domcontentloaded', timeout: 90_000 }
    );

    await expect(page.getByTestId(MFR_DEV_DOSSIER_ANNOTATION_PANEL_TESTID)).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId(WAVE_XN_MFR_DOSSIER_ANNOTATION_PEER_STRIP_TESTID)).toBeVisible();

    const marker = `e2e-ui-xn-${Date.now()}`;
    await page.getByTestId(WAVE_XN_MFR_DOSSIER_ANNOTATION_INPUT_TESTID).fill(marker);
    await page.getByTestId(WAVE_XN_MFR_DOSSIER_ANNOTATION_SUBMIT_TESTID).click();

    await expect(page.getByText(marker, { exact: false })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId(WAVE_XN_MFR_DOSSIER_ANNOTATION_SUBMIT_TESTID)).toContainText(
      WAVE_XN_MFR_DOSSIER_SUBMIT_LABEL_RU
    );
  });

  test('cross-link brand diff viewer ↔ mfr annotation peer', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(ARTICLE)}?collection=${COLLECTION}`,
      { waitUntil: 'domcontentloaded', timeout: 90_000 }
    );
    await expect(page.getByTestId(MFR_DEV_DOSSIER_ANNOTATION_BRAND_DIFF_LINK_TESTID)).toBeVisible({
      timeout: 60_000,
    });

    const brandDiffHref = await page
      .getByTestId(MFR_DEV_DOSSIER_ANNOTATION_BRAND_DIFF_LINK_TESTID)
      .getAttribute('href');
    expect(brandDiffHref).toContain(`#${BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR}`);

    await page.goto(
      `/brand/production/workshop2/c/${COLLECTION}/a/${ARTICLE}?w2pane=tz&w2sec=material`,
      { waitUntil: 'domcontentloaded', timeout: 90_000 }
    );
    await expect(page.getByTestId('brand-dossier-factory-diff-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId(BRAND_DOSSIER_FACTORY_DIFF_MFR_COMMENTS_LINK_TESTID)).toBeVisible();
    const mfrCommentsHref = await page
      .getByTestId(BRAND_DOSSIER_FACTORY_DIFF_MFR_COMMENTS_LINK_TESTID)
      .getAttribute('href');
    expect(mfrCommentsHref).toContain('/factory/production/dossier/');
    expect(mfrCommentsHref).toContain('mfr-dev-dossier-annotation');
  });
});
