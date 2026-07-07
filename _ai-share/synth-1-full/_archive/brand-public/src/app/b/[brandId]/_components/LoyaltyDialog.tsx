'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Zap,
  Star,
  Gift,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoyaltyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
}

export function LoyaltyDialog({ isOpen, onOpenChange, displayName }: LoyaltyDialogProps) {
  const loyaltyStats = {
    level: 2,
    status: 'Gold Client',
    points: 1250,
    totalSpent: 154800,
    nextLevelAt: 200000,
    progress: 65,
    benefits: [
      'Бесплатная экспресс-доставка',
      'Доступ к закрытым распродажам (-24 часа)',
      'Персональный стилист 24/7',
      'Подарок на день рождения',
    ],
    offers: [
      {
        id: 1,
        title: 'Скидка на новую капсулу',
        value: '-15%',
        code: 'GOLD15',
        icon: <Zap className="h-4 w-4" />,
      },
      {
        id: 2,
        title: 'Удвоенные баллы за покупку',
        value: 'x2',
        code: 'DOUBLE',
        icon: <TrendingUp className="h-4 w-4" />,
      },
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface2 max-w-2xl overflow-hidden rounded-xl border-none p-0 shadow-2xl">
        <DialogTitle className="sr-only">Программа лояльности {displayName}</DialogTitle>
        <DialogDescription className="sr-only">
          Детальная информация о вашем статусе и привилегиях
        </DialogDescription>
        <div className="relative">
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-black p-3 text-white">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Trophy className="h-32 w-32 rotate-12" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="border-none bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase text-black">
                  Level {loyaltyStats.level}
                </Badge>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Программа лояльности
                </span>
              </div>
              <h2 className="text-sm font-black uppercase leading-none tracking-tighter">
                {loyaltyStats.status}
              </h2>
              <p className="max-w-md text-sm font-medium text-white/60">
                Вы входите в топ-5% клиентов бренда {displayName}. Спасибо за доверие!
              </p>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                {
                  label: 'Баллы',
                  value: `${loyaltyStats.points} Б`,
                  icon: <Star className="text-yellow-500" />,
                },
                {
                  label: 'Покупок',
                  value: `${loyaltyStats.totalSpent.toLocaleString('ru-RU')} ₽`,
                  icon: <ShoppingBag className="text-blue-500" />,
                },
                {
                  label: 'Статус до',
                  value: '31.12.2026',
                  icon: <Clock className="text-accent-primary" />,
                },
              ].map((stat, i) => (
                <Card key={i} className="rounded-2xl border-none bg-white shadow-sm">
                  <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
                    <div className="bg-bg-surface2 mb-1 flex h-8 w-8 items-center justify-center rounded-full">
                      {stat.icon}
                    </div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-sm font-black uppercase">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progress to next level */}
            <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-end justify-between">
                <div>
                  <h4 className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    До статуса VIP
                  </h4>
                  <p className="text-sm font-black uppercase leading-none">
                    {(loyaltyStats.nextLevelAt - loyaltyStats.totalSpent).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase text-accent">VIP Client</span>
              </div>
              <div className="bg-bg-surface2 relative h-2 w-full overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${loyaltyStats.progress}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-accent"
                />
              </div>
              <p className="text-center text-[9px] font-medium italic text-muted-foreground">
                Совершите покупки на сумму{' '}
                {(loyaltyStats.nextLevelAt - loyaltyStats.totalSpent).toLocaleString('ru-RU')} ₽ для
                перехода на следующий уровень
              </p>
            </div>

            {/* Two Columns: Benefits & Offers */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4 text-green-500" /> Привилегии
                </h3>
                <ul className="space-y-3">
                  {loyaltyStats.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-[11px] font-bold">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                  <Gift className="h-4 w-4 text-accent" /> Уникальные предложения
                </h3>
                <div className="space-y-3">
                  {loyaltyStats.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="group cursor-pointer rounded-2xl border border-accent/10 bg-accent/5 p-4 transition-all hover:bg-accent/10"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
                            {offer.icon}
                          </div>
                          <span className="text-[10px] font-black uppercase leading-tight">
                            {offer.title}
                          </span>
                        </div>
                        <span className="text-sm font-black text-accent">{offer.value}</span>
                      </div>
                      <Button
                        variant="outline"
                        className="h-8 w-full rounded-xl border-accent/20 bg-white text-[9px] font-black uppercase tracking-widest transition-all hover:bg-accent hover:text-white"
                      >
                        Активировать <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
