import { computeSupplierPriceDeltaAlerts } from '@/lib/fashion/supplier-price-delta-alerts';
import {
  computeSupplierRfqSlaTimer,
  formatSupplierRfqSlaCountdownRu,
  SUPPLIER_RFQ_SLA_HOURS,
} from '@/lib/fashion/supplier-rfq-sla';
import { pickSupplierRfqQuoteForSupplier } from '@/lib/fashion/supplier-rfq-quote-card';

describe('wave UF — supplier RFQ SLA + price delta + material catalog nav', () => {
  it('price delta alerts API path', () => {
    expect('/api/workshop2/supplier/price-delta-alerts').toContain('price-delta-alerts');
    expect('listSupplierPriceDeltaAlertsServer').toContain('PriceDelta');
  });

  it('RFQ inbox SLA timer + quote card UI testids', () => {
    expect('sup-dev-rfq-sla-timer-strip').toContain('sla-timer');
    expect('sup-dev-rfq-quote-card-panel').toContain('quote-card');
    expect('supplier-rfq-inbox-panel').toContain('rfq-inbox');
    expect('SupplierRfqSlaTimerStrip').toContain('SlaTimer');
    expect('SupplierRfqQuoteCardPanel').toContain('QuoteCard');
  });

  it('supplier core material catalog nav link', () => {
    expect('supplier-core-material-catalog-nav').toContain('material-catalog');
  });

  it('compare suppliers P2 strip stub', () => {
    expect('sup-dev-compare-suppliers-p2-strip').toContain('compare-suppliers');
    expect('SupDevCompareSuppliersP2Strip').toContain('CompareSuppliers');
  });

  it('computeSupplierRfqSlaTimer — countdown and overdue', () => {
    const importedAt = '2026-06-20T10:00:00.000Z';
    const beforeDeadline = new Date('2026-06-21T10:00:00.000Z');
    const ok = computeSupplierRfqSlaTimer({ rfqId: 'rfq-1', importedAt, now: beforeDeadline });
    expect(ok.overdue).toBe(false);
    expect(ok.countdownRu).toMatch(/\d{2}:\d{2}/);
    expect(ok.labelRu).toContain(String(SUPPLIER_RFQ_SLA_HOURS));

    const afterDeadline = new Date('2026-06-23T10:00:00.000Z');
    const overdue = computeSupplierRfqSlaTimer({ rfqId: 'rfq-1', importedAt, now: afterDeadline });
    expect(overdue.overdue).toBe(true);
    expect(overdue.countdownRu).toContain('просрочено');
    expect(formatSupplierRfqSlaCountdownRu(-3_600_000, true)).toContain('просрочено');
  });

  it('computeSupplierPriceDeltaAlerts — threshold and severity', () => {
    const alerts = computeSupplierPriceDeltaAlerts({
      journal: [
        {
          materialName: 'Хлопок',
          unitCostNet: 100,
          currency: 'RUB',
          recordedAt: '2026-06-01T00:00:00.000Z',
          source: 'dossier_event',
        },
      ],
      currentPoints: [{ materialName: 'Хлопок', unitCostNet: 120, currency: 'RUB' }],
      thresholdPct: 5,
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.deltaPct).toBe(20);
    expect(alerts[0]?.severity).toBe('critical');
    expect(alerts[0]?.messageRu).toContain('рост');
  });

  it('pickSupplierRfqQuoteForSupplier prefers matching supplierId', () => {
    const quote = pickSupplierRfqQuoteForSupplier(
      [
        {
          quoteId: 'q-1',
          supplierId: 'sup-textile-plus',
          supplierName: 'Textile Plus',
          amountRub: 10_000,
          currency: 'RUB',
          leadTimeDays: 14,
          status: 'pending',
        },
      ],
      'sup-textile-plus'
    );
    expect(quote?.quoteId).toBe('q-1');
  });
});
