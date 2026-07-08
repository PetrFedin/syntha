'use client';

import type { ReactNode } from 'react';
import { useWorkshop2Phase1DossierBodyShellPropsZone } from '@/components/brand/production/use-workshop2-phase1-dossier-body-shell-props-zone';
import { useWorkshop2Phase1DossierPanelMainLayoutZone } from '@/components/brand/production/use-workshop2-phase1-dossier-panel-main-layout-zone';
import { useWorkshop2Phase1DossierPostMainTrailPropsZone } from '@/components/brand/production/use-workshop2-phase1-dossier-post-main-trail-props-zone';
import {
  assembleWorkshop2Phase1DossierSectionBodyInput,
  type Workshop2Phase1DossierSectionBodyInputBundles,
} from '@/components/brand/production/use-workshop2-phase1-dossier-section-body-input-zone';
import { useWorkshop2Phase1DossierSectionBodyZone } from '@/components/brand/production/use-workshop2-phase1-dossier-section-body-zone';
import type { BuildWorkshop2SketchPinLibraryDialogPropsInput } from '@/components/brand/production/use-workshop2-phase1-dossier-sketch-pin-library-zone';
import type { Workshop2Phase1DossierBodyShellRightAsideBundle } from '@/components/brand/production/use-workshop2-phase1-dossier-body-shell-props-zone';
import type { Workshop2Phase1DossierBodyShellShellBundle } from '@/components/brand/production/use-workshop2-phase1-dossier-body-shell-props-zone';
import type { Workshop2DossierPanelPostMainTrailProps } from '@/components/brand/production/workshop2-phase1-dossier-panel-post-main-trail';
import type { Workshop2DossierViewProfile } from '@/lib/production/workshop2-dossier-view-infrastructure';

export type UseWorkshop2Phase1DossierPanelTailZoneInput = {
  sectionBody: Workshop2Phase1DossierSectionBodyInputBundles;
  bodyShell: {
    shell: Omit<Workshop2Phase1DossierBodyShellShellBundle, 'sectionBody'>;
    sketchPinLibrary: BuildWorkshop2SketchPinLibraryDialogPropsInput;
    rightAside: Workshop2Phase1DossierBodyShellRightAsideBundle;
  };
  postMainTrail: Workshop2DossierPanelPostMainTrailProps;
  layout: {
    dossierViewProfile: Workshop2DossierViewProfile;
    rollback: {
      show: boolean;
      lifecycleState: 'sent_to_production' | 'handoff_ready';
      onRollback: () => void;
    };
  };
};

/** Section body → body shell → post-main trail → panel root (orchestrator tail). */
export function useWorkshop2Phase1DossierPanelTailZone({
  sectionBody,
  bodyShell,
  postMainTrail,
  layout,
}: UseWorkshop2Phase1DossierPanelTailZoneInput): { panelRoot: ReactNode } {
  const sectionBodyInput = assembleWorkshop2Phase1DossierSectionBodyInput(sectionBody);
  const { sectionBody: sectionBodyNode } =
    useWorkshop2Phase1DossierSectionBodyZone(sectionBodyInput);

  const bodyShellProps = useWorkshop2Phase1DossierBodyShellPropsZone({
    shell: { ...bodyShell.shell, sectionBody: sectionBodyNode },
    sketchPinLibrary: bodyShell.sketchPinLibrary,
    rightAside: bodyShell.rightAside,
  });

  const postMainTrailProps = useWorkshop2Phase1DossierPostMainTrailPropsZone(postMainTrail);

  const { panelRoot } = useWorkshop2Phase1DossierPanelMainLayoutZone({
    dossierViewProfile: layout.dossierViewProfile,
    rollback: layout.rollback,
    bodyShell: bodyShellProps,
    postMainTrail: postMainTrailProps,
  });

  return { panelRoot };
}
