import { partitionHandbookAndFree } from '@/lib/production/workshop2-phase1-attribute-partition';
import { effectiveMoqTargetMaxPieces } from '@/lib/production/workshop2-phase1-dossier-storage';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  workshopTzExtraRowsRequiringTzSignoff,
  workshopTzSignoffRequiredForRole,
} from '@/lib/production/workshop2-tz-signatory-options';
import { sumSampleBasePieceQtyForPids } from '@/components/brand/production/workshop2-phase1-dossier-panel-dossier-mutations';
import type { HandbookCategoryLeaf } from '@/lib/production/category-handbook-leaves';

export type BuildWorkshop2Phase1DossierHandbookWarningsInput = {
  dossier: Workshop2DossierPhase1;
  currentLeaf: HandbookCategoryLeaf;
  expectedScaleId: string;
  dimensionLabels: readonly string[];
  leafPhase1Ids: readonly string[];
};

/** Handbook / TZ readiness warnings for dossier panel (sectionBodies). */
export function buildWorkshop2Phase1DossierHandbookWarnings({
  dossier,
  expectedScaleId,
  dimensionLabels,
  leafPhase1Ids,
}: BuildWorkshop2Phase1DossierHandbookWarningsInput): string[] {
  const warnings: string[] = [];
  const hasVisuals = Boolean(
    dossier.categorySketchImageDataUrl ||
    dossier.categorySketchAnnotations?.length ||
    dossier.visualReferences?.length ||
    dossier.brandNotes?.trim()
  );
  if (!hasVisuals) {
    warnings.push(
      'Нет визуального замысла: добавьте основной эскиз, референсы или описание замысла.'
    );
  }
  if (!dossier.sampleSizeScaleId) {
    warnings.push(`Размерная шкала не выбрана. Для этой категории ожидается ${expectedScaleId}.`);
  }
  if (dossier.sampleSizeScaleId && dossier.sampleSizeScaleId !== expectedScaleId) {
    warnings.push(
      `Текущая размерная шкала (${dossier.sampleSizeScaleId}) отличается от ожидаемой по справочнику (${expectedScaleId}).`
    );
  }
  if (
    !dossier.sampleBasePerSizeDimensions ||
    Object.keys(dossier.sampleBasePerSizeDimensions).length === 0
  ) {
    warnings.push('Табель мер пуст: для передачи в образец нужны размеры и габариты.');
  }
  if (dimensionLabels.length > 0 && dossier.sampleBasePerSizeDimensions) {
    const missingDimLabels = new Set<string>();
    for (const sizeRow of Object.values(dossier.sampleBasePerSizeDimensions)) {
      for (const label of dimensionLabels) {
        if (!sizeRow[label]?.trim()) missingDimLabels.add(label);
      }
    }
    if (missingDimLabels.size > 0) {
      warnings.push(
        `Не заполнены handbook-мерки: ${[...missingDimLabels].slice(0, 4).join(', ')}${missingDimLabels.size > 4 ? '…' : ''}.`
      );
    }
  }
  if (
    leafPhase1Ids.includes('mat') &&
    !dossier.assignments.some((a) => a.attributeId === 'mat' && a.values.length > 0)
  ) {
    warnings.push('Основной материал не подтвержден в ТЗ.');
  }
  const reqD = workshopTzSignoffRequiredForRole(dossier.tzSignatoryBindings, 'designer');
  const reqT = workshopTzSignoffRequiredForRole(dossier.tzSignatoryBindings, 'technologist');
  const reqM = workshopTzSignoffRequiredForRole(dossier.tzSignatoryBindings, 'manager');
  if (reqD && !dossier.isVerifiedByDesigner) warnings.push('Нет цифровой подписи дизайнера.');
  if (reqT && !dossier.isVerifiedByTechnologist) warnings.push('Нет цифровой подписи технолога.');
  if (reqM && !dossier.isVerifiedByManager) warnings.push('Нет цифровой подписи менеджера.');
  for (const ex of workshopTzExtraRowsRequiringTzSignoff(dossier.tzSignatoryBindings)) {
    if (!dossier.extraTzSignoffsByRowId?.[ex.rowId]) {
      warnings.push(`Нет цифровой подписи для роли «${ex.roleTitle?.trim() || 'Роль'}» (этап ТЗ).`);
    }
  }
  const cap = effectiveMoqTargetMaxPieces(dossier.passportProductionBrief);
  const sa = dossier.assignments.find(
    (x) => x.kind === 'canonical' && x.attributeId === 'sampleBaseSize'
  );
  const { hbs } = partitionHandbookAndFree(sa);
  if (hbs.length > cap) {
    warnings.push(
      'В справочнике отмечено размеров больше, чем количество образцов в паспорте — снимите лишние или увеличьте лимит.'
    );
  }
  const pids = new Set(hbs.map((v) => v.parameterId!));
  const sum = sumSampleBasePieceQtyForPids(dossier.sampleBasePerSizePieceQty, pids);
  if (sum > cap) {
    warnings.push('Сумма штук по размерам в табеле превышает количество образцов в паспорте.');
  }
  return warnings;
}
