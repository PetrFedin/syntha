'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { ShopB2bNuOrderScope } from '@/components/shop/ShopB2bNuOrderScope';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  File,
  Truck,
  MoreVertical,
  CheckCircle,
  Clock,
  FileText,
  Edit,
  Copy,
  XCircle,
  Send,
  Paperclip,
  FileEdit,
  History,
  BookmarkPlus,
  CheckCircle2,
  PauseCircle,
  Package,
  ListChecks,
  CreditCard,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { initialOrderItems, orderStatusSteps, mockOrderDetailJoors } from '@/lib/order-data';
import { applyOrderPaymentsOverlay } from '@/lib/b2b/partner-finance-rollup';
import { getWholesaleOrderIdFromB2BOrder } from '@/lib/domain/cross-role-entity-ids';
import { useShopB2BOperationalOrdersList } from '@/hooks/use-b2b-operational-orders-list';
import { AttachProductDialog, OrderChat, SizeBreakdownDialog } from '@/components/shop/b2b';
import { PaymentFlowCard } from '@/components/b2b/PaymentFlowCard';
import { ReplaceLineDialog } from '@/components/b2b/ReplaceLineDialog';
import { B2bOrderCommsContextButtons } from '@/components/b2b/B2bOrderCommsContextButtons';
import { B2bPriorityWorkflowPanel } from '@/components/b2b/B2bPriorityWorkflowPanel';
import {
  getShopB2bCollaborationProcessGroups,
  getShopB2bOrderPriorityGroups,
} from '@/lib/data/b2b-priority-workflow-groups';
import { ROUTES } from '@/lib/routes';
import { ShopB2bToolHeader, ShopB2bToolTitle } from '@/components/shop/ShopB2bToolHeader';
import { OperationalOrderNotesV1Sync } from '@/components/b2b/OperationalOrderNotesV1Sync';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';
import { B2bOptOrderIdCopy } from '@/components/shop/B2bOptOrderIdCopy';
import { registryFeedLayout } from '@/lib/ui/registry-feed-layout';
import { useOrderShipmentTracking } from '@/hooks/use-b2b-shipment';
import { getCarrierTrackingUrl } from '@/lib/b2b/carrier-tracking-url';
type ShopB2bOrderDetailLegacyPageProps = {
  orderId: string;
};

