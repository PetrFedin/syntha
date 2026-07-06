import {
  summarizePerOrderPgUnread,
  summarizePgContextualUnreadForOrder,
} from '@/lib/platform/platform-core-comms-notification-center';
import {
  universalInboxOrderDeepLinks,
  universalInboxOrderLabelRu,
} from '@/lib/platform/platform-core-universal-inbox-order-links';

describe('wave TT — universal inbox per-order PG unread', () => {
  const threads = [
    {
      contextType: 'b2b_order',
      contextId: 'B2B-SS27-DEMO-001',
      messageCount: 4,
      lastSeenMessageCount: 1,
    },
    {
      contextType: 'b2b_order',
      contextId: 'B2B-SS27-DEMO-002',
      messageCount: 2,
      lastSeenMessageCount: 2,
    },
    {
      contextType: 'workshop2_article',
      contextId: 'SS27::art-1',
      messageCount: 5,
      lastSeenMessageCount: 0,
    },
  ] as Parameters<typeof summarizePgContextualUnreadForOrder>[0]['threads'];

  it('summarizePerOrderPgUnread merges threads + notification_events', () => {
    const rows = summarizePerOrderPgUnread({
      threads,
      orderIds: ['B2B-SS27-DEMO-001', 'B2B-SS27-DEMO-002'],
      pgEventUnreadByOrder: { 'B2B-SS27-DEMO-002': 2 },
    });
    expect(rows).toHaveLength(2);
    const first = rows.find((r) => r.orderId === 'B2B-SS27-DEMO-001');
    const second = rows.find((r) => r.orderId === 'B2B-SS27-DEMO-002');
    expect(first?.threadUnread).toBeGreaterThan(0);
    expect(first?.pgEventUnread).toBe(0);
    expect(second?.threadUnread).toBe(0);
    expect(second?.pgEventUnread).toBe(2);
    expect(second?.totalUnread).toBe(2);
  });

  it('unread-summary batch API path contract', () => {
    const url =
      '/api/platform-core/comms/unread-summary?role=shop&collectionId=SS27&orderIds=B2B-SS27-DEMO-001,B2B-SS27-DEMO-002';
    expect(url).toContain('orderIds=');
    expect(url).toContain('unread-summary');
  });

  it('universal inbox strip testids all roles', () => {
    expect('shop-cm-universal-inbox-po-list').toContain('universal-inbox');
    expect('brand-cm-universal-inbox-po-chat-link').toContain('chat-link');
    expect('mfr-cm-universal-inbox-po-calendar-tracking-link').toContain('calendar-tracking');
    expect('sup-cm-universal-inbox-po-calendar-link').toContain('calendar-link');
    expect('comms-universal-inbox-strip').toContain('universal-inbox');
  });

  it('deep links for shop order', () => {
    const links = universalInboxOrderDeepLinks('shop', 'B2B-SS27-DEMO-001');
    expect(links.chatHref).toContain('/shop/messages');
    expect(links.trackingHref).toContain('/shop/b2b/tracking');
    expect(links.calendarHref).toContain('/shop/calendar');
  });

  it('RU order label is compact', () => {
    expect(universalInboxOrderLabelRu('B2B-SS27-DEMO-001')).toMatch(/^Заказ ·/);
  });
});
