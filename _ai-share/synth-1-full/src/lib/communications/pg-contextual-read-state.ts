/**
 * Client read-state для PG contextual threads (w2ctx:…); unread = messageCount − lastSeen.
 * Wave 33: localStorage cache + server read receipts (POST /api/messages/contextual/read-state).
 */
import { parseBrandPgContextChatId } from '@/lib/brand/brand-messages-pg-threads';
import { postPgContextualReadState } from '@/lib/brand/brand-pg-contextual-chat-client';

const STORAGE_KEY = 'syntha_pg_ctx_read_v1';

type PgChatReadEntry = {
  lastSeenMessageCount: number;
  lastReadAt: string;
};

type Stored = Record<string, PgChatReadEntry>;

const listeners = new Set<() => void>();

function load(): Stored {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : {};
  } catch {
    return {};
  }
}

function save(data: Stored): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function emit(): void {
  listeners.forEach((cb) => cb());
}

export function subscribePgContextualReadState(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Эффективный lastSeen: max(local cache, server receipt с threads API). */
export function getEffectivePgChatLastSeenMessageCount(
  chatId: string,
  serverLastSeen?: number
): number {
  const local = load()[chatId]?.lastSeenMessageCount ?? 0;
  const server = serverLastSeen ?? 0;
  return Math.max(local, server);
}

export function getPgChatLastSeenMessageCount(chatId: string): number {
  return load()[chatId]?.lastSeenMessageCount ?? 0;
}

function syncPgChatSeenToServer(chatId: string, messageCount: number, readerId?: string): void {
  if (!readerId?.trim() || typeof window === 'undefined') return;
  const parsed = parseBrandPgContextChatId(chatId);
  void postPgContextualReadState({
    chatId,
    contextType: parsed?.contextType,
    contextId: parsed?.contextId,
    lastSeenMessageCount: messageCount,
    readerId: readerId.trim(),
  }).catch(() => {
    /* best-effort */
  });
}

/** Зафиксировать просмотр треда (local cache + server receipt). */
export function markPgChatSeen(chatId: string, messageCount: number, readerId?: string): void {
  const trimmed = chatId.trim();
  if (!trimmed || messageCount < 0) return;
  const data = load();
  const prev = data[trimmed]?.lastSeenMessageCount ?? 0;
  if (prev >= messageCount) {
    syncPgChatSeenToServer(trimmed, messageCount, readerId);
    return;
  }
  data[trimmed] = {
    lastSeenMessageCount: messageCount,
    lastReadAt: new Date().toISOString(),
  };
  save(data);
  emit();
  syncPgChatSeenToServer(trimmed, messageCount, readerId);
}

export function pgChatUnreadCount(
  chatId: string,
  messageCount: number,
  serverLastSeen?: number
): number {
  if (messageCount <= 0) return 0;
  const lastSeen = getEffectivePgChatLastSeenMessageCount(chatId, serverLastSeen);
  return Math.max(0, messageCount - lastSeen);
}
