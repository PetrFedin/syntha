/**
 * Wave 28: маппинг PG contextual threads → Chat list для /brand/messages (RU, без demo).
 */
import type { Chat } from '@/lib/types';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { WAVE_YN_PLACEHOLDER_SUBTITLE_RU } from '@/lib/platform/wave-yn-comms-contextual-thread';

export type BrandPgThreadRow = {
  contextType: string;
  contextId: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  messageCount: number;
  /** Wave 33: server read receipt (per actor), when threads fetched with readerId. */
  lastSeenMessageCount?: number;
  collectionId?: string;
  articleId?: string;
  workspaceHref?: string;
};

export function mapBrandPgThreadsToChats(threads: BrandPgThreadRow[]): Chat[] {
  return threads.map((t) => {
    const cid = t.collectionId?.trim() ?? '';
    const aid = t.articleId?.trim() ?? '';
    const isOrder = t.contextType === 'b2b_order';
    const title = isOrder
      ? `B2B заказ · ${t.contextId}`
      : cid && aid
        ? `${cid} · ${aid}`
        : t.contextId;
    const at = t.lastMessageAt ? new Date(t.lastMessageAt) : null;
    const time =
      at && !Number.isNaN(at.getTime())
        ? at.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : undefined;
    return {
      id: `w2ctx:${t.contextType}:${t.contextId}`,
      title,
      subtitle: isOrder
        ? t.lastMessagePreview?.slice(0, 120) || 'Переписка по заказу B2B'
        : t.lastMessagePreview?.slice(0, 120) || 'Контекстный чат артикула',
      time,
      participantsCount: Math.max(1, t.messageCount),
      type: isOrder ? ('b2b_orders' as const) : ('production' as const),
      linkCollectionId: cid || undefined,
      isPinned: false,
    } satisfies Chat;
  });
}

export function isBrandPgContextChatId(chatId: string): boolean {
  return chatId.startsWith('w2ctx:');
}

/** PG chat id для B2B-заказа (`w2ctx:b2b_order:<orderId>`). */
export function buildPgB2bOrderChatId(orderId: string): string {
  return `w2ctx:${WORKSHOP2_B2B_ORDER_CONTEXT_TYPE}:${workshop2B2bOrderContextId(orderId)}`;
}

/** Пустой тред по заказу, если в PG ещё нет сообщений (deep-link из реестра). */
export function buildPlaceholderB2bOrderChat(orderId: string): Chat {
  const trimmed = orderId.trim();
  return {
    id: buildPgB2bOrderChatId(trimmed),
    title: `B2B заказ · ${trimmed}`,
    subtitle: WAVE_YN_PLACEHOLDER_SUBTITLE_RU,
    participantsCount: 1,
    type: 'b2b_orders',
    isPinned: false,
  };
}

/** `w2ctx:workshop2_article:SS27:demo-ss27-01` → contextType + contextId */
export function parseBrandPgContextChatId(
  chatId: string
): { contextType: string; contextId: string } | null {
  if (!isBrandPgContextChatId(chatId)) return null;
  const body = chatId.slice('w2ctx:'.length);
  const sep = body.indexOf(':');
  if (sep <= 0) return null;
  const contextType = body.slice(0, sep);
  const contextId = body.slice(sep + 1);
  if (!contextType || !contextId) return null;
  return { contextType, contextId };
}
