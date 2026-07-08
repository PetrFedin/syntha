'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Workshop2DossierCompactPassportContextRibbon } from '@/components/brand/production/workshop2-phase1-dossier-panel-compact-passport-context-ribbon';
import { Workshop2DossierFactoryPhase1StartStrip } from '@/components/brand/production/workshop2-phase1-dossier-panel-factory-phase1-start-strip';
import { Workshop2DossierSecondaryTzSectionCallout } from '@/components/brand/production/workshop2-phase1-dossier-panel-secondary-tz-section-callout';
import { Workshop2SketchPinLibraryDialog } from '@/components/brand/production/workshop2-phase1-dossier-panel-sketch-pin-library-dialog';
import { Workshop2DossierTzDenseSectionNav } from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-dense-nav';
import { Workshop2DossierTzReadonlyBanner } from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-readonly-banner';
import { Workshop2DossierTzStageStickyHeader } from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-stage-sticky-header';
import { Workshop2DossierTzRightAsidePanel } from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-right-aside';
import { Workshop2DossierViewProfileModeCallout } from '@/components/brand/production/workshop2-phase1-dossier-panel-view-profile-mode-callout';
import { Workshop2DossierViewProfileQuickAside } from '@/components/brand/production/workshop2-phase1-dossier-panel-view-quick-aside';
import type { Workshop2DossierViewProfile } from '@/lib/production/workshop2-dossier-view-infrastructure';
import type { Workshop2TzSignoffSectionKey } from '@/lib/production/workshop2-dossier-phase1.types';
import type { DossierSection } from '@/lib/production/dossier-readiness-engine';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { cn } from '@/lib/utils';
import { TZ_TAB_SECTIONS } from '@/components/brand/production/workshop2-phase1-dossier-panel-dossier-constants';

type TzDenseNavTab = (typeof TZ_TAB_SECTIONS)[number];

export type Workshop2Phase1DossierPanelBodyShellProps = {
  dossierViewProfile: Workshop2DossierViewProfile;
  dossierNavPrimarySections: readonly TzDenseNavTab[];
  dossierNavSecondarySections: readonly TzDenseNavTab[];
  activeSection: Workshop2TzSignoffSectionKey;
  onSelectSection: (id: Workshop2TzSignoffSectionKey) => void;
  sectionReadinessUi: Record<DossierSection, { pct: number }>;
  sectionWarningsById: Record<DossierSection, string[]>;
  dossier: Workshop2DossierPhase1;
  tzWriteDisabled: boolean;
  onSwitchDossierViewToFull: () => void;
  isPhase1: boolean;
  jumpToTzSectionAnchor: ComponentProps<
    typeof Workshop2DossierViewProfileQuickAside
  >['jumpToTzSectionAnchor'];
  jumpToConstructionContour: ComponentProps<
    typeof Workshop2DossierViewProfileQuickAside
  >['jumpToConstructionContour'];
  jumpToSketchLineRefs: ComponentProps<
    typeof Workshop2DossierViewProfileQuickAside
  >['jumpToSketchLineRefs'];
  asideHasContent: boolean;
  showTzRightAside: boolean;
  dossierMainColumnFlash: boolean;
  stageBoardHandbookWarnings: string[];
  tzRevokeDeniedHint: string | null | undefined;
  onJumpToVisualBrandNotes: () => void;
  showCompactPassportContextRibbon: boolean;
  skuDraft: string;
  nameDraft: string;
  internalArticleCodeDisplayForRibbon: string;
  sectionBody: ReactNode;
  sketchPinLibrary: ComponentProps<typeof Workshop2SketchPinLibraryDialog>;
  rightAside: ComponentProps<typeof Workshop2DossierTzRightAsidePanel> | null;
};

