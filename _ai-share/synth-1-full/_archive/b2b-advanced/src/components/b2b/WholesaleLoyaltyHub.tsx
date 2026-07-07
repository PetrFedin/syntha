'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Gift,
  TrendingUp,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Crown,
  History,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';

export function WholesaleLoyaltyHub() {
  const { retailerLoyalty } = useB2BState();
  const points = retailerLoyalty['retailer-1'] || 12450;

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-3">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-amber-200 text-[9px] font-black uppercase tracking-widest text-amber-600"
            >
              Elite_Partner_v2.0
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Partner Rewards
          </h2>
          <p className="max-w-md text-xs font-medium text-slate-400">
            Earn points for early pre-orders, volume milestones, and ecosystem engagement. Unlock
            exclusive discounts and priority production slots.
          </p>
        </div>

        <Card className="flex items-center gap-3 rounded-xl border-none bg-white p-4 shadow-xl shadow-amber-200/20">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Available Points
            </p>
            <div className="flex items-center gap-3">
              <span className="text-base font-black tabular-nums text-slate-900">
                {points.toLocaleString('ru-RU')}
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                <Star className="h-3.5 w-3.5 fill-amber-600 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="h-12 w-px bg-slate-100" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Partner Tier
            </p>
            <Badge className="border-none bg-slate-900 px-3 py-1 text-[10px] font-black uppercase text-white">
              PLATINUM
            </Badge>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Tier Progress */}
        <div className="space-y-4 lg:col-span-8">
          <Card className="relative overflow-hidden rounded-xl border-none bg-slate-900 p-3 text-white shadow-2xl shadow-slate-200/50">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <TrendingUp className="h-64 w-64" />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight">Path to Diamond</h3>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase text-emerald-400">
                    +2,400 points this month
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between text-[10px] font-black uppercase">
                  <span>Current: Platinum</span>
                  <span className="text-amber-400">Next: Diamond (25,000 pts)</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(points / 25000) * 100}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                  />
                </div>
                <p className="text-right text-[11px] font-medium italic text-slate-400">
                  "You're 12,550 points away from unlocking 2.5% additional wholesale discount."
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-3">
                {[
                  { label: 'Priority Production', status: 'UNLOCKED', icon: Zap },
                  { label: 'Private Showroom Access', status: 'UNLOCKED', icon: Crown },
                  { label: 'Extended Payment Terms', status: 'DIAMOND ONLY', icon: ShieldCheck },
                ].map((perk, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-2xl border p-3 transition-all',
                      perk.status === 'UNLOCKED'
                        ? 'border-white/10 bg-white/5'
                        : 'border-white/5 bg-white/[0.02] opacity-40'
                    )}
                  >
                    <perk.icon
                      className={cn(
                        'mb-3 h-5 w-5',
                        perk.status === 'UNLOCKED' ? 'text-amber-400' : 'text-slate-500'
                      )}
                    />
                    <p className="mb-1 text-[10px] font-black uppercase">{perk.label}</p>
                    <p
                      className={cn(
                        'text-[8px] font-bold uppercase',
                        perk.status === 'UNLOCKED' ? 'text-emerald-400' : 'text-slate-500'
                      )}
                    >
                      {perk.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <h3 className="px-2 text-left text-sm font-black uppercase tracking-widest text-slate-400">
              Активные миссии
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                {
                  title: 'Ранний предзаказ',
                  reward: '+1 500 б.',
                  desc: 'Оформите заказ FW26 до 20 февраля.',
                  progress: 80,
                },
                {
                  title: 'Эко-чемпион',
                  reward: '+2 000 б.',
                  desc: 'Закажите позиции из линейки Recycled Tech.',
                  progress: 45,
                },
              ].map((mission, i) => (
                <Card
                  key={i}
                  className="group space-y-6 rounded-xl border-none bg-white p-4 shadow-xl shadow-slate-200/50 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                        {mission.title}
                      </h4>
                      <p className="text-[10px] font-medium leading-relaxed text-slate-400">
                        {mission.desc}
                      </p>
                    </div>
                    <Badge className="border-none bg-amber-100 px-3 py-1 text-[10px] font-black uppercase text-amber-600">
                      {mission.reward}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                      <span>Progress</span>
                      <span>{mission.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-50">
                      <div
                        className="h-full bg-slate-900 transition-all duration-1000"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Redemption & History */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-2xl shadow-slate-200/50">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Redeem Points
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Free Global Shipping', cost: 5000, icon: Gift },
                { title: 'Custom POS Branding', cost: 12000, icon: Crown },
                { title: 'Priority Sample Set', cost: 3500, icon: Zap },
              ].map((reward, i) => (
                <button
                  key={i}
                  className="group flex w-full items-center justify-between rounded-2xl border border-transparent bg-slate-50 p-4 transition-all hover:border-slate-200 hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <reward.icon className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase leading-none text-slate-900">
                        {reward.title}
                      </p>
                      <p className="mt-1 text-[8px] font-bold uppercase text-slate-400">
                        {reward.cost.toLocaleString('ru-RU')} points
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:text-slate-900" />
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-slate-100 text-[9px] font-black uppercase tracking-widest"
            >
              View All Rewards
            </Button>
          </Card>

          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-slate-400" />
              <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                История баллов
              </h4>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Предоплата по заказу FW26', pts: '+4,500', date: '5 фев' },
                { title: 'Бонус за ранний отзыв', pts: '+500', date: '28 янв' },
                { title: 'Списание: ваучер на доставку', pts: '-2,500', date: '15 янв' },
              ].map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase text-slate-900">{entry.title}</p>
                    <p className="text-[8px] font-bold uppercase text-slate-400">{entry.date}</p>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-black',
                      entry.pts.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    {entry.pts}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
