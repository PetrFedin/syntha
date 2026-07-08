import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
/**
 * Wave YO — supplier comms 4.3: quote peer RFQ dedupe, chain-status materials_supplied push,
 * calendar logistics ETA strip polish (extends wave VO/XD).
 */
import { factorySupplierRfqInboxHref, ROUTES } from '@/lib/routes';
import {
  assertSupplierRfqInboxHrefSeparate,
  supplierRfqInboxHrefForDemo,
} from '@/lib/fashion/supplier-dev-wave-xd';
import {
  SUP_CM_CALENDAR_LOGISTICS_PEER_STRIP_TESTID,
  SUP_CM_LOGISTICS_ETA_STRIP_TESTID,
} from '@/lib/fashion/supplier-logistics-wave-vo';

export {
  assertSupplierRfqInboxHrefSeparate,
  SUP_CM_CALENDAR_LOGISTICS_PEER_STRIP_TESTID,
  SUP_CM_LOGISTICS_ETA_STRIP_TESTID,
};

export const WAVE_YO_SUP_CM_CHAIN_MATERIALS_PUSH_STEP = 'materials_supplied' as const;

export const WAVE_YO_SUP_CM_QUOTE_PEER_RFQ_INBOX_LINK_TESTID =
  'sup-cm-article-quote-rfq-inbox-link';
export const WAVE_YO_SUP_CM_CABINET_RFQ_INBOX_PEER_LINK_TESTID =
  'sup-cm-cabinet-rfq-inbox-peer-link';

export const WAVE_YO_SUP_CM_CHAIN_MATERIALS_PUSH_ATTR = 'data-materials-push-bump';
export const WAVE_YO_SUP_CM_CHAIN_MATERIALS_SSE_ATTR = 'data-materials-sse-live';
export const WAVE_YO_SUP_CM_LOGISTICS_ETA_COMPACT_ATTR = 'data-eta-compact';

/** Dedicated RFQ inbox href for all supplier quote peers (not messages?feature=rfq alias). */
export function supCmQuotePeerRfqInboxHref(collectionId: string, articleId: string): string {
  return factorySupplierRfqInboxHref({ collectionId, articleId });
}

export function supCmQuotePeerRfqInboxHrefIsCanonical(href: string): boolean {
  return assertSupplierRfqInboxHrefSeparate(href);
}

export function supCmChainMaterialsPushTestId(orderId: string): string {
  return `sup-cm-chain-materials-push-${orderId.trim()}`;
}

export function supCmChainMaterialsSuppliedPushBadgeTestId(orderId: string): string {
  return `${supCmChainMaterialsPushTestId(orderId)}-materials-supplied-push`;
}

export function supCmLogisticsEtaCompactTitleRu(): string {
  return 'Окно поставки · логистика';
}

export function supCmChainMaterialsPushBadgeRu(done: boolean): string {
  return done ? 'Материалы · push' : 'Материалы · ожидание';
}

export function supCmChainMaterialsPushTitleRu(done: boolean): string {
  return done ? 'materials_supplied · chain-status bump' : 'Ожидаем подтверждение материалов';
}

export function supCmChainMaterialsPushFallbackRu(): string {
  return 'Push появится после PATCH поставщика или WMS confirm';
}

/** Quote peer hrefs for demo — single canonical RFQ inbox route. */
export function supCmQuotePeerHrefsForDemo(
  collectionId: string,
  articleId: string
): {
  rfqInboxHref: string;
  isCanonical: boolean;
} {
  const rfqInboxHref = supplierRfqInboxHrefForDemo(collectionId, articleId);
  return {
    rfqInboxHref,
    isCanonical: supCmQuotePeerRfqInboxHrefIsCanonical(rfqInboxHref),
  };
}

export function supCmRfqInboxRoutePath(): string {
  return EXTENDED_ROUTES.factory.supplierRfqInbox;
}
