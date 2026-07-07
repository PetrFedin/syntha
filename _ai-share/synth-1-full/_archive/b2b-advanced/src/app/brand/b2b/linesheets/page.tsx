'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, MoreHorizontal, Share2, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { tid } from '@/lib/ui/test-ids';
import { RegistryPageHeader } from '@/components/design-system';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { ROUTES } from '@/lib/routes';
const LinesheetCampaignsContent = dynamic(
  () => import('@/app/brand/b2b/linesheet-campaigns/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const LinesheetVersionsContent = dynamic(
  () => import('@/app/brand/b2b/linesheet-versions/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const LinesheetBuilderContent = dynamic(
  () => import('@/app/brand/b2b/linesheets/create/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);

const linesheets = [
  {
    id: 'ls-fw24',
    name: 'Основная коллекция FW24',
    status: 'Активен',
    styles: 48,
    totalValue: '12,500,000 ₽',
    created: '2024-06-01',
    type: 'Public',
    collectionId: 'SS27',
  },
  {
    id: 'ls-ss25',
    name: 'Предзаказ SS25',
    status: 'Активен',
    styles: 62,
    totalValue: '18,200,000 ₽',
    created: '2024-07-15',
    type: 'Private',
    target: 'TSUM, Podium',
    collectionId: 'SS27',
  },
  {
    id: 'ls-outlet',
    name: 'Аутлет (для партнеров)',
    status: 'Архивный',
    styles: 15,
    totalValue: '1,800,000 ₽',
    created: '2024-05-10',
    type: 'Public',
  },
];

export default function LinesheetsPage() {
  const [tab, setTab] = useState('linesheets');
  return (
    <CabinetPageContent
      maxWidth="full"
      className="space-y-4 pb-16"
      data-testid={tid.page('brand-b2b-linesheets')}
    >
      <RegistryPageHeader
        title="Лайншиты B2B"
        leadPlain="Лайншиты, кампании, версии и конструктор для оптовых презентаций."
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-h-9 w-full shadow-inner')}>
          <TabsTrigger
            value="linesheets"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
            )}
          >
            Лайншиты
          </TabsTrigger>
          <TabsTrigger
            value="campaigns"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
            )}
          >
            Кампании
          </TabsTrigger>
          <TabsTrigger
            value="versions"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
            )}
          >
            Версии
          </TabsTrigger>
          <TabsTrigger
            value="builder"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
            )}
          >
            Builder
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="linesheets"
          className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
        >
          <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="outline"
                className="border-border-default rounded-xl text-xs font-black uppercase tracking-widest"
              >
                <Share2 className="mr-2 size-4" /> Массовая рассылка
              </Button>
              <Button
                asChild
                className="bg-text-primary rounded-xl px-6 text-xs font-black uppercase tracking-widest text-white"
              >
                <Link href={ROUTES.brand.b2bLinesheetsCreate}>
                  <PlusCircle className="mr-2 size-4" /> Создать лайншит
                </Link>
              </Button>
            </header>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {linesheets.map((ls) => (
                <Card
                  key={ls.id}
                  className="border-border-subtle hover:border-accent-primary/30 group flex flex-col rounded-xl shadow-sm transition-all hover:shadow-xl"
                >
                  <CardHeader className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <Badge
                        className={cn(
                          'border-none px-2 py-0.5 text-[8px] font-black uppercase',
                          ls.type === 'Private'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-accent-primary/15 text-accent-primary'
                        )}
                      >
                        {ls.type} Access
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-text-muted group-hover:text-text-primary size-8"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </div>
                    <CardTitle className="truncate text-base font-black uppercase tracking-tight">
                      {ls.name}
                    </CardTitle>
                    <CardDescription className="text-text-muted text-xs font-bold uppercase">
                      Создан: {new Date(ls.created).toLocaleDateString('ru-RU')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grow space-y-4 px-8 pb-8">
                    <div className="border-border-subtle grid grid-cols-2 gap-3 border-t pt-4">
                      <div>
                        <p className="text-text-muted mb-1 text-[9px] font-black uppercase tracking-widest">
                          Стили
                        </p>
                        <p className="text-text-primary text-sm font-black">{ls.styles} SKU</p>
                      </div>
                      <div>
                        <p className="text-text-muted mb-1 text-[9px] font-black uppercase tracking-widest">
                          Объем
                        </p>
                        <p className="text-accent-primary text-sm font-black">{ls.totalValue}</p>
                      </div>
                    </div>
                    {ls.target && (
                      <div className="rounded-xl border border-amber-100/50 bg-amber-50/50 p-3">
                        <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-amber-600">
                          Персонализировано для:
                        </p>
                        <p className="text-xs font-bold text-amber-900">{ls.target}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-3 p-4 pt-0">
                    <Button
                      variant="outline"
                      className="border-border-default h-10 rounded-xl text-xs font-black uppercase"
                      asChild
                    >
                      <Link href={`/brand/b2b/linesheets/${ls.id}`}>
                        <Eye className="mr-2 size-3.5" /> Просмотр
                      </Link>
                    </Button>
                    {ls.status === 'Активен' && 'collectionId' in ls && ls.collectionId ? (
                      <Button
                        variant="secondary"
                        className="border-border-subtle bg-bg-surface2 hover:bg-bg-surface2 h-10 rounded-xl border text-xs font-black uppercase"
                        asChild
                      >
                        <Link
                          href={`${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(ls.collectionId)}`}
                        >
                          <Share2 className="mr-2 size-3.5" /> В шоурум
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="border-border-subtle bg-bg-surface2 hover:bg-bg-surface2 h-10 rounded-xl border text-xs font-black uppercase"
                      >
                        <Share2 className="mr-2 size-3.5" /> Поделиться
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="campaigns"
          className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
        >
          {tab === 'campaigns' && <LinesheetCampaignsContent />}
        </TabsContent>
        <TabsContent value="versions" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          {tab === 'versions' && <LinesheetVersionsContent />}
        </TabsContent>
        <TabsContent value="builder" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          {tab === 'builder' && <LinesheetBuilderContent />}
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
