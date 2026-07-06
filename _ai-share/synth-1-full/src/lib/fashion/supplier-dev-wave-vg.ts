/**
 * Wave VG — supplier development polish: compare P2 strip, quote card RU, catalog nav peers.
 */
import {
  factoryMaterialsCatalogHrefForDemo,
  factoryMaterialsHrefForDemo,
  type PlatformCoreDemoContext,
} from '@/lib/platform-core-hub-matrix';
import { factorySupplierRfqInboxHref } from '@/lib/routes';

export const SUP_DEV_COMPARE_SUPPLIERS_P2_STRIP_TESTID = 'sup-dev-compare-suppliers-p2-strip';
export const SUP_DEV_COMPARE_SUPPLIERS_P2_CATALOG_LINK_TESTID =
  'sup-dev-compare-suppliers-p2-catalog-link';
export const SUP_DEV_COMPARE_SUPPLIERS_P2_MATERIALS_LINK_TESTID =
  'sup-dev-compare-suppliers-p2-materials-link';
export const SUP_DEV_COMPARE_SUPPLIERS_P2_RFQ_LINK_TESTID = 'sup-dev-compare-suppliers-p2-rfq-link';

export const SUP_DEV_RFQ_QUOTE_CARD_PANEL_TESTID = 'sup-dev-rfq-quote-card-panel';
export const SUP_DEV_RFQ_QUOTE_CARD_COMPARE_LINK_TESTID = 'sup-dev-rfq-quote-card-compare-link';

export const SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID = 'supplier-core-material-catalog-nav';
export const SUPPLIER_CORE_MATERIAL_CATALOG_MATERIALS_PEER_TESTID =
  'supplier-core-material-catalog-materials-peer';
export const SUPPLIER_CORE_MATERIAL_CATALOG_RFQ_PEER_TESTID =
  'supplier-core-material-catalog-rfq-peer';

export function supDevCompareSuppliersP2LeadRu(): string {
  return 'Сравнение поставщиков по материалам — в P2 (Centric RFQ matrix). Сейчас только peer-ссылки.';
}

export function supDevCompareSuppliersP2BadgeRu(): string {
  return 'P2 stub';
}

export function supDevRfqQuoteCardTitleRu(): string {
  return 'Котировка RFQ';
}

export function supDevRfqQuoteCardLoadingRu(): string {
  return 'Загрузка котировки…';
}

export function supDevRfqQuoteCardEmptyRu(collectionId: string, articleId: string): string {
  return `Нет активного RFQ для ${collectionId}:${articleId} — дождитесь запроса от бренда.`;
}

export function supDevRfqQuoteCardMissingRu(rfqId: string): string {
  return `RFQ ${rfqId} — котировка поставщика ещё не сохранена.`;
}

export function formatSupDevRfqQuoteAmountLineRu(
  amountRub: number,
  currency: string,
  leadTimeDays: number
): string {
  const amount = `${amountRub.toLocaleString('ru-RU')} ${currency}`;
  return `Сумма: ${amount} · срок ${leadTimeDays} дн.`;
}

export function supDevRfqQuoteCardCompareLinkLabelRu(): string {
  return 'Сравнение поставщиков →';
}

export function supDevMaterialCatalogMaterialsPeerLabelRu(): string {
  return 'Материалы · разработка';
}

export function supDevMaterialCatalogRfqPeerLabelRu(): string {
  return 'Входящие RFQ';
}

export function supDevCompareSuppliersHrefsForDemo(demo: PlatformCoreDemoContext): {
  catalogHref: string;
  materialsHref: string;
  rfqHref: string;
} {
  return {
    catalogHref: factoryMaterialsCatalogHrefForDemo(demo),
    materialsHref: factoryMaterialsHrefForDemo(demo),
    rfqHref: factorySupplierRfqInboxHref({
      collectionId: demo.collectionId,
      articleId: demo.demoArticleId,
    }),
  };
}
