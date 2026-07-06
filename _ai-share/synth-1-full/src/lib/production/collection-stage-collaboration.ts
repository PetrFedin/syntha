/**
 * Согласования по модулю этапа коллекции — POST /api/brand/collection-stage-review.
 */

import { ROUTES } from '@/lib/routes';
import { COLLECTION_ID_PARAM, STAGES_STEP_PARAM } from '@/lib/production/stages-url';

/** Маркер для фильтров на страницах задач/сообщений (до отдельного раздела UI). */
export const REVIEW_FLOW_PARAM = 'reviewFlow';
export const REVIEW_FLOW_COLLECTION_STAGE = 'collection_stage_module';

export type CollectionStageReviewLinkInput = {
  collectionId: string;
  stepId: string;
  stepTitle: string;
};

function buildReviewSearchParams(input: CollectionStageReviewLinkInput): URLSearchParams {
  const p = new URLSearchParams();
  const cid = input.collectionId?.trim();
  if (cid) p.set(COLLECTION_ID_PARAM, cid);
  p.set(STAGES_STEP_PARAM, input.stepId);
  p.set(REVIEW_FLOW_PARAM, REVIEW_FLOW_COLLECTION_STAGE);
  p.set('q', `Согласование этапа: ${input.stepTitle}`);
  return p;
}

export function buildCollectionStageReviewTasksUrl(input: CollectionStageReviewLinkInput): string {
  return `${ROUTES.brand.tasks}?${buildReviewSearchParams(input).toString()}`;
}

export function buildCollectionStageReviewMessagesUrl(
  input: CollectionStageReviewLinkInput
): string {
  return `${ROUTES.brand.messages}?${buildReviewSearchParams(input).toString()}`;
}

// —— Порт API (заглушка → HTTP) ——

export type CollectionStageReviewRequestPayload = {
  /** Ключ хранилища flow / модулей */
  collectionKey: string;
  /** Человекочитаемый id коллекции из URL */
  collectionIdLabel: string;
  stepId: string;
  stepTitle: string;
  actorLabel: string;
  channels: readonly ('tasks' | 'messages')[];
  /** Краткое описание для тикета / первого сообщения */
  summaryNote?: string;
};

export type CollectionStageReviewRequestResult = {
  ok: boolean;
  mode: 'stub' | 'http';
  taskRef?: string;
  messageThreadRef?: string;
  error?: string;
};

/**
 * POST /api/brand/collection-stage-review — создаёт задачу/тред согласования этапа.
 */
export async function submitCollectionStageReviewRequest(
  payload: CollectionStageReviewRequestPayload
): Promise<CollectionStageReviewRequestResult> {
  try {
    const res = await fetch('/api/brand/collection-stage-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      taskRef?: string;
      messageThreadRef?: string;
      error?: string;
    };
    if (!res.ok || !json.ok) {
      return {
        ok: false,
        mode: 'http',
        error: json.error ?? `HTTP ${res.status}`,
      };
    }
    return {
      ok: true,
      mode: 'http',
      taskRef: json.taskRef,
      messageThreadRef: json.messageThreadRef,
    };
  } catch (err) {
    return {
      ok: false,
      mode: 'http',
      error: err instanceof Error ? err.message : 'network_error',
    };
  }
}
