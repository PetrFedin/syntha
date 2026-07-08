'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
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
import {
  Package,
  ArrowRight,
  AlertCircle,
  FileText,
  Truck as TruckIcon,
  CheckSquare,
  Radio,
  Zap,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { mockB2BOrders } from '@/lib/order-data';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import {
  dedupeEntityLinksByHref,
  finalizeRelatedModuleLinks,
  getB2BLinks,
  getBrandB2bOrdersCrossRoleLinks,
} from '@/lib/data/entity-links';
import { ShipWindowBadge } from '@/components/b2b/ShipWindowBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { RegistryPageHeader } from '@/components/design-system';
import { B2bPriorityWorkflowPanel } from '@/components/b2b/B2bPriorityWorkflowPanel';
import { getSynthaThreeCoresFullMatrixGroups } from '@/lib/syntha-priority-cores';

const PoContent = dynamic(() => import('@/app/brand/b2b/po/page'), { ssr: false });
const ShipmentsContent = dynamic(() => import('@/app/brand/b2b/shipments/page'), { ssr: false });
const ApprovalContent = dynamic(() => import('@/app/brand/b2b/order-approval-workflow/page'), {
  ssr: false,
});
const OrderAmendmentsContent = dynamic(
  () => import('@/app/brand/b2b/order-amendments/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const B2BOrdersLiveContent = dynamic(
  () => import('@/app/brand/b2b-orders/live/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const ApprovalLiveContent = dynamic(
  () => import('@/app/brand/b2b-orders/approval-live/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);

const PENDING_ACTION_STATUSES = ['На проверке', 'Требует внимания'];

export function BrandB2bOrdersLegacyPage() {
  const [tab, setTab] = useState('orders');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [showOnlyNeedingAction, setShowOnlyNeedingAction] = useState(false);
  const orders = mockB2BOrders;
  const partners = [...new Set(orders.map((o) => o.shop))];
  const byPartner =
    partnerFilter === 'all' ? orders : orders.filter((o) => o.shop === partnerFilter);
  const filtered = showOnlyNeedingAction
    ? byPartner.filter((o) => PENDING_ACTION_STATUSES.includes(o.status))
    : byPartner;
  const needingActionCount = orders.filter((o) =>
    PENDING_ACTION_STATUSES.includes(o.status)
  ).length;

  const getStatusVariant = (status: string) => {
    if (status === 'Черновик') return 'secondary';
    if (status === 'Требует внимания') return 'destructive';
    if (status === 'Зарезервировано') return 'default';
    return 'outline';
  };

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="Заказы"
        leadPlain="Оптовые заказы от ритейлеров (B2B): окна доставки, MOQ, заметки и согласования."
        actions={
          <>
            {needingActionCount > 0 ? (
              <Button
                variant={showOnlyNeedingAction ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 text-[10px] font-bold uppercase',
                  showOnlyNeedingAction && 'bg-amber-500 hover:bg-amber-600'
                )}
                onClick={() => setShowOnlyNeedingAction(!showOnlyNeedingAction)}
              >
                <AlertCircle className="mr-1 h-3.5 w-3.5" /> Внимание ({needingActionCount})
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[10px] font-bold uppercase"
              asChild
            >
              <Link href={ROUTES.brand.tradeShows}>Выставки</Link>
            </Button>
          </>
        }
      />
      <B2bPriorityWorkflowPanel
        title="Связка направлений: ТЗ → B2B → команды"
        lead="Вертикаль (цех и заказ), горизонталь (роли), надстройка (чат и календарь без дублирования фундамента данных)."
        groups={getSynthaThreeCoresFullMatrixGroups()}
        className="mt-4"
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className={cn(cabinetSurface.tabsList, 'flex-wrap')}>
          <TabsTrigger value="orders" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <Package className="h-3.5 w-3.5" />
            Заказы
          </TabsTrigger>
          <TabsTrigger value="po" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <FileText className="h-3.5 w-3.5" />
            PO
          </TabsTrigger>
          <TabsTrigger value="shipments" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <TruckIcon className="h-3.5 w-3.5" />
            Отгрузки
          </TabsTrigger>
          <TabsTrigger value="approval" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <CheckSquare className="h-3.5 w-3.5" />
            Согласование
          </TabsTrigger>
          <TabsTrigger value="amendments" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            Заявки на изменение
          </TabsTrigger>
          <TabsTrigger
            value="orders-live"
            className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}
          >
            <Zap className="h-3.5 w-3.5" />
            LIVE: Заказы
          </TabsTrigger>
          <TabsTrigger
            value="approval-live"
            className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}
          >
            <Radio className="h-3.5 w-3.5" />
            LIVE: Согласование
          </TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          <div className="w-full space-y-6 pb-8">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label
                className="text-text-secondary sr-only text-[10px] font-bold uppercase"
                htmlFor="b2b-partner-filter"
              >
                Партнёр
              </label>
              <select
                id="b2b-partner-filter"
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="border-border-default min-w-[10rem] rounded-lg border bg-white px-3 py-2 text-sm"
              >
                <option value="all">Все партнёры</option>
                {partners.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Заказы</CardTitle>
                <CardDescription>
                  Клик по номеру — детализация заказа, чат, окна доставки, замена позиций.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Номер</TableHead>
                      <TableHead>Партнёр</TableHead>
                      <TableHead>Окно</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((order) => (
                      <TableRow key={order.order}>
                        <TableCell className="font-medium">
                          <Link
                            href={`${ROUTES.brand.b2bOrders}/${order.order}`}
                            className="text-accent-primary hover:underline"
                          >
                            {order.order}
                          </Link>
                        </TableCell>
                        <TableCell>{order.shop}</TableCell>
                        <TableCell>
                          <ShipWindowBadge orderMode={order.orderMode} />
                        </TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString('ru-RU')}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status) as 'default'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8" asChild>
                            <Link href={`${ROUTES.brand.b2bOrders}/${order.order}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filtered.length === 0 ? (
                  <p className="text-text-secondary py-8 text-center text-sm">
                    Нет заказов по выбранному фильтру.
                  </p>
                ) : null}
              </CardContent>
            </Card>
            <RelatedModulesBlock
              links={finalizeRelatedModuleLinks(
                dedupeEntityLinksByHref([...getBrandB2bOrdersCrossRoleLinks(), ...getB2BLinks()])
              )}
              title="Связанные кабинеты и B2B-модули"
            />
          </div>
        </TabsContent>
        <TabsContent value="po" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          {tab === 'po' && <PoContent />}
        </TabsContent>
        <TabsContent
          value="shipments"
          className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
        >
          {tab === 'shipments' && <ShipmentsContent />}
        </TabsContent>
        <TabsContent value="approval" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          {tab === 'approval' && <ApprovalContent />}
        </TabsContent>
        <TabsContent
          value="amendments"
          className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
        >
          {tab === 'amendments' && <OrderAmendmentsContent />}
        </TabsContent>
        <TabsContent
          value="orders-live"
          className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
        >
          {tab === 'orders-live' && <B2BOrdersLiveContent />}
        </TabsContent>
        <TabsContent
          value="approval-live"
          className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
        >
          {tab === 'approval-live' && <ApprovalLiveContent />}
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
