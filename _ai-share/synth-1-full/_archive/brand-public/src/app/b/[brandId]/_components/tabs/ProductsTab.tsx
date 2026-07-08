'use client';

import React from 'react';
import Image from 'next/image';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Check,
  ArrowRight,
  Users,
  Sparkles,
  Layers,
  Palette,
  Ruler,
  Trophy,
  Sliders,
  Filter,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/product-card';
import ProductListItem from '@/components/product-list-item';

export type AudienceFilter =
  | 'Все'
  | 'Взрослые - Женщины'
  | 'Взрослые - Мужчины'
  | 'Взрослые - Унисекс'
  | 'Дети - Девочки'
  | 'Дети - Мальчики'
  | 'Дети - Новорожденные'
  | 'Дети - Унисекс'
  | 'Non-Fashion';

interface ProductsTabProps {
  activeTopCatalog: string;
  setActiveTopCatalog: (val: string) => void;
  setFilterOutlet: (val: string[]) => void;
  capsuleCollections: { id: string; label: string; desc: string }[];
  activeCapsule: string | null;
  setActiveCapsule: (id: string | null) => void;
  filterAvailability: string[];
  setFilterAvailability: React.Dispatch<React.SetStateAction<string[]>>;
  activeTopAudience: string;
  setActiveTopAudience: (val: string) => void;
  setActiveAudience: React.Dispatch<React.SetStateAction<AudienceFilter[]>>;
  setFilterCategory: React.Dispatch<React.SetStateAction<string[]>>;
  setFilterAttributes: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setFilterColor: React.Dispatch<React.SetStateAction<string[]>>;
  setFilterSizes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedSizeRow: (val: any) => void;
  isFilterSidebarOpen: boolean;
  setIsFilterSidebarOpen: (val: boolean) => void;
  activeAudience: AudienceFilter[];
  filterCategory: string[];
  categoriesData: any;
  getAllowedCategories: string[];
  filterColor: string[];
  colorsData: any[];
  selectedSizeRow: any;
  activeSizeChart: any[];
  measurementLabels: Record<string, string>;
  filterAttributes: Record<string, string[]>;
  attributesData: any[];
  getAllowedAttributes: string[];
  filteredProducts: any[];
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
  setIsAiSizeDialogOpen: (val: boolean) => void;
  displayName: string;
}

