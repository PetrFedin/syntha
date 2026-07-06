import 'server-only';

import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix.types';
import { getWorkshop2B2bOrder } from '@/lib/platform-core-ports/b2b-orders';
import {
  isWorkshop2BrandCalendarSyncConfigured,
  listWorkshop2BrandCalendarEventsForArticle,
} from '@/lib/platform-core-ports/brand-calendar';
import {
  isWorkshop2ContextualChatPersistConfigured,
  listWorkshop2ContextualMessages,
} from '@/lib/platform-core-ports/contextual-messages';
import { getWorkshop2ServerDossierStoreMode } from '@/lib/platform-core-ports/dossier-store';

const ARTICLE_CONTEXT_TYPE = 'workshop2_article';
const B2B_ORDER_CONTEXT_TYPE = 'b2b_order';

export type PlatformCoreEntityType = 'article' | 'order';

export type PlatformCoreEntityRef = {
  entityType: PlatformCoreEntityType;
  entityId: string;
};

export type PlatformCoreAdapterIssue = {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
};

export type PlatformCoreThreadParticipant = {
  roleId: CoreChainRoleId;
  label: string;
};

export type PlatformCoreEntityThreadMessage = {
  id?: string;
  message: string;
  sender?: string;
  createdAt?: string;
  isSystem?: boolean;
  mentions?: readonly string[];
};

export type PlatformCoreEntityThreadSnapshot = {
  threadId: string;
  entity: PlatformCoreEntityRef;
  contextType: string;
  contextId: string;
  participants: PlatformCoreThreadParticipant[];
  messages: PlatformCoreEntityThreadMessage[];
  messageCount: number;
  systemMessageCount: number;
  lastMessageAt?: string;
  mentions: string[];
  nextOwnerLabel: string;
  persistConfigured: boolean;
  completenessPct: number;
};

export type PlatformCoreCalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt?: string;
  ownerRoleId?: CoreChainRoleId;
  isBlocker?: boolean;
  sourceKind?: string;
  linkedMilestoneId?: string;
  href?: string;
};

export type PlatformCoreCalendarSnapshot = {
  entity: PlatformCoreEntityRef;
  ownerRoleId: CoreChainRoleId;
  events: PlatformCoreCalendarEvent[];
  eventCount: number;
  blockerCount: number;
  overdueCount: number;
  nextDeadlineAt?: string;
  chatThreadId?: string;
  persistConfigured: boolean;
  completenessPct: number;
};

export type PlatformCoreEntityCommsEvaluation = {
  status: 'core_ready' | 'warning' | 'blocked';
  eventCreated: string;
  nextOwnerLabel: string;
  issues: PlatformCoreAdapterIssue[];
};

export type PlatformCoreCommsResult =
  | {
      ok: true;
      entity: PlatformCoreEntityRef;
      collectionId?: string;
      articleId?: string;
      orderId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
      thread: PlatformCoreEntityThreadSnapshot;
      calendar: PlatformCoreCalendarSnapshot;
      evaluation: PlatformCoreEntityCommsEvaluation;
    }
  | {
      ok: false;
      reason: 'invalid_path' | 'not_found';
      entityId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
    };

type OrderShape = {
  id: string;
  collectionId?: string;
  articleId?: string;
  lines: readonly { collectionId?: string; articleId?: string }[];
  updatedAt: string;
};

function cleanString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t || undefined;
}

function adapterStatus(issues: PlatformCoreAdapterIssue[]): PlatformCoreEntityCommsEvaluation['status'] {
  if (issues.some((i) => i.severity === 'blocker')) return 'blocked';
  if (issues.some((i) => i.severity === 'warning')) return 'warning';
  return 'core_ready';
}

