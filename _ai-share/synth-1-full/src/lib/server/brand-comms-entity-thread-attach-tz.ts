import 'server-only';

import { WORKSHOP2_ARTICLE_CONTEXT_TYPE } from '@/lib/production/workshop2-domain-event-types';
import {
  brandCommsEntityThreadAttachTzMessage,
  brandCommsEntityThreadSupportsAttachTz,
} from '@/lib/fashion/brand-comms-entity-thread-attach-tz';
import type { BrandCommsEntityThreadKind } from '@/lib/fashion/brand-comms-entity-threads';
import { bumpPlatformCoreCommsInbox } from '@/lib/server/platform-core-comms-inbox-hub';
import { appendWorkshop2ContextualMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import { WORKSHOP2_CONTEXTUAL_SYSTEM_SENDER } from '@/lib/server/workshop2-contextual-message-sender';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';

export async function attachBrandCommsEntityThreadTzServer(input: {
  collectionId: string;
  articleId: string;
  threadKind: BrandCommsEntityThreadKind;
  organizationId?: string;
}): Promise<{ ok: true; messageId: string; dossierHref: string }> {
  if (!brandCommsEntityThreadSupportsAttachTz(input.threadKind)) {
    throw new Error('THREAD_KIND_UNSUPPORTED');
  }
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const dossierHref = workshop2ArticleHref(collectionId, articleId, {
    w2pane: 'tz',
    w2sec: 'spec',
  });
  const contextId = `${collectionId}:${articleId}`;
  const message = brandCommsEntityThreadAttachTzMessage({
    threadKind: input.threadKind,
    collectionId,
    articleId,
    dossierHref,
  });

  const saved = await appendWorkshop2ContextualMessage({
    organizationId: input.organizationId?.trim() || 'org-brand-001',
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    contextId,
    message,
    sender: WORKSHOP2_CONTEXTUAL_SYSTEM_SENDER,
    isSystem: true,
    attachmentName: 'workshop2-dossier-tz',
    attachmentUrl: dossierHref,
  });

  bumpPlatformCoreCommsInbox('contextual_message');
  return { ok: true, messageId: saved.id, dossierHref };
}
