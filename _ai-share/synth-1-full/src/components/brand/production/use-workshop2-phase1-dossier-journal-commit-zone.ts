'use client';

import {
  useCallback,
  useMemo,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import {
  commitDossierEditJournalViaBrowser,
  commitTzActionJournalViaBrowser,
  type CommitJournalViaBrowserBase,
  W2_JOURNAL_COMMIT_LS_FULL,
  W2_JOURNAL_COMMIT_LS_JOURNAL,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-commit-tz-journal-line';
import type {
  Workshop2DossierPhase1,
  Workshop2TzActionLogPayload,
} from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2DossierMetricsFlushContext } from '@/lib/production/workshop2-dossier-metrics-ingest';

export type UseWorkshop2Phase1DossierJournalCommitZoneInput = {
  collectionId: string;
  articleId: string;
  lastPersistedDossierRef: MutableRefObject<Workshop2DossierPhase1 | null>;
  w2DossierMetricsCtx: Workshop2DossierMetricsFlushContext;
  setDossierMetricsTick: Dispatch<SetStateAction<number>>;
  setSaveError: Dispatch<SetStateAction<string | null>>;
  toast: (p: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  updatedByLabel: string;
  tzWriteDisabled: boolean;
  setDossierInternal: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
};

/** Browser journal commit base + TZ/passport/techpack log callbacks (sectionBodies). */
export function useWorkshop2Phase1DossierJournalCommitZone({
  collectionId,
  articleId,
  lastPersistedDossierRef,
  w2DossierMetricsCtx,
  setDossierMetricsTick,
  setSaveError,
  toast,
  updatedByLabel,
  tzWriteDisabled,
  setDossierInternal,
}: UseWorkshop2Phase1DossierJournalCommitZoneInput) {
  const journalCommitBase = useMemo(
    (): CommitJournalViaBrowserBase => ({
      collectionId,
      articleId,
      lastPersistedDossierRef,
      w2DossierMetricsCtx,
      setDossierMetricsTick,
      setSaveError,
      toast,
      updatedByLabel,
    }),
    [
      collectionId,
      articleId,
      lastPersistedDossierRef,
      w2DossierMetricsCtx,
      setDossierMetricsTick,
      setSaveError,
      toast,
      updatedByLabel,
    ]
  );

  const appendPassportPostSignoffJournalNote = useCallback(() => {
    if (tzWriteDisabled) {
      toast({
        title: 'Только просмотр',
        description: 'Запись в журнал недоступна без права редактирования.',
        variant: 'destructive',
      });
      return;
    }
    setDossierInternal((prev) =>
      commitDossierEditJournalViaBrowser(
        journalCommitBase,
        prev,
        [
          'Напоминание: досье изменено после подписи ТЗ — пересмотреть подтверждение при существенных правках паспорта / брифа.',
        ],
        W2_JOURNAL_COMMIT_LS_FULL,
        { title: 'Запись добавлена', description: 'Строка в журнале действий ТЗ.' }
      )
    );
  }, [journalCommitBase, setDossierInternal, toast, tzWriteDisabled]);

  const logTechPackZipLine = useCallback(
    (line: string) => {
      if (tzWriteDisabled) return;
      setDossierInternal((prev) =>
        commitDossierEditJournalViaBrowser(
          journalCommitBase,
          prev,
          [line],
          W2_JOURNAL_COMMIT_LS_JOURNAL
        )
      );
    },
    [journalCommitBase, setDossierInternal, tzWriteDisabled]
  );

  const appendTzPulse = useCallback(
    (action: Workshop2TzActionLogPayload) => {
      if (tzWriteDisabled) return;
      setDossierInternal((prev) =>
        commitTzActionJournalViaBrowser(
          journalCommitBase,
          prev,
          action,
          W2_JOURNAL_COMMIT_LS_JOURNAL
        )
      );
    },
    [journalCommitBase, setDossierInternal, tzWriteDisabled]
  );

  return {
    journalCommitBase,
    appendPassportPostSignoffJournalNote,
    logTechPackZipLine,
    appendTzPulse,
  };
}
