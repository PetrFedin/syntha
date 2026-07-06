export type PlatformCoreSampleStatusSseEvent =
  | { type: 'ping'; ts: string }
  | {
      type: 'sample_update';
      ts: string;
      collectionId: string;
      fingerprint: string;
    };

export function formatPlatformCoreSampleStatusSseData(
  event: PlatformCoreSampleStatusSseEvent
): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function fingerprintWorkshop2SampleRollup(input: {
  total: number;
  byStatus: Record<string, number>;
  avgLeadTimeDays?: number | null;
}): string {
  const statusPart = Object.keys(input.byStatus)
    .sort()
    .map((key) => `${key}:${input.byStatus[key] ?? 0}`)
    .join('|');
  return [input.total, statusPart, input.avgLeadTimeDays ?? 'na'].join(';');
}
