'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SkuAnalytics } from '@/components/brand/sku-analytics';
import { products } from '@/lib/products';
import type { Product, Promotion, PromotionCreative } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';

interface PromotionAnalyticsDialogProps {
  promotion: Promotion;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const mockCreatives: PromotionCreative[] = [
  {
    id: 'c1',
    url: 'https://images.unsplash.com/photo-1551966584-06927f3b8e72?q=80&w=800',
    performance: { views: 8250, clicks: 371, ctr: 4.5, roas: 2.5, cpa: 450 },
  },
  {
    id: 'c2',
    url: 'https://images.unsplash.com/photo-1524638431109-93d95c968f03?q=80&w=800',
    performance: { views: 4250, clicks: 106, ctr: 2.5, roas: 1.8, cpa: 620 },
  },
];

export function PromotionAnalyticsDialog({
  promotion,
  isOpen,
  onOpenChange,
}: PromotionAnalyticsDialogProps) {
  const brandProducts = useMemo(() => {
    return promotion ? products.filter((p) => p.brand === promotion.brandName) : [];
  }, [promotion]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-7xl flex-col">
        <DialogHeader>
          <DialogTitle>Аналитика продвижения товара</DialogTitle>
          <DialogDescription>
            Детальная статистика эффективности для "{promotion.productName}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 overflow-y-auto py-4 pr-2">
          {brandProducts.length > 0 && (
            <SkuAnalytics
              brandProducts={brandProducts}
              initialSku={promotion.productId}
              isDialogMode={true}
              promotion={promotion}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Анализ креативов (A/B Тест)</CardTitle>
              <CardDescription>
                Сравнение эффективности различных рекламных баннеров.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {mockCreatives.map((creative, index) => (
                <Card key={creative.id} className={index === 0 ? 'border-green-500' : ''}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">
                      Креатив {index + 1}{' '}
                      {index === 0 && (
                        <span className="font-bold text-green-500">(Победитель)</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md bg-muted">
                      <Image
                        src={creative.url}
                        alt={`Creative ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-sm font-bold">{creative.performance?.ctr}%</p>
                        <p className="text-xs text-muted-foreground">CTR</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{creative.performance?.cpa} ₽</p>
                        <p className="text-xs text-muted-foreground">CPA</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{creative.performance?.roas}x</p>
                        <p className="text-xs text-muted-foreground">ROAS</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {creative.performance?.clicks.toLocaleString('ru-RU')}
                        </p>
                        <p className="text-xs text-muted-foreground">Клики</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
