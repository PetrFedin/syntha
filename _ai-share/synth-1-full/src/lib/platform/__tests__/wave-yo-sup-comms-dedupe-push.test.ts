import fs from 'node:fs';
import path from 'node:path';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import {
  WAVE_YO_SUP_CM_CABINET_RFQ_INBOX_PEER_LINK_TESTID,
  WAVE_YO_SUP_CM_CHAIN_MATERIALS_PUSH_ATTR,
  WAVE_YO_SUP_CM_CHAIN_MATERIALS_PUSH_STEP,
  WAVE_YO_SUP_CM_CHAIN_MATERIALS_SSE_ATTR,
  WAVE_YO_SUP_CM_LOGISTICS_ETA_COMPACT_ATTR,
  WAVE_YO_SUP_CM_QUOTE_PEER_RFQ_INBOX_LINK_TESTID,
  supCmChainMaterialsPushTestId,
  supCmChainMaterialsSuppliedPushBadgeTestId,
  supCmLogisticsEtaCompactTitleRu,
  supCmQuotePeerHrefsForDemo,
  supCmQuotePeerRfqInboxHref,
  supCmQuotePeerRfqInboxHrefIsCanonical,
  supCmRfqInboxRoutePath,
} from '@/lib/fashion/supplier-comms-wave-yo';
import {
  resolveDevMaterialPassportHref,
  resolveDevRfqSupplierHref,
} from '@/lib/platform/pillar-capability-role-resolve';
import { factorySupplierRfqInboxHref } from '@/lib/routes';

const SRC = path.join(process.cwd(), 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YO — supplier comms dedupe + chain-status materials push', () => {
  it('quote peer hrefs → dedicated RFQ inbox (not messages alias)', () => {
    const href = supCmQuotePeerRfqInboxHref('SS27', 'demo-ss27-01');
    expect(href).toContain('/factory/supplier/rfq-inbox');
    expect(href).not.toContain('feature=rfq');
    expect(href).not.toContain('pcf=rfq');
    expect(href).not.toContain('/factory/supplier/messages');
    expect(supCmQuotePeerRfqInboxHrefIsCanonical(href)).toBe(true);

    const demo = supCmQuotePeerHrefsForDemo('SS27', 'demo-ss27-01');
    expect(demo.isCanonical).toBe(true);
    expect(demo.rfqInboxHref).toBe(
      factorySupplierRfqInboxHref({ collectionId: 'SS27', articleId: 'demo-ss27-01' })
    );
    expect(supCmRfqInboxRoutePath()).toBe('/factory/supplier/rfq-inbox');
  });

  it('pillar resolve dev-rfq + material-passport supplier → rfq-inbox route', () => {
    const ctx = {
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      role: 'supplier' as const,
    };
    expect(resolveDevRfqSupplierHref(ctx)).toContain('/factory/supplier/rfq-inbox');
    expect(resolveDevRfqSupplierHref(ctx)).not.toContain('pcf=rfq');
    expect(resolveDevMaterialPassportHref(ctx)).toContain('/factory/supplier/rfq-inbox');
  });

  it('procurement session rfqHref stays canonical', () => {
    const session = buildSupplierProcurementSession({
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
    });
    expect(session.rfqHref).toContain('/factory/supplier/rfq-inbox');
    expect(supCmQuotePeerRfqInboxHrefIsCanonical(session.rfqHref)).toBe(true);
  });

  it('materials_supplied push strip testids + SSE/push attrs', () => {
    const orderId = PLATFORM_CORE_DEMO.demoOrderId;
    expect(supCmChainMaterialsPushTestId(orderId)).toBe(`sup-cm-chain-materials-push-${orderId}`);
    expect(supCmChainMaterialsSuppliedPushBadgeTestId(orderId)).toContain(
      'materials-supplied-push'
    );
    expect(WAVE_YO_SUP_CM_CHAIN_MATERIALS_PUSH_STEP).toBe('materials_supplied');
    expect(WAVE_YO_SUP_CM_CHAIN_MATERIALS_SSE_ATTR).toBe('data-materials-sse-live');
    expect(WAVE_YO_SUP_CM_CHAIN_MATERIALS_PUSH_ATTR).toBe('data-materials-push-bump');
  });

  it('calendar logistics ETA compact polish (wave VO extend)', () => {
    expect(WAVE_YO_SUP_CM_LOGISTICS_ETA_COMPACT_ATTR).toBe('data-eta-compact');
    expect(supCmLogisticsEtaCompactTitleRu()).toContain('логистика');
    const etaStrip = read('components/factory/supplier/SupCmLogisticsEtaMapOverlayStrip.tsx');
    expect(etaStrip).toContain('WAVE_YO_SUP_CM_LOGISTICS_ETA_COMPACT_ATTR');
    expect(etaStrip).toContain('supCmLogisticsEtaCompactTitleRu');
  });

  it('quote peer UI + comms cabinet wired to RFQ inbox testids', () => {
    expect(WAVE_YO_SUP_CM_QUOTE_PEER_RFQ_INBOX_LINK_TESTID).toBe(
      'sup-cm-article-quote-rfq-inbox-link'
    );
    expect(WAVE_YO_SUP_CM_CABINET_RFQ_INBOX_PEER_LINK_TESTID).toBe(
      'sup-cm-cabinet-rfq-inbox-peer-link'
    );

    const quoteStrip = read('components/factory/supplier/SupplierArticleDevQuoteHonestStrip.tsx');
    expect(quoteStrip).toContain('factorySupplierRfqInboxHref');
    expect(quoteStrip).toContain('SUP_CM_ARTICLE_QUOTE_RFQ_INBOX_LINK_TESTID');

    const spine = read('components/factory/supplier/SupCmCabinetSpinePeerStrip.tsx');
    expect(spine).toContain('SUP_CM_CABINET_RFQ_INBOX_PEER_LINK_TESTID');
    expect(spine).toContain('procurement.rfqHref');

    const commsCard = read('components/platform/CommsPillarCard.tsx');
    expect(commsCard).toContain('SupplierCommsChainMaterialsPushStrip');
    expect(commsCard).toContain('materials_supplied');
    expect(commsCard).toContain('chainPollTick');
  });

  it('SupplierCommsChainMaterialsPushStrip fetches supplier notification events', () => {
    const pushStrip = read('components/factory/supplier/SupplierCommsChainMaterialsPushStrip.tsx');
    expect(pushStrip).toContain('role=supplier');
    expect(pushStrip).toContain('materials_supplied');
    expect(pushStrip).toContain('factorySupplierCalendarB2bOrderContextHref');
  });
});
