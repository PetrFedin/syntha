import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const COLLECTION = 'SS27';
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WT: brand W2 hub sample-status SSE + cabinet PG sync live badge + webhook bump.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-183-wave-wt-w2-sse.spec.ts
 */
test.describe('core-183: wave WT brand W2 sample SSE', () => {
  test('health: sampleStatusSseMode согласован с development hub', async ({ request }) => {
    const res = await request.get('/api/workshop2/platform-core/health');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      sampleStatusSseMode?: string;
      chainStatusSseMode?: string;
      redisConfigured?: boolean;
    };
    expect(json.ok).toBe(true);
    const expectedMode = process.env.REDIS_URL?.trim() ? 'poll+bump+redis' : 'poll+bump';
    expect(json.sampleStatusSseMode).toBe(expectedMode);
    expect(json.chainStatusSseMode).toBe(expectedMode);
    expect(json.redisConfigured).toBe(expectedMode === 'poll+bump+redis');
  });

  test('sample-status-stream: SSE заголовок согласован с health', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { sampleStatusSseMode?: string; demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const streamUrl = `/api/workshop2/hub/sample-status-stream?collectionId=${COLLECTION}`;
    const sseHeader = await page.evaluate(async (url) => {
      const ac = new AbortController();
      const timer = window.setTimeout(() => ac.abort(), 10_000);
      try {
        const res = await fetch(url, { signal: ac.signal });
        return {
          ok: res.ok,
          contentType: res.headers.get('content-type'),
          sseMode: res.headers.get('x-platform-core-sample-sse'),
        };
      } catch {
        return null;
      } finally {
        window.clearTimeout(timer);
      }
    }, streamUrl);

    expect(sseHeader?.ok).toBe(true);
    expect(sseHeader?.contentType).toContain('text/event-stream');
    expect(sseHeader?.sseMode).toBe(health.sampleStatusSseMode);
  });

  test('brand dev cabinet: PG sync peer live badge (не poll-only strip)', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoRoleCoreCabinet(page, `/brand/core?pillar=development&collection=${COLLECTION}`);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-dev-pg-sync-peer-strip')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('brand-dev-pg-sync-peer-strip')).toHaveAttribute(
      'data-pg-sync-sse-live',
      /[01]/
    );
    const sseOrPoll = page
      .getByTestId('brand-dev-development-sse-live-badge')
      .or(page.getByTestId('brand-dev-development-poll-badge'));
    await expect(sseOrPoll.first()).toBeVisible();
  });

  test('brand W2 hub: rollup SSE badge без дубля publish strip', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto(`/brand/production/workshop2?w2col=${COLLECTION}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('workshop2-hub-production-rollup')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('brand-w2-sample-status-sse-badge')).toHaveCount(0);
    const sseOrPoll = page
      .getByTestId('brand-w2-sample-status-sse-live')
      .or(page.getByTestId('brand-w2-sample-status-sse-poll'));
    await expect(sseOrPoll.first()).toBeVisible();
  });

  test('sample state-change webhook POST → journal + SSE bump path', async ({ request }) => {
    const eventId = `wt-webhook-${Date.now()}`;
    const res = await request.post('/api/workshop2/samples/state-change-webhook', {
      data: {
        collectionId: COLLECTION,
        articleId: 'demo-ss27-01',
        eventId,
        fromStatus: 'draft',
        toStatus: 'sent',
        orderId: 'sample-wt-1',
      },
    });
    const json = (await res.json()) as {
      ok?: boolean;
      journalRecorded?: boolean;
      messageRu?: string;
    };
    if (res.status() === 503) {
      test.skip(true, 'webhook disabled');
    }
    expect(res.ok()).toBeTruthy();
    expect(json.ok).toBe(true);
    expect(json.journalRecorded).toBe(true);
    expect(json.messageRu?.length).toBeGreaterThan(0);
  });
});
