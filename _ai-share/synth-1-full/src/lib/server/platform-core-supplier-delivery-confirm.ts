import 'server-only';

import {
  createPlatformCoreUserCalendarTask,
  listPlatformCoreUserCalendarTasks,
} from '@/lib/server/platform-core-user-calendar-task';

export function supplierDeliveryConfirmTaskId(b2bOrderId: string): string {
  return `supplier-delivery-${b2bOrderId.trim()}`;
}

/** Календарь + contextual thread: поставщик подтвердил поставку материалов (идемпотентно). */
export async function ensurePlatformCoreSupplierDeliveryConfirmEvent(input: {
  collectionId: string;
  b2bOrderId: string;
  articleId: string;
  confirmedCount: number;
  productionOrderId?: string;
}): Promise<{ created: boolean }> {
  const collectionId = input.collectionId.trim();
  const b2bOrderId = input.b2bOrderId.trim();
  const articleId = input.articleId.trim();
  if (!collectionId || !b2bOrderId || !articleId) return { created: false };

  const stableId = supplierDeliveryConfirmTaskId(b2bOrderId);
  const existing = (
    await listPlatformCoreUserCalendarTasks({ collectionId, orderId: b2bOrderId })
  ).some((e) => e.id === stableId);
  if (existing) return { created: false };

  const now = new Date();
  const startAt = now.toISOString();
  const endAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  const poSuffix = input.productionOrderId?.trim() ? ` · ${input.productionOrderId.trim()}` : '';

  await createPlatformCoreUserCalendarTask({
    id: stableId,
    collectionId,
    ownerRole: 'supplier',
    title: `Поставка подтверждена · ${b2bOrderId}${poSuffix}`,
    description: `Поставщик подтвердил ${input.confirmedCount} строк BOM по артикулу ${articleId}.`,
    startAt,
    endAt,
    orderId: b2bOrderId,
    articleId,
    eventType: 'delivery',
  });

  return { created: true };
}
