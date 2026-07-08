'use client';

import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Settings,
  Activity,
  Layout,
  MessageSquare,
  ShieldCheck,
  Bell,
  Globe,
  Key,
  DollarSign,
  MapPin,
  Calendar,
  Languages,
  Clock,
  Palette,
  Zap,
  Database,
  Package,
  Truck,
  BarChart3,
  FileText,
  Code,
  Download,
  ShieldAlert,
  Briefcase,
  Shield,
  CreditCard,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getSettingsLinks } from '@/lib/data/entity-links';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SecurityContent = dynamic(() => import('@/app/brand/security/page'), { ssr: false });
const SubscriptionContent = dynamic(() => import('@/app/brand/subscription/page'), { ssr: false });

const SETTINGS_KEY = 'syntha_brand_settings';

export default function BrandSettingsPage() {
  const { pulseMode, setPulseMode } = useUIState();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'general' | 'notifications' | 'business' | 'channels' | 'advanced' | 'security' | 'subscription'
  >('general');
  const [locale, setLocale] = useState('ru');
  const [currency, setCurrency] = useState('rub');

  useEffect(() => {
    try {
      const l = localStorage.getItem(`${SETTINGS_KEY}_locale`);
      const c = localStorage.getItem(`${SETTINGS_KEY}_currency`);
      if (l) setLocale(l);
      if (c) setCurrency(c);
    } catch (_) {}
  }, []);

  return (
    <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 pb-24 duration-700 animate-in fade-in">
      {/* Control Panel: Strategic Bar */}
      <div className="flex flex-col items-end justify-between gap-3 border-b border-slate-100 pb-3 md:flex-row">
        <div className="flex flex-wrap items-center gap-2">
          <div className="group flex cursor-default items-center gap-2.5 rounded-lg border border-slate-100 bg-white p-1 pr-3 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white shadow-lg transition-colors group-hover:bg-indigo-600">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-0">
              <p className="text-[8px] font-bold uppercase leading-none tracking-widest text-slate-400">
                Узел
              </p>
              <p className="text-[10px] font-bold leading-tight tracking-tight text-slate-900">
                {String(
                  (profile?.user as { organization_id?: string } | undefined)?.organization_id ??
                    user?.activeOrganizationId ??
                    'Syntha HQ'
                )}
              </p>
            </div>
          </div>
          <div className="group flex cursor-default items-center gap-2.5 rounded-lg border border-slate-100 bg-white p-1 pr-3 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-0">
              <p className="text-[8px] font-bold uppercase leading-none tracking-widest text-slate-400">
                Роль
              </p>
              <p className="text-[10px] font-bold leading-tight tracking-tight text-slate-900">
                {String(
                  (profile?.user as { role?: string } | undefined)?.role ??
                    (Array.isArray(user?.roles) ? user.roles[0] : undefined) ??
                    'Member'
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="ml-auto flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner md:ml-0">
            <Badge
              variant="outline"
              className="h-5 border-emerald-100 bg-white px-2 text-[8px] font-bold uppercase text-emerald-600 shadow-sm"
            >
              <span className="mr-1.5 h-1 w-1 animate-pulse rounded-full bg-emerald-500" /> v2.4.0
              Stable
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg px-3 text-[9px] font-bold uppercase tracking-wider text-slate-500 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-sm"
              onClick={() => {
                setLocale('ru');
                setCurrency('rub');
              }}
            >
              Сброс
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-7 rounded-lg bg-indigo-600 px-4 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-indigo-700"
              onClick={() => {
                try {
                  localStorage.setItem(`${SETTINGS_KEY}_locale`, locale);
                  localStorage.setItem(`${SETTINGS_KEY}_currency`, currency);
                } catch (_) {}
              }}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <div className="w-fit rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
          <TabsList
            className={cn(
              cabinetSurface.tabsList,
              'h-8 gap-1 border-0 bg-transparent p-0 shadow-none'
            )}
          >
            <TabsTrigger
              value="general"
              className="h-6 gap-1.5 rounded-lg px-4 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              <Globe className="h-3 w-3" /> Основные
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="h-6 gap-1.5 rounded-lg px-4 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              <Bell className="h-3 w-3" /> Уведомления
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className="h-6 gap-1.5 rounded-lg px-4 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-3 w-3" /> Логика
            </TabsTrigger>
            <TabsTrigger
              value="channels"
              className="h-6 gap-1.5 rounded-lg px-4 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              <Zap className="h-3 w-3" /> Каналы
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="h-6 gap-1.5 rounded-lg px-4 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              <Code className="h-3 w-3" /> Dev
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="h-6 gap-1.5 rounded-lg px-4 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              <Shield className="h-3 w-3" /> Безопасность
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="h-6 gap-1.5 rounded-lg px-4 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              <CreditCard className="h-3 w-3" /> Подписка
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 outline-none">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <div className="h-1 w-5 rounded-full bg-indigo-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Localization
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-inner transition-transform group-hover:scale-105">
                    <Languages className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Язык
                    </Label>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                      Интерфейс
                    </p>
                  </div>
                </div>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase shadow-inner transition-colors hover:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="ru" className="py-2 text-[11px] font-bold uppercase">
                      Русский
                    </SelectItem>
                    <SelectItem value="en" className="py-2 text-[11px] font-bold uppercase">
                      English
                    </SelectItem>
                    <SelectItem value="zh" className="py-2 text-[11px] font-bold uppercase">
                      中文
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Card>

              <Card className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-inner transition-transform group-hover:scale-105">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Валюта
                    </Label>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                      Расчеты
                    </p>
                  </div>
                </div>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase shadow-inner transition-colors hover:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="rub" className="py-2 text-[11px] font-bold uppercase">
                      ₽ RUB
                    </SelectItem>
                    <SelectItem value="usd" className="py-2 text-[11px] font-bold uppercase">
                      USD (экспорт)
                    </SelectItem>
                    <SelectItem value="eur" className="py-2 text-[11px] font-bold uppercase">
                      € EUR
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Card>

              <Card className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 shadow-inner transition-transform group-hover:scale-105">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Пояс
                    </Label>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                      Время
                    </p>
                  </div>
                </div>
                <Select defaultValue="msk">
                  <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase shadow-inner transition-colors hover:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="msk" className="py-2 text-[11px] font-bold uppercase">
                      UTC+3 MSK
                    </SelectItem>
                    <SelectItem value="utc" className="py-2 text-[11px] font-bold uppercase">
                      UTC+0 LON
                    </SelectItem>
                    <SelectItem value="est" className="py-2 text-[11px] font-bold uppercase">
                      UTC-5 NYC
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Card>

              <Card className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-purple-600 shadow-inner transition-transform group-hover:scale-105">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Дата
                    </Label>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                      Формат
                    </p>
                  </div>
                </div>
                <Select defaultValue="dd.mm.yyyy">
                  <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase shadow-inner transition-colors hover:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="dd.mm.yyyy" className="py-2 text-[11px] font-bold uppercase">
                      ДД.ММ.ГГГГ
                    </SelectItem>
                    <SelectItem value="mm/dd/yyyy" className="py-2 text-[11px] font-bold uppercase">
                      ММ/ДД/ГГГГ
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Card>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <div className="h-1 w-5 rounded-full bg-emerald-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Interface
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Card className="group rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-600 shadow-inner transition-transform group-hover:scale-105">
                      <Palette className="h-4 w-4" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                        Темная тема
                      </Label>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-tight text-slate-400">
                        Энергосбережение
                      </p>
                    </div>
                  </div>
                  <Switch className="scale-90" />
                </div>
              </Card>

              <Card className="group rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-600 shadow-inner transition-transform group-hover:scale-105">
                      <Layout className="h-4 w-4" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                        Компактный режим
                      </Label>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-tight text-slate-400">
                        Максимальная плотность
                      </p>
                    </div>
                  </div>
                  <Switch className="scale-90" />
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4 outline-none">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <div className="h-1 w-5 rounded-full bg-indigo-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Live Pulse Mode
              </h2>
            </div>
            <Card className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
              <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
                    Режим отображения
                  </Label>
                  <p className="max-w-md text-[11px] font-medium leading-relaxed text-slate-500">
                    События в реальном времени: «Бегущая строка» или «Всплывающие» уведомления.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
                  <Tabs
                    defaultValue={pulseMode}
                    value={pulseMode}
                    onValueChange={(val) => setPulseMode(val as any)}
                  >
                    <TabsList
                      className={cn(
                        cabinetSurface.tabsList,
                        'h-7 gap-1 border-0 bg-transparent p-0 shadow-none'
                      )}
                    >
                      <TabsTrigger
                        value="ticker"
                        className="h-5 gap-1.5 rounded-lg px-3 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                      >
                        <Layout className="h-3 w-3" /> Тикер
                      </TabsTrigger>
                      <TabsTrigger
                        value="floating"
                        className="h-5 gap-1.5 rounded-lg px-3 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                      >
                        <MessageSquare className="h-3 w-3" /> Поп-ап
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <div className="h-1 w-5 rounded-full bg-emerald-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Notification Channels
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Bell,
                  title: 'Email',
                  desc: 'Сводка заказов',
                  enabled: true,
                  color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                },
                {
                  icon: MessageSquare,
                  title: 'Push',
                  desc: 'Алерты',
                  enabled: true,
                  color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                },
                {
                  icon: Activity,
                  title: 'In-app',
                  desc: 'События',
                  enabled: true,
                  color: 'bg-blue-50 text-blue-600 border-blue-100',
                },
                {
                  icon: Globe,
                  title: 'Webhook',
                  desc: 'API интеграции',
                  enabled: false,
                  color: 'bg-slate-50 text-slate-400 border-slate-100',
                },
              ].map((item, i) => (
                <Card
                  key={i}
                  className="group rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-100"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border shadow-inner transition-transform group-hover:scale-105',
                        item.color
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <Switch className="scale-90" defaultChecked={item.enabled} />
                  </div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                    {item.title}
                  </Label>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-tight text-slate-400">
                    {item.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Business Logic Settings */}
        <TabsContent value="business" className="space-y-4 outline-none">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <div className="h-1 w-5 rounded-full bg-indigo-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Sales Channels
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'B2B Опт', enabled: true, color: 'bg-blue-500' },
                { label: 'B2C Розница', enabled: true, color: 'bg-emerald-500' },
                { label: 'Marketroom', enabled: true, color: 'bg-purple-500' },
                { label: 'Outlet', enabled: true, color: 'bg-amber-500' },
                { label: 'Marketplaces', enabled: false, color: 'bg-slate-400' },
                { label: 'Dropship', enabled: false, color: 'bg-slate-400' },
              ].map((channel, i) => (
                <Card
                  key={i}
                  className="group flex h-12 flex-col justify-between rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition-all hover:border-indigo-100"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full shadow-sm transition-transform group-hover:scale-125',
                        channel.color
                      )}
                    />
                    <Switch
                      className="origin-right scale-[0.65]"
                      defaultChecked={channel.enabled}
                    />
                  </div>
                  <Label className="mb-0.5 text-[9px] font-bold uppercase leading-none tracking-widest text-slate-900">
                    {channel.label}
                  </Label>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <div className="h-1 w-5 rounded-full bg-emerald-600" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Regions & Logistics
                </h2>
              </div>
              <Card className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-inner transition-transform group-hover:scale-105">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Регионы продаж
                    </Label>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                      Локации
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  {['Москва', 'Санкт-Петербург', 'Регионы РФ'].map((region, i) => (
                    <div
                      key={i}
                      className="group/item flex items-center justify-between rounded-lg border border-slate-100/50 bg-slate-50/50 p-2 transition-all hover:border-indigo-100 hover:bg-white"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 group-hover/item:text-indigo-600">
                        {region}
                      </span>
                      <Switch className="origin-right scale-[0.7]" defaultChecked />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <div className="h-1 w-5 rounded-full bg-blue-600" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Warehousing
                </h2>
              </div>
              <Card className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-inner transition-transform group-hover:scale-105">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Склады
                    </Label>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                      Хранение
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  {['Основной склад', 'Склад СПБ', 'Дропшип склад'].map((warehouse, i) => (
                    <div
                      key={i}
                      className="group/item flex items-center justify-between rounded-lg border border-slate-100/50 bg-slate-50/50 p-2 transition-all hover:border-emerald-100 hover:bg-white"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 group-hover/item:text-emerald-600">
                        {warehouse}
                      </span>
                      <Switch className="origin-right scale-[0.7]" defaultChecked={i < 2} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <div className="h-1 w-5 rounded-full bg-purple-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Tax & Pricing
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Card className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 shadow-inner transition-transform group-hover:scale-105">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      НДС (VAT)
                    </Label>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                      Ставка
                    </p>
                  </div>
                </div>
                <Select defaultValue="20">
                  <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase shadow-inner transition-colors hover:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="0" className="py-2 text-[11px] font-bold uppercase">
                      0% No VAT
                    </SelectItem>
                    <SelectItem value="10" className="py-2 text-[11px] font-bold uppercase">
                      10% Reduced
                    </SelectItem>
                    <SelectItem value="20" className="py-2 text-[11px] font-bold uppercase">
                      20% Standard
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Card>

              <Card className="group rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-purple-600 shadow-inner transition-transform group-hover:scale-105">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                        Dynamic Pricing
                      </Label>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-tight text-slate-400">
                        AI оптимизация
                      </p>
                    </div>
                  </div>
                  <Switch className="scale-90" />
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sales Channels Settings */}
        <TabsContent value="channels" className="space-y-4 outline-none">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <div className="h-1 w-5 rounded-full bg-indigo-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Unified Commerce Channels
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: 'b2b',
                  label: 'B2B Wholesale',
                  desc: 'Оптовые продажи',
                  enabled: true,
                  color: 'bg-blue-500',
                  icon: Briefcase,
                  margin: '45%',
                },
                {
                  id: 'b2c',
                  label: 'B2C Retail',
                  desc: 'Розничные продажи',
                  enabled: true,
                  color: 'bg-emerald-500',
                  icon: Package,
                  margin: '60%',
                },
                {
                  id: 'marketplaces',
                  label: 'Marketplaces',
                  desc: 'WB, Ozon, Lamoda',
                  enabled: true,
                  color: 'bg-purple-500',
                  icon: Globe,
                  margin: '25%',
                },
                {
                  id: 'outlet',
                  label: 'Outlet',
                  desc: 'Распродажи',
                  enabled: true,
                  color: 'bg-amber-500',
                  icon: Truck,
                  margin: '40%',
                },
                {
                  id: 'dropship',
                  label: 'Dropship',
                  desc: 'Без складских запасов',
                  enabled: false,
                  color: 'bg-slate-400',
                  icon: Zap,
                  margin: '50%',
                },
              ].map((channel, i) => (
                <Card
                  key={i}
                  className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg shadow-inner transition-transform group-hover:scale-105',
                        channel.enabled
                          ? `${channel.color} text-white`
                          : 'border border-slate-100 bg-slate-50 text-slate-400'
                      )}
                    >
                      <channel.icon className="h-4 w-4" />
                    </div>
                    <Switch className="origin-right scale-[0.7]" defaultChecked={channel.enabled} />
                  </div>
                  <h3 className="mb-0.5 text-[11px] font-bold uppercase tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
                    {channel.label}
                  </h3>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {channel.desc}
                  </p>
                  {channel.enabled && (
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>Маржа</span>
                        <span className="text-slate-900">{channel.margin}</span>
                      </div>
                      <Button
                        variant="ghost"
                        className="h-7 w-full rounded-lg bg-slate-50 text-[9px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white"
                      >
                        Конфигурация
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <div className="h-1 w-5 rounded-full bg-emerald-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Channel Sync Settings
              </h2>
            </div>
            <Card className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-indigo-100">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-1 w-4 rounded-full bg-indigo-500" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                      Инвентаризация
                    </h4>
                  </div>
                  {[
                    { label: 'Real-time sync', enabled: true },
                    { label: 'Auto-reserve', enabled: true },
                    { label: 'Safety stock', enabled: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="group/item flex items-center justify-between rounded-lg border border-slate-100/50 bg-slate-50/50 p-2 transition-all hover:border-indigo-100 hover:bg-white"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 group-hover/item:text-indigo-600">
                        {item.label}
                      </span>
                      <Switch className="origin-right scale-[0.65]" defaultChecked={item.enabled} />
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-1 w-4 rounded-full bg-emerald-500" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                      Pricing Rules
                    </h4>
                  </div>
                  {[
                    { label: 'Глобальная РРЦ', enabled: false },
                    { label: 'Margin protect', enabled: true },
                    { label: 'Promo sync', enabled: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="group/item flex items-center justify-between rounded-lg border border-slate-100/50 bg-slate-50/50 p-2 transition-all hover:border-emerald-100 hover:bg-white"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 group-hover/item:text-emerald-600">
                        {item.label}
                      </span>
                      <Switch className="origin-right scale-[0.65]" defaultChecked={item.enabled} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4 outline-none">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <div className="h-1 w-5 rounded-full bg-indigo-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Developer Mode
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Code, title: 'Dev Mode', desc: 'Advanced tools', enabled: false },
                { icon: Database, title: 'Debug Logs', desc: 'Detailed tracing', enabled: false },
                { icon: Zap, title: 'API Rate', desc: 'Limit requests', enabled: true },
                { icon: FileText, title: 'Audit Trail', desc: 'Action logs', enabled: true },
              ].map((item, i) => (
                <Card
                  key={i}
                  className="group rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-100"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border shadow-inner transition-transform group-hover:scale-105',
                        item.enabled
                          ? 'border-indigo-100 bg-indigo-50 text-indigo-600'
                          : 'border-slate-100 bg-slate-50 text-slate-400'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <Switch className="origin-right scale-[0.7]" defaultChecked={item.enabled} />
                  </div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                    {item.title}
                  </Label>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-tight text-slate-400">
                    {item.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* Backup & Export */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <div className="h-1 w-5 rounded-full bg-emerald-600" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Data Management
                </h2>
              </div>
              <Card className="group rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-emerald-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-inner transition-transform group-hover:scale-105">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                        Backup & Export
                      </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Full Data control
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      className="h-8 w-full justify-between rounded-lg border-slate-200 bg-slate-50/50 px-3 text-[9px] font-bold uppercase tracking-widest shadow-sm transition-all hover:border-emerald-200 hover:bg-white hover:text-emerald-600"
                    >
                      <span>Full Database (JSON)</span>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-full justify-between rounded-lg border-slate-200 bg-slate-50/50 px-3 text-[9px] font-bold uppercase tracking-widest shadow-sm transition-all hover:border-emerald-200 hover:bg-white hover:text-emerald-600"
                    >
                      <span>Document Archive (PDF)</span>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Danger Zone */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <div className="h-1 w-5 rounded-full bg-rose-600" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Danger Zone
                </h2>
              </div>
              <Card className="group rounded-xl border border-2 border-dashed border-rose-100 bg-rose-50/30 p-3 shadow-sm transition-all hover:bg-rose-50/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-100 text-rose-600 shadow-inner transition-transform group-hover:scale-105">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-tight text-rose-900">
                        Critical Actions
                      </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                        Irreversible operations
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      className="h-8 w-full justify-start rounded-lg border-rose-200 px-3 text-[9px] font-bold uppercase tracking-widest text-rose-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-100"
                    >
                      Factory Reset
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-full justify-start rounded-lg border-rose-400 px-3 text-[9px] font-bold uppercase tracking-widest text-rose-900 shadow-sm transition-all hover:border-rose-500 hover:bg-rose-200"
                    >
                      Delete Organization
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 outline-none">
          {activeTab === 'security' && <SecurityContent />}
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4 outline-none">
          {activeTab === 'subscription' && <SubscriptionContent />}
        </TabsContent>
      </Tabs>

      <RelatedModulesBlock links={getSettingsLinks()} title="Связанные разделы" className="mt-6" />
    </div>
  );
}
