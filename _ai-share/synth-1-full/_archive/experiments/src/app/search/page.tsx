'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductFilters from '@/components/product-filters';
import type { Product, ActiveFilters, ProductAudience } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, TrendingUp, Zap, Package, Brain, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { findSubcategories } from '@/lib/category-filters';
import ProductListItem from '@/components/product-list-item';
import ProductCard from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useUIState } from '@/providers/ui-state';
import { registryFeedLayout } from '@/lib/ui/registry-feed-layout';

type Audience = ProductAudience | 'Все' | 'Beauty' | 'Home';

function SearchContent() {
  const { viewRole } = useUIState();
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    Наличие: ['in_stock', 'pre_order'],
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [context, setContext] = useState(
    searchParams.get('sustainability') === 'true' ? 'sustainability_focus' : ''
  );
  const [activeAudience, setActiveAudience] = useState<Audience>('Все');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [fullCategoryStructure, setFullCategoryStructure] = useState<unknown>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/data/products.json'),
          fetch('/data/categories.json'),
        ]);
        const productsData = (await productsRes.json()) as Product[];
        const categoriesData = await categoriesRes.json();
        setAllProducts(productsData);
        setFullCategoryStructure(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    // Exclude outlet products from the main catalog
    let tempProducts = allProducts.filter((p) => !p.outlet);

    // Audience filtering
    if (activeAudience === 'Beauty') {
      tempProducts = tempProducts.filter((p) => p.category === 'Beauty & Grooming');
    } else if (activeAudience === 'Home') {
      tempProducts = tempProducts.filter((p) => p.category === 'Home & Lifestyle');
    } else if (activeAudience !== 'Все') {
      tempProducts = tempProducts.filter(
        (p) => p.audience === activeAudience || p.audience === 'Унисекс'
      );
    }

    // Category filtering
    if (selectedCategory && fullCategoryStructure) {
      const allApplicableCategories = findSubcategories(selectedCategory, fullCategoryStructure);

      tempProducts = tempProducts.filter((p) => {
        return (
          allApplicableCategories.includes(p.category) ||
          (p.subcategory && allApplicableCategories.includes(p.subcategory))
        );
      });
    }

    // Manual filters
    if (Object.keys(activeFilters).length > 0) {
      tempProducts = tempProducts.filter((p) => {
        return Object.entries(activeFilters).every(([key, rawValue]) => {
          const value = rawValue as (string | number)[];
          if (!value || value.length === 0) return true;

          switch (key) {
            case 'Бренд':
              return (value as string[]).includes(p.brand);
            case 'Сезон':
              return (value as string[]).includes(p.season);
            case 'Стиль':
              return !!(
                p.tags?.length &&
                value.some((opt) => (p.tags as readonly string[]).includes(String(opt)))
              );
            case 'Материал':
              return (value as string[]).includes(p.material || '');
            case 'Цвет':
              return (
                p.availableColors &&
                value.some((colorName) =>
                  p.availableColors?.some((c) => c.name === String(colorName))
                )
              );
            case 'Наличие':
              return (value as string[]).includes(p.availability || 'in_stock');
            case 'Посадка':
              return p.clothing?.fit && (value as string[]).includes(p.clothing.fit);
            case 'Скидка':
              const minDiscount = Math.min(
                ...(value as string[]).map((v) => parseInt(String(v), 10))
              );
              const productDiscount = p.originalPrice
                ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                : 0;
              return productDiscount >= minDiscount;
            case 'Цена':
              const [minPrice, maxPrice] = value as number[];
              return p.price >= minPrice && p.price <= maxPrice;
            case 'Высота каблука': {
              const [minHeel, maxHeel] = value as number[];
              const raw = p.footwear?.heelHeight;
              const heelNum =
                typeof raw === 'number' ? raw : typeof raw === 'string' ? parseFloat(raw) : NaN;
              if (Number.isNaN(heelNum)) return true;
              return heelNum >= minHeel && heelNum <= maxHeel;
            }
            case 'Материал подошвы': {
              const sole = p.footwear?.soleMaterial;
              return typeof sole === 'string' && (value as string[]).includes(sole);
            }
            case 'Материал верха': {
              const upper = p.footwear?.upperMaterial;
              return typeof upper === 'string' && (value as string[]).includes(upper);
            }
            case 'Экологичность':
              return (
                p.sustainability && value.some((opt) => p.sustainability.includes(String(opt)))
              );
            case 'Ценности': {
              const combined = [...(p.sustainability || []), ...(p.tags || [])].map((x) =>
                x.toLowerCase()
              );
              return value.some((opt) => {
                const o = String(opt);
                return combined.some((c) => c.includes(o.replace(/_/g, ' ')) || c.includes(o));
              });
            }
            case 'AR':
              return p.hasAR === true;
            case '3D':
              return p.hasAR === true; // Assuming products with AR also have 3D models for now
            default:
              return true;
          }
        });
      });
    }

    // Sort logic
    tempProducts.sort((a, b) => {
      if (sortBy === 'ai_smart') {
        // Smart sort: Promoted first, then by rating, then by some ID-based logic for "personalization"
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        if (aRating !== bRating) return bRating - aRating;
        return (a.id.length % 7) - (b.id.length % 7);
      }
      if (sortBy === 'new') return -1; // Mock new sort
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;

      // Default: Sort promoted products to the top
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return 0;
    });

    return tempProducts;
  }, [activeFilters, activeAudience, selectedCategory, allProducts, fullCategoryStructure, sortBy]);

  const resetFilters = () => {
    setActiveFilters({
      Наличие: ['in_stock', 'pre_order'],
    });
    setSelectedCategory(undefined);
    setContext('');
  };

  const audiences: { label: string; value: Audience }[] = [
    { label: 'Все', value: 'Все' },
    { label: 'Женщинам', value: 'Женский' },
    { label: 'Мужчинам', value: 'Мужской' },
    { label: 'Beauty', value: 'Beauty' },
    { label: 'Home', value: 'Home' },
  ];

  return (
    <CabinetPageContent
      maxWidth="5xl"
      className="space-y-4 px-4 py-6 pb-16 pb-24 duration-300 animate-in fade-in sm:px-6"
    >
      {viewRole === 'b2b' && (
        <div className="grid grid-cols-1 gap-3 duration-500 animate-in slide-in-from-top-4 md:grid-cols-4">
          <Card className="bg-text-primary relative overflow-hidden rounded-3xl border-none p-4 text-white shadow-xl">
            <TrendingUp className="absolute right-4 top-4 h-12 w-12 opacity-10" />
            <p className="text-accent-primary mb-1 text-[8px] font-black uppercase tracking-widest">
              Спрос в реальном времени
            </p>
            <h4 className="text-base font-black">High (84%)</h4>
            <p className="text-text-muted mt-2 text-[10px] italic">
              «Категория "Верхняя одежда" лидирует в предзаказах»
            </p>
          </Card>
          <Card className="border-border-subtle rounded-3xl border bg-white p-4 shadow-sm">
            <Zap className="mb-2 h-5 w-5 text-amber-500" />
            <p className="text-text-muted mb-1 text-[8px] font-black uppercase tracking-widest">
              Доступно к заказу (ATS)
            </p>
            <h4 className="text-text-primary text-base font-black">
              42,850{' '}
              <span className="text-text-muted text-xs font-bold uppercase tracking-normal">
                ед.
              </span>
            </h4>
          </Card>
          <Card className="border-border-subtle rounded-3xl border bg-white p-4 shadow-sm">
            <Package className="text-accent-primary mb-2 h-5 w-5" />
            <p className="text-text-muted mb-1 text-[8px] font-black uppercase tracking-widest">
              Брендов на связи
            </p>
            <h4 className="text-text-primary text-base font-black">124</h4>
          </Card>
          <Card className="bg-accent-primary/10 border-accent-primary/20 rounded-3xl border p-4">
            <Brain className="text-accent-primary mb-2 h-5 w-5" />
            <p className="text-accent-primary mb-1 text-[8px] font-black uppercase tracking-widest">
              AI Recommendation
            </p>
            <p className="text-accent-primary text-[10px] font-bold leading-tight">
              «Пополните сток базовых моделей к началу сезона SS26»
            </p>
          </Card>
        </div>
      )}

      <header className="mb-8 text-center">
        <h1 className="font-headline text-sm font-bold uppercase tracking-tight md:text-sm">
          {viewRole === 'b2b' ? 'B2B КАТАЛОГ' : 'Каталог товаров'}
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          {viewRole === 'b2b'
            ? 'Профессиональная подборка товаров для вашего магазина с прямым доступом к ценам и остаткам.'
            : 'Найдите свой идеальный образ среди тысяч товаров от лучших брендов.'}
        </p>
      </header>

      <div className="mb-8 flex justify-center gap-2 border-b pb-4">
        {audiences.map((audience) => (
          <Button
            key={audience.value}
            variant={activeAudience === audience.value ? 'default' : 'ghost'}
            onClick={() => {
              resetFilters();
              setActiveAudience(audience.value);
            }}
            className={cn(
              'rounded-full',
              activeAudience === audience.value ? '' : 'text-muted-foreground'
            )}
          >
            {audience.label}
          </Button>
        ))}
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <ProductFilters
            products={allProducts.filter((p) => !p.outlet)}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            resetFilters={resetFilters}
            isLoading={isLoading}
            context={context}
            setContext={setContext}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            audience={activeAudience}
          />
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Найдено товаров: {filteredProducts.length}
            </p>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {sortBy === 'ai_smart' && <Sparkles className="text-accent-primary h-3 w-3" />}
                    {sortBy === 'popular'
                      ? 'Сначала популярные'
                      : sortBy === 'new'
                        ? 'Сначала новые'
                        : sortBy === 'price_asc'
                          ? 'Сначала дешевле'
                          : sortBy === 'price_desc'
                            ? 'Сначала дороже'
                            : sortBy === 'ai_smart'
                              ? 'AI Smart Sort'
                              : 'Сортировать'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => setSortBy('ai_smart')}
                    className="text-accent-primary flex items-center gap-2 font-bold"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Smart Sort
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('popular')}>
                    Сначала популярные
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('new')}>
                    Сначала новые
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price_asc')}>
                    Сначала дешевле
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price_desc')}>
                    Сначала дороже
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col gap-3'
              )}
            >
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className={viewMode === 'grid' ? 'h-[450px]' : 'h-[200px]'} />
              ))}
            </div>
          ) : (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col gap-3'
              )}
            >
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  {viewMode === 'list' ? (
                    <ProductListItem product={product} />
                  ) : (
                    <ProductCard product={product} viewMode={viewMode} />
                  )}
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="col-span-full rounded-lg border-2 border-dashed py-4 text-center">
              <h2 className="text-base font-semibold text-muted-foreground">Товары не найдены</h2>
              <p className="mt-2 text-muted-foreground">
                Попробуйте изменить фильтры или сбросить их.
              </p>
            </div>
          )}
        </main>
      </div>
    </CabinetPageContent>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className={cn(registryFeedLayout.pageShell, 'text-center')}>Загрузка каталога...</div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
