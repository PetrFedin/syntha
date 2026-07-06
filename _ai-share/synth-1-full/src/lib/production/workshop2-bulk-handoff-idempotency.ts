/** Стабильный Idempotency-Key для POST bulk-confirm-production-handoff (client + server). */
export function buildWorkshop2BulkHandoffIdempotencyKey(
  orderIds: string[],
  factoryId?: string
): string {
  const sorted = [...new Set(orderIds.map((id) => id.trim()).filter(Boolean))].sort();
  const factory = factoryId?.trim() || 'fact-1';
  return `b2b-bulk-handoff:${factory}:${sorted.join(',')}`;
}
