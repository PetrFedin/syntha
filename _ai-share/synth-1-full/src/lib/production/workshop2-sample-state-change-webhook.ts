/**
 * Wave VA · inbound sample state-change webhook (env-gated stub).
 */
import type { Workshop2SampleOrderStatus } from '@/lib/production/workshop2-dossier-phase1.types';
import { normalizeWorkshop2SampleOrderStatus } from '@/lib/production/workshop2-sample-order-transitions';

export const WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_PATH =
  '/api/workshop2/samples/state-change-webhook';

export type Workshop2SampleStateChangeWebhookPayload = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  eventId: string;
  fromStatus?: Workshop2SampleOrderStatus;
  toStatus: Workshop2SampleOrderStatus;
  actor?: string;
  note?: string;
};

export type Workshop2SampleStateChangeWebhookValidation =
  | { ok: true; data: Workshop2SampleStateChangeWebhookPayload }
  | { ok: false; error: string; messageRu: string; fieldErrors?: string[] };

const ID_PATTERN = /^[\w.-]{1,128}$/;

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length ? t : null;
}

export function isWorkshop2SampleStateChangeWebhookEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return (
    String(env.WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_ENABLED ?? 'true')
      .trim()
      .toLowerCase() !== 'false'
  );
}

export function verifyWorkshop2SampleStateChangeWebhookSecret(input: {
  signatureHeader?: string | null;
  env?: Record<string, string | undefined>;
}): { ok: boolean; status?: 401; messageRu?: string } {
  const secret = String(
    input.env?.WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_SECRET ??
      process.env.WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_SECRET ??
      ''
  ).trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return {
        ok: false,
        status: 401,
        messageRu:
          'Sample webhook: задайте WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_SECRET (fail-closed).',
      };
    }
    return { ok: true };
  }
  const header = String(input.signatureHeader ?? '').trim();
  if (!header || header !== secret) {
    return {
      ok: false,
      status: 401,
      messageRu: 'Sample webhook: неверный x-sample-state-secret.',
    };
  }
  return { ok: true };
}

/** Валидация тела POST /api/workshop2/samples/state-change-webhook. */
export function validateWorkshop2SampleStateChangeWebhookPayload(
  body: unknown
): Workshop2SampleStateChangeWebhookValidation {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      ok: false,
      error: 'invalid_body',
      messageRu: 'Sample webhook: тело запроса должно быть JSON-объектом.',
    };
  }

  const raw = body as Record<string, unknown>;
  const fieldErrors: string[] = [];

  const collectionId = nonEmptyString(raw.collectionId);
  if (!collectionId) fieldErrors.push('collectionId');
  else if (!ID_PATTERN.test(collectionId)) fieldErrors.push('collectionId:format');

  const articleId = nonEmptyString(raw.articleId);
  if (!articleId) fieldErrors.push('articleId');
  else if (!ID_PATTERN.test(articleId)) fieldErrors.push('articleId:format');

  const eventId = nonEmptyString(raw.eventId) ?? nonEmptyString(raw.id);
  if (!eventId) fieldErrors.push('eventId');
  else if (eventId.length > 256) fieldErrors.push('eventId:length');

  const toStatus = normalizeWorkshop2SampleOrderStatus(String(raw.toStatus ?? raw.status ?? ''));
  if (!toStatus) fieldErrors.push('toStatus');

  const fromRaw = raw.fromStatus ?? raw.previousStatus;
  const fromStatus =
    fromRaw != null ? normalizeWorkshop2SampleOrderStatus(String(fromRaw)) : undefined;
  if (fromRaw != null && !fromStatus) fieldErrors.push('fromStatus');

  const orderId = nonEmptyString(raw.orderId) ?? undefined;
  const actor = nonEmptyString(raw.actor) ?? undefined;
  const note = nonEmptyString(raw.note)?.slice(0, 500) ?? undefined;

  if (fieldErrors.length) {
    return {
      ok: false,
      error: 'schema_validation_failed',
      messageRu: `Sample webhook: некорректная схема (${fieldErrors.join(', ')}) — journal не записан.`,
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      collectionId: collectionId!,
      articleId: articleId!,
      eventId: eventId!,
      toStatus: toStatus!,
      ...(orderId ? { orderId } : {}),
      ...(fromStatus ? { fromStatus } : {}),
      ...(actor ? { actor } : {}),
      ...(note ? { note } : {}),
    },
  };
}
