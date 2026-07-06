/**
 * Platform Core → brand SC release gate + passport block publish UI helpers.
 */
export {
  fetchBrandScReleaseGateCheck,
  type BrandScReleaseGateCheckResult,
} from '@/lib/production/brand-sc-release-gate-passport';

export {
  BRAND_DEV_PASSPORT_RELEASE_GATE_CHECKLIST_LINK_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_PEER_STRIP_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_RECHECK_BTN_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_SHOWROOM_PUBLISH_LINK_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_STATUS_BADGE_TESTID,
  brandDevPassportReleaseChecklistHref,
  brandDevPassportReleaseGateStatusLabelRu,
  brandDevPassportShowroomPublishHref,
} from '@/lib/production/wave-wq-release-gate-block-publish';
