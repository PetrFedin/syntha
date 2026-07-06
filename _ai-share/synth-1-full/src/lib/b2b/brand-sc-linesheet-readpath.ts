import { BRAND_SC_LINESET_PDF_EMPTY_API_RU } from '@/lib/b2b/brand-sc-cross-matrix';
import { isPlatformCoreEmptyChainCollection } from '@/lib/platform-core-demo-context';
import {
  BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_API_PATH,
  BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_SUCCESS_RU,
  BRAND_LINESHEET_BATCH_UNPUBLISH_SUCCESS_RU,
} from '@/lib/production/brand-linesheet-syndication';
import { resolveBrandScPublishedArticlesReadPath } from '@/lib/b2b/brand-sc-cross-matrix';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { brandScSyndicationWdPdfEmptyHintRu } from '@/lib/production/brand-sc-syndication-wd';
import type { Workshop2PublishedArticlesReadPath } from '@/lib/production/workshop2-pg-source-stats';

/** Wave VC · Brand SC linesheet PDF empty + readpath badge + hero priority + batch rollback verify. */

export const BRAND_SC_LINESET_PDF_EMPTY_DISABLED_TESTID = 'brand-sc-linesheet-pdf-empty-disabled';

export const BRAND_SC_LINESET_PDF_EMPTY_HINT_TESTID = 'brand-sc-linesheet-pdf-empty-hint';

export const BRAND_SC_LINESET_PDF_EMPTY_API_TESTID = 'brand-sc-linesheet-pdf-empty-api';

export const BRAND_SC_PUBLISHED_READPATH_BADGE_PREFIX = 'brand-sc-published-readpath';

export const BRAND_SC_PUBLISHED_READPATH_API_TESTID = `${BRAND_SC_PUBLISHED_READPATH_BADGE_PREFIX}-api`;

export const SHOP_SHOWROOM_COVER_HERO_PRIORITY_STRIP_TESTID =
  'shop-sc-showroom-cover-hero-priority-strip';

export const SHOP_SHOWROOM_COVER_HERO_PRIORITY_RU =
  'Hero: dossier PG → обложка партнёра → лого → заглушка';

export const SHOP_SHOWROOM_COVER_HERO_DOSSIER_WINS_RU =
  'Dossier PG имеет приоритет над partner stub — см. badge на cover hero.';

export function brandScPublishedReadpathBadgeTestId(
  readPath: Workshop2PublishedArticlesReadPath
): string {
  return readPath === 'api'
    ? BRAND_SC_PUBLISHED_READPATH_API_TESTID
    : `${BRAND_SC_PUBLISHED_READPATH_BADGE_PREFIX}-localStorage`;
}

export function brandScLinesheetPdfEmptyUiHintRu(collectionId: string): string {
  return brandScSyndicationWdPdfEmptyHintRu(collectionId);
}

export function brandScLinesheetPdfEmptyApiMessageRu(collectionId: string): string {
  if (isPlatformCoreEmptyChainCollection(collectionId)) {
    return BRAND_SC_LINESET_PDF_EMPTY_API_RU;
  }
  return 'Нет опубликованных артикулов — опубликуйте витрину в W2.';
}

export function isBrandScPublishedReadpathApiOnly(collectionId: string): boolean {
  if (!isPlatformCoreMode()) return false;
  return resolveBrandScPublishedArticlesReadPath(collectionId) === 'api';
}

export type BrandScBatchUnpublishRollbackVerify = {
  unpublishOk: boolean;
  rollbackOk: boolean;
  hasSnapshot: boolean;
  restoredCount: number;
};

export function verifyBrandScBatchUnpublishRollbackRoundtrip(
  unpublishJson: unknown,
  rollbackJson: unknown
): BrandScBatchUnpublishRollbackVerify {
  const unpublish = unpublishJson as {
    ok?: boolean;
    snapshot?: { snapshotId?: string };
    unpublishedCount?: number;
  };
  const rollback = rollbackJson as { ok?: boolean; restoredCount?: number; snapshotId?: string };

  return {
    unpublishOk: unpublish.ok === true,
    rollbackOk: rollback.ok === true,
    hasSnapshot: Boolean(unpublish.snapshot?.snapshotId?.trim()),
    restoredCount: rollback.restoredCount ?? 0,
  };
}

export function brandScBatchUnpublishRollbackApiPath(): string {
  return BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_API_PATH;
}

export function brandScBatchUnpublishSuccessCopyIncludes(messageRu: string): boolean {
  return (
    messageRu.includes(BRAND_LINESHEET_BATCH_UNPUBLISH_SUCCESS_RU.slice(0, 12)) ||
    messageRu.includes('snapshot') ||
    messageRu.includes('Snapshot')
  );
}

export function brandScBatchRollbackSuccessCopyIncludes(messageRu: string): boolean {
  return (
    messageRu.includes(BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_SUCCESS_RU.slice(0, 8)) ||
    messageRu.includes('Rollback') ||
    messageRu.includes('откат')
  );
}
