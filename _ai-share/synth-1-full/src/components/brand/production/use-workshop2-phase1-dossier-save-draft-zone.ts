'use client';

import { useCallback, type MutableRefObject } from 'react';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

export type UseWorkshop2Phase1DossierSaveDraftZoneInput = {
  setSaveError: (error: string | null) => void;
  persist: (
    dossier: Workshop2DossierPhase1,
    opts?: { freezeUpdatedAt?: boolean; immediate?: boolean }
  ) => void;
  dossierLatestRef: MutableRefObject<Workshop2DossierPhase1>;
};

/** «Сохранить черновик» без проверок и смены шага. */
export function useWorkshop2Phase1DossierSaveDraftZone({
  setSaveError,
  persist,
  dossierLatestRef,
}: UseWorkshop2Phase1DossierSaveDraftZoneInput) {
  const saveDraft = useCallback(() => {
    setSaveError(null);
    persist(dossierLatestRef.current, { immediate: true });
  }, [dossierLatestRef, persist, setSaveError]);

  return { saveDraft };
}
