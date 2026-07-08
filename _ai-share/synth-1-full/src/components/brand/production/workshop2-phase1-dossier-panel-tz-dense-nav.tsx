'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  isWorkshop2TzSectionTabDoneForUi,
  Workshop2TzSectionTabIndicator,
} from '@/components/brand/production/Workshop2TzSectionTabIndicator';
import {
  SECTION_TAB_ROLE_HINT,
  TZ_TAB_SECTIONS,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-dossier-constants';
import type {
  Workshop2DossierPhase1,
  Workshop2TzSignoffSectionKey,
} from '@/lib/production/workshop2-dossier-phase1.types';
import {
  isWorkshop2DossierViewPrimarySection,
  type Workshop2DossierViewProfile,
} from '@/lib/production/workshop2-dossier-view-infrastructure';
import { W2_PASSPORT_SUBPAGE_ANCHORS } from '@/lib/production/workshop2-passport-check';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';

type TzDenseNavTab = (typeof TZ_TAB_SECTIONS)[number];

export function Workshop2DossierTzDenseSectionNav({
  dossierViewProfile,
  dossierNavPrimarySections,
  dossierNavSecondarySections,
  activeSection,
  onSelectSection,
  sectionReadinessUi,
  sectionWarningsById,
  dossier,
}: {
  dossierViewProfile: Workshop2DossierViewProfile;
  dossierNavPrimarySections: readonly TzDenseNavTab[];
  dossierNavSecondarySections: readonly TzDenseNavTab[];
  activeSection: Workshop2TzSignoffSectionKey;
  onSelectSection: (id: Workshop2TzSignoffSectionKey) => void;
  /** Только основные вкладки имеют расчёт %; enterprise-вкладки (T&A, эко, B2B) — без движка готовности → 0%. */
  sectionReadinessUi: Partial<Record<Workshop2TzSignoffSectionKey, { pct: number }>>;
  sectionWarningsById: Partial<Record<Workshop2TzSignoffSectionKey, string[]>>;
  dossier: Workshop2DossierPhase1;
}) {
  return (
    <div
      id={W2_PASSPORT_SUBPAGE_ANCHORS.denseView}
      className="scroll-mt-24"
      data-testid="brand-dev-dossier-section-nav"
    >
      <div className="flex min-w-0 flex-nowrap items-stretch gap-2">
        <div className="border-border-subtle bg-bg-surface2 flex min-h-9 w-full min-w-0 flex-1 gap-0.5 rounded-xl border p-1 max-md:flex-nowrap max-md:overflow-x-auto max-md:overscroll-x-contain max-md:[scrollbar-width:none] md:flex-wrap max-md:[&::-webkit-scrollbar]:hidden">
          {dossierNavPrimarySections.map((s) => {
            const isActive = activeSection === s.id;
            const primaryForView =
              dossierViewProfile === 'full' ||
              isWorkshop2DossierViewPrimarySection(dossierViewProfile, s.id);
            const pct = sectionReadinessUi[s.id]?.pct ?? 0;
            const signed =
              isWorkshop2TzSectionTabDoneForUi(s.id, dossier.sectionSignoffs, pct, dossier) &&
              (sectionWarningsById[s.id]?.length ?? 0) === 0 &&
              pct >= 100;
            return (
              <button
                key={s.id}
                type="button"
                title={[
                  !primaryForView
                    ? 'Вторично для выбранного режима ТЗ — откройте при необходимости'
                    : null,
                  SECTION_TAB_ROLE_HINT[s.id],
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={
                  signed ? `${s.label}: секция подписана` : `${s.label}: заполнено ${pct}%`
                }
                onClick={() => onSelectSection(s.id)}
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'h-8 min-h-8 min-w-[calc(33.33%-4px)] flex-1 basis-[calc(33.33%-4px)] justify-center gap-1 border px-1.5 text-center text-[10px] font-semibold !normal-case leading-tight transition-colors max-md:min-h-11 max-md:flex-none max-md:shrink-0 max-md:px-3 md:min-w-0 md:basis-0',
                  isActive &&
                    'border-accent-primary/45 bg-accent-primary/5 text-accent-primary shadow-none',
                  !isActive &&
                    'border-border-subtle/90 text-text-secondary hover:border-border-default hover:text-text-primary',
                  !primaryForView &&
                    !isActive &&
                    'ring-dashed ring-border-default/80 opacity-70 ring-1'
                )}
              >
                <span className="flex min-w-0 items-center justify-center gap-1">
                  <Workshop2TzSectionTabIndicator section={s.id} pct={pct} fullySigned={signed} />
                  <span className="min-w-0 truncate">{s.label}</span>
                </span>
              </button>
            );
          })}
        </div>
        {dossierNavSecondarySections.length > 0 ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'h-8 min-h-8 shrink-0 gap-1 px-2 text-[10px] font-semibold !normal-case max-md:min-h-11'
                )}
              >
                Ещё ({dossierNavSecondarySections.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-2">
              <p className="text-text-secondary mb-1.5 text-[10px] font-semibold">
                Доп. разделы ТЗ
              </p>
              <div className="flex flex-col gap-1">
                {dossierNavSecondarySections.map((s) => {
                  const isActive = activeSection === s.id;
                  const pct = sectionReadinessUi[s.id]?.pct ?? 0;
                  const signed =
                    isWorkshop2TzSectionTabDoneForUi(s.id, dossier.sectionSignoffs, pct, dossier) &&
                    (sectionWarningsById[s.id]?.length ?? 0) === 0 &&
                    pct >= 100;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={
                        signed ? `${s.label}: секция подписана` : `${s.label}: заполнено ${pct}%`
                      }
                      onClick={() => onSelectSection(s.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[11px] font-semibold transition-colors',
                        isActive
                          ? 'border-accent-primary/45 bg-accent-primary/5 text-accent-primary'
                          : 'border-border-subtle bg-bg-surface2 text-text-primary hover:border-border-default'
                      )}
                    >
                      <Workshop2TzSectionTabIndicator
                        section={s.id}
                        pct={pct}
                        fullySigned={signed}
                        tone={isActive ? 'inverted' : 'default'}
                      />
                      <span className="min-w-0 flex-1">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </div>
  );
}
