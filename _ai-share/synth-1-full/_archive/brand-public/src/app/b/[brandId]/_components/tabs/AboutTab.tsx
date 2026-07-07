'use client';

import React from 'react';
import Image from 'next/image';
import {
  Quote,
  Layers,
  Leaf,
  Palette,
  ShieldCheck,
  Brain,
  Globe,
  Heart,
  MessageSquare,
  BookText,
  History,
  Map,
  Check,
  Award,
  Timer,
  MapPin,
  Building,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Instagram,
  Send,
  ArrowRight,
  Camera,
  Star,
  Sparkles,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AboutTabProps {
  brand: any;
  storefrontSettings: any;
  isTeamOpen: boolean;
  setIsTeamOpen: (open: boolean) => void;
  currentTeamIdx: number;
  setCurrentTeamIdx: (idx: number | ((prev: number) => number)) => void;
  setIsRetailerMapOpen: (open: boolean) => void;
  setIsRetailerOpen: (open: boolean) => void;
  setIsShareLookOpen: (open: boolean) => void;
}

export function AboutTab({
  brand,
  storefrontSettings,
  isTeamOpen,
  setIsTeamOpen,
  currentTeamIdx,
  setCurrentTeamIdx,
  setIsRetailerMapOpen,
  setIsRetailerOpen,
  setIsShareLookOpen,
}: AboutTabProps) {
  return (
    <TabsContent
      value="about"
      className="space-y-4 duration-700 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Main Header for the tab */}
      <div className="space-y-2">
        <h2 className="text-base font-black uppercase tracking-tighter">ДНК и ценности</h2>
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
            <DNABlock
              icon={<Layers className="h-3.5 w-3.5 text-accent" />}
              title="Материалы"
              text="70% наших тканей — это премиальный меринос и кашемир. Мы предоставляем полную карту происхождения сырья для каждого изделия."
            />
            <DNABlock
              icon={<Leaf className="h-3.5 w-3.5 text-emerald-500" />}
              title="Устойчивость"
              text="100% материалов сертифицированы. Мы компенсируем углеродный след каждой доставки и поддерживаем локальные производства."
            />
            <DNABlock
              icon={<Palette className="h-3.5 w-3.5 text-accent" />}
              title="Идентичность и наследие"
              text="Визуальный язык, вдохновленный эстетикой Севера и функционализмом. Сохранение традиционных техник в цифровом контексте."
            />
            <DNABlock
              icon={<ShieldCheck className="h-3.5 w-3.5 text-accent" />}
              title="Контроль качества"
              text="Пятиступенчатая система проверки от анализа нити до финишной обработки. Гарантия соответствия премиум-стандартам."
            />
            <DNABlock
              icon={<Brain className="h-3.5 w-3.5 text-accent" />}
              title="Цифровая экспертиза"
              text="Использование AI для оптимизации лекал и минимизации остатков ткани. Виртуальные примерки для идеальной посадки."
            />
            <DNABlock
              icon={<Globe className="h-3.5 w-3.5 text-accent" />}
              title="Глобальное видение"
              text="Сочетание локальных традиций с международными трендами. Представленность в концепт-сторах Европы и Азии."
            />
            <DNABlock
              icon={<Heart className="h-3.5 w-3.5 text-red-500" />}
              title="Социальная ответственность"
              text="Поддержка локальных мастеров и честные условия труда. Мы инвестируем в развитие ремесленных сообществ и образовательные программы."
            />
            <DNABlock
              icon={<MessageSquare className="h-3.5 w-3.5 text-accent" />}
              title="Сообщество и связь"
              text="Создание пространства для диалога между творцом и клиентом. Регулярные воркшопы и закрытые превью для друзей бренда."
            />
          </div>

          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              className="h-auto gap-2 rounded-none border-b border-transparent px-0 pb-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground transition-all hover:border-accent hover:text-accent"
            >
              <BookText className="h-3 w-3" /> Скачать ESG-отчет бренда (2023)
            </Button>
          </div>

          {/* Timeline & Maps */}
          <div className="space-y-4 pt-6">
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
                  <MapPin className="mr-1.5 h-3 w-3" /> АССОРТИМЕНТ
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

      {/* Team Section */}
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
              <p className="text-base font-black uppercase tracking-tighter text-white">
                {brand.team?.[0]?.name || 'Анна Сергеева'}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/70">
                {brand.team?.[0]?.role || 'Креативный директор'}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6 md:col-span-7">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              <ProductionStat
                icon={<Users className="h-6 w-6" />}
                count="15+"
                label="Мастеров своего дела"
                text="Лучшие портные и технологи с опытом работы от 10 лет."
              />
              <ProductionStat
                icon={<Award className="h-6 w-6" />}
                count="100%"
                label="Ручная работа"
                text="Каждое изделие проходит ручной контроль качества на всех этапах."
              />
              <ProductionStat
                icon={<Timer className="h-6 w-6" />}
                count="7-10 дн."
                label="На пошив изделия"
                text="Бережное создание вашего заказа по индивидуальным параметрам."
              />
              <ProductionStat
                icon={<Shield className="h-6 w-6" />}
                count="1 год"
                label="Гарантии качества"
                text="Бесплатный ремонт и обслуживание трикотажных изделий."
              />
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

      {/* Community Section */}
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
              },
              {
                user: 'Александр Р.',
                role: 'Постоянный клиент',
                type: 'client',
                text: 'Заказывал предзаказом. Пришло вовремя, упаковка — отдельное удовольствие. Сидит идеально по моим меркам.',
                image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
                badge: 'Куплено на платформе',
              },
              {
                user: '@maria_fashion',
                role: 'Fashion-блогер',
                type: 'influencer',
                text: 'Посмотрите, как этот кардиган меняет весь образ! Сделала обзор в сторис. Материал очень приятный к телу.',
                image: 'https://images.unsplash.com/photo-1539109132271-411a9ee2d4c1?w=600&q=80',
                badge: 'Коллаборация',
              },
            ].map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </div>
      )}

      {/* Team Dialog */}
      <Dialog open={isTeamOpen} onOpenChange={setIsTeamOpen}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Команда бренда</DialogTitle>
          <DialogDescription className="sr-only">
            Информация о команде и создателях бренда
          </DialogDescription>
          <div className="relative flex aspect-video w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:aspect-[16/9] md:flex-row">
            <div className="relative h-64 w-full overflow-hidden md:h-auto md:w-1/2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTeamIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={brand.team?.[currentTeamIdx]?.imageUrl || ''}
                    alt={brand.team?.[currentTeamIdx]?.name || ''}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>

              {(brand.team?.length || 0) > 1 && (
                <div className="absolute bottom-8 left-8 z-20 flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentTeamIdx((prev) =>
                        prev > 0 ? (prev as number) - 1 : (brand.team?.length || 1) - 1
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentTeamIdx((prev) =>
                        prev < (brand.team?.length || 1) - 1 ? (prev as number) + 1 : 0
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative flex flex-1 flex-col justify-center bg-white p-4 md:p-4">
              <DialogPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-6 top-4 rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DialogPrimitive.Close>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTeamIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                      Команда
                    </p>
                    <h3 className="text-base font-black uppercase leading-none tracking-tighter">
                      {brand.team?.[currentTeamIdx]?.name}
                    </h3>
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {brand.team?.[currentTeamIdx]?.role}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Quote className="absolute -left-4 -top-4 h-8 w-8 text-accent/10" />
                      <p className="relative z-10 pl-2 text-sm font-medium italic leading-relaxed text-foreground/80">
                        «{brand.team?.[currentTeamIdx]?.quote}»
                      </p>
                    </div>
                    <div className="h-px w-12 bg-accent/20" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {brand.team?.[currentTeamIdx]?.bio}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="group/btn flex h-10 items-center gap-2 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-accent transition-transform group-hover/btn:-rotate-12" />
                      Написать
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl border border-transparent transition-all hover:border-accent/10 hover:bg-accent/5 hover:text-accent"
                      >
                        <Instagram className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl border border-transparent transition-all hover:border-accent/10 hover:bg-accent/5 hover:text-accent"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {(brand.team?.length || 0) > 1 && (
                <div className="absolute bottom-8 right-12 flex gap-1.5">
                  {brand.team?.map((_: any, i: number) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 w-4 rounded-full transition-all duration-300',
                        i === currentTeamIdx ? 'w-8 bg-accent' : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}

// --- Internal Helper Components ---

function DNABlock({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card className="group h-full rounded-2xl border-dashed border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-tighter">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-[10px] leading-snug text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  );
}

function ProductionStat({
  icon,
  count,
  label,
  text,
}: {
  icon: React.ReactNode;
  count: string;
  label: string;
  text: string;
}) {
  return (
    <div className="flex flex-col space-y-2 border-l-2 border-accent/20 pl-6">
      <div className="flex items-center gap-3 text-accent">
        {icon}
        <span className="text-base font-black leading-none tracking-tighter">{count}</span>
      </div>
      <p className="text-[10px] font-black uppercase leading-tight tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="text-[10px] leading-tight text-muted-foreground/60">{text}</p>
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  return (
    <Card className="group overflow-hidden rounded-xl border-muted/20 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl">
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={review.image}
            alt={review.user}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

          <div className="absolute left-6 top-4">
            <Badge
              className={cn(
                'rounded-full border-none px-3 py-1.5 text-[8px] font-black uppercase tracking-widest',
                review.type === 'star'
                  ? 'bg-amber-500 text-white'
                  : review.type === 'influencer'
                    ? 'bg-accent-primary text-white'
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
              <div className="group/link flex h-auto cursor-pointer items-center gap-1.5 p-0 text-[9px] font-black uppercase text-white transition-colors hover:text-accent">
                Смотреть товары{' '}
                <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function Shield(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
