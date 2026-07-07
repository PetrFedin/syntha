import React from 'react';
import { Brain, Sparkles, TrendingUp, List, Check, Trophy, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizResultsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  quizResults: any;
  displayName: string;
  setIsUpgradeRequested: (requested: boolean) => void;
  isUpgradeRequested: boolean;
  toast: any;
}

export function QuizResultsDialog({
  isOpen,
  onOpenChange,
  quizResults = {},
  displayName,
  setIsUpgradeRequested,
  isUpgradeRequested,
  toast,
}: QuizResultsDialogProps) {
  if (!quizResults || Object.keys(quizResults).length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-xl border-none bg-background p-0 shadow-2xl">
        <div className="relative overflow-hidden bg-black p-3 text-white">
          <div className="absolute right-0 top-0 rotate-12 p-4 opacity-10">
            <Brain className="h-64 w-64 text-white" />
          </div>
          <div className="relative z-10">
            <Badge className="mb-4 border-none bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
              AI Brand Analysis
            </Badge>
            <h2 className="mb-2 text-sm font-black uppercase leading-none tracking-tighter">
              Результаты <br />
              <span className="text-accent">Аудита Syntha</span>
            </h2>
            <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white/60">
              На основе данных платформы и анализа позиционирования {displayName}
            </p>
          </div>
        </div>

        <div className="custom-scrollbar max-h-[500px] space-y-10 overflow-y-auto p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-accent">
                  Архетип бренда
                </h4>
                <div className="rounded-3xl border-2 border-dashed border-accent/20 bg-muted/5 p-4">
                  <h3 className="mb-2 text-sm font-black uppercase tracking-tight">
                    {quizResults.archetype}
                  </h3>
                  <p className="text-sm font-medium italic leading-relaxed text-muted-foreground">
                    {quizResults.description}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-accent">
                  Текущий сегмент
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-2xl bg-muted/10 p-4 text-center">
                    <p className="mb-1 text-[8px] font-black uppercase text-muted-foreground">
                      Сейчас
                    </p>
                    <p className="text-xs font-black uppercase">{quizResults.segment}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-accent" />
                  <div className="flex-1 rounded-2xl border border-accent/20 bg-accent/10 p-4 text-center">
                    <p className="mb-1 text-[8px] font-black uppercase text-accent">Цель</p>
                    <p className="text-xs font-black uppercase text-accent">
                      {quizResults.targetSegment}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-accent">
                  Сильные стороны (AI Score)
                </h4>
                <div className="space-y-6">
                  {quizResults.traits.map((trait: any) => (
                    <div key={trait.name} className="space-y-2">
                      <div className="flex items-end justify-between">
                        <span className="text-xs font-black uppercase tracking-tight">
                          {trait.name}
                        </span>
                        <span className="text-sm font-black text-accent">{trait.value}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${trait.value}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="rounded-3xl border-none bg-accent/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h5 className="mb-1 text-sm font-black uppercase tracking-tight">
                      Рекомендация AI
                    </h5>
                    <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
                      Для перехода в сегмент Heritage необходимо усилить блок «История и
                      Прозрачность» через публикацию BTS-контента.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h4 className="text-center text-[10px] font-black uppercase tracking-widest text-accent">
              Дорожная карта развития
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {quizResults.roadmap.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="group flex items-center gap-3 rounded-2xl bg-muted/5 p-4 transition-all hover:bg-muted/10"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2',
                      item.status === 'completed'
                        ? 'border-green-500 bg-green-500 text-white'
                        : item.status === 'in_progress'
                          ? 'animate-pulse border-accent text-accent'
                          : 'border-muted-foreground/20 text-muted-foreground'
                    )}
                  >
                    {item.status === 'completed' ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-xs font-black">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-black uppercase tracking-wider">{item.stage}</h5>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[7px] font-black uppercase',
                      item.status === 'completed'
                        ? 'border-green-200 bg-green-50 text-green-600'
                        : item.status === 'in_progress'
                          ? 'border-accent/30 bg-accent/5 text-accent'
                          : 'border-muted/20 text-muted-foreground'
                    )}
                  >
                    {item.status === 'completed'
                      ? 'Готово'
                      : item.status === 'in_progress'
                        ? 'В процессе'
                        : 'В планах'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-muted/10 bg-muted/5 p-3 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight">Статус: Rising Star</p>
              <p className="text-[10px] font-bold text-muted-foreground">
                До следующего уровня: 120 XP
              </p>
            </div>
          </div>
          <Button
            className="h-12 rounded-2xl bg-black px-10 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-accent"
            onClick={() => {
              setIsUpgradeRequested(true);
              toast({
                title: 'Заявка принята!',
                description: 'Эксперт Syntha свяжется with вами для проведения глубокого аудита.',
              });
            }}
            disabled={isUpgradeRequested}
          >
            {isUpgradeRequested ? 'Заявка отправлена' : 'Запросить глубокий аудит'}
          </Button>
        </div>

        <DialogFooter className="shrink-0 border-t border-muted/10 bg-muted/30 p-4">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Info className="h-3 w-3" /> Анализ обновлен: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
