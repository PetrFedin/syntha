export type PlatformCoreCommsNotificationPrefsSseEvent =
  | { type: 'ping'; ts: string }
  | { type: 'prefs_update'; ts: string; role?: string; scopeKey?: string };

export function formatPlatformCoreCommsNotificationPrefsSseData(
  event: PlatformCoreCommsNotificationPrefsSseEvent
): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
