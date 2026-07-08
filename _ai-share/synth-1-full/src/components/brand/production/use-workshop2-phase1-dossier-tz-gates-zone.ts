'use client';

import { useMemo } from 'react';
import {
  buildWorkshop2Phase1DossierFactorySendHubPreview,
  buildWorkshop2Phase1DossierSectionGateErrorsById,
  buildWorkshop2Phase1DossierTzCoreFieldsFillPctGate,
  buildWorkshop2Phase1DossierTzGateSnapshot,
  type BuildWorkshop2Phase1DossierTzGateSnapshotInput,
  type Workshop2Phase1DossierTzCoreFieldsFillPctGate,
} from '@/components/brand/production/workshop2-phase1-dossier-tz-gates';
import type { DossierSection } from '@/lib/production/dossier-readiness-engine';

export type UseWorkshop2Phase1DossierTzGatesZoneInput =
  BuildWorkshop2Phase1DossierTzGateSnapshotInput & {
    sectionWarningsById: Record<DossierSection, string[]>;
  };

/** TZ fill gate, gate snapshot, section gate errors, factory send preview (sectionBodies). */
export function useWorkshop2Phase1DossierTzGatesZone(
  input: UseWorkshop2Phase1DossierTzGatesZoneInput
): {
  tzCoreFieldsFillPctGate: Workshop2Phase1DossierTzCoreFieldsFillPctGate;
  tzGateSnapshot: ReturnType<typeof buildWorkshop2Phase1DossierTzGateSnapshot>;
  sectionGateErrorsById: Record<DossierSection, string[]>;
  factorySendHubPreview: ReturnType<typeof buildWorkshop2Phase1DossierFactorySendHubPreview>;
} {
  const tzCoreFieldsFillPctGate = useMemo(
    () => buildWorkshop2Phase1DossierTzCoreFieldsFillPctGate(input.sectionReadinessUi),
    [input.sectionReadinessUi]
  );

  const tzGateSnapshot = useMemo(
    () =>
      buildWorkshop2Phase1DossierTzGateSnapshot({
        dossier: input.dossier,
        techPackSessionBlobById: input.techPackSessionBlobById,
        attrCommentsById: input.attrCommentsById,
        sectionReadinessUi: input.sectionReadinessUi,
        activeCategoryLeafId: input.activeCategoryLeafId,
      }),
    [
      input.dossier,
      input.techPackSessionBlobById,
      input.attrCommentsById,
      input.sectionReadinessUi,
      input.activeCategoryLeafId,
    ]
  );

  const sectionGateErrorsById = useMemo(
    () =>
      buildWorkshop2Phase1DossierSectionGateErrorsById(input.sectionWarningsById, tzGateSnapshot),
    [input.sectionWarningsById, tzGateSnapshot]
  );

  const factorySendHubPreview = useMemo(
    () => buildWorkshop2Phase1DossierFactorySendHubPreview(input.dossier, tzGateSnapshot),
    [input.dossier, tzGateSnapshot]
  );

  return {
    tzCoreFieldsFillPctGate,
    tzGateSnapshot,
    sectionGateErrorsById,
    factorySendHubPreview,
  };
}
