'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { products as allProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Search,
  PlusCircle,
  Filter,
  Download,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Package,
  BarChart3,
  ChevronRight,
  Bot,
  Sparkles,
  RefreshCcw,
  MoreHorizontal,
  Eye,
  Layers,
  Globe,
  Truck,
  Activity,
  Factory,
  Warehouse,
} from 'lucide-react';
import { PromotionDialog } from '@/components/brand/promotion-dialog';
import Link from 'next/link';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { fmtNumber, fmtMoney } from '@/lib/format';
import { GismtMonitor } from '@/components/brand/gismt-monitor';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { ROUTES } from '@/lib/routes';

const initialInventory = allProducts.filter((p) => p.brand === 'Syntha');

export default function BrandInventoryPage() {
  const [products, setProducts] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [availability, setAvailability] = useState<
    'all' | 'in_stock' | 'pre_order' | 'out_of_stock' | 'coming_soon'
  >('all');
  const [promotionProduct, setPromotionProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredProducts = useMemo(() => {
    let tempProducts = [...products];
    if (searchQuery) {
      tempProducts = tempProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (availability !== 'all') {
      if (availability === 'in_stock') {
        tempProducts = tempProducts.filter((p) =>
          p.availableColors?.some((c) =>
            c.sizeAvailability?.some((s) => s.status === 'in_stock' && s.quantity && s.quantity > 0)
          )
        );
      } else if (availability === 'out_of_stock') {
        tempProducts = tempProducts.filter(
          (p) =>
            !p.availableColors?.some((c) =>
              c.sizeAvailability?.some(
                (s) => s.status === 'in_stock' && s.quantity && s.quantity > 0
              )
            )
        );
      }
    }
    return tempProducts;
  }, [products, searchQuery, availability]);

  return (
    <div
      className="container mx-auto max-w-5xl space-y-4 px-4 py-4 pb-24 duration-700 animate-in fade-in"
      data-testid="brand-inventory-page"
    >
      <SectionInfoCard
        title="Inventory Matrix"
        description="Остатки по SKU, видимость в каналах. Связь с Warehouse (склад), Production (приёмки) и B2B (заказы)."
        icon={Package}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              Warehouse
            </Badge>
            <Button variant="outline" size="sm" className="ml-1 h-7 text-[9px]" asChild>
              <Link href="/brand/products">
                <Package className="mr-1 h-3 w-3" /> Products
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/products/matrix">
                <Layers className="mr-1 h-3 w-3" /> Matrix
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/warehouse">
                <Warehouse className="mr-1 h-3 w-3" /> Warehouse
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/production">
                <Factory className="mr-1 h-3 w-3" /> Production
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link
                href={ROUTES.shop.inventory}
                data-testid="brand-inventory-shop-stock-upload-link"
              >
                <Truck className="mr-1 h-3 w-3" /> Shop stock
              </Link>
            </Button>
          </>
        }
      />
      {/* --- TOP STRATEGIC BAR --- */}
      <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-end">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <Link href="/brand" className="transition-colors hover:text-indigo-600">
              Organization
            </Link>
            <ChevronRight className="h-2 w-2" />
            <span className="text-slate-300">Inventory</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-base font-bold uppercase leading-none tracking-tighter text-slate-900">
              Inventory Matrix 2.0
            </h1>
            <Badge
              variant="outline"
              className="h-4 gap-1 border-emerald-100 bg-emerald-50 px-1.5 text-[7px] font-bold tracking-widest text-emerald-600 shadow-sm transition-all"
            >
              <Activity className="h-2.5 w-2.5" /> LIVE SYNC
            </Badge>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
            <Button
              variant="ghost"
              className="h-7 rounded-lg bg-white px-3 text-[9px] font-bold uppercase text-slate-900 shadow-sm"
            >
              Money
            </Button>
            <Button
              variant="ghost"
              className="h-7 rounded-lg px-3 text-[9px] font-bold uppercase text-slate-400 transition-all hover:bg-white hover:text-slate-600"
            >
              Units
            </Button>
          </div>
          <div className="mx-0.5 h-5 w-[1px] bg-slate-200" />
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:bg-slate-50"
          >
            <Download className="h-3 w-3" /> CSV
          </Button>
          <Button
            asChild
            className="h-7 gap-1.5 rounded-lg bg-slate-900 px-3 text-[9px] font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-indigo-600"
          >
            <Link href="/brand/products/new">
              <PlusCircle className="h-3 w-3" /> Новый SKU
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <GismtMonitor />

        {/* --- ANALYTICAL GRID --- */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'STOCK VALUE',
              val: '142.5M ₽',
              sub: '+2.4%',
              trend: 'up',
              icon: Package,
              bg: 'bg-indigo-50/50',
            },
            {
              label: 'SELL-THROUGH',
              val: '68.2%',
              sub: 'High',
              trend: 'up',
              icon: BarChart3,
              bg: 'bg-emerald-50/50',
            },
            {
              label: 'LOW STOCK',
              val: '12',
              sub: 'Critical',
              trend: 'down',
              icon: AlertTriangle,
              critical: true,
              bg: 'bg-rose-50/50',
            },
            {
              label: 'REPLENISH',
              val: '8.4M ₽',
              sub: 'Suggested',
              trend: 'up',
              icon: RefreshCcw,
              bg: 'bg-amber-50/50',
            },
          ].map((m, i) => (
            <Card
              key={i}
              className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md"
            >
              <div className="mb-2.5 flex items-center justify-between">
                <div
                  className={cn('rounded-lg border border-slate-200/50 p-1.5 shadow-inner', m.bg)}
                >
                  <m.icon
                    className={cn(
                      'h-3.5 w-3.5',
                      m.critical ? 'text-rose-500' : 'text-slate-400 group-hover:text-indigo-600'
                    )}
                  />
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'h-3.5 border px-1.5 text-[7px] font-bold uppercase tracking-widest shadow-sm transition-all',
                    m.trend === 'up'
                      ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                      : 'border-rose-100 bg-rose-50 text-rose-600'
                  )}
                >
                  {m.sub}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase leading-none tracking-[0.15em] text-slate-400">
                  {m.label}
                </span>
                <p className="text-sm font-bold uppercase tabular-nums leading-none tracking-tighter text-slate-900">
                  {m.val}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* --- RETAILER DEMAND SYNC --- */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card className="group rounded-xl border border-slate-100 bg-slate-50/30 p-4 shadow-sm transition-all hover:border-indigo-100">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-1.5 text-indigo-600 shadow-inner transition-transform group-hover:scale-105">
                  <RefreshCcw className="animate-spin-slow h-3.5 w-3.5" />
                </div>
                <h2 className="text-[10px] font-bold uppercase leading-none tracking-widest text-slate-900">
                  Retailer Inventory Sync
                </h2>
              </div>
              <Badge className="h-4 border border-rose-100 bg-rose-50 px-1.5 text-[7px] font-bold uppercase tracking-widest text-rose-600 shadow-sm">
                8 ALERT
              </Badge>
            </div>
            <div className="space-y-1.5">
              {[
                {
                  shop: 'PODIUM',
                  item: 'Graphite Parka',
                  stock: 2,
                  recommended: 20,
                  status: 'Critical',
                },
                {
                  shop: 'ЦУМ',
                  item: 'Tech Trousers',
                  stock: 5,
                  recommended: 50,
                  status: 'Warning',
                },
              ].map((alert, i) => (
                <div
                  key={i}
                  className="group/item flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition-all hover:border-indigo-100 hover:bg-slate-50"
                >
                  <div>
                    <p className="mb-1 text-[8px] font-bold uppercase leading-none tracking-widest text-indigo-500">
                      {alert.shop}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-tight text-slate-900 transition-colors group-hover/item:text-indigo-600">
                      {alert.item}
                    </p>
                  </div>
                  <Button className="h-6.5 rounded-lg bg-slate-900 px-3 text-[8px] font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-indigo-600">
                    Replenish (+{alert.recommended})
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="group rounded-xl border border-slate-100 bg-slate-50/30 p-4 shadow-sm transition-all hover:border-emerald-100">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-1.5 text-emerald-600 shadow-inner transition-transform group-hover:scale-105">
                  <Truck className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-[10px] font-bold uppercase leading-none tracking-widest text-slate-900">
                  Dropshipping Hub
                </h2>
              </div>
              <Badge className="h-4 border-none bg-emerald-600 px-1.5 text-[7px] font-bold uppercase tracking-widest text-white shadow-sm">
                LIVE FEED
              </Badge>
            </div>
            <div className="mb-3.5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-colors group-hover:border-emerald-100">
                <p className="mb-1 text-[8px] font-bold uppercase leading-none tracking-widest text-slate-400">
                  Active Orders
                </p>
                <p className="text-base font-bold uppercase tabular-nums leading-none tracking-tighter text-slate-900">
                  142
                </p>
                <p className="mt-1.5 text-[8px] font-bold uppercase leading-none tracking-widest text-emerald-600">
                  SLA: 99.8%
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-colors group-hover:border-emerald-100">
                <p className="mb-1 text-[8px] font-bold uppercase leading-none tracking-widest text-slate-400">
                  Revenue (24h)
                </p>
                <p className="text-base font-bold uppercase tabular-nums leading-none tracking-tighter text-slate-900">
                  4.2M ₽
                </p>
                <p className="mt-1.5 text-[8px] font-bold uppercase leading-none tracking-widest text-emerald-600">
                  +15% TREND
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="h-7 w-full rounded-lg border border-slate-200 bg-white text-[9px] font-bold uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
            >
              Manage Dropship Stock
            </Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="space-y-3 xl:col-span-9">
            {/* --- TOOLBAR --- */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
              <div className="flex items-center gap-1.5">
                <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode('table')}
                    className={cn(
                      'h-6.5 rounded-md px-3 text-[9px] font-bold uppercase transition-all',
                      viewMode === 'table'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-50'
                    )}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'h-6.5 rounded-md px-3 text-[9px] font-bold uppercase transition-all',
                      viewMode === 'grid'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-50'
                    )}
                  >
                    Grid
                  </button>
                </div>
                <div className="mx-0.5 h-4 w-[1px] bg-slate-200" />
                <div className="no-scrollbar flex max-w-[300px] overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm md:max-w-none">
                  {['all', 'in_stock', 'pre_order', 'out_of_stock'].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvailability(a as any)}
                      className={cn(
                        'h-6.5 whitespace-nowrap rounded-md px-2.5 text-[8px] font-bold uppercase transition-all',
                        availability === a
                          ? 'bg-slate-100 text-slate-900 shadow-inner'
                          : 'text-slate-400 hover:bg-slate-50'
                      )}
                    >
                      {a.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Поиск…"
                    className="h-7 w-32 rounded-lg border-slate-200 bg-white pl-8 text-[10px] font-bold uppercase tracking-tight shadow-sm focus:ring-1 focus:ring-indigo-500 md:w-44"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50"
                >
                  <Filter className="h-3 w-3 text-slate-400" />
                </Button>
              </div>
            </div>

            {/* --- INVENTORY TABLE --- */}
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:border-indigo-100/50">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="sticky left-0 z-10 h-9 w-[35%] bg-slate-50/50 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Product Detail
                    </th>
                    <th className="h-9 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      SKU
                    </th>
                    <th className="h-9 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Category
                    </th>
                    <th className="h-9 px-4 py-2 text-right text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Stock
                    </th>
                    <th className="h-9 px-4 py-2 text-right text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Wholesale
                    </th>
                    <th className="h-9 w-12 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="group h-12 transition-all hover:bg-slate-50/50">
                      <td className="sticky left-0 z-10 bg-white px-4 py-2 transition-colors group-hover:bg-slate-50">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200/50 bg-slate-50 shadow-inner transition-transform group-hover:scale-105">
                            <NextImage
                              src={product.images?.[0]?.url || 'https://picsum.photos/seed/p/200'}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-mono text-[10px] uppercase tabular-nums tracking-tighter text-slate-400">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant="outline"
                          className="h-4 rounded border-slate-200 bg-white px-1.5 text-[8px] font-bold uppercase tracking-widest text-slate-500 shadow-sm"
                        >
                          {product.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-bold tabular-nums text-slate-900">
                            {fmtNumber(Math.floor(Math.random() * 200))}
                          </span>
                          <span className="text-[7px] font-bold uppercase leading-none tracking-[0.2em] text-slate-400">
                            UNITS
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className="text-[11px] font-bold uppercase tabular-nums tracking-tighter text-slate-900">
                          {fmtMoney(product.price)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end opacity-0 transition-all group-hover:opacity-100">
                          <button className="flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-slate-400 transition-all hover:bg-slate-900 hover:text-white hover:shadow-md">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 opacity-60">
                  Displaying {filteredProducts.length} results
                </span>
                <div className="flex gap-1">
                  <button
                    className="h-6 rounded-md border border-slate-200 bg-white px-2.5 text-[8px] font-bold uppercase tracking-widest text-slate-400 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
                    disabled
                  >
                    PREV
                  </button>
                  <button className="h-6 rounded-md border border-slate-200 bg-white px-2.5 text-[8px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50">
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 xl:col-span-3">
            {/* --- REPLENISHMENT AI --- */}
            <Card className="group relative space-y-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 text-white shadow-lg">
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500 bg-indigo-600 text-white shadow-lg transition-transform group-hover:scale-105">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase leading-none tracking-[0.2em] text-indigo-300">
                      Inventory AI
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-tight">Co-Pilot Mode</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors group-hover:bg-white/10">
                    <p className="mb-1 text-[8px] font-bold uppercase leading-none tracking-widest text-indigo-400">
                      Replenish Alert
                    </p>
                    <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight text-slate-300">
                      "Parka Graphite selling 40% faster. Out of stock in 14 days."
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
                      <p className="mb-0.5 text-[7px] font-bold uppercase tracking-widest text-slate-500">
                        Health
                      </p>
                      <span className="text-[11px] font-bold uppercase tabular-nums tracking-tighter text-emerald-400">
                        94%
                      </span>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
                      <p className="mb-0.5 text-[7px] font-bold uppercase tracking-widest text-slate-500">
                        Velocity
                      </p>
                      <span className="text-[11px] font-bold uppercase tracking-tighter text-indigo-400">
                        High
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="mt-4 h-8 w-full rounded-lg bg-white text-[9px] font-bold uppercase tracking-widest text-slate-900 shadow-xl transition-all hover:bg-indigo-50 hover:text-indigo-600">
                  Generate Order
                </Button>
              </div>
              <Sparkles className="absolute -right-6 -top-4 h-24 w-24 text-indigo-600 opacity-10 transition-all duration-700 group-hover:scale-110 group-hover:opacity-20" />
            </Card>

            {/* --- PRODUCTION UPDATES --- */}
            <Card className="group space-y-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700">
                  <Layers className="h-3.5 w-3.5 text-indigo-600" /> Pipeline
                </h3>
                <Badge
                  variant="outline"
                  className="h-3.5 rounded border-emerald-100 bg-emerald-50 px-1.5 text-[7px] font-bold tracking-widest text-emerald-600 shadow-sm"
                >
                  ACTIVE
                </Badge>
              </div>

              <div className="space-y-3.5">
                {[
                  { stage: 'CUTTING', style: 'Graphite Parka', prog: 85, status: 'On Track' },
                  { stage: 'SEWING', style: 'Tech Trousers', prog: 42, status: 'Delayed' },
                  { stage: 'QC', style: 'Silk Scarf', prog: 100, status: 'Finished' },
                ].map((step, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9px] font-bold uppercase leading-none tracking-tight text-slate-900">
                        {step.style}
                      </span>
                      <span
                        className={cn(
                          'flex h-3.5 items-center rounded px-1 text-[7px] font-bold uppercase tracking-widest',
                          step.status === 'Delayed'
                            ? 'bg-rose-50 text-rose-500'
                            : step.status === 'Finished'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-indigo-50 text-indigo-600'
                        )}
                      >
                        {step.status}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full border border-slate-200/30 bg-slate-100 shadow-inner">
                      <div
                        className={cn(
                          'h-full transition-all duration-1000',
                          step.status === 'Delayed'
                            ? 'bg-rose-500'
                            : step.status === 'Finished'
                              ? 'bg-emerald-500'
                              : 'bg-indigo-500'
                        )}
                        style={{ width: `${step.prog}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] font-bold uppercase leading-none tracking-widest text-slate-400">
                        {step.stage}
                      </span>
                      <span className="text-[9px] font-bold tabular-nums tracking-tighter text-slate-500">
                        {step.prog}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[9px] font-bold uppercase tracking-widest text-slate-400 shadow-sm transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
              >
                Production View <ChevronRight className="h-3 w-3" />
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {promotionProduct && (
        <PromotionDialog
          product={promotionProduct}
          isOpen={!!promotionProduct}
          onOpenChange={(open) => {
            if (!open) setPromotionProduct(null);
          }}
        />
      )}
    </div>
  );
}
