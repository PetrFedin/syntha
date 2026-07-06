/**
 * Wave TJ · supplier calendar logistics — ETA + map overlay stub (без внешних map API).
 */

export type SupplierLogisticsEtaMapStub = {
  originRu: string;
  destinationRu: string;
  routeLabelRu: string;
};

const DEMO_ROUTES: readonly SupplierLogisticsEtaMapStub[] = [
  { originRu: 'Стамбул', destinationRu: 'Москва', routeLabelRu: 'TR → RU' },
  { originRu: 'Гуанчжоу', destinationRu: 'СПб', routeLabelRu: 'CN → RU' },
  { originRu: 'Милан', destinationRu: 'Казань', routeLabelRu: 'EU → RU' },
  { originRu: 'Дубай', destinationRu: 'Екатеринбург', routeLabelRu: 'ME → RU' },
] as const;

function hashOrderId(orderId: string): number {
  return orderId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

/** Детерминированный маршрут для map overlay stub — без geocoding. */
export function buildSupplierLogisticsEtaMapStub(orderId: string): SupplierLogisticsEtaMapStub {
  const key = orderId.trim() || 'B2B-DEMO-1';
  return DEMO_ROUTES[hashOrderId(key) % DEMO_ROUTES.length]!;
}

export function formatSupplierLogisticsDeliveryWindowLabel(
  window?: { label?: string; estimatedDelivery?: string } | null
): string | null {
  const label = window?.label?.trim();
  if (label) return label;
  const estimated = window?.estimatedDelivery?.trim();
  return estimated || null;
}
