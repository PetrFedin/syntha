import {
  clearPlatformCoreUserCalendarTasksForTests,
  createPlatformCoreUserCalendarTask,
  listPlatformCoreUserCalendarTasks,
} from '@/lib/server/platform-core-user-calendar-task';

const pgMemoryByCollection = new Map<
  string,
  import('@/lib/server/platform-core-user-calendar-task').PlatformCoreUserCalendarTask[]
>();

jest.mock('@/lib/server/platform-core-user-calendar-task-repository', () => ({
  clearPlatformCoreUserCalendarTaskPgMemoryForTests: () => pgMemoryByCollection.clear(),
  listPlatformCoreUserCalendarTasksPg: jest.fn(
    async (input: { collectionId: string; orderId?: string }) => {
      const collectionId = input.collectionId.trim();
      const orderId = input.orderId?.trim();
      const tasks = pgMemoryByCollection.get(collectionId) ?? [];
      return tasks.filter((t) => !orderId || t.orderId?.trim() === orderId);
    }
  ),
  upsertPlatformCoreUserCalendarTaskPg: jest.fn(
    async (
      task: import('@/lib/server/platform-core-user-calendar-task').PlatformCoreUserCalendarTask
    ) => {
      const existing = pgMemoryByCollection.get(task.collectionId) ?? [];
      pgMemoryByCollection.set(task.collectionId, [
        ...existing.filter((t) => t.id !== task.id),
        task,
      ]);
      return task;
    }
  ),
}));

jest.mock('@/lib/server/workshop2-pg-pool', () => ({
  isWorkshop2PostgresEnabled: jest.fn(() => false),
  getWorkshop2PgPool: jest.fn(),
}));

jest.mock('@/lib/server/platform-core-pg-primary-file-policy', () => ({
  shouldPlatformCorePersistAuxiliaryToFile: jest.fn(() => true),
  shouldPlatformCoreReadAuxiliaryFromFile: jest.fn(() => true),
}));

jest.mock('@/lib/server/ensure-b2b-order-contextual-thread', () => ({
  ensureB2bOrderContextualThread: jest.fn(async () => ({
    ok: true,
    orderId: 'B2B-1001',
    contextId: 'b2b_order:B2B-1001',
    created: true,
    messageCount: 1,
  })),
}));

const isWorkshop2PostgresEnabled = jest.requireMock('@/lib/server/workshop2-pg-pool')
  .isWorkshop2PostgresEnabled as jest.Mock;

describe('platform-core-user-calendar-task', () => {
  beforeEach(() => {
    clearPlatformCoreUserCalendarTasksForTests();
    pgMemoryByCollection.clear();
    isWorkshop2PostgresEnabled.mockReturnValue(false);
  });

  it('creates task with order thread and lists in calendar events', async () => {
    const { event, targetChatId } = await createPlatformCoreUserCalendarTask({
      collectionId: 'SS27',
      ownerRole: 'brand',
      title: 'Согласовать окно поставки',
      startAt: '2026-06-12T10:00',
      endAt: '2026-06-12T11:00',
      orderId: 'B2B-1001',
    });
    expect(event.id).toMatch(/^pc-task-/);
    expect(event.b2bOrderId).toBe('B2B-1001');
    expect(targetChatId).toContain('B2B-1001');
    const listed = await listPlatformCoreUserCalendarTasks({ collectionId: 'SS27' });
    expect(listed.some((e) => e.id === event.id)).toBe(true);
  });

  it('lists calendar tasks from PG only when postgres enabled (no file merge)', async () => {
    isWorkshop2PostgresEnabled.mockReturnValue(true);
    const { event } = await createPlatformCoreUserCalendarTask({
      collectionId: 'SS27',
      ownerRole: 'brand',
      title: 'PG slot',
      startAt: '2026-06-12T10:00',
      endAt: '2026-06-12T11:00',
      orderId: 'B2B-2001',
    });
    const listed = await listPlatformCoreUserCalendarTasks({ collectionId: 'SS27' });
    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(event.id);
    expect(listed[0]?.b2bOrderId).toBe('B2B-2001');
  });
});
