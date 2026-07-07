/**
 * Блоки вкладки «Партнёрская экосистема» (обзор) + merge с `partnerEcosystem.ecosystemBlocksPatchById`.
 * Связь: `app/api/v1/endpoints/brand.py` → `partnerEcosystem` в ответе дашборда бренда.
 */

import { FileText, CreditCard, RotateCcw, Truck, CheckSquare, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PartnerEcosystemBlock {
  id: string;
  title: string;
  /** Заголовок в две строки [первая, вторая], как «Качество и рекламации» */
  titleLines?: [string, string];
  description: string;
  href: string;
  /** Иконка блока (как в Связь с процессами) */
  icon: LucideIcon;
  /** Цвет фона иконки: bg-text-secondary, bg-blue-500 и т.д. */
  color: string;
  /** Изменение за 7 дн., % */
  changePct7d?: number;
  /** Изменение за 30 дн., % */
  changePct30d?: number;
  /** Метрики по умолчанию (или за 30 дн.) */
  metrics: { label: string; value: string; href?: string }[];
  /** Метрики за 7 дн. — если есть, подставляются при выборе периода 7 дней */
  metrics7d?: { label: string; value: string; href?: string }[];
  /** Метрики за 30 дн. — если есть, подставляются при выборе периода 30 дней */
  metrics30d?: { label: string; value: string; href?: string }[];
  /** Количество требующих внимания за период (бейдж) */
  alertCount?: number;
  alertCount7d?: number;
  alertCount30d?: number;
  /** Подсказка при наведении на красный бейдж: что в нём */
  alertTooltip?: string;
  /** Ссылка на действие «добавить» */
  addHref?: string;
  /** Текст кнопки: Добавить, Создать заказ и т.д. */
  addLabel?: string;
}

export type PartnerEcosystemBlockApiPatch = Partial<
  Pick<
    PartnerEcosystemBlock,
    | 'title'
    | 'titleLines'
    | 'description'
    | 'href'
    | 'changePct7d'
    | 'changePct30d'
    | 'metrics'
    | 'metrics7d'
    | 'metrics30d'
    | 'alertCount'
    | 'alertCount7d'
    | 'alertCount30d'
    | 'alertTooltip'
    | 'addHref'
    | 'addLabel'
  >
>;

export const PARTNER_ECOSYSTEM_BLOCKS: PartnerEcosystemBlock[] = [
  {
    id: 'contracts-docs',
    title: 'Контракты и документы',
    titleLines: ['Контракты', 'и документы'],
    description:
      'Договоры, спецификации, акты с партнёрами. Срок действия, на подпись, истекающие.',
    href: '/brand/documents',
    icon: FileText,
    color: 'bg-text-secondary',
    changePct7d: 0,
    changePct30d: 100,
    alertCount: 2,
    alertCount7d: 1,
    alertCount30d: 2,
    alertTooltip: 'Документы на подпись, истекающие в ближайшее время',
    addHref: '/brand/documents?action=new',
    addLabel: 'Добавить',
    metrics: [
      { label: 'На подпись', value: '2', href: '/brand/documents?status=pending' },
      { label: 'Истекают в 30 дн.', value: '5', href: '/brand/documents?expiring=30' },
      { label: 'Активных договоров', value: '192', href: '/brand/documents' },
    ],
    metrics7d: [
      { label: 'На подпись за 7 дн.', value: '1', href: '/brand/documents?status=pending' },
      { label: 'Истекают в 30 дн.', value: '5', href: '/brand/documents?expiring=30' },
      { label: 'Активных договоров', value: '192', href: '/brand/documents' },
    ],
    metrics30d: [
      { label: 'На подпись за 30 дн.', value: '2', href: '/brand/documents?status=pending' },
      { label: 'Истекают в 30 дн.', value: '5', href: '/brand/documents?expiring=30' },
      { label: 'Активных договоров', value: '192', href: '/brand/documents' },
    ],
  },
  {
    id: 'finance-settlements',
    title: 'Финансы и расчёты',
    titleLines: ['Финансы', 'и расчёты'],
    description: 'Дебиторка по партнёрам, платёжные условия, выверки, просроченные платежи.',
    href: '/brand/finance',
    icon: CreditCard,
    color: 'bg-emerald-500',
    changePct7d: 5,
    changePct30d: -2,
    alertCount: 1,
    alertCount7d: 0,
    alertCount30d: 1,
    alertTooltip: 'Просроченные платежи, партнёры на выверке',
    addHref: '/brand/finance',
    addLabel: 'Выверка',
    metrics: [
      { label: 'К получению', value: '2,4 млн ₽', href: '/brand/finance' },
      { label: 'Просрочено', value: '1', href: '/brand/finance?overdue=1' },
      { label: 'На выверке', value: '3 партнёра', href: '/brand/finance' },
    ],
    metrics7d: [
      { label: 'К получению за 7 дн.', value: '0,8 млн ₽', href: '/brand/finance' },
      { label: 'Просрочено', value: '0', href: '/brand/finance?overdue=1' },
      { label: 'На выверке', value: '1 партнёр', href: '/brand/finance' },
    ],
    metrics30d: [
      { label: 'К получению за 30 дн.', value: '2,4 млн ₽', href: '/brand/finance' },
      { label: 'Просрочено', value: '1', href: '/brand/finance?overdue=1' },
      { label: 'На выверке', value: '3 партнёра', href: '/brand/finance' },
    ],
  },
  {
    id: 'quality-claims',
    title: 'Качество и рекламации',
    titleLines: ['Качество', 'и рекламации'],
    description: 'Возвраты, претензии, инциденты качества по партнёрам.',
    href: '/brand/returns-claims',
    icon: RotateCcw,
    color: 'bg-amber-500',
    changePct7d: 25,
    changePct30d: 15,
    alertCount: 5,
    alertCount7d: 2,
    alertCount30d: 5,
    alertTooltip: 'Открытые возвраты и рекламации от партнёров',
    addHref: '/brand/returns-claims?action=new',
    addLabel: 'Оформить возврат',
    metrics: [
      { label: 'Открытых возвратов', value: '5', href: '/brand/returns-claims' },
      { label: 'Рекламаций за месяц', value: '2', href: '/brand/returns-claims' },
      { label: 'Партнёров с претензиями', value: '3', href: '/brand/returns-claims' },
    ],
    metrics7d: [
      { label: 'Возвратов за 7 дн.', value: '2', href: '/brand/returns-claims' },
      { label: 'Рекламаций за 7 дн.', value: '1', href: '/brand/returns-claims' },
      { label: 'Партнёров с претензиями', value: '2', href: '/brand/returns-claims' },
    ],
    metrics30d: [
      { label: 'Возвратов за 30 дн.', value: '5', href: '/brand/returns-claims' },
      { label: 'Рекламаций за 30 дн.', value: '2', href: '/brand/returns-claims' },
      { label: 'Партнёров с претензиями', value: '3', href: '/brand/returns-claims' },
    ],
  },
  {
    id: 'logistics-shipments',
    title: 'Логистика и отгрузки',
    titleLines: ['Логистика', 'и отгрузки'],
    description: 'Отгрузки в пути, склады партнёров, сроки доставки, задержки.',
    href: '/brand/logistics',
    icon: Truck,
    color: 'bg-sky-500',
    changePct7d: 33,
    changePct30d: 20,
    addHref: '/brand/b2b-orders',
    addLabel: 'К отгрузке',
    metrics: [
      { label: 'В пути', value: '18', href: '/brand/logistics' },
      { label: 'К отгрузке', value: '12', href: '/brand/b2b-orders' },
      { label: 'Задержки', value: '0', href: '/brand/logistics' },
    ],
    metrics7d: [
      { label: 'В пути за 7 дн.', value: '5', href: '/brand/logistics' },
      { label: 'К отгрузке за 7 дн.', value: '4', href: '/brand/b2b-orders' },
      { label: 'Задержки', value: '0', href: '/brand/logistics' },
    ],
    metrics30d: [
      { label: 'В пути за 30 дн.', value: '18', href: '/brand/logistics' },
      { label: 'К отгрузке за 30 дн.', value: '12', href: '/brand/b2b-orders' },
      { label: 'Задержки', value: '0', href: '/brand/logistics' },
    ],
  },
  {
    id: 'tasks-actions',
    title: 'Задачи и действия',
    titleLines: ['Задачи', 'и действия'],
    description: 'Открытые задачи по партнёрам, просроченные действия.',
    href: '/brand/team?tab=tasks',
    icon: CheckSquare,
    color: 'bg-emerald-500',
    changePct7d: 50,
    changePct30d: 14,
    alertCount: 2,
    alertCount7d: 1,
    alertCount30d: 2,
    alertTooltip: 'Просроченные задачи по партнёрам',
    addHref: '/brand/team?tab=tasks&action=new',
    addLabel: 'Добавить задачу',
    metrics: [
      { label: 'Открытых задач', value: '8', href: '/brand/team?tab=tasks' },
      { label: 'Просрочено', value: '2', href: '/brand/team?tab=tasks&overdue=1' },
      { label: 'По партнёрам', value: '6', href: '/brand/team?tab=tasks' },
    ],
    metrics7d: [
      { label: 'Задач за 7 дн.', value: '3', href: '/brand/team?tab=tasks' },
      { label: 'Просрочено за 7 дн.', value: '1', href: '/brand/team?tab=tasks&overdue=1' },
      { label: 'По партнёрам за 7 дн.', value: '2', href: '/brand/team?tab=tasks' },
    ],
    metrics30d: [
      { label: 'Задач за 30 дн.', value: '8', href: '/brand/team?tab=tasks' },
      { label: 'Просрочено за 30 дн.', value: '2', href: '/brand/team?tab=tasks&overdue=1' },
      { label: 'По партнёрам за 30 дн.', value: '6', href: '/brand/team?tab=tasks' },
    ],
  },
  {
    id: 'partner-analytics',
    title: 'Аналитика по партнёрам',
    titleLines: ['Аналитика', 'по партнёрам'],
    description: 'Топ по объёму, план/факт, доля в выручке по каналам.',
    href: '/brand/retailers',
    icon: TrendingUp,
    color: 'bg-accent-primary',
    changePct7d: 3,
    changePct30d: 12,
    addHref: '/brand/retailers',
    addLabel: 'Отчёт',
    metrics: [
      { label: 'Топ-10 партнёров', value: '—', href: '/brand/retailers' },
      { label: 'План/факт', value: '94%', href: '/brand/retailers' },
      { label: 'Рост за месяц', value: '+12%', href: '/brand/retailers' },
    ],
    metrics7d: [
      { label: 'Топ за 7 дн.', value: '—', href: '/brand/retailers' },
      { label: 'План/факт за 7 дн.', value: '96%', href: '/brand/retailers' },
      { label: 'Рост за 7 дн.', value: '+3%', href: '/brand/retailers' },
    ],
    metrics30d: [
      { label: 'Топ за 30 дн.', value: '—', href: '/brand/retailers' },
      { label: 'План/факт за 30 дн.', value: '94%', href: '/brand/retailers' },
      { label: 'Рост за 30 дн.', value: '+12%', href: '/brand/retailers' },
    ],
  },
];

export function mergePartnerEcosystemBlocksWithPatches(
  base: PartnerEcosystemBlock[],
  patchById: Record<string, PartnerEcosystemBlockApiPatch> | undefined
): PartnerEcosystemBlock[] {
  if (!patchById || Object.keys(patchById).length === 0) return base;
  return base.map((item) => {
    const p = patchById[item.id];
    if (!p) return item;
    return { ...item, ...p };
  });
}
