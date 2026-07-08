import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { parseWorkshop2ContextualMentions } from '@/lib/production/workshop2-contextual-chat-utils';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { shouldWorkshop2PgOnlySkipFileFallback } from '@/lib/production/workshop2-hub-pg-only-policy';
import { shouldWorkshop2PersistAuxiliaryJsonToFile } from '@/lib/server/platform-core-pg-primary-file-policy';
import { isPlatformCoreSpinePgPrimary } from '@/lib/server/platform-core-spine-pg.server';
import {
  resolveContextualMessageSender,
  WORKSHOP2_CONTEXTUAL_SYSTEM_SENDER,
} from '@/lib/server/workshop2-contextual-message-sender';
import { getWorkshop2RealtimeHub } from '@/lib/server/workshop2-realtime-hub';

export type Workshop2ContextualMessageRecord = {
  id: string;
  contextType: string;
  contextId: string;
  message: string;
  createdAt: string;
  sender: string;
  isSystem?: boolean;
  /** Wave 2 #C4: parsed @handles from message body. */
  mentions?: string[];
  /** Wave 2 #C5: vault attachment link (presign GET URL or storage path note). */
  attachmentUrl?: string;
  attachmentName?: string;
};

const STORE_FILE = path.join(process.cwd(), 'data', 'workshop2-contextual-messages.json');

/** Только NODE_ENV=test — без in-process store в runtime (file или PG). */
let testFallbackStore: Workshop2ContextualMessageRecord[] | null = null;

function contextualFallbackBlocked(): boolean {
  if (shouldWorkshop2PgOnlySkipFileFallback() || isPlatformCoreSpinePgPrimary()) return true;
  return isPlatformCoreMode() && process.env.PLATFORM_CORE_SPINE_PG_PRIMARY !== '0';
}

function isContextualPostgresStoreEnabled(): boolean {
  return isWorkshop2PostgresEnabled();
}

function canUseDiskPersistence(): boolean {
  return (
    process.env.NODE_ENV !== 'test' &&
    !isContextualPostgresStoreEnabled() &&
    shouldWorkshop2PersistAuxiliaryJsonToFile()
  );
}

