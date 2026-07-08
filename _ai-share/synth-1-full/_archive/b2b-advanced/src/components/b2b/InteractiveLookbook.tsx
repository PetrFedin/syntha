'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Eye,
  Settings2,
  Trash2,
  MousePointer2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Share2,
  Sparkles,
  Layers,
  ArrowRight,
  Cloud,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useB2BState } from '@/providers/b2b-state';
import { useUIState } from '@/providers/ui-state';
import { cn } from '@/lib/cn';
import allProductsData from '@/lib/products';

export function InteractiveLookbook() {
  const { b2bLookbooks, addB2bLookbook } = useB2BState();
  const { activeCurrency } = useUIState();
  const [selectedLookbook, setSelectedLookbook] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [isEditorMode, setIsEditorMode] = useState(false);

  const activePage = selectedLookbook?.pages[activePageIdx];

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditorMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // In a real app, show product picker
    console.log(`New hotspot at x: ${x}, y: ${y}`);
  };

  return (
    <div className="bg-bg-surface2 min-h-screen space-y-4 p-3 text-left">
      <AnimatePresence mode="wait">
        {!selectedLookbook ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-primary flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="border-accent-primary/20 text-accent-primary text-[9px] font-black uppercase tracking-widest"
                  >
                    VISUAL_SELL_v3.0
                  </Badge>
                </div>
                <h2 className="text-text-primary text-sm font-black uppercase leading-none tracking-tighter md:text-sm">
                  Интерактивные
                  <br />
                  Лукбуки
                </h2>
                <p className="text-text-muted max-w-md text-xs font-medium">
                  Превратите имиджевые кампании в торговый опыт. Отмечайте товары прямо на фото для
                  мгновенного оформления оптовых заказов.
                </p>
              </div>

              <Button className="bg-text-primary h-10 gap-2 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-xl">
                <Plus className="h-4 w-4" /> Создать новый лукбук
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {b2bLookbooks.map((lb) => (
                <Card
                  key={lb.id}
                  onClick={() => setSelectedLookbook(lb)}
                  className="group cursor-pointer overflow-hidden rounded-xl border-none bg-white shadow-md shadow-xl transition-all hover:scale-[1.02]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={lb.coverUrl}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="from-text-primary absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-60" />
                    <div className="absolute left-6 top-4">
                      <Badge className="text-text-primary border-none bg-white/90 px-3 py-1 text-[8px] font-black uppercase backdrop-blur-md">
                        {lb.season}
                      </Badge>
                    </div>
                    <div className="absolute bottom-8 left-8 right-8">
                      <h4 className="mb-2 text-sm font-black uppercase leading-none tracking-tight text-white">
                        {lb.title}
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {lb.pages.length} Стр. •{' '}
                        {lb.pages.reduce((acc, p) => acc + p.hotspots.length, 0)} Товаров
                      </p>
                    </div>
                  </div>
                  <CardContent className="border-border-subtle flex items-center justify-between border-t p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-text-muted text-[10px] font-black uppercase">
                        {lb.status}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-muted group-hover:text-text-primary group-hover:bg-bg-surface2 h-10 w-10 rounded-xl transition-all"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setSelectedLookbook(null)}
                variant="ghost"
                className="text-text-muted hover:text-text-primary gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                <ChevronLeft className="h-4 w-4" /> Назад в библиотеку
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsEditorMode(!isEditorMode)}
                  variant={isEditorMode ? 'default' : 'outline'}
                  className={cn(
                    'h-12 gap-2 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest',
                    isEditorMode ? 'bg-accent-primary text-white' : 'bg-white'
                  )}
                >
                  <Settings2 className="h-4 w-4" />{' '}
                  {isEditorMode ? 'Сохранить макет' : 'Режим редактора'}
                </Button>
                <Button className="bg-text-primary h-12 gap-2 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-white">
                  <Share2 className="h-4 w-4" /> Опубликовать ссылку
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                <Card className="relative overflow-hidden rounded-xl border-none bg-white shadow-2xl">
                  <div
                    className={cn(
                      'relative aspect-[4/5] cursor-crosshair',
                      !isEditorMode && 'cursor-default'
                    )}
                    onClick={handlePageClick}
                  >
                    <img src={activePage.imageUrl} className="h-full w-full object-cover" />

                    {activePage.hotspots.map((h: any) => {
                      const product = allProductsData.find((p) => p.id === h.productId);
                      return (
                        <div
                          key={h.id}
                          className="group absolute"
                          style={{ left: `${h.x}%`, top: `${h.y}%` }}
                        >
                          <div className="relative">
                            <div className="flex h-8 w-8 animate-pulse cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/20 shadow-2xl backdrop-blur-md transition-all group-hover:scale-125 group-hover:animate-none">
                              <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                            </div>

                            <div className="pointer-events-none absolute left-1/2 top-3 z-20 w-48 -translate-x-1/2 scale-90 rounded-2xl bg-white p-4 opacity-0 shadow-2xl transition-all group-hover:scale-100 group-hover:opacity-100">
                              <div className="space-y-3">
                                <div className="bg-bg-surface2 aspect-square overflow-hidden rounded-xl">
                                  <img
                                    src={product?.images?.[0]?.url}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-text-primary text-[10px] font-black uppercase leading-none">
                                    {product?.name}
                                  </p>
                                  <p className="text-accent-primary text-[9px] font-bold uppercase">
                                    {product?.price.toLocaleString('ru-RU')} ₽
                                  </p>
                                </div>
                                <Button className="bg-text-primary h-8 w-full rounded-lg text-[8px] font-black uppercase text-white">
                                  В корзину
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute inset-y-0 left-0 flex items-center px-4">
                    <Button
                      onClick={() => setActivePageIdx(Math.max(0, activePageIdx - 1))}
                      disabled={activePageIdx === 0}
                      variant="ghost"
                      size="icon"
                      className="hover:text-text-primary h-12 w-12 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white disabled:opacity-30"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4">
                    <Button
                      onClick={() =>
                        setActivePageIdx(
                          Math.min(selectedLookbook.pages.length - 1, activePageIdx + 1)
                        )
                      }
                      disabled={activePageIdx === selectedLookbook.pages.length - 1}
                      variant="ghost"
                      size="icon"
                      className="hover:text-text-primary h-12 w-12 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white disabled:opacity-30"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                </Card>

                <div className="flex justify-center gap-3 overflow-x-auto py-2">
                  {selectedLookbook.pages.map((p: any, i: number) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePageIdx(i)}
                      className={cn(
                        'h-20 w-12 shrink-0 overflow-hidden rounded-xl border-4 transition-all',
                        activePageIdx === i
                          ? 'border-accent-primary scale-110 shadow-lg'
                          : 'border-white opacity-60 shadow-sm hover:opacity-100'
                      )}
                    >
                      <img src={p.imageUrl} className="h-full w-full object-cover" />
                    </button>
                  ))}
                  {isEditorMode && (
                    <button className="border-border-default text-text-muted hover:text-text-primary hover:border-border-strong flex h-20 w-12 shrink-0 items-center justify-center rounded-xl border-4 border-dashed transition-all">
                      <Plus className="h-6 w-6" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 lg:col-span-4">
                <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl">
                  <h4 className="text-text-primary text-sm font-black uppercase tracking-widest">
                    Товары на странице
                  </h4>
                  <div className="space-y-4">
                    {activePage.hotspots.length > 0 ? (
                      activePage.hotspots.map((h: any) => {
                        const product = allProductsData.find((p) => p.id === h.productId);
                        return (
                          <div key={h.id} className="group flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-bg-surface2 border-border-subtle h-12 w-12 overflow-hidden rounded-xl border">
                                <img
                                  src={product?.images?.[0]?.url}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-text-primary text-[10px] font-black uppercase">
                                  {product?.name}
                                </p>
                                <p className="text-text-muted text-[8px] font-bold uppercase tracking-widest">
                                  {product?.sku}
                                </p>
                              </div>
                            </div>
                            {isEditorMode ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Badge className="border-none bg-emerald-50 text-[8px] font-black text-emerald-600">
                                В НАЛИЧИИ
                              </Badge>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-text-muted py-4 text-[10px] font-bold uppercase italic tracking-widest">
                        Нет отмеченных товаров на странице
                      </p>
                    )}
                  </div>
                  {isEditorMode && (
                    <Button
                      variant="outline"
                      className="border-border-subtle h-12 w-full gap-2 rounded-xl text-[9px] font-black uppercase tracking-widest"
                    >
                      <Tag className="h-4 w-4" /> Отметить новый товар
                    </Button>
                  )}
                </Card>

                <Card className="bg-text-primary relative space-y-6 overflow-hidden rounded-xl border-none p-4 text-white shadow-xl">
                  <div className="absolute right-0 top-0 p-4 opacity-10">
                    <Sparkles className="h-24 w-24" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <h5 className="text-accent-primary text-sm font-black uppercase tracking-widest">
                      AI Визуальный Помощник
                    </h5>
                    <p className="text-text-muted text-[10px] font-medium uppercase leading-relaxed tracking-widest">
                      Наш ИИ автоматически обнаружил **3 потенциальных товара** на этом фото.
                      Нажмите для проверки и подтверждения тегов.
                    </p>
                    <Button className="text-text-primary h-10 w-full rounded-xl bg-white text-[9px] font-black uppercase tracking-widest">
                      Запустить ИИ-сканирование
                    </Button>
                  </div>
                </Card>

                <Card className="bg-accent-primary/10 space-y-4 rounded-xl border-none p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <MousePointer2 className="text-accent-primary h-4 w-4" />
                    <h5 className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                      Эффективность страницы
                    </h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-accent-primary text-[8px] font-black uppercase">
                        Ср. время фокуса
                      </p>
                      <p className="text-accent-primary text-base font-black">12.4с</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-accent-primary text-[8px] font-black uppercase">
                        Кликабельность (CTR)
                      </p>
                      <p className="text-accent-primary text-base font-black">18.2%</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
