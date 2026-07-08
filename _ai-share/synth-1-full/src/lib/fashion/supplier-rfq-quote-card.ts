import type { BrandCentricRfqQuoteCard } from '@/lib/fashion/brand-centric-rfq-quotes';

export const SUPPLIER_RFQ_DEMO_SUPPLIER_ID = 'sup-textile-plus';

export function formatSupplierRfqQuoteStatusRu(status: BrandCentricRfqQuoteCard['status']): string {
  switch (status) {
    case 'accepted':
      return 'Принята брендом';
    case 'rejected':
      return 'Отклонена';
    default:
      return 'Ожидает ответа бренда';
  }
}

export function pickSupplierRfqQuoteForSupplier(
  quotes: readonly BrandCentricRfqQuoteCard[],
  supplierId?: string
): BrandCentricRfqQuoteCard | null {
  const sid = supplierId?.trim() || SUPPLIER_RFQ_DEMO_SUPPLIER_ID;
  const direct = quotes.find((q) => q.supplierId === sid);
  if (direct) return direct;
  return quotes.find((q) => q.status === 'pending') ?? quotes[0] ?? null;
}
