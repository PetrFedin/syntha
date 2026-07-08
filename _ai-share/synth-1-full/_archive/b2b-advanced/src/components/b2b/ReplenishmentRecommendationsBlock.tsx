'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, ShoppingCart, TrendingUp, Minus, Package } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import {
  getReplenishmentRecommendations,
  type ReplenishmentRecommendation,
} from '@/lib/b2b/replenishment-recommendations';
import { cn } from '@/lib/utils';

interface ReplenishmentRecommendationsBlockProps {
  /** Фильтр по бренду (для агентского кабинета) */
  brandId?: string;
  /** Макс. строк в блоке */
  maxItems?: number;
  /** Компактный вид (только список без лишнего текста) */
  compact?: boolean;
}

export function ReplenishmentRecommendationsBlock({
  brandId,
  maxItems = 5,
  compact = false,
}: ReplenishmentRecommendationsBlockProps) {
  const recommendations = getReplenishmentRecommendations(brandId).slice(0, maxItems);
  const reorderCount = recommendations.filter((r) => r.action === 'reorder').length;
  const skipCount = recommendations.filter((r) => r.action === 'skip').length;

  if (recommendations.length === 0) {
    return (
      <Card
        className={cn(
          'border-border-subtle',
          compact && 'bg-bg-surface2/80 border-none shadow-none'
        )}
      >
        <CardContent className="p-4 text-center">
          <Package className="text-text-muted mx-auto mb-2 h-10 w-10" />
          <p className="text-text-secondary text-sm">
            Нет данных для рекомендаций пополнения. Оформите заказы — появятся подсказки по
            sell-through.
          </p>
          <Button variant="outline" size="sm" className="mt-3 rounded-lg" asChild>
            <Link href={ROUTES.shop.b2bReorder}>Reorder</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn('border-border-subtle', compact && 'bg-bg-surface2/80 border-none shadow-none')}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCcw className="text-accent-primary h-5 w-5" />
            <CardTitle className="text-base font-black uppercase tracking-tight">
              Рекомендации к пополнению
            </CardTitle>
          </div>
          <div className="flex gap-1.5">
            {reorderCount > 0 && (
              <Badge variant="default" className="bg-accent-primary text-[9px] font-black">
                Дозаказ: {reorderCount}
              </Badge>
            )}
            {skipCount > 0 && (
              <Badge variant="secondary" className="text-[9px] font-black">
                Не дозаказ: {skipCount}
              </Badge>
            )}
          </div>
        </div>
        {!compact && (
          <CardDescription>
            Прогноз по sell-through и остатку. Дозаказать X шт. или не дозаказывать.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((r) => (
          <RecommendationRow key={`${r.orderId}-${r.sku}`} item={r} compact={compact} />
        ))}
        <div className="border-border-subtle flex flex-wrap gap-2 border-t pt-2">
          <Button size="sm" className="rounded-lg text-[10px] font-black uppercase" asChild>
            <Link href={ROUTES.shop.b2bMatrix}>
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> В матрицу заказа
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-[10px] font-black uppercase"
            asChild
          >
            <Link href={ROUTES.shop.b2bReorder}>Reorder по истории</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationRow({
  item,
  compact,
}: {
  item: ReplenishmentRecommendation;
  compact?: boolean;
}) {
  const isReorder = item.action === 'reorder';
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border p-3 text-left',
        isReorder
          ? 'bg-accent-primary/15 border-accent-primary/20'
          : 'bg-bg-surface2 border-border-subtle'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text-primary truncate text-xs font-black uppercase">
          {item.productName}
        </p>
        <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wide">
          {item.sku} · {item.brand}
        </p>
        {!compact && (
          <p className="text-text-secondary mt-0.5 text-[10px]">
            Sell-through {Math.round(item.sellThroughRate * 100)}% · Остаток: {item.currentStock}{' '}
            шт.
          </p>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {isReorder ? (
          <>
            <span className="text-accent-primary text-sm font-black">+{item.suggestedQty} шт.</span>
            <TrendingUp className="text-accent-primary h-4 w-4" />
            <Badge className="bg-accent-primary border-none text-[8px] font-black">
              Дозаказать
            </Badge>
          </>
        ) : (
          <>
            <Minus className="text-text-muted h-4 w-4" />
            <Badge variant="secondary" className="text-[8px] font-black">
              Не дозаказывать
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}
