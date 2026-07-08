'use client';

import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Handshake,
  Check,
  MessageSquare,
  FileText,
  Briefcase,
  Sparkles,
  Factory,
  Newspaper,
  Mail,
  Phone,
  BookText,
  Layers,
  ShieldCheck,
  Ruler,
  Image,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartnershipTabProps {
  brand: any;
  displayName: string;
  setMessageCategory: (category: string) => void;
  setIsMessageDialogOpen: (open: boolean) => void;
  handleB2bRequest: (type: string) => void;
  sentB2bRequests: string[];
  b2bPartnerStatus: 'none' | 'pending' | 'friend' | 'active' | 'spot';
  setB2bPartnerStatus: (status: 'none' | 'pending' | 'friend' | 'active' | 'spot') => void;
  handleB2bRegistration: () => void;
  toast: any;
}

export function PartnershipTab({
  brand,
  displayName,
  setMessageCategory,
  setIsMessageDialogOpen,
  handleB2bRequest,
  sentB2bRequests,
  b2bPartnerStatus,
  setB2bPartnerStatus,
  handleB2bRegistration,
  toast,
}: PartnershipTabProps) {
  return (
    <TabsContent
      value="partnership"
      className="space-y-6 pt-4 duration-700 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-tighter">Сотрудничество</h2>
        <p className="font-medium text-muted-foreground">
          B2B решения, партнерство и возможности для роста вместе с {displayName}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* 1. Retail & Distribution */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden rounded-xl border-none bg-white shadow-xl">
            <CardHeader className="bg-accent/5 p-4 pb-4">
              <div className="mb-2 flex items-center gap-3">
                <Handshake className="h-6 w-6 text-accent" />
                <CardTitle className="text-sm font-black uppercase tracking-tight">
                  Магазинам и дистрибьюторам
                </CardTitle>
              </div>
              <CardDescription className="text-sm font-medium">
                Мы предлагаем гибкие условия оптовых закупок и эксклюзивные права на дистрибуцию в
                регионах.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Условия B2B
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        label: 'Минимальный заказ (MOQ)',
                        value: brand.b2b?.minOrderQuantity
                          ? `от ${brand.b2b.minOrderQuantity} ед.`
                          : 'от 10 ед. / 50к ₽',
                      },
                      { label: 'Срок отгрузки', value: '3-5 дней (склад) / 21-30 (заказ)' },
                      { label: 'Валюта расчетов', value: 'RUB (только ₽)' },
                      { label: 'Условия оплаты', value: '50/50 (запуск / отгрузка)' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-muted/10 py-2"
                      >
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-[11px] font-black">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Логистика и поддержка
                  </h4>
                  <div className="space-y-2">
                    {[
                      'Доставка по всей РФ и СНГ',
                      'Предоставление маркетинговых материалов',
                      'Обучение персонала торговых точек',
                      'Приоритетный доступ к новым коллекциям',
                      'Интеграция с вашей учетной системой',
                      'EDI и электронный документооборот',
                      'Персональный B2B-менеджер',
                      'Аналитика продаж и остатков',
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-medium">
                        <Check className="h-3.5 w-3.5 stroke-[3px] text-accent" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  onClick={() => {
                    setMessageCategory('Оптовый заказ / Дистрибуция');
                    setIsMessageDialogOpen(true);
                  }}
                  className="h-10 flex-1 rounded-xl bg-black font-black uppercase tracking-widest text-white shadow-lg shadow-black/20 transition-all hover:bg-black/90"
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Как связаться
                </Button>
                <Button
                  onClick={() => handleB2bRequest('terms')}
                  variant="outline"
                  className={cn(
                    'h-10 flex-1 rounded-xl font-black uppercase tracking-widest transition-all',
                    sentB2bRequests.includes('terms')
                      ? 'border-green-200 bg-green-50 text-green-600'
                      : 'border-muted/20 hover:bg-accent/5 hover:text-accent'
                  )}
                >
                  {sentB2bRequests.includes('terms') ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Запрос отправлен
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" /> Прайс-лист
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleB2bRequest('stock')}
                  variant="outline"
                  className={cn(
                    'h-10 flex-1 rounded-xl font-black uppercase tracking-widest transition-all',
                    sentB2bRequests.includes('stock')
                      ? 'border-green-200 bg-green-50 text-green-600'
                      : 'border-muted/20 hover:bg-accent/5 hover:text-accent'
                  )}
                >
                  <Layers className="mr-2 h-4 w-4" /> Запросить сток
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Suppliers Section */}
            <Card className="rounded-xl border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <div className="mb-1 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-accent" />
                  <CardTitle className="text-sm font-black uppercase tracking-widest">
                    Поставщикам сырья
                  </CardTitle>
                </div>
                <CardDescription className="text-[10px] font-medium leading-tight">
                  Мы всегда в поиске лучших материалов: от кашемира до фурнитуры.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ul className="mb-6 space-y-2">
                  {[
                    'Сертифицированное сырье (GOTS, LWG)',
                    'Инновационные составы',
                    'Стабильность поставок',
                  ].map((t, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] font-bold">
                      <div className="h-1 w-1 rounded-full bg-accent" /> {t}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="h-9 w-full rounded-xl border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white"
                  onClick={() => {
                    setMessageCategory('Предложение от поставщика');
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5" /> Написать предложение
                </Button>
              </CardContent>
            </Card>

            {/* Influencers & Collabs */}
            <Card className="rounded-xl border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <div className="mb-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <CardTitle className="text-sm font-black uppercase tracking-widest">
                    Инфлюенсеры и Коллабы
                  </CardTitle>
                </div>
                <CardDescription className="text-[10px] font-medium leading-tight">
                  Создаем совместные истории с теми, кто разделяет наши ценности.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ul className="mb-6 space-y-2">
                  {['Амбассадорство бренда', 'Капсульные коллаборации', 'UGC-партнерство'].map(
                    (t, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] font-bold">
                        <div className="h-1 w-1 rounded-full bg-accent" /> {t}
                      </li>
                    )
                  )}
                </ul>
                <Button
                  variant="outline"
                  className="h-9 w-full rounded-xl border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white"
                  onClick={() => {
                    setMessageCategory('Инфлюенсер / Коллаборация');
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5" /> Обсудить проект
                </Button>
              </CardContent>
            </Card>

            {/* Manufacturers Section - NEW */}
            <Card className="rounded-xl border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <div className="mb-1 flex items-center gap-2">
                  <Factory className="h-4 w-4 text-accent" />
                  <CardTitle className="text-sm font-black uppercase tracking-widest">
                    Производителям
                  </CardTitle>
                </div>
                <CardDescription className="text-[10px] font-medium leading-tight">
                  Предложите свои производственные мощности для наших коллекций.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ul className="mb-6 space-y-2">
                  {[
                    'Пошив трикотажа и текстиля',
                    'Высокие стандарты качества',
                    'Масштабируемость',
                  ].map((t, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] font-bold">
                      <div className="h-1 w-1 rounded-full bg-accent" /> {t}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="h-9 w-full rounded-xl border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white"
                  onClick={() => {
                    setMessageCategory('Предложение от производства');
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5" /> Предложить услуги
                </Button>
              </CardContent>
            </Card>

            {/* Media & Advertising - NEW */}
            <Card className="rounded-xl border-muted/20 bg-muted/5 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <div className="mb-1 flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-accent" />
                  <CardTitle className="text-sm font-black uppercase tracking-widest">
                    Медиа и Реклама
                  </CardTitle>
                </div>
                <CardDescription className="text-[10px] font-medium leading-tight">
                  Вопросы выставок, рекламных показов и PR-сотрудничества.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ul className="mb-6 space-y-2">
                  {['Участие в выставках', 'Рекламные интеграции', 'Интервью и пресс-релизы'].map(
                    (t, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] font-bold">
                        <div className="h-1 w-1 rounded-full bg-accent" /> {t}
                      </li>
                    )
                  )}
                </ul>
                <Button
                  variant="outline"
                  className="h-9 w-full rounded-xl border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white"
                  onClick={() => {
                    setMessageCategory('Медиа / Реклама / Выставки');
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5" /> Написать по PR
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 2. B2B Sidebar / Contact info */}
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-xl border border-muted/20 bg-muted/5 shadow-sm">
            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                  B2B Контакты
                </p>
                <h3 className="text-sm font-black uppercase leading-none tracking-tighter">
                  По вопросам сотрудничества
                </h3>
              </div>

              <div className="space-y-4">
                <div className="group flex cursor-pointer items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all group-hover:bg-accent group-hover:text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground">
                      Email для предложений
                    </p>
                    <p className="text-sm font-bold tracking-tight">care@nordic-wool.com</p>
                  </div>
                </div>
                <div className="group flex cursor-pointer items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all group-hover:bg-accent group-hover:text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground">
                      Горячая линия B2B
                    </p>
                    <p className="text-sm font-bold tracking-tight">+7 495 765-43-21</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  B2B Документация
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { icon: BookText, label: 'Презентация бренда (PDF)' },
                    { icon: FileText, label: 'Договор поставки (Образец)' },
                    { icon: ShieldCheck, label: 'Сертификаты соответствия (ЕАС)' },
                    { icon: Ruler, label: 'Гайд по размерным сеткам' },
                    { icon: Image, label: 'Lookbook & Контент-пак' },
                    { icon: Truck, label: 'Логистические условия' },
                  ].map((doc, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      className="group h-9 justify-start px-0 hover:bg-transparent hover:text-accent"
                    >
                      <doc.icon className="mr-3 h-4 w-4 text-accent transition-transform group-hover:scale-110" />
                      <span className="text-[10px] font-black uppercase tracking-tight">
                        {doc.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="relative space-y-4 overflow-hidden rounded-xl border border-muted/20 p-4">
            {b2bPartnerStatus !== 'none' && (
              <div className="absolute right-4 top-4">
                <Badge
                  className={cn(
                    'border-none px-2 py-0.5 text-[8px] font-black uppercase',
                    b2bPartnerStatus === 'pending'
                      ? 'bg-orange-500'
                      : b2bPartnerStatus === 'active'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                  )}
                >
                  {b2bPartnerStatus === 'pending' && 'Ожидает подтверждения'}
                  {b2bPartnerStatus === 'friend' && 'Партнер-друг'}
                  {b2bPartnerStatus === 'active' && 'Действующий партнер'}
                  {b2bPartnerStatus === 'spot' && 'Точечное взаимодействие'}
                </Badge>
              </div>
            )}
            <h4 className="text-sm font-black uppercase tracking-widest">Портал для партнеров</h4>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {b2bPartnerStatus === 'none'
                ? `Присоединяйтесь к экосистеме ${displayName}. Получите доступ к эксклюзивным условиям, стокам в реальном времени и автоматизированному заказу коллекций.`
                : `Ваш текущий статус взаимодействия с брендом: ${
                    b2bPartnerStatus === 'pending'
                      ? 'Заявка на рассмотрении'
                      : b2bPartnerStatus === 'friend'
                        ? 'Дружественное сотрудничество'
                        : b2bPartnerStatus === 'active'
                          ? 'Активный контракт'
                          : 'Точечные проекты'
                  }`}
            </p>
            <div className="space-y-3">
              <Button
                variant={b2bPartnerStatus === 'none' ? 'outline' : 'default'}
                className={cn(
                  'h-11 w-full rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all',
                  b2bPartnerStatus === 'pending'
                    ? 'cursor-not-allowed border-transparent bg-muted text-muted-foreground'
                    : b2bPartnerStatus === 'none'
                      ? 'hover:bg-accent hover:text-white'
                      : 'bg-black text-white'
                )}
                onClick={handleB2bRegistration}
                disabled={b2bPartnerStatus === 'pending'}
              >
                {b2bPartnerStatus === 'none' ? 'Стать партнером бренда' : 'Войти в B2B Кабинет'}
              </Button>

              {b2bPartnerStatus === 'pending' && (
                <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2">
                  <Button
                    variant="ghost"
                    className="h-8 rounded-lg border border-green-100 bg-green-50 text-[7px] font-black uppercase text-green-700"
                    onClick={() => {
                      setB2bPartnerStatus('active');
                      toast({
                        title: 'Партнерство подтверждено',
                        description: 'Статус: Действующий партнер',
                      });
                    }}
                  >
                    Принять (Активный)
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 rounded-lg border border-blue-100 bg-blue-50 text-[7px] font-black uppercase text-blue-700"
                    onClick={() => {
                      setB2bPartnerStatus('friend');
                      toast({
                        title: 'Партнерство подтверждено',
                        description: 'Статус: Друг бренда',
                      });
                    }}
                  >
                    Принять (Друг)
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-bg-surface2 text-text-primary border-border-subtle h-8 rounded-lg border text-[7px] font-black uppercase"
                    onClick={() => {
                      setB2bPartnerStatus('spot');
                      toast({ title: 'Партнерство подтверждено', description: 'Статус: Точечно' });
                    }}
                  >
                    Принять (Точечно)
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}
