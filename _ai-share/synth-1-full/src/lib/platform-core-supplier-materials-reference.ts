import type { Workshop2ProductionMaterialLine } from '@/lib/production/workshop2-dossier-phase1.types';
import { formatWorkshop2MaterialUnitRu } from '@/lib/production/workshop2-dossier-material-preview';

export type SupplierBomLineInput = Pick<
  Workshop2ProductionMaterialLine,
  | 'materialName'
  | 'role'
  | 'isPrimary'
  | 'consumption'
  | 'yieldPerUnit'
  | 'unit'
  | 'unitCostNet'
  | 'currency'
  | 'substitutes'
  | 'supplier'
>;

/** Вес строки BOM по критичности роли (main/lining выше trim/label). */
export const SUPPLIER_BOM_ROLE_WEIGHT: Record<NonNullable<SupplierBomLineInput['role']>, number> = {
  main: 5,
  lining: 4,
  interlining: 4,
  insulation: 4,
  contrast: 3,
  trim: 2,
  thread: 2,
  other: 2,
  label: 1,
  packaging: 1,
};

function lineHasQuantitySpec(line: SupplierBomLineInput): boolean {
  const perUnit = line.yieldPerUnit ?? line.consumption ?? 0;
  return Boolean(line.materialName?.trim()) && perUnit > 0;
}

function lineCriticalityWeight(line: SupplierBomLineInput): number {
  const role = line.role ?? 'other';
  const base = SUPPLIER_BOM_ROLE_WEIGHT[role] ?? SUPPLIER_BOM_ROLE_WEIGHT.other;
  return line.isPrimary ? base + 1 : base;
}

/** Доля строк BOM с нормой расхода — честный % без выдуманных данных. */
export function computeSupplierBomFillRatePercent(lines: readonly SupplierBomLineInput[]): number {
  const named = lines.filter((l) => l.materialName?.trim());
  if (named.length === 0) return 0;
  const filled = named.filter(lineHasQuantitySpec).length;
  return Math.round((filled / named.length) * 100);
}

/** Взвешенная полнота: main/lining важнее label/packaging. */
export function computeSupplierBomWeightedFillRatePercent(
  lines: readonly SupplierBomLineInput[]
): number {
  const named = lines.filter((l) => l.materialName?.trim());
  if (named.length === 0) return 0;
  let totalWeight = 0;
  let filledWeight = 0;
  for (const line of named) {
    const weight = lineCriticalityWeight(line);
    totalWeight += weight;
    if (lineHasQuantitySpec(line)) filledWeight += weight;
  }
  if (totalWeight <= 0) return 0;
  return Math.round((filledWeight / totalWeight) * 100);
}

export type SupplierMaterialPricePoint = {
  materialName: string;
  unitCostNet: number;
  currency: string;
  unitLabelRu: string;
  /** Честная подпись: цена из ТЗ досье, не исторический ряд. */
  sourceLabelRu: string;
};

/** Текущие цены из unitCostNet в досье — без фиктивной истории. */
export function extractSupplierMaterialPricePoints(
  lines: readonly SupplierBomLineInput[]
): SupplierMaterialPricePoint[] {
  return lines
    .filter(
      (l) => l.materialName?.trim() && Number.isFinite(l.unitCostNet) && (l.unitCostNet ?? 0) > 0
    )
    .map((line) => ({
      materialName: line.materialName!.trim(),
      unitCostNet: line.unitCostNet!,
      currency: line.currency?.trim() || 'RUB',
      unitLabelRu: formatWorkshop2MaterialUnitRu(line.unit),
      sourceLabelRu: 'Цена из ТЗ досье',
    }));
}

export type SupplierAltMaterialRow = {
  primary: string;
  alternatives: string[];
  supplier?: string;
};

function normalizeSubstitute(entry: string | { id: string; name: string }): string {
  if (typeof entry === 'string') return entry.trim();
  return (entry.name || entry.id || '').trim();
}

/** Альтернативы из поля substitutes в BOM — только если заданы в PG. */
export function extractSupplierAltMaterials(
  lines: readonly SupplierBomLineInput[]
): SupplierAltMaterialRow[] {
  return lines
    .filter((l) => l.materialName?.trim() && (l.substitutes?.length ?? 0) > 0)
    .map((line) => ({
      primary: line.materialName!.trim(),
      alternatives: (line.substitutes ?? []).map(normalizeSubstitute).filter(Boolean),
      supplier: line.supplier?.trim() || undefined,
    }))
    .filter((row) => row.alternatives.length > 0);
}
