/** Wave TN · Brand SC publish audit — client-safe paths + RU copy. */

export const BRAND_SC_PUBLISH_AUDIT_LOG_API_PATH = '/api/workshop2/collections' as const;

export type BrandScPublishAuditSource =
  | 'showroom_publish'
  | 'bulk_showroom_publish'
  | 'showroom_publish_gate'
  | 'auto_publish'
  | 'linesheet_syndicate'
  | 'release_syndication'
  | 'batch_unpublish'
  | 'batch_unpublish_rollback';

export type BrandScPublishAuditEventType =
  | 'showroom.published'
  | 'linesheet.syndicated'
  | 'showroom.batch_unpublished'
  | 'showroom.batch_rollback';

export type BrandScPublishAuditEntry = {
  id: string;
  collectionId: string;
  articleId: string;
  eventType: BrandScPublishAuditEventType | string;
  source: BrandScPublishAuditSource | string;
  campaignName?: string;
  payload: Record<string, unknown>;
  organizationId?: string;
  createdAt: string;
};

export const BRAND_SC_PUBLISH_AUDIT_EMPTY_RU =
  'Публикаций пока нет — используйте batch publish или W2 gate.';

export const BRAND_SC_PUBLISH_AUDIT_PG_READY_RU =
  'Журнал публикаций в PostgreSQL — cabinet и release publish panel.';

export const BRAND_SC_PUBLISH_AUDIT_SYNDICATION_WD_RU =
  'Wave WD: syndication / unpublish / rollback пишутся в PG audit (не только panel log).';

export function brandScPublishAuditLogApiPath(collectionId: string, limit = 12): string {
  const cid = collectionId.trim();
  return `${BRAND_SC_PUBLISH_AUDIT_LOG_API_PATH}/${encodeURIComponent(cid)}/publish-audit-log?limit=${limit}`;
}
