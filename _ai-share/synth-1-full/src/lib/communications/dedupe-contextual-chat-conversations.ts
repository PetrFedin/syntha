import {
  buildPlaceholderB2bOrderChat,
  parseBrandPgContextChatId,
} from '@/lib/brand/brand-messages-pg-threads';
import { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE } from '@/lib/production/workshop2-b2b-order-lifecycle';
import type { Chat } from '@/lib/types';

/** Dedupe chat sidebar rows by w2ctx id (Wave YN — no duplicate placeholders). */
export function dedupeChatConversationsById<T extends { id: string }>(chats: readonly T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const chat of chats) {
    if (seen.has(chat.id)) continue;
    seen.add(chat.id);
    out.push(chat);
  }
  return out;
}

/** Append order placeholder only when PG list lacks the deep-linked chat id. */
export function appendUniqueContextualChatPlaceholder(
  merged: readonly Chat[],
  contextualChatFromUrl: string | null
): Chat[] {
  const list = dedupeChatConversationsById(merged);
  if (!contextualChatFromUrl || list.some((c) => c.id === contextualChatFromUrl)) {
    return list;
  }
  const parsed = parseBrandPgContextChatId(contextualChatFromUrl);
  if (parsed?.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE && parsed.contextId.trim()) {
    return [buildPlaceholderB2bOrderChat(parsed.contextId), ...list];
  }
  return list;
}
