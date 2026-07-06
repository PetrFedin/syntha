import type { BrandCrmSegmentObject } from '@/lib/b2b/brand-crm-segment-object';
import { sortBrandCrmSegments, summarizeBrandCrmSegmentQuery } from '@/lib/b2b/brand-crm-segment-object';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { brandCoCrmLinesheetShopShowroomHref } from '@/lib/b2b/brand-co-crm-wave-xb';
import { ROUTES } from '@/lib/routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

export type BrandCoCrmLinesheetVisibilityRow = {
  segmentKey: string;
  nameRu: string;
  defaultPriceTier: string;
  autoVisible: boolean;
  queryChips: string[];
  linesheetId: string;
  showroomHref: string;
  shopShowroomHref: string;
};

export function buildBrandCoCrmLinesheetId(segmentKey: string, collectionId: string): string {
  return `ls-${collectionId}-${segmentKey}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80);
}

export function buildBrandCoCrmLinesheetVisibilityRows(input: {
  segments: readonly BrandCrmSegmentObject[];
  collectionId: string;
}): BrandCoCrmLinesheetVisibilityRow[] {
  const collectionId = input.collectionId.trim() || 'SS27';
  const ordered = sortBrandCrmSegments(input.segments);

  return ordered.map((segment) => {
    const queryChips = summarizeBrandCrmSegmentQuery(segment.query);
    const autoVisible = Boolean(segment.defaultPriceTier?.trim());
    const showroomHref = `${brandCrmSegmentationFeatureHref('showroom', collectionId)}&focus=${encodeURIComponent(segment.segmentKey)}`;
    return {
      segmentKey: segment.segmentKey,
      nameRu: segment.nameRu,
      defaultPriceTier: segment.defaultPriceTier,
      autoVisible,
      queryChips,
      linesheetId: buildBrandCoCrmLinesheetId(segment.segmentKey, collectionId),
      showroomHref,
      shopShowroomHref: brandCoCrmLinesheetShopShowroomHref({
        collectionId,
        segmentKey: segment.segmentKey,
      }),
    };
  });
}

export function brandCoCrmLinesheetBrandPreviewHref(collectionId: string, segmentKey: string): string {
  const base = `${ROUTES.brand.b2bLinesheets}?collection=${encodeURIComponent(collectionId)}`;
  return `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=preview&segment=${encodeURIComponent(segmentKey)}`;
}

export function summarizeBrandCoCrmLinesheetVisibility(
  rows: readonly BrandCoCrmLinesheetVisibilityRow[]
): { total: number; autoVisible: number; gated: number } {
  const autoVisible = rows.filter((row) => row.autoVisible).length;
  return {
    total: rows.length,
    autoVisible,
    gated: rows.length - autoVisible,
  };
}
