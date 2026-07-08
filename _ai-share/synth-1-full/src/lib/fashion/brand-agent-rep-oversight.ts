import type { CommissionRecord } from '@/lib/distributor/sub-agent-commission';
import type { BrandCrmSegmentObject } from '@/lib/b2b/brand-crm-segment-object';
import { summarizeBrandCrmSegmentQuery } from '@/lib/b2b/brand-crm-segment-object';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';

export function summarizeBrandAgentRepLedger(records: readonly CommissionRecord[]): {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  commissionRub: number;
} {
  const pending = records.filter((r) => r.status === 'pending').length;
  const approved = records.filter((r) => r.status === 'approved').length;
  const paid = records.filter((r) => r.status === 'paid').length;
  const commissionRub = records.reduce((sum, r) => sum + r.commissionRub, 0);
  return { total: records.length, pending, approved, paid, commissionRub };
}

export function brandAgentRepShopPortalHref(): string {
  return `${ROUTES.shop.b2bSalesRepPortal}?${PILLAR_CAPABILITY_FEATURE_PARAM}=portal`;
}

/** Brand oversight · read-only mirror of shop rep portal (wave UC). */
export function brandAgentRepShopPortalReadOnlyHref(): string {
  return `${brandAgentRepShopPortalHref()}&readOnly=1`;
}

export function brandAgentRepShopCommissionHref(): string {
  return `${ROUTES.shop.b2bSalesRepPortal}?${PILLAR_CAPABILITY_FEATURE_PARAM}=commission`;
}

export function brandAgentRepLedgerHref(): string {
  return `${ROUTES.brand.distributor.commissions}?${PILLAR_CAPABILITY_FEATURE_PARAM}=ledger`;
}

/** Shop rep → brand commission dispute peer (wave VI / WS cross-link). */
export function brandAgentRepCommissionDisputeHref(input?: {
  collectionId?: string;
  orderId?: string;
}): string {
  const params = new URLSearchParams({ [PILLAR_CAPABILITY_FEATURE_PARAM]: 'ledger' });
  if (input?.collectionId?.trim()) {
    params.set('collection', input.collectionId.trim());
  }
  if (input?.orderId?.trim()) {
    params.set('order', input.orderId.trim());
  }
  params.set('disputePeer', 'shop-rep');
  return `${ROUTES.brand.distributor.commissions}?${params.toString()}`;
}

export function listBrandAgentRepNames(records: readonly CommissionRecord[]): string[] {
  return [...new Set(records.map((r) => r.subAgentName))];
}

export type BrandAgentRepTerritoryHint = {
  repName: string;
  segmentKey: string;
  segmentNameRu: string;
  regionLabel: string;
  crmSegmentHref: string;
};

/** Map active reps to CRM segment regions (territory overlay for RepSpark roster). */
export function buildBrandAgentRepTerritoryHints(
  repNames: readonly string[],
  segments: readonly BrandCrmSegmentObject[],
  collectionId?: string
): BrandAgentRepTerritoryHint[] {
  if (!repNames.length || !segments.length) return [];
  const ordered = [...segments].sort(
    (a, b) =>
      (a.displayOrder ?? 999) - (b.displayOrder ?? 999) || a.segmentKey.localeCompare(b.segmentKey)
  );
  const segmentsHref = brandCrmSegmentationFeatureHref('segments', collectionId);

  return repNames.map((repName, index) => {
    const segment = ordered[index % ordered.length]!;
    const regions = segment.query.regions?.length ? segment.query.regions.join(', ') : null;
    const tierChip = segment.query.tiers?.length ? `tier ${segment.query.tiers.join('/')}` : null;
    const queryChips = summarizeBrandCrmSegmentQuery(segment.query);
    const regionLabel = regions ?? tierChip ?? queryChips[0] ?? segment.segmentKey;
    return {
      repName,
      segmentKey: segment.segmentKey,
      segmentNameRu: segment.nameRu,
      regionLabel,
      crmSegmentHref: `${segmentsHref}&focus=${encodeURIComponent(segment.segmentKey)}`,
    };
  });
}

export function brandAgentRepCrmSegmentsHref(collectionId?: string): string {
  return brandCrmSegmentationFeatureHref('segments', collectionId);
}
