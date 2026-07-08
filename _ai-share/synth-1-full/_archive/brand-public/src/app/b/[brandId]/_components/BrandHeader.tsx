import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Building,
  Star,
  TrendingUp,
  Trophy,
  Check,
  Plus,
  MessageSquare,
  Heart,
  Tag,
  Copy,
  Instagram,
  Send,
  Youtube,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Brand } from '@/lib/types';

interface BrandHeaderProps {
  brand: Brand;
  displaySettings: any;
  displayName: string;
  storyImages: any[];
  handleOpenStory: (image: any, list: any[]) => void;
  setIsBrandReviewsOpen: (open: boolean) => void;
  brandReviews: { average: number; count: number };
  setIsStatsDialogOpen: (open: boolean) => void;
  setIsStatusesDialogOpen: (open: boolean) => void;
  activeStatuses: any[];
  currentStatusIndex: number;
  isFollowed: boolean;
  setIsFollowed: (followed: boolean) => void;
  setAnimatedFollowers: React.Dispatch<React.SetStateAction<number>>;
  setIsMessageDialogOpen: (open: boolean) => void;
  isFavorite: boolean;
  setIsFavorite: (favorite: boolean) => void;
  storefrontSettings: any;
  brandActivePromo: any;
  toast: any;
}

export function BrandHeader({
  brand,
  displaySettings,
  displayName,
  storyImages,
  handleOpenStory,
  setIsBrandReviewsOpen,
  brandReviews,
  setIsStatsDialogOpen,
  setIsStatusesDialogOpen,
  activeStatuses,
  currentStatusIndex,
  isFollowed,
  setIsFollowed,
  setAnimatedFollowers,
  setIsMessageDialogOpen,
  isFavorite,
  setIsFavorite,
  storefrontSettings,
  brandActivePromo,
  toast,
}: BrandHeaderProps) {
  return (
    <header className="border-border-subtle mx-auto mb-4 flex max-w-5xl flex-col items-center gap-3 border-b pb-4 duration-700 animate-in fade-in md:flex-row md:items-start">
      {displaySettings.logo && (
        <div className="group relative shrink-0">
          {/* Logo with Story Ring */}
          <button
            onClick={() => storyImages.length > 0 && handleOpenStory(storyImages[0], storyImages)}
            className="group/logo hover:shadow-accent-primary/10 relative h-24 w-24 rounded-full shadow-xl transition-all active:scale-95"
          >
            <div
              className={cn(
                'absolute -inset-1 rounded-full border-2 border-transparent transition-all duration-500',
                storyImages.length > 0
                  ? 'ring-accent-primary animate-pulse-slow border-accent-primary/50 ring-2 ring-offset-2 ring-offset-background'
                  : 'group-hover/logo:border-accent-primary/30'
              )}
            ></div>
            <div className="border-border-default relative h-full w-full overflow-hidden rounded-full border bg-white p-2 shadow-inner">
              <Image
                src={brand.logo.url}
                alt={brand.logo.alt}
                fill
                className="relative z-10 object-contain p-2 transition-transform duration-500 group-hover/logo:scale-110"
                data-ai-hint={brand.logo.hint}
                sizes="96px"
              />
            </div>
          </button>

          {/* Rating & Reviews Trigger */}
          <div className="group/trigger absolute -bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsBrandReviewsOpen(true);
              }}
              className="bg-text-primary hover:bg-accent-primary flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-white shadow-lg transition-all hover:scale-105"
            >
              <div className="flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-current text-amber-400" />
                <span className="text-[10px] font-bold">{brandReviews.average}</span>
              </div>
              <div className="h-2 w-[1px] bg-white/20" />
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">
                {brandReviews.count} REVIEWS
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsStatsDialogOpen(true);
              }}
              className="border-border-default hover:bg-accent-primary/10 hover:text-accent-primary h-6 w-6 rounded-full border bg-white shadow-md transition-all"
            >
              <TrendingUp className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
      <div className="flex-1 space-y-3 pt-6 text-center md:pt-2 md:text-left">
        <div className="flex flex-col gap-1">
          <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
            <Badge
              variant="outline"
              className="bg-accent-primary/10 text-accent-primary border-accent-primary/20 h-5 gap-1 px-2 text-[8px] font-bold uppercase tracking-widest shadow-sm transition-all"
            >
              <Building className="h-2.5 w-2.5" /> VERIFIED PARTNER
            </Badge>
            <Badge
              variant="outline"
              className="bg-bg-surface2 text-text-secondary border-border-default h-5 px-2 text-[8px] font-bold uppercase tracking-widest shadow-sm"
            >
              EST. 2012
            </Badge>
          </div>
          {displaySettings.name && (
            <h1 className="text-text-primary mb-2 font-headline text-2xl font-bold uppercase leading-none tracking-tight md:text-4xl">
              {displayName}
            </h1>
          )}
        </div>
        {displaySettings.description && brand.description && (
          <p className="text-text-secondary mx-auto max-w-xl text-sm font-medium leading-relaxed tracking-tight opacity-90 md:mx-0 md:text-base">
            {brand.description}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-1.5 md:justify-start">
          {brand.tags?.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-bg-surface2 text-text-secondary hover:bg-text-primary/90 cursor-default rounded-md border-none px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.15em] transition-all hover:text-white"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex min-w-[220px] flex-col items-center gap-3 md:items-end">
        <div className="flex w-full max-w-[200px] items-center gap-2">
          {displaySettings.action_button && (
            <Button
              size="sm"
              className={cn(
                'h-8 flex-1 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg transition-all duration-300',
                isFollowed
                  ? 'bg-bg-surface2 text-text-muted hover:bg-bg-surface2 border-border-default border shadow-none'
                  : 'bg-text-primary hover:bg-accent-primary shadow-accent-primary/10 text-white'
              )}
              onClick={() => {
                if (!isFollowed) {
                  setAnimatedFollowers((prev) => prev + 1);
                } else {
                  setAnimatedFollowers((prev) => Math.max(0, prev - 1));
                }
                setIsFollowed(!isFollowed);
              }}
            >
              {isFollowed ? (
                <Check className="mr-1.5 h-3 w-3" />
              ) : (
                <Plus className="mr-1.5 h-3 w-3" />
              )}
              {isFollowed ? 'FOLLOWING' : 'FOLLOW BRAND'}
            </Button>
          )}
          <Button
            variant="outline"
            className={cn(
              'h-8 w-8 shrink-0 rounded-lg border p-0 shadow-sm transition-all duration-300',
              isFavorite
                ? 'border-rose-100 bg-rose-50 text-rose-500 shadow-rose-100/50 hover:bg-rose-100'
                : 'hover:bg-bg-surface2 border-border-default text-text-muted'
            )}
            onClick={() => {
              setIsFavorite(!isFavorite);
              toast({
                title: !isFavorite ? 'Curated to Favorites' : 'Removed from Curation',
                description: !isFavorite
                  ? `${displayName} is now prioritized in your neural feed.`
                  : `${displayName} affinity has been reset.`,
              });
            }}
          >
            <Heart className={cn('h-3.5 w-3.5', isFavorite && 'fill-current')} />
          </Button>
        </div>

        {storefrontSettings.showActivePromo && brandActivePromo && (
          <Card className="border-accent-primary/20 group/promo relative w-full max-w-[200px] overflow-hidden rounded-xl border bg-white p-2.5 shadow-sm transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 p-1">
              <Tag className="text-accent-primary/20 group-hover/promo:text-accent-primary/40 h-3 w-3 rotate-12 transition-colors" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-text-muted text-[8px] font-bold uppercase leading-none tracking-widest">
                Access Protocol
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-accent-primary font-mono text-xs font-bold uppercase tabular-nums tracking-tighter">
                  {brandActivePromo.code}
                </p>
                <button
                  className="hover:bg-accent-primary/10 text-text-muted hover:text-accent-primary hover:border-accent-primary/20 flex h-5 w-5 items-center justify-center rounded-md border border-transparent shadow-sm transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText(brandActivePromo.code);
                    toast({ title: 'Protocol Copied' });
                  }}
                >
                  <Copy className="h-2.5 w-2.5" />
                </button>
              </div>
              <p className="mt-0.5 text-[8px] font-bold uppercase italic tracking-widest text-emerald-600 opacity-80">
                {brandActivePromo.expiry}
              </p>
            </div>
          </Card>
        )}

        {/* Loyalty Progress Tracker */}
        <Card className="bg-text-primary group/loyalty border-text-primary/30 relative w-full max-w-[200px] overflow-hidden rounded-xl border p-3 shadow-xl">
          <div className="absolute right-0 top-0 p-2 opacity-10 transition-transform duration-700 group-hover:scale-110">
            <Trophy className="h-10 w-10 text-amber-400" />
          </div>
          <div className="relative space-y-2.5">
            <div className="flex flex-col gap-1">
              <p className="text-[8px] font-bold uppercase leading-none tracking-[0.2em] text-white/30">
                ENTITY STATUS
              </p>
              <div className="flex items-center gap-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-tighter text-white">
                  Elite Merchant
                </h4>
                <Badge className="text-text-primary h-3.5 border-none bg-amber-400 px-1 text-[7px] font-bold uppercase tracking-widest">
                  LVL 2
                </Badge>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-end justify-between">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">
                  TO NEXT TIER
                </span>
                <span className="text-[9px] font-bold italic tabular-nums tracking-tighter text-white">
                  45.2K ₽
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full border border-white/5 bg-white/5 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="to-accent-primary h-full bg-gradient-to-r from-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Brand Stylist */}
        <button
          className="border-border-default hover:border-accent-primary/20 group/stylist relative flex h-10 w-full max-w-[200px] items-center gap-2 overflow-hidden rounded-xl border bg-white p-1.5 shadow-sm transition-all hover:shadow-md"
          onClick={() => setIsMessageDialogOpen(true)}
        >
          <div className="bg-accent-primary/10 absolute inset-0 translate-y-full transition-transform duration-500 group-hover/stylist:translate-y-0" />
          <div className="relative flex w-full items-center gap-2">
            <div className="relative shrink-0">
              <div className="bg-bg-surface2 border-border-default group-hover/stylist:border-accent-primary/30 h-7 w-7 overflow-hidden rounded-full border shadow-inner transition-colors">
                <Image
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"
                  alt="Stylist"
                  width={28}
                  height={28}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-accent-primary mb-0.5 text-[7px] font-bold uppercase italic leading-none tracking-widest">
                PROTOCOL ACTIVE
              </p>
              <p className="text-text-primary truncate text-[9px] font-bold uppercase tracking-tight">
                Strategic Concierge
              </p>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
