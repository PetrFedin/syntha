import {
  appendUniqueContextualChatPlaceholder,
  dedupeChatConversationsById,
} from '@/lib/communications/dedupe-contextual-chat-conversations';
import { buildPlaceholderB2bOrderChat } from '@/lib/brand/brand-messages-pg-threads';

describe('dedupe-contextual-chat-conversations', () => {
  it('dedupes by chat id', () => {
    const a = buildPlaceholderB2bOrderChat('B2B-1');
    const b = buildPlaceholderB2bOrderChat('B2B-2');
    expect(dedupeChatConversationsById([a, a, b])).toHaveLength(2);
  });

  it('appendUnique skips when placeholder id already present', () => {
    const chat = buildPlaceholderB2bOrderChat('B2B-YN');
    const next = appendUniqueContextualChatPlaceholder([chat], chat.id);
    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe(chat.id);
  });
});
