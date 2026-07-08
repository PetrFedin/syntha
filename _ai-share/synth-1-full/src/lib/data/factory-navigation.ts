'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

/**
 * Manufacturer / Supplier: столпы как у бренда (`FACTORY_MFR_CORE_GROUP_ORDER` / `FACTORY_SUP_CORE_GROUP_ORDER`).
 * Ядро уплотнено: один столбец «Производство» (операции, Гант, выработка, навыки, раскрой — в подразделах),
 * одна «Логистика и склад» вместо трёх строк; у поставщика — один столбец «Материалы и RFQ».
 * Группа `comms` — календарь (со слоями) + сообщения; см. `CROSS_ROLE_FLOWS.md`.
 */

import {
  LayoutDashboard,
  Factory,
  Package,
  FileCheck,
  Truck,
  PackageSearch,
  Layers,
  FileText,
  BarChart2,
  Calendar,
  Users,
  UserRound,
  Zap,
  MessageSquare,
  Database,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';

/** Производство: team → comms → partners → production → logistics (QC и прочее — архив). */
export const manufacturerNavGroups = [
  {
    id: 'overview',
    label: 'Обзор',
    icon: LayoutDashboard,
    clusterId: 'archive' as const,
    links: [
      {
        href: '/factory',
        value: 'dashboard',
        label: 'Дашборд',
        icon: LayoutDashboard,
        description: 'Обзор производства',
      },
    ],
  },
  {
    id: 'team',
    label: 'Команда',
    icon: UserRound,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: EXTENDED_ROUTES.factory.staff,
        value: 'team',
        label: 'Команда',
        icon: Users,
        description: 'Сотрудники цеха, роли и доступы',
      },
    ],
  },
  {
    id: 'comms',
    label: 'Связь',
    icon: MessageSquare,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: `${ROUTES.brand.calendar}?layers=tasks,orders,production`,
        value: 'calendar',
        label: 'Календарь',
        icon: Calendar,
        description: 'Задачи, заказы и этапы производства на одной шкале.',
      },
      {
        href: ROUTES.brand.messages,
        value: 'messages',
        label: 'Сообщения',
        icon: MessageSquare,
        description: 'Коммуникация',
      },
    ],
  },
  {
    id: 'partners',
    label: 'Партнёры',
    icon: Factory,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: EXTENDED_ROUTES.factory.production,
        value: 'factories',
        label: 'Партнёры и сеть',
        icon: Factory,
        description: 'Очередь цеха и субподряд — без реестра бренда.',
        subsections: [
          { href: EXTENDED_ROUTES.factory.production, label: 'Очередь цеха', value: 'factories-list' },
          {
            href: ROUTES.brand.productionSubcontractor,
            label: 'Субподряд',
            value: 'subcontractor',
          },
        ],
      },
    ],
  },
  {
    id: 'production',
    label: 'Производство',
    icon: Factory,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.brand.production,
        value: 'shop-floor',
        label: 'Производство',
        icon: Factory,
        description:
          'Цех и исполнение PO: операции, план (Гант), выработка, навыки, конфекция, раскрой — без отдельных строк в сайдбаре.',
        subsections: [
          { href: ROUTES.brand.productionOperations, label: 'Операции', value: 'operations' },
          { href: ROUTES.brand.productionGantt, label: 'Диаграмма Ганта', value: 'gantt' },
          {
            href: ROUTES.brand.productionDailyOutput,
            label: 'Дневная выработка',
            value: 'daily-output',
          },
          {
            href: ROUTES.brand.productionWorkerSkills,
            label: 'Навыки работников',
            value: 'worker-skills',
          },
          { href: ROUTES.brand.productionReadyMade, label: 'Готовый продукт', value: 'ready-made' },
          { href: ROUTES.brand.productionNesting, label: 'Раскрой (Nesting)', value: 'nesting' },
        ],
      },
    ],
  },
  {
    id: 'logistics',
    label: 'Логистика и остатки',
    icon: Truck,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.brand.logistics,
        value: 'logistics-hub',
        label: 'Логистика и склад',
        icon: Truck,
        description: 'Хаб перевозок и документов; склад и остатки — через подпункты.',
        subsections: [
          { href: ROUTES.brand.warehouse, label: 'Склад', value: 'warehouse' },
          { href: ROUTES.brand.inventory, label: 'Остатки', value: 'inventory' },
        ],
      },
    ],
  },
  {
    id: 'materials',
    label: 'Материалы',
    icon: Layers,
    clusterId: 'archive' as const,
    links: [
      {
        href: ROUTES.brand.materials,
        value: 'materials',
        label: 'Каталог материалов',
        icon: Layers,
        description: 'Материалы',
      },
      {
        href: ROUTES.brand.materialsReservation,
        value: 'reservation',
        label: 'Резервирование',
        icon: Package,
        description: 'Резерв материалов',
      },
      {
        href: ROUTES.brand.vmi,
        value: 'vmi',
        label: 'VMI',
        icon: Truck,
        description: 'Vendor Managed Inventory',
      },
    ],
  },
  {
    id: 'qc',
    label: 'Контроль качества',
    icon: FileCheck,
    clusterId: 'archive' as const,
    links: [
      {
        href: ROUTES.brand.compliance,
        value: 'compliance',
        label: 'Контроль качества',
        icon: FileCheck,
        description: 'Соответствие и стандарты',
      },
      {
        href: ROUTES.brand.productionQcApp,
        value: 'qc-app',
        label: 'QC App',
        icon: Zap,
        description: 'Мобильное приложение QC',
      },
      {
        href: ROUTES.brand.productionGoldSample,
        value: 'gold-sample',
        label: 'Золотой образец',
        icon: FileCheck,
        description: 'Эталон качества',
      },
      {
        href: ROUTES.brand.productionFitComments,
        value: 'fit-comments',
        label: 'Комментарии по посадке',
        icon: FileText,
        description: 'Фиды по фиту',
      },
      {
        href: ROUTES.brand.productionMilestonesVideo,
        value: 'milestones-video',
        label: 'Видео этапов',
        icon: Package,
        description: 'Документирование',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    icon: BarChart2,
    clusterId: 'archive' as const,
    links: [
      {
        href: ROUTES.brand.analytics,
        value: 'analytics',
        label: 'Аналитика',
        icon: BarChart2,
        description: 'Отчёты',
      },
    ],
  },
];

/** Поставщик: team → comms → partners → pim (материалы) → logistics. */
export const supplierNavGroups = [
  {
    id: 'overview',
    label: 'Обзор',
    icon: LayoutDashboard,
    clusterId: 'archive' as const,
    links: [
      {
        href: '/factory?role=supplier',
        value: 'dashboard',
        label: 'Дашборд',
        icon: LayoutDashboard,
        description: 'Обзор поставок',
      },
    ],
  },
  {
    id: 'team',
    label: 'Команда',
    icon: UserRound,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: EXTENDED_ROUTES.factory.staff,
        value: 'team',
        label: 'Команда',
        icon: Users,
        description: 'Сотрудники и доступы',
      },
    ],
  },
  {
    id: 'comms',
    label: 'Связь',
    icon: MessageSquare,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: `${ROUTES.brand.calendar}?layers=tasks,orders,logistics`,
        value: 'calendar',
        label: 'Календарь',
        icon: Calendar,
        description: 'Задачи, заказы и поставки — одна временная шкала.',
      },
      {
        href: ROUTES.brand.messages,
        value: 'messages',
        label: 'Сообщения',
        icon: MessageSquare,
        description: 'Коммуникация',
      },
    ],
  },
  {
    id: 'partners',
    label: 'Партнёры',
    icon: PackageSearch,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.brand.suppliers,
        value: 'suppliers',
        label: 'Партнёры',
        icon: PackageSearch,
        description: 'Сеть поставщиков и кооперация',
      },
    ],
  },
  {
    id: 'pim',
    label: 'Товар',
    icon: Database,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: EXTENDED_ROUTES.factory.productionCatalog,
        value: 'materials-catalog',
        label: 'Каталог материалов',
        icon: Layers,
        description: 'Листинги и остатки материалов поставщика (PG).',
      },
      {
        href: EXTENDED_ROUTES.factory.productionMaterials,
        value: 'materials-hub',
        label: 'BOM · спецификация',
        icon: Layers,
        description: 'Материалы из досье — RFQ и закупка.',
        subsections: [
          {
            href: EXTENDED_ROUTES.factory.productionMaterials,
            label: 'BOM из досье',
            value: 'materials-bom',
          },
          {
            href: EXTENDED_ROUTES.factory.productionCatalog,
            label: 'Каталог материалов',
            value: 'materials-catalog',
          },
          {
            href: EXTENDED_ROUTES.factory.productionMaterials,
            label: 'Закупка под PO',
            value: 'procurement',
          },
        ],
      },
    ],
  },
  {
    id: 'logistics',
    label: 'Логистика и остатки',
    icon: Truck,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.brand.logistics,
        value: 'logistics-hub',
        label: 'Логистика и склад',
        icon: Truck,
        description: 'Доставка и согласование поставок материалов.',
      },
    ],
  },
  {
    id: 'compliance',
    label: 'Контроль качества',
    icon: FileCheck,
    clusterId: 'archive' as const,
    links: [
      {
        href: ROUTES.brand.compliance,
        value: 'compliance',
        label: 'Соответствие требованиям',
        icon: FileCheck,
        description: 'Сертификаты, стандарты',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    icon: BarChart2,
    clusterId: 'archive' as const,
    links: [
      {
        href: ROUTES.brand.analytics,
        value: 'analytics',
        label: 'Аналитика',
        icon: BarChart2,
        description: 'Отчёты',
      },
    ],
  },
];
