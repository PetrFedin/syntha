import 'server-only';

import type { Workshop2B2bOrderLine } from '@/lib/production/workshop2-b2b-order-lifecycle';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import type { Workshop2B2bAmendmentRecord } from '@/lib/production/workshop2-b2b-amendment';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';
import { bumpPlatformCoreCommsInbox } from '@/lib/server/platform-core-comms-inbox-hub';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import {
  createWorkshop2B2bAmendment,
  getPendingWorkshop2B2bAmendment,
  getWorkshop2B2bAmendmentById,
  patchWorkshop2B2bAmendment,
} from '@/lib/server/workshop2-b2b-amendment-repository';
import {
  getWorkshop2B2bOrder,
  putWorkshop2B2bOrder,
} from '@/lib/server/workshop2-b2b-orders-repository';

function computeTotalRub(lines: Workshop2B2bOrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.wholesalePriceRub, 0);
}

function normalizeLines(
  lines: Workshop2B2bOrderLine[] | undefined
): Workshop2B2bOrderLine[] | undefined {
  if (!lines?.length) return undefined;
  const out = lines
    .map((line) => ({
      articleId: String(line.articleId ?? '').trim(),
      collectionId: String(line.collectionId ?? '').trim(),
      colorCode: String(line.colorCode ?? 'default').trim() || 'default',
      size: String(line.size ?? 'M').trim() || 'M',
      qty: Math.max(0, Number(line.qty) || 0),
      wholesalePriceRub: Math.max(0, Number(line.wholesalePriceRub) || 0),
      moq: line.moq,
      lineNote: line.lineNote?.trim() || undefined,
      deliveryDate: line.deliveryDate?.trim() || undefined,
    }))
    .filter((line) => line.articleId && line.collectionId && line.qty > 0);
  return out.length > 0 ? out : undefined;
}

export async function submitShopWorkshop2B2bAmendmentRequest(input: {
  orderId: string;
  noteRu: string;
  proposedLines?: Workshop2B2bOrderLine[];
  buyerId?: string;
}): Promise<
  | { ok: true; amendment: Workshop2B2bAmendmentRecord; messageRu: string }
  | { ok: false; code: string; messageRu: string }
> {
  const orderId = input.orderId.trim();
  const noteRu = input.noteRu.trim();
  if (!orderId) {
    return { ok: false, code: 'invalid_order', messageRu: 'Не указан заказ.' };
  }
  if (noteRu.length < 8) {
    return {
      ok: false,
      code: 'invalid_note',
      messageRu: 'Опишите запрашиваемые изменения (минимум 8 символов).',
    };
  }

  const order = await getWorkshop2B2bOrder(orderId);
  if (!order) {
    return { ok: false, code: 'not_found', messageRu: 'B2B заказ не найден.' };
  }
  if (order.status !== 'submitted') {
    return {
      ok: false,
      code: 'amend_locked',
      messageRu: 'Изменение доступно только до подтверждения заказа брендом.',
    };
  }

  const pending = await getPendingWorkshop2B2bAmendment(orderId);
  if (pending) {
    return {
      ok: false,
      code: 'pending_exists',
      messageRu: 'Уже есть активная заявка на изменение — дождитесь решения бренда.',
    };
  }

  const now = new Date().toISOString();
  const amendment: Workshop2B2bAmendmentRecord = {
    id: `amend-${orderId}-${Date.now()}`,
    orderId,
    status: 'pending',
    noteRu,
    proposedLines: normalizeLines(input.proposedLines),
    createdAt: now,
    updatedAt: now,
    createdBy: input.buyerId?.trim() || order.buyerId || 'shop',
  };

  await createWorkshop2B2bAmendment(amendment);
  bumpPlatformCoreChainStatus([orderId]);
  const { bumpPlatformCoreB2bRegistry } =
    await import('@/lib/server/platform-core-b2b-registry-hub');
  bumpPlatformCoreB2bRegistry('b2b.order.amendment_requested');
  bumpPlatformCoreCommsInbox('b2b.order.amendment_requested');

  void appendWorkshop2ContextualSystemMessage({
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: workshop2B2bOrderContextId(orderId),
    message: `Магазин запросил изменение заказа: ${noteRu}`,
  }).catch(() => {});

  return {
    ok: true,
    amendment,
    messageRu: 'Заявка на изменение отправлена бренду.',
  };
}

export async function approveBrandWorkshop2B2bAmendment(input: {
  orderId: string;
  amendmentId: string;
  resolutionNoteRu?: string;
  brandActor?: string;
}): Promise<
  | { ok: true; amendment: Workshop2B2bAmendmentRecord; orderUpdated: boolean; messageRu: string }
  | { ok: false; code: string; messageRu: string }
