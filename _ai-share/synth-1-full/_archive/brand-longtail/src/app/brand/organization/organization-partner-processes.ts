/**
 * Процессы вкладки «Партнёрская экосистема» + merge с `partnerEcosystem.businessProcessesPatchById`.
 * Связь: `app/api/v1/endpoints/brand.py` → `partnerEcosystem` в дашборде бренда.
 */

import { ClipboardList, FileText, CheckSquare, RotateCcw, Truck, ShoppingCart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PartnerProcessItem {
  id: string;
  label: string;
  href: string;
  count7d: number;
  count30d: number;
  /** Прирост за 7 дн. в % (для отображения в правом верхнем углу) */
  changePct7d?: number;
  /** Прирост за 30 дн. в % */
  changePct30d?: number;
  sub: string;
  icon: LucideIcon;
  color: string;
  /** Описание для попапа по иконке вопроса */
  description?: string;
  /** Подсказки для попапа */
  tips?: string[];
  detailMetrics?: { label: string; value: string; href?: string }[];
  /** Ссылка на действие «добавить» (создать заказ, задачу и т.д.) */
  addHref?: string;
  /** Текст кнопки: Добавить, Создать заказ и т.д. */
  addLabel?: string;
}

export type PartnerProcessApiPatch = Partial<
  Pick<
    PartnerProcessItem,
    | 'label'
    | 'href'
    | 'count7d'
    | 'count30d'
    | 'changePct7d'
    | 'changePct30d'
    | 'sub'
    | 'description'
    | 'tips'
    | 'detailMetrics'
    | 'addHref'
    | 'addLabel'
  >
>;

export const PARTNER_BUSINESS_PROCESSES: PartnerProcessItem[] = [
  {
    id: 'b2b-orders',
    label: 'Заказы B2B',
    href: '/brand/b2b-orders',
    count7d: 6,
    count30d: 24,
    changePct7d: 20,
    changePct30d: 33,
    sub: 'в работе',
    icon: ClipboardList,
    color: 'bg-blue-500',
    description:
      'Заказы от партнёров: подтверждение, производство, отгрузка. Сводка по статусам за выбранный период.',
    tips: ['Подтверждайте заказы в срок', 'Следите за заказами в производстве'],
    addHref: '/brand/b2b-orders?action=new',
    addLabel: 'Создать заказ',
    detailMetrics: [
      { label: 'На подтверждении', value: '3', href: '/brand/b2b-orders?status=pending' },
      { label: 'В производстве', value: '5', href: '/brand/b2b-orders' },
    ],
  },
  {
    id: 'documents',
    label: 'Документы',
    href: '/brand/documents',
    count7d: 1,
    count30d: 2,
    changePct7d: 0,
    changePct30d: 100,
    sub: 'с партнёрами',
    icon: FileText,
    color: 'bg-text-secondary',
    description:
      'Договоры, спецификации, акты с партнёрами. Документы на подпись и истекающие в ближайшее время.',
    tips: ['Проверяйте срок действия договоров', 'Подписанные документы в ЭДО'],
    addHref: '/brand/documents?action=new',
    addLabel: 'Добавить',
    detailMetrics: [
      { label: 'На подпись', value: '2', href: '/brand/documents?status=pending' },
      { label: 'Истекают в 30 дн.', value: '5', href: '/brand/documents?expiring=30' },
    ],
  },
  {
    id: 'tasks',
    label: 'Задачи',
    href: '/brand/team?tab=tasks',
    count7d: 3,
    count30d: 8,
    changePct7d: 50,
    changePct30d: 14,
    sub: 'по партнёрам',
    icon: CheckSquare,
    color: 'bg-emerald-500',
    description:
      'Открытые задачи, привязанные к партнёрам. Просроченные и с дедлайном в выбранном периоде.',
    tips: ['Назначайте ответственных', 'Закрывайте просроченные'],
    addHref: '/brand/team?tab=tasks&action=new',
    addLabel: 'Добавить задачу',
    detailMetrics: [
      { label: 'Просрочено', value: '2', href: '/brand/team?tab=tasks&overdue=1' },
      { label: 'Открытых', value: '8', href: '/brand/team?tab=tasks' },
    ],
  },
  {
    id: 'returns',
    label: 'Возвраты',
    href: '/brand/returns-claims',
    count7d: 2,
    count30d: 5,
    changePct7d: -20,
    changePct30d: 25,
    sub: 'от партнёров',
    icon: RotateCcw,
    color: 'bg-amber-500',
    description:
      'Возвраты и рекламации от партнёров. Открытые заявки и инциденты качества за период.',
    tips: ['Обрабатывайте рекламации в срок', 'Фиксируйте причины возвратов'],
    addHref: '/brand/returns-claims?action=new',
    addLabel: 'Оформить возврат',
    detailMetrics: [
      { label: 'Открытых возвратов', value: '5', href: '/brand/returns-claims' },
      { label: 'Рекламаций за месяц', value: '2', href: '/brand/returns-claims' },
    ],
  },
  {
    id: 'shipments',
    label: 'Отгрузки',
    href: '/brand/b2b-orders',
    count7d: 4,
    count30d: 12,
    changePct7d: 33,
    changePct30d: 20,
    sub: 'к отгрузке',
    icon: Truck,
    color: 'bg-sky-500',
    description: 'Отгрузки партнёрам: в пути, к отгрузке, задержки. Данные за выбранный период.',
    tips: ['Отслеживайте трекинг', 'Планируйте отгрузки заранее'],
    addHref: '/brand/b2b-orders',
    addLabel: 'К отгрузке',
    detailMetrics: [
      { label: 'В пути', value: '18', href: '/brand/logistics' },
      { label: 'К отгрузке', value: '12', href: '/brand/b2b-orders' },
    ],
  },
  {
    id: 'auctions',
    label: 'Закупки',
    href: '/brand/auctions',
    count7d: 0,
    count30d: 0,
    sub: 'аукционы, поставщики',
    icon: ShoppingCart,
    color: 'bg-accent-primary/100',
    description: 'Аукционы и закупки у поставщиков. Активные торги и приглашения.',
    tips: ['Проверяйте условия поставщиков', 'Сравнивайте предложения'],
    addHref: '/brand/auctions?action=new',
    addLabel: 'Создать аукцион',
    detailMetrics: [{ label: 'Активных аукционов', value: '0', href: '/brand/auctions' }],
  },
];

export function mergePartnerBusinessProcessesWithPatches(
  base: PartnerProcessItem[],
  patchById: Record<string, PartnerProcessApiPatch> | undefined
): PartnerProcessItem[] {
  if (!patchById || Object.keys(patchById).length === 0) return base;
  return base.map((item) => {
    const p = patchById[item.id];
    if (!p) return item;
    return { ...item, ...p };
  });
}
