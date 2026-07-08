'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useSearchParamsNonNull } from '@/hooks/use-search-params-non-null';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Clock,
  CheckCircle,
  MessageSquare,
  Star,
  BookOpen,
  UserPlus,
  ShoppingCart,
  FileCheck,
} from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

const mockPartners = [
  {
    id: 'brand_syntha_lab',
    name: 'Syntha Lab',
    city: 'Москва',
    type: 'Premium / Contemporary',
    orders: 5,
    totalValue: 3200000,
    logoUrl: 'https://picsum.photos/seed/syntha-lab/40/40',
    slug: 'syntha-lab',
    contractStatus: 'active',
    baseDiscount: 60,
  },
  {
    id: 'brand_nordic_wool',
    name: 'Nordic Wool',
    city: 'Санкт-Петербург',
    type: 'Luxury Heritage',
    orders: 4,
    totalValue: 2650000,
    logoUrl: 'https://picsum.photos/seed/nordic-wool/40/40',
    slug: 'nordic-wool',
    contractStatus: 'active',
    baseDiscount: 58,
  },
];

const mockRequests = [
  { id: 'req1', brand: 'Nordic Wool', date: '2024-07-28', status: 'pending' },
  { id: 'req2', brand: 'Syntha Lab', date: '2024-07-25', status: 'viewed' },
  { id: 'req3', brand: 'Nordic Wool', date: '2024-07-22', status: 'approved' },
];

