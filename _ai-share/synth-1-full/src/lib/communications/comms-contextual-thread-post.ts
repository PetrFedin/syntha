import { postPlatformCoreCommsContextualThread } from '@/lib/communications/platform-core-comms-contextual-thread-client';
import type { CommsContextualThreadSource } from '@/lib/platform/wave-yn-comms-contextual-thread';
import { waveYnContextualThreadSectionId } from '@/lib/platform/wave-yn-comms-contextual-thread';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';

const ensuredKeys = new Set<string>();

function buildEnsureKey(input: {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
}): string | null {
  const orderId = input.orderId?.trim();
  if (orderId && isPlatformCorePgB2bOrder(orderId)) {
    return `b2b_order:${orderId}`;
  }
  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  if (collectionId && articleId) {
    return `workshop2_article:${collectionId}:${articleId}`;
  }
  return null;
}

/** Idempotent fire-and-forget POST contextual thread (Wave YN · tracking/calendar/order card). */
export function postCommsContextualThreadEnsure(input: {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  source: CommsContextualThreadSource;
}): void {
  const key = buildEnsureKey(input);
  if (!key || ensuredKeys.has(key)) return;
  ensuredKeys.add(key);

  const orderId = input.orderId?.trim();
  const sectionId = waveYnContextualThreadSectionId(input.source);

  void postPlatformCoreCommsContextualThread({
    orderId: orderId && isPlatformCorePgB2bOrder(orderId) ? orderId : undefined,
    collectionId: orderId ? undefined : input.collectionId?.trim(),
    articleId: orderId ? undefined : input.articleId?.trim(),
    pillarId: 'comms',
    sectionId,
  }).catch(() => {
    ensuredKeys.delete(key);
  });
}

/** Test-only reset for idempotency cache. */
export function resetCommsContextualThreadEnsureForTests(): void {
  ensuredKeys.clear();
}
