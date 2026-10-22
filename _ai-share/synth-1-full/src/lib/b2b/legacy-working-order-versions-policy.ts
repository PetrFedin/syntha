/**
 * Legacy Working Order versions v1 is a shared, filesystem-backed demo store.
 * It has no tenant isolation, so it must never be read or written in production.
 *
 * Canonical production version history belongs to order-scoped, authorized
 * persistence (PostgreSQL / Spine), not the legacy full-list PUT endpoint.
 */
export function canUseLegacyB2bWorkingOrderVersionsStore(
  nodeEnv: string | undefined = process.env.NODE_ENV
): boolean {
  return nodeEnv === 'development' || nodeEnv === 'test';
}
