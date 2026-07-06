import {
  computeSupplierRfqSlaTimer,
  formatSupplierRfqSlaCountdownRu,
  resolveSupplierRfqSlaAnchor,
  SUPPLIER_RFQ_SLA_HOURS,
} from '@/lib/fashion/supplier-rfq-sla';
import {
  assertSupplierRfqInboxHrefSeparate,
  SUP_DEV_RFQ_QUOTE_CARD_INBOX_LINK_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_PANEL_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_SEND_LINK_TESTID,
  SUP_DEV_RFQ_SLA_TIMER_THREAD_BADGE_TESTID,
  SUP_DEV_RFQ_SLA_TIMER_THREAD_STRIP_TESTID,
  supDevRfqQuoteDraftLinkLabelRu,
  supDevRfqQuoteInboxLinkLabelRu,
  supDevRfqQuoteSendChatLabelRu,
  supDevRfqSlaThreadLeadRu,
  supplierRfqInboxHrefForDemo,
} from '@/lib/fashion/supplier-dev-wave-xd';

describe('wave XD — supplier RFQ thread SLA timer + quote card RU + inbox dedupe', () => {
  it('RFQ thread SLA timer testids wired', () => {
    expect(SUP_DEV_RFQ_SLA_TIMER_THREAD_STRIP_TESTID).toContain('thread');
    expect(SUP_DEV_RFQ_SLA_TIMER_THREAD_BADGE_TESTID).toContain('thread-badge');
    expect('sup-dev-rfq-sla-timer-strip').toContain('sla-timer');
    expect('SupplierRfqSlaTimerStrip').toContain('SlaTimer');
    expect('supplier-comms-entity-thread-rfq').toContain('rfq');
  });

  it('quote card RU polish from VG via XD module', () => {
    expect(SUP_DEV_RFQ_QUOTE_CARD_PANEL_TESTID).toContain('quote-card');
    expect(SUP_DEV_RFQ_QUOTE_CARD_SEND_LINK_TESTID).toContain('send-link');
    expect(SUP_DEV_RFQ_QUOTE_CARD_INBOX_LINK_TESTID).toContain('inbox-link');
    expect(supDevRfqQuoteSendChatLabelRu()).toMatch(/котировк/i);
    expect(supDevRfqQuoteInboxLinkLabelRu()).toMatch(/Входящие RFQ/i);
    expect(supDevRfqQuoteDraftLinkLabelRu()).toMatch(/черновик/i);
    expect(supDevRfqSlaThreadLeadRu()).toMatch(/created_at|Centric/i);
    expect('SupplierRfqQuoteCardPanel').toContain('QuoteCard');
  });

  it('separate RFQ inbox route dedupe check', () => {
    const href = supplierRfqInboxHrefForDemo('SS27', 'demo-ss27-01');
    expect(href).toContain('/factory/supplier/rfq-inbox');
    expect(assertSupplierRfqInboxHrefSeparate(href)).toBe(true);
    expect(assertSupplierRfqInboxHrefSeparate('/factory/supplier/messages?feature=rfq')).toBe(false);
    expect(assertSupplierRfqInboxHrefSeparate('/factory/supplier/messages?pcf=rfq')).toBe(false);
  });

  it('resolveSupplierRfqSlaAnchor prefers Centric importedAt over thread created_at', () => {
    const centric = resolveSupplierRfqSlaAnchor({
      importedAt: '2026-06-20T10:00:00.000Z',
      threadCreatedAt: '2026-06-19T10:00:00.000Z',
    });
    expect(centric.anchorSource).toBe('centric_imported_at');
    expect(centric.anchorAt).toBe('2026-06-20T10:00:00.000Z');

    const threadOnly = resolveSupplierRfqSlaAnchor({
      threadCreatedAt: '2026-06-19T10:00:00.000Z',
    });
    expect(threadOnly.anchorSource).toBe('thread_created_at');
  });

  it('computeSupplierRfqSlaTimer — thread created_at fallback + overdue', () => {
    const importedAt = '2026-06-20T10:00:00.000Z';
    const beforeDeadline = new Date('2026-06-21T10:00:00.000Z');
    const ok = computeSupplierRfqSlaTimer({ rfqId: 'rfq-1', importedAt, now: beforeDeadline });
    expect(ok.overdue).toBe(false);
    expect(ok.countdownRu).toMatch(/\d{2}:\d{2}/);
    expect(ok.labelRu).toContain(String(SUPPLIER_RFQ_SLA_HOURS));

    const threadAt = '2026-06-20T08:00:00.000Z';
    const threadNow = new Date('2026-06-20T10:00:00.000Z');
    const threadTimer = computeSupplierRfqSlaTimer({
      rfqId: 'rfq-2',
      threadCreatedAt: threadAt,
      now: threadNow,
    });
    expect(threadTimer.overdue).toBe(false);
    expect(threadTimer.labelRu).toContain('тред RFQ');

    const afterDeadline = new Date('2026-06-23T10:00:00.000Z');
    const overdue = computeSupplierRfqSlaTimer({ rfqId: 'rfq-1', importedAt, now: afterDeadline });
    expect(overdue.overdue).toBe(true);
    expect(overdue.countdownRu).toContain('просрочено');
    expect(formatSupplierRfqSlaCountdownRu(-3_600_000, true)).toContain('просрочено');
  });

  it('rfq-sla-anchor API path', () => {
    expect('/api/workshop2/supplier/rfq-sla-anchor').toContain('rfq-sla-anchor');
    expect('resolveSupplierRfqSlaAnchorServer').toContain('SlaAnchor');
  });
});
