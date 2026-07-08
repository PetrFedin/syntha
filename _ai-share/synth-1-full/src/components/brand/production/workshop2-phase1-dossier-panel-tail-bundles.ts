import type { UseWorkshop2Phase1DossierPanelTailZoneInput } from '@/components/brand/production/use-workshop2-phase1-dossier-panel-tail-zone';
import type { Workshop2DossierViewProfile } from '@/lib/production/workshop2-dossier-view-infrastructure';
import {
  buildWorkshop2Phase1DossierSectionBodyInputBundles,
  type Workshop2Phase1DossierSectionBodyFlatScope,
} from '@/components/brand/production/use-workshop2-phase1-dossier-section-body-input-zone';
import type { BuildWorkshop2SketchPinLibraryDialogPropsInput } from '@/components/brand/production/use-workshop2-phase1-dossier-sketch-pin-library-zone';
import type { Workshop2Phase1DossierBodyShellRightAsideBundle } from '@/components/brand/production/use-workshop2-phase1-dossier-body-shell-props-zone';
import type { Workshop2DossierPanelPostMainTrailProps } from '@/components/brand/production/workshop2-phase1-dossier-panel-post-main-trail';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2Phase1DossierPanelBodyShellProps } from '@/components/brand/production/workshop2-phase1-dossier-panel-body-shell';

/** Flat scope из orchestrator → nested tail input (без nested section body в panel). */
export type Workshop2Phase1DossierPanelTailFlatContext = {
  sectionBodyFlat: Workshop2Phase1DossierSectionBodyFlatScope;
  dossierViewProfile: Workshop2DossierViewProfile;
  dossierNavPrimarySections: UseWorkshop2Phase1DossierPanelTailZoneInput['bodyShell']['shell']['dossierNavPrimarySections'];
  dossierNavSecondarySections: UseWorkshop2Phase1DossierPanelTailZoneInput['bodyShell']['shell']['dossierNavSecondarySections'];
  sectionWarningsById: UseWorkshop2Phase1DossierPanelTailZoneInput['bodyShell']['shell']['sectionWarningsById'];
  setDossierViewProfileFromCtx: (profile: Workshop2DossierViewProfile) => void;
  asideHasContent: boolean;
  showTzRightAside: boolean;
  dossierMainColumnFlash: boolean;
  stageBoardHandbookWarnings: string[];
  tzRevokeDeniedHint: string | null | undefined;
  jumpToBrandNotesAttribute: () => void;
  showCompactPassportContextRibbon: boolean;
  internalArticleCodeDisplayForRibbon: string;
  sketchPinLibrary: BuildWorkshop2SketchPinLibraryDialogPropsInput;
  rightAside: Workshop2Phase1DossierBodyShellRightAsideBundle;
  postMainTrail: Workshop2DossierPanelPostMainTrailProps;
  showRollbackButton: boolean;
  handleRollbackToDevelopment: () => void;
  dossier: Workshop2DossierPhase1;
};

export function buildWorkshop2Phase1DossierPanelTailInput(
  c: Workshop2Phase1DossierPanelTailFlatContext
): UseWorkshop2Phase1DossierPanelTailZoneInput {
  const {
    sectionBodyFlat,
    dossierViewProfile,
    dossierNavPrimarySections,
    dossierNavSecondarySections,
    sectionWarningsById,
    setDossierViewProfileFromCtx,
    asideHasContent,
    showTzRightAside,
    dossierMainColumnFlash,
    stageBoardHandbookWarnings,
    tzRevokeDeniedHint,
    jumpToBrandNotesAttribute,
    showCompactPassportContextRibbon,
    internalArticleCodeDisplayForRibbon,
    sketchPinLibrary,
    rightAside,
    postMainTrail,
    showRollbackButton,
    handleRollbackToDevelopment,
    dossier,
  } = c;

  const sectionBody = buildWorkshop2Phase1DossierSectionBodyInputBundles(sectionBodyFlat);
  const { sectionNav, dossierCore, jumpNav } = sectionBody;
  const { activeSection, handleSelectTzSection } = sectionNav;
  const {
    dossier: dossierDoc,
    tzWriteDisabled,
    skuDraft,
    nameDraft,
  } = {
    dossier: dossierCore.dossier,
    tzWriteDisabled: dossierCore.tzWriteDisabled,
    skuDraft: sectionBody.passport.skuDraft,
    nameDraft: sectionBody.passport.nameDraft,
  };

  return {
    sectionBody,
    bodyShell: {
      shell: {
        dossierViewProfile,
        dossierNavPrimarySections,
        dossierNavSecondarySections,
        activeSection,
        onSelectSection:
          handleSelectTzSection as Workshop2Phase1DossierPanelBodyShellProps['onSelectSection'],
        sectionReadinessUi: sectionNav.sectionReadinessUi,
        sectionWarningsById,
        dossier: dossierDoc,
        tzWriteDisabled,
        onSwitchDossierViewToFull: () => setDossierViewProfileFromCtx('full'),
        isPhase1: sectionNav.isPhase1,
        jumpToTzSectionAnchor: jumpNav.jumpToTzSectionAnchor,
        jumpToConstructionContour: jumpNav.jumpToConstructionContour,
        jumpToSketchLineRefs: jumpNav.jumpToSketchLineRefs,
        asideHasContent,
        showTzRightAside,
        dossierMainColumnFlash,
        stageBoardHandbookWarnings,
        tzRevokeDeniedHint,
        onJumpToVisualBrandNotes: jumpToBrandNotesAttribute,
        showCompactPassportContextRibbon,
        skuDraft,
        nameDraft,
        internalArticleCodeDisplayForRibbon,
      },
      sketchPinLibrary,
      rightAside,
    },
    postMainTrail,
    layout: {
      dossierViewProfile,
      rollback: {
        show: showRollbackButton,
        lifecycleState:
          dossier.lifecycleState === 'sent_to_production' ? 'sent_to_production' : 'handoff_ready',
        onRollback: handleRollbackToDevelopment,
      },
    },
  };
}
