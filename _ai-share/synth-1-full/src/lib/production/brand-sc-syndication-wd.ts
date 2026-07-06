/** Wave WD · Brand SC syndication + batch unpublish rollback + publish audit PG bridge. */

import { BRAND_LINESHEET_SYNDICATE_API_PATH } from '@/lib/production/brand-linesheet-syndication';
import { brandScPublishAuditLogApiPath } from '@/lib/production/brand-sc-publish-audit';

export const BRAND_SC_SYNDICATION_WD_RELEASE_PUSH_API_PATH =
  '/api/brand/merch/release-syndication/push' as const;

export type BrandScSyndicationWdAuditEventType =
  | 'showroom.published'
  | 'linesheet.syndicated'
  | 'showroom.batch_unpublished'
  | 'showroom.batch_rollback';

export type BrandScSyndicationWdAuditSource =
  | 'linesheet_syndicate'
  | 'release_syndication'
  | 'batch_unpublish'
  | 'batch_unpublish_rollback';

export const BRAND_SC_SYNDICATION_WD_AUDIT_SYNDICATED_RU =
  'Syndication: лайншит → авто-ingest магазина (PG audit).';

export const BRAND_SC_SYNDICATION_WD_AUDIT_UNPUBLISH_RU =
  'Batch unpublish: snapshot rollback сохранён в PG.';

export const BRAND_SC_SYNDICATION_WD_AUDIT_ROLLBACK_RU =
  'Batch rollback: артикулы восстановлены на витрине.';

export const BRAND_SC_SYNDICATION_WD_PDF_FW27_HINT_RU =
  'PDF FW27: опубликуйте артикулы на витрине — файл появится после publish.';

export const BRAND_SC_SYNDICATION_WD_PANEL_TESTID = 'brand-sc-linesheets-syndicate-wd-panel';

export const BRAND_SC_SYNDICATION_WD_AUDIT_BADGE_TESTID = 'brand-sc-syndication-wd-audit-pg';

export function brandScSyndicationWdSyndicateApiPath(collectionId?: string): string {
  if (!collectionId?.trim()) return BRAND_LINESHEET_SYNDICATE_API_PATH;
  return `${BRAND_LINESHEET_SYNDICATE_API_PATH}?collection=${encodeURIComponent(collectionId.trim())}`;
}

export function brandScSyndicationWdReleasePushApiPath(): string {
  return BRAND_SC_SYNDICATION_WD_RELEASE_PUSH_API_PATH;
}

export function brandScSyndicationWdPublishAuditApiPath(collectionId: string): string {
  return brandScPublishAuditLogApiPath(collectionId, 16);
}

export function brandScSyndicationWdAuditEventLabelRu(
  eventType: BrandScSyndicationWdAuditEventType | string
): string {
  switch (eventType) {
    case 'linesheet.syndicated':
      return 'syndication';
    case 'showroom.batch_unpublished':
      return 'unpublish';
    case 'showroom.batch_rollback':
      return 'rollback';
    default:
      return 'publish';
  }
}

export function brandScSyndicationWdPdfEmptyHintRu(collectionId: string): string {
  const id = collectionId.trim().toUpperCase();
  if (id === 'FW27') return BRAND_SC_SYNDICATION_WD_PDF_FW27_HINT_RU;
  if (id === 'EMPTY27' || id.startsWith('EMPTY')) {
    return 'PDF недоступен: пустая коллекция без publish. Для сценария — SS27.';
  }
  return 'PDF появится после публикации артикулов на витрине.';
}
