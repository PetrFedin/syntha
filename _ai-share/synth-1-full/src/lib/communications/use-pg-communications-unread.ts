'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchPgContextualThreads } from '@/lib/brand/brand-pg-contextual-chat-client';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { usePlatformCoreCommsInboxPoll } from '@/hooks/use-platform-core-comms-inbox-poll';
import type { BrandPgThreadRow } from '@/lib/brand/brand-messages-pg-threads';
import { usePgContextualActorId } from '@/hooks/use-pg-contextual-actor-id';
import { buildPgUnreadCountByChat, totalPgUnreadFromByChat } from './pg-contextual-unread-metrics';
import type { PgContextualThreadsCabinet } from '@/lib/server/pg-contextual-message-threads-handler';
import { subscribePgContextualReadState } from './pg-contextual-read-state';

/** PG contextual unread: threads API + registry SSE bump + server/local read-state. */
export function usePgCommunicationsUnread(
  cabinet: PgContextualThreadsCabinet,
  enabled = true
): {
  threads: BrandPgThreadRow[];
  unreadByChat: Record<string, number>;
  totalUnread: number;
  currentUserId: string;
  loading: boolean;
  sseConnected: boolean;
} {
  const [tick, setTick] = useState(0);
  const [threadsLoaded, setThreadsLoaded] = useState(false);
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});
  const [threads, setThreads] = useState<BrandPgThreadRow[]>([]);

  const { tick: registryTick, sseConnected: registrySse } = usePlatformCoreB2bRegistryPoll(enabled);
  const { tick: inboxTick, sseConnected: inboxSse } = usePlatformCoreCommsInboxPoll(enabled);
  const readerId = usePgContextualActorId(cabinet);

  useEffect(() => subscribePgContextualReadState(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    if (!enabled) {
      setUnreadByChat({});
      setThreads([]);
      setThreadsLoaded(false);
      return;
    }
    let cancelled = false;
    setThreadsLoaded(false);
    void fetchPgContextualThreads(cabinet, readerId).then(({ threads: fetched }) => {
      if (cancelled) return;
      setThreads(fetched);
      setUnreadByChat(buildPgUnreadCountByChat(fetched));
      setThreadsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [cabinet, enabled, tick, registryTick, inboxTick, readerId]);

  const totalUnread = useMemo(() => totalPgUnreadFromByChat(unreadByChat), [unreadByChat]);

  return {
    threads,
    unreadByChat,
    totalUnread,
    currentUserId: readerId,
    loading: enabled && !threadsLoaded,
    sseConnected: registrySse || inboxSse,
  };
}
