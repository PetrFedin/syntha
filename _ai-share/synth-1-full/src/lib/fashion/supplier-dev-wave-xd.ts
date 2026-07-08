import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
/**
 * Wave XD — supplier RFQ thread SLA timer + quote card RU polish (VG) + RFQ inbox route dedupe.
 */
import { ROUTES, factorySupplierRfqInboxHref } from '@/lib/routes';
import {
  formatSupDevRfqQuoteAmountLineRu,
  SUP_DEV_RFQ_QUOTE_CARD_COMPARE_LINK_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_PANEL_TESTID,
  supDevCompareSuppliersHrefsForDemo,
  supDevRfqQuoteCardCompareLinkLabelRu,
  supDevRfqQuoteCardEmptyRu,
  supDevRfqQuoteCardLoadingRu,
  supDevRfqQuoteCardMissingRu,
  supDevRfqQuoteCardTitleRu,
} from '@/lib/fashion/supplier-dev-wave-vg';

export {
  formatSupDevRfqQuoteAmountLineRu,
  SUP_DEV_RFQ_QUOTE_CARD_COMPARE_LINK_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_PANEL_TESTID,
  supDevCompareSuppliersHrefsForDemo,
  supDevRfqQuoteCardCompareLinkLabelRu,
  supDevRfqQuoteCardEmptyRu,
  supDevRfqQuoteCardLoadingRu,
  supDevRfqQuoteCardMissingRu,
  supDevRfqQuoteCardTitleRu,
};

export const SUP_DEV_RFQ_SLA_TIMER_THREAD_STRIP_TESTID = 'sup-dev-rfq-sla-timer-thread-strip';
export const SUP_DEV_RFQ_SLA_TIMER_THREAD_BADGE_TESTID = 'sup-dev-rfq-sla-timer-thread-badge';
export const SUP_DEV_RFQ_QUOTE_CARD_SEND_LINK_TESTID = 'sup-dev-rfq-quote-card-send-link';
export const SUP_DEV_RFQ_QUOTE_CARD_INBOX_LINK_TESTID = 'sup-dev-rfq-quote-card-inbox-link';
export const SUP_DEV_RFQ_QUOTE_CARD_DRAFT_LINK_TESTID = 'sup-dev-rfq-quote-card-draft-link';

export function supDevRfqQuoteSendChatLabelRu(): string {
  return 'Отправить котировку в чат';
}

export function supDevRfqQuoteInboxLinkLabelRu(): string {
  return 'Входящие RFQ →';
}

export function supDevRfqQuoteDraftLinkLabelRu(): string {
  return 'Черновик котировки в чат →';
}

export function supDevRfqSlaThreadLeadRu(): string {
  return 'SLA ответа на RFQ — от импорта Centric или created_at треда.';
}

/** RFQ inbox — отдельный маршрут, не alias messages?feature=rfq. */
export function assertSupplierRfqInboxHrefSeparate(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed.includes(EXTENDED_ROUTES.factory.supplierRfqInbox)) return false;
  if (trimmed.includes('feature=rfq')) return false;
  if (trimmed.includes('pcf=rfq')) return false;
  if (trimmed.includes('/factory/supplier/messages')) return false;
  return true;
}

export function supplierRfqInboxHrefForDemo(collectionId: string, articleId: string): string {
  return factorySupplierRfqInboxHref({ collectionId, articleId });
}
