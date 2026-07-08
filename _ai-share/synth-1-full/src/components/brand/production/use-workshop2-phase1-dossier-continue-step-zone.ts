'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import {
  validatePhase2CanonicalRequiredFilled,
  validateWorkshopMatAndCompositionBlockers,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-continue-step-validation';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

type MatAttrDef =
  | {
      requiredForPhase1?: boolean;
      requiredForPhase2?: boolean;
    }
  | undefined;

export type UseWorkshop2Phase1DossierContinueStepZoneInput = {
  dossier: Workshop2DossierPhase1;
  isPhase1: boolean;
  isPhase2: boolean;
  isPhase3: boolean;
  matLabelById: Map<string, string>;
  linkedMatComposition: boolean;
  linkedMatCompositionPhase2: boolean;
  leafPhase1Ids: readonly string[];
  leafPhase2Ids: readonly string[];
  matAttrDef: MatAttrDef;
  setSaveError: Dispatch<SetStateAction<string | null>>;
  persist: (dossier: Workshop2DossierPhase1, opts?: { freezeUpdatedAt?: boolean }) => void;
  onContinueToNextStep?: () => void;
  onContinueToStep3?: () => void;
  onFinishWorkshop?: () => void;
};

/** Phase 1–3 «Следующее» / «Готово»: mat/composition gates + persist + step callbacks. */
export function useWorkshop2Phase1DossierContinueStepZone({
  dossier,
  isPhase1,
  isPhase2,
  isPhase3,
  matLabelById,
  linkedMatComposition,
  linkedMatCompositionPhase2,
  leafPhase1Ids,
  leafPhase2Ids,
  matAttrDef,
  setSaveError,
  persist,
  onContinueToNextStep,
  onContinueToStep3,
  onFinishWorkshop,
}: UseWorkshop2Phase1DossierContinueStepZoneInput) {
  const handleContinue = useCallback(() => {
    setSaveError(null);
    if (isPhase1) {
      const matErr = validateWorkshopMatAndCompositionBlockers({
        dossier,
        matLabelById,
        linkedMatComposition,
        enforceMat: Boolean(leafPhase1Ids.includes('mat') && matAttrDef?.requiredForPhase1),
      });
      if (matErr) {
        setSaveError(matErr);
        return;
      }
      persist(dossier);
      onContinueToNextStep?.();
      return;
    }
    if (isPhase2) {
      const matErr = validateWorkshopMatAndCompositionBlockers({
        dossier,
        matLabelById,
        linkedMatComposition: linkedMatCompositionPhase2,
        enforceMat: Boolean(leafPhase2Ids.includes('mat') && matAttrDef?.requiredForPhase2),
      });
      if (matErr) {
        setSaveError(matErr);
        return;
      }
      const phase2Err = validatePhase2CanonicalRequiredFilled({ leafPhase2Ids, dossier });
      if (phase2Err) {
        setSaveError(phase2Err);
        return;
      }
      persist(dossier);
      onContinueToStep3?.();
      return;
    }
    if (isPhase3) {
      persist(dossier);
      onFinishWorkshop?.();
    }
  }, [
    dossier,
    isPhase1,
    isPhase2,
    isPhase3,
    leafPhase1Ids,
    leafPhase2Ids,
    linkedMatComposition,
    linkedMatCompositionPhase2,
    matAttrDef?.requiredForPhase1,
    matAttrDef?.requiredForPhase2,
    matLabelById,
    onContinueToNextStep,
    onContinueToStep3,
    onFinishWorkshop,
    persist,
    setSaveError,
  ]);

  return { handleContinue };
}
