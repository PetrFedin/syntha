'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useWorkshop2Phase1DossierHandbookCheckSnapshotResetOnActiveSection } from '@/components/brand/production/use-workshop2-phase1-dossier-handbook-check-snapshot-reset-on-active-section';
import { useWorkshop2Phase1DossierTzMinimalMode } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-minimal-mode';
import { useWorkshop2Phase1DossierTzNotifyHighlightResetOnArticleChange } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-notify-highlight-reset-on-article-change';
import type { HandbookCheckSnapshot } from '@/components/brand/production/workshop2-phase1-dossier-panel-handbook-check-snapshot';
import type {
  Workshop2DossierPhase1,
  Workshop2TzSignoffSectionKey,
} from '@/lib/production/workshop2-dossier-phase1.types';

export type UseWorkshop2Phase1DossierTzMinimalDeferZoneInput = {
  isPhase1: boolean;
  activeSection: Workshop2TzSignoffSectionKey;
  dossier: Workshop2DossierPhase1;
  collectionId: string;
  articleId: string;
  setHandbookCheckSnapshot: Dispatch<SetStateAction<HandbookCheckSnapshot | null>>;
};

/** Deferred attrs, TZ minimal mode, notify highlight + reset effects. */
export function useWorkshop2Phase1DossierTzMinimalDeferZone({
  isPhase1,
  activeSection,
  dossier,
  collectionId,
  articleId,
  setHandbookCheckSnapshot,
}: UseWorkshop2Phase1DossierTzMinimalDeferZoneInput) {
  const deferredAttrIds = useMemo(
    () => new Set(dossier.deferredAttrIds ?? []),
    [dossier.deferredAttrIds]
  );
  const { tzMinimalModeBySection, setTzMinimalModeBySection, tzMinimalHideDeferCommentUi } =
    useWorkshop2Phase1DossierTzMinimalMode({ isPhase1, activeSection });
  const [tzNotifyHighlightRowKey, setTzNotifyHighlightRowKey] = useState<string | null>(null);

  useWorkshop2Phase1DossierHandbookCheckSnapshotResetOnActiveSection(
    activeSection,
    setHandbookCheckSnapshot
  );
  useWorkshop2Phase1DossierTzNotifyHighlightResetOnArticleChange(
    collectionId,
    articleId,
    setTzNotifyHighlightRowKey
  );

  return {
    deferredAttrIds,
    tzMinimalModeBySection,
    setTzMinimalModeBySection,
    tzMinimalHideDeferCommentUi,
    tzNotifyHighlightRowKey,
    setTzNotifyHighlightRowKey,
  };
}
