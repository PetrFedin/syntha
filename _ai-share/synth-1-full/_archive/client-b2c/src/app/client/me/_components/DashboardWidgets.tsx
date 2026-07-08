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
import { getOfferCouponCardClass, getOfferCouponIconClass } from '@/lib/ui/semantic-data-tones';

export function RecommendationCard({ item }: { item: any }) {
  const badge =
    item.type === 'promo'
      ? { label: 'Промо', color: 'bg-accent-primary shadow-accent-primary/25' }
      : item.type === 'points'
        ? { label: 'Баллы', color: 'bg-accent-primary shadow-accent-primary/20' }
        : item.oldPrice
          ? { label: 'Аутлет', color: 'bg-text-primary shadow-text-primary/20' }
          : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group cursor-pointer space-y-2 duration-500 animate-in zoom-in-95">
          <div className="border-border-subtle relative aspect-[3/4] overflow-hidden rounded-xl border shadow-sm transition-all duration-500 hover:shadow-xl">
            <Image
              src={item.img}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="border-border-subtle bg-bg-surface/90 absolute right-2 top-2 flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[9px] font-bold shadow-sm backdrop-blur-md">
              <Sparkles className="text-accent-primary h-2.5 w-2.5" />
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
            <div className="from-text-primary/60 absolute inset-0 flex items-end bg-gradient-to-t via-transparent to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                className="bg-bg-surface text-text-primary hover:bg-bg-surface2 h-7 w-full rounded-lg border-none text-[9px] font-bold uppercase shadow-lg shadow-black/10"
              >
                Быстрый просмотр
              </Button>
            </div>
          </div>
          <div className="space-y-0.5 px-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="text-text-muted text-[8px] font-bold uppercase leading-none tracking-widest">
                {item.brand}
              </div>
              <div className="text-text-primary text-[10px] font-bold tabular-nums leading-none">
                {item.type === 'points' ? item.pointsPrice : item.price}
              </div>
            </div>
            <h4 className="text-text-primary truncate text-[11px] font-bold uppercase tracking-tight">
              {item.name}
            </h4>
            <div className="pt-0.5">
              <div className="text-accent-primary flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest opacity-60 transition-opacity hover:underline group-hover:opacity-100">
                Логика подбора ИИ
                <Info className="h-2 w-2" />
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-bg-surface max-w-md overflow-hidden rounded-xl border p-0 shadow-2xl">
        <div className="relative h-56 w-full">
          <Image src={item.img} alt={item.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          <div className="absolute bottom-3 left-5 right-5">
            <Badge className="bg-accent-primary text-text-inverse mb-1.5 h-5 border-none px-2 text-[8px] font-bold uppercase tracking-widest shadow-lg">
              Style DNA Match: {item.match}%
            </Badge>
            <DialogHeader>
              <DialogTitle className="text-text-primary font-headline text-base font-bold uppercase leading-none tracking-tighter drop-shadow-sm">
                {item.name}
              </DialogTitle>
            </DialogHeader>
          </div>
        </div>
        <div className="space-y-5 p-3">
          <div className="space-y-2.5">
            <div className="text-accent-primary flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
              <Brain className="h-3.5 w-3.5" />
              Сводка ИИ
            </div>
            <p className="border-border-subtle text-text-secondary border-l-2 py-0.5 pl-3 text-[11px] font-bold uppercase italic leading-relaxed opacity-80">
              {item.type === 'promo'
                ? `"Found in your wishlist. Personal promo ${item.promo} applied for maximum leverage today."`
                : item.type === 'points'
                  ? `"High-yield points redemption available. Strategic value optimized for your capital profile."`
                  : `"Aligns with 'Minimalism' Style DNA. 90% palette overlap with your recent Syntha acquisitions."`}
            </p>
          </div>

          {item.type === 'promo' && (
            <div className="border-border-subtle bg-accent-primary/10 flex items-center justify-between rounded-xl border p-3 shadow-sm">
              <div>
                <div className="text-accent-primary mb-0.5 text-[8px] font-bold uppercase tracking-widest">
                  Voucher Code
                </div>
                <div className="text-text-primary font-mono text-base font-bold uppercase tracking-wider">
                  {item.promo}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-border-subtle text-accent-primary hover:bg-bg-surface2 h-7 rounded-lg text-[9px] font-bold uppercase"
              >
                Copy
              </Button>
            </div>
          )}

          {item.type === 'points' && (
            <div className="border-border-subtle bg-accent-primary/10 flex items-center justify-between rounded-xl border p-3 shadow-sm">
              <div>
                <div className="text-accent-primary mb-0.5 text-[8px] font-bold uppercase tracking-widest">
                  Стоимость в баллах
                </div>
                <div className="text-text-primary text-base font-bold tabular-nums">
                  {item.pointsPrice} <span className="text-[10px] opacity-60">+ 1,200 pts</span>
                </div>
              </div>
              <Badge className="bg-accent-primary text-text-inverse h-5 px-2 text-[8px] font-bold uppercase tracking-widest">
                Доступно
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div className="group/stat border-border-subtle bg-bg-surface2 hover:border-border-subtle hover:bg-bg-surface rounded-xl border p-3 shadow-inner transition-all">
              <div className="text-text-muted group-hover/stat:text-accent-primary mb-1 text-[8px] font-bold uppercase tracking-widest transition-colors">
                Синергия стиля
              </div>
              <div className="text-text-primary flex items-center gap-1 text-xs font-bold uppercase tracking-tight">
                <Plus className="h-2.5 w-2.5 text-emerald-500" />
                {item.synergy} combinations
              </div>
            </div>
            <div className="group/stat border-border-subtle bg-bg-surface2 hover:border-border-subtle hover:bg-bg-surface rounded-xl border p-3 shadow-inner transition-all">
              <div className="text-text-muted group-hover/stat:text-accent-primary mb-1 text-[8px] font-bold uppercase tracking-widest transition-colors">
                Экономическая выгода
              </div>
              <div className="text-text-primary text-xs font-bold uppercase tracking-tight">
                {item.benefit}
              </div>
            </div>
          </div>
          <div className="group/stat border-border-subtle bg-bg-surface2 hover:border-border-subtle hover:bg-bg-surface rounded-xl border p-3 shadow-inner transition-all">
            <div className="text-text-muted group-hover/stat:text-accent-primary mb-1 text-[8px] font-bold uppercase tracking-widest transition-colors">
              Рыночная редкость
            </div>
            <div className="text-text-primary text-xs font-bold uppercase tracking-tight">
              {item.rarity}
            </div>
          </div>
          <Button className="bg-text-primary text-text-inverse hover:bg-accent-primary h-10 w-full rounded-xl border-none text-[11px] font-bold uppercase tracking-[0.15em] shadow-xl shadow-black/15 transition-all">
            {item.type === 'points'
              ? `Обменять баллы — ${item.pointsPrice}`
              : `Добавить в гардероб — ${item.price}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OfferCoupon({ type, brand, title, desc, expiry, color }: any) {
  const style = getOfferCouponCardClass(color);
  const iconStyle = getOfferCouponIconClass(color);
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
      <div className="border-border-subtle bg-bg-surface absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border shadow-inner" />
      <div className="border-border-subtle bg-bg-surface absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border shadow-inner" />

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
            <span className="text-text-muted mr-2 truncate text-[8px] font-bold uppercase tracking-[0.2em] opacity-80">
              {brand}
            </span>
            <div className="text-accent-primary flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-widest">
              <Clock className="h-2.5 w-2.5" />
              {expiry}
            </div>
          </div>
          <h4 className="text-text-primary group-hover:text-accent-primary font-headline text-[13px] font-bold uppercase leading-tight tracking-tight transition-colors">
            {title}
          </h4>
          <p className="text-text-secondary truncate text-[10px] font-bold uppercase tracking-tight opacity-70">
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