> {
  const orderId = input.orderId.trim();
  const amendmentId = input.amendmentId.trim();
  const order = await getWorkshop2B2bOrder(orderId);
  if (!order) {
    return { ok: false, code: 'not_found', messageRu: 'B2B заказ не найден.' };
  }

  const amendment = await getWorkshop2B2bAmendmentById(orderId, amendmentId);
  if (!amendment || amendment.status !== 'pending') {
    return {
      ok: false,
      code: 'not_pending',
      messageRu: 'Активная заявка на изменение не найдена.',
    };
  }

  let orderUpdated = false;
  if (amendment.proposedLines?.length) {
    const nextLines = amendment.proposedLines;
    const next: typeof order = {
      ...order,
      lines: nextLines,
      totalRub: computeTotalRub(nextLines),
      updatedAt: new Date().toISOString(),
    };
    await putWorkshop2B2bOrder(next);
    orderUpdated = true;
  }

  const patched = await patchWorkshop2B2bAmendment({
    orderId,
    amendmentId,
    status: 'approved',
    resolvedBy: input.brandActor?.trim() || 'brand',
    resolutionNoteRu: input.resolutionNoteRu?.trim(),
  });
  if (!patched) {
    return { ok: false, code: 'patch_failed', messageRu: 'Не удалось обновить заявку.' };
  }

  bumpPlatformCoreChainStatus([orderId]);
  const { bumpPlatformCoreB2bRegistry } =
    await import('@/lib/server/platform-core-b2b-registry-hub');
  bumpPlatformCoreB2bRegistry('b2b.order.amendment_approved');
  bumpPlatformCoreCommsInbox('b2b.order.amendment_approved');
  const { pushShopOperationalStatusMirrorFromBrandAmend } =
    await import('@/lib/server/shop-b2b-operational-status-mirror');
  void pushShopOperationalStatusMirrorFromBrandAmend({
    orderId,
    amendmentId,
    amendmentStatus: 'approved',
  }).catch(() => {});
  const detail = orderUpdated
    ? ' Бренд применил новые строки заказа.'
    : ' Бренд одобрил запрос — уточните детали в матрице или чате.';
  void appendWorkshop2ContextualSystemMessage({
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: workshop2B2bOrderContextId(orderId),
    message: `Бренд одобрил заявку на изменение.${detail}`,
  }).catch(() => {});

  return {
    ok: true,
    amendment: patched,
    orderUpdated,
    messageRu: orderUpdated ? 'Заявка одобрена · строки заказа обновлены.' : 'Заявка одобрена.',
  };
}

export async function rejectBrandWorkshop2B2bAmendment(input: {
  orderId: string;
  amendmentId: string;
  resolutionNoteRu?: string;
  brandActor?: string;
}): Promise<
  | { ok: true; amendment: Workshop2B2bAmendmentRecord; messageRu: string }
  | { ok: false; code: string; messageRu: string }
> {
  const orderId = input.orderId.trim();
  const amendmentId = input.amendmentId.trim();
  const amendment = await getWorkshop2B2bAmendmentById(orderId, amendmentId);
  if (!amendment || amendment.status !== 'pending') {
    return {
      ok: false,
      code: 'not_pending',
      messageRu: 'Активная заявка на изменение не найдена.',
    };
  }

  const patched = await patchWorkshop2B2bAmendment({
    orderId,
    amendmentId,
    status: 'rejected',
    resolvedBy: input.brandActor?.trim() || 'brand',
    resolutionNoteRu: input.resolutionNoteRu?.trim(),
  });
  if (!patched) {
    return { ok: false, code: 'patch_failed', messageRu: 'Не удалось обновить заявку.' };
  }

  bumpPlatformCoreChainStatus([orderId]);
  const { bumpPlatformCoreB2bRegistry } =
    await import('@/lib/server/platform-core-b2b-registry-hub');
  bumpPlatformCoreB2bRegistry('b2b.order.amendment_rejected');
  bumpPlatformCoreCommsInbox('b2b.order.amendment_rejected');
  const { pushShopOperationalStatusMirrorFromBrandAmend } =
    await import('@/lib/server/shop-b2b-operational-status-mirror');
  void pushShopOperationalStatusMirrorFromBrandAmend({
    orderId,
    amendmentId,
    amendmentStatus: 'rejected',
  }).catch(() => {});
  const note = input.resolutionNoteRu?.trim();
  void appendWorkshop2ContextualSystemMessage({
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: workshop2B2bOrderContextId(orderId),
    message: `Бренд отклонил заявку на изменение.${note ? ` ${note}` : ''}`,
  }).catch(() => {});

  return { ok: true, amendment: patched, messageRu: 'Заявка отклонена.' };
}
