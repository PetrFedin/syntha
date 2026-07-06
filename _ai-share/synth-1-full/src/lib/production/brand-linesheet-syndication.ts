/** Wave TF · Brand SC linesheet syndication — client-safe paths + RU copy. */

export const BRAND_LINESHEET_SYNDICATE_API_PATH = '/api/brand/linesheets/syndicate' as const;

export const BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_API_PATH =
  '/api/brand/linesheets/batch-unpublish-rollback' as const;

export const SHOP_SHOWROOM_AUTO_INGEST_API_PATH = '/api/shop/b2b/showroom/auto-ingest' as const;

export type BrandLinesheetSyndicateSource = 'syndicate_publish' | 'release_syndication';

export type BrandLinesheetSyndicateResult = {
  syndicatedAt: string;
  collectionId: string;
  articleIds: string[];
  ingestedCount: number;
  shopBuyerId: string;
  source: BrandLinesheetSyndicateSource;
  messageRu: string;
};

export type BrandLinesheetUnpublishRollbackSnapshot = {
  snapshotId: string;
  collectionId: string;
  articleIds: string[];
  createdAt: string;
  rolledBackAt?: string;
};

export const BRAND_LINESHEET_SYNDICATE_SUCCESS_RU =
  'Syndication: лайншит опубликован — магазин получил авто-ingest и PG-уведомление.';

export const BRAND_LINESHEET_SYNDICATE_EMPTY_RU =
  'Нет артикулов для syndication — опубликуйте витрину или передайте articleIds.';

export const BRAND_LINESHEET_BATCH_UNPUBLISH_SUCCESS_RU =
  'Снято с витрины пакетом — snapshot rollback сохранён в PG.';

export const BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_SUCCESS_RU =
  'Rollback выполнен — артикулы снова на витрине магазина.';

export const SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU =
  'Каталог витрины обновлён после syndication бренда — новые строки доступны в матрице.';

export const SUPPLIER_LINESHEET_BOM_NOTIFY_TITLE_RU = 'Лайншит · новые артикулы для BOM';

export const SUPPLIER_LINESHEET_BOM_NOTIFY_BODY_RU =
  'Бренд добавил артикулы в лайншит — доступен превью состава материалов образца.';

export function brandLinesheetSyndicateApiPath(collectionId?: string): string {
  if (!collectionId?.trim()) return BRAND_LINESHEET_SYNDICATE_API_PATH;
  return `${BRAND_LINESHEET_SYNDICATE_API_PATH}?collection=${encodeURIComponent(collectionId.trim())}`;
}
