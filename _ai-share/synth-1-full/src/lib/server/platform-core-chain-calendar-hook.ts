import 'server-only';

import { createPlatformCoreUserCalendarTask } from '@/lib/server/platform-core-user-calendar-task';

export type PlatformCoreChainCalendarStepKind =
  | 'inventory_reserved'
  | 'materials_supplied'
  | 'chain_status';

/** Wave UH: PG calendar task при смене chain-status (вызывается из bump/notification hook). */
export async function createPlatformCoreChainStepCalendarEvents(input: {
  orderId: string;
  collectionId?: string;
  kind: PlatformCoreChainCalendarStepKind;
  titleRu: string;
  bodyRu?: string;
}): Promise<{ taskIds: string[] }> {
  const orderId = input.orderId.trim();
  if (!orderId) return { taskIds: [] };
  const collectionId = input.collectionId?.trim() || 'SS27';
  const now = new Date();
  const startAt = now.toISOString();
  const endAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  const calendarRoles: Array<'shop' | 'brand' | 'manufacturer' | 'supplier'> = [
    'shop',
    'brand',
    'manufacturer',
    'supplier',
  ];
  const taskIds: string[] = [];

  await Promise.all(
    calendarRoles.map(async (ownerRole) => {
      const id = `chain-${input.kind}-${orderId}-${ownerRole}`;
      await createPlatformCoreUserCalendarTask({
        id,
        collectionId,
        ownerRole,
        title: input.titleRu,
        description: input.bodyRu,
        startAt,
        endAt,
        orderId,
        eventType: input.kind === 'materials_supplied' ? 'delivery' : 'event',
      }).catch(() => undefined);
      taskIds.push(id);
    })
  );

  return { taskIds };
}

/** Server hook после bumpPlatformCoreChainStatus — опционально с метаданными шага. */
export async function hookPlatformCoreChainCalendarOnBump(input: {
  orderIds?: string[];
  collectionId?: string;
  kind?: PlatformCoreChainCalendarStepKind;
  titleRu?: string;
  bodyRu?: string;
}): Promise<void> {
  const kind = input.kind ?? 'chain_status';
  const titleRu = input.titleRu?.trim() || `Chain-status · ${kind}`;
  const orderIds = input.orderIds?.filter(Boolean) ?? [];
  if (orderIds.length === 0) return;
  await Promise.all(
    orderIds.map((orderId) =>
      createPlatformCoreChainStepCalendarEvents({
        orderId,
        collectionId: input.collectionId,
        kind,
        titleRu: titleRu.includes(orderId) ? titleRu : `${titleRu} · ${orderId}`,
        bodyRu: input.bodyRu,
      }).catch(() => undefined)
    )
  );
}
