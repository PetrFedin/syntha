import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { Workshop2B2bCalendarEvent } from '@/lib/production/workshop2-b2b-campaign-hub';
import {
  WORKSHOP2_ARTICLE_CONTEXT_TYPE,
  workshop2ArticleContextId,
} from '@/lib/production/workshop2-domain-event-types';
import { buildPgB2bOrderChatId } from '@/lib/brand/brand-messages-pg-threads';
import { ensureB2bOrderContextualThread } from '@/lib/server/ensure-b2b-order-contextual-thread';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import {
  shouldPlatformCorePersistAuxiliaryToFile,
  shouldPlatformCoreReadAuxiliaryFromFile,
} from '@/lib/server/platform-core-pg-primary-file-policy';
import {
  listPlatformCoreUserCalendarTasksPg,
  upsertPlatformCoreUserCalendarTaskPg,
} from '@/lib/server/platform-core-user-calendar-task-repository';

export type PlatformCoreUserCalendarTask = {
  id: string;
  collectionId: string;
  ownerRole: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  orderId?: string;
  articleId?: string;
  eventType?: string;
  createdAt: string;
};

const STORE_FILE = path.join(process.cwd(), 'data', 'platform-core-user-calendar-tasks.json');
const memoryByCollection = new Map<string, PlatformCoreUserCalendarTask[]>();
let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function mergeTasksFromDisk(): void {
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, PlatformCoreUserCalendarTask[]>;
    if (!parsed || typeof parsed !== 'object') return;
    for (const [collectionId, tasks] of Object.entries(parsed)) {
      if (!Array.isArray(tasks)) continue;
      const existing = memoryByCollection.get(collectionId) ?? [];
      const byId = new Map(existing.map((t) => [t.id, t]));
      for (const t of tasks) byId.set(t.id, t);
      memoryByCollection.set(collectionId, [...byId.values()]);
    }
    fileHydrated = true;
  } catch {
    /* best-effort */
  }
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  mergeTasksFromDisk();
}

function flushFile(): void {
  if (!canUseDiskPersistence() || !shouldPlatformCorePersistAuxiliaryToFile()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify(Object.fromEntries(memoryByCollection), null, 2),
      'utf8'
    );
  } catch {
    /* best-effort */
  }
}

function normalizeDateTimeLocal(value: string): string {
  const v = value.trim();
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function mapPlatformCoreUserTaskToB2bEvent(
  task: PlatformCoreUserCalendarTask
): Workshop2B2bCalendarEvent {
  return {
    id: task.id,
    collectionId: task.collectionId,
    articleId: task.articleId,
    b2bOrderId: task.orderId,
    source: 'b2b',
    title: task.title,
    startAt: task.startAt,
    endAt: task.endAt,
    kind: task.eventType === 'delivery' ? 'delivery_window' : 'market_date',
  };
}

export async function listPlatformCoreUserCalendarTasks(input: {
  collectionId: string;
  orderId?: string;
}): Promise<Workshop2B2bCalendarEvent[]> {
  const collectionId = input.collectionId.trim();
  const orderId = input.orderId?.trim();

  if (isWorkshop2PostgresEnabled()) {
    const tasks = await listPlatformCoreUserCalendarTasksPg({ collectionId, orderId });
    return tasks.map(mapPlatformCoreUserTaskToB2bEvent);
  }

  if (shouldPlatformCoreReadAuxiliaryFromFile()) {
    mergeTasksFromDisk();
  }
  const tasks = memoryByCollection.get(collectionId) ?? [];

  return tasks
    .filter((t) => !orderId || t.orderId?.trim() === orderId)
    .map(mapPlatformCoreUserTaskToB2bEvent);
}

export async function createPlatformCoreUserCalendarTask(input: {
  id?: string;
  collectionId: string;
  ownerRole: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  orderId?: string;
  articleId?: string;
  eventType?: string;
  organizationId?: string;
}): Promise<{
  task: PlatformCoreUserCalendarTask;
  event: Workshop2B2bCalendarEvent;
  targetChatId?: string;
}> {
  const collectionId = input.collectionId.trim();
  const title = input.title.trim();
  if (!collectionId || !title) {
    throw new Error('collectionId and title required');
  }

  const orderId = input.orderId?.trim();
  const articleId = input.articleId?.trim();
  const org = input.organizationId?.trim() || 'org-brand-001';
  let targetChatId: string | undefined;

  if (orderId) {
    await ensureB2bOrderContextualThread({
      orderId,
      organizationId: org,
      source: 'api',
      pillarId: 'comms',
      sectionId: 'calendar-task',
      initialMessage: `Задача в календаре: ${title}`,
    });
    targetChatId = buildPgB2bOrderChatId(orderId);
  } else if (articleId) {
    const contextId = workshop2ArticleContextId(collectionId, articleId);
    await appendWorkshop2ContextualSystemMessage({
      organizationId: org,
      contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
      contextId,
      message: `Задача в календаре: ${title}`,
    });
    targetChatId = `w2ctx:${WORKSHOP2_ARTICLE_CONTEXT_TYPE}:${collectionId}:${articleId}`;
  }

  const task: PlatformCoreUserCalendarTask = {
    id: input.id?.trim() || `pc-task-${Date.now()}`,
    collectionId,
    ownerRole: input.ownerRole.trim() || 'brand',
    title,
    description: input.description?.trim() || undefined,
    startAt: normalizeDateTimeLocal(input.startAt),
    endAt: normalizeDateTimeLocal(input.endAt),
    orderId,
    articleId,
    eventType: input.eventType?.trim() || 'event',
    createdAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    await upsertPlatformCoreUserCalendarTaskPg(task);
  }

  if (shouldPlatformCorePersistAuxiliaryToFile()) {
    hydrateFileIfNeeded();
    const existing = memoryByCollection.get(collectionId) ?? [];
    memoryByCollection.set(collectionId, [...existing.filter((t) => t.id !== task.id), task]);
    flushFile();
  } else if (!isWorkshop2PostgresEnabled()) {
    const existing = memoryByCollection.get(collectionId) ?? [];
    memoryByCollection.set(collectionId, [...existing.filter((t) => t.id !== task.id), task]);
  }

  const event = mapPlatformCoreUserTaskToB2bEvent(task);
  return { task, event, targetChatId };
}

/** Test-only reset. */
export function clearPlatformCoreUserCalendarTasksForTests(): void {
  memoryByCollection.clear();
  fileHydrated = true;
}
