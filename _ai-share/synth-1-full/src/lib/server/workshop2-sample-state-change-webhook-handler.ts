import 'server-only';

import type { Workshop2SampleStateChangeWebhookPayload } from '@/lib/production/workshop2-sample-state-change-webhook';
import { bumpPlatformCoreCommsInbox } from '@/lib/server/platform-core-comms-inbox-hub';
import { bumpPlatformCoreDevelopmentStatus } from '@/lib/server/platform-core-development-status-hub';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import { getOrCreateGlobalRuntime } from '@/lib/server/global-runtime-singleton';

type JournalRow = {
  eventId: string;
  collectionId: string;
  articleId: string;
  orderId?: string;
  fromStatus?: string;
  toStatus: string;
  receivedAt: string;
  actor?: string;
};

const journalStore = getOrCreateGlobalRuntime(
  Symbol.for('workshop2:sample-state-change-webhook-journal'),
  () => new Map<string, JournalRow>()
);

export type Workshop2SampleStateChangeWebhookResult = {
  ok: boolean;
  idempotent?: boolean;
  journalRecorded: boolean;
  messageRu: string;
};

export function clearWorkshop2SampleStateChangeWebhookJournalForTests(): void {
  journalStore.clear();
}

/** Inbound sample status webhook → journal + development-status + comms bump (stub). */
export async function handleWorkshop2SampleStateChangeWebhook(
  input: Workshop2SampleStateChangeWebhookPayload & { actorLabel?: string }
): Promise<Workshop2SampleStateChangeWebhookResult> {
  const eventId = input.eventId.trim();
  if (!eventId) {
    return { ok: false, journalRecorded: false, messageRu: 'Укажите eventId.' };
  }

  const existing = journalStore.get(eventId);
  if (existing) {
    bumpPlatformCoreDevelopmentStatus([input.collectionId]);
    return {
      ok: true,
      idempotent: true,
      journalRecorded: true,
      messageRu: `Sample webhook: eventId ${eventId} уже в journal (idempotent).`,
    };
  }

  const receivedAt = new Date().toISOString();
  journalStore.set(eventId, {
    eventId,
    collectionId: input.collectionId,
    articleId: input.articleId,
    orderId: input.orderId,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    receivedAt,
    actor: input.actor ?? input.actorLabel,
  });

  bumpPlatformCoreDevelopmentStatus([input.collectionId]);
  bumpPlatformCoreCommsInbox('sample_order.status_changed');

  await enqueueWorkshop2DomainEvent({
    type: 'sample_order.status_changed',
    collectionId: input.collectionId,
    articleId: input.articleId,
    payload: {
      orderId: input.orderId,
      status: input.toStatus,
      fromStatus: input.fromStatus,
      source: 'sample_state_change_webhook',
      eventId,
      note: input.note,
    },
    dispatchNow: true,
  });

  return {
    ok: true,
    journalRecorded: true,
    messageRu: `Sample webhook: ${input.fromStatus ?? '?'} → ${input.toStatus} · journal + SSE bump.`,
  };
}