function extractMentions(text: string): string[] {
  const handles = [...text.matchAll(/(^|[\s(])@([a-zA-Z0-9._-]{2,32})/g)]
    .map((m) => m[2]?.toLowerCase())
    .filter((h): h is string => Boolean(h));
  return [...new Set(handles)];
}

function articleContextId(collectionId: string, articleId: string): string {
  return `${collectionId.trim()}:${articleId.trim()}`;
}

function participantsForEntity(entity: PlatformCoreEntityRef): PlatformCoreThreadParticipant[] {
  const labels: Record<CoreChainRoleId, string> = {
    brand: 'Бренд',
    shop: 'Магазин',
    manufacturer: 'Производство',
    supplier: 'Поставщик',
  };
  const roles: CoreChainRoleId[] =
    entity.entityType === 'article'
      ? ['brand', 'manufacturer', 'supplier']
      : ['brand', 'shop', 'manufacturer'];
  return roles.map((roleId) => ({ roleId, label: labels[roleId] }));
}

function nextOwnerLabel(entity: PlatformCoreEntityRef): string {
  return entity.entityType === 'order' ? 'Производство' : 'Бренд';
}

function ownerRoleForCalendar(entity: PlatformCoreEntityRef): CoreChainRoleId {
  return entity.entityType === 'order' ? 'manufacturer' : 'brand';
}

function firstLineArticle(order: OrderShape): { collectionId?: string; articleId?: string } {
  const line = order.lines.find((item) => item.articleId || item.collectionId);
  return {
    collectionId: cleanString(order.collectionId) ?? cleanString(line?.collectionId),
    articleId: cleanString(order.articleId) ?? cleanString(line?.articleId),
  };
}

function eventTimestamp(event: PlatformCoreCalendarEvent): number {
  const parsed = Date.parse(event.startAt);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function buildThread(input: {
  entity: PlatformCoreEntityRef;
  contextType: string;
  contextId: string;
  messages: PlatformCoreEntityThreadMessage[];
}): PlatformCoreEntityThreadSnapshot {
  const participants = participantsForEntity(input.entity);
  const threadId = `pc-thread-${input.entity.entityType}-${input.entity.entityId}`;
  const messageText = input.messages.map((m) => m.message).join('\n');
  const mentions = [
    ...new Set([
      ...extractMentions(messageText),
      ...input.messages.flatMap((m) => m.mentions ?? []),
    ]),
  ];
  const lastMessage = [...input.messages]
    .filter((m) => cleanString(m.createdAt))
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
    .at(-1);
  const persistConfigured = isWorkshop2ContextualChatPersistConfigured();
  const checks = [
    Boolean(input.entity.entityId),
    participants.length > 0,
    input.messages.length > 0,
    input.messages.some((m) => m.isSystem),
    persistConfigured,
  ];
  return {
    threadId,
    entity: input.entity,
    contextType: input.contextType,
    contextId: input.contextId,
    participants,
    messages: input.messages,
    messageCount: input.messages.length,
    systemMessageCount: input.messages.filter((m) => m.isSystem).length,
    lastMessageAt: lastMessage?.createdAt,
    mentions,
    nextOwnerLabel: nextOwnerLabel(input.entity),
    persistConfigured,
    completenessPct: Math.round((checks.filter(Boolean).length / checks.length) * 100),
  };
}

function buildCalendar(input: {
  entity: PlatformCoreEntityRef;
  events: PlatformCoreCalendarEvent[];
  chatThreadId?: string;
}): PlatformCoreCalendarSnapshot {
  const ownerRoleId = ownerRoleForCalendar(input.entity);
  const persistConfigured = isWorkshop2BrandCalendarSyncConfigured();
  const now = Date.now();
  const blockers = input.events.filter((e) => e.isBlocker);
  const overdueCount = input.events.filter(
    (e) => eventTimestamp(e) < now && e.isBlocker
  ).length;
  const next =
    [...input.events]
      .filter((e) => eventTimestamp(e) >= now)
      .sort((a, b) => eventTimestamp(a) - eventTimestamp(b))[0] ??
    [...input.events].sort((a, b) => eventTimestamp(a) - eventTimestamp(b))[0];
  const checks = [
    Boolean(input.entity.entityId),
    input.events.length > 0,
    input.events.some((e) => cleanString(e.startAt)),
    input.events.some((e) => e.isBlocker),
    persistConfigured,
    Boolean(input.chatThreadId),
  ];
  return {
    entity: input.entity,
    ownerRoleId,
    events: input.events,
    eventCount: input.events.length,
    blockerCount: blockers.length,
    overdueCount,
    nextDeadlineAt: next?.startAt,
    chatThreadId: input.chatThreadId,
    persistConfigured,
    completenessPct: Math.round((checks.filter(Boolean).length / checks.length) * 100),
  };
}

function evaluateComms(thread: PlatformCoreEntityThreadSnapshot, calendar: PlatformCoreCalendarSnapshot): PlatformCoreEntityCommsEvaluation {
  const issues: PlatformCoreAdapterIssue[] = [];

  if (!thread.persistConfigured) {
    issues.push({
      id: 'thread.persistence.missing',
      severity: 'warning',
      message: 'Хранилище сообщений не настроено.',
    });
  }
  if (!thread.messageCount) {
    issues.push({
      id: 'thread.messages.empty',
      severity: 'warning',
      message: 'В entity-чате пока нет сообщений.',
    });
  }
  if (!calendar.persistConfigured) {
    issues.push({
      id: 'calendar.persistence.missing',
      severity: 'warning',
      message: 'Хранилище календаря не настроено.',
    });
  }
  if (!calendar.eventCount) {
    issues.push({
      id: 'calendar.events.empty',
      severity: 'blocker',
      message: 'Нет entity-linked сроков в календаре.',
    });
  }

  return {
    status: adapterStatus(issues),
    eventCreated: 'comms.entity_snapshot',
    nextOwnerLabel: thread.nextOwnerLabel,
    issues,
  };
}

async function buildCommsForEntity(input: {
  entity: PlatformCoreEntityRef;
  contextType: string;
  contextId: string;
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  organizationId?: string;
}): Promise<PlatformCoreCommsResult> {
  const storeMode = getWorkshop2ServerDossierStoreMode();
  const contextType = input.contextType.trim();
  const contextId = input.contextId.trim();
  if (!contextType || !contextId || !cleanString(input.entity.entityId)) {
    return { ok: false, reason: 'invalid_path', entityId: input.entity.entityId, storeMode };
  }

  const [messageRecords, calendarRecords] = await Promise.all([
    listWorkshop2ContextualMessages({
      contextType,
      contextId,
      organizationId: input.organizationId,
    }),
    input.collectionId && input.articleId
      ? listWorkshop2BrandCalendarEventsForArticle({
          collectionId: input.collectionId,
          articleId: input.articleId,
          organizationId: input.organizationId,
        })
      : Promise.resolve([]),
  ]);

  const messages: PlatformCoreEntityThreadMessage[] = messageRecords.map((r) => ({
    id: r.id,
    message: r.message,
    sender: r.sender,
    createdAt: r.createdAt,
    isSystem: r.isSystem,
    mentions: r.mentions,
  }));

  const thread = buildThread({
    entity: input.entity,
    contextType,
    contextId,
    messages,
  });

  const events: PlatformCoreCalendarEvent[] = calendarRecords.map((r) => ({
    id: r.id,
    title: r.title,
    startAt: r.startAt,
    endAt: r.endAt,
    ownerRoleId: r.sourceKind === 'sample_movement' ? 'manufacturer' : undefined,
    isBlocker: r.isBlocker,
    sourceKind: r.sourceKind,
    linkedMilestoneId: r.linkedMilestoneId,
    href: r.href,
  }));

  const calendar = buildCalendar({
    entity: input.entity,
    events,
    chatThreadId: thread.threadId,
  });

  return {
    ok: true,
    entity: input.entity,
    collectionId: input.collectionId,
    articleId: input.articleId,
    orderId: input.orderId,
    storeMode,
    thread,
    calendar,
    evaluation: evaluateComms(thread, calendar),
  };
}

export async function getPlatformCoreCommsForArticle(input: {
  collectionId: string;
  articleId: string;
  organizationId?: string;
}): Promise<PlatformCoreCommsResult> {
  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  const storeMode = getWorkshop2ServerDossierStoreMode();
  if (!collectionId || !articleId) {
    return { ok: false, reason: 'invalid_path', entityId: articleId, storeMode };
  }
  return buildCommsForEntity({
    entity: { entityType: 'article', entityId: articleContextId(collectionId, articleId) },
    contextType: ARTICLE_CONTEXT_TYPE,
    contextId: articleContextId(collectionId, articleId),
    collectionId,
    articleId,
    organizationId: input.organizationId,
  });
}

export async function getPlatformCoreCommsForOrder(input: {
  orderId: string;
  organizationId?: string;
}): Promise<PlatformCoreCommsResult> {
  const orderId = input.orderId?.trim();
  const storeMode = getWorkshop2ServerDossierStoreMode();
  if (!orderId) {
    return { ok: false, reason: 'invalid_path', entityId: orderId, storeMode };
  }

  const order = (await getWorkshop2B2bOrder(orderId)) as OrderShape | null;
  if (!order) {
    return { ok: false, reason: 'not_found', entityId: orderId, storeMode };
  }

  const entity = firstLineArticle(order);
  return buildCommsForEntity({
    entity: { entityType: 'order', entityId: order.id },
    contextType: B2B_ORDER_CONTEXT_TYPE,
    contextId: order.id,
    collectionId: entity.collectionId,
    articleId: entity.articleId,
    orderId: order.id,
    organizationId: input.organizationId,
  });
}