export function ProductsTab({
  activeTopCatalog,
  setActiveTopCatalog,
  setFilterOutlet,
  capsuleCollections,
  activeCapsule,
  setActiveCapsule,
  filterAvailability,
  setFilterAvailability,
  activeTopAudience,
  setActiveTopAudience,
  setActiveAudience,
  setFilterCategory,
  setFilterAttributes,
  setFilterColor,
  setFilterSizes,
  setSelectedSizeRow,
  isFilterSidebarOpen,
  setIsFilterSidebarOpen,
  activeAudience,
  filterCategory,
  categoriesData,
  getAllowedCategories,
  filterColor,
  colorsData,
  selectedSizeRow,
  activeSizeChart,
  measurementLabels,
  filterAttributes,
  attributesData,
  getAllowedAttributes,
  filteredProducts,
  viewMode,
  setViewMode,
  setIsAiSizeDialogOpen,
  displayName,
}: ProductsTabProps) {
  return (
    <TabsContent value="products" className="pt-4 duration-500 animate-in fade-in">
      {/* Top Catalog Filters */}
      <div className="no-scrollbar custom-scrollbar flex gap-2 overflow-x-auto pb-4">
        {[
          { label: 'Все', value: 'all' },
          { label: 'АССОРТИМЕНТ', value: 'marketplace' },
          { label: 'Аутлет', value: 'outlet' },
        ].map((opt) => (
          <Button
            key={opt.value}
            variant={activeTopCatalog === opt.value ? 'default' : 'outline'}
            className={cn(
              'h-9 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all',
              opt.label === 'Все' ? 'min-w-[60px]' : 'min-w-[120px]',
              activeTopCatalog === opt.value
                ? 'border-black bg-black text-white shadow-lg'
                : 'border-border-default hover:bg-bg-surface2 text-text-secondary bg-white shadow-sm'
            )}
            onClick={() => {
              setActiveTopCatalog(opt.value);
              if (opt.value === 'all') {
                setFilterOutlet(['marketplace', 'outlet']);
              } else {
                setFilterOutlet([opt.value]);
              }
            }}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Capsule Collections & Shop the Look */}
      {activeTopCatalog !== 'outlet' && (
        <div className="no-scrollbar custom-scrollbar mb-2 flex gap-3 overflow-x-auto pb-6">
          {capsuleCollections.map((capsule) => (
            <div
              key={capsule.id}
              className={cn(
                'group relative min-w-[200px] cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all',
                activeCapsule === capsule.id
                  ? 'border-accent bg-accent/5 shadow-md'
                  : 'border-muted/20 bg-white hover:border-accent/30'
              )}
              onClick={() => setActiveCapsule(activeCapsule === capsule.id ? null : capsule.id)}
            >
              {activeCapsule === capsule.id && (
                <div className="absolute right-2 top-2">
                  <Check className="h-3 w-3 text-accent" />
                </div>
              )}
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-accent">
                Капсула
              </p>
              <h4 className="text-sm font-black uppercase tracking-tight">{capsule.label}</h4>
              <p className="mt-1 text-[10px] font-medium text-muted-foreground">{capsule.desc}</p>
            </div>
          ))}
          {/* Shop the Look Card */}
          <div className="group flex min-w-[280px] cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-4 transition-all hover:bg-accent/10">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted/20">
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80"
                alt="Look"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="flex-1">
              <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-accent">
                Образ дня
              </p>
              <h4 className="text-[11px] font-black uppercase leading-tight tracking-tight">
                Total Wool Look
              </h4>
              <Button
                variant="link"
                className="h-auto p-0 text-[9px] font-black uppercase text-muted-foreground transition-transform hover:text-accent group-hover:translate-x-1"
              >
                Купить образ <ArrowRight className="ml-1 h-2.5 w-2.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Filter */}
      <div className="no-scrollbar custom-scrollbar mb-2 flex gap-2 overflow-x-auto pb-4">
        {[
          { label: 'В наличии', value: 'in_stock' },
          { label: 'Предзаказ', value: 'pre_order' },
          { label: 'Нет в наличии', value: 'out_of_stock' },
        ].map((opt) => {
          const isSelected = filterAvailability.includes(opt.value);
          return (
            <Button
              key={opt.value}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'h-8 rounded-xl border px-4 text-[10px] font-black uppercase tracking-widest transition-all',
                isSelected
                  ? 'border-accent bg-accent text-white shadow-md shadow-accent/20'
                  : 'border-border-default hover:bg-bg-surface2 text-text-secondary bg-white'
              )}
              onClick={() => {
                setFilterAvailability((prev) => {
                  if (prev.includes(opt.value)) {
                    return prev.filter((v) => v !== opt.value);
                  } else {
                    return [...prev, opt.value];
                  }
                });
              }}
            >
              {isSelected && <Check className="mr-1.5 h-3 w-3 stroke-[3px]" />}
              {opt.label}
            </Button>
          );
        })}
      </div>

      {/* Top Audience Filters */}
      <div className="no-scrollbar custom-scrollbar mb-4 flex gap-2 overflow-x-auto border-b pb-4">
        {[
          {
            label: 'Все',
            value: 'Все',
            audience: ['Все'] as AudienceFilter[],
            category: [] as string[],
          },
          {
            label: 'Женщинам',
            value: 'Женщинам',
            audience: ['Взрослые - Женщины', 'Взрослые - Унисекс'] as AudienceFilter[],
            category: [] as string[],
          },
          {
            label: 'Мужчинам',
            value: 'Мужчинам',
            audience: ['Взрослые - Мужчины', 'Взрослые - Унисекс'] as AudienceFilter[],
            category: [] as string[],
          },
          {
            label: 'Детям',
            value: 'Детям',
            audience: [
              'Дети - Девочки',
              'Дети - Мальчики',
              'Дети - Новорожденные',
              'Дети - Унисекс',
            ] as AudienceFilter[],
            category: [] as string[],
          },
          {
            label: 'Beauty',
            value: 'Beauty',
            audience: ['Non-Fashion'] as AudienceFilter[],
            category: ['Beauty & Grooming'],
          },
          {
            label: 'Home',
            value: 'Home',
            audience: ['Non-Fashion'] as AudienceFilter[],
            category: ['Home & Lifestyle'],
          },
        ].map((opt) => (
          <Button
            key={opt.value}
            variant={activeTopAudience === opt.value ? 'default' : 'outline'}
            className={cn(
              'h-9 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all',
              opt.label === 'Все' ? 'min-w-[60px]' : 'min-w-[120px]',
              activeTopAudience === opt.value
                ? 'border-black bg-black text-white shadow-lg'
                : 'border-border-default hover:bg-bg-surface2 text-text-secondary bg-white shadow-sm'
            )}
            onClick={() => {
              setActiveTopAudience(opt.value);
              setActiveAudience(opt.audience);
              setFilterCategory(opt.category);
              setFilterAttributes({});
              setFilterColor([]);
              setFilterSizes([]);
              setSelectedSizeRow(null);
            }}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        {/* Sidebar Filters */}
        <aside
          className={cn(
            'shrink-0 space-y-4 transition-all duration-300 lg:w-72',
            !isFilterSidebarOpen && 'invisible overflow-hidden opacity-0 lg:w-0'
          )}
        >
          <Accordion type="multiple" defaultValue={[]} className="w-full space-y-2">
            {/* Audience */}
            <AccordionItem value="audience" className="border-none">
              <div className="group flex items-center justify-between gap-2 rounded-xl border border-transparent bg-muted/20 p-1 transition-all hover:border-muted-foreground/10 hover:bg-muted/40">
                <AccordionTrigger className="flex-1 p-2 text-xs font-black uppercase tracking-wider hover:no-underline">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-background shadow-sm transition-transform group-hover:scale-110">
                      <Users className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-accent" />
                    </div>
                    <span className="transition-transform group-hover:translate-x-0.5">
                      Аудитория
                    </span>
                    {activeAudience.length > 0 && !activeAudience.includes('Все') && (
                      <Badge className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full border-none bg-accent px-1 text-[9px] text-white">
                        {activeAudience.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                {activeAudience.length > 0 && !activeAudience.includes('Все') ? (
                  <Button
                    variant="link"
                    className="h-auto p-0 px-2 text-[9px] font-black uppercase text-muted-foreground transition-colors hover:text-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAudience(['Все']);
                      setActiveTopAudience('Все');
                    }}
                  >
                    Сбросить
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 px-2 text-[9px] font-black uppercase text-foreground">
                    <Check className="h-3 w-3 stroke-[4px] text-green-600" />
                    <span>Все</span>
                  </div>
                )}
              </div>
              <AccordionContent className="px-1 pt-2">
                <div className="space-y-4 rounded-2xl border border-accent/10 bg-accent/5 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      AI Подбор размера
                    </span>
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    Мы проанализировали ваши параметры (Рост: 178 см, Обхват груди: 92 см) и
                    рекомендуем размер <b>L</b> для этого бренда.
                  </p>
                  <Button
                    variant="outline"
                    className="h-8 w-full rounded-xl border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent transition-all hover:bg-accent hover:text-white"
                    onClick={() => setIsAiSizeDialogOpen(true)}
                  >
                    Проверить замеры
                  </Button>
                </div>
                <div className="my-4 h-px bg-muted/20" />
                <div className="custom-scrollbar max-h-[450px] space-y-2 overflow-y-auto pr-2">
                  {(
                    [
                      'Взрослые - Женщины',
                      'Взрослые - Мужчины',
                      'Взрослые - Унисекс',
                      'Дети - Девочки',
                      'Дети - Мальчики',
                      'Дети - Новорожденные',
                      'Дети - Унисекс',
                      'Non-Fashion',
                    ] as AudienceFilter[]
                  )
                    .filter((audience) => {
                      if (activeTopAudience === 'Все' || !activeTopAudience) return true;

                      if (activeTopAudience === 'Женщинам') {
                        return ['Взрослые - Женщины', 'Взрослые - Унисекс'].includes(audience);
                      }
                      if (activeTopAudience === 'Мужчинам') {
                        return ['Взрослые - Мужчины', 'Взрослые - Унисекс'].includes(audience);
                      }
                      if (activeTopAudience === 'Детям') {
                        return audience.startsWith('Дети -');
                      }
                      if (activeTopAudience === 'Beauty' || activeTopAudience === 'Home') {
                        return audience === 'Non-Fashion';
                      }
                      return true;
                    })
                    .map((audience) => {
                      const isChecked = activeAudience.includes(audience);
                      return (
                        <div
                          key={audience}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50',
                            isChecked && 'bg-muted/30'
                          )}
                          onClick={() => {
                            setActiveAudience((prev) => {
                              if (audience === 'Все') {
                                setActiveTopAudience('Все');
                                return ['Все'];
                              }
                              let withoutAll = prev.filter((a) => a !== 'Все');

                              let next: AudienceFilter[];
                              if (withoutAll.includes(audience)) {
                                next = withoutAll.filter((a) => a !== audience);
                              } else {
                                next = [...withoutAll, audience];
                              }
                              setActiveTopAudience('');
                              return next.length === 0 ? ['Все'] : next;
                            });
                          }}
                        >
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                            {isChecked && <Check className="h-4 w-4 stroke-[4px] text-green-600" />}
                          </div>
                          <span
                            className={cn(
                              'text-[11px] font-medium leading-none',
                              isChecked ? 'font-black text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {audience}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Categories */}
            <AccordionItem value="categories" className="border-none">
              <div className="group flex items-center justify-between gap-2 rounded-xl border border-transparent bg-muted/20 p-1 transition-all hover:border-muted-foreground/10 hover:bg-muted/40">
                <AccordionTrigger className="flex-1 p-2 text-xs font-black uppercase tracking-wider hover:no-underline">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-background shadow-sm transition-transform group-hover:scale-110">
                      <Layers className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-accent" />
                    </div>
                    <span className="transition-transform group-hover:translate-x-0.5">
                      Категории
                    </span>
                    {filterCategory.length > 0 && (
                      <Badge className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full border-none bg-accent px-1 text-[9px] text-white">
                        {filterCategory.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                {filterCategory.length > 0 ? (
                  <Button
                    variant="link"
                    className="h-auto p-0 px-2 text-[9px] font-black uppercase text-muted-foreground transition-colors hover:text-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterCategory([]);
                    }}
                  >
                    Сбросить
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 px-2 text-[9px] font-black uppercase text-foreground">
                    <Check className="h-3 w-3 stroke-[4px] text-green-600" />
                    <span>Все</span>
                  </div>
                )}
              </div>
              <AccordionContent className="px-1 pt-2">
                <div className="custom-scrollbar max-h-[550px] space-y-3 overflow-y-auto pr-2">
                  <Accordion type="multiple" className="w-full space-y-3">
                    {categoriesData &&
                      Object.keys(categoriesData)
                        .filter((lvl1) => getAllowedCategories.includes(lvl1))
                        .map((lvl1) => (
                          <AccordionItem key={lvl1} value={lvl1} className="border-none">
                            <AccordionTrigger className="rounded-xl bg-muted/10 px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-muted/30 hover:no-underline">
                              <span>{lvl1}</span>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 pl-4 pt-2">
                              {Object.keys(categoriesData[lvl1])
                                .filter((lvl2) => {
                                  if (activeAudience.includes('Все')) return true;
                                  const isFemale = activeAudience.some((a) =>
                                    ['Взрослые - Женщины', 'Дети - Девочки'].includes(a)
                                  );
                                  const isMale = activeAudience.some((a) =>
                                    ['Взрослые - Мужчины', 'Дети - Мальчики'].includes(a)
                                  );
                                  const isNonFashion = activeAudience.includes('Non-Fashion');
                                  const isOnlyMaleRelated = activeAudience.every((a) =>
                                    [
                                      'Взрослые - Мужчины',
                                      'Дети - Мальчики',
                                      'Взрослые - Унисекс',
                                      'Дети - Унисекс',
                                    ].includes(a)
                                  );
                                  if (
                                    isOnlyMaleRelated &&
                                    ['Платья и сарафаны', 'Юбки', 'Нижнее бельё'].includes(lvl2)
                                  )
                                    return false;
                                  if (['Платья и сарафаны', 'Юбки', 'Нижнее бельё'].includes(lvl2))
                                    return isFemale;
                                  if (lvl1 === 'Beauty & Grooming' || lvl1 === 'Home & Lifestyle')
                                    return isNonFashion;
                                  if (['Одежда', 'Обувь', 'Сумки', 'Аксессуары'].includes(lvl1)) {
                                    if (isNonFashion && activeAudience.length === 1) return false;
                                  }
                                  return true;
                                })
                                .map((lvl2) => {
                                  const isLvl2Checked = filterCategory.includes(lvl2);
                                  const children = Object.keys(categoriesData[lvl1][lvl2]);
                                  const hasLvl3 = children.length > 0;
                                  const dName =
                                    lvl2 === 'Нижнее бельё'
                                      ? 'Женское нижнее бельё и домашняя одежда'
                                      : lvl2;

                                  return (
                                    <div key={lvl2} className="space-y-2">
                                      {hasLvl3 ? (
                                        <Accordion type="multiple" className="w-full">
                                          <AccordionItem value={lvl2} className="border-none">
                                            <div className="flex items-center gap-1">
                                              <div
                                                onClick={() => {
                                                  setFilterCategory((prev) => {
                                                    const isCurrentlyChecked = prev.includes(lvl2);
                                                    if (isCurrentlyChecked) {
                                                      return prev.filter(
                                                        (c) => c !== lvl2 && !children.includes(c)
                                                      );
                                                    } else {
                                                      return Array.from(
                                                        new Set([...prev, lvl2, ...children])
                                                      );
                                                    }
                                                  });
                                                }}
                                                className={cn(
                                                  'flex flex-1 cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/50',
                                                  isLvl2Checked
                                                    ? 'bg-muted/50 font-black text-foreground shadow-sm'
                                                    : 'font-semibold text-muted-foreground/80 hover:bg-muted'
                                                )}
                                              >
                                                <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                                                  {isLvl2Checked && (
                                                    <Check className="h-3 w-3 stroke-[4px] text-green-600" />
                                                  )}
                                                </div>
                                                <span>{dName}</span>
                                              </div>
                                              <AccordionTrigger className="p-2 hover:no-underline" />
                                            </div>
                                            <AccordionContent className="space-y-2 pl-6 pt-2">
                                              {children
                                                .filter((lvl3) => {
                                                  if (activeAudience.includes('Все')) return true;
                                                  const isOnlyMaleRelated = activeAudience.every(
                                                    (aud) =>
                                                      [
                                                        'Взрослые - Мужчины',
                                                        'Дети - Мальчики',
                                                        'Дети - Унисекс',
                                                        'Взрослые - Унисекс',
                                                      ].includes(aud)
                                                  );
                                                  if (
                                                    isOnlyMaleRelated &&
                                                    ['Коктейльные', 'Вечерние'].includes(lvl3)
                                                  )
                                                    return false;
                                                  if (
                                                    [
                                                      'Коктейльные',
                                                      'Вечерние',
                                                      'Балетки',
                                                      'Ботфорты',
                                                    ].includes(lvl3)
                                                  ) {
                                                    return activeAudience.some((a) =>
                                                      [
                                                        'Взрослые - Женщины',
                                                        'Дети - Девочки',
                                                      ].includes(a)
                                                    );
                                                  }
                                                  return true;
                                                })
                                                .map((lvl3) => {
                                                  const isLvl3Checked =
                                                    filterCategory.includes(lvl3);
                                                  return (
                                                    <div
                                                      key={lvl3}
                                                      onClick={() => {
                                                        setFilterCategory((prev) =>
                                                          prev.includes(lvl3)
                                                            ? prev.filter((c) => c !== lvl3)
                                                            : [...prev, lvl3]
                                                        );
                                                      }}
                                                      className={cn(
                                                        'flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/50',
                                                        isLvl3Checked
                                                          ? 'font-black text-foreground shadow-sm'
                                                          : 'text-muted-foreground hover:text-foreground'
                                                      )}
                                                    >
                                                      <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                                                        {isLvl3Checked && (
                                                          <Check className="h-2.5 w-2.5 stroke-[4px] text-green-600" />
                                                        )}
                                                      </div>
                                                      <span>{lvl3}</span>
                                                    </div>
                                                  );
                                                })}
                                            </AccordionContent>
                                          </AccordionItem>
                                        </Accordion>
                                      ) : (
                                        <div
                                          onClick={() => {
                                            setFilterCategory((prev) =>
                                              prev.includes(lvl2)
                                                ? prev.filter((c) => c !== lvl2)
                                                : [...prev, lvl2]
                                            );
                                          }}
                                          className={cn(
                                            'flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/50',
                                            isLvl2Checked
                                              ? 'bg-muted/50 font-black text-foreground shadow-sm'
                                              : 'font-semibold text-muted-foreground/80 hover:bg-muted'
                                          )}
                                        >
                                          <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                                            {isLvl2Checked && (
                                              <Check className="h-3 w-3 stroke-[4px] text-green-600" />
                                            )}
                                          </div>
                                          <span>{dName}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Colors */}
            <AccordionItem value="colors" className="border-none">
              <div className="group flex items-center justify-between gap-2 rounded-xl border border-transparent bg-muted/20 p-1 transition-all hover:border-muted-foreground/10 hover:bg-muted/40">
                <AccordionTrigger className="flex-1 p-2 text-xs font-black uppercase tracking-wider hover:no-underline">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-background shadow-sm transition-transform group-hover:scale-110">
                      <Palette className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-accent" />
                    </div>
                    <span className="transition-transform group-hover:translate-x-0.5">Цвет</span>
                    {filterColor.length > 0 && (
                      <Badge className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full border-none bg-accent px-1 text-[9px] text-white">
                        {filterColor.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                {filterColor.length > 0 ? (
                  <Button
                    variant="link"
                    className="h-auto p-0 px-2 text-[9px] font-black uppercase text-muted-foreground transition-colors hover:text-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterColor([]);
                    }}
                  >
                    Сбросить
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 px-2 text-[9px] font-black uppercase text-foreground">
                    <Check className="h-3 w-3 stroke-[4px] text-green-600" />
                    <span>Все</span>
                  </div>
                )}
              </div>
              <AccordionContent className="px-1 pt-2">
                <div className="custom-scrollbar max-h-[250px] space-y-3 overflow-y-auto pr-2">
                  {colorsData.map((color) => {
                    const isChecked = filterColor.includes(color.name);
                    return (
                      <div
                        key={color.name}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50',
                          isChecked && 'bg-muted/30'
                        )}
                        onClick={() => {
                          setFilterColor((prev) =>
                            prev.includes(color.name)
                              ? prev.filter((c) => c !== color.name)
                              : [...prev, color.name]
                          );
                        }}
                      >
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                          {isChecked && <Check className="h-4 w-4 stroke-[4px] text-green-600" />}
                        </div>
                        <div className="relative flex shrink-0 items-center justify-center">
                          <div
                            className={cn(
                              'h-3.5 w-3.5 rounded-full border shadow-sm transition-all',
                              isChecked && 'scale-110 ring-2 ring-green-500 ring-offset-1'
                            )}
                            style={{ backgroundColor: color.hex }}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-[11px] font-medium leading-none',
                            isChecked ? 'font-black text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {color.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Sizes */}
            <AccordionItem value="sizes" className="border-none">
              <div className="group flex items-center justify-between gap-2 rounded-xl border border-transparent bg-muted/20 p-1 transition-all hover:border-muted-foreground/10 hover:bg-muted/40">
                <AccordionTrigger className="flex-1 p-2 text-xs font-black uppercase tracking-wider hover:no-underline">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-background shadow-sm transition-transform group-hover:scale-110">
                      <Ruler className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-accent" />
                    </div>
                    <span className="transition-transform group-hover:translate-x-0.5">
                      Размеры
                    </span>
                    {selectedSizeRow && (
                      <Badge className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-none bg-accent p-0 text-white">
                        <Check className="h-2 w-2 stroke-[4px]" />
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                {selectedSizeRow ? (
                  <Button
                    variant="link"
                    className="h-auto p-0 px-2 text-[9px] font-black uppercase text-muted-foreground transition-colors hover:text-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSizeRow(null);
                    }}
                  >
                    Сбросить
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 px-2 text-[9px] font-black uppercase text-foreground">
                    <Check className="h-3 w-3 stroke-[4px] text-green-600" />
                    <span>Все</span>
                  </div>
                )}
              </div>
              <AccordionContent className="px-1 pt-1">
                {activeSizeChart && activeSizeChart.length > 0 ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {['RU', 'Alpha', 'EU', 'US', 'UK']
                        .filter((s) => activeSizeChart[0] && activeSizeChart[0][s])
                        .map((system) => {
                          const isValueSelected = !!selectedSizeRow;
                          return (
                            <div key={system} className="space-y-0.5">
                              <Label className="ml-1 text-[8px] font-black uppercase text-muted-foreground/70">
                                {system}
                              </Label>
                              <Select
                                value={
                                  selectedSizeRow ? String(selectedSizeRow[system] || '') : 'all'
                                }
                                onValueChange={(val) => {
                                  if (val === 'all') {
                                    setSelectedSizeRow(null);
                                  } else {
                                    const foundRow = activeSizeChart.find(
                                      (r) => String(r[system]) === val
                                    );
                                    setSelectedSizeRow(foundRow || null);
                                  }
                                }}
                              >
                                <SelectTrigger
                                  className={cn(
                                    'h-7 rounded-lg text-[10px] font-black uppercase transition-all',
                                    isValueSelected
                                      ? 'border-2 border-muted-foreground/20 bg-muted/50 text-foreground'
                                      : 'border-none bg-muted/30 text-muted-foreground'
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-3 w-3 shrink-0 items-center justify-center">
                                      {isValueSelected && (
                                        <Check className="h-3 w-3 stroke-[4px] text-green-600" />
                                      )}
                                    </div>
                                    <SelectValue placeholder={`Выбрать ${system}`} />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value="all"
                                    className="text-[10px] font-bold uppercase"
                                  >
                                    Все
                                  </SelectItem>
                                  {activeSizeChart.map((row, idx) => (
                                    <SelectItem
                                      key={idx}
                                      value={String(row[system])}
                                      className="text-[10px] font-bold uppercase"
                                    >
                                      {String(row[system])}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                    </div>

                    {selectedSizeRow && (
                      <div className="space-y-2 rounded-xl border border-accent/20 bg-accent/5 p-3 duration-200 animate-in fade-in zoom-in">
                        <div className="mb-2 flex items-center justify-between border-b border-accent/10 pb-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-accent">
                            Соответствие
                          </p>
                          <Trophy className="h-3 w-3 text-accent" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(selectedSizeRow)
                            .filter(([k]) =>
                              ['IT', 'FR', 'EU', 'US', 'UK', 'RU', 'Alpha'].includes(k)
                            )
                            .map(([k, v]) => (
                              <div
                                key={k}
                                className="flex flex-col items-center rounded border border-muted/50 bg-white p-1"
                              >
                                <span className="mb-0.5 text-[7px] font-bold uppercase leading-none text-muted-foreground">
                                  {k}
                                </span>
                                <span className="text-[9px] font-black uppercase text-foreground">
                                  {String(v)}
                                </span>
                              </div>
                            ))}
                        </div>

                        <div className="space-y-1 pt-2">
                          <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">
                            Замеры изделия (см)
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(selectedSizeRow)
                              .filter(
                                ([k]) => !['IT', 'FR', 'EU', 'US', 'UK', 'RU', 'Alpha'].includes(k)
                              )
                              .map(([k, v]) => (
                                <div
                                  key={k}
                                  className="flex items-center justify-between border-b border-muted/30 pb-0.5"
                                >
                                  <span className="text-[8px] font-bold uppercase text-muted-foreground">
                                    {measurementLabels[k] || k}:
                                  </span>
                                  <span className="text-[9px] font-black text-foreground">
                                    {String(v)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center">
                    <p className="text-[10px] font-bold uppercase leading-tight text-muted-foreground">
                      {(Array.isArray(activeAudience) ? activeAudience : []).some((a) =>
                        ['Взрослые - Мужчины', 'Дети - Мальчики', 'Дети - Новорожденные'].includes(
                          a
                        )
                      )
                        ? 'Матрица размеров для этой аудитории скоро появится'
                        : 'Выберите категорию, чтобы увидеть сетку'}
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Attributes */}
            <AccordionItem value="attributes" className="border-none">
              <div className="group flex items-center justify-between gap-2 rounded-xl border border-transparent bg-muted/20 p-1 transition-all hover:border-muted-foreground/10 hover:bg-muted/40">
                <AccordionTrigger className="flex-1 p-2 text-xs font-black uppercase tracking-wider hover:no-underline">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-background shadow-sm transition-transform group-hover:scale-110">
                      <Sliders className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-accent" />
                    </div>
                    <span className="transition-transform group-hover:translate-x-0.5">
                      Атрибуты
                    </span>
                    {Object.values(filterAttributes).some((arr) => arr.length > 0) && (
                      <Badge className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full border-none bg-accent px-1 text-[9px] text-white">
                        {Object.values(filterAttributes).reduce(
                          (acc, curr) => acc + curr.length,
                          0
                        )}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                {Object.values(filterAttributes).some((arr) => arr.length > 0) ? (
                  <Button
                    variant="link"
                    className="h-auto p-0 px-2 text-[9px] font-black uppercase text-muted-foreground transition-colors hover:text-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterAttributes({});
                    }}
                  >
                    Сбросить
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 px-2 text-[9px] font-black uppercase text-foreground">
                    <Check className="h-3 w-3 stroke-[4px] text-green-600" />
                    <span>Все</span>
                  </div>
                )}
              </div>
              <AccordionContent className="px-1 pt-2">
                <Accordion type="multiple" className="w-full space-y-3">
                  {attributesData
                    .filter((attr) => getAllowedAttributes.includes(attr.id))
                    .map((attr) => (
                      <AccordionItem key={attr.id} value={attr.id} className="border-none">
                        <AccordionTrigger className="rounded-xl bg-muted/30 px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors hover:bg-muted/50 hover:no-underline">
                          <div className="flex w-full items-center justify-between pr-1">
                            <span>{attr.name_ru}</span>
                            {filterAttributes[attr.id]?.length > 0 && (
                              <Badge className="ml-2 flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full border-none bg-accent px-1 text-[8px] text-white">
                                {filterAttributes[attr.id].length}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pl-4 pt-2">
                          <div className="custom-scrollbar grid max-h-[250px] grid-cols-1 gap-2 overflow-y-auto pr-1">
                            {attr.values.slice(0, 20).map((val: string) => {
                              const isChecked = filterAttributes[attr.id]?.includes(val);
                              return (
                                <div
                                  key={val}
                                  className={cn(
                                    'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50',
                                    isChecked && 'bg-muted/30'
                                  )}
                                  onClick={() => {
                                    setFilterAttributes((prev) => {
                                      const current = prev[attr.id] || [];
                                      if (current.includes(val)) {
                                        return {
                                          ...prev,
                                          [attr.id]: current.filter((v) => v !== val),
                                        };
                                      } else {
                                        return { ...prev, [attr.id]: [...current, val] };
                                      }
                                    });
                                  }}
                                >
                                  <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                                    {isChecked && (
                                      <Check className="h-4 w-4 stroke-[4px] text-green-600" />
                                    )}
                                  </div>
                                  <span
                                    className={cn(
                                      'text-[11px] font-medium leading-none',
                                      isChecked
                                        ? 'font-black text-foreground'
                                        : 'text-muted-foreground'
                                    )}
                                  >
                                    {val}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            variant="outline"
            className="w-full rounded-xl border-2 py-6 text-xs font-black uppercase transition-all hover:bg-accent/5"
            onClick={() => {
              setActiveTopCatalog('marketplace');
              setActiveTopAudience('Все');
              setActiveAudience(['Все']);
              setFilterCategory([]);
              setFilterColor([]);
              setFilterSizes([]);
              setSelectedSizeRow(null);
              setFilterAttributes({});
              setFilterOutlet(['marketplace']);
            }}
          >
            Очистить всё
          </Button>
        </aside>

        {/* Main Collection Grid */}
        <div className="flex-1">
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-dashed bg-muted/20 p-2">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden items-center gap-2 rounded-xl text-xs font-bold lg:flex"
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
              >
                <Filter className="h-4 w-4" />
                {isFilterSidebarOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
              </Button>
              <div className="text-sm font-medium text-muted-foreground">
                Найдено изделий:{' '}
                <span className="font-black text-foreground">{filteredProducts.length}</span>
              </div>
            </div>

            <div className="flex gap-1 rounded-xl border bg-white/50 p-1 shadow-sm">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div
              className={cn(
                'grid gap-3',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              )}
            >
              {filteredProducts.map((product) =>
                viewMode === 'grid' ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <ProductListItem key={product.id} product={product} />
                )
              )}
            </div>
          ) : (
            <div className="space-y-6 rounded-[4rem] border border-dashed border-muted-foreground/20 bg-muted/10 py-32 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted shadow-inner">
                <Search className="h-10 w-10 text-muted-foreground opacity-30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black">Ничего не найдено</h3>
                <p className="mx-auto max-w-xs font-medium text-muted-foreground">
                  Попробуйте изменить параметры фильтрации или сбросить их
                </p>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-8"
                onClick={() => {
                  setActiveTopCatalog('marketplace');
                  setActiveTopAudience('Все');
                  setFilterCategory([]);
                  setFilterColor([]);
                  setFilterAttributes({});
                  setFilterOutlet(['marketplace']);
                  setActiveAudience(['Все']);
                }}
              >
                Сбросить все фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
}
