'use client';

import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  notifyResponsibleForTzRowAction,
  notifyStakeholdersForSectionSignoffAction,
  updateSignoffDeadlineAction,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-notify-clipboard-handlers';
import { jumpToTzSignoffsAreaFooterAction } from '@/components/brand/production/workshop2-phase1-dossier-panel-jump-to-tz-signoffs-footer';
import type {
  Workshop2DossierPhase1,
  Workshop2TzSignoffSectionKey,
} from '@/lib/production/workshop2-dossier-phase1.types';

type PersistFn = (dossier: Workshop2DossierPhase1, opts?: { freezeUpdatedAt?: boolean }) => void;

type Workshop2TzNotifySectionKey = 'general' | 'visuals' | 'material' | 'construction';

type SectionReadinessUi = Record<Workshop2TzSignoffSectionKey, { pct: number; label?: string }>;

export type UseWorkshop2Phase1DossierTzNotifyActionsZoneInput = {
  setTzNotifyHighlightRowKey: Dispatch<SetStateAction<string | null>>;
  toast: (p: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  setDossier: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  persist: PersistFn;
  updatedByLabel: string;
  isPhase1: boolean;
  dossier: Workshop2DossierPhase1;
  sectionReadinessUi: SectionReadinessUi;
  setActiveSection: Dispatch<SetStateAction<Workshop2TzSignoffSectionKey>>;
};

/** TZ notify clipboard + signoff deadline + footer jump callbacks (sectionBodies). */
export function useWorkshop2Phase1DossierTzNotifyActionsZone({
  setTzNotifyHighlightRowKey,
  toast,
  setDossier,
  persist,
  updatedByLabel,
  isPhase1,
  dossier,
  sectionReadinessUi,
  setActiveSection,
}: UseWorkshop2Phase1DossierTzNotifyActionsZoneInput) {
  const notifyResponsibleForTzRow = useCallback(
    (rowKey: string, roleTitle: string, assignee?: string) =>
      notifyResponsibleForTzRowAction(
        { setTzNotifyHighlightRowKey, toast, setDossier, persist, updatedByLabel },
        rowKey,
        roleTitle,
        assignee
      ),
    [setTzNotifyHighlightRowKey, toast, updatedByLabel, persist, setDossier]
  );

  const notifyStakeholdersForSectionSignoff = useCallback(
    (section: Workshop2TzNotifySectionKey, sectionTitle: string, side?: 'brand' | 'tech') =>
      notifyStakeholdersForSectionSignoffAction(
        { setTzNotifyHighlightRowKey, toast, setDossier, persist, updatedByLabel },
        section,
        sectionTitle,
        side
      ),
    [setTzNotifyHighlightRowKey, toast, updatedByLabel, persist, setDossier]
  );

  const setSignoffDeadline = useCallback(
    (section: Workshop2TzNotifySectionKey, side: 'brand' | 'tech', dueAt: string | undefined) =>
      updateSignoffDeadlineAction({ setDossier, persist, updatedByLabel }, section, side, dueAt),
    [updatedByLabel, persist, setDossier]
  );

  const jumpToTzSignoffsAreaFooter = useCallback(
    () =>
      jumpToTzSignoffsAreaFooterAction({
        isPhase1,
        dossier,
        sectionReadinessUi,
        setActiveSection,
      }),
    [isPhase1, dossier, sectionReadinessUi, setActiveSection]
  );

  return {
    notifyResponsibleForTzRow,
    notifyStakeholdersForSectionSignoff,
    setSignoffDeadline,
    jumpToTzSignoffsAreaFooter,
  };
}
