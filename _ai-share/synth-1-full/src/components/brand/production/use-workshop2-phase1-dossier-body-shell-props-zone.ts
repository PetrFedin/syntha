'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Workshop2DossierTzRightAsidePanel } from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-right-aside';
import type { Workshop2Phase1DossierPanelBodyShellProps } from '@/components/brand/production/workshop2-phase1-dossier-panel-body-shell';
import {
  buildWorkshop2SketchPinLibraryDialogProps,
  type BuildWorkshop2SketchPinLibraryDialogPropsInput,
} from '@/components/brand/production/use-workshop2-phase1-dossier-sketch-pin-library-zone';

type RightAsidePanelProps = ComponentProps<typeof Workshop2DossierTzRightAsidePanel>;

export type Workshop2Phase1DossierBodyShellShellBundle = Omit<
  Workshop2Phase1DossierPanelBodyShellProps,
  | 'sketchPinLibrary'
  | 'rightAside'
  | 'sectionBody'
  | 'onSelectSection'
  | 'onSwitchDossierViewToFull'
> & {
  sectionBody: ReactNode;
  onSelectSection: Workshop2Phase1DossierPanelBodyShellProps['onSelectSection'];
  onSwitchDossierViewToFull: Workshop2Phase1DossierPanelBodyShellProps['onSwitchDossierViewToFull'];
};

export type Workshop2Phase1DossierBodyShellRightAsideBundle = {
  showTzRightAside: boolean;
  panel: RightAsidePanelProps;
};

export type UseWorkshop2Phase1DossierBodyShellPropsZoneInput = {
  shell: Workshop2Phase1DossierBodyShellShellBundle;
  sketchPinLibrary: BuildWorkshop2SketchPinLibraryDialogPropsInput;
  rightAside: Workshop2Phase1DossierBodyShellRightAsideBundle;
};

/** Props для body shell: nav + sketch pin dialog + right aside. */
export function useWorkshop2Phase1DossierBodyShellPropsZone({
  shell,
  sketchPinLibrary,
  rightAside,
}: UseWorkshop2Phase1DossierBodyShellPropsZoneInput): Workshop2Phase1DossierPanelBodyShellProps {
  return {
    ...shell,
    sketchPinLibrary: buildWorkshop2SketchPinLibraryDialogProps(sketchPinLibrary),
    rightAside: rightAside.showTzRightAside ? rightAside.panel : null,
  };
}
