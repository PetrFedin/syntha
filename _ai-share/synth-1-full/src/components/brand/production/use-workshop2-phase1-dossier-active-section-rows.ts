'use client';

import { useMemo } from 'react';
import type { Workshop2Phase1ExtraRow } from '@/components/brand/production/workshop2-phase1-dossier-panel-attribute-rows-build';
import type { ResolvedPhase1AttributeRow } from '@/lib/production/attribute-catalog';
import { getWorkshopTzSectionForAttribute as getSectionForAttr } from '@/lib/production/workshop2-tz-section-readiness';
import type { Workshop2TzSignoffSectionKey } from '@/lib/production/workshop2-dossier-phase1.types';

export type UseWorkshop2Phase1DossierActiveSectionRowsInput = {
  isPhase1: boolean;
  isPhase2: boolean;
  isPhase3: boolean;
  rowsToShow: ResolvedPhase1AttributeRow[];
  rowsToShowPhase2: ResolvedPhase1AttributeRow[];
  rowsToShowPhase3: ResolvedPhase1AttributeRow[];
  extraRows: Workshop2Phase1ExtraRow[];
  activeSection: Workshop2TzSignoffSectionKey;
};

/** Active section row slices + current TZ phase (sectionBodies navigation). */
export function useWorkshop2Phase1DossierActiveSectionRows({
  isPhase1,
  isPhase2,
  isPhase3,
  rowsToShow,
  rowsToShowPhase2,
  rowsToShowPhase3,
  extraRows,
  activeSection,
}: UseWorkshop2Phase1DossierActiveSectionRowsInput) {
  const currentPhase: '1' | '2' | '3' = isPhase2 ? '2' : isPhase3 ? '3' : '1';

  const phaseRowsCurrent = isPhase2 ? rowsToShowPhase2 : isPhase3 ? rowsToShowPhase3 : rowsToShow;

  const sectionRowsCurrent = useMemo(
    () =>
      phaseRowsCurrent.filter(
        (row) => getSectionForAttr(row.attribute.attributeId, row.group?.groupId) === activeSection
      ),
    [phaseRowsCurrent, activeSection]
  );

  const extraRowsCurrent = useMemo(
    () =>
      !isPhase1
        ? []
        : extraRows.filter(
            ({ attribute }) =>
              getSectionForAttr(attribute.attributeId, attribute.groupId) === activeSection
          ),
    [extraRows, isPhase1, activeSection]
  );

  return {
    currentPhase,
    phaseRowsCurrent,
    sectionRowsCurrent,
    extraRowsCurrent,
  };
}
