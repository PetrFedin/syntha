'use client';

import { useCallback, useMemo, useState } from 'react';
import { stampDossierAfterFinalTzExport } from '@/components/brand/production/workshop2-phase1-dossier-panel-stamp-final-tz-export';
import { stampDossierAfterFactoryPackExport } from '@/components/brand/production/workshop2-phase1-dossier-panel-stamp-factory-pack-export';
import type { Workshop2DossierPanelPostMainTrailProps } from '@/components/brand/production/workshop2-phase1-dossier-panel-post-main-trail';
import {
  downloadWorkshop2FinalTzSpecHtmlFile,
  openWorkshop2FinalTzSpecPrintWindow,
} from '@/lib/production/workshop2-final-tz-spec-export';
import { downloadWorkshop2TechPackHtmlFile } from '@/lib/production/workshop2-techpack-export-sheets';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2TechPackReleaseGate } from '@/lib/production/workshop2-techpack-release-gate';

type PersistFn = (
  dossier: Workshop2DossierPhase1,
  opts?: { freezeUpdatedAt?: boolean }
) => void;

export type UseWorkshop2Phase1DossierFinalTzWizardControllerInput = {
  dossier: Workshop2DossierPhase1;
  tzWriteDisabled: boolean;
  updatedByLabel: string;
  skuDraft: string;
  nameDraft: string;
  pathLabel: string;
  persist: PersistFn;
  toast: (p: { title: string; description?: string }) => void;
  finalTzSpecDocumentHtml: string;
  factoryPackDocumentHtml: string;
  factoryPackReleaseGate: Workshop2TechPackReleaseGate;
  phase1DossierJsonUtf8Bytes: number;
  exportLanguage: 'ru' | 'ru_en' | 'ru_zh';
  setExportLanguage: (lang: 'ru' | 'ru_en' | 'ru_zh') => void;
};

/** Final TZ wizard dialog state + export handlers (sectionBodies zone). */
export function useWorkshop2Phase1DossierFinalTzWizardController({
  dossier,
  tzWriteDisabled,
  updatedByLabel,
  skuDraft,
  nameDraft,
  pathLabel,
  persist,
  toast,
  finalTzSpecDocumentHtml,
  factoryPackDocumentHtml,
  factoryPackReleaseGate,
  phase1DossierJsonUtf8Bytes,
  exportLanguage,
  setExportLanguage,
}: UseWorkshop2Phase1DossierFinalTzWizardControllerInput) {
  const [finalTzWizardOpen, setFinalTzWizardOpen] = useState(false);

  const recordFinalTzExport = useCallback(
    (format: 'html' | 'pdf') => {
      if (tzWriteDisabled) return;
      const stamped = stampDossierAfterFinalTzExport({
        dossier,
        format,
        updatedByLabel,
        skuDraft,
        nameDraft,
        pathLabel,
      });
      persist(stamped, { freezeUpdatedAt: true });
    },
    [dossier, tzWriteDisabled, updatedByLabel, skuDraft, nameDraft, pathLabel, persist]
  );

  const handleFinalTzDownloadHtml = useCallback(() => {
    downloadWorkshop2FinalTzSpecHtmlFile(finalTzSpecDocumentHtml, skuDraft);
    if (!tzWriteDisabled) recordFinalTzExport('html');
    toast({
      title: 'HTML скачан',
      description: tzWriteDisabled
        ? 'Запись в досье и журнал — только с правом «Редактировать производство».'
        : 'Один файл по всем разделам; мета экспорта сохранена в досье.',
    });
  }, [finalTzSpecDocumentHtml, skuDraft, tzWriteDisabled, recordFinalTzExport, toast]);

  const handleFinalTzPrintToPdf = useCallback(() => {
    openWorkshop2FinalTzSpecPrintWindow(finalTzSpecDocumentHtml);
    if (!tzWriteDisabled) recordFinalTzExport('pdf');
    toast({
      title: 'Печать',
      description: tzWriteDisabled
        ? 'Выберите «Сохранить как PDF». Запись экспорта в досье недоступна в режиме просмотра.'
        : 'В системном диалоге выберите «Сохранить как PDF».',
    });
  }, [finalTzSpecDocumentHtml, tzWriteDisabled, recordFinalTzExport, toast]);

  const handleFactoryPackDownloadHtml = useCallback(() => {
    downloadWorkshop2TechPackHtmlFile(factoryPackDocumentHtml, skuDraft);
    if (!tzWriteDisabled) {
      const stamped = stampDossierAfterFactoryPackExport({
        dossier,
        format: 'html',
        updatedByLabel,
        skuDraft,
        releaseGate: factoryPackReleaseGate,
      });
      persist(stamped, { freezeUpdatedAt: true });
    }
    toast({
      title: 'Фабричный пакет скачан',
      description: tzWriteDisabled
        ? '6 листов в браузере; метка в досье — только с production:edit.'
        : 'Мета factory pack export сохранена в досье.',
    });
  }, [
    dossier,
    factoryPackDocumentHtml,
    factoryPackReleaseGate,
    persist,
    skuDraft,
    toast,
    tzWriteDisabled,
    updatedByLabel,
  ]);

  const postMainTrailFinalWizard = useMemo(
    (): Workshop2DossierPanelPostMainTrailProps['finalWizard'] => ({
      open: finalTzWizardOpen,
      onOpenChange: setFinalTzWizardOpen,
      exportLanguage,
      onExportLanguageChange: setExportLanguage,
      finalTzSpecDocumentHtml,
      factoryPackDocumentHtml,
      phase1DossierJsonUtf8Bytes,
      tzWriteDisabled,
      onDownloadHtml: handleFinalTzDownloadHtml,
      onPrintPdf: handleFinalTzPrintToPdf,
      onDownloadFactoryPack: handleFactoryPackDownloadHtml,
    }),
    [
      exportLanguage,
      finalTzSpecDocumentHtml,
      factoryPackDocumentHtml,
      handleFactoryPackDownloadHtml,
      finalTzWizardOpen,
      handleFinalTzDownloadHtml,
      handleFinalTzPrintToPdf,
      phase1DossierJsonUtf8Bytes,
      tzWriteDisabled,
    ]
  );

  return {
    finalTzWizardOpen,
    setFinalTzWizardOpen,
    postMainTrailFinalWizard,
  };
}
