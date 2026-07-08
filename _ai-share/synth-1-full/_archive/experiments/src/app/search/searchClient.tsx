'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Download,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  ArrowRight,
  Maximize2,
  X,
  Package,
  BarChart3,
  TrendingUp,
  RefreshCcw,
  PlusCircle,
  MoreHorizontal,
  Heart,
  ShoppingBag,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchFilters } from '@/components/search/SearchFilters';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useUIState } from '@/providers/ui-state';
import { SynthaProductCard } from '@/components/syntha-product-card';

type Result = {
  items: any[];
  total: number;
  facets: {
    brands: { value: string; count: number }[];
    categories: { value: string; count: number }[];
  };
};

export default function SearchPageClient({
  initial,
}: {
  initial: {
    q: string;
    brand: string;
    category: string;
    sort: string;
    priceMin?: number;
    priceMax?: number;
  };
}) {
  const router = useRouter();
  const [params, setParams] = React.useState(initial);
  const [data, setData] = React.useState<Result | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
  const [searchViewMode, setSearchViewMode] = React.useState<'products' | 'looks'>('products');
  const [selectedLook, setSelectedLook] = React.useState<any>(null);
  const [isLookDetailsOpen, setIsLookDetailsOpen] = React.useState(false);

  const { wishlist, addWishlistItem, removeWishlistItem, addCartItem, globalCategory } =
    useUIState();

  async function load(next = params) {
    setLoading(true);
    const usp = new URLSearchParams();
    usp.set('q', next.q);
    if (next.brand) usp.set('brand', next.brand);

    // Merge globalCategory with manual category selection
    if (globalCategory !== 'all') {
      usp.set('gender', globalCategory);
    }

    if (next.category) usp.set('category', next.category);
    if (next.sort) usp.set('sort', next.sort);
    if (typeof next.priceMin === 'number') usp.set('priceMin', String(next.priceMin));
    if (typeof next.priceMax === 'number') usp.set('priceMax', String(next.priceMax));

    try {
      const res = await fetch(`/api/search/query?${usp.toString()}`);
      const json = (await res.json()) as Result;
      setData(json);
    } catch (error) {
      console.error('Failed to load search results', error);
    } finally {
      setLoading(false);
    }

    router.replace(`/search?${usp.toString()}`);
  }

  React.useEffect(() => {
    load(params);
    // eslint-disable-next-line
  }, [
    params.brand,
    params.category,
    params.sort,
    params.priceMin,
    params.priceMax,
    globalCategory,
  ]);

  return (
    <div className="min-h-screen bg-white pb-20 font-sans text-slate-900">
      {/* --- TOP STRATEGIC BAR (Inventory Style) --- */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/50 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-900">
              Showroom Matrix
            </h1>
            <div className="h-4 w-[1px] bg-slate-300" />

            {/* View Mode Toggle (Products/Looks) */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
              <button
                onClick={() => setSearchViewMode('products')}
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  searchViewMode === 'products'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <Package className="h-3 w-3" />
                Товары
              </button>
              <button
                onClick={() => setSearchViewMode('looks')}
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  searchViewMode === 'looks'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <Sparkles className="h-3 w-3" />
                Образы
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-300" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {searchViewMode === 'products' ? 'Total Items:' : 'Total Looks:'}
                </span>
                <span className="text-[10px] font-black text-slate-900">
                  {searchViewMode === 'products' ? (data?.total ?? 0) : 6}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Статус рынка:
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  Активен FW26
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded border border-slate-200 bg-white p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-8 rounded-sm px-5 text-[10px] font-black uppercase transition-all',
                  viewMode === 'grid'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-50'
                )}
              >
                Сетка
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'h-8 rounded-sm px-5 text-[10px] font-black uppercase transition-all',
                  viewMode === 'table'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-50'
                )}
              >
                Таблица
              </button>
            </div>
            <div className="mx-2 h-4 w-[1px] bg-slate-300" />
            <Button variant="joor" className="h-10 border-2 px-6">
              <Download className="mr-2 h-3.5 w-3.5" /> Экспорт PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] space-y-10 px-8 py-10">
        {/* ANALYTICAL OVERVIEW (Inventory Style) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {[
            { label: 'Глобальный спрос', val: '84.2%', sub: 'Рост', trend: 'up', icon: BarChart3 },
            {
              label: 'Цепочка поставок',
              val: 'Стабильно',
              sub: '98% поток',
              trend: 'up',
              icon: RefreshCcw,
            },
            { label: 'Индекс цен', val: '+2.1%', sub: 'Инфляция', trend: 'up', icon: TrendingUp },
            {
              label: 'Доступные модели',
              val: data?.total || '0',
              sub: 'По брендам',
              trend: 'up',
              icon: Package,
            },
          ].map((m, i) => (
            <div
              key={i}
              className="group flex cursor-default flex-col justify-between rounded-none border border-slate-200 bg-white p-4 shadow-[2px_2px_0px_rgba(0,0,0,0.02)] transition-colors hover:border-slate-400"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {m.label}
                </span>
                <m.icon className="h-4 w-4 text-slate-200 transition-colors group-hover:text-slate-900" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-black tracking-tight text-slate-900">{m.val}</span>
                <span className="text-[10px] font-bold uppercase text-emerald-600">{m.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* LEFT FILTER SIDEBAR */}
          <div className="lg:col-span-3">
            <SearchFilters
              params={params}
              facets={data?.facets}
              loading={loading}
              onChange={(p) => setParams(p)}
            />
          </div>

          {/* RIGHT PRODUCT GRID/TABLE */}
          <div className="space-y-4 lg:col-span-9">
            {loading ? (
              <div className="grid animate-pulse grid-cols-1 gap-3 opacity-50 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] border border-slate-100 bg-slate-50" />
                ))}
              </div>
            ) : searchViewMode === 'products' ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {(data?.items ?? []).map((p) => (
                    <SynthaProductCard key={p.id} product={p as any} />
                  ))}
                </div>
              ) : (
                /* TABLE VIEW (Inventory Style) */
                <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="w-[40%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Товар
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Бренд
                        </th>
                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Опт
                        </th>
                        <th className="w-24 px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.items ?? []).map((p) => (
                        <tr key={p.id} className="group transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-slate-100 bg-[#fcfcfc] p-1">
                                <img
                                  src={p.image}
                                  alt=""
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-tight text-slate-900">
                                  {p.title}
                                </p>
                                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                  {p.category}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                              {p.brand}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black tabular-nums text-slate-900">
                              {Number(p.price).toLocaleString('ru-RU')} ₽
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="inline-flex h-8 w-8 items-center justify-center border border-transparent transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white">
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* LOOKS VIEW */
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {[
                    {
                      id: 'look-1',
                      title: 'Gorpcore City',
                      author: 'Syntha Lab',
                      type: 'expert',
                      price: 85000,
                      originalPrice: 112000,
                      bonus: 2500,
                      items: 4,
                      timeLeft: '12:45:08',
                      imageUrl:
                        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800',
                      gallery: [
                        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200',
                        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200',
                      ],
                      products: [
                        {
                          id: 'p1',
                          name: 'Технологичный анорак',
                          price: 42000,
                          brand: 'Syntha Lab',
                          image:
                            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
                        },
                        {
                          id: 'p2',
                          name: 'Брюки-карго',
                          price: 28000,
                          brand: 'Syntha Lab',
                          image: 'https://images.unsplash.com/photo-1552970571-c41c44b8882c?w=400',
                        },
                      ],
                    },
                    {
                      id: 'look-2',
                      title: 'Minimalist Winter',
                      author: 'Nordic Wool',
                      type: 'brand',
                      price: 145000,
                      originalPrice: 180000,
                      bonus: 5000,
                      items: 3,
                      timeLeft: '05:20:12',
                      imageUrl:
                        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800',
                      gallery: [
                        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1200',
                      ],
                      products: [
                        {
                          id: 'p5',
                          name: 'Пальто из кашемира',
                          price: 95000,
                          brand: 'Nordic Wool',
                          image:
                            'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
                        },
                      ],
                    },
                    {
                      id: 'look-3',
                      title: 'Cyberpunk Era',
                      author: 'SYNTHA AI',
                      type: 'platform',
                      price: 98000,
                      originalPrice: 130000,
                      bonus: 4000,
                      items: 5,
                      timeLeft: '24:00:00',
                      imageUrl:
                        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800',
                      gallery: [
                        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1200',
                      ],
                      products: [],
                    },
                    {
                      id: 'look-4',
                      title: 'Ecological Future',
                      author: 'Nordic Wool',
                      type: 'brand',
                      price: 55000,
                      originalPrice: 75000,
                      bonus: 1500,
                      items: 3,
                      timeLeft: '48:15:30',
                      imageUrl:
                        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800',
                      gallery: [
                        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200',
                      ],
                      products: [],
                    },
                    {
                      id: 'look-5',
                      title: 'Утро в городе',
                      author: 'Marie L.',
                      type: 'expert',
                      price: 112000,
                      originalPrice: 150000,
                      bonus: 3200,
                      items: 4,
                      timeLeft: '08:30:00',
                      imageUrl:
                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800',
                      gallery: [
                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200',
                      ],
                      products: [],
                    },
                    {
                      id: 'look-6',
                      title: 'Tech Noir',
                      author: 'Syntha Lab',
                      type: 'expert',
                      price: 72000,
                      originalPrice: 95000,
                      bonus: 2100,
                      items: 3,
                      timeLeft: '15:20:00',
                      imageUrl:
                        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800',
                      gallery: [
                        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200',
                      ],
                      products: [],
                    },
                  ]
                    .filter(
                      (l) =>
                        !params.brand || l.author.toLowerCase().includes(params.brand.toLowerCase())
                    )
                    .map((look) => (
                      <motion.div
                        key={look.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="group/look-card cursor-pointer"
                        onClick={() => {
                          setSelectedLook(look);
                          setIsLookDetailsOpen(true);
                        }}
                      >
                        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm transition-all duration-500 hover:border-slate-900 hover:shadow-xl">
                          <div className="relative aspect-[3/4] overflow-hidden">
                            <Image
                              src={look.imageUrl}
                              alt={look.title}
                              fill
                              className="object-cover transition-transform duration-1000 group-hover/look-card:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
                              <Badge
                                className={cn(
                                  'rounded-md border-none px-1.5 py-0.5 text-[7px] font-black tracking-widest',
                                  look.type === 'expert'
                                    ? 'bg-amber-500 text-white'
                                    : look.type === 'brand'
                                      ? 'bg-indigo-600 text-white'
                                      : look.type === 'platform'
                                        ? 'bg-black text-white'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                )}
                              >
                                {look.type.toUpperCase()} LOOK
                              </Badge>
                              <div className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/90 px-2 py-1 backdrop-blur-md">
                                <div className="h-1 w-1 animate-pulse rounded-full bg-rose-500" />
                                <span className="text-[8px] font-black text-slate-900">
                                  {look.timeLeft}
                                </span>
                              </div>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 space-y-2">
                              <div>
                                <p className="mb-1 text-[8px] font-black uppercase leading-none tracking-widest text-white/60">
                                  {look.author}
                                </p>
                                <h4 className="text-sm font-black uppercase leading-tight tracking-tighter text-white">
                                  {look.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                                  {look.items} ВЕЩЕЙ
                                </span>
                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">
                                  В НАЛИЧИИ
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-end justify-between border-t border-slate-50 bg-white p-4">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 line-through">
                                {look.originalPrice.toLocaleString('ru-RU')}₽
                              </p>
                              <div className="flex items-baseline gap-1.5">
                                <p className="text-base font-black leading-none tracking-tighter text-slate-900">
                                  {look.price.toLocaleString('ru-RU')}₽
                                </p>
                                <span className="text-[8px] font-black text-emerald-600">
                                  -{Math.round((1 - look.price / look.originalPrice) * 100)}%
                                </span>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-xl bg-slate-50 transition-all hover:bg-slate-900 hover:text-white"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            )}

            {(!data?.items || data?.items.length === 0) && !loading && (
              <div className="space-y-4 border border-dashed border-slate-100 bg-slate-50/50 py-40 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-white shadow-xl">
                  <Search className="h-8 w-8 text-slate-200" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    Ничего не найдено
                  </h4>
                  <p className="mx-auto max-w-xs text-[11px] font-medium uppercase leading-loose tracking-widest text-slate-400">
                    Попробуйте изменить параметры фильтрации или поисковый запрос.
                  </p>
                  <Button
                    variant="joor"
                    className="mt-6 border-2"
                    onClick={() => {
                      const next = { q: '', brand: '', category: '', sort: 'relevance' };
                      setParams(next);
                      load(next);
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Look Details Dialog */}
      <Dialog open={isLookDetailsOpen} onOpenChange={setIsLookDetailsOpen}>
        <DialogContent className="max-h-[90vh] w-[1200px] max-w-[95vw] overflow-hidden rounded-xl border-none bg-white p-0 shadow-2xl">
          {selectedLook && (
            <div className="flex h-full flex-col overflow-hidden md:flex-row">
              {/* Left: Gallery Section */}
              <div className="group relative h-[400px] bg-slate-50 md:h-auto md:w-1/2">
                <Carousel className="h-full w-full">
                  <CarouselContent className="h-full">
                    {(selectedLook.gallery || [selectedLook.imageUrl]).map(
                      (img: string, i: number) => (
                        <CarouselItem key={i} className="h-full">
                          <div className="relative aspect-[4/5] h-full min-h-[400px] w-full md:aspect-auto md:min-h-[800px]">
                            <Image
                              src={img}
                              alt={`Gallery ${i}`}
                              fill
                              className="object-cover"
                              priority
                            />
                          </div>
                        </CarouselItem>
                      )
                    )}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 border-none bg-white/20 text-white transition-all hover:bg-white hover:text-black" />
                  <CarouselNext className="right-4 border-none bg-white/20 text-white transition-all hover:bg-white hover:text-black" />
                </Carousel>

                {/* Branding Badge Overlay */}
                <div className="absolute left-6 top-4 z-10 flex flex-col gap-2">
                  <Badge className="rounded-xl border-none bg-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
                    {selectedLook.type.toUpperCase()} PREVIEW
                  </Badge>
                </div>
              </div>

              {/* Right: Look Info Section */}
              <div className="relative flex h-full flex-col bg-white md:w-1/2">
                <div className="max-h-[90vh] space-y-10 overflow-y-auto p-4 md:p-4">
                  {/* Header */}
                  <div className="relative space-y-4 border-b border-slate-100 pb-10">
                    <div className="space-y-1">
                      <p className="mb-2 text-[11px] font-black uppercase leading-none tracking-[0.3em] text-indigo-600">
                        {selectedLook.author}
                      </p>
                      <DialogTitle className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
                        {selectedLook.title}
                      </DialogTitle>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          BUNDLE_PRICE
                        </span>
                        <div className="flex items-baseline gap-3">
                          <span className="text-sm font-black leading-none tracking-tighter text-slate-900">
                            {selectedLook.price.toLocaleString('ru-RU')}₽
                          </span>
                          <span className="text-sm font-black tracking-tighter text-slate-300 line-through">
                            {selectedLook.originalPrice.toLocaleString('ru-RU')}₽
                          </span>
                        </div>
                      </div>
                      <Badge className="flex h-10 items-center justify-center rounded-2xl border-none bg-emerald-500 px-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20">
                        -{Math.round((1 - selectedLook.price / selectedLook.originalPrice) * 100)}%
                        ВЫГОДА
                      </Badge>
                    </div>
                  </div>

                  {/* Composition Matrix */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        <LayoutGrid className="h-4 w-4 text-indigo-600" /> СОСТАВ ОБРАЗА (
                        {selectedLook.items})
                      </h4>
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Sparkles className="h-3 w-3 fill-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-widest">
                          +{selectedLook.bonus} BONUSES
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {(selectedLook.products || []).map((product: any) => (
                        <div
                          key={product.id}
                          className="group/item flex items-center gap-3 rounded-3xl border border-transparent bg-slate-50 p-4 transition-all duration-500 hover:border-white/10 hover:bg-slate-900"
                        >
                          <div className="relative h-20 w-12 shrink-0 overflow-hidden rounded-xl shadow-md">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[9px] font-black uppercase leading-none tracking-widest text-indigo-600 group-hover/item:text-indigo-400">
                              {product.brand}
                            </p>
                            <h5 className="truncate text-sm font-black uppercase leading-tight tracking-tight text-slate-900 group-hover/item:text-white">
                              {product.name}
                            </h5>
                            <div className="mt-2 flex gap-2">
                              <Badge
                                variant="outline"
                                className="border-slate-200 bg-white text-[8px] font-black uppercase text-slate-500 group-hover/item:border-white/20 group-hover/item:bg-white/10 group-hover/item:text-white/60"
                              >
                                S, M, L, XL
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-slate-200 bg-white text-[8px] font-black uppercase text-slate-500 group-hover/item:border-white/20 group-hover/item:bg-white/10 group-hover/item:text-white/60"
                              >
                                Black
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-right">
                            <p className="text-base font-black leading-none tracking-tighter text-slate-900 group-hover/item:text-white">
                              {product.price.toLocaleString('ru-RU')}₽
                            </p>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-xl bg-white text-slate-400 shadow-sm transition-all hover:bg-black hover:text-white group-hover/item:bg-white/20 group-hover/item:text-white"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4 pt-6">
                    <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-indigo-100/50 bg-indigo-50 p-4 md:flex-row">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                          Global Rewards Active
                        </p>
                        <p className="text-[11px] font-medium text-indigo-900/60">
                          Бесплатная доставка + 2 года гарантии на компоненты.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900">
                          SYNTHA_SECURE_PAY
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button className="button-glimmer button-professional !h-12 flex-1 !rounded-3xl shadow-2xl">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        КУПИТЬ ВЕСЬ ОБРАЗ ({selectedLook.price.toLocaleString('ru-RU')}₽)
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 w-12 shrink-0 rounded-3xl border-slate-200 transition-all hover:border-slate-900 hover:bg-white"
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
