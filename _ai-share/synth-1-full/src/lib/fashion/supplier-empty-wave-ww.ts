import {
  SUPPLIER_LINESHEET_BOM_NOTIFY_BODY_RU,
  SUPPLIER_LINESHEET_BOM_NOTIFY_TITLE_RU,
} from '@/lib/production/brand-linesheet-syndication';

/** Wave WW · supplier empty SC/CO — linesheet BOM PG notify + expected PO date read-only. */

export const SUP_EMPTY_SC_LINESHEET_NOTIFY_STRIP_TESTID = 'sup-empty-sc-linesheet-notify-strip';
export const SUP_EMPTY_SC_LINESHEET_NOTIFY_PG_BADGE_TESTID = 'sup-empty-sc-linesheet-notify-pg';
export const SUP_EMPTY_SC_LINESHEET_BOM_PEER_LINK_TESTID = 'sup-empty-sc-linesheet-bom-peer-link';

export const SUP_EMPTY_CO_EXPECTED_PO_DATE_STRIP_TESTID = 'sup-empty-co-expected-po-date-strip';
export const SUP_EMPTY_CO_EXPECTED_PO_DATE_VALUE_TESTID = 'sup-empty-co-expected-po-date-value';
export const SUP_EMPTY_CO_EXPECTED_PO_HANDOFF_LINK_TESTID = 'sup-empty-co-expected-po-handoff-link';

export const SUP_EMPTY_CO_PEER_STRIP_TESTID = 'sup-empty-co-peer-strip';
export const SUP_EMPTY_CO_MFR_HANDOFF_LINK_TESTID = 'sup-empty-co-mfr-handoff-link';
export const SUP_EMPTY_CO_PROCUREMENT_LINK_TESTID = 'sup-empty-co-procurement-link';
export const SUP_EMPTY_CO_FORECAST_LINK_TESTID = 'sup-empty-co-forecast-link';
export const SUP_EMPTY_CO_TRACKING_LINK_TESTID = 'sup-empty-co-tracking-link';

export const SUPPLIER_BOM_PREVIEW_MINI_TESTID = 'supplier-bom-preview-mini';
export const SUPPLIER_COLLECTION_ORDER_FORECAST_TESTID = 'supplier-collection-order-forecast';

export function supEmptyScLinesheetNotifyTitleRu(): string {
  return SUPPLIER_LINESHEET_BOM_NOTIFY_TITLE_RU;
}

export function supEmptyScLinesheetNotifyBodyRu(): string {
  return SUPPLIER_LINESHEET_BOM_NOTIFY_BODY_RU;
}

export function supEmptyCoPeerMfrHandoffLabelRu(): string {
  return 'Передача в цех';
}

export function supEmptyCoExpectedPoDateBadgeRu(): string {
  return 'Ожидаемая дата PO';
}

export function supEmptyScLinesheetBomPeerLinkLabelRu(): string {
  return 'Превью BOM образца';
}
