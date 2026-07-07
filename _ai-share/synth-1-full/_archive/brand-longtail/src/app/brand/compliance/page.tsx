'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Download,
  Send,
  RefreshCcw,
  ExternalLink,
} from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getComplianceLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { EdoDocumentFlow } from '@/components/brand/EdoDocumentFlow';

export default function BrandCompliancePage() {
  const [activeTab, setActiveTab] = useState('edo');

  // Mock Data
  const edoDocs = [
    {
      id: 'doc-101',
      type: 'УПД',
      number: 'УПД-445/25',
      date: '05.03.2025',
      partner: 'ЦУМ Москва',
      total: '450 000 ₽',
      status: 'Подписан',
      operator: 'Diadoc',
    },
    {
      id: 'doc-102',
      type: 'УПД',
      number: 'УПД-446/25',
      date: '07.03.2025',
      partner: 'Selfridges (RU)',
      total: '1 200 000 ₽',
      status: 'Отправлен',
      operator: 'Diadoc',
    },
    {
      id: 'doc-103',
      type: 'УКД',
      number: 'УКД-12/25',
      date: '01.03.2025',
      partner: 'Галерея',
      total: '-45 000 ₽',
      status: 'Подписан',
      operator: 'Sbis',
    },
  ];

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-4 pb-16 duration-500 animate-in fade-in"
    >
      <RegistryPageHeader
        title="Russian Layer & Compliance"
        leadPlain="ЭДО (УПД/УКД), маркировка «Честный ЗНАК» и EAC. ЦРПТ и ГИС МТ — единый слой учёта для РФ. Связь с Production, складом и B2B-заказами."
        actions={
          <div className="flex w-full flex-col items-stretch gap-2 sm:items-end">
            <div className="flex flex-wrap justify-end gap-1">
              <Badge variant="outline" className="text-[9px]">
                ЭДО
              </Badge>
              <Badge variant="outline" className="text-[9px]">
                КИЗ / Честный ЗНАК
              </Badge>
              <Badge variant="outline" className="text-[9px]">
                EAC
              </Badge>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.documents}>Документы</Link>
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.warehouse}>Склад</Link>
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.production}>Production</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                className="border-border-default h-9 gap-2 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest"
              >
                <Download className="text-accent-primary h-3 w-3" />
                Экспорт ЦРПТ
              </Button>
              <Button className="bg-text-primary hover:bg-text-primary/90 h-9 gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                <ShieldCheck className="h-3 w-3" />
                Проверить КИЗ
              </Button>
            </div>
          </div>
        }
      />

      <Tabs defaultValue="edo" className="w-full space-y-6" onValueChange={setActiveTab}>
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'w-fit flex-wrap')}>
          <TabsTrigger value="edo" className={cn(cabinetSurface.tabsTrigger, 'h-8 gap-2')}>
            <FileText className="h-3.5 w-3.5" />
            ЭДО (УПД/УКД)
          </TabsTrigger>
          <TabsTrigger value="cz" className={cn(cabinetSurface.tabsTrigger, 'h-8 gap-2')}>
            <QrCode className="h-3.5 w-3.5" />
            Честный ЗНАК
          </TabsTrigger>
          <TabsTrigger value="certs" className={cn(cabinetSurface.tabsTrigger, 'h-8 gap-2')}>
            <ShieldCheck className="h-3.5 w-3.5" />
            EAC Сертификация
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edo" className={cabinetSurface.cabinetProfileTabPanel}>
          <EdoDocumentFlow />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Card className="border-border-subtle flex items-center justify-between rounded-xl border border-none bg-white p-4 shadow-sm">
              <div className="space-y-1">
                <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                  Ожидают подписи
                </p>
                <p className="text-text-primary text-sm font-black">12</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </Card>
            <Card className="border-border-subtle flex items-center justify-between rounded-xl border border-none bg-white p-4 shadow-sm">
              <div className="space-y-1">
                <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                  Подписано за месяц
                </p>
                <p className="text-text-primary text-sm font-black">142</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </Card>
            <Card className="bg-accent-primary hover:bg-accent-primary group flex cursor-pointer items-center justify-between rounded-xl border-none p-4 text-white shadow-sm transition-all">
              <div className="space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/60">
                  Оператор ЭДО
                </p>
                <p className="text-sm font-black tracking-tight">Diadoc (Контур)</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-transform group-hover:rotate-12">
                <RefreshCcw className="h-5 w-5" />
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden rounded-xl border-none bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-tight">
                  Реестр документов
                </CardTitle>
                <CardDescription className="text-text-muted text-[9px] font-bold uppercase tracking-widest">
                  Входящие и исходящие УПД
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl text-[8px] font-black uppercase tracking-widest"
              >
                Обновить реестр
              </Button>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Table>
                <TableHeader>
                  <TableRow className="border-border-subtle hover:bg-transparent">
                    <TableHead className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                      Тип
                    </TableHead>
                    <TableHead className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                      Номер и Дата
                    </TableHead>
                    <TableHead className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                      Партнер
                    </TableHead>
                    <TableHead className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                      Сумма
                    </TableHead>
                    <TableHead className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                      Статус
                    </TableHead>
                    <TableHead className="text-text-muted text-right text-[8px] font-black uppercase tracking-widest">
                      Действия
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {edoDocs.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="hover:bg-bg-surface2 border-border-subtle transition-colors"
                    >
                      <TableCell>
                        <Badge className="bg-bg-surface2 text-text-secondary border-none text-[7px] font-black uppercase">
                          {doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-primary text-[10px] font-bold">
                        {doc.number} <span className="text-text-muted ml-1">{doc.date}</span>
                      </TableCell>
                      <TableCell className="text-text-secondary text-[9px] font-black uppercase">
                        {doc.partner}
                      </TableCell>
                      <TableCell className="text-text-primary text-[10px] font-black">
                        {doc.total}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            doc.status === 'Подписан'
                              ? 'border-none bg-emerald-50 text-[7px] font-black uppercase text-emerald-600'
                              : 'border-none bg-amber-50 text-[7px] font-black uppercase text-amber-600'
                          }
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-muted hover:text-accent-primary h-7 w-7 rounded-lg"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cz" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="bg-text-primary relative space-y-6 overflow-hidden rounded-xl border-none p-4 text-center text-white shadow-sm">
            <div className="absolute right-0 top-0 p-4 opacity-5">
              <QrCode className="h-64 w-64" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="bg-accent-primary/20 border-accent-primary/30 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border">
                <QrCode className="text-accent-primary h-10 w-10" />
              </div>
              <h2 className="text-base font-black uppercase tracking-tight">
                Честный ЗНАК: Хаб Маркировки
              </h2>
              <p className="text-accent-primary/40 mx-auto max-w-md text-sm font-medium italic">
                Интеграция с ГИС МТ завершена. Синхронизация КИЗ происходит в реальном времени при
                отгрузках.
              </p>
              <div className="flex justify-center gap-3 pt-6">
                <Button className="bg-accent-primary hover:bg-accent-primary shadow-accent-primary/40 h-12 rounded-2xl px-8 text-[10px] font-black uppercase text-white shadow-xl">
                  Заказать Коды (Эмиссия)
                </Button>
                <Link href={ROUTES.brand.complianceStock}>
                  <Button
                    variant="outline"
                    className="h-12 rounded-2xl border-white/10 bg-white/5 px-8 text-[10px] font-black uppercase text-white hover:bg-white/10"
                  >
                    Складской учет КИЗ
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="certs" className={cabinetSurface.cabinetProfileTabPanel}>
          {/* Reuse certificates component or list here */}
          <Card className="rounded-xl border-none bg-white p-4 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-tight">
                EAC Сертификаты & Декларации
              </h3>
              <Button
                size="sm"
                className="h-8 rounded-xl bg-emerald-600 text-[8px] font-black uppercase tracking-widest text-white"
              >
                Добавить сертификат
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                {
                  name: 'Декларация о соответствии ТР ТС 017/2011',
                  expiry: '12.12.2027',
                  status: 'Активен',
                },
                {
                  name: 'Сертификат соответствия (Верхняя одежда)',
                  expiry: '15.01.2026',
                  status: 'Активен',
                },
              ].map((cert, i) => (
                <div
                  key={i}
                  className="bg-bg-surface2 border-border-subtle flex items-center justify-between rounded-2xl border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-text-primary text-[10px] font-black uppercase leading-tight">
                      {cert.name}
                    </p>
                    <p className="text-text-muted text-[8px] font-medium uppercase italic tracking-widest">
                      Годен до: {cert.expiry}
                    </p>
                  </div>
                  <Badge className="border-none bg-emerald-50 text-[7px] font-black uppercase text-emerald-600">
                    {cert.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <RelatedModulesBlock links={getComplianceLinks()} className="mt-6" />
    </CabinetPageContent>
  );
}
