import 'server-only';

import { appendPlatformCoreNotificationEvent } from '@/lib/server/platform-core-notification-events-repository';
import {
  factoryHandoffQueueHrefForDemo,
  getPlatformCoreDemo,
} from '@/lib/platform-core-hub-matrix';
import { factoryMessagesB2bOrderContextHref } from '@/lib/routes';

/** Wave WY · push в comms inbox при новом PO в очереди handoff (notification_events). */
export async function notifyManufacturerHandoffQueuePoInbox(input: {
  b2bOrderId: string;
  productionOrderId: string;
  collectionId: string;
  factoryId?: string;
  articleId?: string;
}): Promise<void> {
  const b2bOrderId = input.b2bOrderId.trim();
  const productionOrderId = input.productionOrderId.trim();
  const collectionId = input.collectionId.trim() || 'SS27';
  if (!b2bOrderId || !productionOrderId) return;

  const demo = getPlatformCoreDemo(collectionId);
  const factoryId = input.factoryId?.trim() || demo.factoryId;
  const handoffHref = factoryHandoffQueueHrefForDemo({
    ...demo,
    factoryId,
    demoOrderId: b2bOrderId,
  });
  const chatHref = factoryMessagesB2bOrderContextHref(b2bOrderId, { role: 'manufacturer' });

  await appendPlatformCoreNotificationEvent({
    role: 'manufacturer',
    scopeKey: factoryId,
    orderId: b2bOrderId,
    collectionId,
    articleId: input.articleId?.trim(),
    kind: 'order_status',
    titleRu: `Новый PO в очереди · ${productionOrderId}`,
    bodyRu: `Заказ ${b2bOrderId} передан в производство — проверьте очередь передачи.`,
    href: handoffHref,
  });

  await appendPlatformCoreNotificationEvent({
    role: 'manufacturer',
    scopeKey: factoryId,
    orderId: b2bOrderId,
    collectionId,
    articleId: input.articleId?.trim(),
    kind: 'chat',
    titleRu: `Чат по заказу · ${b2bOrderId}`,
    bodyRu: `PO ${productionOrderId} в очереди — откройте тред заказа.`,
    href: chatHref,
  });
}
