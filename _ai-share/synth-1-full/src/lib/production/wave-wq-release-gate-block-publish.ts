/**
 * Wave WQ · release gate blocks SC publish until material passport complete (full UI wire).
 * Extends wave UV/VM patterns with dev passport peer strip + publish banners.
 */
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';
import {
  BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU,
  BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
} from '@/lib/production/brand-material-passport-release-gate';

export {
  BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU,
  BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
};

/** RU banner when passport blocks showroom/linesheet publish. */
export const BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_RU =
  'Release gate: material passport не завершён — publish в витрину заблокирован до готовности certs.';

/** RU banner on dev passport release section. */
export const BRAND_DEV_PASSPORT_RELEASE_GATE_BLOCK_BANNER_RU =
  'Release gate: material passport не завершён — заполните certs/rollup перед publish в sample-collection.';

export const BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_TESTID =
  'brand-sc-release-gate-block-publish-banner';

export const BRAND_DEV_PASSPORT_RELEASE_GATE_PEER_STRIP_TESTID =
  'brand-dev-passport-release-gate-peer-strip';

export const BRAND_DEV_PASSPORT_RELEASE_GATE_STATUS_BADGE_TESTID =
  'brand-dev-passport-release-gate-status-badge';

export const BRAND_DEV_PASSPORT_RELEASE_GATE_CHECKLIST_LINK_TESTID =
  'brand-dev-passport-release-gate-checklist-link';

export const BRAND_DEV_PASSPORT_RELEASE_GATE_SHOWROOM_PUBLISH_LINK_TESTID =
  'brand-dev-passport-release-gate-showroom-publish-link';

export const BRAND_DEV_PASSPORT_RELEASE_GATE_RECHECK_BTN_TESTID =
  'brand-dev-passport-release-gate-recheck-btn';

export const BRAND_DEV_PASSPORT_RELEASE_GATE_BLOCK_BANNER_TESTID =
  'brand-material-passport-release-gate-block-banner';

export function brandDevPassportReleaseChecklistHref(
  collectionId: string = PLATFORM_CORE_DEMO.collectionId
): string {
  return `${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=checklist&collection=${encodeURIComponent(collectionId)}`;
}

export function brandDevPassportShowroomPublishHref(
  collectionId: string = PLATFORM_CORE_DEMO.collectionId
): string {
  return `${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=showroom-publish&collection=${encodeURIComponent(collectionId)}`;
}

export function brandDevPassportReleaseGateStatusLabelRu(input: {
  blocked: boolean;
  ready: number;
  total: number;
}): string {
  if (input.blocked) {
    return `Publish заблокирован · ${input.ready}/${input.total} certs`;
  }
  return `Passport ready · ${input.ready}/${input.total}`;
}
