'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, RotateCcw, Eye, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

interface RecentOrder {
  id: string;
  name: string;
  sku: string;
  lastOrderDate: string;
  lastQuantity: number;
  image: string;
  price: number;
  inStock: boolean;
  brand: string;
}

export function QuickReorderBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data - последние заказанные товары
  const recentOrders: RecentOrder[] = [
    {
      id: '1',
      name: 'Cyber Tech Parka',
      sku: 'CTP-26-001',
      brand: 'Syntha Lab',
      lastOrderDate: '2026-01-15',
      lastQuantity: 50,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=100',
      price: 28500,
      inStock: true,
    },
    {
      id: '2',
      name: 'Nordic Wool Sweater',
      sku: 'NWS-26-042',
      brand: 'Nordic Wool',
      lastOrderDate: '2026-01-10',
      lastQuantity: 30,
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=100',
      price: 15000,
      inStock: true,
    },
    {
      id: '3',
      name: 'Silk Road Scarf',
      sku: 'SRS-26-088',
      brand: 'Radical Chic',
      lastOrderDate: '2026-01-05',
      lastQuantity: 100,
      image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=100',
      price: 8500,
      inStock: false,
    },
    {
      id: '4',
      name: 'Urban Cargo Pants',
      sku: 'UCP-26-101',
      brand: 'Syntha Lab',
      lastOrderDate: '2026-01-03',
      lastQuantity: 75,
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=100',
      price: 12000,
      inStock: true,
    },
  ];

  const handleReorder = (item: RecentOrder) => {
    alert(
      `✅ Добавлено ${item.lastQuantity} шт. ${item.name} в корзину\n\nИтого: ${(item.price * item.lastQuantity).toLocaleString('ru-RU')} ₽`
    );
  };

  return (
    <Card className="border-accent-primary/20 sticky top-0 z-40 rounded-none border-x-0 border-b-2 border-t-0 bg-white/95 shadow-lg backdrop-blur-md">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-3">
          <div className="flex flex-shrink-0 items-center gap-2">
            <RotateCcw className="text-accent-primary h-5 w-5" />
            <span className="text-text-primary text-sm font-black uppercase">Quick Reorder</span>
            <Badge className="bg-accent-primary/15 text-accent-primary border-none text-[7px] font-black uppercase">
              Last 30 Days
            </Badge>
          </div>

          <div className="no-scrollbar flex flex-1 items-center gap-3 overflow-x-auto">
            {recentOrders.slice(0, isExpanded ? 10 : 4).map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex flex-shrink-0 items-center gap-3 rounded-xl border-2 p-2 transition-all',
                  item.inStock
                    ? 'bg-bg-surface2 border-border-default hover:border-accent-primary/30'
                    : 'border-rose-200 bg-rose-50'
                )}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />

                <div className="min-w-0">
                  <h4 className="text-text-primary w-32 truncate text-[10px] font-black uppercase leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-text-secondary flex items-center gap-1 text-[9px]">
                    <Clock className="h-3 w-3" />
                    {item.lastQuantity} шт •{' '}
                    {new Date(item.lastOrderDate).toLocaleDateString('ru-RU', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-bg-surface2 h-8 w-8 p-0"
                    asChild
                  >
                    <Link
                      href={`${LEGACY_ROUTES.shop.b2bCatalog}?sku=${encodeURIComponent(item.sku)}`}
                      title="Открыть в B2B каталоге"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    className={cn(
                      'h-8 rounded-lg px-3 text-[8px] font-black uppercase',
                      item.inStock
                        ? 'bg-accent-primary hover:bg-accent-primary'
                        : 'bg-text-muted cursor-not-allowed'
                    )}
                    onClick={() => item.inStock && handleReorder(item)}
                    disabled={!item.inStock}
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    {item.inStock ? 'Reorder' : 'Out'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 flex-shrink-0 rounded-xl text-[8px] font-black uppercase"
            asChild
          >
            <Link href={ROUTES.shop.b2bOrders}>Все заказы B2B</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
