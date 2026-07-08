'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Upload,
  Check,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Clock,
  Users,
  ArrowRight,
  Target,
  Brain,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { lookboards } from '@/lib/lookboards';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export function ChallengesTab() {
  const { lookboards: userLookboards } = useUIState();
  const displayLookboards = userLookboards.length > 0 ? userLookboards : lookboards;
  const [selectedLookId, setSelectedLookId] = useState<string | null>(null);
  const [step, setStep] = useState<'browse' | 'submit'>('browse');

  const pastChallenges = [
    {
      id: 'c1',
      title: 'Cyber-Minimalism',
      date: 'Dec 2025',
      rank: 'Top 10%',
      status: 'Completed',
      result: '150 pts',
    },
    {
      id: 'c2',
      title: 'Winter Layers',
      date: 'Nov 2025',
      rank: 'Top 25%',
      status: 'Completed',
      result: '50 pts',
    },
  ];

  return (
    <div className="space-y-10 pb-10 duration-500 animate-in fade-in">
      {/* Active Challenge Banner - Redesigned to match Syntha Business banner style */}
      <Card className="bg-text-primary group/banner relative flex min-h-[400px] items-center overflow-hidden rounded-xl border-none shadow-2xl">
        <div className="absolute inset-0 opacity-40 transition-transform duration-1000 group-hover/banner:scale-105">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000"
            alt="Fashion Challenge"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="from-text-primary via-text-primary/80 absolute inset-0 bg-gradient-to-r to-transparent" />

        <CardContent className="relative z-10 w-full max-w-4xl space-y-4 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/20">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <Badge className="border-none bg-amber-500 px-3 py-1 text-[10px] font-black uppercase text-white">
              Active Challenge
            </Badge>
            <Badge
              variant="outline"
              className="border-white/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white"
            >
              Global Event
            </Badge>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase leading-[0.85] tracking-tighter md:text-7xl">
              FW26: STYLE
              <br />
              SYNTHESIS
            </h2>
            <p className="max-w-xl border-l-2 border-amber-500/50 pl-6 text-sm font-medium italic leading-relaxed text-white/75">
              "Создайте образ, объединяющий высокие технологии и классический крой. Победитель
              получит грант на запуск собственной капсулы."
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 border-t border-white/10 pt-4 sm:flex-row">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:gap-3">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Приз
                </p>
                <p className="text-sm font-black tabular-nums text-white">500k ₽</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Участники
                </p>
                <p className="text-sm font-black tabular-nums text-white">1,240</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Осталось
                </p>
                <p className="text-sm font-black tabular-nums text-amber-400">14д</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Рейтинг
                </p>
                <p className="text-sm font-black uppercase tracking-tight text-white">Top 5%</p>
              </div>
            </div>

            <div className="mx-4 hidden h-12 w-px bg-white/10 sm:block" />

            <Button
              onClick={() => {
                const el = document.getElementById('participation-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="button-glimmer button-professional group/btn h-10 w-full rounded-2xl border-none !bg-white px-12 text-[11px] font-black uppercase tracking-widest !text-black shadow-2xl transition-all hover:scale-105 lg:w-auto"
            >
              Участвовать
              <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div id="participation-section" className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Main Action Area */}
        <div className="space-y-10 lg:col-span-8">
          <div className="space-y-4">
            <div className="flex flex-col items-end justify-between gap-3 md:flex-row">
              <div className="space-y-2">
                <h3 className="text-text-primary text-base font-black uppercase tracking-tighter">
                  Принять участие
                </h3>
                <p className="text-text-secondary max-w-md font-medium">
                  Ваш образ будет оценен Neural Engine и экспертным сообществом.
                </p>
              </div>
              <div className="border-border-subtle bg-bg-surface2 flex gap-1 rounded-2xl border p-1">
                <Button
                  variant="ghost"
                  onClick={() => setStep('browse')}
                  className={cn(
                    'h-10 rounded-xl px-6 text-[9px] font-black uppercase tracking-widest transition-all',
                    step === 'browse'
                      ? 'bg-bg-surface text-text-primary shadow-sm'
                      : 'hover:bg-bg-surface/80 text-muted-foreground'
                  )}
                >
                  Из лукбордов
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep('submit')}
                  className={cn(
                    'h-10 rounded-xl px-6 text-[9px] font-black uppercase tracking-widest transition-all',
                    step === 'submit'
                      ? 'bg-bg-surface text-text-primary shadow-sm'
                      : 'hover:bg-bg-surface/80 text-muted-foreground'
                  )}
                >
                  Загрузить фото
                </Button>
              </div>
            </div>

            {step === 'browse' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {displayLookboards.map((lb) => (
                  <div
                    key={lb.id}
                    onClick={() => setSelectedLookId(lb.id)}
                    className={cn(
                      'group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border-2 transition-all',
                      selectedLookId === lb.id
                        ? 'border-text-primary scale-95 shadow-2xl'
                        : 'bg-bg-surface border-transparent'
                    )}
                  >
                    <img
                      src={
                        lb.coverImage ||
                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'
                      }
                      alt={lb.title}
                      className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-sm font-black uppercase tracking-tight text-white">
                        {lb.title}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-white/60">
                        {lb.itemsCount} предметов
                      </p>
                    </div>
                    {selectedLookId === lb.id && (
                      <div className="bg-text-primary text-text-inverse absolute right-6 top-4 flex h-8 w-8 items-center justify-center rounded-full shadow-xl duration-300 animate-in zoom-in">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-border-subtle bg-bg-surface flex flex-col items-center space-y-4 rounded-xl border border-dashed p-4 text-center shadow-sm">
                <div className="bg-bg-surface2 flex h-20 w-20 items-center justify-center rounded-3xl">
                  <Upload className="text-text-muted h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-text-primary text-sm font-black uppercase tracking-tight">
                    Загрузка образа
                  </h4>
                  <p className="text-text-secondary mx-auto max-w-xs text-sm">
                    {' '}
                    Neural Engine автоматически распознает вещи на фото и определит их соответствие
                    стилю.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button className="button-glimmer bg-text-primary text-text-inverse h-10 rounded-2xl px-10 text-[11px] font-black uppercase tracking-widest shadow-xl">
                    Выбрать файл
                  </Button>
                  <Button
                    variant="outline"
                    className="border-text-primary text-text-primary h-10 rounded-2xl border-2 px-10 text-[11px] font-black uppercase tracking-widest"
                  >
                    <Camera className="mr-2 h-4 w-4" /> Сделать фото
                  </Button>
                </div>
              </div>
            )}

            {selectedLookId && step === 'browse' && (
              <div className="flex justify-center pt-8 duration-500 animate-in slide-in-from-bottom-4">
                <Button className="button-glimmer h-12 rounded-2xl bg-black px-16 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl">
                  Отправить на скоринг <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Stats and History */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="border-border-subtle bg-bg-surface space-y-6 rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-accent-primary/10 text-accent-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-base font-black uppercase tracking-tight">Style Rating</h4>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Community Power</span>
                  <span>Top 12%</span>
                </div>
                <Progress value={88} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Neural Accuracy</span>
                  <span>A+</span>
                </div>
                <Progress value={95} className="h-1.5" />
              </div>
            </div>
            <div className="border-border-subtle bg-bg-surface2 space-y-2 rounded-2xl border p-4">
              <p className="text-text-muted text-[10px] font-black uppercase">
                Текущие бонусы за активность
              </p>
              <p className="text-text-primary text-sm font-black">450 pts</p>
            </div>
          </Card>

          <Card className="border-border-subtle bg-bg-surface space-y-6 rounded-xl border p-4 shadow-sm">
            <h4 className="text-text-muted text-xs font-black uppercase tracking-[0.2em]">
              История участий
            </h4>
            <div className="space-y-4">
              {pastChallenges.map((c) => (
                <div
                  key={c.id}
                  className="border-border-subtle bg-bg-surface2 hover:border-text-primary group flex cursor-default items-center justify-between rounded-2xl border p-4 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-tight">{c.title}</p>
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">
                      {c.date} • {c.rank}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600">+{c.result}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="text-text-muted hover:text-text-primary w-full text-[10px] font-black uppercase tracking-widest"
            >
              Посмотреть весь архив
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
