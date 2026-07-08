'use client';

import { useCallback, useState, type Dispatch, SetStateAction } from 'react';
import * as LucideIcons from 'lucide-react';
import { Workshop2DossierPersistButton } from '@/components/brand/production/Workshop2DossierPersistButton';
import { useToast } from '@/hooks/use-toast';
import { persistWorkshop2VisualReferencesMirrorToDossier } from '@/lib/production/workshop2-visual-references-dossier-persist';
import { putWorkshop2Wave31DossierPatch } from '@/lib/production/workshop2-wave31-persist-client';
import { Workshop2SurfaceStatusBanner } from '@/components/brand/production/Workshop2SurfaceStatusBanner';
import { summarizeWorkshop2VisualReferencesStatus } from '@/lib/production/workshop2-visual-references-status';
import { Workshop2DesignerManifestoBlock } from '@/components/brand/production/Workshop2DesignerManifestoBlock';
import { VisualReferencesBlock } from '@/components/brand/production/workshop2-phase1-dossier-panel-visual-references-block';
import { WorkshopPassportColorBundle } from '@/components/brand/production/workshop2-phase1-dossier-panel-passport-color-bundle';
import { PASSPORT_COLOR_BUNDLE_ORDER } from '@/components/brand/production/workshop2-phase1-dossier-panel-dossier-constants';
import type { ResolvedPhase1AttributeRow } from '@/lib/production/attribute-catalog';
import type { HandbookCategoryLeaf } from '@/lib/production/category-handbook-leaves';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2AttrComment } from '@/components/brand/production/workshop2-phase1-dossier-panel-attr-comments-dialog';
import { W2_BRIEF_DEFER_BRAND_NOTES } from '@/components/brand/production/workshop2-phase1-dossier-panel-dossier-constants';
import { Workshop2Phase1DeferLaterToggle } from '@/components/brand/production/workshop2-phase1-defer-later-toggle';
import { isWorkshop2DeferLaterChecked } from '@/lib/production/workshop2-phase1-field-deferral';
import type { DossierSection } from '@/lib/production/dossier-readiness-engine';
import { showWorkshop2PersistToast } from '@/lib/production/workshop2-persist-toast-messages';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export type Workshop2DossierGeneralDesignVisualBlockProps = {
  isPhase1: boolean;
  dossier: Workshop2DossierPhase1;
  setDossier: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  saveDraft: () => void;
  updatedByLabel: string;
  sectionRowsCurrent: ResolvedPhase1AttributeRow[];
  currentLeaf: HandbookCategoryLeaf;
  currentPhase: '1' | '2' | '3';
  allowMultiHandbook: boolean;
  patchColor: (u: {
    handbook?: { parameterId: string; displayLabel: string } | null;
    freeText?: string;
  }) => void;
  onSetHandbookParametersWithColorBundleSync: (
    id: string,
    parts: { parameterId: string; displayLabel: string }[]
  ) => void;
  onSetHandbookParameters: (
    id: string,
    parts: { parameterId: string; displayLabel: string }[]
  ) => void;
  onFreeTextSide: (attributeId: string, text: string) => void;
  tzMinimalModeBySection: Record<DossierSection, boolean>;
  deferredAttrIds: Set<string>;
  toggleDeferAttribute: (attributeId: string) => void;
  attrCommentsById: Record<string, Workshop2AttrComment[] | undefined>;
  openAttrComments: (blockId: string) => void;
  collectionId?: string;
  articleId?: string;
};

