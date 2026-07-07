/**
 * Карточки «Партнёры по типам» + merge с `partnerEcosystem.countsPatchById`.
 * Вынесено из page-data для узкого read.
 */

import { Factory, Package, Store, Truck, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PartnerCountItem = {
  id: string;
  label: string;
  value: string;
  href: string;
  color: string;
  icon: LucideIcon;
  description: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  trendLabel?: string;
  statusShort?: string;
  statusHref?: string;
  statusShort2?: string;
  statusHref2?: string;
  addHref: string;
  addLabel: string;
  progressValue?: number;
  progressMax?: number;
  alertCount?: number;
  subline?: string;
  businessProcesses?: { label: string; href: string }[];
  roleInChain?: 'supply' | 'sales' | 'platform';
  detailMetrics?: { label: string; value: string; href?: string }[];
  tips?: string[];
};

export const PARTNER_COUNTS: PartnerCountItem[] = [
  {
    id: 'factories',
    label: 'Производства',
    value: '8',
    href: '/brand/factories',
    color: 'bg-blue-500',
    icon: Factory,
    description: 'Связи с производствами и фабриками. Контракты, заказы, контроль качества.',
    trend: '+2',
    trendDirection: 'up',
    trendLabel: 'за месяц',
    statusShort: '1 ожидает подтверждения',
    statusHref: '/brand/factories?status=pending',
    addHref: '/brand/factories?action=new',
    addLabel: 'Добавить',
    alertCount: 1,
    subline: '5 с активными заказами',
    businessProcesses: [
      { label: 'Заказы на производство', href: '/brand/production' },
      { label: 'B2B заказы', href: '/brand/b2b-orders' },
    ],
    roleInChain: 'supply',
    detailMetrics: [
      { label: 'Активных заказов', value: '5', href: '/brand/b2b-orders' },
      { label: 'Новых за период', value: '1', href: '/brand/factories' },
      { label: 'Договоров', value: '8', href: '/brand/documents' },
    ],
    tips: [
      'Сроки по контрактам',
      'Контроль качества образцов',
      'Загрузка производственных мощностей',
    ],
  },
  {
    id: 'suppliers',
    label: 'Поставщики',
    value: '24',
    href: '/brand/materials',
    color: 'bg-emerald-500',
    icon: Package,
    description: 'Связи с поставщиками материалов и сырья. Спецификации, сертификаты.',
    trend: '+5',
    trendDirection: 'up',
    trendLabel: 'за месяц',
    statusShort: '2 ожидают подтверждения',
    statusHref: '/brand/materials?status=pending',
    addHref: '/brand/materials?action=new',
    addLabel: 'Добавить',
    subline: '12 с сертификатами',
    businessProcesses: [
      { label: 'Документы (спецификации)', href: '/brand/documents' },
      { label: 'Закупки', href: '/brand/auctions' },
    ],
    roleInChain: 'supply',
    detailMetrics: [
      { label: 'С сертификатами', value: '12', href: '/brand/materials' },
      { label: 'Новых за период', value: '3', href: '/brand/materials' },
      { label: 'Спецификаций', value: '24', href: '/brand/documents' },
    ],
    tips: [
      'Актуальность сертификатов',
      'Минимальные партии и сроки поставки',
      'Резерв по критичным позициям',
    ],
  },
  {
    id: 'retailers',
    label: 'Магазины',
    value: '156',
    href: '/brand/retailers',
    color: 'bg-accent-primary',
    icon: Store,
    description: 'Связи с магазинами и ретейлерами. Точки продаж, условия, заказы.',
    trend: '+12',
    trendDirection: 'up',
    trendLabel: 'за месяц',
    statusShort: '3 ожидают подтверждения',
    statusHref: '/brand/retailers?status=pending',
    addHref: '/brand/retailers?action=invite',
    addLabel: 'Пригласить',
    alertCount: 3,
    subline: '89 с заказами за 30 дн.',
    businessProcesses: [
      { label: 'Заказы B2B', href: '/brand/b2b-orders' },
      { label: 'Документы', href: '/brand/documents' },
      { label: 'Возвраты', href: '/brand/returns-claims' },
    ],
    roleInChain: 'sales',
    detailMetrics: [
      { label: 'С заказами за 30 дн.', value: '89', href: '/brand/b2b-orders' },
      { label: 'Новых за период', value: '12', href: '/brand/retailers' },
      { label: 'Договоров активно', value: '142', href: '/brand/documents' },
    ],
    tips: [
      'Условия оплаты и логистики по контрактам',
      'Регулярность заказов и план выкупа',
      'Возвраты и рекламации',
    ],
  },
  {
    id: 'distributors',
    label: 'Дистрибуторы',
    value: '18',
    href: '/brand/distributors',
    color: 'bg-sky-500',
    icon: Truck,
    description: 'Связи с дистрибуторами. Каналы поставок, логистика, охват регионов.',
    trend: '+3',
    trendDirection: 'up',
    trendLabel: 'за месяц',
    statusShort: '2 ожидают подтверждения',
    statusHref: '/brand/distributors?status=pending',
    addHref: '/brand/distributors?action=new',
    addLabel: 'Добавить',
    subline: '14 активных каналов',
    businessProcesses: [
      { label: 'Заказы B2B', href: '/brand/b2b-orders' },
      { label: 'Логистика', href: '/brand/logistics' },
    ],
    roleInChain: 'sales',
    detailMetrics: [
      { label: 'Активных каналов', value: '14', href: '/brand/distributors' },
      { label: 'Новых за период', value: '2', href: '/brand/distributors' },
      { label: 'Заказы B2B', value: '12', href: '/brand/b2b-orders' },
    ],
    tips: ['Территории и эксклюзивность', 'План отгрузок по каналам', 'Логистика до дистрибутора'],
  },
  {
    id: 'integrations',
    label: 'Интеграции',
    value: '3/9',
    href: '/brand/integrations',
    color: 'bg-amber-500',
    icon: Zap,
    description: 'Системы связи с партнёрами: 1С, ЭДО, маркетплейсы. Активных из доступных.',
    statusShort2: '6 доступно',
    statusHref2: '/brand/integrations',
    statusShort: '2 ожидают подключения',
    statusHref: '/brand/integrations',
    addHref: '/brand/integrations',
    addLabel: 'Подключить',
    progressValue: 3,
    progressMax: 9,
    businessProcesses: [
      { label: 'Склад и отгрузки', href: '/brand/warehouse' },
      { label: 'Документы (ЭДО)', href: '/brand/documents' },
    ],
    roleInChain: 'platform',
    detailMetrics: [
      { label: 'Активных', value: '3', href: '/brand/integrations' },
      { label: 'Доступно', value: '6', href: '/brand/integrations' },
    ],
    tips: ['Статус 1С и ЭДО', 'Синхрон остатков с маркетплейсами', 'Webhooks и API для партнёров'],
  },
];

export type PartnerCountApiPatch = Partial<
  Pick<
    PartnerCountItem,
    | 'value'
    | 'trend'
    | 'trendDirection'
    | 'trendLabel'
    | 'subline'
    | 'alertCount'
    | 'progressValue'
    | 'progressMax'
    | 'statusShort'
    | 'statusShort2'
    | 'detailMetrics'
  >
>;

export function mergePartnerCountsWithPatches(
  patches: Record<string, PartnerCountApiPatch> | null | undefined
): PartnerCountItem[] {
  if (!patches || typeof patches !== 'object') return [...PARTNER_COUNTS];
  return PARTNER_COUNTS.map((row) => {
    const p = patches[row.id];
    if (!p) return row;
    return { ...row, ...p };
  });
}
