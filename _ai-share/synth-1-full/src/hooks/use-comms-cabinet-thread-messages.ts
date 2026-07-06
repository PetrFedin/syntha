'use client';

import { useEffect, useState } from 'react';
import type { ChatMessage } from '@/lib/types';
import { fetchBrandPgContextualMessages } from '@/lib/brand/brand-pg-contextual-chat-client';

const PREVIEW_LIMIT = 6;

/** Recent contextual messages for Comms cabinet lg+ preview panel. */
export function useCommsCabinetThreadMessages(
  contextType: string | undefined,
  contextId: string | undefined
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const type = contextType?.trim();
    const id = contextId?.trim();
    if (!type || !id) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchBrandPgContextualMessages(type, id)
      .then((rows) => {
        if (cancelled) return;
        setMessages(rows.slice(-PREVIEW_LIMIT));
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contextType, contextId]);

  return { messages, loading };
}
