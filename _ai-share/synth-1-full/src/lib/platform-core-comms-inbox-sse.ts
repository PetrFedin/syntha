export type PlatformCoreCommsInboxSseEvent =
  | { type: 'ping'; ts: string }
  | { type: 'inbox_update'; ts: string; reason?: string };

export function formatPlatformCoreCommsInboxSseData(event: PlatformCoreCommsInboxSseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
