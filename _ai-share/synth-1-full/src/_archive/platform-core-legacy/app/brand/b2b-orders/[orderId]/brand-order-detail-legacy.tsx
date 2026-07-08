'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
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
  ChevronLeft,
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
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  Box,
  Sparkles,
  Eye,
  Globe,
  Layers,
  Calendar,
  ArrowRight,
  Split,
  Combine,
  PackageCheck,
  PlusCircle,
  Percent,
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { initialOrderItems, orderStatusSteps, mockOrderDetailJoors } from '@/lib/order-data';
import {
  getBrandB2bCollaborationProcessGroups,
  getBrandB2bOrderPriorityGroups,
} from '@/lib/data/b2b-priority-workflow-groups';
import { ROUTES } from '@/lib/routes';
import { useOrderShipmentTracking } from '@/hooks/use-b2b-shipment';
import { getCarrierTrackingUrl } from '@/lib/b2b/carrier-tracking-url';
import { B2bPriorityWorkflowPanel } from '@/components/b2b/B2bPriorityWorkflowPanel';
import { OrderChat, SizeBreakdownDialog } from '@/components/brand/b2b';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegistryPageHeader } from '@/components/design-system';
import { B2bOrderCommsContextButtons } from '@/components/b2b/B2bOrderCommsContextButtons';
import { OperationalOrderNotesV1Sync } from '@/components/b2b/OperationalOrderNotesV1Sync';

const MOCK_SHIPMENTS = [
  {
    id: 'ship-1',
    name: 'Drop 1: Core Collection',
    date: '2026-03-15',
    status: 'In Production',
    items: ['1', '3'],
  },
  {
    id: 'ship-2',
    name: 'Drop 2: Seasonal Capsule',
    date: '2026-04-20',
    status: 'Scheduled',
    items: ['2'],
  },
];

type BrandB2bOrderDetailLegacyPageProps = {
  orderId: string;
};

