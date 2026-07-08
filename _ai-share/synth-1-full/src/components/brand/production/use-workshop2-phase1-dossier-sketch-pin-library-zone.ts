'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { Workshop2SketchPinLibraryDialog } from '@/components/brand/production/workshop2-phase1-dossier-panel-sketch-pin-library-dialog';
import { applySaveSketchLabelsSnapshotWithTzLog } from '@/components/brand/production/workshop2-phase1-dossier-panel-sketch-label-snapshot-tz';
import { pushTzActionLog } from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-action-log';
import {
  appendOrgSketchPinTemplate,
  readOrgSketchPinTemplatesSync,
  removeOrgSketchPinTemplate,
  setSketchOrgPinTemplateRepository,
} from '@/lib/production/sketch-org-templates-repository';
import {
  getApiSketchOrgPinTemplateRepository,
  fetchOrgSketchPinTemplatesRemote,
} from '@/lib/production/sketch-org-templates-api-client';
import type {
  Workshop2DossierPhase1,
  Workshop2SketchLabelsSnapshot,
  Workshop2SketchPinTemplate,
} from '@/lib/production/workshop2-dossier-phase1.types';
import { restoreSketchLabelsSnapshot } from '@/lib/production/workshop2-sketch-snapshots';
import {
  appendSketchPinTemplate,
  applySketchPinTemplateToMaster,
  createSketchPinTemplateRecord,
  removeSketchPinTemplate,
  resolveSketchPinTemplatePick,
} from '@/lib/production/workshop2-sketch-pin-templates';

export type Workshop2SketchPinLibraryDialogProps = ComponentProps<
  typeof Workshop2SketchPinLibraryDialog
>;

export type BuildWorkshop2SketchPinLibraryDialogPropsInput = {
  sketchPinLibraryOpen: boolean;
  setSketchPinLibraryOpen: Dispatch<SetStateAction<boolean>>;
  sketchSnapshotsNewestFirst: Workshop2SketchLabelsSnapshot[];
  sketchSnapshotDiffA: string;
  sketchSnapshotDiffB: string;
  setSketchSnapshotDiffA: Dispatch<SetStateAction<string>>;
  setSketchSnapshotDiffB: Dispatch<SetStateAction<string>>;
  sketchSnapshotDiffSummary: string | null | undefined;
  setSketchSnapshotDiffSummary: Dispatch<SetStateAction<string | null>>;
  restoreSketchLabelsFromSnapshot: (snap: Workshop2SketchLabelsSnapshot) => void;
  dossier: Workshop2DossierPhase1;
  deleteSketchPinTemplateById: (templateId: string) => void;
  collectionId: string;
  orgSketchTemplatesList: readonly Workshop2SketchPinTemplate[];
  deleteOrgSketchPinTemplateById: (templateId: string) => void;
};

export function buildWorkshop2SketchPinLibraryDialogProps({
  sketchPinLibraryOpen,
  setSketchPinLibraryOpen,
  sketchSnapshotsNewestFirst,
  sketchSnapshotDiffA,
  sketchSnapshotDiffB,
  setSketchSnapshotDiffA,
  setSketchSnapshotDiffB,
  sketchSnapshotDiffSummary,
  setSketchSnapshotDiffSummary,
  restoreSketchLabelsFromSnapshot,
  dossier,
  deleteSketchPinTemplateById,
  collectionId,
  orgSketchTemplatesList,
  deleteOrgSketchPinTemplateById,
}: BuildWorkshop2SketchPinLibraryDialogPropsInput): Workshop2SketchPinLibraryDialogProps {
  return {
    open: sketchPinLibraryOpen,
    onOpenChange: setSketchPinLibraryOpen,
    snapshots: sketchSnapshotsNewestFirst,
    snapshotDiffA: sketchSnapshotDiffA,
    snapshotDiffB: sketchSnapshotDiffB,
    onSnapshotDiffAChange: setSketchSnapshotDiffA,
    onSnapshotDiffBChange: setSketchSnapshotDiffB,
    snapshotDiffSummary: sketchSnapshotDiffSummary ?? '',
    onSnapshotDiffSummaryChange: (summary) => setSketchSnapshotDiffSummary(summary),
    onRestoreSnapshot: restoreSketchLabelsFromSnapshot,
    dossierPinTemplates: dossier.sketchPinTemplates,
    onDeleteDossierPinTemplate: deleteSketchPinTemplateById,
    collectionId,
    orgPinTemplates: orgSketchTemplatesList,
    onDeleteOrgPinTemplate: deleteOrgSketchPinTemplateById,
  };
}

