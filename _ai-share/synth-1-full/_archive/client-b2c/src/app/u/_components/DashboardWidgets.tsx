import React from 'react';
import Image from 'next/image';
import { Sparkles, Info, Brain, Plus, TrendingDown, Gift, Zap, Rocket, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function RecommendationCard({ item }: { item: any }) {
  const badge =
    item.type === 'promo'
      ? { label: 'Promo', color: 'bg-blue-600 shadow-blue-600/20' }
      : item.type === 'points'
        ? { label: 'Points', color: 'bg-purple-600 shadow-purple-600/20' }
        : item.oldPrice
          ? { label: 'Outlet', color: 'bg-zinc-800 shadow-zinc-800/20' }
          : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group cursor-pointer space-y-2 duration-500 animate-in zoom-in-95">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl">
            <Image
              src={item.img}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg border border-indigo-100 bg-white/90 px-1.5 py-0.5 text-[9px] font-bold shadow-sm backdrop-blur-md">
              <Sparkles className="h-2.5 w-2.5 text-indigo-600" />
              {item.match}%
            </div>
            {badge && (
              <div
                className={cn(
                  'absolute left-2 top-2 rounded-lg px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white shadow-lg',
                  badge.color
                )}
              >
                {badge.label}
              </div>
            )}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-900/60 via-transparent to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 w-full rounded-lg border-none bg-white text-[9px] font-bold uppercase text-slate-900 shadow-lg shadow-indigo-600/20 hover:bg-slate-50"
              >
                Quick View
              </Button>
            </div>
          </div>
          <div className="space-y-0.5 px-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="text-[8px] font-bold uppercase leading-none tracking-widest text-slate-400">
                {item.brand}
              </div>
              <div className="text-[10px] font-bold tabular-nums leading-none text-slate-900">
                {item.type === 'points' ? item.pointsPrice : item.price}
              </div>
            </div>
            <h4 className="truncate text-[11px] font-bold uppercase tracking-tight text-slate-800">
              {item.name}
            </h4>
            <div className="pt-0.5">
              <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-indigo-600 opacity-60 transition-opacity hover:underline group-hover:opacity-100">
                AI Match Logic
                <Info className="h-2 w-2" />
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md overflow-hidden rounded-xl border border-slate-100 bg-white p-0 shadow-2xl">
        <div className="relative h-56 w-full">
          <Image src={item.img} alt={item.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          <div className="absolute bottom-3 left-5 right-5">
            <Badge className="mb-1.5 h-5 border-none bg-indigo-600 px-2 text-[8px] font-bold uppercase tracking-widest shadow-lg">
              Style DNA Match: {item.match}%
            </Badge>
            <DialogHeader>
              <DialogTitle className="font-headline text-base font-bold uppercase leading-none tracking-tighter text-slate-900 drop-shadow-sm">
                {item.name}
              </DialogTitle>
            </DialogHeader>
          </div>
        </div>
        <div className="space-y-5 p-3">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-indigo-600">
              <Brain className="h-3.5 w-3.5" />
              AI Intelligence Summary
            </div>
            <p className="border-l-2 border-indigo-100 py-0.5 pl-3 text-[11px] font-bold uppercase italic leading-relaxed text-slate-500 opacity-80">
              {item.type === 'promo'
                ? `"Found in your wishlist. Personal promo ${item.promo} applied for maximum leverage today."`
                : item.type === 'points'
                  ? `"High-yield points redemption available. Strategic value optimized for your capital profile."`
                  : `"Aligns with 'Minimalism' Style DNA. 90% palette overlap with your recent Syntha acquisitions."`}
            </p>
          </div>

          {item.type === 'promo' && (
            <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-3 shadow-sm">
              <div>
                <div className="mb-0.5 text-[8px] font-bold uppercase tracking-widest text-blue-600">
                  Voucher Code
                </div>
                <div className="font-mono text-base font-bold uppercase tracking-wider text-blue-900">
                  {item.promo}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-lg border-blue-200 text-[9px] font-bold uppercase text-blue-600 hover:bg-blue-100"
              >
                Copy
              </Button>
            </div>
          )}

          {item.type === 'points' && (
            <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 p-3 shadow-sm">
              <div>
                <div className="mb-0.5 text-[8px] font-bold uppercase tracking-widest text-indigo-600">
                  Points Value
                </div>
                <div className="text-base font-bold tabular-nums text-indigo-900">
                  {item.pointsPrice} <span className="text-[10px] opacity-60">+ 1,200 pts</span>
                </div>
              </div>
              <Badge className="h-5 bg-indigo-600 px-2 text-[8px] font-bold uppercase tracking-widest">
                Available
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div className="group/stat rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-inner transition-all hover:border-indigo-100 hover:bg-white">
              <div className="mb-1 text-[8px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover/stat:text-indigo-600">
                Style Synergy
              </div>
              <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-tight text-slate-900">
                <Plus className="h-2.5 w-2.5 text-emerald-500" />
                {item.synergy} combinations
              </div>
            </div>
            <div className="group/stat rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-inner transition-all hover:border-indigo-100 hover:bg-white">
              <div className="mb-1 text-[8px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover/stat:text-indigo-600">
                Economic Benefit
              </div>
              <div className="text-xs font-bold uppercase tracking-tight text-slate-900">
                {item.benefit}
              </div>
            </div>
          </div>
          <div className="group/stat rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-inner transition-all hover:border-indigo-100 hover:bg-white">
            <div className="mb-1 text-[8px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover/stat:text-indigo-600">
              Market Rarity
            </div>
            <div className="text-xs font-bold uppercase tracking-tight text-slate-900">
              {item.rarity}
            </div>
          </div>
          <Button className="h-10 w-full rounded-xl border-none bg-slate-900 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-600">
            {item.type === 'points'
              ? `Redeem Points — ${item.pointsPrice}`
              : `Add to Inventory — ${item.price}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OfferCoupon({ type, brand, title, desc, expiry, color }: any) {
  const colors: any = {
    emerald:
      'from-emerald-50/50 to-teal-50/50 border-emerald-100 text-emerald-900 hover:border-emerald-300',
    accent:
      'from-indigo-50/50 to-indigo-100/50 border-indigo-100 text-indigo-900 hover:border-indigo-300',
    purple:
      'from-purple-50/50 to-indigo-50/50 border-purple-100 text-purple-900 hover:border-purple-300',
    indigo:
      'from-indigo-50/50 to-blue-50/50 border-indigo-100 text-indigo-900 hover:border-indigo-300',
  };

  const iconColors: any = {
    emerald: 'bg-emerald-500/10 text-emerald-600 shadow-inner border border-emerald-100/50',
    accent: 'bg-indigo-500/10 text-indigo-600 shadow-inner border border-indigo-100/50',
    purple: 'bg-purple-500/10 text-purple-600 shadow-inner border border-purple-100/50',
    indigo: 'bg-indigo-500/10 text-indigo-600 shadow-inner border border-indigo-100/50',
  };

  const style = colors[color] || colors.accent;
  const iconStyle = iconColors[color] || iconColors.accent;
  const Icon =
    type === 'discount' ? TrendingDown : type === 'gift' ? Gift : type === 'promo' ? Zap : Rocket;

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg',
        style
      )}
    >
      {/* Coupon Perforation Effect */}
      <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-slate-100 bg-white shadow-inner" />
      <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-slate-100 bg-white shadow-inner" />

      <div className="relative z-10 flex gap-3.5">
        <div
          className={cn(
            'h-fit shrink-0 rounded-lg p-2.5 transition-transform duration-500 group-hover:scale-110',
            iconStyle
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-0.5 pr-2">
          <div className="mb-0.5 flex items-center justify-between">
            <span className="mr-2 truncate text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 opacity-80">
              {brand}
            </span>
            <div className="flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-indigo-600">
              <Clock className="h-2.5 w-2.5" />
              {expiry}
            </div>
          </div>
          <h4 className="font-headline text-[13px] font-bold uppercase leading-tight tracking-tight transition-colors group-hover:text-indigo-600">
            {title}
          </h4>
          <p className="truncate text-[10px] font-bold uppercase tracking-tight text-slate-500 opacity-70">
            {desc}
          </p>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute right-0 top-0 -mr-2 -mt-2 opacity-[0.03] transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110 group-hover:opacity-[0.08]">
        <Icon className="h-24 w-24" />
      </div>
    </div>
  );
}
