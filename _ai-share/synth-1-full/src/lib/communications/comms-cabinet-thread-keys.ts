import type { BrandPgThreadRow } from '@/lib/brand/brand-messages-pg-threads';

export const COMMS_CABINET_SECTION_CONTEXT_THREAD_KEY = '__section_context__';

export function commsCabinetThreadRowKey(thread: BrandPgThreadRow): string {
  return `${thread.contextType}:${thread.contextId?.trim() ?? ''}`;
}
