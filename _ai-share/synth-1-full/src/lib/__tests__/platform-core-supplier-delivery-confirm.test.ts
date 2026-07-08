import {
  clearPlatformCoreUserCalendarTasksForTests,
  listPlatformCoreUserCalendarTasks,
} from '@/lib/server/platform-core-user-calendar-task';
import {
  ensurePlatformCoreSupplierDeliveryConfirmEvent,
  supplierDeliveryConfirmTaskId,
} from '@/lib/server/platform-core-supplier-delivery-confirm';

describe('platform-core-supplier-delivery-confirm', () => {
  beforeEach(() => {
    clearPlatformCoreUserCalendarTasksForTests();
  });

  it('creates idempotent delivery confirm calendar task', async () => {
    const first = await ensurePlatformCoreSupplierDeliveryConfirmEvent({
      collectionId: 'SS27',
      b2bOrderId: 'B2B-9001',
      articleId: 'demo-ss27-01',
      confirmedCount: 3,
      productionOrderId: 'PO-B2B-9001',
    });
    expect(first.created).toBe(true);

    const events = await listPlatformCoreUserCalendarTasks({
      collectionId: 'SS27',
      orderId: 'B2B-9001',
    });
    expect(events.some((e) => e.id === supplierDeliveryConfirmTaskId('B2B-9001'))).toBe(true);
    expect(events[0]?.kind).toBe('delivery_window');

    const second = await ensurePlatformCoreSupplierDeliveryConfirmEvent({
      collectionId: 'SS27',
      b2bOrderId: 'B2B-9001',
      articleId: 'demo-ss27-01',
      confirmedCount: 3,
    });
    expect(second.created).toBe(false);
    expect(
      await listPlatformCoreUserCalendarTasks({ collectionId: 'SS27', orderId: 'B2B-9001' })
    ).toHaveLength(1);
  });
});