export type UseWorkshop2Phase1DossierSketchPinLibraryZoneInput = {
  collectionId: string;
  currentLeafId: string;
  dossier: Workshop2DossierPhase1;
  setDossier: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  updatedByLabel: string;
  toast: (p: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  sketchMasterTemplateId: string;
  setSketchMasterTemplateId: Dispatch<SetStateAction<string>>;
  orgSketchLibraryRevision: number;
  setOrgSketchLibraryRevision: Dispatch<SetStateAction<number>>;
  setSketchPinLibraryOpen: Dispatch<SetStateAction<boolean>>;
};

/** Снимки меток скетча + шаблоны pin (dossier + org browser library). */
export function useWorkshop2Phase1DossierSketchPinLibraryZone({
  collectionId,
  currentLeafId,
  dossier,
  setDossier,
  updatedByLabel,
  toast,
  sketchMasterTemplateId,
  setSketchMasterTemplateId,
  orgSketchLibraryRevision,
  setOrgSketchLibraryRevision,
  setSketchPinLibraryOpen,
}: UseWorkshop2Phase1DossierSketchPinLibraryZoneInput) {
  useEffect(() => {
    if (isPlatformCoreMode()) {
      setSketchOrgPinTemplateRepository(getApiSketchOrgPinTemplateRepository());
    }
  }, []);

  const saveSketchLabelsSnapshot = useCallback(() => {
    const label = window.prompt('Подпись снимка (необязательно)', '')?.trim();
    setDossier((prev: Workshop2DossierPhase1) =>
      applySaveSketchLabelsSnapshotWithTzLog(prev, updatedByLabel, label, currentLeafId)
    );
    toast({ title: 'Снимок меток сохранён', description: 'В досье и в журнале ТЗ.' });
  }, [currentLeafId, setDossier, toast, updatedByLabel]);

  const restoreSketchLabelsFromSnapshot = useCallback(
    (snap: Workshop2SketchLabelsSnapshot) => {
      if (
        !window.confirm(
          'Вернуть метки общего скетча и листов из этого снимка? Для листов, которые есть и в снимке, и сейчас, метки заменятся; новые листы без записи в снимке не меняются.'
        )
      ) {
        return;
      }
      setDossier((prev: Workshop2DossierPhase1) => {
        const restored = restoreSketchLabelsSnapshot(prev, snap);
        return pushTzActionLog(restored, updatedByLabel, {
          type: 'sketch_labels_restore',
          label: snap.label,
          snapshotAt: snap.at,
        });
      });
      toast({ title: 'Метки восстановлены из снимка' });
      setSketchPinLibraryOpen(false);
    },
    [setDossier, setSketchPinLibraryOpen, toast, updatedByLabel]
  );

  const saveMasterSketchPinTemplate = useCallback(() => {
    const name = window.prompt('Название шаблона меток', '')?.trim();
    if (!name) return;
    const anns = dossier.categorySketchAnnotations ?? [];
    const own = anns.filter((a) => a.categoryLeafId === currentLeafId);
    if (own.length === 0) {
      toast({
        title: 'Нет меток',
        description: 'На общей доске нет меток для этой ветки каталога.',
        variant: 'destructive',
      });
      return;
    }
    setDossier(
      (p: Workshop2DossierPhase1) =>
        appendSketchPinTemplate(p, { name, sourceLeafId: currentLeafId, annotations: anns }).dossier
    );
    toast({ title: 'Шаблон сохранён', description: name });
  }, [currentLeafId, dossier.categorySketchAnnotations, setDossier, toast]);

  const applyMasterSketchPinTemplate = useCallback(
    (mode: 'merge' | 'replace') => {
      const tid = sketchMasterTemplateId.trim();
      if (!tid) return;
      const org = readOrgSketchPinTemplatesSync(collectionId);
      const t = resolveSketchPinTemplatePick(tid, dossier, org);
      if (!t) return;
      setDossier((p: Workshop2DossierPhase1) =>
        applySketchPinTemplateToMaster(p, t, currentLeafId, mode)
      );
      toast({
        title: mode === 'merge' ? 'Метки добавлены из шаблона' : 'Метки заменены шаблоном',
        description: t.name,
      });
    },
    [collectionId, currentLeafId, dossier, setDossier, sketchMasterTemplateId, toast]
  );

  const deleteSketchPinTemplateById = useCallback(
    (templateId: string) => {
      if (!window.confirm('Удалить этот шаблон меток?')) return;
      setDossier((p: Workshop2DossierPhase1) => removeSketchPinTemplate(p, templateId));
      setSketchMasterTemplateId((cur) =>
        cur === `d:${templateId}` || cur === templateId ? '' : cur
      );
      toast({ title: 'Шаблон удалён' });
    },
    [setDossier, setSketchMasterTemplateId, toast]
  );

  const saveMasterSketchPinTemplateToOrg = useCallback(() => {
    const cid = String(collectionId ?? '').trim();
    if (!cid) {
      toast({
        title: 'Нет коллекции',
        description: 'Нужен id коллекции, чтобы писать в общую библиотеку этого браузера.',
        variant: 'destructive',
      });
      return;
    }
    const name = window.prompt('Имя в библиотеке коллекции (этот браузер)', '')?.trim();
    if (!name) return;
    const anns = dossier.categorySketchAnnotations ?? [];
    const own = anns.filter((a) => a.categoryLeafId === currentLeafId);
    if (own.length === 0) {
      toast({
        title: 'Нет меток',
        description: 'На общей доске нет меток для этой ветки каталога.',
        variant: 'destructive',
      });
      return;
    }
    const t = createSketchPinTemplateRecord({
      name,
      sourceLeafId: currentLeafId,
      annotations: anns,
    });
    void appendOrgSketchPinTemplate(cid, t).then(() => {
      setOrgSketchLibraryRevision((n) => n + 1);
      toast({ title: 'Сохранено в библиотеке коллекции', description: name });
    });
  }, [
    collectionId,
    currentLeafId,
    dossier.categorySketchAnnotations,
    setOrgSketchLibraryRevision,
    toast,
  ]);

  const deleteOrgSketchPinTemplateById = useCallback(
    (templateId: string) => {
      const cid = String(collectionId ?? '').trim();
      if (!cid) return;
      if (!window.confirm('Удалить шаблон из библиотеки коллекции в этом браузере?')) return;
      void removeOrgSketchPinTemplate(cid, templateId).then(() => {
        setOrgSketchLibraryRevision((n) => n + 1);
        setSketchMasterTemplateId((cur) => (cur === `o:${templateId}` ? '' : cur));
        toast({ title: 'Удалено из библиотеки коллекции' });
      });
    },
    [collectionId, setOrgSketchLibraryRevision, setSketchMasterTemplateId, toast]
  );

  const sketchSnapshotsNewestFirst = useMemo(
    () => [...(dossier.sketchLabelSnapshots ?? [])].reverse(),
    [dossier.sketchLabelSnapshots]
  );

  const [orgSketchTemplatesList, setOrgSketchTemplatesList] = useState<
    Workshop2SketchPinTemplate[]
  >(() => readOrgSketchPinTemplatesSync(collectionId));

  useEffect(() => {
    let cancelled = false;
    if (isPlatformCoreMode()) {
      void fetchOrgSketchPinTemplatesRemote(collectionId).then(({ templates }) => {
        if (!cancelled) setOrgSketchTemplatesList(templates);
      });
    } else {
      setOrgSketchTemplatesList(readOrgSketchPinTemplatesSync(collectionId));
    }
    return () => {
      cancelled = true;
    };
  }, [collectionId, orgSketchLibraryRevision]);

  return {
    saveSketchLabelsSnapshot,
    restoreSketchLabelsFromSnapshot,
    saveMasterSketchPinTemplate,
    applyMasterSketchPinTemplate,
    deleteSketchPinTemplateById,
    saveMasterSketchPinTemplateToOrg,
    deleteOrgSketchPinTemplateById,
    sketchSnapshotsNewestFirst,
    orgSketchTemplatesList,
  };
}
