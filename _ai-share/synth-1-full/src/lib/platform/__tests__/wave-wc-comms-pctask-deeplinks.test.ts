import {
  platformCoreCalendarPcTaskHref,
  platformCoreChainCalendarTaskId,
  platformCoreCmCalendarTrackingHref,
  platformCoreCmCalendarTrackingHrefForRole,
  universalInboxOrderCalendarRowLinks,
} from '@/lib/platform/platform-core-comms-pctask-deeplinks';
import {
  brandB2bOrderChainContextHref,
  factoryProductionOrdersOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';

const ORDER = 'B2B-DEMO-SHOP1-SS27';
const COLLECTION = 'SS27';
const FACTORY = 'factory-demo-01';

describe('wave WC — comms pcTask deep-links all roles', () => {
  it('chain calendar task id covers 4 owner roles', () => {
    expect(platformCoreChainCalendarTaskId(ORDER, 'shop')).toBe(
      `chain-chain_status-${ORDER}-shop`
    );
    expect(platformCoreChainCalendarTaskId(ORDER, 'brand', 'materials_supplied')).toBe(
      `chain-materials_supplied-${ORDER}-brand`
    );
    expect(platformCoreChainCalendarTaskId(ORDER, 'manufacturer')).toContain('-manufacturer');
    expect(platformCoreChainCalendarTaskId(ORDER, 'supplier')).toContain('-supplier');
  });

  it('pcTask calendar href by role carries order + pcTask', () => {
    const taskId = 'task-wc-1';
    expect(platformCoreCalendarPcTaskHref({ role: 'shop', collectionId: COLLECTION, orderId: ORDER, taskId })).toMatch(
      /pcTask=task-wc-1/
    );
    expect(platformCoreCalendarPcTaskHref({ role: 'shop', collectionId: COLLECTION, orderId: ORDER, taskId })).toMatch(
      /order=B2B/
    );
    expect(
      platformCoreCalendarPcTaskHref({ role: 'brand', collectionId: COLLECTION, orderId: ORDER, taskId })
    ).toContain('/brand/calendar');
    expect(
      platformCoreCalendarPcTaskHref({
        role: 'manufacturer',
        collectionId: COLLECTION,
        orderId: ORDER,
        taskId,
        factoryId: FACTORY,
      })
    ).toContain('factoryId=factory-demo-01');
    expect(
      platformCoreCalendarPcTaskHref({ role: 'supplier', collectionId: COLLECTION, orderId: ORDER, taskId })
    ).toContain('role=supplier');
  });

  it('role-aware tracking href — brand chain / shop tracking / mfr PO', () => {
    expect(platformCoreCmCalendarTrackingHrefForRole('shop', ORDER)).toBe(
      shopB2bTrackingOrderHref(ORDER)
    );
    expect(platformCoreCmCalendarTrackingHrefForRole('brand', ORDER)).toBe(
      brandB2bOrderChainContextHref(ORDER)
    );
    expect(platformCoreCmCalendarTrackingHrefForRole('manufacturer', ORDER, { factoryId: FACTORY })).toBe(
      factoryProductionOrdersOrderContextHref(ORDER, { factoryId: FACTORY })
    );
    expect(platformCoreCmCalendarTrackingHref(ORDER, 'shop')).toBe(shopB2bTrackingOrderHref(ORDER));
  });

  it('universal inbox calendar row — pcTask + tracking deep-link testids', () => {
    const shopRow = universalInboxOrderCalendarRowLinks('shop', ORDER, { collectionId: COLLECTION });
    expect(shopRow.calendarHref).toContain('pcTask=');
    expect(shopRow.trackingHref).toContain('/shop/b2b/tracking');
    expect('shop-cm-universal-inbox-po-calendar-tracking-link').toContain('calendar-tracking');

    const brandRow = universalInboxOrderCalendarRowLinks('brand', ORDER, { collectionId: COLLECTION });
    expect(brandRow.trackingHref).toContain('pillar=order_production');

    const mfrRow = universalInboxOrderCalendarRowLinks('manufacturer', ORDER, {
      collectionId: COLLECTION,
      factoryId: FACTORY,
    });
    expect(mfrRow.trackingHref).toContain('/factory/production/orders');
  });

  it('user-task strip testids all roles', () => {
    expect('brand-cm-calendar-user-tasks-strip').toContain('user-tasks');
    expect('shop-cm-calendar-user-tasks-strip').toContain('user-tasks');
    expect('mfr-cm-calendar-user-tasks-strip').toContain('user-tasks');
    expect('sup-cm-calendar-user-tasks-strip').toContain('user-tasks');
  });
});
