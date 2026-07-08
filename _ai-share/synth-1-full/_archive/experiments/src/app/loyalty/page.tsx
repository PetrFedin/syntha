'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import * as React from 'react';
import { useState } from 'react';
import LoyaltyProgramDetails from '@/components/loyalty-program-details';
import PricingPlans from '@/components/pricing-plans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { Users, Store, ShoppingCart, Ticket, Gift, Target, ShoppingBag } from 'lucide-react';
import BrandPricingPlans from '@/components/brand-pricing-plans';
import { BrandFeaturesTable } from '@/components/project-info/brand-features-table';
import { ShopFeaturesTable } from '@/components/project-info/shop-features-table';
import ShopPricingPlans from '@/components/shop-pricing-plans';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';

import LoyaltyQuests from '@/components/loyalty/loyalty-quests';
import RewardsMarketplace from '@/components/loyalty/rewards-marketplace';

function LotteryContent() {
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [viewingResultsFor, setViewingResultsFor] = useState<'clients' | 'partners' | null>(null);
  const [selectedClientDraw, setSelectedClientDraw] = useState<string | undefined>(undefined);
  const [selectedPartnerDraw, setSelectedPartnerDraw] = useState<string | undefined>(undefined);

  const clientWinners = [
    { ticket: '...7890', prize: '10 000 бонусов' },
    { ticket: '...1234', prize: 'Подписка Comfort на 1 год' },
    { ticket: '...5678', prize: 'Приз от бренда Syntha Lab' },
    { ticket: '...9012', prize: '5 000 бонусов' },
    { ticket: '...3456', prize: 'Скидка 50% на следующий заказ' },
    { ticket: '...7891', prize: '1 000 бонусов' },
    { ticket: '...2345', prize: 'Подписка Start на 1 год' },
    { ticket: '...6789', prize: 'Эксклюзивный цифровой актив' },
    { ticket: '...1122', prize: '2 500 бонусов' },
    { ticket: '...3344', prize: 'Приз от бренда Nordic Wool' },
  ];
  const brandWinners = [
    {
      nomination: 'Лучшие новички',
      winners: [
        { place: 1, name: 'Syntha Lab', prize: 'Повышение (с PRO на Elite) на 3 мес.' },
        { place: 2, name: 'Nordic Wool', prize: 'Продление PRO на 1 мес.' },
      ],
    },
    {
      nomination: 'Стабильные бренды',
      winners: [
        { place: 1, name: 'Nordic Wool', prize: 'Повышение (с PRO на Elite) на 3 мес.' },
        { place: 2, name: 'Syntha Lab', prize: 'Продление PRO на 1 мес.' },
      ],
    },
    {
      nomination: 'Лучшие результаты',
      winners: [
        { place: 1, name: 'Syntha Lab', prize: 'Продление Elite на 3 мес.' },
        { place: 2, name: 'Nordic Wool', prize: 'Продление PRO на 1 мес.' },
      ],
    },
    {
      nomination: 'Самые популярные',
      winners: [
        { place: 1, name: 'Nordic Wool', prize: 'Продление Elite на 3 мес.' },
        { place: 2, name: 'Syntha Lab', prize: 'Продление Elite на 1 мес.' },
      ],
    },
    {
      nomination: 'Выбор платформы',
      winners: [
        { place: 1, name: 'Syntha Lab', prize: 'Продление Elite на 3 мес.' },
        { place: 2, name: 'Nordic Wool', prize: 'Продление Elite на 1 мес.' },
      ],
    },
  ];

  const handleViewResults = (type: 'clients' | 'partners') => {
    setViewingResultsFor(type);
    setIsResultsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Лотерея для клиентов</CardTitle>
            <CardDescription>Участвуйте в розыгрышах и выигрывайте ценные призы!</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div>
              <h3 className="font-semibold">Ежемесячный розыгрыш</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  <b>Кто участвует:</b> Все чеки от покупок, а также самые активные пользователи
                  платформы.
                </li>
                <li>
                  <b>Призы:</b> Подписка на премиальные пакеты, начисление бонусных баллов,
                  эксклюзивные призы от брендов.
                </li>
                <li>
                  <b>Когда:</b> Каждый месяц.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Ежегодная новогодняя лотерея</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  <b>Кто участвует:</b> Все чеки от покупок, совершенных в течение года.
                </li>
                <li>
                  <b>Призы:</b> Суперпризы от платформы Syntha и ведущих брендов.
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
              <Label>Результаты розыгрыша</Label>
              <div className="flex items-center gap-2">
                <Select onValueChange={setSelectedClientDraw}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите розыгрыш..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Розыгрыш №2 от 01.09.2024</SelectItem>
                    <SelectItem value="1">Розыгрыш №1 от 01.08.2024</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleViewResults('clients')} disabled={!selectedClientDraw}>
                  Посмотреть
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Розыгрыш для брендов и магазинов</CardTitle>
            <CardDescription>Поощрение лучших партнеров платформы.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div>
              <h3 className="font-semibold">Полугодовой розыгрыш пакетов обслуживания</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  <b>Приз:</b> 10 пакетов повышения тарифа или бесплатной пролонгации текущего.
                </li>
                <li>
                  <b>Когда:</b> Каждые 6 месяцев.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Номинации (каждые 3 месяца)</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  <b>Лучшие новички:</b> Для недавно присоединившихся партнеров.
                </li>
                <li>
                  <b>Стабильные бренды:</b> За стабильно высокие показатели.
                </li>
                <li>
                  <b>Лучшие результаты:</b> За наивысший рост продаж.
                </li>
                <li>
                  <b>Самые популярные:</b> Бренды с наивысшим интересом от аудитории.
                </li>
                <li>
                  <b>Выбор Syntha:</b> За самый эффективный результат.
                </li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                *Один бренд или магазин может выиграть максимум в двух наминациях за один розыгрыш.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
              <Label>Результаты розыгрыша</Label>
              <div className="flex items-center gap-2">
                <Select onValueChange={setSelectedPartnerDraw}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите розыгрыш..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Розыгрыш №2 от 01.09.2024</SelectItem>
                    <SelectItem value="1">Розыгрыш №1 от 01.03.2024</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleViewResults('partners')}
                  disabled={!selectedPartnerDraw}
                >
                  Посмотреть
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Dialog open={isResultsOpen} onOpenChange={setIsResultsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Результаты розыгрыша №2 от 01.09.2024</DialogTitle>
          </DialogHeader>
          {viewingResultsFor === 'clients' && (
            <div>
              <h3 className="mb-2 font-semibold">Победители среди клиентов</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер чека</TableHead>
                    <TableHead>Приз</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientWinners.map((winner) => (
                    <TableRow key={winner.ticket}>
                      <TableCell className="font-mono">{winner.ticket}</TableCell>
                      <TableCell>{winner.prize}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {viewingResultsFor === 'partners' && (
            <Tabs defaultValue="brands">
              {/* cabinetSurface v1 */}
              <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
                <TabsTrigger
                  value="brands"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'text-xs font-semibold normal-case tracking-normal'
                  )}
                >
                  Бренды
                </TabsTrigger>
                <TabsTrigger
                  value="shops"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'text-xs font-semibold normal-case tracking-normal'
                  )}
                >
                  Магазины
                </TabsTrigger>
              </TabsList>
              <TabsContent value="brands" className="pt-4">
                <h3 className="mb-2 font-semibold">Победители среди брендов</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Номинация</TableHead>
                      <TableHead>Победитель</TableHead>
                      <TableHead>Приз</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brandWinners.map((item) => (
                      <React.Fragment key={item.nomination}>
                        <TableRow>
                          <TableCell rowSpan={2} className="align-middle font-medium">
                            {item.nomination}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">1. {item.winners[0].name}</Badge>
                          </TableCell>
                          <TableCell>{item.winners[0].prize}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Badge variant="outline">2. {item.winners[1].name}</Badge>
                          </TableCell>
                          <TableCell>{item.winners[1].prize}</TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="shops" className="pt-4">
                <h3 className="mb-2 font-semibold">Победители среди магазинов</h3>
                <p className="text-sm text-muted-foreground">
                  Результаты для магазинов будут объявлены в следующем розыгрыше.
                </p>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GiftCardContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Подарочные карты</CardTitle>
        <CardDescription>Этот раздел находится в разработке.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Здесь вы сможете покупать и отправлять подарочные карты Syntha.
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoyaltyPage() {
  const { viewRole, user } = useUIState();
  const role = user?.activeOrganizationId?.includes('org-brand')
    ? 'brand'
    : user?.activeOrganizationId?.includes('org-shop')
      ? 'shop'
      : 'client';

  const defaultTab = viewRole === 'b2b' ? (role === 'brand' ? 'brands' : 'shops') : 'clients';

  return (
    <div className="bg-secondary/30 duration-300 animate-in fade-in">
      <CabinetPageContent
        maxWidth="5xl"
        className="space-y-6 px-4 py-4 py-6 pb-16 pb-24 sm:px-6 md:py-24"
      >
        <header className="text-center">
          <h1 className="font-headline text-sm font-bold md:text-sm">
            Программа лояльности Syntha
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            {viewRole === 'b2b'
              ? 'Управляйте отношениями с клиентами, запускайте кампании и анализируйте LTV в рамках B2B экосистемы.'
              : 'Выберите свой путь в экосистеме Syntha. Мы предлагаем уникальные возможности как для покупателей, так и для бизнес-партнеров.'}
          </p>
        </header>
        <Tabs defaultValue={defaultTab} className="w-full">
          {/* cabinetSurface v1 */}
          <TabsList
            className={cn(cabinetSurface.tabsList, 'mx-auto grid w-full max-w-4xl grid-cols-7')}
          >
            <TabsTrigger
              value="clients"
              className={cn(
                cabinetSurface.tabsTrigger,
                'text-xs font-semibold normal-case tracking-normal'
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Для клиентов
            </TabsTrigger>
            <TabsTrigger
              value="quests"
              className={cn(
                cabinetSurface.tabsTrigger,
                'text-xs font-semibold normal-case tracking-normal'
              )}
            >
              <Target className="mr-2 h-4 w-4" />
              Квесты
            </TabsTrigger>
            <TabsTrigger
              value="marketplace"
              className={cn(
                cabinetSurface.tabsTrigger,
                'text-xs font-semibold normal-case tracking-normal'
              )}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Награды
            </TabsTrigger>
            <TabsTrigger
              value="brands"
              className={cn(
                cabinetSurface.tabsTrigger,
                'text-xs font-semibold normal-case tracking-normal'
              )}
            >
              <Store className="mr-2 h-4 w-4" />
              Для брендов
            </TabsTrigger>
            <TabsTrigger
              value="shops"
              className={cn(
                cabinetSurface.tabsTrigger,
                'text-xs font-semibold normal-case tracking-normal'
              )}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Для магазинов
            </TabsTrigger>
            <TabsTrigger
              value="lottery"
              className={cn(
                cabinetSurface.tabsTrigger,
                'text-xs font-semibold normal-case tracking-normal'
              )}
            >
              <Ticket className="mr-2 h-4 w-4" />
              Лотерея
            </TabsTrigger>
            <TabsTrigger
              value="gift_cards"
              className={cn(
                cabinetSurface.tabsTrigger,
                'text-xs font-semibold normal-case tracking-normal'
              )}
            >
              <Gift className="mr-2 h-4 w-4" />
              Подарочные карты
            </TabsTrigger>
          </TabsList>
          <TabsContent value="clients" className="mt-12">
            <div className="space-y-20">
              <PricingPlans />
              <LoyaltyProgramDetails />
            </div>
          </TabsContent>
          <TabsContent value="quests" className="mt-12">
            <LoyaltyQuests />
          </TabsContent>
          <TabsContent value="marketplace" className="mt-12">
            <RewardsMarketplace />
          </TabsContent>
          <TabsContent value="brands" className="mt-12 space-y-20">
            <BrandPricingPlans />
            <BrandFeaturesTable />
          </TabsContent>
          <TabsContent value="shops" className="mt-12 space-y-20">
            <ShopPricingPlans />
            <ShopFeaturesTable />
          </TabsContent>
          <TabsContent value="lottery" className="mt-12">
            <LotteryContent />
          </TabsContent>
          <TabsContent value="gift_cards" className="mt-12">
            <GiftCardContent />
          </TabsContent>
        </Tabs>
      </CabinetPageContent>
    </div>
  );
}