export function BrandB2bOrderDetailLegacyPage({ orderId }: BrandB2bOrderDetailLegacyPageProps) {
  const [orderItems, setOrderItems] = useState(initialOrderItems);
  const [shipments, setShipments] = useState(MOCK_SHIPMENTS);
  const [activeShipment, setActiveShipment] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>(
    'pending'
  );
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [orderDate, setOrderDate] = useState('');
  const currency = mockOrderDetailJoors.currency || 'RUB';
  const { data: shipmentTracking } = useOrderShipmentTracking(orderId);

  useEffect(() => {
    setOrderDate(new Date().toLocaleDateString('ru-RU'));
  }, []);

  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.price * 0.4 * item.orderedQuantity,
    0
  );
  const total = subtotal;

  const filteredItems = useMemo(() => {
    if (activeShipment === 'all') return orderItems;
    const shipment = shipments.find((s) => s.id === activeShipment);
    return orderItems.filter((item) => shipment?.items.includes(item.id));
  }, [activeShipment, orderItems, shipments]);

  const handleApproveOrder = () => {
    setApprovalStatus('approved');
    toast({
      title: 'Заказ одобрен',
      description: 'Ритейлер получил уведомление. Инвойс сформирован.',
    });
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      toast({
        title: 'Изменения сохранены',
        description: 'Информация о заказе была успешно обновлена.',
      });
    }
    setIsEditing(!isEditing);
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

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title={`Заказ от демо-магазина (Москва 1) / ${orderId}`}
        leadPlain="Ритейлер: Демо-магазин · Москва 1 · уровень: Platinum Partner"
        eyebrow={
          <Button
            variant="outline"
            size="icon"
            className="border-border-default -ml-2 shrink-0 rounded-xl"
            asChild
          >
            <Link href={ROUTES.brand.b2bOrders} aria-label="К списку заказов">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2 lg:flex">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-[10px] font-black uppercase text-amber-700">
                Credit Check: OK (Limit 5.0M ₽)
              </span>
            </div>
            <Button
              variant="outline"
              className="border-border-default h-10 gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
              asChild
            >
              <Link href={`/brand/b2b-orders/${orderId}/invoice`}>
                <FileText className="text-text-muted h-4 w-4" /> Pro-forma
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-border-default h-10 gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
              asChild
            >
              <Link
                href={`${ROUTES.shop.b2bWorkingOrder}?wholesaleOrderId=${encodeURIComponent(orderId)}`}
                title="Контур ритейлера: версии файла NuOrder / Working Order"
              >
                <Layers className="text-text-muted h-4 w-4" /> Working Order
              </Link>
            </Button>
            <B2bOrderCommsContextButtons orderId={orderId} variant="brand" />
            {approvalStatus === 'pending' ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-rose-100 px-4 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50"
                >
                  Отклонить
                </Button>
                <Button
                  onClick={handleApproveOrder}
                  className="h-10 rounded-xl bg-emerald-600 px-6 text-[10px] font-black uppercase text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Одобрить заказ
                </Button>
              </div>
            ) : (
              <Badge className="h-10 rounded-xl border-none bg-emerald-100 px-6 text-[10px] font-black uppercase text-emerald-700">
                <CheckCircle className="mr-2 h-4 w-4" /> Одобрено
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="border-border-default h-10 w-10 rounded-xl border"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-border-subtle rounded-xl p-2 shadow-xl"
              >
                <DropdownMenuItem className="rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  Отправить в ERP
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  Создать копию
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {/* JOOR: персональные условия для ритейлера (custom pricing / discount) */}
          <Card className="border-border-default bg-bg-surface2/80 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Percent className="text-text-secondary h-4 w-4" /> Персональные условия для
                ритейлера
              </CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-wider">
                JOOR: индивидуальные скидки и условия по контракту
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-text-primary">
                Скидка по контракту: <strong>42%</strong> от розницы
              </p>
              <p className="text-text-secondary text-xs">
                Оплата: 50% предоплата, 50% по факту отгрузки. Кредитный лимит: 5.0M ₽.
              </p>
            </CardContent>
          </Card>

          {/* NuORDER/JOOR: график платежей и статус инвойса в одной временной шкале */}
          <Card className="border-border-default rounded-xl bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                График платежей и инвойс
              </CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-wider">
                Депозит → Баланс → Отсрочка; статус инвойса
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium">Депозит 50%</span>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-700"
                  >
                    Оплачено
                  </Badge>
                </div>
                <div className="bg-border-subtle h-px w-4" />
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-medium">Баланс 50%</span>
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-[9px] text-amber-700"
                  >
                    По отгрузке
                  </Badge>
                </div>
                <div className="bg-border-subtle h-px w-4" />
                <div className="flex items-center gap-2">
                  <div className="bg-accent-primary h-2 w-2 rounded-full" />
                  <span className="text-xs font-medium">Инвойс</span>
                  <Badge
                    variant="outline"
                    className="bg-accent-primary/10 text-accent-primary border-accent-primary/30 text-[9px]"
                  >
                    Выписан
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <OperationalOrderNotesV1Sync orderId={orderId} variant="brand" />

          {/* --- MULTI-SHIPMENT TIMELINE --- */}
          <Card className="bg-text-primary overflow-hidden rounded-xl border-none text-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-accent-primary flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]">
                  <Truck className="h-4 w-4" /> Multi-Shipment Controller
                </CardTitle>
                <CardDescription className="text-text-muted text-[10px] font-bold uppercase italic tracking-widest">
                  График отгрузок и консолидация
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10"
              >
                <Split className="mr-2 h-3.5 w-3.5" /> Разделить заказ
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              <div className="scrollbar-hide flex items-center gap-3 overflow-x-auto pb-4">
                {shipments.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div
                      className={cn(
                        'group relative min-w-[240px] cursor-pointer rounded-2xl border p-3 transition-all',
                        activeShipment === s.id
                          ? 'bg-accent-primary border-accent-primary/40 shadow-accent-primary/20 shadow-lg'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      )}
                      onClick={() => setActiveShipment(s.id)}
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <Badge
                          className={cn(
                            'h-5 border-none px-2 text-[8px] font-black uppercase',
                            s.status === 'In Production'
                              ? 'bg-amber-500 text-white'
                              : 'bg-accent-primary/40 text-white'
                          )}
                        >
                          {s.status}
                        </Badge>
                        <span className="text-[10px] font-black text-white/40">
                          {s.items.length} SKU
                        </span>
                      </div>
                      <h4 className="mb-1 text-xs font-black uppercase tracking-tight">{s.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/60">
                        <Calendar className="h-3.5 w-3.5" />{' '}
                        {new Date(s.date).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="absolute -bottom-2 -right-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-lg">
                          <ArrowRight className="text-accent-primary h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    {i < shipments.length - 1 && (
                      <div className="mx-4 flex flex-col items-center gap-1">
                        <div className="h-px w-8 bg-white/10" />
                        <Combine className="h-3 w-3 text-white/20" />
                        <div className="h-px w-8 bg-white/10" />
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="flex h-[110px] min-w-[120px] flex-col gap-2 rounded-2xl border-2 border-dashed border-white/10 text-white/40 transition-all hover:bg-white/5 hover:text-white"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span className="text-[9px] font-black uppercase">Add Drop</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Отгрузка и доставка — то же, что видит ритейлер: дата отгрузки, трек, этапы */}
          {shipmentTracking && (
            <Card className="border-border-subtle rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4" /> Отгрузка и доставка
                </CardTitle>
                <CardDescription className="text-[10px] uppercase">
                  Дата отгрузки, трек, этапы для байера
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {shipmentTracking.shipDate && (
                  <p>
                    <span className="text-text-secondary text-[10px] font-bold uppercase">
                      Отгрузка:
                    </span>{' '}
                    {new Date(shipmentTracking.shipDate).toLocaleDateString('ru-RU')}
                  </p>
                )}
                {shipmentTracking.trackNumber && (
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-text-secondary text-[10px] font-bold uppercase">
                      Трек:
                    </span>
                    <code className="bg-bg-surface2 rounded px-1.5 py-0.5 font-mono text-xs">
                      {shipmentTracking.trackNumber}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(shipmentTracking.trackNumber ?? '');
                        toast({ title: 'Скопировано' });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {getCarrierTrackingUrl(
                      shipmentTracking.carrier,
                      shipmentTracking.trackNumber
                    ) ? (
                      <a
                        href={
                          getCarrierTrackingUrl(
                            shipmentTracking.carrier,
                            shipmentTracking.trackNumber
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
                  </p>
                )}
                <ul className="space-y-1.5">
                  {shipmentTracking.stages.map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                          s.done && 'bg-primary text-primary-foreground',
                          s.current && 'bg-amber-500 text-white',
                          !s.done && !s.current && 'bg-muted'
                        )}
                      >
                        {s.done ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : s.current ? (
                          <Truck className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <span className={cn('text-xs', s.current && 'font-semibold text-amber-700')}>
                        {s.label}
                      </span>
                      {s.date && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(s.date).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="border-border-subtle overflow-hidden rounded-xl shadow-sm">
            <CardHeader className="bg-bg-surface2 border-border-subtle border-b p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-text-primary text-base font-black uppercase tracking-tight">
                    Состав отгрузки
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px] font-bold uppercase">
                    {activeShipment === 'all'
                      ? 'Полный список товаров'
                      : `Позиции для: ${shipments.find((s) => s.id === activeShipment)?.name}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {activeShipment !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-accent-primary text-[10px] font-black uppercase"
                      onClick={() => setActiveShipment('all')}
                    >
                      Сбросить фильтр
                    </Button>
                  )}
                  <Button
                    variant={isEditing ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-xl text-[10px] font-black uppercase"
                    onClick={handleToggleEdit}
                  >
                    {isEditing ? 'Сохранить изменения' : 'Корректировать количества'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-bg-surface2/80">
                  <TableRow className="border-none">
                    <TableHead className="text-text-muted px-8 py-4 text-[10px] font-black uppercase tracking-widest">
                      Изделие
                    </TableHead>
                    <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                      Кол-во
                    </TableHead>
                    <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                      Оптовая цена
                    </TableHead>
                    <TableHead className="text-text-muted px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest">
                      Итого
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item, index) => (
                    <TableRow
                      key={`${item.id}-${index}`}
                      className="hover:bg-bg-surface2 group transition-colors"
                    >
                      <TableCell className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          {item.images && item.images.length > 0 && item.images[0].url && (
                            <div className="relative h-12 w-10 overflow-hidden rounded-lg shadow-sm">
                              <Image
                                src={item.images[0].url}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-text-primary text-xs font-black uppercase">
                              {item.name}
                            </p>
                            <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                              {item.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={item.orderedQuantity}
                            onChange={(e) =>
                              handleQuantityChange(item.id, parseInt(e.target.value, 10) || 0)
                            }
                            className="h-8 w-20 rounded-lg text-xs font-bold"
                          />
                        ) : (
                          <Button
                            variant="link"
                            className="text-accent-primary h-auto p-0 text-xs font-black hover:no-underline"
                            onClick={() => setEditingItem(item)}
                          >
                            {item.orderedQuantity} ед.
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-text-secondary text-xs font-bold tabular-nums">
                        {(item.price * 0.4).toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-text-primary px-8 py-4 text-right text-xs font-black tabular-nums">
                        {(item.price * 0.4 * item.orderedQuantity).toLocaleString('ru-RU')} ₽
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card className="bg-accent-primary relative space-y-6 overflow-hidden rounded-xl border-none p-4 text-white shadow-xl">
              <Sparkles className="absolute -right-10 -top-3 h-40 w-40 text-white opacity-10" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
                    <PackageCheck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    Shipment Consolidation
                  </h3>
                </div>
                <p className="text-xs font-medium italic leading-relaxed opacity-80">
                  «ИИ обнаружил возможность консолидировать Drop 1 и Drop 2 в одну отгрузку. Это
                  сэкономит байеру 12,400 ₽ на логистике».
                </p>
                <Button className="text-accent-primary hover:bg-bg-surface2 h-12 w-full rounded-xl bg-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Консолидировать
                </Button>
              </div>
            </Card>

            <Card className="bg-text-primary overflow-hidden rounded-xl border-none text-white shadow-xl">
              <CardHeader className="border-b border-white/5 p-4 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest">
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-white/40">
                    Subtotal (Wholesale)
                  </span>
                  <span className="text-sm font-black tabular-nums">
                    {subtotal.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-white/40">VAT (20%)</span>
                  <span className="text-sm font-black tabular-nums">
                    {(subtotal * 0.2).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="my-2 h-px w-full bg-white/10" />
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                      Total Payable
                    </p>
                    <p className="text-base font-black tabular-nums">
                      {(subtotal * 1.2).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <Badge className="mb-1 border-none bg-emerald-500 text-[8px] font-black uppercase text-white">
                    Tax Included
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="bg-accent-primary hover:bg-accent-primary shadow-accent-primary/20 h-12 w-full rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
                  Выставить счет на оплату
                </Button>
              </CardFooter>
            </Card>
            <OrderChat />
            <B2bPriorityWorkflowPanel groups={getBrandB2bOrderPriorityGroups(orderItems[0]?.id)} />
            <B2bPriorityWorkflowPanel
              title="Процесс заказа: чат → календарь → материалы"
              lead="Планирование и переговоры ведите в наших сообщениях и календаре; коллекции и обучение — рядом с реестром заказов."
              groups={getBrandB2bCollaborationProcessGroups()}
            />
          </div>
        </div>
      </div>
      {editingItem && (
        <SizeBreakdownDialog
          isOpen={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onSave={(itemId, newSizes) => setEditingItem(null)}
        />
      )}
    </CabinetPageContent>
  );
}
