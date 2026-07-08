'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { getMarketroomLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import {
  Store,
  LayoutGrid,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

/** Мок: лук = набор товаров из каталога */
const MOCK_LOOKS = [
  {
    id: 'look-1',
    title: 'Офисный лук FW26',
    productIds: ['p1', 'p2', 'p3'],
    productNames: ['Пиджак приталенный', 'Брюки чинос', 'Рубашка оксфорд'],
    totalPrice: 24900,
  },
  {
    id: 'look-2',
    title: 'Вечерний образ',
    productIds: ['p4', 'p5'],
    productNames: ['Платье миди', 'Клатч'],
    totalPrice: 18900,
  },
  {
    id: 'look-3',
    title: 'Casual выходного дня',
    productIds: ['p6', 'p7', 'p8'],
    productNames: ['Свитшот оверсайз', 'Джинсы скинни', 'Кроссовки'],
    totalPrice: 15200,
  },
];

/** Мок: тренды для AI Trend Radar */
const MOCK_TRENDS = [
  { id: 't1', label: 'Оверсайз', score: 94, change: 'up' },
  { id: 't2', label: 'Минимализм', score: 88, change: 'up' },
  { id: 't3', label: 'Устойчивая мода', score: 85, change: 'stable' },
  { id: 't4', label: 'Яркие акценты', score: 82, change: 'up' },
  { id: 't5', label: 'Ретро 90-х', score: 78, change: 'down' },
];

export default function MarketroomPage() {
  return (
    <div className="from-bg-surface2 to-bg-surface min-h-screen bg-gradient-to-b">
      <CabinetPageContent maxWidth="5xl" className="space-y-12 py-8 pb-16">
        {/* Шапка */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black uppercase tracking-tight">
              <Store className="text-accent-primary h-8 w-8" /> Маркетрум
            </h1>
            <p className="text-text-secondary mt-1">
              Каталог, луки и тренды. Покупка в один клик, привязка к заказу и корзине.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.client.catalog}>Каталог</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.client.orders}>Мои заказы</Link>
            </Button>
          </div>
        </header>

        {/* Shop-the-Look — луки из каталога, привязка к заказу/корзине */}
        <section id="shop-the-look" className="scroll-mt-8">
          <div className="mb-4 flex items-center gap-2">
            <LayoutGrid className="text-accent-primary h-5 w-5" />
            <h2 className="text-xl font-bold uppercase">Shop-the-Look</h2>
          </div>
          <p className="text-text-secondary mb-4 text-sm">
            Готовые луки из каталога. Добавьте весь лук в корзину или оформите заказ одним кликом.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_LOOKS.map((look) => (
              <Card
                key={look.id}
                className="border-border-default overflow-hidden rounded-xl border shadow-sm"
              >
                <div className="from-accent-primary/15 to-bg-surface2 flex h-32 items-center justify-center bg-gradient-to-br">
                  <ShoppingBag className="text-accent-primary h-12 w-12" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{look.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {look.productNames.join(' · ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="text-sm font-semibold">
                    {look.totalPrice.toLocaleString('ru-RU')} ₽
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gap-1" asChild>
                      <Link href={`${ROUTES.client.catalog}?look=${look.id}`}>
                        <ShoppingBag className="h-3.5 w-3.5" /> В корзину
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`${ROUTES.client.orders}?new=1&look=${look.id}`}>Заказ</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Trend Radar в публичном Маркетруме */}
        <section id="trend-radar" className="scroll-mt-8">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-bold uppercase">AI Trend Radar</h2>
            <Badge variant="secondary" className="gap-1 text-[9px]">
              <Sparkles className="h-3 w-3" /> AI
            </Badge>
          </div>
          <p className="text-text-secondary mb-4 text-sm">
            Актуальные тренды в Маркетруме по данным поиска и продаж. Обновляется автоматически.
          </p>
          <Card className="border-border-default rounded-xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {MOCK_TRENDS.map((t) => (
                  <Badge
                    key={t.id}
                    variant="outline"
                    className="border-border-default hover:border-accent-primary/30 hover:bg-accent-primary/10 cursor-default rounded-full px-3 py-2 text-xs transition-colors"
                  >
                    <span className="font-medium">{t.label}</span>
                    <span className="text-text-muted ml-1.5">{t.score}%</span>
                    {t.change === 'up' && <span className="ml-0.5 text-emerald-500">↑</span>}
                    {t.change === 'down' && <span className="ml-0.5 text-rose-500">↓</span>}
                  </Badge>
                ))}
              </div>
              <p className="text-text-muted mt-3 text-[11px]">
                При API: расчёт трендов по аналитике платформы и внешним источникам.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Импорт контента из 1С/Excel */}
        <section className="border-border-subtle bg-bg-surface2/80 rounded-xl border p-4">
          <p className="text-text-secondary flex items-center gap-2 text-xs">
            <FileSpreadsheet className="h-4 w-4" />
            Импорт контента из 1С/Excel: при необходимости каталог и луки можно выгружать из учётных
            систем. Настройка в кабинете бренда.
          </p>
        </section>

        <RelatedModulesBlock
          links={getMarketroomLinks()}
          title="Каталог, заказы, аналитика Маркетрум"
        />
      </CabinetPageContent>
    </div>
  );
}