/** Навигация по секциям ТЗ, боковые aside и основная колонка с телом вкладки. */
export function Workshop2Phase1DossierPanelBodyShell({
  dossierViewProfile,
  dossierNavPrimarySections,
  dossierNavSecondarySections,
  activeSection,
  onSelectSection,
  sectionReadinessUi,
  sectionWarningsById,
  dossier,
  tzWriteDisabled,
  onSwitchDossierViewToFull,
  isPhase1,
  jumpToTzSectionAnchor,
  jumpToConstructionContour,
  jumpToSketchLineRefs,
  asideHasContent,
  showTzRightAside,
  dossierMainColumnFlash,
  stageBoardHandbookWarnings,
  tzRevokeDeniedHint,
  onJumpToVisualBrandNotes,
  showCompactPassportContextRibbon,
  skuDraft,
  nameDraft,
  internalArticleCodeDisplayForRibbon,
  sectionBody,
  sketchPinLibrary,
  rightAside,
}: Workshop2Phase1DossierPanelBodyShellProps) {
  return (
    <>
      <div className="mb-4 min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 p-3 md:p-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center md:gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 md:text-lg">
                Техническое задание
              </h2>
              <span className="hidden rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 md:inline">
                Ответственный: Конструктор / Технолог
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Спецификация образца: паспорт, визуал, материалы и конструкция.
            </p>
          </div>
        </div>
      </div>

      <Workshop2DossierTzDenseSectionNav
        dossierViewProfile={dossierViewProfile}
        dossierNavPrimarySections={dossierNavPrimarySections}
        dossierNavSecondarySections={dossierNavSecondarySections}
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        sectionReadinessUi={sectionReadinessUi}
        sectionWarningsById={sectionWarningsById}
        dossier={dossier}
      />

      {tzWriteDisabled ? <Workshop2DossierTzReadonlyBanner /> : null}

      <Workshop2DossierViewProfileModeCallout
        dossierViewProfile={dossierViewProfile}
        onSwitchToFull={onSwitchDossierViewToFull}
      />

      {isPhase1 && dossierViewProfile === 'factory' ? (
        <Workshop2DossierFactoryPhase1StartStrip jumpToTzSectionAnchor={jumpToTzSectionAnchor} />
      ) : null}

      <div
        className={cn(
          'grid gap-4',
          asideHasContent && !showTzRightAside
            ? 'xl:grid-cols-[minmax(0,160px)_minmax(0,1fr)]'
            : asideHasContent
              ? 'xl:grid-cols-[minmax(0,160px)_minmax(0,1fr)_300px]'
              : !showTzRightAside
                ? 'xl:grid-cols-[minmax(0,1fr)]'
                : 'xl:grid-cols-[minmax(0,1fr)_300px]'
        )}
      >
        {asideHasContent ? (
          <Workshop2DossierViewProfileQuickAside
            dossierViewProfile={dossierViewProfile}
            jumpToTzSectionAnchor={jumpToTzSectionAnchor}
            jumpToConstructionContour={jumpToConstructionContour}
            jumpToSketchLineRefs={jumpToSketchLineRefs}
          />
        ) : null}

        <div
          id="w2-dossier-main"
          className={cn(
            'min-w-0 space-y-2 rounded-xl transition-[box-shadow] duration-300',
            dossierMainColumnFlash && 'ring-accent-primary ring-4 ring-offset-2 ring-offset-white'
          )}
        >
          <Workshop2DossierTzStageStickyHeader
            stageBoardWarnings={stageBoardHandbookWarnings}
            tzRevokeDeniedHint={tzRevokeDeniedHint}
            onJumpToVisualBrandNotes={onJumpToVisualBrandNotes}
          />
          <Workshop2DossierSecondaryTzSectionCallout
            dossierViewProfile={dossierViewProfile}
            activeSection={activeSection}
            dossierNavPrimarySections={dossierNavPrimarySections}
            onSelectSection={onSelectSection}
          />
          <Workshop2DossierCompactPassportContextRibbon
            show={showCompactPassportContextRibbon}
            skuDraft={skuDraft}
            nameDraft={nameDraft}
            internalArticleCodeDisplay={internalArticleCodeDisplayForRibbon}
            jumpToTzSectionAnchor={jumpToTzSectionAnchor}
          />
          {sectionBody}

          <Workshop2SketchPinLibraryDialog {...sketchPinLibrary} />
        </div>

        {showTzRightAside && rightAside ? (
          <Workshop2DossierTzRightAsidePanel {...rightAside} />
        ) : null}
      </div>
    </>
  );
}
