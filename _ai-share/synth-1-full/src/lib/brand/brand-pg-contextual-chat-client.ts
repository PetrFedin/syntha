import type { ChatMessage } from '@/lib/types';
import type { BrandPgThreadRow } from '@/lib/brand/brand-messages-pg-threads';
import type { PgContextualThreadsCabinet } from '@/lib/server/pg-contextual-message-threads-handler';

export function pgContextualThreadsApiPath(cabinet: PgContextualThreadsCabinet): string {
  switch (cabinet) {
    case 'shop':
      return '/api/shop/messages/threads';
    case 'factory':
      return '/api/factory/messages/threads';
    default:
      return '/api/brand/messages/threads';
  }
}

export async function fetchPgContextualThreads(
  cabinet: PgContextualThreadsCabinet,
  readerId?: string
): Promise<{
  threads: BrandPgThreadRow[];
  source: string;
}> {
  const params = new URLSearchParams();
  if (readerId?.trim()) params.set('readerId', readerId.trim());
  const qs = params.toString();
  const res = await fetch(`${pgContextualThreadsApiPath(cabinet)}${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
  if (!res.ok) return { threads: [], source: 'empty' };
  const json = (await res.json()) as { threads?: BrandPgThreadRow[]; source?: string };
  return { threads: json.threads ?? [], source: json.source ?? 'empty' };
}

export async function postPgContextualReadState(input: {
  chatId?: string;
  contextType?: string;
  contextId?: string;
  lastSeenMessageCount: number;
  readerId: string;
}): Promise<boolean> {
  const res = await fetch('/api/messages/contextual/read-state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-w2-actor-id': input.readerId,
    },
    body: JSON.stringify({
      chatId: input.chatId,
      contextType: input.contextType,
      contextId: input.contextId,
      lastSeenMessageCount: input.lastSeenMessageCount,
      readerId: input.readerId,
    }),
  });
  return res.ok;
}

/** @deprecated Prefer {@link fetchPgContextualThreads} with explicit cabinet. */
export async function fetchBrandPgContextualThreads(): Promise<{
  threads: BrandPgThreadRow[];
  source: string;
}> {
  return fetchPgContextualThreads('brand');
}

export async function fetchBrandPgContextualMessages(
  contextType: string,
  contextId: string
): Promise<ChatMessage[]> {
  const params = new URLSearchParams({ contextType, contextId });
  const res = await fetch(`/api/messages/contextual?${params.toString()}`);
  if (!res.ok) return [];
  const json = (await res.json()) as {
    messages?: Array<{
      id: string;
      message: string;
      sender: string;
      createdAt: string;
    }>;
  };
  return (json.messages ?? []).map((m, idx) => ({
    id: Number.parseInt(String(m.id).replace(/\D/g, '').slice(-9), 10) || idx + 1,
    chatId: `w2ctx:${contextType}:${contextId}`,
    user: m.sender,
    text: m.message,
    time: new Date(m.createdAt).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    type: 'message' as const,
    createdAt: new Date(m.createdAt).getTime(),
  }));
}

export async function postBrandPgContextualMessage(input: {
  contextType: string;
  contextId: string;
  message: string;
  sender?: string;
}): Promise<boolean> {
  const res = await fetch('/api/messages/contextual', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(input.sender ? { 'x-w2-actor-name': input.sender } : {}),
    },
    body: JSON.stringify({
      contextType: input.contextType,
      contextId: input.contextId,
      message: input.message,
    }),
  });
  return res.ok;
}
