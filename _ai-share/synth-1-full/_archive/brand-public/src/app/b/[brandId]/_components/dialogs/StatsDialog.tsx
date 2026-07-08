import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Star, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  statsPeriod: string;
  setStatsPeriod: (period: any) => void;
  currentBrandStats: any[];
  brandMedalsByPeriod: Record<string, any[]>;
  setIsBrandReviewsOpen: (open: boolean) => void;
}

export function StatsDialog({
  isOpen,
  onOpenChange,
  statsPeriod,
  setStatsPeriod,
  currentBrandStats,
  brandMedalsByPeriod,
  setIsBrandReviewsOpen,
}: StatsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden rounded-xl border-none bg-background p-0 shadow-2xl">
        <DialogHeader className="shrink-0 border-b border-muted/10 bg-muted/5 p-4 pb-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-3 text-base font-black uppercase tracking-tighter">
                <TrendingUp className="h-8 w-8 text-accent" />
                Показатели бренда
              </DialogTitle>
              <DialogDescription className="text-base font-medium">
                Аналитика на основе реальных отзывов и данных экосистемы Syntha
              </DialogDescription>
            </div>
            <div className="flex shrink-0 rounded-xl border bg-muted/50 p-1 shadow-sm">
              {[
                { label: 'Месяц', value: 'month' },
                { label: '6 мес.', value: '6months' },
                { label: 'Год', value: 'year' },
                { label: 'Все', value: 'all' },
              ].map((p) => (
                <Button
                  key={p.value}
                  variant={statsPeriod === p.value ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'h-8 rounded-lg px-4 text-[10px] font-black uppercase transition-all',
                    statsPeriod === p.value
                      ? 'bg-black text-white shadow-md'
                      : 'text-muted-foreground'
                  )}
                  onClick={() => setStatsPeriod(p.value as any)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        <TooltipProvider>
          <div className="custom-scrollbar flex-1 space-y-10 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
              {(currentBrandStats || []).map((stat) => (
                <div key={stat.id} className="group space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-muted/30 p-2 text-muted-foreground transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                        {stat.icon}
                      </div>
                      <span className="text-sm font-bold text-foreground/80">{stat.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                      <span className="text-base font-black">{stat.score.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                    <div
                      className="h-full bg-accent transition-all duration-1000 ease-out"
                      style={{ width: `${(stat.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-accent" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Заслуги и достижения за период
                  </h4>
                </div>
                <div className="text-[9px] font-bold uppercase text-muted-foreground opacity-50">
                  Наведите на кубок для деталей
                </div>
              </div>

              <div className="flex flex-wrap items-start gap-3">
                {(brandMedalsByPeriod?.[statsPeriod] || []).map((medal, i) => (
                  <Tooltip key={i} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="group/cup flex cursor-help flex-col items-center gap-2">
                        <div
                          className={cn(
                            'relative flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-500 group-hover/cup:-translate-y-1',
                            medal.type === 'gold'
                              ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950'
                              : medal.type === 'silver'
                                ? 'from-border-subtle to-text-muted text-text-primary bg-gradient-to-br'
                                : 'bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950'
                          )}
                        >
                          <Trophy className="h-7 w-7 drop-shadow-md" />
                          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity group-hover/cup:opacity-100" />
                          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-current bg-white text-[10px] font-black shadow-sm">
                            {medal.rank}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-black uppercase leading-none tracking-tight text-foreground">
                            {medal.date}
                          </p>
                          <p className="mt-1 text-[8px] font-bold uppercase text-muted-foreground opacity-60">
                            {medal.id.includes('_') ? medal.id.split('_')[0] : medal.id}
                          </p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      className="max-w-xs rounded-2xl border-none bg-black p-4 text-white shadow-2xl duration-200 animate-in zoom-in-95"
                      side="top"
                      sideOffset={10}
                      collisionPadding={10}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg',
                              medal.type === 'gold'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : medal.type === 'silver'
                                  ? 'bg-bg-surface2/20 text-text-muted'
                                  : 'bg-orange-500/20 text-orange-500'
                            )}
                          >
                            <Trophy className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                              Лидер рейтинга
                            </p>
                            <p className="text-sm font-black uppercase text-white">
                              {medal.rank} МЕСТО
                            </p>
                          </div>
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white/90">
                            Параметр: <span className="text-accent">{medal.name}</span>
                          </p>
                          <p className="text-[10px] leading-relaxed text-white/60">
                            Бренд признан одним из лучших в категории{' '}
                            <span className="font-bold text-white">{medal.category}</span> за период{' '}
                            <span className="font-bold text-white">{medal.date}</span>.
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {(brandMedalsByPeriod?.[statsPeriod] || []).length === 0 && (
                  <div className="w-full rounded-3xl border border-dashed border-muted-foreground/20 bg-muted/10 py-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                      Достижений за этот период пока нет
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-black/5 bg-black/5 p-4">
                <p className="text-[9px] font-bold italic leading-relaxed text-muted-foreground">
                  * Эти достижения подтверждают статус «Platinum Partner» with эксклюзивными
                  условиями продвижения в экосистеме Syntha.
                </p>
              </div>
            </div>
          </div>
        </TooltipProvider>

        <div className="flex shrink-0 justify-center rounded-b-[2.5rem] border-t border-muted/10 bg-muted/5 p-4">
          <Button
            variant="link"
            className="text-[11px] font-black uppercase tracking-widest text-accent transition-all hover:translate-x-2"
            onClick={() => {
              onOpenChange(false);
              setIsBrandReviewsOpen(true);
            }}
          >
            Перейти к подробным отзывам <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
