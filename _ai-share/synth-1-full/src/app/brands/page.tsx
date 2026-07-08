'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import BrandCard from '@/components/brand-card';
import BrandListItem from '@/components/brand-list-item';
import { brands } from '@/lib/placeholder-data';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Globe,
  ShieldCheck,
  Activity,
  Brain,
  Target,
  Sparkles,
  TrendingUp,
  Zap,
  MousePointer2,
  Layers,
  Info,
  X,
  Store,
  Check,
  Heart,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { segments as bpiSegments } from '@/lib/bpi-matrix-data';
import { useUIState } from '@/providers/ui-state';
import allProductsData from '@/lib/products';
import { PartnershipDialog } from '@/components/brand/PartnershipDialog';
import { AnalysisDialog } from '@/components/brand/AnalysisDialog';
import { B2BPartnershipDiscovery } from '@/components/brand/partnership-discovery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function BrandsPage() {
  const {
    followedBrands: globalFollowed = [],
    favoriteBrands: globalFavorites = [],
    partnershipRequests = {},
    toggleFollowBrand,
    toggleFavoriteBrand,
    sendPartnershipRequest,
    viewRole,
    setViewRole,
  } = useUIState();
  const pathname = usePathname() ?? '';
  const platformCorePartnersSlim = pathname.startsWith('/platform/b2b/partners');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [activeFilterGroup, setActiveFilterGroup] = useState<string | null>(null);
  const [activeSegments, setActiveSegments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSegmentDirectory, setShowSegmentDirectory] = useState(false);
  const [showBrandSelector, setShowBrandSelector] = useState(false);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [activeGlobalFilter, setActiveGlobalFilter] = useState<'all' | 'followed' | 'favorites'>(
    'all'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('Все');
  const [products, setProducts] = useState<Product[]>(allProductsData);
  const [displaySettings, setDisplaySettings] = useState<any>(null);
  const [partnershipBrand, setPartnershipBrand] = useState<{ id: string; name: string } | null>(
    null
  );
  const [analysisBrand, setAnalysisBrand] = useState<{ id: string; name: string } | null>(null);

  const segmentStats = useMemo(() => {
    const stats: Record<string, number> = {};
    brands.forEach((brand) => {
      if (brand.segment) {
        stats[brand.segment] = (stats[brand.segment] || 0) + 1;
      }
    });
    return stats;
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          fetch('/data/products.json'),
          fetch('/data/brand-display-data.json'),
        ]);
        const productsData = (await productsRes.json()) as Product[];
        setProducts(productsData);

        const settingsData = (await settingsRes.json()) as {
          parameters?: Array<{ items?: Array<{ id: string; grid?: boolean; list?: boolean }> }>;
        };
        const initialSettings: Record<string, Record<string, boolean>> = { grid: {}, list: {} };
        settingsData.parameters?.forEach((group) => {
          group.items?.forEach((item) => {
            initialSettings.grid[item.id] = !!item.grid;
            initialSettings.list[item.id] = !!item.list;
          });
        });
        setDisplaySettings(initialSettings);
      } catch (error) {
        console.error('Failed to fetch data for brands page:', error);
      }
    }
    fetchData();
  }, []);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const russianAlphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
  const numbers = '0123456789'.split('');

  const filterGroups = {
    '0-9': numbers,
    'A-Z': alphabet,
    'А-Я': russianAlphabet,
  };

  const handleFilterClick = (letter: string) => {
    setActiveLetter((prev) => (prev === letter ? null : letter));
  };

  const handleGroupClick = (group: string) => {
    setActiveFilterGroup((prev) => (prev === group ? null : group));
    setActiveLetter(null);
  };

  const handlePartnershipClick = (brandId: string, brandName: string) => {
    setPartnershipBrand({ id: brandId, name: brandName });
  };

  const handleAnalysisClick = (brandId: string, brandName: string) => {
    setAnalysisBrand({ id: brandId, name: brandName });
  };

  const filteredBrands = useMemo(() => {
    let result = brands;

    // Category filtering
    if (categoryFilter !== 'Все') {
      const brandsWithCategoryProducts = result.filter((brand) => {
        const brandProducts = products.filter((p) => p.brand === brand.name);
        return brandProducts.some((p) => {
          if (categoryFilter === 'Женщинам') return p.gender === 'women' || p.gender === 'unisex';
          if (categoryFilter === 'Мужчинам') return p.gender === 'men' || p.gender === 'unisex';
          if (categoryFilter === 'Детям') return p.gender === 'kids' || p.category === 'Детям';
          if (categoryFilter === 'Beauty')
            return p.category === 'Beauty' || p.category === 'Красота';
          if (categoryFilter === 'Home') return p.category === 'Home' || p.category === 'Дом';
          return false;
        });
      });
      result = brandsWithCategoryProducts;
    }

    if (searchQuery) {
      result = result.filter(
        (brand) =>
          brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          brand.nameRU?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeLetter) {
      result = result.filter((brand) => {
        const nameToTest = brand.name;
        return (
          nameToTest.toUpperCase().startsWith(activeLetter) ||
          (!isNaN(parseInt(activeLetter, 10)) && nameToTest.startsWith(activeLetter))
        );
      });
    }

    if (activeSegments.length > 0) {
      result = result.filter((brand) => brand.segment && activeSegments.includes(brand.segment));
    }

    if (selectedBrandIds.length > 0) {
      result = result.filter((brand) => selectedBrandIds.includes(brand.id));
    }

    if (activeGlobalFilter === 'followed') {
      if (viewRole === 'b2b') {
        result = result.filter((brand) => partnershipRequests[brand.id] === 'accepted');
      } else {
        result = result.filter((brand) => globalFollowed.includes(brand.id));
      }
    } else if (activeGlobalFilter === 'favorites') {
      result = result.filter((brand) => globalFavorites.includes(brand.id));
    }

    return [...result].sort((a, b) => {
      const aFollowed =
        viewRole === 'b2b'
          ? partnershipRequests?.[a.id] === 'accepted'
          : globalFollowed?.includes(a.id);
      const bFollowed =
        viewRole === 'b2b'
          ? partnershipRequests?.[b.id] === 'accepted'
          : globalFollowed?.includes(b.id);
      if (aFollowed && !bFollowed) return -1;
      if (!aFollowed && bFollowed) return 1;

      const aFavorite = globalFavorites?.includes(a.id);
      const bFavorite = globalFavorites?.includes(b.id);
      if (aFavorite && !bFavorite) return -1;
      if (!aFavorite && bFavorite) return 1;

      return 0;
    });
  }, [
    activeLetter,
    searchQuery,
    activeSegments,
    selectedBrandIds,
    activeGlobalFilter,
    globalFollowed,
    globalFavorites,
    brands,
    partnershipRequests,
    viewRole,
    categoryFilter,
    products,
  ]);

  return (
    <div
      className={cn(
        'group/section relative',
        platformCorePartnersSlim
          ? 'min-h-0 bg-transparent'
          : 'bg-bg-canvas min-h-screen overflow-hidden'
      )}
      data-testid={platformCorePartnersSlim ? 'platform-core-b2b-partners-directory' : undefined}
    >
      {!platformCorePartnersSlim ? (
        <>
          {/* OS Background Elements */}
          <div className="os-grid-bg pointer-events-none absolute inset-0 opacity-40" />
          <div className="os-calibration-grid pointer-events-none absolute inset-0 opacity-[0.03]" />

          {/* System Pulse Ticker - Unified */}
          <div className="relative z-50 flex h-8 items-center overflow-hidden border-b border-white/10 bg-black text-white">
            <div className="flex h-full shrink-0 items-center gap-3 border-r border-white/20 bg-black px-6">
              <Activity className="text-accent-primary h-3 w-3 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">
                ПУЛЬС
              </span>
            </div>
            <div className="relative flex h-full flex-1 items-center overflow-hidden">
              <div className="animate-pulse-marquee flex w-max flex-row items-center gap-3 whitespace-nowrap">
                {[
                  'ЛОГ: Nordic Wool обновили оптовый каталог (Осень-Зима 26)',
                  "AI_STRATEGY: Высокий спрос на 'Activewear' в B2B сегменте (+12.4%)",
                  'СИСТЕМА: Обработано 5 новых запросов на партнерство',
                  'MARKET: 92% положительных откликов на новый индекс BPI',
                  'АНАЛИТИКА: Рост сегмента Contemporary составил +14.2%',
                  'RETAIL: Топовый хаб активности: Moscow_North',
                  'ОС_ОБНОВЛЕНИЕ: Алгоритм мэтчинга оптимизирован до v4.2',
                  'B2B_LOG: Nordic Wool подтвердили участие в осенней сессии заказов',
                ].map((msg, i) => (
                  <div key={i} className="flex shrink-0 items-center gap-3">
                    <div className="bg-accent-primary h-1 w-1 rounded-full" />
                    <span className="font-mono text-[10px] uppercase tracking-tighter text-white/70">
                      {msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {!platformCorePartnersSlim ? (
        <>
          {/* Decorative OS elements */}
          <div className="os-side-tab group-hover/section:opacity-20">DIRECTORY_BRANDS</div>
          <div className="os-kernel-overlay flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity className="text-state-success h-3 w-3" />
              <span className="text-text-muted font-mono text-[8px]">LINK_STATUS: STABLE</span>
            </div>
            <div className="os-hex-chip">0xBRND</div>
          </div>
        </>
      ) : null}

      <div
        className={cn(
          'container relative z-10 max-w-[1600px] space-y-6',
          platformCorePartnersSlim ? 'px-4 py-4' : 'py-12'
        )}
      >
        {viewRole === 'b2b' && !platformCorePartnersSlim ? <B2BPartnershipDiscovery /> : null}

        {/* Header Section */}
        <div className="border-border-default flex flex-col gap-3 border-b pb-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-text-primary group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
                <Store className="relative z-10 h-5 w-5 text-white" />
                <div className="from-accent-primary to-accent-hover absolute inset-0 bg-gradient-to-tr opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              {!platformCorePartnersSlim ? (
                <Badge
                  variant="outline"
                  className="border-border-strong bg-bg-surface/50 text-text-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                >
                  {viewRole === 'b2b' ? 'Партнёры' : 'Бренды'}
                </Badge>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <h1 className="text-text-primary font-headline text-sm font-black uppercase tracking-tight md:text-sm">
                  {viewRole === 'b2b' ? 'ПАРТНЕРЫ' : 'БРЕНДЫ'}
                </h1>
              </div>
              <p className="text-text-secondary max-w-2xl text-sm font-light">
                Глобальная экосистема авторизованных партнеров.
              </p>
            </div>
          </div>

          <div className="flex min-w-[320px] flex-col gap-3">
            <div className="relative">
              <Search className="text-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Поиск по названию или ID..."
                className="bg-bg-surface border-border-strong focus:ring-accent-primary/20 h-11 pl-10 font-mono text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-text-muted font-mono text-[10px] uppercase tracking-tighter">
                Отобрано: {filteredBrands.length} / {brands.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 rounded-md transition-all',
                    viewMode === 'grid'
                      ? 'bg-bg-surface border-border-default border shadow-sm'
                      : 'opacity-40'
                  )}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 rounded-md transition-all',
                    viewMode === 'list'
                      ? 'bg-bg-surface border-border-default border shadow-sm'
                      : 'opacity-40'
                  )}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Selector */}
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 px-4">
          {['Все', 'Женщинам', 'Мужчинам', 'Детям', 'Beauty', 'Home'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'group flex min-w-[120px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-2 py-2.5 text-[8px] font-black uppercase tracking-tighter transition-all',
                categoryFilter === cat
                  ? 'button-glimmer border-black bg-black text-white shadow-lg'
                  : 'text-text-muted hover:text-text-secondary border-border-default bg-white'
              )}
            >
              <span className="truncate">{cat}</span>
            </button>
          ))}
        </div>

        {/* Filter Navigation */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary View Filters */}
              <div className="bg-bg-surface2/50 border-border-subtle flex w-fit items-center gap-1 rounded-xl border p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 rounded-lg px-4 font-mono text-[9px] uppercase tracking-widest transition-all',
                    activeGlobalFilter === 'all'
                      ? 'bg-bg-surface text-text-primary border-border-default border shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                  onClick={() => setActiveGlobalFilter('all')}
                >
                  Все
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'flex h-8 items-center gap-2 rounded-lg px-4 font-mono text-[9px] uppercase tracking-widest transition-all',
                    activeGlobalFilter === 'followed'
                      ? 'bg-bg-surface text-text-primary border-border-default border shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                  onClick={() => setActiveGlobalFilter('followed')}
                >
                  <Check className="h-3 w-3" />
                  {viewRole === 'b2b' ? 'Партнеры' : 'Подписки'}
                  {viewRole === 'b2b'
                    ? Object.values(partnershipRequests).filter((s) => s === 'accepted').length >
                        0 && (
                        <span className="ml-1 text-[8px] opacity-60">
                          (
                          {
                            Object.values(partnershipRequests).filter((s) => s === 'accepted')
                              .length
                          }
                          )
                        </span>
                      )
                    : globalFollowed.length > 0 && (
                        <span className="ml-1 text-[8px] opacity-60">
                          ({globalFollowed.length})
                        </span>
                      )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'flex h-8 items-center gap-2 rounded-lg px-4 font-mono text-[9px] uppercase tracking-widest transition-all',
                    activeGlobalFilter === 'favorites'
                      ? 'bg-bg-surface text-text-primary border-border-default border shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                  onClick={() => setActiveGlobalFilter('favorites')}
                >
                  <Heart className="h-3 w-3" />
                  Избранное
                  {globalFavorites.length > 0 && (
                    <span className="ml-1 text-[8px] opacity-60">({globalFavorites.length})</span>
                  )}
                </Button>
              </div>

              {/* Brand Selection Toggle */}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-10 gap-2 rounded-xl px-4 font-mono text-[10px] uppercase tracking-tighter',
                  selectedBrandIds.length > 0
                    ? 'border-accent-primary text-accent-primary bg-accent-soft'
                    : 'border-border-strong hover:bg-bg-surface2'
                )}
                onClick={() => setShowBrandSelector(true)}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                {selectedBrandIds.length > 0
                  ? `Выбрано: ${selectedBrandIds.length}`
                  : 'Выбор брендов'}
              </Button>

              {selectedBrandIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-muted hover:text-state-error h-8 w-8"
                  onClick={() => setSelectedBrandIds([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Segment Directory Toggle */}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-10 gap-2 rounded-xl px-4 font-mono text-[10px] uppercase tracking-tighter',
                  activeSegments.length > 0
                    ? 'border-accent-primary text-accent-primary bg-accent-soft'
                    : 'border-border-strong hover:bg-bg-surface2'
                )}
                onClick={() => setShowSegmentDirectory(true)}
              >
                <Layers className="h-3.5 w-3.5" />
                {activeSegments.length > 0
                  ? `Сегменты: ${activeSegments.length}`
                  : 'Справочник сегментов'}
              </Button>

              {activeSegments.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-muted hover:text-state-error h-8 w-8"
                  onClick={() => setActiveSegments([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Alphabetical Filter Row */}
            <div className="scrollbar-none flex items-center gap-3 overflow-x-auto pb-1">
              <div className="bg-bg-surface2 border-border-subtle flex items-center gap-2 rounded-lg border px-3 py-1.5">
                <Filter className="text-text-muted h-3 w-3" />
                <span className="text-text-secondary whitespace-nowrap font-mono text-[10px] font-bold uppercase">
                  АЛФАВИТ
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Object.keys(filterGroups).map((groupName) => (
                  <button
                    key={groupName}
                    onClick={() => handleGroupClick(groupName)}
                    className={cn(
                      'shrink-0 rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase tracking-tighter transition-all',
                      activeFilterGroup === groupName
                        ? 'bg-text-primary text-text-inverse border-text-primary shadow-md'
                        : 'bg-bg-surface text-text-secondary border-border-strong hover:border-text-primary'
                    )}
                  >
                    {groupName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {activeFilterGroup && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-bg-surface/50 border-border-subtle flex flex-wrap gap-1.5 rounded-2xl border p-4 backdrop-blur-sm">
                  {filterGroups[activeFilterGroup as keyof typeof filterGroups].map((letter) => (
                    <button
                      key={letter}
                      onClick={() => handleFilterClick(letter)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[11px] transition-all',
                        activeLetter === letter
                          ? 'bg-accent-primary border-accent-primary text-white shadow-sm'
                          : 'bg-bg-surface text-text-muted border-border-subtle hover:border-border-strong hover:text-text-primary'
                      )}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content Area */}
        <div
          className={cn(
            'relative',
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              : 'flex flex-col gap-3'
          )}
        >
          {filteredBrands.map((brand, idx) => {
            const productCount = products.filter((p) => p.brand === brand.name).length;
            return (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group/card relative"
              >
                <div className="os-bracket-tl border-border-strong absolute -left-1 -top-1 h-3 w-3 border-l border-t opacity-0 transition-opacity group-hover/card:opacity-100" />
                <div className="os-bracket-tr border-border-strong absolute -right-1 -top-1 h-3 w-3 border-r border-t opacity-0 transition-opacity group-hover/card:opacity-100" />

                {viewMode === 'grid' ? (
                  <BrandCard
                    brand={brand}
                    productCount={productCount}
                    displaySettings={displaySettings?.grid}
                    viewRole={viewRole}
                    onRequestPartnership={handlePartnershipClick}
                    onAnalysisClick={handleAnalysisClick}
                  />
                ) : (
                  <BrandListItem
                    brand={brand}
                    productCount={productCount}
                    displaySettings={displaySettings?.list}
                    viewRole={viewRole}
                    onRequestPartnership={handlePartnershipClick}
                    onAnalysisClick={handleAnalysisClick}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* No Results Fallback */}
        {filteredBrands.length === 0 && (
          <div className="border-border-subtle bg-bg-surface/30 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-24">
            <div className="bg-bg-surface2 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Search className="text-text-muted h-8 w-8 opacity-20" />
            </div>
            <h3 className="text-text-primary font-headline text-base font-bold">
              Совпадений не найдено
            </h3>
            <p className="text-text-muted mt-2">
              Попробуйте изменить параметры поиска или фильтрации
            </p>
            <Button
              variant="outline"
              className="mt-6 h-9 font-mono text-[10px] uppercase tracking-widest"
              onClick={() => {
                setSearchQuery('');
                setActiveLetter(null);
                setActiveFilterGroup(null);
                setSelectedBrandIds([]);
                setActiveSegments([]);
                setCategoryFilter('Все');
              }}
            >
              Сбросить все фильтры
            </Button>
          </div>
        )}

        {/* Footer Metrics - Density Pattern */}
        <div className="border-border-subtle border-t pt-12">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Авторизованных брендов', value: brands.length, icon: ShieldCheck },
              { label: 'B2B Операций / 24ч', value: '1.2k', icon: Activity },
              { label: 'AI Анализ активен', value: '100%', icon: Brain },
              { label: 'Время отклика узла', value: '14ms', icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-text-muted flex items-center gap-2">
                  <stat.icon className="h-3 w-3" />
                  <span className="font-mono text-[10px] uppercase tracking-tight">
                    {stat.label}
                  </span>
                </div>
                <div className="text-text-primary tabular font-headline text-sm font-black">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segment Directory Dialog */}
      <Dialog open={showSegmentDirectory} onOpenChange={setShowSegmentDirectory}>
        <DialogContent className="bg-bg-surface border-border-strong w-[800px] max-w-[90vw] overflow-hidden rounded-3xl p-0">
          <DialogHeader className="bg-bg-surface2 border-border-subtle relative overflow-hidden border-b p-4">
            <div className="os-grid-bg pointer-events-none absolute inset-0 opacity-20" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="text-accent-primary h-5 w-5" />
                <Badge
                  variant="outline"
                  className="border-border-strong bg-white/50 font-mono text-[10px] uppercase tracking-widest"
                >
                  BPI_MATRIX_CLASSIFIER
                </Badge>
              </div>
              <DialogTitle className="text-text-primary font-headline text-base font-black uppercase tracking-tight">
                Справочник Сегментов
              </DialogTitle>
              <DialogDescription className="text-text-secondary text-sm font-light">
                Классификация брендов на основе матрицы BPI (Brand Performance Index). Выбрать можно
                несколько сегментов и каждый выбранный будет выделен зеленым. Если нажать повторно
                на сегмент, он становится обычного цвета и выбор снимается.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="custom-scrollbar bg-bg-canvas/30 max-h-[60vh] overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {bpiSegments.map((segment) => {
                const brandCount = segmentStats[segment.name] || 0;
                const isOccupied = brandCount > 0;
                const isSelected = activeSegments.includes(segment.name);
                return (
                  <button
                    key={segment.code}
                    disabled={!isOccupied}
                    onClick={() => {
                      if (!isOccupied) return;
                      setActiveSegments((prev) =>
                        prev.includes(segment.name)
                          ? prev.filter((s) => s !== segment.name)
                          : [...prev, segment.name]
                      );
                    }}
                    className={cn(
                      'group/seg relative flex flex-col rounded-2xl border p-4 text-left transition-all duration-300',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-100 shadow-lg shadow-emerald-500/10'
                        : isOccupied
                          ? 'bg-bg-surface border-border-subtle hover:border-accent-primary cursor-pointer hover:shadow-md'
                          : 'bg-bg-surface2/50 border-border-subtle/50 cursor-not-allowed opacity-40 grayscale'
                    )}
                  >
                    <div className="mb-2 flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'px-1.5 py-0 font-mono text-[9px]',
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                              : 'border-border-strong text-text-muted'
                          )}
                        >
                          {segment.code}
                        </Badge>
                        {!isOccupied ? (
                          <Badge
                            variant="outline"
                            className="bg-text-muted/5 text-text-muted/40 border-text-muted/10 px-1.5 py-0 text-[7px] font-black uppercase tracking-widest"
                          >
                            ПУСТО
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-lg border-none px-2 py-0.5 text-[7px] font-black uppercase tracking-widest',
                              isSelected
                                ? 'bg-emerald-500 text-white'
                                : 'bg-accent-primary/10 text-accent-primary'
                            )}
                          >
                            {brandCount}{' '}
                            {brandCount === 1 ? 'бренд' : brandCount < 5 ? 'бренда' : 'брендов'}
                          </Badge>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[8px] font-black uppercase tracking-widest',
                          isSelected
                            ? 'text-emerald-600'
                            : isOccupied
                              ? 'text-text-muted group-hover/seg:text-accent-primary'
                              : 'text-text-muted/40'
                        )}
                      >
                        {segment.group}
                      </span>
                    </div>
                    <h4
                      className={cn(
                        'mb-1 font-headline text-sm font-bold uppercase tracking-tight',
                        isSelected ? 'text-text-primary' : 'text-text-primary'
                      )}
                    >
                      {segment.name}
                    </h4>
                    <p
                      className={cn(
                        'line-clamp-2 text-[11px] leading-relaxed',
                        isSelected ? 'text-text-primary' : 'text-text-secondary'
                      )}
                    >
                      {segment.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-bg-surface border-border-subtle flex justify-end border-t p-4">
            <Button
              className="button-glimmer button-professional h-12 rounded-2xl border-none !bg-black px-10 font-mono text-[10px] uppercase tracking-widest text-white shadow-md shadow-xl transition-all duration-500 hover:!bg-black"
              onClick={() => setShowSegmentDirectory(false)}
            >
              {activeSegments.length > 0 ? (
                <div className="flex items-center gap-2">
                  Сохранить выбор ({activeSegments.length})
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : (
                'Закрыть реестр'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Brand Selector Dialog */}
      <Dialog open={showBrandSelector} onOpenChange={setShowBrandSelector}>
        <DialogContent className="bg-bg-surface border-border-strong w-[600px] max-w-[90vw] overflow-hidden rounded-3xl p-0">
          <DialogHeader className="bg-bg-surface2 border-border-subtle relative overflow-hidden border-b p-4">
            <div className="os-grid-bg pointer-events-none absolute inset-0 opacity-20" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="text-accent-primary h-5 w-5" />
                <Badge
                  variant="outline"
                  className="border-border-strong bg-white/50 font-mono text-[10px] uppercase tracking-widest"
                >
                  BRAND_FILTER_v2
                </Badge>
              </div>
              <DialogTitle className="text-text-primary font-headline text-base font-black uppercase tracking-tight">
                Выбор Брендов
              </DialogTitle>
              <DialogDescription className="text-text-secondary text-sm font-light">
                Выберите конкретные бренды из списка для фильтрации основного вида.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="custom-scrollbar bg-bg-canvas/30 max-h-[50vh] overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="border-border-subtle flex flex-col gap-3 border-b pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted font-mono text-[10px] uppercase">
                    Быстрый выбор
                  </span>
                  <button
                    className="text-accent-primary font-mono text-[10px] uppercase hover:underline"
                    onClick={() => setSelectedBrandIds([])}
                  >
                    Очистить всё
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-accent-soft hover:text-accent-primary h-8 flex-1 gap-2 rounded-lg font-mono text-[9px] uppercase tracking-tighter transition-all"
                    onClick={() => {
                      const followedIds = brands
                        .filter((b) => globalFollowed.includes(b.id))
                        .map((b) => b.id);
                      setSelectedBrandIds((prev) => Array.from(new Set([...prev, ...followedIds])));
                    }}
                  >
                    <Check className="h-3 w-3" />
                    Выбрать подписки ({globalFollowed.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-state-error/10 hover:text-state-error h-8 flex-1 gap-2 rounded-lg font-mono text-[9px] uppercase tracking-tighter transition-all"
                    onClick={() => {
                      const favoriteIds = brands
                        .filter((b) => globalFavorites.includes(b.id))
                        .map((b) => b.id);
                      setSelectedBrandIds((prev) => Array.from(new Set([...prev, ...favoriteIds])));
                    }}
                  >
                    <Heart className="h-3 w-3" />
                    Выбрать избранное ({globalFavorites.length})
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-text-muted mb-2 block font-mono text-[10px] uppercase">
                  Список авторизованных участников
                </span>
                {brands.map((brand) => {
                  const isSelected = selectedBrandIds.includes(brand.id);
                  return (
                    <div
                      key={brand.id}
                      className={cn(
                        'group flex cursor-pointer items-center space-x-3 rounded-2xl border p-3 transition-all',
                        isSelected
                          ? 'border-emerald-500/30 bg-emerald-50/50'
                          : 'bg-bg-surface border-border-subtle hover:border-accent-primary/30'
                      )}
                      onClick={() => {
                        setSelectedBrandIds((prev) =>
                          prev.includes(brand.id)
                            ? prev.filter((id) => id !== brand.id)
                            : [...prev, brand.id]
                        );
                      }}
                    >
                      <div
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded border transition-all duration-300',
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500 shadow-sm shadow-emerald-500/20'
                            : 'border-border-strong bg-white'
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
                      </div>
                      <div className="flex flex-grow items-center gap-3">
                        <div className="border-border-subtle bg-bg-surface2 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                          {brand.logo?.url ? (
                            <img
                              src={brand.logo.url}
                              alt={brand.name}
                              className="h-full w-full object-contain p-1 opacity-60 transition-opacity group-hover:opacity-100"
                            />
                          ) : (
                            <span className="text-text-muted text-[10px] font-bold">
                              {brand.name[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-text-primary font-headline text-sm font-bold uppercase tracking-tight">
                            {brand.name}
                          </span>
                          <span className="text-text-muted font-mono text-[9px] uppercase">
                            {brand.segment || 'No Segment'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border-border-subtle flex items-center justify-between border-t p-4">
            <span className="text-text-muted font-mono text-[10px] uppercase">
              Выбрано:{' '}
              <span className="text-accent-primary font-bold">{selectedBrandIds.length}</span>
            </span>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="hover:bg-bg-surface2 h-10 rounded-xl px-6 font-mono text-[10px] uppercase tracking-widest"
                onClick={() => setShowBrandSelector(false)}
              >
                Отмена
              </Button>
              <Button
                className="hover:bg-text-primary/90 h-10 rounded-xl bg-black px-6 font-mono text-[10px] uppercase tracking-widest text-white"
                onClick={() => setShowBrandSelector(false)}
              >
                Применить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PartnershipDialog
        isOpen={!!partnershipBrand}
        onOpenChange={(open) => !open && setPartnershipBrand(null)}
        brandName={partnershipBrand?.name || ''}
        brandId={partnershipBrand?.id || ''}
        status={partnershipBrand ? partnershipRequests[partnershipBrand.id] || 'none' : 'none'}
        onSend={(id) => {
          sendPartnershipRequest(id);
        }}
      />

      <AnalysisDialog
        isOpen={!!analysisBrand}
        onOpenChange={(open) => !open && setAnalysisBrand(null)}
        brandName={analysisBrand?.name || ''}
        brandId={analysisBrand?.id || ''}
        viewRole={viewRole}
      />
    </div>
  );
}
