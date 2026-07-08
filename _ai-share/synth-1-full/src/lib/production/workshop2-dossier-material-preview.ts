import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

export type Workshop2DossierMaterialPreview = {
  name: string;
  unitLabelRu: string;
  consumptionLabel?: string;
};

/** Единица измерения материала (UoM) — расшифровка для RU UI. */
export function formatWorkshop2MaterialUnitRu(unit?: 'm' | 'm2' | 'kg' | 'pcs' | 'set'): string {
  switch (unit) {
    case 'm':
      return 'м';
    case 'm2':
      return 'м²';
    case 'kg':
      return 'кг';
    case 'pcs':
      return 'шт';
    case 'set':
      return 'компл.';
    default:
      return 'ед.';
  }
}

export function extractWorkshop2DossierMaterialPreviews(
  dossier: Workshop2DossierPhase1 | null | undefined,
  limit?: number
): Workshop2DossierMaterialPreview[] {
  const lines = (dossier?.productionModel?.materialLines ?? []).filter((l) =>
    l.materialName?.trim()
  );
  const slice = limit != null ? lines.slice(0, limit) : lines;
  return slice.map((line) => {
    const unitLabelRu = formatWorkshop2MaterialUnitRu(line.unit);
    const consumptionLabel =
      line.consumption != null && line.consumption > 0
        ? `${line.consumption} ${unitLabelRu}/изд.`
        : undefined;
    return {
      name: line.materialName.trim(),
      unitLabelRu,
      consumptionLabel,
    };
  });
}

export function formatDossierMaterialPreviewLine(preview: Workshop2DossierMaterialPreview): string {
  const base = `${preview.name} · ${preview.unitLabelRu}`;
  return preview.consumptionLabel ? `${base} (${preview.consumptionLabel})` : base;
}