export function ShopB2bOrderDetailLegacyPage({ orderId }: ShopB2bOrderDetailLegacyPageProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState(initialOrderItems);
  const [orderDate, setOrderDate] = useState('');
  const [replaceItem, setReplaceItem] = useState<any | null>(null);
  const [amendmentDialogOpen, setAmendmentDialogOpen] = useState(false);
  const [amendmentText, setAmendmentText] = useState('');
  const [orderAcknowledged, setOrderAcknowledged] = useState(false);
  const [orderOnHold, setOrderOnHold] = useState(false);
  const [orderHoldReleaseRequested, setOrderHoldReleaseRequested] = useState(false);
  const [shipmentBannerDismissed, setShipmentBannerDismissed] = useState(false);
  const currency = mockOrderDetailJoors.currency || 'RUB';
  const {
    data: shipmentTracking,
    loading: shipmentLoading,
    error: shipmentError,
    refetch: refetchShipment,
  } = useOrderShipmentTracking(orderId);

  const operationalOrders = useShopB2BOperationalOrdersList();
  const ordersWithPayment = useMemo(
    () => applyOrderPaymentsOverlay(operationalOrders),
    [operationalOrders]
  );
  const orderFromList = useMemo(
    () => ordersWithPayment.find((o) => getWholesaleOrderIdFromB2BOrder(o) === orderId),
    [ordersWithPayment, orderId]
  );

  useEffect(() => {
    setOrderDate(new Date().toLocaleDateString('ru-RU'));
  }, []);

  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.price * 0.4 * item.orderedQuantity,
    0
  ); // Assuming 60% wholesale discount
  const total = subtotal;

  const handleSaveSizes = (itemId: string, newSizes: any) => {
    console.log('Saving sizes for', itemId, newSizes);
  };
  const handleReplaceLine = (replacementProductId: string) => {
    if (!replaceItem) return;
    setOrderItems((prev) =>
      prev.map((it) =>
        it.id === replaceItem.id
          ? { ...it, lineStatus: 'replaced', replacedByProductId: replacementProductId }
          : it
      )
    );
    toast({
      title: 'Позиция заменена',
      description: 'Предложенный стиль выбран. Сохраните заказ.',
    });
    setReplaceItem(null);
  };
  const handleCancelLine = () => {
    if (!replaceItem) return;
    setOrderItems((prev) =>
      prev.map((it) => (it.id === replaceItem.id ? { ...it, lineStatus: 'cancelled' } : it))
    );
    toast({ title: 'Позиция отменена', description: 'Строка помечена как отменённая.' });
    setReplaceItem(null);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, orderedQuantity: newQuantity >= 0 ? newQuantity : 0 }
          : item
      )
    );
  };

  /** Colect/JOOR: комментарий по строке заказа — виден бренду и в экспорте */
  const handleLineNoteChange = (productId: string, lineNotes: string) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) => (item.id === productId ? { ...item, lineNotes } : item))
    );
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Here would be an API call to save changes
      toast({
        title: 'Изменения сохранены',
        description: 'Информация о заказе была успешно обновлена.',
      });
    }
    setIsEditing(!isEditing);
  };

  const currentStatusIndex = orderStatusSteps.findIndex((s) => s.date === null);
  const isAcknowledgmentEligible =
    orderStatusSteps.some(
      (s, i) => (s.status === 'Согласован' || s.status === 'Подтверждён') && s.date != null
    ) || currentStatusIndex >= 2;
  const reorderHref = `${LEGACY_ROUTES.shop.b2bReorder}?copyFrom=${orderId}`;
  const saveAsTemplateHref = `${LEGACY_ROUTES.shop.b2bOrderTemplates}?saveFrom=${orderId}`;
  const workingOrderHref = `${ROUTES.shop.b2bWorkingOrder}?wholesaleOrderId=${encodeURIComponent(orderId)}`;
  const paymentStatus = orderFromList?.paymentStatus;
  const paidAmount = orderFromList?.paidAmount;
  const PAYMENT_LABELS: Record<string, string> = {
    pending: 'Ожидает оплаты',
    partial: 'Частично оплачен',
    paid: 'Оплачен',
    overdue: 'Просрочен',
    cancelled: 'Отменён',
  };

  // Mock production stages for the "Live from Factory" view
  const productionStages = [
    { name: 'Раскрой', status: 'completed', date: '2024-07-20' },
    { name: 'Пошив', status: 'current', progress: 65 },
    { name: 'QC (Контроль качества)', status: 'pending' },
    { name: 'Упаковка', status: 'pending' },
  ];

  return (
    <ShopB2bNuOrderScope className="space-y-4 pb-24">
      <ShopAnalyticsSegmentErpStrip className="mb-2" />
      <ShopB2bToolHeader
        backHref={ROUTES.shop.b2bOrders}
        className="mb-8"
        leading={
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <ShopB2bToolTitle visual="sm">
                Заказ <span className="text-accent-primary">Syntha</span>
              </ShopB2bToolTitle>
              <B2bOptOrderIdCopy orderId={orderId} showLabel />
              <Badge className="bg-accent-primary border-none px-3 py-1 text-[10px] font-black uppercase text-white">
                В производстве
              </Badge>
              {paymentStatus ? (
                <span className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-3 py-1 text-[10px] font-black uppercase',
                      paymentStatus === 'paid' &&
                        'border-emerald-400 bg-emerald-50 text-emerald-700',
                      paymentStatus === 'partial' && 'border-amber-400 bg-amber-50 text-amber-700',
                      (paymentStatus === 'pending' || paymentStatus === 'overdue') &&
                        'border-rose-400 bg-rose-50 text-rose-700',
                      paymentStatus === 'cancelled' &&
                        'border-border-default bg-bg-surface2 text-text-secondary'
                    )}
                  >
                    {PAYMENT_LABELS[paymentStatus] ?? paymentStatus}
                    {paidAmount != null &&
                      paidAmount > 0 &&
                      ` · ${paidAmount.toLocaleString('ru-RU')} ₽`}
                  </Badge>
                  {(paymentStatus === 'pending' ||
                    paymentStatus === 'partial' ||
                    paymentStatus === 'overdue') && (
                    <Button
                      size="sm"
                      className="h-8 gap-1 rounded-lg text-[10px] font-bold uppercase"
                      asChild
                    >
                      <Link
                        href={`${LEGACY_ROUTES.shop.b2bPayment}?orderId=${encodeURIComponent(orderId)}`}
                      >
                        <CreditCard className="h-3.5 w-3" /> Оплатить
                      </Link>
                    </Button>
                  )}
                </span>
              ) : null}
              {orderOnHold ? (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-amber-400 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase text-amber-700"
                >
                  <PauseCircle className="h-3 w-3" /> На удержании
                </Badge>
              ) : null}
            </div>
            <p className={cn(registryFeedLayout.shopB2bToolMeta, 'text-text-muted text-[10px]')}>
              B2B Wholesale Order • Season SS&apos;26
            </p>
          </div>
        }
        trailing={
          <div className="flex flex-wrap items-center gap-2">
            <B2bOrderCommsContextButtons orderId={orderId} variant="shop" />
            <Button
              variant="ghost"
              className="h-10 gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
              asChild
            >
              <Link href={reorderHref}>
                <Copy className="h-4 w-4" /> Дублировать / Reorder
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="h-10 gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
              asChild
            >
              <Link href={workingOrderHref}>
                <FileText className="h-4 w-4" /> Working Order
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="h-10 gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
              asChild
            >
              <Link href={saveAsTemplateHref}>
                <BookmarkPlus className="h-4 w-4" /> Сохранить как шаблон
              </Link>
            </Button>
            <Dialog open={amendmentDialogOpen} onOpenChange={setAmendmentDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50"
                >
                  <FileEdit className="h-4 w-4" /> Запросить изменение
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Запрос на изменение заказа</DialogTitle>
                  <DialogDescription>
                    Опишите, что нужно изменить (позиции, количество, отмена строк). Бренд
                    рассмотрит заявку в разделе «Заявки на изменение заказа».
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={amendmentText}
                  onChange={(e) => setAmendmentText(e.target.value)}
                  placeholder="Например: увеличить qty по артикулу CTP-26-001 на 20 шт; отменить позицию CTP-26-003…"
                  className="min-h-[100px]"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAmendmentDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: 'Заявка отправлена',
                        description: 'Бренд рассмотрит запрос на изменение заказа.',
                      });
                      setAmendmentText('');
                      setAmendmentDialogOpen(false);
                    }}
                  >
                    Отправить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {orderOnHold && (
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 rounded-xl border-amber-300 px-4 text-[10px] font-black uppercase tracking-widest text-amber-700"
                onClick={() => {
                  setOrderHoldReleaseRequested(true);
                  toast({
                    title: 'Запрос отправлен',
                    description: 'Бренд рассмотрит запрос на снятие заказа с удержания.',
                  });
                }}
                disabled={orderHoldReleaseRequested}
              >
                {orderHoldReleaseRequested
                  ? 'Запрос на снятие отправлен'
                  : 'Запросить снятие с удержания'}
              </Button>
            )}
            {isAcknowledgmentEligible && !orderAcknowledged && (
              <Button
                className="h-10 gap-2 rounded-xl bg-emerald-600 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700"
                onClick={() => {
                  setOrderAcknowledged(true);
                  toast({
                    title: 'Заказ подтверждён',
                    description: 'Вы подтвердили получение условий заказа.',
                  });
                }}
              >
                <CheckCircle2 className="h-4 w-4" /> Подтвердить заказ
              </Button>
            )}
            <Button
              variant="ghost"
              className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50"
            >
              <XCircle className="h-4 w-4" /> Отменить
            </Button>
          </div>
        }
      />

      {/* Уведомление «Заказ отгружен» — при статусе отгружен/в пути */}
      {shipmentTracking?.isShipped && !shipmentBannerDismissed && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-emerald-800">Заказ отгружен</span>
            {shipmentTracking.shipDate && (
              <span className="text-emerald-700">
                · Отгрузка {new Date(shipmentTracking.shipDate).toLocaleDateString('ru-RU')}
              </span>
            )}
            {shipmentTracking.trackNumber && (
              <span className="font-mono text-xs text-emerald-600">
                Трек: {shipmentTracking.trackNumber}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-700 hover:bg-emerald-100"
            onClick={() => setShipmentBannerDismissed(true)}
          >
            Скрыть
          </Button>
        </div>
      )}

      <>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            {/* --- LIVE PRODUCTION TRACKER --- */}
            <Card className="border-accent-primary/20 bg-accent-primary/10 relative overflow-hidden border-2">
              <div className="absolute right-0 top-0 p-4 opacity-5">
                <Truck className="text-accent-primary h-32 w-32" />
              </div>
              <CardHeader className="border-accent-primary/20 relative z-10 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-accent-primary flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                      <div className="bg-accent-primary h-2 w-2 animate-ping rounded-full" />
                      Live from Factory: Москва, Цех #4
                    </CardTitle>
                    <CardDescription className="text-text-secondary text-[10px] font-bold uppercase">
                      Прямая трансляция статуса производства вашего заказа
                    </CardDescription>
                  </div>
                  <Badge className="text-accent-primary border-accent-primary/20 bg-white text-[8px] font-black uppercase">
                    Intel OS Sync
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                <div className="relative flex justify-between">
                  <div className="bg-border-subtle absolute left-0 right-0 top-4 -z-0 h-0.5" />
                  {productionStages.map((stage, i) => (
                    <div key={i} className="relative z-10 flex w-1/4 flex-col items-center gap-3">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500',
                          stage.status === 'completed'
                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                            : stage.status === 'current'
                              ? 'border-accent-primary text-accent-primary scale-110 bg-white shadow-xl'
                              : 'border-border-default text-text-muted bg-white'
                        )}
                      >
                        {stage.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-1 text-center">
                        <p
                          className={cn(
                            'text-[9px] font-black uppercase tracking-tight',
                            stage.status === 'current'
                              ? 'text-accent-primary'
                              : 'text-text-secondary'
                          )}
                        >
                          {stage.name}
                        </p>
                        {stage.status === 'current' && (
                          <div className="mx-auto w-12">
                            <div className="bg-accent-primary/15 mt-1 h-1 w-full overflow-hidden rounded-full">
                              <div
                                className="bg-accent-primary h-full animate-pulse"
                                style={{ width: `${stage.progress}%` }}
                              />
                            </div>
                            <p className="text-accent-primary mt-1 text-[8px] font-bold">
                              {stage.progress}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border-subtle overflow-hidden rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle>Статус заказа</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  {orderStatusSteps.map((step, index) => (
                    <div
                      key={step.status}
                      className="relative flex w-1/4 flex-col items-center text-center"
                    >
                      <div
                        className={cn(
                          'z-10 flex h-8 w-8 items-center justify-center rounded-full border-2',
                          step.date
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted'
                        )}
                      >
                        {step.date ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium">{step.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.date ? new Date(step.date).toLocaleDateString('ru-RU') : '...'}
                      </p>
                      {index < orderStatusSteps.length - 1 && (
                        <div
                          className={cn(
                            'absolute left-1/2 top-4 -z-0 h-0.5 w-full',
                            step.date &&
                              (index < currentStatusIndex - 1 || currentStatusIndex === -1)
                              ? 'bg-primary'
                              : 'bg-border'
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* JOOR: отгрузки (ASN) по заказу — трекинг и документы */}
            <Card className="border-border-subtle">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" /> Отгрузки по заказу
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={ROUTES.shop.b2bTracking}>Карта поставок</Link>
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Advanced Shipping Notice (ASN) — статус отгрузок от бренда
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="bg-bg-surface2 flex items-center justify-between rounded-lg p-2 text-sm">
                    <span className="font-mono text-xs">B2B-0012-S1</span>
                    <Badge variant="outline" className="text-[10px]">
                      В пути
                    </Badge>
                    <span className="text-text-secondary text-xs">ETA 15.09.2024</span>
                  </li>
                  <li className="bg-bg-surface2 flex items-center justify-between rounded-lg p-2 text-sm">
                    <span className="font-mono text-xs">B2B-0012-S2</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Готовится
                    </Badge>
                    <span className="text-text-secondary text-xs">Drop 2</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            {/* Отгрузка и доставка: дата отгрузки, трек, этапы. Инфраструктура: загрузка/ошибка/refetch. */}
            <Card className="border-border-subtle">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4" /> Отгрузка и доставка
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Статус доставки и трек-номер
                  </CardDescription>
                </div>
                {shipmentError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-amber-600"
                    onClick={() => refetchShipment()}
                  >
                    Повторить
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {shipmentLoading && !shipmentTracking && (
                  <div className="animate-pulse space-y-3">
                    <div className="bg-bg-surface2 h-4 w-3/4 rounded" />
                    <div className="bg-bg-surface2 h-16 rounded" />
                    <div className="bg-bg-surface2 h-24 rounded" />
                  </div>
                )}
                {shipmentError && shipmentTracking && (
                  <p className="text-xs text-amber-600">
                    Показаны закэшированные данные. {shipmentError}
                  </p>
                )}
                {shipmentTracking && !shipmentLoading && (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {shipmentTracking.shipDate && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">
                            Дата отгрузки
                          </p>
                          <p className="font-medium">
                            {new Date(shipmentTracking.shipDate).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      )}
                      {shipmentTracking.estimatedDelivery && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">
                            Ожидаемая доставка
                          </p>
                          <p className="font-medium">
                            {new Date(shipmentTracking.estimatedDelivery).toLocaleDateString(
                              'ru-RU'
                            )}
                          </p>
                        </div>
                      )}
                      {shipmentTracking.trackNumber && (
                        <div className="col-span-2 flex flex-wrap items-center gap-2">
                          <p className="shrink-0 text-[10px] font-bold uppercase text-muted-foreground">
                            Трек-номер
                          </p>
                          <code className="bg-bg-surface2 rounded px-2 py-1 font-mono text-xs">
                            {shipmentTracking.trackNumber}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(shipmentTracking.trackNumber ?? '');
                              toast({
                                title: 'Скопировано',
                                description: 'Трек-номер в буфере обмена.',
                              });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {getCarrierTrackingUrl(
                            shipmentTracking.carrier,
                            shipmentTracking.trackNumber ?? ''
                          ) ? (
                            <a
                              href={
                                getCarrierTrackingUrl(
                                  shipmentTracking.carrier,
                                  shipmentTracking.trackNumber ?? ''
                                )!
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              {shipmentTracking.carrier}
                            </a>
                          ) : (
                            <span className="text-text-secondary text-xs">
                              {shipmentTracking.carrier}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {shipmentTracking.stages.map((stage) => (
                        <li key={stage.id} className="flex items-center gap-3 text-sm">
                          <div
                            className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                              stage.done && 'bg-primary text-primary-foreground',
                              stage.current && 'bg-amber-500 text-white',
                              !stage.done && !stage.current && 'bg-muted'
                            )}
                          >
                            {stage.done ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : stage.current ? (
                              <Truck className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <span className={cn('font-medium', stage.current && 'text-amber-700')}>
                            {stage.label}
                          </span>
                          {stage.date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(stage.date).toLocaleDateString('ru-RU')}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" /> История заказа
                </CardTitle>
                <CardDescription>
                  Активность и ключевые события по заказу (JOOR/NuOrder)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {orderStatusSteps.map((step, i) => (
                    <li key={step.status} className="flex items-start gap-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                          step.date ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}
                      >
                        {step.date ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{step.status}</p>
                        <p className="text-xs text-muted-foreground">
                          {step.date
                            ? new Date(step.date).toLocaleDateString('ru-RU')
                            : 'Ожидается'}
                        </p>
                      </div>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <div className="bg-bg-surface2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Инвойс отправлен</p>
                      <p className="text-xs">—</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <OperationalOrderNotesV1Sync orderId={orderId} variant="shop" />

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Состав заказа</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase">
                      {currency}
                    </Badge>
                    <Button
                      variant={isEditing ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleToggleEdit}
                    >
                      {isEditing ? 'Сохранить изменения' : 'Редактировать заказ'}
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Заказ № {orderId} от {orderDate} · Окна доставки:{' '}
                  {mockOrderDetailJoors.deliveryWindows?.map((w) => w.label).join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead>Окно доставки</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Кол-во</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                      <TableHead>Заметка</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item: any, index) => {
                      const windowLabel = item.deliveryWindowId
                        ? (mockOrderDetailJoors.deliveryWindows?.find(
                            (w) => w.id === item.deliveryWindowId
                          )?.label ?? item.deliveryWindowId)
                        : '—';
                      const lineStatus = item.lineStatus || 'open';
                      return (
                        <TableRow
                          key={`${item.id}-${index}`}
                          className={lineStatus !== 'open' ? 'opacity-60' : 'hover:bg-muted/50'}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.images && item.images.length > 0 && item.images[0].url && (
                                <Image
                                  src={item.images[0].url}
                                  alt={item.name}
                                  width={40}
                                  height={50}
                                  className="rounded-md object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <div className="mt-1 flex items-center gap-1.5">
                                  <div
                                    className="h-3 w-3 rounded-full border"
                                    style={{ backgroundColor: item.colorCode }}
                                  ></div>
                                  <span className="text-xs text-muted-foreground">
                                    {item.color}
                                  </span>
                                  {lineStatus !== 'open' && (
                                    <Badge variant="secondary" className="ml-1 text-[9px]">
                                      {lineStatus === 'cancelled' ? 'Отменена' : 'Заменена'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {windowLabel}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.category}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={item.orderedQuantity}
                                onChange={(e) =>
                                  handleQuantityChange(item.id, parseInt(e.target.value, 10) || 0)
                                }
                                className="h-8 w-20"
                              />
                            ) : (
                              item.orderedQuantity
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {(item.price * 0.4 * item.orderedQuantity).toLocaleString('ru-RU')}{' '}
                            {currency === 'RUB' ? '₽' : currency}
                          </TableCell>
                          <TableCell className="max-w-[180px]">
                            {isEditing ? (
                              <Input
                                value={item.lineNotes || ''}
                                onChange={(e) => handleLineNoteChange(item.id, e.target.value)}
                                placeholder="Комментарий к строке…"
                                className="h-8 text-xs"
                              />
                            ) : (
                              <span
                                className="block truncate text-xs text-muted-foreground"
                                title={item.lineNotes}
                              >
                                {item.lineNotes || '—'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {lineStatus === 'open' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mr-1"
                                  onClick={() => setEditingItem(item)}
                                >
                                  <Edit className="mr-2 h-3 w-3" /> Размеры
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReplaceItem(item)}
                                >
                                  Замена
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-end gap-3 text-sm font-semibold">
                <span>Итого ({currency}):</span>
                <span>
                  {total.toLocaleString('ru-RU')} {currency === 'RUB' ? '₽' : currency}
                </span>
              </CardFooter>
            </Card>
          </div>
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              <PaymentFlowCard
                orderId={orderId}
                amount={`${total.toLocaleString('ru-RU')} ₽`}
                status="pending"
                dueDate="20.03.2026"
                onPay={() => toast({ title: 'Оплата', description: 'Переход к платёжному шлюзу' })}
              />
              <OrderChat />
              <Card>
                <CardHeader>
                  <CardTitle>Финансы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Сумма заказа</span>
                    <span>{total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Предоплата (50%)</span>
                    <span className="font-semibold">{(total * 0.5).toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Статус оплаты</span>
                    <Badge variant="secondary">Ожидает</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="min-w-[140px] flex-1"
                    onClick={() => toast({ title: 'Инвойс', description: 'Файл инвойса скачан.' })}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Скачать инвойс
                  </Button>
                  <Button
                    variant="outline"
                    className="min-w-[140px] flex-1"
                    onClick={() =>
                      toast({
                        title: 'Упаковочный лист',
                        description: 'Packing list (ship memo) скачан.',
                      })
                    }
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Упаковочный лист
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
            См. также
          </span>
          <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
            <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-order-detail-retail-link">
              Розничная аналитика
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
            <Link
              href={ROUTES.shop.analyticsFootfall}
              data-testid="shop-b2b-order-detail-footfall-link"
            >
              Трафик по зонам
            </Link>
          </Button>
          <B2bMarginAnalysisHubButton />
        </div>

        <B2bPriorityWorkflowPanel
          title="Рабочие направления"
          lead="Оптовый контур, производство у бренда, fulfillment и коммуникации — в одном компактном блоке."
          groups={getShopB2bOrderPriorityGroups(orderItems[0]?.id)}
        />
        <B2bPriorityWorkflowPanel
          title="Сквозной процесс: чат, календарь, заказ, селекции"
          lead="Общение с брендом — в сообщениях; сроки — в календарях; формирование заказа и луков — в матрице, подборках и каталоге; аналитика — для прогноза и проверки."
          groups={getShopB2bCollaborationProcessGroups()}
        />
      </>

      {editingItem && (
        <SizeBreakdownDialog
          isOpen={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onSave={handleSaveSizes}
        />
      )}
      {replaceItem && (
        <ReplaceLineDialog
          open={!!replaceItem}
          onOpenChange={(open) => !open && setReplaceItem(null)}
          item={{
            id: replaceItem.id,
            name: replaceItem.name,
            category: replaceItem.category,
            price: replaceItem.price,
          }}
          onReplace={handleReplaceLine}
          onCancelLine={handleCancelLine}
        />
      )}
    </ShopB2bNuOrderScope>
  );
}
