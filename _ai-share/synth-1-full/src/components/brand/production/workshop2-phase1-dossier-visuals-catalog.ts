import type { ResolvedPhase1AttributeRow } from '@/lib/production/attribute-catalog';
import type { AttributeCatalogAttribute } from '@/lib/production/attribute-catalog.types';
import type { VisualCatalogSketchLinkRow } from '@/lib/production/workshop2-sketch-tz-matrix';
import { getWorkshopTzSectionForAttribute } from '@/lib/production/workshop2-tz-section-readiness';
import { PASSPORT_COLOR_BUNDLE_IDS } from '@/components/brand/production/workshop2-phase1-dossier-panel-dossier-constants';
import { W2_VISUAL_QUAD_ATTR_IDS } from '@/components/brand/production/workshop2-phase1-dossier-panel-w2-tz-labels';
import type { Workshop2Phase1DossierPassportExtraRow } from '@/components/brand/production/workshop2-phase1-dossier-passport-partitions';

export type BuildWorkshop2Phase1DossierVisualsCatalogInput = {
  isPhase1: boolean;
  isPhase2: boolean;
  isPhase3: boolean;
  rowsToShow: readonly ResolvedPhase1AttributeRow[];
  rowsToShowPhase2: readonly ResolvedPhase1AttributeRow[];
  rowsToShowPhase3: readonly ResolvedPhase1AttributeRow[];
  extraRows: readonly Workshop2Phase1DossierPassportExtraRow[];
};

function phaseRowsForVisualsCatalog(input: BuildWorkshop2Phase1DossierVisualsCatalogInput) {
  return input.isPhase2
    ? input.rowsToShowPhase2
    : input.isPhase3
      ? input.rowsToShowPhase3
      : input.rowsToShow;
}

function isVisualsCatalogAttribute(attributeId: string, groupId?: string): boolean {
  return getWorkshopTzSectionForAttribute(attributeId, groupId) === 'visuals';
}

function isSketchLinkedCatalogAttribute(attributeId: string, groupId?: string): boolean {
  const sec = getWorkshopTzSectionForAttribute(attributeId, groupId);
  if (sec === 'visuals') return true;
  if (sec === 'general' && PASSPORT_COLOR_BUNDLE_IDS.has(attributeId)) return true;
  if (sec === 'construction' && W2_VISUAL_QUAD_ATTR_IDS.has(attributeId)) return true;
  return false;
}

export type Workshop2Phase1DossierVisualsCatalog = {
  visualsCatalogOnlyRows: ResolvedPhase1AttributeRow[];
  visualsCatalogOnlyExtras: Workshop2Phase1DossierPassportExtraRow[];
  visualsCatalogAttributeIdsForSketch: string[];
  visualsCatalogSketchLinksForPins: VisualCatalogSketchLinkRow[];
};

/** Visuals catalog rows + sketch pin links (sectionBodies / construction). */
export function buildWorkshop2Phase1DossierVisualsCatalog(
  input: BuildWorkshop2Phase1DossierVisualsCatalogInput
): Workshop2Phase1DossierVisualsCatalog {
  const phaseRows = phaseRowsForVisualsCatalog(input);
  const visualsCatalogOnlyRows = phaseRows.filter((row) =>
    isVisualsCatalogAttribute(row.attribute.attributeId, row.group?.groupId)
  );
  const visualsCatalogOnlyExtras = input.isPhase1
    ? input.extraRows.filter(({ attribute }) =>
        isVisualsCatalogAttribute(attribute.attributeId, attribute.groupId)
      )
    : [];
  const baseIds = phaseRows
    .filter((row) => isSketchLinkedCatalogAttribute(row.attribute.attributeId, row.group?.groupId))
    .map((r) => r.attribute.attributeId);
  const extraIds = input.isPhase1
    ? input.extraRows
        .filter(({ attribute }) =>
          isSketchLinkedCatalogAttribute(attribute.attributeId, attribute.groupId)
        )
        .map((e) => e.attribute.attributeId)
    : [];
  const visualsCatalogAttributeIdsForSketch = [...new Set([...baseIds, ...extraIds])];

  const raw: VisualCatalogSketchLinkRow[] = [];
  const pushRow = (
    attributeId: string,
    groupId: string | undefined,
    attr: Pick<AttributeCatalogAttribute, 'sketchHighlightForPinTypes'>
  ) => {
    if (!isSketchLinkedCatalogAttribute(attributeId, groupId)) return;
    raw.push({ attributeId, sketchHighlightForPinTypes: attr.sketchHighlightForPinTypes });
  };
  for (const row of phaseRows) {
    pushRow(row.attribute.attributeId, row.group?.groupId, row.attribute);
  }
  if (input.isPhase1) {
    for (const { attribute } of input.extraRows) {
      pushRow(attribute.attributeId, attribute.groupId, attribute);
    }
  }
  const byId = new Map<string, VisualCatalogSketchLinkRow>();
  for (const x of raw) {
    const prev = byId.get(x.attributeId);
    if (!prev) {
      byId.set(x.attributeId, x);
      continue;
    }
    const mergedPins = [
      ...new Set([
        ...(prev.sketchHighlightForPinTypes ?? []),
        ...(x.sketchHighlightForPinTypes ?? []),
      ]),
    ];
    byId.set(x.attributeId, {
      attributeId: x.attributeId,
      sketchHighlightForPinTypes: mergedPins.length ? mergedPins : undefined,
    });
  }
  return {
    visualsCatalogOnlyRows,
    visualsCatalogOnlyExtras,
    visualsCatalogAttributeIdsForSketch,
    visualsCatalogSketchLinksForPins: [...byId.values()],
  };
}
