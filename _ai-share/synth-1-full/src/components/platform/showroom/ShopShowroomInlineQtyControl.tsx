'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlatformCoreLink } from '@/components/platform/PlatformCoreLink';
import { cn } from '@/lib/utils';
import { upsertWorkshop2CartLine } from '@/lib/platform-core-ports/b2b/workshop2-cart-bridge';
import {
  parseShopShowroomInlineQty,
  parseShopShowroomInlineSize,
  SHOP_SHOWROOM_INLINE_SIZES,
  shopShowroomInlineQtyMin,
  type ShopShowroomInlineSize,
} from '@/lib/platform-core-ports/b2b/shop-showroom-inline-qty';
import type { CartItem } from '@/lib/types';

type ArticleLike = {
  collectionId: string;
  articleId: string;
  name: string;
  wholesalePriceRub: number;
  moq?: number;
  heroImageUrl?: string;
};

type Props = {
  article: ArticleLike;
  buyerId: string;
  cartQty: number;
  buildMatrixHref: (qty: number, size: ShopShowroomInlineSize) => string;
  onCartQtyChange: (qty: number, size: ShopShowroomInlineSize) => void;
};

function buildShowroomCartItem(
  article: ArticleLike,
  quantity: number,
  selectedSize: ShopShowroomInlineSize
): CartItem {
  return {
    id: article.articleId,
    slug: article.articleId,
    name: article.name,
    brand: article.collectionId,
    price: article.wholesalePriceRub,
    description: article.name,
    category: 'apparel',
    sustainability: [],
    sku: article.articleId,
    color: '',
    season: article.collectionId,
    quantity,
    selectedSize,
    images: article.heroImageUrl
      ? [
          {
            id: `${article.articleId}-hero`,
            url: article.heroImageUrl,
            alt: article.name,
            hint: '',
          },
        ]
      : [],
  };
}

/** Inline size + qty on showroom card → local cart + PG cart line (native platform/showroom). */
export function ShopShowroomInlineQtyControl({
  article,
  buyerId,
  cartQty,
  buildMatrixHref,
  onCartQtyChange,
}: Props) {
  const minQty = shopShowroomInlineQtyMin(article.moq);
  const [selectedSize, setSelectedSize] = useState<ShopShowroomInlineSize>('M');
  const [qtyRaw, setQtyRaw] = useState(String(cartQty > 0 ? cartQty : minQty));
  const [busy, setBusy] = useState(false);
  const [hintRu, setHintRu] = useState<string | null>(null);

  useEffect(() => {
    setQtyRaw(String(cartQty > 0 ? cartQty : minQty));
  }, [cartQty, minQty]);

  const resolvedQty =
    parseShopShowroomInlineQty(qtyRaw, minQty) ?? (cartQty > 0 ? cartQty : minQty);
  const matrixHref = buildMatrixHref(resolvedQty, selectedSize);

  const applyQty = async () => {
    const parsed = parseShopShowroomInlineQty(qtyRaw, minQty);
    if (parsed == null) {
      setHintRu(`Мин. заказ ${minQty} шт.`);
      return;
    }
    setBusy(true);
    setHintRu(null);
    try {
      onCartQtyChange(parsed, selectedSize);
      await upsertWorkshop2CartLine({
        item: buildShowroomCartItem(article, parsed, selectedSize),
        collectionId: article.collectionId,
        buyerId,
      });
      setHintRu(`В корзине ${parsed} ед. · ${selectedSize}`);
    } catch {
      setHintRu('Не удалось сохранить в корзину');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-3"
      data-testid={`shop-sc-showroom-inline-qty-${article.articleId}`}
    >
      <span className="text-text-muted text-[10px] font-semibold uppercase">Size</span>
      <div className="flex flex-wrap gap-1" role="group" aria-label={`Размер ${article.articleId}`}>
        {SHOP_SHOWROOM_INLINE_SIZES.map((size) => {
          const active = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              className={cn(
                'h-7 min-w-[2rem] rounded border px-1.5 text-[10px] font-semibold transition-colors max-md:min-h-11 max-md:min-w-11',
                active
                  ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                  : 'border-border-subtle bg-bg-surface2 text-text-secondary hover:border-accent-primary/40'
              )}
              aria-pressed={active}
              data-testid={`shop-sc-showroom-inline-size-${size}-${article.articleId}`}
              onClick={() => setSelectedSize(parseShopShowroomInlineSize(size))}
            >
              {size}
            </button>
          );
        })}
      </div>
      <span className="text-text-muted text-[10px] font-semibold uppercase">Qty</span>
      <Input
        type="number"
        min={minQty}
        value={qtyRaw}
        onChange={(e) => setQtyRaw(e.target.value)}
        className="h-8 w-[4.5rem] text-center text-xs"
        data-testid={`shop-sc-showroom-inline-qty-input-${article.articleId}`}
        aria-label={`Количество ${article.articleId}`}
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-8 text-[10px] font-bold"
        disabled={busy}
        data-testid={`shop-sc-showroom-inline-qty-apply-${article.articleId}`}
        onClick={() => void applyQty()}
      >
        {busy ? '…' : 'Применить'}
      </Button>
      <Button size="sm" variant="outline" className="h-8 text-[10px]" asChild>
        <PlatformCoreLink
          href={matrixHref}
          data-testid={`shop-sc-matrix-entry-link-${article.articleId}`}
          data-audit-legacy={`shop-sc-showroom-inline-qty-matrix-${article.articleId}`}
        >
          В матрицу
        </PlatformCoreLink>
      </Button>
      {hintRu ? (
        <span
          className="text-text-muted text-[10px]"
          data-testid={`shop-sc-showroom-inline-qty-hint-${article.articleId}`}
        >
          {hintRu}
        </span>
      ) : null}
    </div>
  );
}
