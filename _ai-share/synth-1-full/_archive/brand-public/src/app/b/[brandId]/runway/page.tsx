'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Sparkles, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import {
  filterScrollVideoProducts,
  resolveScrollSwitcherSections,
} from '@/lib/product-scroll-switcher';
import { brands } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { cn } from '@/lib/utils';

const ProductScrollSwitcher = dynamic(
  () =>
    import('@/components/product/ProductScrollSwitcher').then((m) => ({
      default: m.ProductScrollSwitcher,
    })),
  { ssr: false, loading: () => <p className="p-8 text-sm text-muted-foreground">Загрузка…</p> }
);

interface BrandRunwayGalleryPageProps {
  params: Promise<{ brandId: string }>;
}

/**
 * Runway-галерея бренда: горизонтальный scroll-snap + раскрытие mini-switcher по клику.
 */
export default function BrandRunwayGalleryPage({ params }: BrandRunwayGalleryPageProps) {
  const { brandId } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const brand = useMemo(
    () =>
      brands.find(
        (b) =>
          b.slug === brandId || b.slug?.toLowerCase() === brandId.toLowerCase() || b.id === brandId
      ),
    [brandId]
  );

  useEffect(() => {
    fetch('/data/products.json')
      .then(async (r) => {
        const data = (await r.json()) as Product[];
        setProducts(data);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const runwayProducts = useMemo(() => {
    if (!brand?.name) return [];
    return filterScrollVideoProducts(products).filter((p) => p.brand === brand.name);
  }, [products, brand?.name]);

  const expandedProduct = useMemo(
    () => runwayProducts.find((p) => p.slug === expandedSlug),
    [runwayProducts, expandedSlug]
  );

  if (!brand) {
    return (
      <CabinetPageContent maxWidth="4xl" className="py-12">
        <p className="text-muted-foreground">Бренд не найден.</p>
        <Button variant="link" asChild className="mt-4 px-0">
          <Link href="/client/catalog">← К каталогу</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  return (
    <CabinetPageContent maxWidth="6xl" className="py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3 text-muted-foreground">
            <Link href={`/b/${brand.slug}`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {brand.name}
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            <h1 className="font-headline text-2xl font-bold">Runway-галерея</h1>
          </div>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Горизонтальная лента scroll-video SKU. Нажмите карточку — mini runway на месте; «Открыть
            PDP» — полный immersive опыт.
          </p>
        </div>
        <Badge variant="secondary">{runwayProducts.length} SKU</Badge>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Загрузка…</p>
      ) : runwayProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">У бренда пока нет scroll-video товаров.</p>
          <Button variant="outline" size="sm" asChild className="mt-4">
            <Link href={`/b/${brand.slug}`}>К профилю бренда</Link>
          </Button>
        </div>
      ) : (
        <>
          <div
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 md:mx-0 md:px-0"
            role="list"
            aria-label="Runway товары бренда"
          >
            {runwayProducts.map((product) => {
              const sections = resolveScrollSwitcherSections(product);
              const hero =
                sections[0]?.sectionImageUrl ??
                sections[0]?.thumbImageUrl ??
                product.images[0]?.url;
              const isExpanded = expandedSlug === product.slug;

              return (
                <article
                  key={product.slug}
                  role="listitem"
                  className={cn(
                    'w-[min(85vw,280px)] shrink-0 snap-center overflow-hidden rounded-xl border border-border bg-card transition-all duration-300',
                    isExpanded && 'w-[min(92vw,420px)] ring-2 ring-primary/40'
                  )}
                >
                  <button
                    type="button"
                    className="group w-full text-left"
                    onClick={() => setExpandedSlug(isExpanded ? null : product.slug)}
                    aria-expanded={isExpanded}
                  >
                    <div className="relative aspect-[4/5] bg-muted">
                      {hero ? (
                        <Image
                          src={hero}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="280px"
                        />
                      ) : null}
                      <Badge className="absolute left-3 top-3 bg-black/60 text-[10px] text-white backdrop-blur-sm">
                        {sections.length} варианта
                      </Badge>
                      <div className="absolute bottom-3 left-3 flex gap-1">
                        {sections.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className="h-2.5 w-2.5 rounded-full border border-white/60 shadow-sm"
                            style={{ backgroundColor: s.color }}
                            title={s.label}
                            aria-hidden
                          />
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-headline text-sm font-bold leading-snug">{product.name}</p>
                      <p className="mt-1 text-sm tabular-nums text-primary">
                        от {product.price.toLocaleString('ru-RU')} ₽
                      </p>
                      <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {isExpanded ? 'Свернуть' : 'Развернуть runway'}
                      </p>
                    </div>
                  </button>
                  {isExpanded ? (
                    <div className="border-t border-border px-2 pb-3">
                      <div className="mb-2 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setExpandedSlug(null)}
                          aria-label="Свернуть"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <ProductScrollSwitcher
                        product={product}
                        compact
                        showShare={false}
                        showWishlist={false}
                        showProgress={false}
                        analyticsSurface="brand-runway-gallery"
                        onAddToCart={() => undefined}
                      />
                      <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                        <Link href={`/products/${product.slug}?view=runway`}>Открыть на PDP</Link>
                      </Button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {expandedProduct ? (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Активно: {expandedProduct.name} —{' '}
              <Link
                href={`/products/${expandedProduct.slug}?view=runway`}
                className="text-primary hover:underline"
              >
                полный runway на PDP
              </Link>
            </p>
          ) : null}
        </>
      )}
    </CabinetPageContent>
  );
}
