import type { BrandPgThreadRow } from '@/lib/brand/brand-messages-pg-threads';
import {
  buildPgUnreadCountByChat,
  pgThreadToChatId,
} from '@/lib/communications/pg-contextual-unread-metrics';
import { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE } from '@/lib/production/workshop2-b2b-order-lifecycle';

export type PerOrderPgUnreadRow = {
  orderId: string;
  threadUnread: number;
  pgEventUnread: number;
  totalUnread: number;
};

export function filterPgContextualThreadsForOrder(
  threads: readonly BrandPgThreadRow[],
  orderId: string,
  orderScoped: boolean
): BrandPgThreadRow[] {
  const oid = orderId.trim();
  if (!orderScoped || !oid) return [...threads];
  return threads.filter((t) => t.contextType === 'b2b_order' && t.contextId.trim() === oid);
}

export function summarizePgContextualUnreadForOrder(input: {
  threads: readonly BrandPgThreadRow[];
  orderId: string;
  orderScoped?: boolean;
}): {
  totalUnread: number;
  unreadThreads: Array<{ chatId: string; unread: number }>;
} {
  const scoped = filterPgContextualThreadsForOrder(
    input.threads,
    input.orderId,
    input.orderScoped ?? true
  );
  const unreadByChat = buildPgUnreadCountByChat(scoped);
  const unreadThreads = scoped
    .map((t) => ({
      chatId: pgThreadToChatId(t),
      unread: unreadByChat[pgThreadToChatId(t)] ?? 0,
    }))
    .filter((row) => row.unread > 0);
  const totalUnread = unreadThreads.reduce((sum, row) => sum + row.unread, 0);
  return { totalUnread, unreadThreads };
}

/** PG unread по каждому B2B-заказу: треды + notification_events (Wave TT). */
export function summarizePerOrderPgUnread(input: {
  threads: readonly BrandPgThreadRow[];
  orderIds: readonly string[];
  pgEventUnreadByOrder?: Readonly<Record<string, number>>;
}): PerOrderPgUnreadRow[] {
  const orderIds = [...new Set(input.orderIds.map((id) => id.trim()).filter(Boolean))];
  if (orderIds.length === 0) return [];

  const orderIdSet = new Set(orderIds);
  const threadUnreadByOrder = new Map<string, number>();

  for (const t of input.threads) {
    if (t.contextType !== WORKSHOP2_B2B_ORDER_CONTEXT_TYPE) continue;
    const oid = t.contextId?.trim();
    if (!oid || !orderIdSet.has(oid)) continue;
    const unreadByChat = buildPgUnreadCountByChat([t]);
    const unread = unreadByChat[pgThreadToChatId(t)] ?? 0;
    if (unread > 0) {
      threadUnreadByOrder.set(oid, (threadUnreadByOrder.get(oid) ?? 0) + unread);
    }
  }

  return orderIds.map((orderId) => {
    const threadUnread = threadUnreadByOrder.get(orderId) ?? 0;
    const pgEventUnread = input.pgEventUnreadByOrder?.[orderId] ?? 0;
    return {
      orderId,
      threadUnread,
      pgEventUnread,
      totalUnread: threadUnread + pgEventUnread,
    };
  });
}
