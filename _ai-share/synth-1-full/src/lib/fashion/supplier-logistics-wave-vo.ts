/**
 * Wave VO — supplier comms logistics ETA/map overlay (RU copy + testid anchors).
 */
import {
  buildSupplierLogisticsEtaMapStub,
  formatSupplierLogisticsDeliveryWindowLabel,
} from '@/lib/fashion/supplier-logistics-eta-stub';

export const SUP_CM_LOGISTICS_ETA_STRIP_TESTID = 'sup-cm-logistics-eta-strip';
export const SUP_CM_LOGISTICS_ETA_BADGE_TESTID = 'sup-cm-logistics-eta-badge';
export const SUP_CM_LOGISTICS_ETA_MAP_STUB_TESTID = 'sup-cm-logistics-eta-map-stub';
export const SUP_CM_LOGISTICS_ETA_MAP_ROUTE_TESTID = 'sup-cm-logistics-eta-map-route';
export const SUP_CM_LOGISTICS_ETA_TRACKING_LINK_TESTID = 'sup-cm-logistics-eta-tracking-link';
export const SUP_CM_LOGISTICS_ETA_HONEST_HINT_TESTID = 'sup-cm-logistics-eta-honest-hint';
export const SUP_CM_CALENDAR_LOGISTICS_PEER_STRIP_TESTID = 'sup-cm-calendar-logistics-peer-strip';

export const SUP_CM_ARTICLE_QUOTE_RFQ_INBOX_LINK_TESTID = 'sup-cm-article-quote-rfq-inbox-link';
export const SUP_CM_CABINET_RFQ_INBOX_PEER_LINK_TESTID = 'sup-cm-cabinet-rfq-inbox-peer-link';

export function supCmLogisticsEtaBadgeRu(label: string): string {
  return `Приб. · ${label}`;
}

export function supCmLogisticsEtaLoadingRu(): string {
  return 'Прибытие…';
}

export function supCmLogisticsEtaHonestHintRu(): string {
  return 'Окно поставки — после handoff, см. трекинг';
}

export function supCmLogisticsPeerBadgeRu(): string {
  return 'Логистика';
}

export function supCmLogisticsDeliveryCommsRu(): string {
  return 'Чат по поставке';
}

export { buildSupplierLogisticsEtaMapStub, formatSupplierLogisticsDeliveryWindowLabel };
