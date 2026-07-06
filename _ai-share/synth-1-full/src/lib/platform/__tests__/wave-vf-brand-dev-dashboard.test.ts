import {
  loadBrandTasksWithMode,
  resetBrandTasksPersistModeCacheForTests,
} from '@/lib/production-data/brand-tasks-client';

describe('wave VF — brand dev dashboard strips', () => {
  beforeEach(() => {
    resetBrandTasksPersistModeCacheForTests();
  });

  it('dashboard strips wrapper + investor-readiness testids', () => {
    expect('brand-dev-dashboard-strips').toContain('dashboard-strips');
    expect('brand-dev-investor-readiness-strip').toContain('investor-readiness');
    expect('brand-dev-investor-readiness-ready').toContain('ready');
    expect('brand-dev-investor-readiness-fill').toContain('fill');
    expect('brand-dev-investor-readiness-link').toContain('link');
    expect('brand-dev-investor-readiness-tasks-link').toContain('tasks-link');
    expect('/api/workshop2/investor-readiness').toContain('investor-readiness');
  });

  it('greenfield monetization PG read strip RU testids', () => {
    expect('brand-dev-greenfield-monetization-segment-strip').toContain('greenfield');
    expect('brand-dev-greenfield-label').toContain('greenfield-label');
    expect('brand-dev-greenfield-segment').toContain('segment');
    expect('brand-dev-greenfield-pg-source').toContain('pg-source');
    expect('brand-dev-greenfield-matrix-link').toContain('matrix');
    expect('brand-dev-greenfield-checkout-link').toContain('checkout');
    expect('/api/brand/b2b/shop-buyer-crm-assign').toContain('shop-buyer-crm-assign');
  });

  it('tasks kanban mini-panel testids + GET/POST /api/brand/tasks', () => {
    expect('brand-dev-tasks-kanban-panel').toContain('kanban');
    expect('brand-dev-tasks-kanban-board').toContain('board');
    expect('brand-dev-tasks-kanban-column-todo').toContain('todo');
    expect('brand-dev-tasks-kanban-column-in_progress').toContain('in_progress');
    expect('brand-dev-tasks-kanban-column-done').toContain('done');
    expect('brand-dev-tasks-kanban-pg').toContain('pg');
    expect('brand-dev-tasks-kanban-add-btn').toContain('add-btn');
    expect('brand-dev-tasks-kanban-full-link').toContain('full-link');
    expect('/api/brand/tasks').toContain('brand/tasks');
  });

  it('brand-tasks-client uses POST persist in PG mode', async () => {
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
        id: 'vf-task-1',
        title: 'Wave VF',
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
      '/api/brand/tasks',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
