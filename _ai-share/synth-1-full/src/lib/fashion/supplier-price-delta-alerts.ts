import type { SupplierMaterialPriceJournalEntry } from '@/lib/platform-core-supplier-material-price-journal';
import type { SupplierMaterialPricePoint } from '@/lib/platform-core-supplier-materials-reference';

export type SupplierPriceDeltaAlert = {
  materialName: string;
  baselineCost: number;
  currentCost: number;
  deltaPct: number;
  currency: string;
  severity: 'warn' | 'critical';
  messageRu: string;
};

export const SUPPLIER_PRICE_DELTA_DEFAULT_THRESHOLD_PCT = 5;

function normalizeMaterialName(name: string): string {
  return name.trim().toLowerCase();
}

/** Сравнение журнала dossier_events с текущими unitCostNet в BOM — честные алерты без выдуманных данных. */
export function computeSupplierPriceDeltaAlerts(input: {
  journal: readonly SupplierMaterialPriceJournalEntry[];
  currentPoints: readonly SupplierMaterialPricePoint[];
  thresholdPct?: number;
}): SupplierPriceDeltaAlert[] {
  const threshold = input.thresholdPct ?? SUPPLIER_PRICE_DELTA_DEFAULT_THRESHOLD_PCT;
  const latestJournalByMaterial = new Map<string, SupplierMaterialPriceJournalEntry>();

  for (const row of input.journal) {
    const key = normalizeMaterialName(row.materialName);
    if (!key) continue;
    const prev = latestJournalByMaterial.get(key);
    if (!prev || row.recordedAt.localeCompare(prev.recordedAt) > 0) {
      latestJournalByMaterial.set(key, row);
    }
  }

  const alerts: SupplierPriceDeltaAlert[] = [];

  for (const point of input.currentPoints) {
    const key = normalizeMaterialName(point.materialName);
    if (!key) continue;
    const baseline = latestJournalByMaterial.get(key);
    if (!baseline) continue;

    const baselineCost = baseline.unitCostNet;
    const currentCost = point.unitCostNet;
    if (!Number.isFinite(baselineCost) || baselineCost <= 0) continue;
    if (!Number.isFinite(currentCost) || currentCost <= 0) continue;
    if (baselineCost === currentCost) continue;

    const deltaPct = Math.round(((currentCost - baselineCost) / baselineCost) * 1000) / 10;
    if (Math.abs(deltaPct) < threshold) continue;

    const severity: SupplierPriceDeltaAlert['severity'] =
      Math.abs(deltaPct) >= threshold * 2 ? 'critical' : 'warn';
    const direction = deltaPct > 0 ? 'рост' : 'снижение';

    alerts.push({
      materialName: point.materialName,
      baselineCost,
      currentCost,
      deltaPct,
      currency: point.currency || baseline.currency || 'RUB',
      severity,
      messageRu: `${point.materialName}: ${direction} ${Math.abs(deltaPct)}% (${baselineCost} → ${currentCost} ${point.currency})`,
    });
  }

  return alerts.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
}
