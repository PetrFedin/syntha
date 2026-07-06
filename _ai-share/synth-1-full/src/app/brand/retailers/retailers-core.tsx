'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Store } from 'lucide-react';
import {
  ROUTES,
  brandB2bOrderHref,
  brandB2bOrdersCollectionRegistryHref,
  brandB2bOrdersRegistryHref,
} from '@/lib/routes';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { fmtMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { BrandCoRegistryRetailOnboardingStrip } from '@/components/platform/BrandCoRegistryRetailOnboardingStrip';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { BrandShopProductionVisibilitySettings } from '@/components/brand/b2b/BrandShopProductionVisibilitySettings';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { shopCoreBuyerLabelRu } from '@/lib/order/shop-core-buyer-context';
import { useSearchParams } from 'next/navigation';

type W2RetailerStats = {
  orderCount: number;
  totalRub: number;
  lastOrderId?: string;
  tierLabelRu?: string;
  displayNameRu?: string;
};

function retailerDisplayName(id: string, w2?: W2RetailerStats): string {
  return w2?.displayNameRu?.trim() || shopCoreBuyerLabelRu(id);
}

function retailerInitials(name: string): string {
  const words = name.replace(/[«»]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

function retailerTierLabel(id: string, w2?: W2RetailerStats): string | null {
  const fromPg = w2?.tierLabelRu?.trim();
  if (fromPg && fromPg !== 'Новый') return fromPg;
  return fromPg || null;
}

export function BrandRetailersCorePage() {
  const searchParams = useSearchParams();
  const pageCollectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const [searchQuery, setSearchQuery] = useState('');
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: '',
    resolveFrom: ['allocation', 'operational'],
    actorRole: 'brand',
  });
  const [w2ByRetailer, setW2ByRetailer] = useState<Record<string, W2RetailerStats>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/brand/retailers/b2b-orders-summary');
        const json = (await res.json()) as {
          ok?: boolean;
          byRetailerId?: Record<string, W2RetailerStats>;
        };
        if (!cancelled && json.ok && json.byRetailerId) {
          setW2ByRetailer(json.byRetailerId);
        }
      } catch {
        if (!cancelled) setW2ByRetailer({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRetailers = useMemo(() => {
    const ids = Object.keys(w2ByRetailer).length > 0 ? Object.keys(w2ByRetailer) : ['shop1'];
    return ids
      .map((id) => {
        const w2 = w2ByRetailer[id];
        const name = retailerDisplayName(id, w2);
        return {
          id,
          name,
          initials: retailerInitials(name),
          orders: w2?.orderCount ?? 0,
          totalValue: w2?.totalRub ?? 0,
          lastW2OrderId: w2?.lastOrderId,
          tierLabel: retailerTierLabel(id, w2),
        };
      })
      .filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [searchQuery, w2ByRetailer]);

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-20">
      <PlatformCoreListChrome highlightRole="brand" pillarId="collection_order">
        <div data-testid="brand-co-retailers-panel">
          <div className="mb-3">
            <BrandCoRegistryRetailOnboardingStrip
              collectionId={pageCollectionId || PLATFORM_CORE_DEMO.collectionId}
              orderId={spineOrderId || undefined}
            />
          </div>
          <div
            className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
            data-testid="brand-co-retailers-context-strip"
          >
            <Link
              href={brandB2bOrdersCollectionRegistryHref()}
              data-testid="brand-co-retailers-registry-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Реестр заказов
            </Link>
            {spineOrderId ? (
              <Link
                href={brandB2bOrderHref(spineOrderId)}
                data-testid="brand-co-retailers-active-order-link"
                className="text-accent-primary font-medium hover:underline"
              >
                Текущий заказ
              </Link>
            ) : null}
            <Link
              href={`${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(pageCollectionId || PLATFORM_CORE_DEMO.collectionId)}`}
              data-testid="brand-co-retailers-showroom-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Витрина магазина
            </Link>
            <Link
              href={brandCrmSegmentationFeatureHref('segments', pageCollectionId || PLATFORM_CORE_DEMO.collectionId)}
              data-testid="brand-co-retailers-crm-segments-link"
              className="text-accent-primary font-medium hover:underline"
            >
              CRM · сегменты
            </Link>
            <Link
              href={brandCrmSegmentationFeatureHref('pricelist', pageCollectionId || PLATFORM_CORE_DEMO.collectionId)}
              data-testid="brand-co-retailers-crm-pricelist-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Pricelist assign
            </Link>
          </div>
          <BrandShopProductionVisibilitySettings
            collectionId={pageCollectionId || PLATFORM_CORE_DEMO.collectionId}
          />
          <Tabs value="retailers" className="w-full">
            <TabsList className={cn(cabinetSurface.tabsList, 'flex-wrap')}>
              <TabsTrigger
                value="retailers"
                className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}
              >
                <Store className="h-3.5 w-3.5 shrink-0" />
                Ритейлеры
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="retailers"
              className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
            >
              <div className="space-y-4 pb-12">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                      <Link
                        href={brandB2bOrdersCollectionRegistryHref()}
                        data-testid="brand-co-retailers-all-orders-link"
                      >
                        Оптовые заказы
                      </Link>
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="text-text-muted absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2" />
                    <Input
                      placeholder="Поиск партнёра…"
                      className="border-border-default h-8 w-44 rounded-lg bg-white pl-8 text-[10px] font-bold uppercase tracking-tight shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="brand-co-retailers-search"
                    />
                  </div>
                </div>
                <div
                  className="border-border-subtle overflow-hidden rounded-xl border bg-white shadow-sm"
                  data-testid="brand-co-retailers-table"
                >
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-bg-surface2/80 border-border-subtle border-b">
                        <th className="text-text-muted px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                          Партнёр
                        </th>
                        <th className="text-text-muted px-4 py-2 text-right text-[9px] font-bold uppercase tracking-widest">
                          Заказы
                        </th>
                        <th className="text-text-muted px-4 py-2 text-right text-[9px] font-bold uppercase tracking-widest">
                          Сумма
                        </th>
                        <th className="text-text-muted px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                          Последний заказ
                        </th>
                        <th className="text-text-muted px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border-subtle divide-y">
                      {filteredRetailers.map((retailer) => (
                        <tr key={retailer.id} className="hover:bg-bg-surface2/50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/brand/retailers/${retailer.id}`}
                              data-testid={`brand-co-retailers-detail-link-${retailer.id}`}
                              data-audit-legacy={`retailer-detail-link-${retailer.id}`}
                              className="flex items-center gap-2.5"
                            >
                              <Avatar className="h-8 w-8 rounded-lg border">
                                <AvatarFallback className="bg-bg-surface2 text-text-muted rounded-lg text-[10px] font-bold">
                                  {retailer.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p
                                  className="text-text-primary text-[11px] font-bold uppercase"
                                  data-testid={`retailer-display-name-${retailer.id}`}
                                >
                                  {retailer.name}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                  {retailer.tierLabel ? (
                                    <Badge
                                      variant="outline"
                                      data-testid={`retailer-tier-badge-${retailer.id}`}
                                      data-tier-source="pg"
                                      className="h-3.5 border-sky-200 bg-sky-50 px-1 text-[7px] text-sky-800"
                                    >
                                      {retailer.tierLabel}
                                    </Badge>
                                  ) : null}
                                  <Badge
                                    variant="outline"
                                    data-testid={`retailer-w2-badge-${retailer.id}`}
                                    className="h-3.5 border-emerald-200 bg-emerald-50 px-1 text-[7px] text-emerald-700"
                                  >
                                    W2 · {retailer.orders} заказ
                                  </Badge>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums">
                            {retailer.orders}
                          </td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums">
                            {fmtMoney(retailer.totalValue)}
                          </td>
                          <td className="px-4 py-3">
                            {retailer.lastW2OrderId ? (
                              <Link
                                href={brandB2bOrderHref(retailer.lastW2OrderId)}
                                data-testid={`brand-co-retailers-last-order-${retailer.id}`}
                                className="text-accent-primary text-[10px] font-bold uppercase hover:underline"
                              >
                                {retailer.lastW2OrderId}
                              </Link>
                            ) : (
                              <span className="text-text-muted text-[10px]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                              <Link
                                href={brandB2bOrdersRegistryHref({ partner: retailer.id })}
                                data-testid={`brand-co-retailers-orders-link-${retailer.id}`}
                                data-audit-legacy={`retailer-orders-link-${retailer.id}`}
                                className="text-accent-primary text-[10px] font-semibold hover:underline"
                              >
                                Заказы
                              </Link>
                              <Link
                                href={`${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(pageCollectionId || PLATFORM_CORE_DEMO.collectionId)}&partner=${encodeURIComponent(retailer.id)}`}
                                data-testid={`brand-co-retailers-showroom-link-${retailer.id}`}
                                data-audit-legacy={`retailer-showroom-link-${retailer.id}`}
                                className="text-accent-primary text-[10px] font-semibold hover:underline"
                              >
                                Витрина
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
