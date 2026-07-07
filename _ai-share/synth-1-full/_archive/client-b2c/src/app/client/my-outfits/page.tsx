'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Shirt, Trash2, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { useUIState } from '@/providers/ui-state';
import allProductsData from '@/lib/products';
import type { Product, SavedCartOutfit } from '@/lib/types';
import { lineRefMatchesCartItem, subtotalForItems } from '@/lib/cart-outfit-utils';
import { useMemo } from 'react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

function outfitPreviewUrls(outfit: SavedCartOutfit, catalog: Product[], max = 5): string[] {
  const urls: string[] = [];
  for (const ref of outfit.lineRefs) {
    const p = catalog.find((x) => x.id === ref.productId);
    const u = p?.images?.[0]?.url;
    if (u) urls.push(u);
    if (urls.length >= max) break;
  }
  return urls;
}

function outfitCatalogSubtotal(outfit: SavedCartOutfit, catalog: Product[]): number {
  let sum = 0;
  for (const ref of outfit.lineRefs) {
    const p = catalog.find((x) => x.id === ref.productId);
    if (p) sum += p.price || 0;
  }
  return sum;
}

export default function ClientMyOutfitsPage() {
  const {
    savedCartOutfits,
    deleteCartOutfit,
    applyCartOutfitToCart,
    setActiveCartOutfitId,
    toggleCart,
    cart,
  } = useUIState();

  const catalog = allProductsData as Product[];

  const rows = useMemo(() => {
    return savedCartOutfits.map((o) => ({
      outfit: o,
      thumbs: outfitPreviewUrls(o, catalog),
      catalogTotal: outfitCatalogSubtotal(o, catalog),
      inCartTotal: subtotalForItems(
        cart.filter((item) => o.lineRefs.some((ref) => lineRefMatchesCartItem(ref, item)))
      ),
    }));
  }, [savedCartOutfits, catalog, cart]);

  return (
    <CabinetPageContent maxWidth="3xl">
      <ClientCabinetSectionHeader description="Сохранённые наборы из корзины: сумма в каталоге и в текущей корзине." />

      {rows.length === 0 ? (
        <Card className="border-border-subtle">
          <CardContent className="py-12 text-center">
            <Shirt className="text-text-muted mx-auto mb-3 h-12 w-12" />
            <p className="text-text-secondary font-medium">Пока нет сохранённых образов</p>
            <p className="text-text-muted mt-1 text-sm">
              В корзине отметьте позиции и нажмите «В образ».
            </p>
            <Button className="mt-4" onClick={toggleCart}>
              Открыть корзину
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {rows.map(({ outfit, thumbs, catalogTotal, inCartTotal }) => (
            <li key={outfit.id}>
              <Card className="border-border-subtle overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex shrink-0 gap-1">
                      {thumbs.length === 0 ? (
                        <div className="bg-bg-surface2 text-text-muted flex h-20 w-16 items-center justify-center rounded px-1 text-center text-[10px] font-bold uppercase">
                          Нет фото
                        </div>
                      ) : (
                        thumbs.map((url, i) => (
                          <div
                            key={i}
                            className="bg-bg-surface2 border-border-subtle relative h-20 w-14 overflow-hidden rounded border"
                          >
                            <Image src={url} alt="" fill className="object-cover" sizes="56px" />
                          </div>
                        ))
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold leading-tight">{outfit.name}</h2>
                      <p className="text-text-secondary mt-1 text-xs">
                        {outfit.lineRefs.length} поз. · по каталогу ~
                        {catalogTotal.toLocaleString('ru-RU')} ₽
                      </p>
                      {inCartTotal > 0 && (
                        <p className="text-accent-primary mt-0.5 flex items-center gap-1 text-xs font-bold">
                          <Sparkles className="h-3 w-3" /> В корзине сейчас:{' '}
                          {inCartTotal.toLocaleString('ru-RU')} ₽
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs font-bold uppercase"
                          onClick={() => {
                            void applyCartOutfitToCart(outfit.id);
                          }}
                        >
                          <ShoppingCart className="mr-1 h-3.5 w-3.5" />В корзину
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-bold uppercase"
                          onClick={() => {
                            setActiveCartOutfitId(outfit.id);
                            toggleCart();
                          }}
                        >
                          Показать в корзине
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => deleteCartOutfit(outfit.id)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </CabinetPageContent>
  );
}
