export type PlatformCoreHandoffQueueSseEvent =
  | { type: 'ping'; ts: string }
  | { type: 'handoff_queue_update'; ts: string; factoryId?: string; fingerprint?: string };

export function formatPlatformCoreHandoffQueueSseData(
  event: PlatformCoreHandoffQueueSseEvent
): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function fingerprintWorkshop2HandoffQueue(
  items: readonly { productionOrderId: string; status: string }[]
): string {
  return items.map((i) => `${i.productionOrderId}:${i.status}`).join('|');
}
