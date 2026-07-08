'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  Star,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Plus,
  Sparkles,
  Award,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { tid } from '@/lib/ui/test-ids';
import { motion } from 'framer-motion';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

// --- Mock Data ---

const TALENTS = [
  {
    id: 't1',
    name: 'Александра В.',
    role: 'Fashion Designer',
    experience: '8 лет',
    location: 'Милан / Москва',
    rating: 4.9,
    projects: 42,
    specialization: ['Luxury', 'Sustainable', 'Couture'],
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    bio: 'Специализируюсь на создании коллекций из переработанных материалов. Работала с крупными домами моды в Италии.',
  },
  {
    id: 't2',
    name: 'Марк С.',
    role: 'Brand Manager',
    experience: '5 лет',
    location: 'Париж',
    rating: 4.8,
    projects: 15,
    specialization: ['Marketing', 'B2B Strategy', 'Retail'],
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    bio: 'Эксперт по выводу локальных брендов на международный рынок B2B.',
  },
  {
    id: 't3',
    name: 'Елена К.',
    role: 'Professional Model',
    experience: '10 лет',
    location: 'Дубай / Лондон',
    rating: 5.0,
    projects: 120,
    specialization: ['Runway', 'Commercial', 'Lookbook'],
    status: 'busy',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    bio: 'Участие в неделях моды, большой опыт работы с топовыми фотографами.',
  },
  {
    id: 't4',
    name: 'Иван П.',
    role: 'Fashion Photographer',
    experience: '6 лет',
    location: 'Москва',
    rating: 4.7,
    projects: 85,
    specialization: ['Editorial', 'Product', 'Studio'],
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    bio: 'Создаю визуальный контент, который продает ценности бренда, а не просто одежду.',
  },
];

const JOBS = [
  {
    id: 'j1',
    brand: 'Radical Chic',
    title: 'Ведущий стилист съемки',
    type: 'Временный контракт',
    budget: '50,000₽ / день',
    location: 'Студия (Москва)',
    posted: '2 часа назад',
    description: 'Требуется опытный стилист для создания лукбука новой весенней коллекции.',
  },
  {
    id: 'j2',
    brand: 'Nordic Wool',
    title: 'Менеджер по производству',
    type: 'Постоянная работа',
    budget: '150,000₽+',
    location: 'Удаленно / Офис',
    posted: '1 день назад',
    description: 'Ищем специалиста по контролю качества и работе с фабриками в Турции.',
  },
];

