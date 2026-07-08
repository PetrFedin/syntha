import { buildWorkshop2SchetOffertaPayload } from '@/lib/production/workshop2-schet-offerta';
import { renderWorkshop2SchetOffertaHtml } from '@/lib/production/workshop2-schet-offerta-html';
import { getB2BOrdersBaseForOperationalApi } from '@/lib/order/b2b-orders-list-read-model.server';
import {
  mapWorkshop2B2bOrderToOperationalRow,
  mergeOperationalB2bOrderLists,
} from '@/lib/order/workshop2-b2b-order-operational-mapper';
import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { resolveContextualMessageSenderFromHeaders } from '@/lib/server/workshop2-contextual-message-sender';

jest.mock('@/lib/server/platform-core-spine-pg.server', () => ({
  isPlatformCoreSpinePgPrimary: jest.fn(() => false),
}));

import { isPlatformCoreSpinePgPrimary } from '@/lib/server/platform-core-spine-pg.server';

describe('workshop2-schet-offerta-html', () => {
  it('renders printable HTML with order id and total', () => {
    const payload = buildWorkshop2SchetOffertaPayload({
      orderId: 'W2-B2B-001',
      lines: [{ name: 'Платье', qty: 2, priceRub: 10_000 }],
    });
    const html = renderWorkshop2SchetOffertaHtml(payload);
    expect(html).toContain('W2-B2B-001');
    expect(html).toContain('Платье');
    expect(html).toContain('window.print');
  });
});

describe('b2b operational snapshot skip when pg-primary', () => {
  it('returns empty base when platform core spine pg primary', () => {
    jest.mocked(isPlatformCoreSpinePgPrimary).mockReturnValue(true);
    expect(getB2BOrdersBaseForOperationalApi()).toEqual([]);
    jest.mocked(isPlatformCoreSpinePgPrimary).mockReturnValue(false);
  });
});
describe('workshop2-b2b-order-operational-mapper', () => {
  const sample: Workshop2B2bOrderRecord = {
    id: 'W2-B2B-SS27-001',
    collectionId: 'SS27',
    articleId: 'art-1',
    buyerId: 'buyer-tsum',
    status: 'confirmed',
    tier: 'standard',
    totalRub: 125_000,
    lines: [
      {
        articleId: 'art-1',
        collectionId: 'SS27',
        colorCode: 'BLK',
        size: 'M',
        qty: 10,
        wholesalePriceRub: 12_500,
      },
    ],
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-02T10:00:00.000Z',
  };

  it('maps PG native order to operational B2BOrder row', () => {
    const row = mapWorkshop2B2bOrderToOperationalRow(sample);
    expect(row.order).toBe('W2-B2B-SS27-001');
    expect(row.shop).toBe('buyer-tsum');
    expect(row.status).toMatch(/Подтверждён/i);
    expect(row.amount).toMatch(/125/);
  });

  it('PG rows override snapshot duplicates', () => {
    const merged = mergeOperationalB2bOrderLists(
      [
        {
          order: 'W2-B2B-SS27-001',
          status: 'legacy',
          shop: 'x',
          brand: 'y',
          amount: '0',
          date: '2020-01-01',
          deliveryDate: '2020-02-01',
        },
      ],
      [sample]
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.shop).toBe('buyer-tsum');
  });
});

describe('workshop2-contextual-message-sender', () => {
  it('prefers actor label headers over default', () => {
    const headers = new Headers();
    headers.set('x-w2-actor-label', 'Petr Technologist');
    expect(resolveContextualMessageSenderFromHeaders(headers)).toBe('Petr Technologist');
  });

  it('does not use Current User fallback', () => {
    expect(resolveContextualMessageSenderFromHeaders(new Headers())).toBe('Участник');
  });
});
