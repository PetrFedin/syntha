import React from 'react';
import { motion } from 'framer-motion';
import {
  Quote,
  Layers,
  Leaf,
  Palette,
  ShieldCheck,
  Shield,
  Brain,
  Globe,
  Heart,
  MessageSquare,
  BookText,
  History,
  Map,
  Sparkles,
  Award,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Send,
  Building,
  Timer,
  ArrowRight,
  Star,
  Camera,
  Check,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';

interface AboutTabProps {
  brand: any;
  storefrontSettings: any;
  displayName: string;
  setIsRetailerMapOpen: (open: boolean) => void;
  setIsRetailerOpen: (open: boolean) => void;
  setIsTeamOpen: (open: boolean) => void;
  setIsShareLookOpen: (open: boolean) => void;
}

export function AboutTab({
  brand,
  storefrontSettings,
  displayName,
  setIsRetailerMapOpen,
  setIsRetailerOpen,
  setIsTeamOpen,
  setIsShareLookOpen,
}: AboutTabProps) {
  return (
    <TabsContent
      value="about"
      className="space-y-4 duration-700 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Main Header for the tab */}
      <div className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-tighter">ДНК и ценности</h2>
        <p className="font-medium text-muted-foreground">
          История, команда и принципы, которые делают бренд уникальным
        </p>
      </div>

      {/* 1. Philosophy & DNA Section */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {storefrontSettings.showPhilosophy && (
            <Card className="group relative overflow-hidden rounded-xl border-none bg-white/80 shadow-xl backdrop-blur-sm">
              <div className="from-accent-primary/20 to-accent-primary/20 absolute -inset-1 rounded-xl bg-gradient-to-r opacity-0 blur transition duration-1000 group-hover:opacity-100"></div>
              <CardContent className="p-4">
                <div className="relative">
                  <Quote className="absolute -left-6 -top-4 h-12 w-12 text-accent/5" />
                  <p className="relative z-10 text-base font-medium italic leading-relaxed text-foreground/80">
                    Мы верим, что одежда должна быть не только красивой, но и умной, экологичной и
                    долговечной. Каждый стежок — это результат кропотливого труда, вдохновленного
                    эстетикой и технологиями.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2x2 Grid for DNA blocks */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card className="group h-full rounded-2xl border-dashed border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-tighter">
                  <Layers className="h-3.5 w-3.5 text-accent" />
                  Материалы
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[10px] leading-snug text-muted-foreground">
                70% наших тканей — это премиальный меринос и кашемир. Мы предоставляем полную карту
                происхождения сырья для каждого изделия.
              </CardContent>
            </Card>

            <Card className="group h-full rounded-2xl border-dashed border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-tighter">
                  <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                  Устойчивость
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[10px] leading-snug text-muted-foreground">
                100% материалов сертифицированы. Мы компенсируем углеродный след каждой доставки и
                поддерживаем локальные производства.
              </CardContent>
            </Card>

            <Card className="group h-full rounded-2xl border-dashed border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-tighter">
                  <Palette className="h-3.5 w-3.5 text-accent" />
                  Идентичность и наследие
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[10px] leading-snug text-muted-foreground">
                Визуальный язык, вдохновленный эстетикой Севера и функционализмом. Сохранение
                традиционных техник в цифровом контексте.
              </CardContent>
            </Card>

            <Card className="group h-full rounded-2xl border-dashed border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-tighter">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  Контроль качества
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[10px] leading-snug text-muted-foreground">
                Пятиступенчатая система проверки от анализа нити до финишной обработки. Гарантия
                соответствия премиум-стандартам.
              </CardContent>
            </Card>

            <Card className="group h-full rounded-2xl border-dashed border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-tighter">
                  <Brain className="h-3.5 w-3.5 text-accent" />
                  Цифровая экспертиза
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[10px] leading-snug text-muted-foreground">
                Использование AI для оптимизации лекал и минимизации остатков ткани. Виртуальные
                примерки для идеальной посадки.
              </CardContent>
            </Card>

            <Card className="group h-full rounded-2xl border-dashed border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-tighter">
                  <Globe className="h-3.5 w-3.5 text-accent" />
                  Глобальное видение
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[10px] leading-snug text-muted-foreground">
                Сочетание локальных традиций с международными трендами. Представленность в
                концепт-сторах Европы и Азии.
              </CardContent>
            </Card>

            <Card className="group h-full rounded-2xl border-dashed border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-tighter">
                  <Heart className="h-3.5 w-3.5 text-red-500" />
                  Социальная ответственность
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[10px] leading-snug text-muted-foreground">
                Поддержка локальных мастеров и честные условия труда. Мы инвестируем в развитие
                ремесленных сообществ и образовательные программы.
              </CardContent>
            </Card>

            <Card className="group h-full rounded-2xl border-dashed border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-tighter">
                  <MessageSquare className="h-3.5 w-3.5 text-accent" />
                  Сообщество и связь
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[10px] leading-snug text-muted-foreground">
                Создание пространства для диалога между творцом и клиентом. Регулярные воркшопы и
                закрытые превью для друзей бренда.
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              className="h-auto gap-2 rounded-none border-b border-transparent px-0 pb-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground transition-all hover:border-accent hover:text-accent"
            >
              <BookText className="h-3 w-3" /> Скачать ESG-отчет бренда (2023)
            </Button>
          </div>

          {/* New Enhancements Section */}
          <div className="space-y-4 pt-12">
            {/* Timeline */}
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tighter">
                <History className="h-5 w-5 text-accent" /> Путь бренда
              </h3>
              <div className="relative ml-3 space-y-4 border-l-2 border-accent/20 pb-4">
                {[
                  {
                    year: '2018',
                    title: 'Основание',
                    desc: 'Первая мастерская в Архангельске, вдохновленная культурой Севера.',
                  },
                  {
                    year: '2020',
                    title: 'Признание',
                    desc: 'Победа на Fashion Future Awards в номинации "Sustainable Tech".',
                  },
                  {
                    year: '2022',
                    title: 'Инновации',
                    desc: 'Запуск линии из переработанного кашемира и внедрение цифровых лекал.',
                  },
                  {
                    year: '2024',
                    title: 'Экспансия',
                    desc: 'Открытие флагманского пространства и выход на рынки Азии.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white bg-accent shadow-sm" />
                    <div className="flex flex-col gap-2 md:flex-row md:items-baseline">
                      <span className="text-sm font-black text-accent">{item.year}</span>
                      <h4 className="text-sm font-black uppercase tracking-tight">{item.title}</h4>
                    </div>
                    <p className="mt-1 max-w-lg text-[11px] font-medium leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Material Map & Care Guide Grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tighter">
                  <Map className="h-5 w-5 text-accent" /> Происхождение сырья
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      material: 'Меринос',
                      origin: 'Австралия',
                      detail: 'Фермы с гуманным отношением к животным',
                    },
                    {
                      material: 'Кашемир',
                      origin: 'Внутренняя Монголия',
                      detail: 'Бережное традиционное производство',
                    },
                    {
                      material: 'Лён',
                      origin: 'Север России',
                      detail: 'Локальные органические поля',
                    },
                    { material: 'Фурнитура', origin: 'Италия', detail: 'Биоразлагаемые материалы' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center gap-3 rounded-2xl border border-muted/10 bg-muted/5 p-3 transition-all hover:border-accent/30"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/5 text-accent transition-all group-hover:bg-accent group-hover:text-white">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-tight">
                            {item.material}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                          <span className="text-[10px] font-bold text-accent">{item.origin}</span>
                        </div>
                        <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tighter">
                  <Sparkles className="h-5 w-5 text-accent" /> Гид по уходу
                </h3>
                <div className="relative overflow-hidden rounded-xl border border-accent/10 bg-accent/5 p-4">
                  <div className="absolute right-0 top-0 p-4 opacity-5">
                    <ShieldCheck className="h-24 w-24" />
                  </div>
                  <div className="relative space-y-4">
                    {[
                      'Стирать вручную при температуре не выше 30°C',
                      'Использовать специальные средства для деликатных тканей',
                      'Сушить горизонтально в расправленном виде',
                      'Хранить в сложенном виде для сохранения формы',
                    ].map((text, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                          <Check className="h-3 w-3 text-accent" />
                        </div>
                        <p className="text-[11px] font-medium leading-tight text-foreground/80">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Certificates & Awards */}
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tighter">
                <Award className="h-5 w-5 text-accent" /> Сертификаты и признание
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'GOTS', desc: 'Organic Textile Standard' },
                  { label: 'LWG', desc: 'Gold Rated Leather' },
                  { label: 'OEKO-TEX', desc: 'Standard 100 Safe' },
                  { label: 'CLIMATE', desc: 'Neutral Certified' },
                ].map((cert, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col items-center gap-1 rounded-2xl border border-muted/20 p-4 text-center transition-all hover:bg-muted/5"
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted/10 transition-transform group-hover:scale-110">
                      <Award className="h-5 w-5 text-muted-foreground group-hover:text-accent" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {cert.label}
                    </span>
                    <span className="text-[8px] font-bold uppercase leading-tight text-muted-foreground">
                      {cert.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card className="overflow-hidden rounded-xl border-accent/10 bg-white shadow-lg">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between border-b border-border/50 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Основан
                </span>
                <span className="text-xs font-black">{brand.foundedYear}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Локация
                </span>
                <span className="flex items-center gap-1 text-xs font-black uppercase tracking-tighter">
                  <MapPin className="h-3 w-3 text-accent" /> {brand.city || 'Москва'}, РФ
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Сегмент
                </span>
                <Badge
                  variant="outline"
                  className="border-accent/30 text-[9px] font-black uppercase text-accent"
                >
                  {brand.segment}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="ghost"
                  className="h-8 rounded-xl bg-muted/5 text-[9px] font-black uppercase tracking-wider transition-all hover:bg-accent/5 hover:text-accent"
                  onClick={() => setIsRetailerMapOpen(true)}
                >
                  <MapPin className="mr-1.5 h-3 w-3" /> Шоурум
                </Button>
                <Button
                  variant="ghost"
                  className="h-8 rounded-xl bg-muted/5 text-[9px] font-black uppercase tracking-wider transition-all hover:bg-accent/5 hover:text-accent"
                  onClick={() => setIsRetailerOpen(true)}
                >
                  <Building className="mr-1.5 h-3 w-3" /> Розница
                </Button>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3">
                  {[
                    { icon: <Globe className="h-4 w-4" />, link: brand.website },
                    { icon: <Instagram className="h-4 w-4" />, link: brand.socials?.instagram },
                    { icon: <Send className="h-4 w-4" />, link: brand.socials?.telegram },
                  ]
                    .filter((s) => s.link)
                    .map((social, i) => (
                      <a
                        key={i}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-accent"
                      >
                        {social.icon}
                      </a>
                    ))}
                </div>
                <div className="flex flex-col gap-1 text-[10px] font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> {brand.contact?.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> {brand.contact?.publicEmail}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. Meet the Team & Production Stats Section */}
      <div className="mt-16 space-y-10 border-t pt-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-base font-black uppercase tracking-tighter">Команда и создание</h3>
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsTeamOpen(true)}
            className="group gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-accent/5 hover:text-accent"
          >
            Познакомиться лично{' '}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div
            className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-xl shadow-2xl md:col-span-5"
            onClick={() => setIsTeamOpen(true)}
          >
            <Image
              src={
                brand.team?.[0]?.imageUrl ||
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80'
              }
              alt={brand.team?.[0]?.name || 'Founder'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                Основатель
              </p>
              <p className="text-sm font-black uppercase tracking-tighter text-white">
                {brand.team?.[0]?.name || 'Анна Сергеева'}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/70">
                {brand.team?.[0]?.role || 'Креативный директор'}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6 md:col-span-7">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              <div className="flex flex-col space-y-2 border-l-2 border-accent/20 pl-6">
                <div className="flex items-center gap-3 text-accent">
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-black leading-none tracking-tighter">15+</span>
                </div>
                <p className="text-[10px] font-black uppercase leading-tight tracking-widest text-muted-foreground">
                  Мастеров своего дела
                </p>
                <p className="text-[10px] leading-tight text-muted-foreground/60">
                  Лучшие портные и технологи с опытом работы от 10 лет.
                </p>
              </div>

              <div className="flex flex-col space-y-2 border-l-2 border-accent/20 pl-6">
                <div className="flex items-center gap-3 text-accent">
                  <Award className="h-6 w-6" />
                  <span className="text-sm font-black leading-none tracking-tighter">100%</span>
                </div>
                <p className="text-[10px] font-black uppercase leading-tight tracking-widest text-muted-foreground">
                  Ручная работа
                </p>
                <p className="text-[10px] leading-tight text-muted-foreground/60">
                  Каждое изделие проходит ручной контроль качества на всех этапах.
                </p>
              </div>

              <div className="flex flex-col space-y-2 border-l-2 border-accent/20 pl-6">
                <div className="flex items-center gap-3 text-accent">
                  <Timer className="h-6 w-6" />
                  <span className="text-sm font-black leading-none tracking-tighter">7-10 дн.</span>
                </div>
                <p className="text-[10px] font-black uppercase leading-tight tracking-widest text-muted-foreground">
                  На пошив изделия
                </p>
                <p className="text-[10px] leading-tight text-muted-foreground/60">
                  Бережное создание вашего заказа по индивидуальным параметрам.
                </p>
              </div>

              <div className="flex flex-col space-y-2 border-l-2 border-accent/20 pl-6">
                <div className="flex items-center gap-3 text-accent">
                  <Shield className="h-6 w-6" />
                  <span className="whitespace-nowrap text-sm font-black leading-none tracking-tighter">
                    1 год
                  </span>
                </div>
                <p className="text-[10px] font-black uppercase leading-tight tracking-widest text-muted-foreground">
                  Гарантии качества
                </p>
                <p className="text-[10px] leading-tight text-muted-foreground/60">
                  Бесплатный ремонт и обслуживание трикотажных изделий.
                </p>
              </div>
            </div>

            <Card className="relative overflow-hidden rounded-3xl border-none bg-muted/30 p-4">
              <Quote className="absolute right-4 top-4 h-12 w-12 text-accent/5" />
              <div className="relative z-10 space-y-2">
                <h4 className="text-sm font-black uppercase tracking-widest">
                  Прозрачность производства
                </h4>
                <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
                  Мы гордимся тем, что наши цеха расположены в России. Вы всегда можете записаться
                  на экскурсию в наше производство в Санкт-Петербурге, чтобы увидеть, как создаются
                  ваши любимые вещи.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 3. Community & Mentions Section (Reviews & UGC) */}
      {storefrontSettings.showReviews && (
        <div className="mt-16 space-y-10 border-t pb-16 pt-16">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10">
                  <Star className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tighter text-foreground">
                  Комьюнити и отзывы
                </h3>
              </div>
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
                Образы и рекомендации от наших клиентов, амбассадоров и звездных друзей. Мы ценим
                каждое упоминание и честный отзыв о качестве и стиле.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsShareLookOpen(true)}
              className="h-11 gap-2 rounded-xl border-accent/20 px-8 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-accent/5 hover:text-accent"
            >
              <Camera className="h-4 w-4" /> Поделиться образом
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                user: 'Ксения Собчак',
                role: 'Журналист и инфлюенсер',
                type: 'star',
                text: 'Nordic Wool — это мой личный фаворит в этом сезоне. Качество трикотажа на уровне лучших мировых домов моды. Рекомендую!',
                image: 'https://images.unsplash.com/photo-1509631179647-01773331693ae?w=600&q=80',
                badge: 'Звездный выбор',
                products: ['product-1'],
              },
              {
                user: 'Александр Р.',
                role: 'Постоянный клиент',
                type: 'client',
                text: 'Заказывал предзаказом. Пришло вовремя, упаковка — отдельное удовольствие. Сидит идеально по моим меркам.',
                image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
                badge: 'Куплено на платформе',
                products: ['product-2', 'product-3'],
              },
              {
                user: '@maria_fashion',
                role: 'Fashion-блогер',
                type: 'influencer',
                text: 'Посмотрите, как этот кардиган меняет весь образ! Сделала обзор в сторис. Материал очень приятный к телу.',
                image: 'https://images.unsplash.com/photo-1539109132271-411a9ee2d4c1?w=600&q=80',
                badge: 'Коллаборация',
                products: ['product-1', 'product-2'],
              },
            ].map((review, i) => (
              <Card
                key={i}
                className="group overflow-hidden rounded-xl border-muted/20 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={review.image}
                      alt={review.user}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute left-6 top-4">
                      <Badge
                        className={cn(
                          'rounded-full border-none px-3 py-1.5 text-[8px] font-black uppercase tracking-widest',
                          review.type === 'star'
                            ? 'bg-amber-50 text-white'
                            : review.type === 'influencer'
                              ? 'bg-accent-primary/10 text-white'
                              : 'bg-[#22c55e] text-white'
                        )}
                      >
                        {review.badge}
                      </Badge>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 space-y-4 text-white">
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase leading-none tracking-tighter">
                          {review.user}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                          {review.role}
                        </p>
                      </div>

                      <div className="h-px w-full bg-white/20" />

                      <div className="relative">
                        <Quote className="absolute -left-3 -top-3 h-6 w-6 text-white/10" />
                        <p className="relative z-10 line-clamp-3 pl-2 text-xs font-medium italic leading-relaxed text-white/90">
                          «{review.text}»
                        </p>
                      </div>

                      <div className="pt-2">
                        {/* cabinetSurface v1 */}
                        <TabsList
                          className={cn(
                            cabinetSurface.tabsList,
                            'border-0 bg-transparent p-0 shadow-none'
                          )}
                        >
                          <TabsTrigger
                            value="products"
                            className={cn(
                              cabinetSurface.tabsTrigger,
                              'group/link h-auto gap-1.5 border-0 bg-transparent p-0 text-[9px] font-black uppercase text-white shadow-none hover:text-accent data-[state=active]:border-0 data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:shadow-none'
                            )}
                          >
                            Смотреть товары{' '}
                            <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                          </TabsTrigger>
                        </TabsList>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </TabsContent>
  );
}
