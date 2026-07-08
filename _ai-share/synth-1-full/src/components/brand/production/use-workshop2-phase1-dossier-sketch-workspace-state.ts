'use client';

import { useCallback, useRef, useState } from 'react';
import type { CategorySketchAnnotatorHandle } from '@/components/brand/production/CategorySketchAnnotator';
import { exportSketchVisualZipWithGates } from '@/components/brand/production/workshop2-phase1-dossier-panel-export-sketch-visual-zip';
import { registerWorkshop2Phase1TechPackSessionBlobSetter } from '@/components/brand/production/use-workshop2-phase1-dossier-tech-pack-blob-reset-on-article-change';
import type { HandbookCategoryLeaf } from '@/lib/production/category-handbook-leaves';
import {
  createEmptySketchSheet,
  defaultExtraSketchSheetTitle,
  MAX_SKETCH_SHEETS,
  normalizeSketchSheets,
} from '@/lib/production/workshop2-sketch-sheets';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2DossierViewProfile } from '@/lib/production/workshop2-dossier-view-infrastructure';

type SetDossier = (
  u: Workshop2DossierPhase1 | ((prev: Workshop2DossierPhase1) => Workshop2DossierPhase1)
) => void;

export type UseWorkshop2Phase1DossierSketchWorkspaceStateInput = {
  setDossier: SetDossier;
  dossier: Workshop2DossierPhase1;
  currentLeaf: HandbookCategoryLeaf;
  dossierViewProfile: Workshop2DossierViewProfile;
  skuDraft: string;
  toast: (p: { title: string; description?: string; variant?: 'destructive' }) => void;
};

/** Sketch workspace UI state + tech-pack blobs + zip export (sectionBodies zone). */
export function useWorkshop2Phase1DossierSketchWorkspaceState({
  setDossier,
  dossier,
  currentLeaf,
  dossierViewProfile,
  skuDraft,
  toast,
}: UseWorkshop2Phase1DossierSketchWorkspaceStateInput) {
  const [sketchWorkspaceTab, setSketchWorkspaceTab] = useState<'sketch' | 'sublevels'>('sketch');
  const [sketchSurface, setSketchSurface] = useState<'master' | 'sheets'>('master');
  const [sketchSheetPickerId, setSketchSheetPickerId] = useState<string | null>(null);
  const sketchMasterAnnotatorRef = useRef<CategorySketchAnnotatorHandle | null>(null);
  const sketchSheetAnnotatorRef = useRef<CategorySketchAnnotatorHandle | null>(null);
  const [sketchBundleBusy, setSketchBundleBusy] = useState(false);
  const [sketchPinLibraryOpen, setSketchPinLibraryOpen] = useState(false);
  const [techPackSessionBlobById, setTechPackSessionBlobById] = useState<Record<string, string>>(
    () => ({})
  );
  registerWorkshop2Phase1TechPackSessionBlobSetter(setTechPackSessionBlobById);
  const [sketchSnapshotDiffA, setSketchSnapshotDiffA] = useState('');
  const [sketchSnapshotDiffB, setSketchSnapshotDiffB] = useState('');
  const [sketchSnapshotDiffSummary, setSketchSnapshotDiffSummary] = useState<string | null>(null);
  const [sketchMasterTemplateId, setSketchMasterTemplateId] = useState('');
  const [orgSketchLibraryRevision, setOrgSketchLibraryRevision] = useState(0);

  const appendSketchSheetFromUpload = useCallback(
    (imageDataUrl: string, imageFileName?: string) => {
      let newId: string | null = null;
      setDossier((p: Workshop2DossierPhase1) => {
        const cur = normalizeSketchSheets(p.sketchSheets);
        if (cur.length >= MAX_SKETCH_SHEETS) return p;
        const sheet = createEmptySketchSheet(defaultExtraSketchSheetTitle(cur.length));
        newId = sheet.sheetId;
        return {
          ...p,
          sketchSheets: [
            ...cur,
            {
              ...sheet,
              imageDataUrl,
              imageFileName,
              boardOrientation: p.categorySketchBoardOrientation ?? 'landscape',
            },
          ],
        };
      });
      if (newId) {
        setSketchWorkspaceTab('sketch');
        setSketchSurface('master');
        setSketchSheetPickerId(newId);
      }
    },
    [setDossier]
  );

  const exportSketchVisualBundleZip = useCallback(async () => {
    setSketchBundleBusy(true);
    try {
      const r = await exportSketchVisualZipWithGates({
        dossier,
        currentLeaf,
        dossierViewProfile,
        skuDraft,
      });
      if (r === 'aborted') return;
      if (r === 'exported') {
        toast({ title: 'Скачан архив', description: 'ZIP: PNG по доскам и PDF паспорт визуала.' });
      } else {
        toast({ title: 'Не удалось сформировать архив', variant: 'destructive' });
      }
    } finally {
      setSketchBundleBusy(false);
    }
  }, [currentLeaf, dossier, dossierViewProfile, skuDraft, toast]);

  return {
    sketchWorkspaceTab,
    setSketchWorkspaceTab,
    sketchSurface,
    setSketchSurface,
    sketchSheetPickerId,
    setSketchSheetPickerId,
    sketchMasterAnnotatorRef,
    sketchSheetAnnotatorRef,
    sketchBundleBusy,
    setSketchBundleBusy,
    sketchPinLibraryOpen,
    setSketchPinLibraryOpen,
    techPackSessionBlobById,
    setTechPackSessionBlobById,
    sketchSnapshotDiffA,
    setSketchSnapshotDiffA,
    sketchSnapshotDiffB,
    setSketchSnapshotDiffB,
    sketchSnapshotDiffSummary,
    setSketchSnapshotDiffSummary,
    sketchMasterTemplateId,
    setSketchMasterTemplateId,
    orgSketchLibraryRevision,
    setOrgSketchLibraryRevision,
    appendSketchSheetFromUpload,
    exportSketchVisualBundleZip,
  };
}
