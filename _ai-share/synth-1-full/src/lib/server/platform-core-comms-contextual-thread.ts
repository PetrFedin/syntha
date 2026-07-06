import 'server-only';

import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  WORKSHOP2_ARTICLE_CONTEXT_TYPE,
  workshop2ArticleContextId,
} from '@/lib/production/workshop2-domain-event-types';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { buildPgB2bOrderChatId } from '@/lib/brand/brand-messages-pg-threads';
import { ensureB2bOrderContextualThread } from '@/lib/server/ensure-b2b-order-contextual-thread';
import {
  appendWorkshop2ContextualSystemMessage,
  listWorkshop2ContextualMessages,
} from '@/lib/server/workshop2-contextual-messages-repository';

export type EnsureWorkshop2ArticleContextualThreadInput = {
  collectionId: string;
  articleId: string;
  organizationId?: string;
  pillarId?: CoreHubPillarId;
  sectionId?: string;
  initialMessage?: string;
};

export type EnsureWorkshop2ArticleContextualThreadResult = {
  ok: true;
  collectionId: string;
  articleId: string;
  contextId: string;
  contextType: typeof WORKSHOP2_ARTICLE_CONTEXT_TYPE;
  created: boolean;
  messageCount: number;
  chatId: string;
};

export type PlatformCoreCommsContextualThreadResult =
  | ({
      ok: true;
      contextType: typeof WORKSHOP2_B2B_ORDER_CONTEXT_TYPE;
      chatId: string;
    } & Awaited<ReturnType<typeof ensureB2bOrderContextualThread>>)
  | EnsureWorkshop2ArticleContextualThreadResult;

function buildArticleThreadMessage(input: EnsureWorkshop2ArticleContextualThreadInput): string {
  const articleId = input.articleId.trim();
  const collectionId = input.collectionId.trim();
  const pillar = input.pillarId?.trim();
  const section = input.sectionId?.trim();
  if (pillar && section) {
    return `Тред по артикулу ${articleId} · ${collectionId} · контекст ${pillar}/${section}.`;
  }
  return `Тред по артикулу ${articleId} · коллекция ${collectionId} · PG registry.`;
}

/** Idempotent PG contextual thread для workshop2_article. */
export async function ensureWorkshop2ArticleContextualThread(
  input: EnsureWorkshop2ArticleContextualThreadInput
): Promise<EnsureWorkshop2ArticleContextualThreadResult> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const contextId = workshop2ArticleContextId(collectionId, articleId);
  const org = input.organizationId?.trim() || 'org-brand-001';
  const chatId = `w2ctx:${WORKSHOP2_ARTICLE_CONTEXT_TYPE}:${collectionId}:${articleId}`;

  const existing = await listWorkshop2ContextualMessages({
    organizationId: org,
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    contextId,
  });

  if (existing.length > 0) {
    return {
      ok: true,
      collectionId,
      articleId,
      contextId,
      contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
      created: false,
      messageCount: existing.length,
      chatId,
    };
  }

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    contextId,
    message: input.initialMessage?.trim() || buildArticleThreadMessage(input),
  });

  return {
    ok: true,
    collectionId,
    articleId,
    contextId,
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    created: true,
    messageCount: 1,
    chatId,
  };
}

/** Unified POST: order b2b_order или article workshop2_article contextual thread. */
export async function ensurePlatformCoreCommsContextualThread(input: {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  organizationId?: string;
  pillarId?: CoreHubPillarId;
  sectionId?: string;
  source?: 'checkout' | 'registry' | 'api';
  initialMessage?: string;
}): Promise<PlatformCoreCommsContextualThreadResult> {
  const orderId = input.orderId?.trim();
  if (orderId) {
    const result = await ensureB2bOrderContextualThread({
      orderId,
      organizationId: input.organizationId,
      pillarId: input.pillarId,
      sectionId: input.sectionId,
      source: input.source ?? 'api',
      initialMessage: input.initialMessage,
    });
    return {
      ...result,
      contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
      chatId: buildPgB2bOrderChatId(orderId),
    };
  }

  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  if (!collectionId || !articleId) {
    throw new Error('orderId или collectionId+articleId обязательны');
  }

  return ensureWorkshop2ArticleContextualThread({
    collectionId,
    articleId,
    organizationId: input.organizationId,
    pillarId: input.pillarId,
    sectionId: input.sectionId,
    initialMessage: input.initialMessage,
  });
}
