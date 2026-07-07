'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Search,
  Filter,
  AlertCircle,
  Truck,
  Warehouse,
  Calendar,
  History,
  TrendingUp,
  Download,
  MoreVertical,
  Plus,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';
import type { InventoryItem } from '@/lib/types/b2b';

export function ATSInventoryManager() {
  const { inventoryATS, reserveStock } = useB2BState();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWarehouse, setActiveWarehouse] = useState<'Все' | 'Москва' | 'Дубай' | 'Милан'>(
    'Все'
  );

  const filteredInventory = useMemo(() => {
    return inventoryATS.filter((item: InventoryItem) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const warehouseMap: Record<string, string> = {
        Moscow: 'Москва',
        Dubai: 'Дубай',
        Milan: 'Милан',
      };
      const mappedWarehouse = warehouseMap[item.warehouse] || item.warehouse;
      const matchesWarehouse = activeWarehouse === 'Все' || mappedWarehouse === activeWarehouse;
      return matchesSearch && matchesWarehouse;
    });
  }, [inventoryATS, searchQuery, activeWarehouse]);

  return (
    <div className="min-h-screen space-y-4 bg-white p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-text-primary flex h-8 w-8 items-center justify-center rounded-xl">
              <Warehouse className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-border-default text-text-primary text-[9px] font-black uppercase tracking-widest"
            >
              ATS_Inventory_Live
            </Badge>
          </div>
          <h2 className="text-text-primary text-sm font-black uppercase leading-none tracking-tighter md:text-sm">
            Свободные Запасы
            <br />
            (ATS)
          </h2>
          <p className="text-text-muted max-w-md text-xs font-medium">
            Уровни складских запасов в реальном времени. Управление резервами и мониторинг входящих
            партий продукции.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-bg-surface2 border-border-subtle flex items-center gap-1.5 rounded-2xl border p-1">
            {['Все', 'Москва', 'Дубай', 'Милан'].map((w) => (
              <Button
                key={w}
                onClick={() => setActiveWarehouse(w as any)}
                className={cn(
                  'h-10 rounded-xl px-5 text-[9px] font-black uppercase tracking-widest transition-all',
                  activeWarehouse === w
                    ? 'text-text-primary bg-white shadow-sm'
                    : 'text-text-muted hover:text-text-secondary bg-transparent'
                )}
              >
                {w}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="border-border-subtle h-12 w-12 rounded-2xl p-0">
            <Download className="text-text-muted h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface2 space-y-2 rounded-xl border-none p-4 shadow-md shadow-xl">
          <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">
            Всего единиц
          </p>
          <p className="text-text-primary text-sm font-black">42,500</p>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] font-black">+12% к пр. нед.</span>
          </div>
        </Card>
        <Card className="bg-bg-surface2 space-y-2 rounded-xl border-none p-4 shadow-md shadow-xl">
          <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">
            Активные резервы
          </p>
          <p className="text-accent-primary text-sm font-black">1,240</p>
          <p className="text-text-muted text-[10px] font-medium uppercase">На сумму 15.4M ₽</p>
        </Card>
        <Card className="bg-bg-surface2 space-y-2 rounded-xl border-none p-4 shadow-md shadow-xl">
          <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">
            Ожидается поступление
          </p>
          <p className="text-text-primary text-sm font-black">8,900</p>
          <p className="text-text-muted text-[10px] font-medium uppercase">В след. 14 дней</p>
        </Card>
        <Card className="space-y-2 rounded-xl border-none bg-amber-500 p-4 text-white shadow-md shadow-xl">
          <p className="text-[8px] font-black uppercase tracking-widest text-white/60">
            Прогноз дефицита
          </p>
          <p className="text-sm font-black text-white">12 моделей</p>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase">Требуется пополнение</span>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <div className="border-border-subtle overflow-hidden rounded-xl border bg-white shadow-2xl shadow-md">
        <div className="border-border-subtle bg-bg-surface2/30 flex items-center justify-between border-b p-4">
          <div className="relative w-96">
            <Search className="text-text-muted absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Поиск по SKU или названию..."
              className="h-12 rounded-2xl border-none bg-white pl-12 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-text-muted gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <History className="h-4 w-4" /> Лог резервов
            </Button>
            <Button className="bg-text-primary h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              <Plus className="h-4 w-4" /> Массовый резерв
            </Button>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="text-text-muted border-border-subtle border-b px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest">
                Детали модели
              </th>
              <th className="text-text-muted border-border-subtle border-b px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest">
                Склад
              </th>
              <th className="text-text-muted border-border-subtle border-b px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest">
                Доступно
              </th>
              <th className="text-text-muted border-border-subtle border-b px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest">
                В резерве
              </th>
              <th className="text-text-muted border-border-subtle border-b px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest">
                След. поставка
              </th>
              <th className="text-text-muted border-border-subtle border-b px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item: InventoryItem) => (
              <tr
                key={item.sku}
                className="hover:bg-bg-surface2/80 group transition-all duration-300"
              >
                <td className="border-border-subtle border-b px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-bg-surface2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
                      <img
                        src={`https://placehold.co/100x100/f1f5f9/94a3b8?text=${item.sku.split('-')[0]}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-text-primary text-sm font-black uppercase tracking-tight">
                        {item.productName}
                      </p>
                      <p className="text-text-muted text-[9px] font-bold uppercase tracking-widest">
                        {item.sku}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="border-border-subtle border-b px-8 py-6">
                  <div className="flex items-center gap-2">
                    <Warehouse className="text-text-muted h-3.5 w-3.5" />
                    <span className="text-text-primary text-[10px] font-black uppercase">
                      {item.warehouse} Hub
                    </span>
                  </div>
                </td>
                <td className="border-border-subtle border-b px-8 py-6 text-center">
                  <Badge
                    className={cn(
                      'border-none px-4 py-1.5 text-sm font-black',
                      item.available > 100
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    )}
                  >
                    {item.available} ед.
                  </Badge>
                </td>
                <td className="border-border-subtle border-b px-8 py-6 text-center">
                  <p className="text-text-muted text-sm font-black">{item.reserved}</p>
                </td>
                <td className="border-border-subtle border-b px-8 py-6">
                  {item.incoming.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-accent-primary flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase">
                          {item.incoming[0].date}
                        </span>
                      </div>
                      <p className="text-text-muted text-[9px] font-bold uppercase">
                        Qty: +{item.incoming[0].quantity}
                      </p>
                    </div>
                  ) : (
                    <span className="text-text-muted text-[10px] font-black uppercase">
                      None Scheduled
                    </span>
                  )}
                </td>
                <td className="border-border-subtle border-b px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => reserveStock(item.sku, 1, 'retailer-1')}
                      className="bg-bg-surface2 text-text-primary hover:bg-text-primary/90 h-10 rounded-xl px-5 text-[9px] font-black uppercase tracking-widest shadow-sm transition-all hover:text-white"
                    >
                      Быстрый резерв
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logistics Intelligence Footer */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="bg-text-primary space-y-6 rounded-xl border-none p-4 text-white shadow-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-tight">
              Здоровье цепочки поставок
            </h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-white/40">
                Uptime производства
              </span>
              <span className="text-[10px] font-black text-emerald-400">98.2%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[98%] bg-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <ShieldCheck className="text-accent-primary h-5 w-5" />
            </div>
            <h4 className="text-text-primary text-sm font-black uppercase tracking-tight">
              Авто-истечение резерва
            </h4>
          </div>
          <p className="text-text-secondary text-[10px] font-medium leading-relaxed">
            Все ручные резервы истекают через 24 часа неактивности. Автоматические уведомления будут
            отправлены региональному менеджеру.
          </p>
          <div className="flex items-center gap-2">
            <div className="bg-accent-primary h-2 w-2 animate-pulse rounded-full" />
            <span className="text-accent-primary text-[8px] font-black uppercase tracking-widest">
              Активный мониторинг
            </span>
          </div>
        </Card>

        <Card className="space-y-4 rounded-xl border-none bg-white p-4 shadow-md shadow-xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-bg-surface2 flex h-10 w-10 items-center justify-center rounded-xl">
              <Package className="text-text-primary h-5 w-5" />
            </div>
            <h4 className="text-text-primary text-sm font-black uppercase tracking-tight">
              Экспорт манифеста
            </h4>
          </div>
          <Button className="bg-text-primary h-12 w-full gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white">
            Создать CSV манифест <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-10 w-full gap-2 rounded-xl text-[9px] font-black uppercase tracking-widest"
          >
            Документация API Webhook <ArrowRight className="h-3 w-3" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
