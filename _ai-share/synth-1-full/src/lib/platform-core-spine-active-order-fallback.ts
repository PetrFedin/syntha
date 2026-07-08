import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';

/** Demo pin ids из PLATFORM_CORE_DEMO — не показывать без PG registry hit. */
export function isPlatformCoreDemoPinOrderId(orderId: string): boolean {
  return orderId.trim().startsWith('B2B-DEMO-');
}

/** PG checkout B2B-\\d+ — investor truth; выше demo pin и INT overlay в registry. */
export function isPlatformCorePgCheckoutOrderId(orderId: string): boolean {
  return /^B2B-\d+$/.test(orderId.trim());
}

/** Workshop2 PG logistics: checkout B2B-\\d+ или seeded demo pin B2B-DEMO-*. */
export function isPlatformCorePgLogisticsWholesaleOrderId(orderId: string): boolean {
  const id = orderId.trim();
  return isPlatformCorePgCheckoutOrderId(id) || isPlatformCoreDemoPinOrderId(id);
}

function pgCheckoutOrderNumericId(orderId: string): number {
  const n = Number(orderId.replace(/^B2B-/, ''));
  return Number.isFinite(n) ? n : 0;
}

/** При нескольких заказах коллекции — newest PG checkout, затем любой non-demo, затем первый. */
export function pickPreferredRegistryOrderId(
  orders: ReadonlyArray<{ id?: string | null }>
): string {
  const ids = orders.map((o) => o.id?.trim() ?? '').filter((id) => id.length > 0);
  const pgCheckoutIds = ids.filter((id) => isPlatformCorePgCheckoutOrderId(id));
  if (pgCheckoutIds.length > 0) {
    return [...pgCheckoutIds].sort(
      (a, b) => pgCheckoutOrderNumericId(b) - pgCheckoutOrderNumericId(a)
    )[0]!;
  }
  const nonDemo = ids.find((id) => !isPlatformCoreDemoPinOrderId(id));
  if (nonDemo) return nonDemo;
  return ids[0] ?? '';
}

/** Handoff queue: newest PG checkout → older PG → INT import → first item. */
export function pickPreferredHandoffQueueOrderId(
  items: ReadonlyArray<{ b2bOrderId?: string | null; handoffAt?: string | null }>
): string {
  const rows = items
    .map((i) => ({
      id: i.b2bOrderId?.trim() ?? '',
      handoffAt: i.handoffAt?.trim() ?? '',
    }))
    .filter((row) => row.id.length > 0);

  const pgRows = rows.filter((row) => isPlatformCorePgCheckoutOrderId(row.id));
  if (pgRows.length > 0) {
    pgRows.sort((a, b) => compareHandoffQueueRows(b, a));
    return pgRows[0]!.id;
  }

  const imported = rows.find((row) => isIntegrationImportedWholesaleOrderId(row.id));
  if (imported) return imported.id;
  return rows[0]?.id ?? '';
}

function compareHandoffQueueRows(
  a: { id: string; handoffAt: string },
  b: { id: string; handoffAt: string }
): number {
  const handoffDelta = Date.parse(a.handoffAt || '') - Date.parse(b.handoffAt || '');
  if (Number.isFinite(handoffDelta) && handoffDelta !== 0) return handoffDelta;
  return pgCheckoutOrderNumericId(a.id) - pgCheckoutOrderNumericId(b.id);
}

/** Hub cabinet CTAs: golden B2B-DEMO pin wins over ephemeral B2B-\\d+ from e2e churn. */
export function resolvePlatformCoreCabinetOrderId(
  liveOrderId: string,
  demoOrderId: string
): string {
  const live = liveOrderId.trim();
  const demo = demoOrderId.trim();
  if (!live) return demo;
  if (isPlatformCoreDemoPinOrderId(live)) return live;
  if (demo && isPlatformCoreDemoPinOrderId(demo)) return demo;
  return live;
}

/** Server spine: не возвращать B2B-DEMO-* если w2_registry опрошен и пуст. */
export function resolveSpineFallbackOrderId(
  w2Fallback: string,
  registryQueriedEmpty: boolean
): string {
  const fallback = normalizeSpineFallbackOrderId(w2Fallback);
  if (registryQueriedEmpty && isPlatformCoreDemoPinOrderId(fallback)) {
    return '';
  }
  return fallback;
}

export function normalizeSpineFallbackOrderId(fallbackOrderId: string): string {
  const trimmed = fallbackOrderId.trim();
  return trimmed.startsWith('__') ? '' : trimmed;
}

/** PG checkout wins over INT spine overlay when both resolve. */
export function resolveActiveWholesaleOrderId(input: {
  spineWholesaleOrderId?: string | null;
  fallbackOrderId: string;
  registryQueriedEmpty: boolean;
  resolveFromIncludesRegistry: boolean;
}): string {
  const spineId = input.spineWholesaleOrderId?.trim() ?? '';
  const fallback = normalizeSpineFallbackOrderId(input.fallbackOrderId);

  if (
    spineId &&
    fallback &&
    isPlatformCorePgCheckoutOrderId(fallback) &&
    isIntegrationImportedWholesaleOrderId(spineId)
  ) {
    return fallback;
  }

  if (spineId) return spineId;

  if (
    input.registryQueriedEmpty &&
    input.resolveFromIncludesRegistry &&
    isPlatformCoreDemoPinOrderId(fallback)
  ) {
    return '';
  }
  return fallback;
}
