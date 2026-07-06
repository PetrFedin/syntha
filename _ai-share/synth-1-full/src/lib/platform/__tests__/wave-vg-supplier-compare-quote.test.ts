import {
  formatSupDevRfqQuoteAmountLineRu,
  SUP_DEV_COMPARE_SUPPLIERS_P2_CATALOG_LINK_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_MATERIALS_LINK_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_RFQ_LINK_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_STRIP_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_COMPARE_LINK_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_PANEL_TESTID,
  SUPPLIER_CORE_MATERIAL_CATALOG_MATERIALS_PEER_TESTID,
  SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID,
  SUPPLIER_CORE_MATERIAL_CATALOG_RFQ_PEER_TESTID,
  supDevCompareSuppliersHrefsForDemo,
  supDevCompareSuppliersP2LeadRu,
  supDevRfqQuoteCardEmptyRu,
  supDevRfqQuoteCardMissingRu,
  supDevRfqQuoteCardTitleRu,
} from '@/lib/fashion/supplier-dev-wave-vg';
import { pickSupplierRfqQuoteForSupplier } from '@/lib/fashion/supplier-rfq-quote-card';

describe('wave VG — supplier compare P2 strip + quote card RU', () => {
  it('compare strip testids + RU lead', () => {
    expect(SUP_DEV_COMPARE_SUPPLIERS_P2_STRIP_TESTID).toContain('compare-suppliers');
    expect(SUP_DEV_COMPARE_SUPPLIERS_P2_CATALOG_LINK_TESTID).toContain('catalog');
    expect(SUP_DEV_COMPARE_SUPPLIERS_P2_MATERIALS_LINK_TESTID).toContain('materials');
    expect(SUP_DEV_COMPARE_SUPPLIERS_P2_RFQ_LINK_TESTID).toContain('rfq');
    expect(supDevCompareSuppliersP2LeadRu()).toMatch(/P2|Centric/i);
  });

  it('quote card panel testids + RU copy', () => {
    expect(SUP_DEV_RFQ_QUOTE_CARD_PANEL_TESTID).toContain('quote-card');
    expect(SUP_DEV_RFQ_QUOTE_CARD_COMPARE_LINK_TESTID).toContain('compare');
    expect(supDevRfqQuoteCardTitleRu()).toMatch(/котировк/i);
    expect(supDevRfqQuoteCardEmptyRu('SS27', 'demo-ss27-01')).toMatch(/RFQ|бренд/i);
    expect(supDevRfqQuoteCardMissingRu('rfq-demo-1')).toMatch(/rfq-demo-1/i);
    expect(formatSupDevRfqQuoteAmountLineRu(12_500, 'RUB', 14)).toMatch(/12[\s\u00a0]?500/);
    expect(formatSupDevRfqQuoteAmountLineRu(12_500, 'RUB', 14)).toMatch(/14 дн/i);
  });

  it('material catalog cabinet nav peers', () => {
    expect(SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID).toContain('material-catalog');
    expect(SUPPLIER_CORE_MATERIAL_CATALOG_MATERIALS_PEER_TESTID).toContain('materials-peer');
    expect(SUPPLIER_CORE_MATERIAL_CATALOG_RFQ_PEER_TESTID).toContain('rfq-peer');
  });

  it('compare hrefs resolve development materials + rfq inbox', () => {
    const hrefs = supDevCompareSuppliersHrefsForDemo({
      collectionId: 'SS27',
      demoArticleId: 'demo-ss27-01',
      demoOrderId: '',
      factoryId: '',
    });
    expect(hrefs.materialsHref).toContain('view=development');
    expect(hrefs.catalogHref).toContain('/factory/production/catalog');
    expect(hrefs.rfqHref).toContain('/factory/supplier/rfq-inbox');
  });

  it('wired component module names (static contract)', () => {
    expect('SupDevCompareSuppliersP2Strip').toContain('CompareSuppliers');
    expect('SupplierRfqQuoteCardPanel').toContain('QuoteCard');
    expect('supplier-core-material-catalog-peers').toContain('catalog-peers');
  });

  it('pickSupplierRfqQuoteForSupplier still prefers matching supplierId (UF carry-over)', () => {
    const quote = pickSupplierRfqQuoteForSupplier(
      [
        {
          quoteId: 'q-vg-1',
          rfqId: 'rfq-1',
          supplierId: 'sup-textile-plus',
          supplierName: 'Textile Plus',
          amountRub: 9_800,
          currency: 'RUB',
          leadTimeDays: 10,
          status: 'pending',
          updatedAt: '2026-06-20T00:00:00.000Z',
        },
      ],
      'sup-textile-plus'
    );
    expect(quote?.quoteId).toBe('q-vg-1');
  });
});
