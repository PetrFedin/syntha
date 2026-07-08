import type { BrandPgThreadRow } from '@/lib/brand/brand-messages-pg-threads';
import { buildPgB2bOrderChatId } from '@/lib/brand/brand-messages-pg-threads';
import { workshop2B2bOrderContextId } from '@/lib/production/workshop2-b2b-order-lifecycle';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isPgSectionVisited } from '@/lib/communications/pg-contextual-section-read-state';

/** Comms pillar sections that map 1:1 to order-level PG thread unread. */
export const PG_ORDER_CHAT_SECTION_IDS = new Set([
  'brand-cm-order-chat',
  'shop-cm-order-chat',
  'mfr-cm-order-chat',
  'sup-cm-order-chat',
]);

function sectionMentionedInPreview(
  preview: string,
  pillarId: CoreHubPillarId,
  sectionId: string
): boolean {
  const p = preview.toLowerCase();
  if (p.includes(sectionId.toLowerCase())) return true;
  return p.includes(`${pillarId}/${sectionId}`.toLowerCase());
}

export function findPgB2bOrderThread(
  threads: BrandPgThreadRow[],
  orderId: string
): BrandPgThreadRow | null {
  const contextId = workshop2B2bOrderContextId(orderId.trim());
  return threads.find((t) => t.contextType === 'b2b_order' && t.contextId === contextId) ?? null;
}

/** Unread count for a section-group chip (order chat = full; others = section-tagged preview). */
export function computeSectionGroupUnread(input: {
  orderId: string;
  pillarId: CoreHubPillarId;
  sectionId: string;
  unreadByChat: Record<string, number>;
  orderThread?: BrandPgThreadRow | null;
  serverVisitedKeys?: ReadonlySet<string>;
}): number {
  const orderId = input.orderId.trim();
  if (!orderId) return 0;

  const chatId = buildPgB2bOrderChatId(orderId);
  const orderUnread = input.unreadByChat[chatId] ?? 0;
  if (orderUnread <= 0) return 0;

  if (PG_ORDER_CHAT_SECTION_IDS.has(input.sectionId)) {
    return orderUnread;
  }

  if (isPgSectionVisited(orderId, input.pillarId, input.sectionId, input.serverVisitedKeys)) {
    return 0;
  }

  const preview = input.orderThread?.lastMessagePreview ?? '';
  if (sectionMentionedInPreview(preview, input.pillarId, input.sectionId)) {
    return Math.min(orderUnread, 99);
  }

  return 0;
}

export function commsSectionGroupUnreadTestId(
  variant: 'brand' | 'shop' | 'manufacturer' | 'supplier',
  sectionId: string
): string {
  const prefix =
    variant === 'shop'
      ? 'shop-cm'
      : variant === 'manufacturer'
        ? 'mfr-cm'
        : variant === 'supplier'
          ? 'sup-cm'
          : 'brand-cm';
  return `${prefix}-section-group-${sectionId}-unread`;
}