export function ShopB2bPartnersLegacyPage() {
  const router = useRouter();
  const searchParams = useSearchParamsNonNull();
  const defaultTab = searchParams.get('tab') === 'requests' ? 'requests' : 'partners';

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Отправлен', icon: Clock, color: 'text-amber-600' };
      case 'viewed':
        return { text: 'Просмотрен', icon: Clock, color: 'text-blue-600' };
      case 'approved':
        return { text: 'Одобрен', icon: CheckCircle, color: 'text-green-600' };
      default:
        return { text: 'Неизвестно', icon: MoreHorizontal, color: '' };
    }
  };

  const getContractStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Активен', color: 'text-green-600' };
      case 'pending':
        return { text: 'На согласовании', color: 'text-amber-600' };
      case 'expired':
        return { text: 'Истек', color: 'text-red-600' };
      default:
        return { text: 'Нет', color: 'text-muted-foreground' };
    }
  };

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Управление партнерами</CardTitle>
              <CardDescription>
                Список ваших брендов-партнеров и статус запросов на сотрудничество.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href={ROUTES.shop.b2bPartnersDiscover}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Найти бренды (Discover)
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={LEGACY_ROUTES.shop.b2bApply}>
                  <UserPlus className="mr-2 h-4 w-4" /> Подать заявку
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Button
              variant="outline"
              className="flex h-auto flex-col items-center gap-1 py-3 text-center"
              asChild
            >
              <Link href={ROUTES.shop.b2bOrders}>
                <ShoppingCart className="h-5 w-5" /> Мои заказы
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex h-auto flex-col items-center gap-1 py-3 text-center"
              asChild
            >
              <Link href={ROUTES.shop.b2bPartnersDiscover}>
                <PlusCircle className="h-5 w-5" /> Discover
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex h-auto flex-col items-center gap-1 py-3 text-center"
              asChild
            >
              <Link href={LEGACY_ROUTES.shop.b2bApply}>
                <UserPlus className="h-5 w-5" /> Заявка на партнёрство
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex h-auto flex-col items-center gap-1 py-3 text-center"
              asChild
            >
              <Link href={ROUTES.shop.b2bPartnerOnboarding}>
                <FileCheck className="h-5 w-5" /> Онбординг
              </Link>
            </Button>
          </div>
          <Tabs defaultValue={defaultTab}>
            <TabsList className={cn(cabinetSurface.tabsList, 'w-full flex-wrap sm:w-auto')}>
              <TabsTrigger value="partners" className={cabinetSurface.tabsTrigger}>
                Мои партнеры
              </TabsTrigger>
              <TabsTrigger value="requests" className={cabinetSurface.tabsTrigger}>
                Запросы на партнерство
              </TabsTrigger>
            </TabsList>
            <TabsContent value="partners" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Базовая скидка</TableHead>
                    <TableHead>Активные заказы</TableHead>
                    <TableHead>Scorecard</TableHead>
                    <TableHead>Статус контракта</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPartners.map((retailer) => {
                    const contractStatus = getContractStatusInfo(retailer.contractStatus);
                    return (
                      <TableRow key={retailer.id}>
                        <TableCell>
                          <Button variant="link" asChild className="h-auto p-0 font-medium">
                            <Link
                              href={ROUTES.shop.b2bPartnerRetailer(retailer.slug)}
                              className="flex items-center gap-3"
                            >
                              <Image
                                src={retailer.logoUrl}
                                alt={retailer.name}
                                width={32}
                                height={32}
                                className="rounded-full border object-contain p-0.5"
                              />
                              <span className="font-medium">{retailer.name}</span>
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell className="font-semibold">{retailer.baseDiscount}%</TableCell>
                        <TableCell>{retailer.orders}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex cursor-help items-center gap-1.5">
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={cn(
                                          'h-2.5 w-2.5',
                                          s <= 4
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-text-muted'
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-text-primary text-[10px] font-black">
                                    4.2
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-text-primary rounded-xl border-none p-3 text-white shadow-2xl">
                                <div className="space-y-1.5">
                                  <p className="border-b border-white/10 pb-1 text-[9px] font-black uppercase tracking-widest">
                                    Partner Efficiency
                                  </p>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span className="text-text-muted text-[8px] uppercase">
                                      Отработка брака:
                                    </span>
                                    <span className="text-right text-[8px] font-bold text-emerald-400">
                                      98%
                                    </span>
                                    <span className="text-text-muted text-[8px] uppercase">
                                      Точность сроков:
                                    </span>
                                    <span className="text-right text-[8px] font-bold text-amber-400">
                                      85%
                                    </span>
                                    <span className="text-text-muted text-[8px] uppercase">
                                      Полнота отгрузки:
                                    </span>
                                    <span className="text-accent-primary text-right text-[8px] font-bold">
                                      92%
                                    </span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn(
                              'flex items-center gap-1.5 text-sm font-medium',
                              contractStatus.color
                            )}
                          >
                            <div
                              className={cn(
                                'h-2 w-2 rounded-full',
                                contractStatus.color.replace('text-', 'bg-')
                              )}
                            ></div>
                            {contractStatus.text}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-text-muted hover:text-accent-primary h-8 w-8"
                                  >
                                    <BookOpen className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>База знаний бренда</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`${ROUTES.shop.b2bCreateOrder}?brand=${encodeURIComponent(retailer.name)}`}
                              >
                                <PlusCircle className="mr-2 h-4 w-4" /> Новый заказ
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent
              value="requests"
              className={cn(cabinetSurface.cabinetProfileTabPanel, 'pt-4')}
            >
              <p className="text-text-secondary text-sm">
                Заявки на сотрудничество с брендами. После одобрения бренд появится в «Мои
                партнёры».{' '}
                <Link href={LEGACY_ROUTES.shop.b2bApply} className="text-accent-primary hover:underline">
                  Подать новую заявку
                </Link>
                .
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Дата запроса</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRequests.map((req) => {
                    const status = getStatusInfo(req.status);
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.brand}</TableCell>
                        <TableCell>{new Date(req.date).toLocaleDateString('ru-RU')}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`flex w-fit items-center gap-1.5 ${status.color} border-current/30`}
                          >
                            <status.icon className="h-3 w-3" />
                            {status.text}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Заказы, выставки, матрица"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
