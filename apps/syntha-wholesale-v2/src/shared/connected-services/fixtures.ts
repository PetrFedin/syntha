import type {
  EntityMessageThread,
  WorkspaceCalendarEvent,
  WorkspaceNotification,
  WorkspaceSearchResult,
} from '@/shared/connected-services';
import { buildWorkspaceHref } from '@/shared/workspace/workspace-links';

// Explicit structural fixtures: these records demonstrate link contracts and are not production data.
export const workspaceServiceFixtures = {
  messages: [
    {
      id: 'fixture-thread-1',
      entityType: 'collection',
      entityId: 'fixture-collection-1',
      threadId: 'fixture-thread-1',
      title: 'Обсуждение коллекции',
      targetHref: buildWorkspaceHref('collections', {
        campaignId: 'fixture-campaign-1',
        collectionId: 'fixture-collection-1',
      }),
    },
  ] satisfies readonly EntityMessageThread[],
  notifications: [
    {
      id: 'fixture-notification-1',
      type: 'decision',
      title: 'Требуется решение по выбору',
      description: 'Структурный пример уведомления с обязательной точкой назначения.',
      sourceEntity: { type: 'selection', id: 'fixture-selection-1' },
      targetHref: buildWorkspaceHref('selections', {
        collectionId: 'fixture-collection-1',
        showroomId: 'fixture-showroom-1',
        selectionId: 'fixture-selection-1',
      }),
      createdAt: '2026-01-01T10:00:00.000Z',
      priority: 'high',
      readState: 'unread',
    },
  ] satisfies readonly WorkspaceNotification[],
  calendar: [
    {
      id: 'fixture-event-1',
      entityType: 'confirmation',
      entityId: 'fixture-confirmation-1',
      eventType: 'deadline',
      startsAt: '2026-01-15T09:00:00.000Z',
      endsAt: '2026-01-15T10:00:00.000Z',
      title: 'Срок подтверждения заказа',
      targetHref: buildWorkspaceHref('confirmation', {
        orderId: 'fixture-order-1',
        confirmationId: 'fixture-confirmation-1',
      }),
    },
  ] satisfies readonly WorkspaceCalendarEvent[],
  search: [
    {
      id: 'fixture-result-1',
      entityType: 'order',
      title: 'Заказ',
      subtitle: 'Структурный пример результата поиска',
      metadata: { status: 'fixture', source: 'workspace-service-fixtures' },
      href: buildWorkspaceHref('orders', { orderId: 'fixture-order-1' }),
    },
  ] satisfies readonly WorkspaceSearchResult[],
} as const;
