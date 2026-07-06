import {
  SUP_EMPTY_CO_EXPECTED_PO_DATE_STRIP_TESTID,
  SUP_EMPTY_CO_EXPECTED_PO_DATE_VALUE_TESTID,
  SUP_EMPTY_CO_EXPECTED_PO_HANDOFF_LINK_TESTID,
  SUP_EMPTY_CO_PEER_STRIP_TESTID,
  SUP_EMPTY_CO_MFR_HANDOFF_LINK_TESTID,
  SUP_EMPTY_CO_PROCUREMENT_LINK_TESTID,
  SUP_EMPTY_CO_FORECAST_LINK_TESTID,
  SUP_EMPTY_CO_TRACKING_LINK_TESTID,
  SUP_EMPTY_SC_LINESHEET_BOM_PEER_LINK_TESTID,
  SUP_EMPTY_SC_LINESHEET_NOTIFY_PG_BADGE_TESTID,
  SUP_EMPTY_SC_LINESHEET_NOTIFY_STRIP_TESTID,
  SUPPLIER_BOM_PREVIEW_MINI_TESTID,
  SUPPLIER_COLLECTION_ORDER_FORECAST_TESTID,
  supEmptyCoExpectedPoDateBadgeRu,
  supEmptyCoPeerMfrHandoffLabelRu,
  supEmptyScLinesheetBomPeerLinkLabelRu,
  supEmptyScLinesheetNotifyBodyRu,
  supEmptyScLinesheetNotifyTitleRu,
} from '@/lib/fashion/supplier-empty-wave-ww';
import {
  SUPPLIER_LINESHEET_BOM_NOTIFY_TITLE_RU,
  BRAND_LINESHEET_SYNDICATE_API_PATH,
} from '@/lib/production/brand-linesheet-syndication';

describe('wave WW — supplier empty SC/CO notify + expected PO date', () => {
  it('supplier empty SC: linesheet BOM PG notify strip testids', () => {
    expect(SUP_EMPTY_SC_LINESHEET_NOTIFY_STRIP_TESTID).toContain('linesheet-notify');
    expect(SUP_EMPTY_SC_LINESHEET_NOTIFY_PG_BADGE_TESTID).toContain('notify-pg');
    expect(SUP_EMPTY_SC_LINESHEET_BOM_PEER_LINK_TESTID).toContain('bom-peer');
    expect(SUPPLIER_BOM_PREVIEW_MINI_TESTID).toContain('bom-preview-mini');
    expect(supEmptyScLinesheetBomPeerLinkLabelRu()).toMatch(/BOM/i);
  });

  it('linesheet syndicate triggers supplier BOM notify (PG notification_events)', () => {
    expect('notifySupplierLinesheetBomPreview').toContain('Linesheet');
    expect(SUPPLIER_LINESHEET_BOM_NOTIFY_TITLE_RU).toBe(supEmptyScLinesheetNotifyTitleRu());
    expect(supEmptyScLinesheetNotifyBodyRu()).toMatch(/лайншит/i);
    expect(BRAND_LINESHEET_SYNDICATE_API_PATH).toContain('linesheets/syndicate');
    expect('appendPlatformCoreNotificationEvent').toContain('Notification');
    expect('SupEmptyScLinesheetNotifyStrip').toContain('NotifyStrip');
  });

  it('supplier empty CO: expected PO date read-only from handoff queue PG', () => {
    expect(SUP_EMPTY_CO_EXPECTED_PO_DATE_STRIP_TESTID).toContain('expected-po-date');
    expect(SUP_EMPTY_CO_EXPECTED_PO_DATE_VALUE_TESTID).toContain('value');
    expect(SUP_EMPTY_CO_EXPECTED_PO_HANDOFF_LINK_TESTID).toContain('handoff-link');
    expect(supEmptyCoExpectedPoDateBadgeRu()).toMatch(/PO/i);
    expect('expectedHandoffAt').toContain('Handoff');
    expect('SupEmptyCoExpectedPoDateStrip').toContain('ExpectedPoDate');
  });

  it('supplier empty CO: RU peer strip without B2B checkout UI', () => {
    expect(SUP_EMPTY_CO_PEER_STRIP_TESTID).toContain('co-peer');
    expect(SUP_EMPTY_CO_MFR_HANDOFF_LINK_TESTID).toContain('mfr-handoff');
    expect(SUP_EMPTY_CO_PROCUREMENT_LINK_TESTID).toContain('procurement');
    expect(SUP_EMPTY_CO_FORECAST_LINK_TESTID).toContain('forecast');
    expect(SUP_EMPTY_CO_TRACKING_LINK_TESTID).toContain('tracking');
    expect(supEmptyCoPeerMfrHandoffLabelRu()).toMatch(/цех/i);
    expect('shop-co-checkout-payment-intent-strip').toContain('checkout');
    expect('SupEmptyCoPeerStrip').toContain('PeerStrip');
    expect(SUPPLIER_COLLECTION_ORDER_FORECAST_TESTID).toContain('forecast');
  });
});
