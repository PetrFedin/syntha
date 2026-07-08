'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductFilters from '@/components/product-filters';
import type { Product, ActiveFilters, ProductAudience } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { findSubcategories } from '@/lib/category-filters';
import { fullCategoryStructure } from '@/lib/categories';
import ProductListItem from '@/components/product-list-item';
import ProductCard from '@/components/product-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OutletPage() {
  const [allOutletProducts, setAllOutletProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/data/products.json');
        const allProducts = (await res.json()) as Product[];
        setAllOutletProducts(allProducts.filter((p) => p.outlet));
      } catch (error) {
        console.error('Failed to fetch outlet products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    Наличие: ['in_stock', 'pre_order'],
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [context, setContext] = useState('');
  const [activeAudience, setActiveAudience] = useState<ProductAudience | 'Все' | 'Beauty' | 'Home'>(
    'Все'
  );
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const filteredProducts = useMemo(() => {
    let tempProducts = [...allOutletProducts];

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
    if (selectedCategory) {
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
        return Object.entries(activeFilters).every(([key, value]) => {
          if (!value || value.length === 0) return true;

          switch (key) {
            case 'Бренд':
              return (value as string[]).includes(p.brand);
            case 'Сезон':
              return (value as string[]).includes(p.season);
            case 'Стиль':
              return (
                p.tags &&
                (value as string[]).some((opt) =>
                  (p.tags || []).includes(opt as NonNullable<Product['tags']>[number])
                )
              );
            case 'Материал':
              return (value as string[]).includes(p.material || '');
            case 'Цвет':
              return (
                p.availableColors &&
                (value as string[]).some((colorName) =>
                  p.availableColors?.some((c) => c.name === colorName)
                )
              );
            case 'Наличие':
              return (value as string[]).includes(p.availability || 'in_stock');
            case 'Посадка':
              return p.clothing?.fit && (value as string[]).includes(p.clothing.fit);
            case 'Скидка':
              const minDiscount = Math.min(...(value as string[]).map((v) => parseInt(v, 10)));
              const productDiscount = p.originalPrice
                ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                : 0;
              return productDiscount >= minDiscount;
            case 'Цена':
              const [minPrice, maxPrice] = value as [number, number];
              const priceNum = typeof p.price === 'number' ? p.price : Number(p.price);
              return Number.isFinite(priceNum) && priceNum >= minPrice && priceNum <= maxPrice;
            case 'Высота каблука':
              const [minHeel, maxHeel] = value as [number, number];
              const rawHeel = p.footwear?.heelHeight;
              const heelNum = typeof rawHeel === 'number' ? rawHeel : Number(rawHeel);
              return Number.isFinite(heelNum) ? heelNum >= minHeel && heelNum <= maxHeel : true;
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
                p.sustainability &&
                (value as string[]).some((opt) => p.sustainability.includes(opt))
              );
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

    return tempProducts;
  }, [activeFilters, activeAudience, selectedCategory, allOutletProducts]);

  const resetFilters = () => {
    setActiveFilters({
      Наличие: ['in_stock', 'pre_order'],
    });
    setSelectedCategory(undefined);
    setContext('');
  };

  const audiences: { label: string; value: ProductAudience | 'Все' | 'Beauty' | 'Home' }[] = [
    { label: 'Все', value: 'Все' },
    { label: 'Женщинам', value: 'Женский' },
    { label: 'Мужчинам', value: 'Мужской' },
    { label: 'Beauty', value: 'Beauty' },
    { label: 'Home', value: 'Home' },
  ];

  return (
    <CabinetPageContent maxWidth="5xl" className="px-4 py-6 pb-16 pb-24 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-sm font-bold md:text-sm">Аутлет</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          Эксклюзивные предложения на товары из прошлых коллекций.
        </p>
      </header>
      <Alert className="mb-8 bg-secondary">
        <Info className="h-4 w-4" />
        <AlertTitle>Обратите внимание!</AlertTitle>
        <AlertDescription>
          На товары из раздела "Аутлет" не распространяется действие бонусных баллов и других скидок
          программы лояльности.
        </AlertDescription>
      </Alert>

      <div className="grid items-start gap-3 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <ProductFilters
            products={allOutletProducts}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            resetFilters={resetFilters}
            isLoading={isLoading}
            audience={activeAudience}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
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
                  <Button variant="outline" size="sm">
                    Сортировать
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Сначала популярные</DropdownMenuItem>
                  <DropdownMenuItem>Сначала новые</DropdownMenuItem>
                  <DropdownMenuItem>Сначала дешевле</DropdownMenuItem>
                  <DropdownMenuItem>Сначала дороже</DropdownMenuItem>
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
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col gap-3'
            }
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
          {filteredProducts.length === 0 && !isLoading && (
            <div className="col-span-full rounded-lg border-2 border-dashed py-4 text-center">
              <h2 className="text-base font-semibold text-muted-foreground">Товары не найдены</h2>
              <p className="mt-2 text-muted-foreground">
                Попробуйте изменить фильтры или сбросить их.
              </p>
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                Сбросить фильтры
              </Button>
            </div>
          )}
          {isLoading && (
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
          )}
        </main>
      </div>
    </CabinetPageContent>
  );
}