export default function CareerPage() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <CabinetPageContent
      maxWidth="full"
      data-testid={tid.page('shop-career')}
      className="flex min-h-0 flex-col bg-transparent !p-0"
    >
      {!isClient ? (
        <div className="text-text-secondary p-4 text-sm">Загрузка карьерного центра…</div>
      ) : (
        <div className="flex-1 space-y-4 bg-[#f8fafc] p-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-accent-primary/10 flex size-10 items-center justify-center rounded-2xl">
                  <Briefcase className="text-accent-primary size-5" />
                </div>
                <Badge
                  variant="outline"
                  className="border-accent-primary/20 bg-accent-primary/5 text-accent-primary px-2.5 py-1 text-xs font-black uppercase tracking-widest"
                >
                  FASHION CAREER HUB
                </Badge>
              </div>
              <h2 className="text-text-primary text-sm font-black uppercase tracking-tighter">
                Карьерный Центр
              </h2>
              <p className="text-text-secondary text-sm font-medium">
                Глобальная база специалистов и безопасный мечинг в индустрии моды.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                asChild
                variant="outline"
                className="border-border-default hover:border-text-primary h-12 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all hover:bg-white"
              >
                <Link href="/client/me?tab=career">
                  <FileText className="mr-2 size-4" />
                  Мое Резюме
                </Link>
              </Button>
              <Button className="button-glimmer button-professional h-12 rounded-2xl border-none !bg-black px-8 text-xs font-black uppercase tracking-widest shadow-md shadow-xl hover:!bg-black">
                <Plus className="mr-2 size-4" />
                Разместить заказ/вакансию
              </Button>
            </div>
          </div>

          <Tabs defaultValue="talents" className="space-y-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <TabsList
                className={cn(cabinetSurface.tabsList, 'h-auto w-fit rounded-2xl shadow-inner')}
              >
                <TabsTrigger
                  value="talents"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'data-[state=active]:text-accent-primary rounded-xl px-6 py-2.5 text-[11px]'
                  )}
                >
                  База талантов
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'data-[state=active]:text-accent-primary rounded-xl px-6 py-2.5 text-[11px]'
                  )}
                >
                  Заказы и Вакансии
                </TabsTrigger>
                <TabsTrigger
                  value="contracts"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'data-[state=active]:text-accent-primary rounded-xl px-6 py-2.5 text-[11px]'
                  )}
                >
                  Смарт-Контракты
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <div className="group relative">
                  <Search className="text-text-muted group-focus-within:text-accent-primary absolute left-4 top-1/2 size-4 -translate-y-1/2 transition-colors" />
                  <Input
                    placeholder="Поиск по специализации, навыкам..."
                    className="border-border-default focus:border-accent-primary focus:ring-accent-primary h-12 w-[300px] rounded-2xl bg-white pl-12 pr-6 shadow-sm transition-all lg:w-[400px]"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border-default hover:border-text-primary size-12 rounded-2xl"
                >
                  <Filter className="size-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="talents" className={cabinetSurface.cabinetProfileTabPanel}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {TALENTS.map((talent) => (
                  <motion.div
                    key={talent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="group/talent border-border-subtle hover:border-text-primary flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-500 hover:shadow-2xl">
                      <div className="flex-1 space-y-6 p-4">
                        <div className="flex items-start justify-between">
                          <div className="relative">
                            <Avatar className="border-border-subtle group-hover/talent:border-accent-primary size-20 rounded-2xl border-2 transition-colors duration-500">
                              <AvatarImage src={talent.imageUrl} />
                              <AvatarFallback className="rounded-2xl">
                                {talent.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={cn(
                                'absolute -bottom-1 -right-1 size-4 animate-pulse rounded-full border-2 border-white',
                                talent.status === 'open' ? 'bg-emerald-500' : 'bg-amber-500'
                              )}
                            />
                          </div>
                          <div className="text-right">
                            <div className="mb-1 flex items-center justify-end gap-1 text-amber-500">
                              <Star className="size-3 fill-amber-500" />
                              <span className="text-sm font-black">{talent.rating}</span>
                            </div>
                            <p className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                              {talent.projects} КЕЙСОВ
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-text-primary group-hover/talent:text-accent-primary text-base font-black leading-none tracking-tighter transition-colors">
                            {talent.name}
                          </h4>
                          <p className="text-text-muted text-xs font-black uppercase leading-none tracking-widest">
                            {talent.role}
                          </p>
                        </div>

                        <p className="text-text-secondary line-clamp-2 text-xs font-medium leading-relaxed">
                          {talent.bio}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {talent.specialization.map((s) => (
                            <Badge
                              key={s}
                              variant="outline"
                              className="border-border-subtle bg-bg-surface2 text-text-secondary px-2 py-0 text-[8px] font-black uppercase"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-text-muted flex items-center justify-between pt-2 text-xs font-black uppercase tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3" />
                            {talent.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3" />
                            {talent.experience}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto p-2 pt-0">
                        <Button className="bg-bg-surface2 text-text-primary hover:bg-text-primary/90 h-12 w-full rounded-2xl border-none text-xs font-black uppercase tracking-widest transition-all duration-300 hover:text-white">
                          Смотреть Портфолио
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="jobs" className={cabinetSurface.cabinetProfileTabPanel}>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {JOBS.map((job) => (
                  <Card
                    key={job.id}
                    className="border-border-subtle hover:border-text-primary overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col justify-between gap-3 md:flex-row">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-bg-surface2 text-text-muted flex size-12 items-center justify-center rounded-xl font-black">
                              {job.brand[0]}
                            </div>
                            <div>
                              <p className="text-accent-primary text-xs font-black uppercase leading-none tracking-widest">
                                {job.brand}
                              </p>
                              <h4 className="text-text-primary mt-1 text-sm font-black tracking-tighter">
                                {job.title}
                              </h4>
                            </div>
                          </div>
                          <p className="text-text-secondary max-w-xl text-sm font-medium">
                            {job.description}
                          </p>
                          <div className="flex flex-wrap gap-3 pt-2">
                            <div className="text-text-muted flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                              <MapPin className="size-3" />
                              {job.location}
                            </div>
                            <div className="text-text-muted flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                              <DollarSign className="size-3" />
                              {job.budget}
                            </div>
                            <div className="text-text-muted flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                              <Clock className="size-3" />
                              {job.posted}
                            </div>
                          </div>
                        </div>
                        <div className="flex min-w-[200px] flex-col justify-center gap-3">
                          <Button className="button-glimmer button-professional h-12 rounded-2xl !bg-black text-xs font-black uppercase tracking-widest hover:!bg-black">
                            Откликнуться
                          </Button>
                          <Button
                            variant="outline"
                            className="border-border-default hover:border-text-primary h-12 rounded-2xl text-xs font-black uppercase tracking-widest"
                          >
                            Чат с брендом
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contracts" className={cabinetSurface.cabinetProfileTabPanel}>
              <div className="mx-auto max-w-4xl space-y-4 py-12 text-center">
                <div className="relative inline-block">
                  <div className="bg-accent-primary/10 absolute -inset-4 animate-pulse rounded-full blur-2xl" />
                  <ShieldCheck className="text-accent-primary relative mx-auto size-24" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-text-primary text-base font-black uppercase tracking-tighter">
                    Система Смарт-Контрактов
                  </h3>
                  <p className="text-text-secondary mx-auto max-w-2xl text-sm font-medium">
                    Платформа SYNTHA гарантирует безопасность сделок. Мы автоматически фиксируем
                    условия работы, депонируем оплату и контролируем соблюдение авторских прав.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 text-left md:grid-cols-3">
                  {[
                    {
                      icon: ShieldCheck,
                      title: 'Защита оплаты',
                      desc: 'Средства переводятся исполнителю только после принятия работы заказчиком.',
                    },
                    {
                      icon: FileText,
                      title: 'Цифровой договор',
                      desc: 'Юридически значимые условия фиксируются в коде контракта.',
                    },
                    {
                      icon: Award,
                      title: 'Портфолио в блокчейн',
                      desc: 'Все завершенные проекты автоматически верифицируются в вашем профиле.',
                    },
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="border-border-subtle space-y-3 rounded-3xl border bg-white p-4 shadow-sm"
                    >
                      <feature.icon className="text-accent-primary size-6" />
                      <h5 className="text-text-primary text-sm font-black uppercase tracking-widest">
                        {feature.title}
                      </h5>
                      <p className="text-text-secondary text-xs font-medium leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Profile Builder Section (Subtle Footer CTA) */}
          <div className="bg-accent-primary group relative overflow-hidden rounded-xl p-4 md:p-4">
            <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="absolute -right-24 -top-24 size-64 rounded-full bg-white/20 blur-3xl transition-all duration-700 group-hover:bg-white/30" />

            <div className="relative z-10 flex flex-col items-center justify-between gap-3 md:flex-row">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="size-6 text-amber-400" />
                  <h3 className="text-sm font-black uppercase tracking-tighter text-white md:text-sm">
                    Ваш профессиональный профиль готов на 65%
                  </h3>
                </div>
                <p className="text-accent-primary/30 max-w-xl font-medium">
                  Добавьте свои лучшие работы и опыт, чтобы попасть в топ выдачи для крупнейших
                  дистрибуторов и брендов.
                </p>
              </div>
              <Button className="text-accent-primary hover:bg-bg-surface2 h-10 rounded-2xl bg-white px-10 text-xs font-black uppercase tracking-widest shadow-2xl transition-all">
                Продолжить настройку
              </Button>
            </div>
          </div>
        </div>
      )}
    </CabinetPageContent>
  );
}