function readFallbackMessages(): Workshop2ContextualMessageRecord[] {
  if (process.env.NODE_ENV === 'test') {
    return testFallbackStore ?? [];
  }
  if (!canUseDiskPersistence()) return [];
  try {
    if (!fs.existsSync(STORE_FILE)) return [];
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Workshop2ContextualMessageRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFallbackMessages(records: Workshop2ContextualMessageRecord[]): void {
  if (process.env.NODE_ENV === 'test') {
    testFallbackStore = records;
    return;
  }
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch {
    /* best-effort */
  }
}

function appendFallbackMessage(record: Workshop2ContextualMessageRecord): void {
  const rows = readFallbackMessages();
  rows.push(record);
  writeFallbackMessages(rows);
}

function newMessageId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `w2msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeContextualMessageText(message: string): string {
  return message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function listWorkshop2ContextualMessages(input: {
  contextType: string;
  contextId: string;
  organizationId?: string;
  limit?: number;
}): Promise<Workshop2ContextualMessageRecord[]> {
  const contextType = input.contextType.trim();
  const contextId = input.contextId.trim();

  if (!isWorkshop2PostgresEnabled()) {
    if (contextualFallbackBlocked()) return [];
    const rows = readFallbackMessages()
      .filter((m) => m.contextType === contextType && m.contextId === contextId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(enrichContextualMessageRecord);
    const cap = input.limit;
    return cap != null && cap > 0 ? rows.slice(-cap) : rows;
  }

  await ensureWorkshop2PgSchema();
  const org = input.organizationId ?? 'org-brand-001';
  const limit = input.limit != null && input.limit > 0 ? Math.floor(input.limit) : null;
  const res = await getWorkshop2PgPool().query<{
    id: string;
    context_type: string;
    context_id: string;
    message: string;
    sender: string;
    is_system: boolean;
    created_at: Date;
  }>(
    limit
      ? `SELECT id, context_type, context_id, message, sender, is_system, created_at
     FROM workshop2_contextual_messages
     WHERE organization_id = $1 AND context_type = $2 AND context_id = $3
     ORDER BY created_at ASC
     LIMIT $4`
      : `SELECT id, context_type, context_id, message, sender, is_system, created_at
     FROM workshop2_contextual_messages
     WHERE organization_id = $1 AND context_type = $2 AND context_id = $3
     ORDER BY created_at ASC`,
    limit ? [org, contextType, contextId, limit] : [org, contextType, contextId]
  );
  return res.rows.map((r) =>
    enrichContextualMessageRecord({
      id: r.id,
      contextType: r.context_type,
      contextId: r.context_id,
      message: r.message,
      sender: r.sender,
      isSystem: r.is_system,
      createdAt: r.created_at.toISOString(),
    })
  );
}

function enrichContextualMessageRecord(
  record: Workshop2ContextualMessageRecord
): Workshop2ContextualMessageRecord {
  const mentions = record.mentions ?? parseWorkshop2ContextualMentions(record.message);
  const attachment = record.attachmentUrl
    ? { attachmentUrl: record.attachmentUrl, attachmentName: record.attachmentName }
    : parseAttachmentFromMessage(record.message);
  return {
    ...record,
    mentions: mentions.length ? mentions : undefined,
    ...attachment,
  };
}

function parseAttachmentFromMessage(message: string): {
  attachmentUrl?: string;
  attachmentName?: string;
} {
  const m = message.match(/\[📎\s*([^\]]+)\]\(([^)]+)\)/);
  if (!m) return {};
  return { attachmentName: m[1]?.trim(), attachmentUrl: m[2]?.trim() };
}

function formatMessageWithAttachment(
  message: string,
  attachmentUrl?: string,
  attachmentName?: string
): string {
  if (!attachmentUrl?.trim()) return message;
  const name = attachmentName?.trim() || 'файл';
  return `${message}\n[📎 ${name}](${attachmentUrl.trim()})`;
}

export async function appendWorkshop2ContextualMessage(input: {
  contextType: string;
  contextId: string;
  message: string;
  sender?: string;
  isSystem?: boolean;
  organizationId?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  headers?: Headers | { get(name: string): string | null };
}): Promise<Workshop2ContextualMessageRecord> {
  const mentions = parseWorkshop2ContextualMentions(input.message);
  const body = formatMessageWithAttachment(
    sanitizeContextualMessageText(input.message),
    input.attachmentUrl,
    input.attachmentName
  );
  const record: Workshop2ContextualMessageRecord = {
    id: newMessageId(),
    contextType: input.contextType.trim(),
    contextId: input.contextId.trim(),
    message: body,
    sender: resolveContextualMessageSender({
      sender: input.sender,
      headers: input.headers,
    }),
    isSystem: input.isSystem ?? false,
    createdAt: new Date().toISOString(),
    mentions: mentions.length ? mentions : undefined,
    attachmentUrl: input.attachmentUrl?.trim() || undefined,
    attachmentName: input.attachmentName?.trim() || undefined,
  };

  if (!isWorkshop2PostgresEnabled()) {
    if (contextualFallbackBlocked()) {
      throw new Error('Platform Core spine: contextual messages require PostgreSQL');
    }
    appendFallbackMessage(record);
    publishContextualRealtime(record);
    return record;
  }

  await ensureWorkshop2PgSchema();
  const org = input.organizationId ?? 'org-brand-001';
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_contextual_messages
       (id, organization_id, context_type, context_id, message, sender, is_system, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz)`,
    [
      record.id,
      org,
      record.contextType,
      record.contextId,
      record.message,
      record.sender,
      record.isSystem ?? false,
      record.createdAt,
    ]
  );
  publishContextualRealtime(record);
  return record;
}

function publishContextualRealtime(record: Workshop2ContextualMessageRecord): void {
  getWorkshop2RealtimeHub().publishContextualMessageAppended({
    contextType: record.contextType,
    contextId: record.contextId,
    messageId: record.id,
    sender: record.sender,
    createdAt: record.createdAt,
  });
  void import('@/lib/server/platform-core-b2b-registry-hub')
    .then(({ bumpPlatformCoreB2bRegistry }) => {
      bumpPlatformCoreB2bRegistry('contextual_message');
    })
    .catch(() => {});
  void import('@/lib/server/platform-core-comms-inbox-hub')
    .then(({ bumpPlatformCoreCommsInbox }) => {
      bumpPlatformCoreCommsInbox('contextual_message');
    })
    .catch(() => {});
}

export async function appendWorkshop2ContextualSystemMessage(input: {
  contextType: string;
  contextId: string;
  message: string;
  organizationId?: string;
}): Promise<Workshop2ContextualMessageRecord> {
  return appendWorkshop2ContextualMessage({
    ...input,
    sender: WORKSHOP2_CONTEXTUAL_SYSTEM_SENDER,
    isSystem: true,
  });
}