export function Workshop2DossierGeneralDesignVisualBlock({
  isPhase1,
  dossier,
  setDossier,
  saveDraft,
  updatedByLabel,
  sectionRowsCurrent,
  currentLeaf,
  currentPhase,
  allowMultiHandbook,
  patchColor,
  onSetHandbookParametersWithColorBundleSync,
  onSetHandbookParameters,
  onFreeTextSide,
  tzMinimalModeBySection,
  deferredAttrIds,
  toggleDeferAttribute,
  attrCommentsById,
  openAttrComments,
  collectionId,
  articleId,
}: Workshop2DossierGeneralDesignVisualBlockProps) {
  const { toast } = useToast();
  const [refsPersistBusy, setRefsPersistBusy] = useState(false);
  const visualRefsStatus = summarizeWorkshop2VisualReferencesStatus(dossier);

  const persistVisualRefsToPg = useCallback(async () => {
    if (!collectionId || !articleId) return;
    setRefsPersistBusy(true);
    try {
      const res = await putWorkshop2Wave31DossierPatch({
        collectionId,
        articleId,
        base: dossier,
        apply: (d) => persistWorkshop2VisualReferencesMirrorToDossier(d),
        field: 'visual_references_mirror',
        updatedByLabel: updatedByLabel,
        meta: { refCount: dossier.visualReferences?.length ?? 0 },
      });
      if (res.ok) setDossier(res.dossier);
      showWorkshop2PersistToast(toast, {
        scopeLabelRu: 'Референсы',
        ok: res.ok,
        mirrorField: 'visualReferencesMirror',
        reason: res.reason,
      });
    } finally {
      setRefsPersistBusy(false);
    }
  }, [articleId, collectionId, dossier, setDossier, toast, updatedByLabel]);

  const showDeferUi = isPhase1 && !tzMinimalModeBySection.general;
  const brandNotesLater = isWorkshop2DeferLaterChecked(W2_BRIEF_DEFER_BRAND_NOTES, dossier, {
    tzPhase: '1',
  });

  return (
    <>
      {isPhase1 ? (
        <>
          <div
            id="w2-passport-design-intent"
            className="border-border-default scroll-mt-24 rounded-xl border bg-white p-4 shadow-sm"
          >
            {showDeferUi ? (
              <div className="mb-2 flex justify-end">
                <Workshop2Phase1DeferLaterToggle
                  fieldKey={W2_BRIEF_DEFER_BRAND_NOTES}
                  checked={brandNotesLater}
                  onToggle={() => toggleDeferAttribute(W2_BRIEF_DEFER_BRAND_NOTES)}
                  onOpenComments={openAttrComments}
                  commentCount={attrCommentsById[W2_BRIEF_DEFER_BRAND_NOTES]?.length ?? 0}
                />
              </div>
            ) : null}
            <Workshop2DesignerManifestoBlock
              brandNotes={dossier.brandNotes}
              onBrandNotesChange={(value) =>
                setDossier((prev: Workshop2DossierPhase1) => ({ ...prev, brandNotes: value }))
              }
              onSaveDraft={saveDraft}
            />
          </div>
          <div
            id="w2-visuals-refs"
            className="border-border-default scroll-mt-24 space-y-2 rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Workshop2DossierPersistButton
                busy={refsPersistBusy}
                disabled={!collectionId || !articleId}
                className="h-8 text-[11px]"
                onClick={() => void persistVisualRefsToPg()}
                title="visualReferencesMirror → PG"
              />
              {dossier.visualReferencesMirror &&
              workshop2PgMirrorStr(dossier.visualReferencesMirror, 'mirroredAt') ? (
                <span className="text-text-muted font-mono text-[10px]">
                  PG{' '}
                  {new Date(
                    workshop2PgMirrorStr(dossier.visualReferencesMirror, 'mirroredAt')
                  ).toLocaleString('ru-RU', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              ) : null}
            </div>
            <Workshop2SurfaceStatusBanner
              hintRu={visualRefsStatus.hintRu}
              tone={visualRefsStatus.state === 'ready' ? 'emerald' : 'amber'}
            />
            <VisualReferencesBlock
              items={dossier.visualReferences ?? []}
              onChange={(next) =>
                setDossier((p: Workshop2DossierPhase1) => ({ ...p, visualReferences: next }))
              }
              currentUserLabel={updatedByLabel}
              threadAuthorLabel={
                (dossier.passportProductionBrief?.articleCardOwnerName ?? '').trim() ||
                updatedByLabel
              }
              canonicalMainPhotoRefId={dossier.canonicalMainPhotoRefId}
              onSetCanonicalMainPhoto={(refId) =>
                setDossier((p: Workshop2DossierPhase1) => ({
                  ...p,
                  canonicalMainPhotoRefId: refId ?? undefined,
                }))
              }
            />
          </div>
          {(() => {
            const colorCells: ResolvedPhase1AttributeRow[] = [];
            for (const id of PASSPORT_COLOR_BUNDLE_ORDER) {
              const row = sectionRowsCurrent.find((r) => r.attribute.attributeId === id);
              if (row) colorCells.push(row);
            }
            if (colorCells.length === 0) return null;
            return (
              <div
                id="w2-visuals-attributes"
                className="border-border-default scroll-mt-24 rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-3 pb-3">
                  <div className="bg-accent-primary/10 text-accent-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <LucideIcons.Palette className="h-4 w-4 shrink-0" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="text-text-primary text-base font-semibold">Цвет и палитра</h2>
                    <p className="text-text-secondary text-[11px] leading-snug">
                      Основной цвет, референс системы, палитра, градиент и свои оттенки.
                    </p>
                  </div>
                </div>
                <ul className="list-none space-y-0 p-0">
                  <WorkshopPassportColorBundle
                    bundleRows={colorCells}
                    dossier={dossier}
                    currentLeaf={currentLeaf}
                    phase={currentPhase}
                    allowMultiHandbook={allowMultiHandbook}
                    patchColor={patchColor}
                    showAttributeHintIcons
                    fieldDeferralPhase1={isPhase1 && !tzMinimalModeBySection.general}
                    deferredAttrIds={deferredAttrIds}
                    onToggleFieldDeferral={toggleDeferAttribute}
                    attrCommentsById={attrCommentsById}
                    onOpenAttrComments={openAttrComments}
                    onSetHandbookParameters={(id, parts) =>
                      id === 'primaryColorFamilyOptions' ||
                      id === 'colorReferenceSystemOptions' ||
                      id === 'color'
                        ? onSetHandbookParametersWithColorBundleSync(id, parts)
                        : onSetHandbookParameters(id, parts)
                    }
                    onFreeTextSide={onFreeTextSide}
                  />
                </ul>
              </div>
            );
          })()}
        </>
      ) : null}
    </>
  );
}
