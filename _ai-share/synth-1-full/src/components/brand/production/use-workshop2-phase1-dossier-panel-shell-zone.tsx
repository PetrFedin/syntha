'use client';

import { useCallback, useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Workshop2DossierTzBlockersFooter } from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-blockers-footer';
import {
  formatWorkshop2InternalArticleCodePlaceholder,
  isWorkshop2InternalArticleCodeValid,
} from '@/lib/production/local-collection-inventory';
import type { Workshop2DossierViewProfile } from '@/lib/production/workshop2-dossier-view-infrastructure';
import type { Workshop2TzSignoffSectionKey } from '@/lib/production/workshop2-dossier-phase1.types';
import type { HandbookCheckSnapshot } from '@/components/brand/production/workshop2-phase1-dossier-panel-handbook-check-snapshot';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { W2ProductionPreflightIssue } from '@/lib/production/workshop2-production-preflight';

type DossierViewUiCaps = {
  showCompactPassportContextRibbon?: boolean;
};

export type UseWorkshop2Phase1DossierPanelShellZoneInput = {
  isPhase1: boolean;
  activeSection: Workshop2TzSignoffSectionKey;
  dossierViewUiCaps: DossierViewUiCaps;
  dossierViewProfile: Workshop2DossierViewProfile;
  handbookCheckSnapshot: HandbookCheckSnapshot | null;
  dossier: Workshop2DossierPhase1;
  setDossier: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  internalArticleCode?: string;
  toast: (p: { title: string; description?: string }) => void;
  onOpenPulse?: () => void;
  productionPreflightIssues: readonly W2ProductionPreflightIssue[];
};

/** Layout flags, rollback banner, TZ blockers footer chrome (orchestrator tail). */
export function useWorkshop2Phase1DossierPanelShellZone({
  isPhase1,
  activeSection,
  dossierViewUiCaps,
  dossierViewProfile,
  handbookCheckSnapshot,
  dossier,
  setDossier,
  internalArticleCode,
  toast,
  onOpenPulse,
  productionPreflightIssues,
}: UseWorkshop2Phase1DossierPanelShellZoneInput) {
  const internalArticleCodeDisplayForRibbon = isWorkshop2InternalArticleCodeValid(
    internalArticleCode ?? ''
  )
    ? (internalArticleCode ?? '')
    : formatWorkshop2InternalArticleCodePlaceholder();

  const showCompactPassportContextRibbon =
    isPhase1 &&
    activeSection !== 'general' &&
    Boolean(dossierViewUiCaps.showCompactPassportContextRibbon);

  const asideHasContent = dossierViewProfile === 'factory' || dossierViewProfile === 'finance';
  const hideTzGlobalRoleSignoffBlock = isPhase1;
  const showTzRightAside = !isPhase1 || Boolean(handbookCheckSnapshot);
  const showFooterTzSignoffShortcut = !isPhase1 || activeSection !== 'assignment';

  const showRollbackButton =
    dossier.lifecycleState === 'sent_to_production' || dossier.lifecycleState === 'handoff_ready';

  const handleRollbackToDevelopment = useCallback(() => {
    setDossier((prev) => ({
      ...prev,
      lifecycleState: 'draft',
    }));
    toast({ title: 'Откат в разработку', description: 'ТЗ возвращено в статус черновика.' });
  }, [setDossier, toast]);

  const tzBlockersFooter = useMemo(
    (): ReactNode => (
      <Workshop2DossierTzBlockersFooter
        onOpenPulse={onOpenPulse}
        aiWarnings={productionPreflightIssues.filter((i) => i.id.startsWith('ai.'))}
      />
    ),
    [onOpenPulse, productionPreflightIssues]
  );

  return {
    internalArticleCodeDisplayForRibbon,
    showCompactPassportContextRibbon,
    asideHasContent,
    hideTzGlobalRoleSignoffBlock,
    showTzRightAside,
    showFooterTzSignoffShortcut,
    showRollbackButton,
    handleRollbackToDevelopment,
    tzBlockersFooter,
  };
}
