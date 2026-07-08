import type { Product } from '@/lib/types';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  brandDevelopmentSamplePeerHref,
  brandDevelopmentSamplePeerLabelShort,
} from '@/lib/platform-core-brand-sample-peer';

export type BrandSampleLifecycleRoundId = 'proto' | 'sms' | 'gold' | 'approved';

export type BrandSampleLifecycleRoundStatus = 'pending' | 'in_progress' | 'approved';

export type BrandSampleLifecycleRow = {
  articleId: string;
  sku: string;
  slug: string;
  name: string;
  round: BrandSampleLifecycleRoundId;
  status: BrandSampleLifecycleRoundStatus;
  nextActionRu: string;
  peerHref: string;
  peerLabel: string;
};

const ROUND_ORDER: BrandSampleLifecycleRoundId[] = ['proto', 'sms', 'gold', 'approved'];

function roundFromSku(sku: string): BrandSampleLifecycleRoundId {
  const n = sku.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return ROUND_ORDER[n % ROUND_ORDER.length] ?? 'proto';
}

function statusFromRound(round: BrandSampleLifecycleRoundId): BrandSampleLifecycleRoundStatus {
  if (round === 'approved') return 'approved';
  if (round === 'gold') return 'in_progress';
  return round === 'sms' ? 'in_progress' : 'pending';
}

function nextActionRu(
  round: BrandSampleLifecycleRoundId,
  status: BrandSampleLifecycleRoundStatus
): string {
  if (status === 'approved') return 'Release gate → syndication.';
  if (round === 'gold') return 'Gold sample approval + handoff.';
  if (round === 'sms') return 'Fit comments → gold sample.';
  return 'W2 sample-order · round 1.';
}

export function buildBrandSampleLifecycleRows(
  products: Product[],
  collectionId = PLATFORM_CORE_DEMO.collectionId
): BrandSampleLifecycleRow[] {
  return products.slice(0, 16).map((product, index) => {
    const articleId = product.slug || product.id || `art-${index}`;
    const round = roundFromSku(product.sku);
    const status = statusFromRound(round);
    const sampleStatus = status === 'approved' ? 'dispatched' : 'draft';
    return {
      articleId,
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      round,
      status,
      nextActionRu: nextActionRu(round, status),
      peerHref: brandDevelopmentSamplePeerHref(collectionId, articleId, { sampleStatus }),
      peerLabel: brandDevelopmentSamplePeerLabelShort({ sampleStatus }),
    };
  });
}

export function summarizeBrandSampleLifecycle(rows: BrandSampleLifecycleRow[]): {
  total: number;
  approved: number;
  inProgress: number;
  pending: number;
} {
  return {
    total: rows.length,
    approved: rows.filter((r) => r.status === 'approved').length,
    inProgress: rows.filter((r) => r.status === 'in_progress').length,
    pending: rows.filter((r) => r.status === 'pending').length,
  };
}

export function brandSampleLifecycleRoundLabel(round: BrandSampleLifecycleRoundId): string {
  switch (round) {
    case 'proto':
      return 'Proto · R1';
    case 'sms':
      return 'SMS · R2';
    case 'gold':
      return 'Gold';
    case 'approved':
      return 'Approved';
    default:
      return round;
  }
}
