import {
  pickAcceptedBrandCentricRfqQuote,
  sortBrandCentricRfqQuotesByAmount,
  summarizeBrandCentricRfqQuotes,
} from '@/lib/fashion/brand-centric-rfq-quotes';
import {
  awardBrandCentricRfqQuoteServer,
  clearBrandCentricRfqQuotesMemoryForTests,
  listBrandCentricRfqQuotesServer,
} from '@/lib/server/brand-centric-rfq-quotes-repository';
import { upsertCentricRfq } from '@/lib/integrations/spine/centric-rfq-persistence.file';

describe('brand-centric-rfq-quotes pure', () => {
  it('summarizes pending and accepted quotes', () => {
    const summary = summarizeBrandCentricRfqQuotes([
      {
        quoteId: 'q1',
        rfqId: 'rfq-1',
        supplierId: 's1',
        supplierName: 'A',
        amountRub: 100,
        leadTimeDays: 10,
        currency: 'RUB',
        status: 'pending',
        updatedAt: new Date().toISOString(),
      },
      {
        quoteId: 'q2',
        rfqId: 'rfq-1',
        supplierId: 's2',
        supplierName: 'B',
        amountRub: 200,
        leadTimeDays: 7,
        currency: 'RUB',
        status: 'accepted',
        updatedAt: new Date().toISOString(),
      },
    ]);
    expect(summary.total).toBe(2);
    expect(summary.pending).toBe(1);
    expect(summary.accepted).toBe(1);
    expect(
      pickAcceptedBrandCentricRfqQuote([
        {
          quoteId: 'q2',
          rfqId: 'rfq-1',
          supplierId: 's2',
          supplierName: 'B',
          amountRub: 200,
          leadTimeDays: 7,
          currency: 'RUB',
          status: 'accepted',
          updatedAt: new Date().toISOString(),
        },
      ])?.supplierId
    ).toBe('s2');
    expect(
      sortBrandCentricRfqQuotesByAmount([
        {
          quoteId: 'q2',
          rfqId: 'rfq-1',
          supplierId: 's2',
          supplierName: 'B',
          amountRub: 200,
          leadTimeDays: 7,
          currency: 'RUB',
          status: 'pending',
          updatedAt: new Date().toISOString(),
        },
        {
          quoteId: 'q1',
          rfqId: 'rfq-1',
          supplierId: 's1',
          supplierName: 'A',
          amountRub: 100,
          leadTimeDays: 10,
          currency: 'RUB',
          status: 'pending',
          updatedAt: new Date().toISOString(),
        },
      ])[0]?.amountRub
    ).toBe(100);
  });
});

describe('brand-centric-rfq-quotes-repository P3', () => {
  beforeEach(() => {
    clearBrandCentricRfqQuotesMemoryForTests();
  });

  it('seeds quote cards for imported RFQ and awards one supplier', async () => {
    const rfqId = `RFQ-P3-${Date.now()}`;
    upsertCentricRfq({
      rfqId,
      centricStyleId: 'STYLE-1',
      collectionId: 'SS27',
      articleId: 'ART-001',
      b2bOrderId: 'B2B-DEMO-SHOP1-SS27',
      status: 'open',
      lines: [{ materialName: 'Main fabric', qty: 100, unit: 'm' }],
      importedAt: new Date().toISOString(),
    });

    const listed = await listBrandCentricRfqQuotesServer({
      rfqId,
      seedIfEmpty: true,
    });
    expect(listed.rfqId).toBe(rfqId);
    expect(listed.quotes.length).toBeGreaterThanOrEqual(2);

    const cheapest = listed.quotes[0];
    const awarded = await awardBrandCentricRfqQuoteServer({
      rfqId,
      quoteId: cheapest!.quoteId,
    });
    expect(awarded.awardedQuoteId).toBe(cheapest!.quoteId);
    expect(awarded.quotes.some((q) => q.status === 'accepted')).toBe(true);
    expect(awarded.quotes.filter((q) => q.status === 'rejected').length).toBe(
      awarded.quotes.length - 1
    );
  });
});
