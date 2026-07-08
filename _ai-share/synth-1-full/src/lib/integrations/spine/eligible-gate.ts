/**
 * F-ELIGIBLE: Syntha signoff OR Centric Approved OR lifecycle handoff (ADR §11.1).
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { normalizeWorkshop2LifecycleState } from '@/lib/production/workshop2-lifecycle-transition';
import { isWorkshop2TzSectionFullySigned } from '@/lib/production/workshop2-tz-signoff-complete';
import { getCentricApprovedForArticle } from './integration-external-refs-persistence.file';

export type EligibleGateSource = 'syntha_signoff' | 'centric_approved' | 'lifecycle';

export type EligibleGateResult = {
  collectionId: string;
  articleId: string;
  eligibleForCollection: boolean;
  reasons: string[];
  sources: EligibleGateSource[];
};

const ELIGIBLE_LIFECYCLE = new Set(['handoff_ready', 'sent_to_production', 'accepted']);

const SIGNOFF_SECTIONS = ['general', 'material', 'construction', 'assignment'] as const;

function synthaSignoffEligible(dossier: Workshop2DossierPhase1 | null | undefined): boolean {
  if (!dossier?.sectionSignoffs) return false;
  return SIGNOFF_SECTIONS.every((s) => isWorkshop2TzSectionFullySigned(s, dossier.sectionSignoffs));
}

function lifecycleEligible(dossier: Workshop2DossierPhase1 | null | undefined): boolean {
  if (!dossier) return false;
  const state = normalizeWorkshop2LifecycleState(dossier.lifecycleState);
  return ELIGIBLE_LIFECYCLE.has(state);
}

export function resolveEligibleForCollection(params: {
  collectionId: string;
  articleId: string;
  dossier?: Workshop2DossierPhase1 | null;
}): EligibleGateResult {
  const { collectionId, articleId, dossier } = params;
  const sources: EligibleGateSource[] = [];
  const reasons: string[] = [];

  if (getCentricApprovedForArticle(articleId)) {
    sources.push('centric_approved');
    reasons.push('Centric LifecycleState=Approved');
  }

  if (synthaSignoffEligible(dossier ?? null)) {
    sources.push('syntha_signoff');
    reasons.push('W2 section signoffs complete');
  }

  if (lifecycleEligible(dossier ?? null)) {
    sources.push('lifecycle');
    reasons.push(`lifecycle=${normalizeWorkshop2LifecycleState(dossier?.lifecycleState)}`);
  }

  if (sources.length === 0) {
    reasons.push('No signoff, Centric approval, or handoff lifecycle');
  }

  return {
    collectionId,
    articleId,
    eligibleForCollection: sources.length > 0,
    reasons,
    sources,
  };
}
