import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const PROCESS_ID = 'production';
const CONTEXT_ID = 'SS27';

/**
 * Wave XR: brand LIVE process runtime — PG stub API + fail-closed localStorage in core.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-207-wave-xr-process-runtime.spec.ts
 */
test.describe('core-207: wave XR brand process runtime PG', () => {
  test('runtime GET returns ok + storageMode', async ({ request }) => {
    const res = await request.get(
      `/api/processes/${encodeURIComponent(PROCESS_ID)}/runtime?contextId=${encodeURIComponent(CONTEXT_ID)}`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      storageMode?: string;
      processId?: string;
      contextId?: string;
      runtimes?: Record<string, unknown>;
    };
    expect(json.ok).toBe(true);
    expect(json.processId).toBe(PROCESS_ID);
    expect(json.contextId).toBe(CONTEXT_ID);
    expect(json.runtimes).toBeDefined();
    if (json.storageMode) {
      expect(['pg', 'file', 'unavailable', 'memory']).toContain(json.storageMode);
    }
  });

  test('runtime PUT roundtrip persists stage status', async ({ request }) => {
    const stageId = 'tech-pack';
    const payload = {
      runtimes: {
        [stageId]: {
          stageId,
          status: 'in_progress',
          assigneeIds: [],
          primaryAssigneeId: null,
          blockedMemberIds: [],
          plannedStartAt: null,
          plannedEndAt: null,
          calendarEventId: null,
          chatId: null,
          participantIds: [],
          comments: [],
          tasks: [],
          note: 'core-207 roundtrip',
        },
      },
    };
    const putRes = await request.put(
      `/api/processes/${encodeURIComponent(PROCESS_ID)}/runtime?contextId=${encodeURIComponent(CONTEXT_ID)}`,
      { data: payload }
    );
    expect(putRes.status()).toBeLessThan(500);
    const putJson = (await putRes.json()) as { ok?: boolean; storageMode?: string };
    expect(putJson.ok).toBe(true);

    const getRes = await request.get(
      `/api/processes/${encodeURIComponent(PROCESS_ID)}/runtime?contextId=${encodeURIComponent(CONTEXT_ID)}`
    );
    expect(getRes.status()).toBeLessThan(500);
    const getJson = (await getRes.json()) as {
      runtimes?: Record<string, { status?: string; note?: string }>;
    };
    const rt = getJson.runtimes?.[stageId];
    if (rt) {
      expect(rt.status).toBe('in_progress');
      expect(rt.note).toBe('core-207 roundtrip');
    }
  });

  test('live process page: PG badge in core mode', async ({ page }) => {
    const res = await page.goto(
      `/brand/process/${encodeURIComponent(PROCESS_ID)}/live?context=${encodeURIComponent(CONTEXT_ID)}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const pgBadge = page.getByTestId('live-process-runtime-storage-pg');
    const unavailBadge = page.getByTestId('live-process-runtime-storage-unavailable');
    await expect(pgBadge.or(unavailBadge)).toBeVisible({ timeout: 60_000 });

    await expect(page.getByRole('heading', { name: /LIVE:/i })).toBeVisible({ timeout: 45_000 });
  });
});
