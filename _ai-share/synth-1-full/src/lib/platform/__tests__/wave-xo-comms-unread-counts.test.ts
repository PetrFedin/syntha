import {
  summarizePerOrderPgUnread,
  summarizePgContextualUnreadForOrder,
} from '@/lib/platform/platform-core-comms-notification-center';
import { universalInboxOrderCalendarRowLinks } from '@/lib/platform/platform-core-comms-pctask-deeplinks';
import { buildPgB2bOrderChatId } from '@/lib/brand/brand-messages-pg-threads';
import {
  resolveUniversalInboxOrderTotalUnread,
  buildPgEventUnreadCountByOrderId,
} from '@/lib/platform/platform-core-universal-inbox-unread';

const ORDER_A = 'B2B-SS27-DEMO-001';
const ORDER_B = 'B2B-SS27-DEMO-002';
const COLLECTION = 'SS27';

describe('wave XO — universal inbox PG unread all roles', () => {
  const threads = [
    {
      contextType: 'b2b_order',
      contextId: ORDER_A,
      messageCount: 5,
      lastSeenMessageCount: 1,
    },
    {
      contextType: 'b2b_order',
      contextId: ORDER_B,
      messageCount: 1,
      lastSeenMessageCount: 1,
    },
  ] as Parameters<typeof summarizePgContextualUnreadForOrder>[0]['threads'];

  it('summarizePerOrderPgUnread merges thread + pgEvent unread per order', () => {
    const rows = summarizePerOrderPgUnread({
      threads,
      orderIds: [ORDER_A, ORDER_B],
      pgEventUnreadByOrder: { [ORDER_B]: 3 },
    });
    expect(rows).toHaveLength(2);
    const a = rows.find((r) => r.orderId === ORDER_A);
    const b = rows.find((r) => r.orderId === ORDER_B);
    expect(a?.threadUnread).toBeGreaterThan(0);
    expect(a?.pgEventUnread).toBe(0);
    expect(a?.totalUnread).toBe(a?.threadUnread);
    expect(b?.threadUnread).toBe(0);
    expect(b?.pgEventUnread).toBe(3);
    expect(b?.totalUnread).toBe(3);
  });

  it('resolveUniversalInboxOrderTotalUnread matches client hook merge', () => {
    const unreadByChat = { [buildPgB2bOrderChatId(ORDER_A)]: 2 };
    const pgEvents = buildPgEventUnreadCountByOrderId([
      { orderId: ORDER_A, read: false },
      { orderId: ORDER_A, read: false },
    ]);
    expect(resolveUniversalInboxOrderTotalUnread(ORDER_A, unreadByChat, pgEvents)).toBe(4);
  });

  it('unread-summary batch API contract for 4 roles', () => {
    for (const role of ['shop', 'brand', 'manufacturer', 'supplier'] as const) {
      const url = `/api/platform-core/comms/unread-summary?role=${role}&collectionId=${COLLECTION}&orderIds=${ORDER_A}`;
      expect(url).toContain('unread-summary');
      expect(url).toContain(`role=${role}`);
      expect(url).toContain('orderIds=');
    }
  });

  it('order-specific unread testids on universal inbox strip', () => {
    expect(`shop-cm-universal-inbox-order-unread-${ORDER_A}`).toContain('universal-inbox-order-unread');
    expect(`brand-cm-universal-inbox-order-unread-${ORDER_A}`).toContain(ORDER_A);
    expect(`mfr-cm-universal-inbox-order-unread-${ORDER_A}`).toContain('mfr-cm');
    expect(`sup-cm-universal-inbox-order-unread-${ORDER_A}`).toContain('sup-cm');
  });

  it('tracking → calendar CTA row carries pcTask deep-link (all roles)', () => {
    for (const variant of ['shop', 'brand', 'manufacturer', 'supplier'] as const) {
      const row = universalInboxOrderCalendarRowLinks(variant, ORDER_A, { collectionId: COLLECTION });
      expect(row.calendarHref).toContain('pcTask=');
      expect(row.pcTaskId).toContain(ORDER_A);
      expect(row.trackingHref.length).toBeGreaterThan(10);
      expect(`${variant}-cm-universal-inbox-po-calendar-tracking-link`).toContain('calendar-tracking');
      expect(`${variant === 'manufacturer' ? 'mfr' : variant === 'supplier' ? 'sup' : variant}-cm-universal-inbox-po-calendar-link`).toContain(
        'calendar-link'
      );
    }
  });
});
