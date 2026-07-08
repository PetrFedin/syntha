import { buildPgB2bOrderChatId } from '@/lib/brand/brand-messages-pg-threads';

/** Unread PG notification_events grouped by orderId (S4). */
export function buildPgEventUnreadCountByOrderId(
  events: ReadonlyArray<{ orderId?: string; read?: boolean }>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of events) {
    if (e.read) continue;
    const oid = e.orderId?.trim();
    if (!oid) continue;
    out[oid] = (out[oid] ?? 0) + 1;
  }
  return out;
}

/** Thread unread for a B2B order from PG contextual chat map. */
export function resolveUniversalInboxOrderThreadUnread(
  orderId: string,
  unreadByChat: Record<string, number>
): number {
  const id = orderId.trim();
  if (!id) return 0;
  return unreadByChat[buildPgB2bOrderChatId(id)] ?? 0;
}

/** Total unread per order: contextual thread + pgEventUnread (not placeholder dot). */
export function resolveUniversalInboxOrderTotalUnread(
  orderId: string,
  unreadByChat: Record<string, number>,
  pgEventUnreadByOrder: Record<string, number>
): number {
  const id = orderId.trim();
  if (!id) return 0;
  return resolveUniversalInboxOrderThreadUnread(id, unreadByChat) + (pgEventUnreadByOrder[id] ?? 0);
}