export function clearWorkshop2ContextualMessagesMemoryForTests(): void {
  testFallbackStore = [];
}

export function isWorkshop2ContextualChatPersistConfigured(): boolean {
  if (isWorkshop2PostgresEnabled()) return true;
  return canUseDiskPersistence();
}

export type Workshop2ContextualMessageThreadSummary = {
  contextType: string;
  contextId: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  messageCount: number;
  collectionId?: string;
  articleId?: string;
};

function parseWorkshop2ArticleContextId(contextId: string): {
  collectionId?: string;
  articleId?: string;
} {
  const parts = contextId.split(':');
  if (parts.length !== 2) return {};
  return { collectionId: parts[0]?.trim(), articleId: parts[1]?.trim() };
}

function summarizeThreadFromMessages(
  contextType: string,
  contextId: string,
  messages: Workshop2ContextualMessageRecord[]
): Workshop2ContextualMessageThreadSummary {
  const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const last = sorted[sorted.length - 1];
  const parsed =
    contextType === 'workshop2_article' ? parseWorkshop2ArticleContextId(contextId) : {};
  const preview = (last?.message ?? '').replace(/\n\[📎[^\]]+\]\([^)]+\)/, '').trim();
  return {
    contextType,
    contextId,
    lastMessageAt: last?.createdAt ?? new Date().toISOString(),
    lastMessagePreview: preview.slice(0, 120) || '—',
    messageCount: sorted.length,
    ...parsed,
  };
}

/** Wave 11: агрегированный список contextual threads для /brand/messages (RU). */
export async function listWorkshop2ContextualMessageThreads(input?: {
  organizationId?: string;
  contextType?: string;
  contextId?: string;
  limit?: number;
}): Promise<Workshop2ContextualMessageThreadSummary[]> {
  const limit = Math.min(Math.max(input?.limit ?? 40, 1), 200);
  const contextTypeFilter = input?.contextType?.trim();
  const contextIdFilter = input?.contextId?.trim();
  const org = input?.organizationId ?? 'org-brand-001';

  if (!isWorkshop2PostgresEnabled()) {
    if (contextualFallbackBlocked()) return [];
    const grouped = new Map<string, Workshop2ContextualMessageRecord[]>();
    for (const m of readFallbackMessages()) {
      if (contextTypeFilter && m.contextType !== contextTypeFilter) continue;
      if (contextIdFilter && m.contextId !== contextIdFilter) continue;
      const key = `${m.contextType}::${m.contextId}`;
      const arr = grouped.get(key) ?? [];
      arr.push(m);
      grouped.set(key, arr);
    }
    return Array.from(grouped.entries())
      .map(([key, msgs]) => {
        const [contextType, contextId] = key.split('::');
        return summarizeThreadFromMessages(contextType, contextId, msgs);
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
      .slice(0, limit);
  }

  await ensureWorkshop2PgSchema();
  const params: unknown[] = [org];
  let filterClause = '';
  if (contextTypeFilter) {
    params.push(contextTypeFilter);
    filterClause += ` AND context_type = $${params.length}`;
  }
  if (contextIdFilter) {
    params.push(contextIdFilter);
    filterClause += ` AND context_id = $${params.length}`;
  }
  params.push(limit);
  const res = await getWorkshop2PgPool().query<{
    context_type: string;
    context_id: string;
    message_count: string;
    last_message_at: Date;
    last_message: string;
  }>(
    `SELECT context_type, context_id,
            COUNT(*)::text AS message_count,
            MAX(created_at) AS last_message_at,
            (ARRAY_AGG(message ORDER BY created_at DESC))[1] AS last_message
     FROM workshop2_contextual_messages
     WHERE organization_id = $1${filterClause}
     GROUP BY context_type, context_id
     ORDER BY MAX(created_at) DESC
     LIMIT $${params.length}`,
    params
  );

  return res.rows.map((r) => {
    const parsed =
      r.context_type === 'workshop2_article' ? parseWorkshop2ArticleContextId(r.context_id) : {};
    const preview = r.last_message.replace(/\n\[📎[^\]]+\]\([^)]+\)/, '').trim();
    return {
      contextType: r.context_type,
      contextId: r.context_id,
      lastMessageAt: r.last_message_at.toISOString(),
      lastMessagePreview: preview.slice(0, 120) || '—',
      messageCount: Number(r.message_count) || 0,
      ...parsed,
    };
  });
}
