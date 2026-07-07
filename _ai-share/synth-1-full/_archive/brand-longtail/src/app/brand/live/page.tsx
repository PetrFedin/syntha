'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Video,
  Radio,
  Users,
  MessageSquare,
  Heart,
  ShoppingBag,
  Zap,
  Activity,
  Settings,
  Play,
  Pause,
  Mic,
  Monitor,
  Share2,
  Eye,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

export default function BrandLiveDashboard() {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(1242);

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-6 pb-16 duration-300 animate-in fade-in"
    >
      <RegistryPageHeader
        title="Live Broadcast Control"
        leadPlain={
          isLive
            ? 'В эфире: презентация коллекции SS26'
            : 'Ожидание запуска. Прямые эфиры для B2B и B2C; связь с Media, каталогом и предзаказами.'
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Radio className="size-5 shrink-0 text-rose-500" aria-hidden />
            <Badge variant="outline" className="text-[9px]">
              Media
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              Products
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.media}>Media</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.preOrders}>
                <Package className="mr-1 h-3 w-3" /> Pre-orders
              </Link>
            </Button>
            <Button
              onClick={() => setIsLive(!isLive)}
              className={cn(
                'h-10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all',
                isLive ? 'bg-text-primary text-white' : 'bg-rose-600 text-white'
              )}
            >
              {isLive ? 'Завершить эфир' : 'Выйти в прямой эфир'}
            </Button>
            <Button
              variant="outline"
              className="border-border-default h-10 w-10 rounded-2xl"
              type="button"
              aria-label="Настройки эфира"
            >
              <Settings className="text-text-muted h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Live Preview / Producer View */}
        <div className="space-y-6 lg:col-span-8">
          <Card className="relative aspect-video overflow-hidden rounded-xl border-none bg-black shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
              {!isLive ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <Play className="h-8 w-8 fill-white text-white" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Нажмите кнопку вверху, чтобы начать трансляцию
                  </p>
                </div>
              ) : (
                <div className="bg-text-primary/90 flex h-full w-full items-center justify-center">
                  <Video className="h-24 w-24 text-white/10" />
                  <div className="absolute left-8 top-4 flex gap-3">
                    <Badge className="border-none bg-rose-600 text-[10px] font-black text-white">
                      LIVE
                    </Badge>
                    <Badge className="border-none bg-black/40 text-[10px] font-black text-white backdrop-blur-md">
                      00:42:12
                    </Badge>
                  </div>
                  <div className="absolute right-8 top-4">
                    <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md">
                      <Eye className="h-3 w-3 text-white" />
                      <span className="text-[10px] font-black text-white">
                        {viewers.toLocaleString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isLive && (
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20">
                    <Monitor className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-accent-primary h-12 rounded-xl px-6 text-[10px] font-black uppercase text-white">
                    Pinned: Tech Parka v2
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-text-primary flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                  <ShoppingBag className="h-4 w-4 text-rose-500" /> Продажи в эфире
                </h4>
                <Badge className="border-none bg-emerald-50 text-[8px] font-black text-emerald-600">
                  Real-time
                </Badge>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Urban Tech Parka', qty: 12, price: '18,000 ₽' },
                  { name: 'Cyber Silk Scarf', qty: 42, price: '4,500 ₽' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="border-border-subtle flex items-center justify-between border-b py-2"
                  >
                    <div>
                      <p className="text-text-primary text-[10px] font-black uppercase">
                        {item.name}
                      </p>
                      <p className="text-text-muted text-[9px] font-bold uppercase">
                        {item.qty} заказов
                      </p>
                    </div>
                    <span className="text-accent-primary text-sm font-black">{item.price}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-text-primary space-y-6 rounded-xl border-none p-4 text-white shadow-xl">
              <h4 className="text-accent-primary flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                <MessageSquare className="h-4 w-4" /> Чат модерация
              </h4>
              <div className="custom-scrollbar max-h-[150px] space-y-4 overflow-y-auto pr-2">
                {[
                  { user: '@alex_v', msg: 'Какая плотность у ткани?' },
                  { user: '@stylist_pro', msg: 'Это будет в новых цветах?' },
                  { user: '@retail_buyer', msg: 'Какая минимальная партия для опта?' },
                ].map((chat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-white/40">{chat.user}</p>
                    <p className="text-[11px] font-medium leading-relaxed">{chat.msg}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Side Panel: Analytics & Controls */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="bg-accent-primary relative space-y-6 overflow-hidden rounded-xl border-none p-4 text-white shadow-xl">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Activity className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-6">
              <Badge className="border-none bg-white/20 text-[8px] font-black uppercase text-white">
                Conversion Insights
              </Badge>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span>Удержание аудитории</span>
                    <span>84%</span>
                  </div>
                  <Progress value={84} className="h-1 bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span>CTR в корзину</span>
                    <span>12.4%</span>
                  </div>
                  <Progress value={65} className="h-1 bg-white/10" />
                </div>
              </div>
              <p className="text-accent-primary/30 text-[10px] font-medium italic leading-relaxed">
                «Упоминание экологичности ткани увеличило поток заказов на 15% за последние 2
                минуты».
              </p>
            </div>
          </Card>

          <div className="border-border-subtle space-y-6 rounded-xl border bg-white p-4 shadow-xl">
            <h4 className="text-text-primary text-[11px] font-black uppercase tracking-widest">
              Управление Офферами
            </h4>
            <div className="space-y-4">
              <Button className="h-12 w-full rounded-xl border border-rose-100 bg-rose-50 text-[9px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-600 hover:text-white">
                Спеццена для эфира ON
              </Button>
              <Button
                variant="outline"
                className="border-border-default text-text-muted h-12 w-full rounded-xl text-[9px] font-black uppercase"
              >
                Запустить опрос
              </Button>
              <Button
                variant="outline"
                className="border-border-default text-text-muted h-12 w-full rounded-xl text-[9px] font-black uppercase"
              >
                Разыграть купон
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CabinetPageContent>
  );
}
