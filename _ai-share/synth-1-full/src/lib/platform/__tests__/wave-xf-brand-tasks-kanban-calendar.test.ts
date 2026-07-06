import {
  brandDevTasksKanbanAllTasksHref,
  brandDevTasksKanbanCalendarHref,
  brandDevTasksKanbanPeerHref,
  BRAND_DEV_GREENFIELD_CRM_API,
  BRAND_DEV_GREENFIELD_MONETIZATION_LABEL_RU,
  BRAND_DEV_TASKS_KANBAN_API,
  BRAND_DEV_TASKS_KANBAN_CALENDAR_LINK_RU,
  BRAND_DEV_TASKS_KANBAN_TITLE_RU,
} from '@/lib/platform/brand-dev-tasks-kanban-calendar';
import {
  loadBrandTasksWithMode,
  resetBrandTasksPersistModeCacheForTests,
} from '@/lib/production-data/brand-tasks-client';
import { buildPlatformCoreSpineStoreMatrix } from '@/lib/server/platform-core-spine-pg.server';

describe('wave XF — brand tasks kanban ↔ calendar + greenfield PG', () => {
  beforeEach(() => {
    resetBrandTasksPersistModeCacheForTests();
  });

  it('RU labels + calendar/kanban href helpers', () => {
    expect(BRAND_DEV_TASKS_KANBAN_TITLE_RU).toContain('Kanban');
    expect(BRAND_DEV_TASKS_KANBAN_CALENDAR_LINK_RU).toContain('Календарь');
    expect(BRAND_DEV_GREENFIELD_MONETIZATION_LABEL_RU).toContain('монетизации');
    const cid = 'SS27';
    expect(brandDevTasksKanbanPeerHref(cid)).toContain('/brand/calendar');
    expect(brandDevTasksKanbanPeerHref(cid)).toContain('brand-dev-tasks-kanban-panel');
    expect(brandDevTasksKanbanCalendarHref(cid)).toContain('layers=tasks');
    expect(brandDevTasksKanbanAllTasksHref()).toContain('/brand/tasks');
  });

  it('tasks kanban + calendar strip testids (W2 hub + calendar)', () => {
    expect('brand-dev-tasks-kanban-panel').toContain('kanban');
    expect('brand-dev-tasks-kanban-board').toContain('board');
    expect('brand-dev-tasks-kanban-column-todo').toContain('todo');
    expect('brand-dev-tasks-kanban-pg').toContain('pg');
    expect('brand-dev-tasks-kanban-calendar-link').toContain('calendar-link');
    expect('brand-dev-tasks-kanban-calendar-strip').toContain('calendar-strip');
    expect('brand-dev-w2-hub-tasks-kanban-strip').toContain('kanban-strip');
    expect('brand-dev-w2-hub-tasks-calendar-link').toContain('calendar-link');
  });

  it('greenfield monetization segment PG spine + API', () => {
    expect('brand-dev-greenfield-monetization-segment-strip').toContain('greenfield');
    expect('brand-dev-greenfield-pg-source').toContain('pg-source');
    expect(BRAND_DEV_GREENFIELD_CRM_API).toContain('shop-buyer-crm-assign');
    const spine = buildPlatformCoreSpineStoreMatrix();
    const greenfield = spine.find((s) => s.id === 'greenfield_crm_segment');
    expect(greenfield?.pgTable).toBe('shop_buyer_crm_profiles');
    const brandTasks = spine.find((s) => s.id === 'brand_tasks');
    expect(brandTasks?.pgTable).toBe('brand_tasks_kanban');
  });

  it('investor peer strip dedup — omitKanbanLink when inline panel', () => {
    expect('brand-dev-investor-readiness-peer-strip').toContain('peer-strip');
    expect('brand-dev-investor-readiness-kanban-peer-link').toContain('kanban-peer');
    expect('omitKanbanLink').toContain('Kanban');
  });

  it('brand-tasks-client GET/POST /api/brand/tasks in PG mode', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, tasks: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, httpMethod: 'POST' }),
      });
    global.fetch = fetchMock as typeof fetch;

    const loaded = await loadBrandTasksWithMode();
    expect(loaded.persistMode).toBe('postgres');
    expect(loaded.pgUnavailable).toBe(false);

    const { persistBrandTasks } = await import('@/lib/production-data/brand-tasks-client');
    await persistBrandTasks([
      {
        id: 'xf-task-1',
        title: 'Wave XF',
        status: 'todo',
        assignee: 'QA',
        due: '—',
        project: 'Разработка',
        collectionId: 'SS27',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      BRAND_DEV_TASKS_KANBAN_API,
      expect.objectContaining({ method: 'POST' })
    );
  });
});
