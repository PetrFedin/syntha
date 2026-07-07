'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { kickstarterProjects } from '@/lib/kickstarter';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Users, Filter, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { Combobox } from '@/components/ui/combobox';
import { products } from '@/lib/products';
import { useUIState } from '@/providers/ui-state';
import { TrendingUp, ShieldCheck, Zap, Globe, BarChart3, Clock as ClockIcon } from 'lucide-react';

export default function KickstarterPage() {
  const { viewRole } = useUIState();
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>(['live']);
  const [sortOrder, setSortOrder] = useState('progress');

  const brandOptions = useMemo(
    () =>
      [...new Set(kickstarterProjects.map((p) => p.creator))].map((b) => ({ value: b, label: b })),
    []
  );
  const categoryOptions = useMemo(
    () => [...new Set(products.map((p) => p.category))].map((c) => ({ value: c, label: c })),
    []
  );
  const seasonOptions = useMemo(
    () =>
      [...new Set(kickstarterProjects.map((p) => p.season || ''))]
        .filter(Boolean)
        .map((s) => ({ value: s, label: s })),
    []
  );
  const statusOptions = [
    { value: 'live', label: 'Активные' },
    { value: 'upcoming', label: 'Скоро' },
    { value: 'successful', label: 'Успешные' },
    { value: 'production', label: 'В производстве' },
  ];

  const filteredProjects = useMemo(() => {
    return kickstarterProjects
      .filter((p) => {
        const brandMatch = brandFilter.length === 0 || brandFilter.includes(p.creator);
        const categoryMatch =
          categoryFilter.length === 0 ||
          categoryFilter.includes(products.find((prod) => prod.id === p.productId)?.category || '');
        const seasonMatch = seasonFilter.length === 0 || seasonFilter.includes(p.season || '');
        const statusMatch = statusFilter.length === 0 || statusFilter.includes(p.status);
        return brandMatch && categoryMatch && seasonMatch && statusMatch;
      })
      .sort((a, b) => {
        if (sortOrder === 'progress') return b.currentRevenue / b.goal - a.currentRevenue / a.goal;
        if (sortOrder === 'time') return a.daysLeft - b.daysLeft;
        if (sortOrder === 'newest')
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [brandFilter, categoryFilter, seasonFilter, statusFilter, sortOrder]);

  const resetFilters = () => {
    setBrandFilter([]);
    setCategoryFilter([]);
    setSeasonFilter([]);
    setStatusFilter(['live']);
  };

  const hasActiveFilters =
    brandFilter.length > 0 ||
    categoryFilter.length > 0 ||
    seasonFilter.length > 0 ||
    (statusFilter.length > 0 && !(statusFilter.length === 1 && statusFilter[0] === 'live'));

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-12 py-6 pb-16 pb-24 sm:px-6">
      {viewRole === 'b2b' && (
        <div className="grid grid-cols-1 gap-3 duration-300 animate-in fade-in md:grid-cols-3">
          <Card className="bg-text-primary relative space-y-4 overflow-hidden rounded-xl border-none p-4 text-white shadow-xl">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <TrendingUp className="h-24 w-24" />
            </div>
            <Badge className="bg-accent-primary border-none text-[8px] font-black uppercase">
              Wholesale Intelligence
            </Badge>
            <h3 className="text-base font-black uppercase tracking-tight">Анализ спроса B2B</h3>
            <p className="text-text-muted text-xs leading-relaxed">
              «Сегмент "Techwear" забронирован на 84% от целевой мощности производства. Рекомендуем
              фиксировать квоты».
            </p>
          </Card>
          <Card className="border-border-subtle space-y-4 rounded-xl border border-none bg-white p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-accent-primary/10 text-accent-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-text-muted text-[10px] font-black uppercase">
                Гарантия пошива
              </span>
            </div>
            <h3 className="text-base font-black uppercase tracking-tight">Smart Contracts</h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              Все предзаказы защищены эскроу-счетами. Фабрика приступает к работе сразу после
              достижения 60% лимита.
            </p>
          </Card>
          <Card className="space-y-4 rounded-xl border border-none border-emerald-100 bg-emerald-50 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                <Zap className="h-5 w-5" />
              </div>
              <Badge className="border-none bg-white text-[10px] font-black text-emerald-600">
                Active
              </Badge>
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-emerald-900">
              Priority Allocation
            </h3>
            <p className="text-xs leading-relaxed text-emerald-700/70">
              Ваш магазин имеет приоритетный доступ к отгрузке первой партии (Early Bird B2B).
            </p>
          </Card>
        </div>
      )}

      <header className="text-center">
        <h1 className="font-headline text-sm font-bold md:text-sm">Syntha Kickstarter</h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm text-muted-foreground">
          Поддержите будущее моды. Получите эксклюзивные вещи раньше всех и помогите брендам
          воплотить их лучшие идеи в жизнь.
        </p>
      </header>

      <div className="mb-8 flex flex-col items-center gap-2 rounded-lg border bg-card p-4 sm:flex-row">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Combobox
            options={brandOptions}
            multiple
            value={brandFilter}
            onChange={(v) => setBrandFilter(v as string[])}
            placeholder="Бренд"
            className="h-9 w-[150px]"
          />
          <Combobox
            options={categoryOptions}
            multiple
            value={categoryFilter}
            onChange={(v) => setCategoryFilter(v as string[])}
            placeholder="Категория"
            className="h-9 w-[150px]"
          />
          <Combobox
            options={seasonOptions}
            multiple
            value={seasonFilter}
            onChange={(v) => setSeasonFilter(v as string[])}
            placeholder="Сезон"
            className="h-9 w-[150px]"
          />
          <Combobox
            options={statusOptions}
            multiple
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as string[])}
            placeholder="Статус"
            className="h-9 w-[150px]"
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="mr-1 h-4 w-4" /> Сбросить
            </Button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">% финансирования</SelectItem>
              <SelectItem value="time">По времени до конца</SelectItem>
              <SelectItem value="newest">По новизне</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => {
          const progress = (project.pledged / project.goal) * 100;
          // Stable mock B2B data based on ID to avoid hydration errors
          const idNum = parseInt(project.id.replace(/\D/g, '') || '0', 10) || 1;
          const b2bRetailers = (idNum % 5) + 2;
          const b2bReserved = (idNum % 50) + 25;

          return (
            <Card key={project.id} className="group relative flex flex-col overflow-hidden">
              <div className="pointer-events-none absolute right-0 top-0 z-20">
                <div className="bg-accent-primary translate-x-6 translate-y-2 rotate-45 px-8 py-1 text-[8px] font-black uppercase text-white shadow-lg">
                  B2B Ready
                </div>
              </div>
              <CardHeader className="p-0">
                <Link href={`/kickstarter/${project.id}`}>
                  <div className="relative aspect-video">
                    <Image
                      src={
                        project.imageUrl || 'https://placehold.co/600x400/f0f0f0/333333?text=Syntha'
                      }
                      alt={project.title}
                      fill
                      className="rounded-t-lg object-cover transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint={project.imageHint}
                    />
                    {project.isFunded && (
                      <div className="absolute left-2 top-2 rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                        ЦЕЛЬ ДОСТИГНУТА
                      </div>
                    )}
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <div className="mb-2 flex items-start justify-between">
                  <p className="text-xs font-semibold text-primary">{project.creator}</p>
                  <div className="bg-accent-primary/10 flex items-center gap-1 rounded px-1.5 py-0.5">
                    <Users className="text-accent-primary h-3 w-3" />
                    <span className="text-accent-primary text-[9px] font-black uppercase">
                      {b2bRetailers} ритейлеров
                    </span>
                  </div>
                </div>
                <Link href={`/kickstarter/${project.id}`}>
                  <CardTitle className="mt-1 text-base font-black uppercase leading-tight tracking-tight transition-colors hover:text-primary">
                    {project.title}
                  </CardTitle>
                </Link>
                <CardDescription className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </CardDescription>

                <div className="bg-bg-surface2 border-border-subtle mt-4 rounded-lg border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-text-muted text-[10px] font-black uppercase">
                      B2B Оптовая бронь
                    </p>
                    <span className="text-[10px] font-black text-emerald-600">
                      -{project.b2bDiscount || '35'}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-text-primary text-xs font-bold">
                      {b2bReserved} ед. забронировано
                    </p>
                    <Link
                      href={ROUTES.shop.b2bKickstarterProject(project.id)}
                      className="text-accent-primary text-[10px] font-black uppercase hover:underline"
                    >
                      Условия закупки
                    </Link>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-3 p-4 pt-0">
                <div className="w-full">
                  <Progress value={progress} className="bg-bg-surface2 h-2" />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-text-primary text-sm font-black tabular-nums">
                      {project.pledged.toLocaleString('ru-RU')} ₽
                    </p>
                    <p className="text-text-muted text-sm font-bold">{progress.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="text-text-muted flex w-full justify-between text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Users className="text-text-muted h-4 w-4" /> {project.backers} спонсоров
                  </div>
                  <div>{project.daysLeft} дней</div>
                </div>
                <Button
                  asChild
                  className="bg-text-primary hover:bg-text-primary/90 mt-2 h-11 w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                >
                  <Link href={`/kickstarter/${project.id}`}>Поддержать проект</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </CabinetPageContent>
  );
}
