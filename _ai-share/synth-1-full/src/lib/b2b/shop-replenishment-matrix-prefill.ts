import { shopB2bMatrixReorderHref } from '@/lib/routes';

export type ShopReplenishmentAtpLine = {
  sku: string;
  atpQty: number;
  suggestedQty: number;
};

/** Deep-link to matrix after replenishment ATP allocate (carries prefill hint). */
export function shopReplenishmentMatrixPrefillHref(
  collectionId: string,
  orderId: string | undefined,
  opts: {
    appliedLines: number;
    atpQtyTotal?: number;
    buyerId?: string;
  }
): string {
  const base = shopB2bMatrixReorderHref(collectionId, orderId, {
    buyerId: opts.buyerId,
  });
  const sp = new URLSearchParams(base.split('?')[1] ?? '');
  sp.set('replenishmentApply', '1');
  if (opts.appliedLines > 0) {
    sp.set('appliedLines', String(opts.appliedLines));
  }
  if (opts.atpQtyTotal != null && opts.atpQtyTotal > 0) {
    sp.set('atpQtyTotal', String(opts.atpQtyTotal));
  }
  return `/shop/b2b/matrix?${sp.toString()}`;
}

export function sumReplenishmentAtpQty(lines: ShopReplenishmentAtpLine[]): number {
  return lines.reduce((acc, line) => acc + Math.max(0, line.atpQty), 0);
}
