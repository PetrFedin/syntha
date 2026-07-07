'use client';

import { useState, useEffect } from 'react';
import type { Brand, Product, Promotion } from '@/lib/types';
import { brands } from '@/lib/placeholder-data';
import CollaborationInsights from '@/components/brand/collaboration-insights';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ABTestDialog } from '@/components/brand/ab-test-dialog';
import { Beaker, Download, RefreshCw, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SkuAnalytics } from '@/components/brand/sku-analytics';
import { mockPromotions } from '@/app/admin/promotions/page';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getAnalyticsLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { PlatformCoreDemoDataBadge } from '@/components/platform/PlatformCoreDemoDataBadge';
import { PlatformCorePlaceholderSurfaceDisclaimer } from '@/components/platform/PlatformCorePlaceholderSurfaceDisclaimer';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

export default function AnalyticsPage() {
  const synthaBrand =
    brands.find((b) => b.slug?.includes('syntha') || b.id?.includes('syntha')) || brands[0];
  const [brand] = useState<Brand>(synthaBrand!);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [selectedProductForTest, setSelectedProductForTest] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/data/products.json');
        if (response.ok) {
          const products = (await response.json()) as Product[];
          setAllProducts(products);
          if (brand) setBrandProducts(products.filter((p) => p.brand === brand.name));
        } else {
          const { default: fallbackProducts } = await import('@/lib/products');
          setAllProducts(fallbackProducts as Product[]);
          if (brand)
            setBrandProducts((fallbackProducts as Product[]).filter((p) => p.brand === brand.name));
        }
      } catch (error) {
        try {
          const { default: fallbackProducts } = await import('@/lib/products');
          setAllProducts(fallbackProducts as Product[]);
          if (brand)
            setBrandProducts((fallbackProducts as Product[]).filter((p) => p.brand === brand.name));
        } catch (_) {
          console.warn('Analytics: no product data available');
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [brand]);

  if (!brand) return <div className="p-4 text-center">Бренд не найден.</div>;

  const openTestDialog = (product: Product) => {
    setSelectedProductForTest(product);
  };

  // Find a promotion related to one of the brand's products for the SKU analytics component
  const relevantPromotion = mockPromotions.find((p) =>
    brandProducts.some((bp) => bp.id === p.productId)
  );

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-7 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 pb-24 duration-700 animate-in fade-in">
      {isPlatformCoreMode() ? (
        <PlatformCorePlaceholderSurfaceDisclaimer route="/brand/analytics" />
      ) : (
        <p
          className="text-text-muted border-border-default bg-bg-surface2/80 rounded-md border px-3 py-2 text-xs leading-snug"
          data-testid="brand-analytics-demo-disclaimer"
        >
          <span className="text-text-primary inline-flex items-center gap-2 font-semibold">
            Демо.
            <PlatformCoreDemoDataBadge label="placeholder-data" />
          </span>{' '}
          Метрики и отчёты на мок-данных; не финансовая отчётность и не интеграция с OMS. См. реестр
          ядра: <code className="text-[10px]">CORE_OPERATING_CHAIN.md</code> §5.
        </p>
      )}
      {/* Control Panel — без повтора заголовка раздела (шапка из layout) */}
      <div className="flex flex-col items-end justify-end gap-3 border-b border-slate-100 pb-3 md:flex-row">
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
            <Button
              variant="ghost"
              className="h-7 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:text-indigo-600"
            >
              <RefreshCw className="mr-1.5 h-3 w-3" /> Recalculate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:bg-slate-50"
            >
              <Search className="h-3 w-3" /> Deep Audit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm transition-all hover:bg-indigo-50"
              asChild
            >
              <a
                href={`data:text/csv;charset=utf-8,${encodeURIComponent('metric,value\nsell-through,78%\nmarket-share,12%\nretailer-orders,124')}`}
                download="analytics-export.csv"
              >
                <Download className="mr-1 h-3 w-3" /> Экспорт CSV
              </a>
            </Button>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-7 px-3 text-[9px]" asChild>
              <Link href="/brand/analytics-bi">BI Reports</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-3 text-[9px]" asChild>
              <Link href="/brand/analytics-360">360° Analytics</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {brandProducts.length > 0 ? (
          <SkuAnalytics
            brandProducts={brandProducts}
            initialSku={relevantPromotion?.productId || brandProducts[0].id}
            promotion={relevantPromotion}
          />
        ) : (
          <Card className="rounded-xl border-dashed p-4 text-center text-muted-foreground">
            <p className="text-[10px] font-bold uppercase tracking-widest">
              No product data available for analysis.
            </p>
          </Card>
        )}

        {/* --- MARKETROOM SYNC / RETAILER BASKET INSIGHTS --- */}
        <Card className="relative overflow-hidden rounded-xl border-indigo-100 bg-indigo-50/10 shadow-sm">
          <div className="absolute right-0 top-0 p-4 opacity-5">
            <ShoppingBag className="h-24 w-24 rotate-12 text-indigo-600" />
          </div>
          <CardHeader className="relative z-10 border-b border-indigo-50/50 p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <Badge
                variant="outline"
                className="h-4 border-indigo-100 bg-indigo-50 px-1.5 text-[8px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm"
              >
                LIVE MARKET INTELLIGENCE
              </Badge>
            </div>
            <CardTitle className="text-sm font-bold uppercase leading-none tracking-widest text-slate-900">
              Marketroom Real-time Analytics
            </CardTitle>
            <CardDescription className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              What's happening in retailer baskets now
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="group rounded-xl border border-indigo-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200">
                <p className="mb-3 text-[9px] font-bold uppercase leading-none tracking-[0.15em] text-slate-400 transition-colors group-hover:text-indigo-600">
                  Draft Orders (In Baskets)
                </p>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold tabular-nums text-slate-900">
                      124 Units
                    </span>
                    <span className="flex h-3.5 items-center rounded bg-emerald-50 px-1 text-[8px] font-bold uppercase tracking-widest text-emerald-600">
                      +15% TODAY
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-slate-50 shadow-inner">
                    <div className="h-full w-3/4 bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)] transition-all duration-1000" />
                  </div>
                  <p className="text-[9px] font-medium italic text-slate-500 opacity-70">
                    "Graphite Parka — Most added item"
                  </p>
                </div>
              </div>

              <div className="group rounded-xl border border-indigo-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200">
                <p className="mb-3 text-[9px] font-bold uppercase leading-none tracking-[0.15em] text-slate-400 transition-colors group-hover:text-indigo-600">
                  Showroom Traffic
                </p>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold tabular-nums text-slate-900">
                      2,400+ Views
                    </span>
                    <span className="flex h-3.5 animate-pulse items-center rounded bg-indigo-50 px-1 text-[8px] font-bold uppercase tracking-widest text-indigo-600">
                      LIVE NOW
                    </span>
                  </div>
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[7px] font-bold uppercase text-slate-400 shadow-sm"
                      >
                        R{i}
                      </div>
                    ))}
                    <div className="flex h-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 px-1.5 text-[7px] font-bold text-white shadow-sm">
                      +18
                    </div>
                  </div>
                  <p className="text-[9px] font-medium text-slate-500 opacity-70">
                    Retailers analyzing your collection right now
                  </p>
                </div>
              </div>

              <div className="group rounded-xl border border-indigo-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200">
                <p className="mb-3 text-[9px] font-bold uppercase leading-none tracking-[0.15em] text-slate-400 transition-colors group-hover:text-indigo-600">
                  Sentiment Analysis
                </p>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold uppercase text-slate-900">Positive</span>
                    <Badge className="h-4 border-none bg-emerald-500 px-1.5 text-[8px] font-bold uppercase tracking-widest text-white shadow-lg">
                      STRONG BUY
                    </Badge>
                  </div>
                  <p className="text-[10px] font-bold uppercase italic leading-relaxed tracking-tight text-slate-600 opacity-80">
                    "Buyers note high material quality in FW'26 capsule."
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <CollaborationInsights brand={brand} allProducts={allProducts} />

        <Card className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:border-indigo-100">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-4">
            <div className="mb-1 flex items-center gap-2.5">
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-1.5 text-indigo-600 shadow-inner">
                <Beaker className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-bold uppercase leading-none tracking-widest text-slate-900">
                Image A/B Testing
              </CardTitle>
            </div>
            <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Optimize conversion rates with visual experiments.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {brandProducts.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-all hover:border-indigo-100 hover:bg-slate-50"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                    <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="mb-2 truncate text-[10px] font-bold uppercase tracking-tight text-slate-900">
                      {p.name}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTestDialog(p)}
                      className="h-6 w-full rounded-md bg-white text-[8px] font-bold uppercase tracking-widest shadow-sm transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                    >
                      Start Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedProductForTest && (
          <ABTestDialog
            product={selectedProductForTest}
            isOpen={!!selectedProductForTest}
            onOpenChange={(isOpen) => {
              if (!isOpen) setSelectedProductForTest(null);
            }}
          />
        )}

        <RelatedModulesBlock links={getAnalyticsLinks()} className="mt-6" />
      </div>
    </div>
  );
}
