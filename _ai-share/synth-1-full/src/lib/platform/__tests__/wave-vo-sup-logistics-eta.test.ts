import fs from 'node:fs';
import path from 'node:path';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import {
  SUP_CM_ARTICLE_QUOTE_RFQ_INBOX_LINK_TESTID,
  SUP_CM_CABINET_RFQ_INBOX_PEER_LINK_TESTID,
  SUP_CM_CALENDAR_LOGISTICS_PEER_STRIP_TESTID,
  SUP_CM_LOGISTICS_ETA_BADGE_TESTID,
  SUP_CM_LOGISTICS_ETA_MAP_STUB_TESTID,
  SUP_CM_LOGISTICS_ETA_STRIP_TESTID,
  SUP_CM_LOGISTICS_ETA_TRACKING_LINK_TESTID,
  buildSupplierLogisticsEtaMapStub,
  formatSupplierLogisticsDeliveryWindowLabel,
  supCmLogisticsDeliveryCommsRu,
  supCmLogisticsEtaBadgeRu,
  supCmLogisticsEtaHonestHintRu,
  supCmLogisticsEtaLoadingRu,
  supCmLogisticsPeerBadgeRu,
} from '@/lib/fashion/supplier-logistics-wave-vo';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { factorySupplierRfqInboxHref, shopB2bTrackingOrderHref } from '@/lib/routes';

const SRC = path.join(process.cwd(), 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave VO — supplier comms logistics ETA/map + chain-status + RFQ peer', () => {
  it('wave TJ + VO testid anchors on logistics ETA overlay', () => {
    expect(SUP_CM_LOGISTICS_ETA_STRIP_TESTID).toContain('logistics-eta');
    expect(SUP_CM_LOGISTICS_ETA_MAP_STUB_TESTID).toContain('map-stub');
    expect(SUP_CM_LOGISTICS_ETA_BADGE_TESTID).toContain('eta-badge');
    expect(SUP_CM_LOGISTICS_ETA_TRACKING_LINK_TESTID).toContain('tracking');
    expect(SUP_CM_CALENDAR_LOGISTICS_PEER_STRIP_TESTID).toContain('logistics-peer');
  });

  it('RU copy helpers without English placeholders', () => {
    expect(supCmLogisticsEtaBadgeRu('W12–14')).toBe('Приб. · W12–14');
    expect(supCmLogisticsEtaLoadingRu()).not.toMatch(/ETA/i);
    expect(supCmLogisticsEtaHonestHintRu()).toContain('трекинг');
    expect(supCmLogisticsPeerBadgeRu()).toBe('Логистика');
    expect(supCmLogisticsDeliveryCommsRu()).toBe('Чат по поставке');
  });

  it('ETA map stub deterministic + delivery window label (wave TJ extend)', () => {
    const a = buildSupplierLogisticsEtaMapStub('B2B-DEMO-1');
    const b = buildSupplierLogisticsEtaMapStub('B2B-DEMO-1');
    expect(a).toEqual(b);
    expect(formatSupplierLogisticsDeliveryWindowLabel({ label: 'W12–14' })).toBe('W12–14');
    expect(formatSupplierLogisticsDeliveryWindowLabel(null)).toBeNull();
  });

  it('calendar logistics peer session + tracking hrefs', () => {
    const session = buildSupplierOrderCommsSession({
      orderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
    });
    expect(session.calendarHref).toContain('calendar');
    expect(shopB2bTrackingOrderHref('B2B-DEMO-1')).toContain('B2B-DEMO-1');
  });

  it('CommsPillarCard uses chain-status poll (not comms inbox SSE) + compact dot badge', () => {
    const card = read('components/platform/CommsPillarCard.tsx');
    expect(card).toContain('usePlatformCoreChainStatusPoll');
    expect(card).toContain('chainSseConnected');
    expect(card).not.toContain('sseConnected={commsSseLive}');
    expect(card).toContain('variant="dot"');
    expect(card).toContain('sup-cm-cabinet-poll-badge');
  });

  it('quote peer → dedicated RFQ inbox route (wave SX verify, not messages alias)', () => {
    const rfqHref = factorySupplierRfqInboxHref({ collectionId: 'SS27', articleId: 'demo-ss27-01' });
    expect(rfqHref).toContain('/factory/supplier/rfq-inbox');
    expect(rfqHref).not.toContain('feature=rfq');
    expect(rfqHref).not.toContain('pcf=rfq');

    const session = buildSupplierProcurementSession({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.rfqHref).toContain('/factory/supplier/rfq-inbox');

    const quoteStrip = read('components/factory/supplier/SupplierArticleDevQuoteHonestStrip.tsx');
    expect(quoteStrip).toContain('factorySupplierRfqInboxHref');
    expect(quoteStrip).toContain('SUP_CM_ARTICLE_QUOTE_RFQ_INBOX_LINK_TESTID');

    const spine = read('components/factory/supplier/SupCmCabinetSpinePeerStrip.tsx');
    expect(spine).toContain('SUP_CM_CABINET_RFQ_INBOX_PEER_LINK_TESTID');
    expect(spine).toContain('procurement.rfqHref');
  });

  it('supplier comms strips RU cleanup (no English peer placeholders)', () => {
    const logistics = read('components/factory/supplier/SupplierCalendarLogisticsPeerStrip.tsx');
    expect(logistics).not.toContain('Logistics peer');
    expect(logistics).not.toContain('Delivery comms');

    const crm = read('components/factory/supplier/SupplierCommsCrmPeerStrip.tsx');
    expect(crm).not.toContain('Brand segments');
    expect(crm).not.toContain('Shop partners');

    const push = read('components/factory/supplier/SupplierCommsBrandPushStrip.tsx');
    expect(push).not.toContain('Push notify');
    expect(push).not.toContain('Push → brand chat');
  });
});
