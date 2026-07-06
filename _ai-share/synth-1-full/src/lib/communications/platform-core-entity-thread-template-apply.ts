import type { PlatformCoreEntityThreadKind } from '@/lib/communications/platform-core-entity-thread-templates';
import { postPlatformCoreCommsContextualThread } from '@/lib/communications/platform-core-comms-contextual-thread-client';

export type ApplyEntityThreadTemplateInput = {
  message: string;
  threadKind: PlatformCoreEntityThreadKind | string;
  orderId?: string;
  collectionId?: string;
  articleId?: string;
};

/** POST contextual thread (order or article) with initial message — Wave WF. */
export async function applyPlatformCoreEntityThreadTemplate(
  input: ApplyEntityThreadTemplateInput
): Promise<{ ok: boolean; chatId?: string }> {
  const orderId = input.orderId?.trim() || undefined;
  const collectionId = input.collectionId?.trim() || undefined;
  const articleId = input.articleId?.trim() || undefined;
  const threadKind = String(input.threadKind ?? 'bom').trim() || 'bom';

  return postPlatformCoreCommsContextualThread({
    orderId,
    collectionId: orderId ? undefined : collectionId,
    articleId: orderId ? undefined : articleId,
    pillarId: 'comms',
    sectionId: `entity-${threadKind}`,
    initialMessage: input.message,
  });
}
