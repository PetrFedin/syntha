/**
 * Wave TZ: factory-scoped PATCH для sample-queue — только status + note.
 */
import type { Workshop2SampleOrderStatus } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  normalizeWorkshop2SampleOrderStatus,
  validateWorkshop2SampleOrderTransition,
} from '@/lib/production/workshop2-sample-order-transitions';

/** Статусы, которые цех может выставить через PATCH sample-queue. */
export const FACTORY_SAMPLE_PATCH_STATUSES: readonly Workshop2SampleOrderStatus[] = [
  'in_progress',
  'received',
];

export type FactorySamplePatchInput = {
  status?: string;
  note?: string;
};

export function validateFactorySamplePatch(input: FactorySamplePatchInput): {
  ok: boolean;
  status?: Workshop2SampleOrderStatus;
  note?: string;
  messageRu?: string;
} {
  const hasStatus = input.status != null && String(input.status).trim().length > 0;
  const note = input.note != null ? String(input.note).trim().slice(0, 500) : undefined;
  if (!hasStatus && !note) {
    return { ok: false, messageRu: 'Укажите status или note (ограниченный PATCH цеха).' };
  }
  if (hasStatus) {
    const status = normalizeWorkshop2SampleOrderStatus(String(input.status));
    if (!status || !FACTORY_SAMPLE_PATCH_STATUSES.includes(status)) {
      return {
        ok: false,
        messageRu: `Цех может менять только: ${FACTORY_SAMPLE_PATCH_STATUSES.join(', ')}.`,
      };
    }
    return { ok: true, status, note };
  }
  return { ok: true, note };
}

export function validateFactorySampleStatusTransition(
  from: Workshop2SampleOrderStatus | string,
  to: Workshop2SampleOrderStatus
) {
  return validateWorkshop2SampleOrderTransition(from, to);
}
