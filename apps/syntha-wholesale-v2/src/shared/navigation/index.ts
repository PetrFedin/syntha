import type { IconName } from '@/shared/ui';

export type WorkspaceSectionId =
  | 'collections'
  | 'showroom'
  | 'selections'
  | 'orders'
  | 'dealspace'
  | 'messages'
  | 'calendar'
  | 'analytics'
  | 'settings'
  | 'help'
  | 'notifications'
  | 'search';

export interface WorkspaceSection {
  readonly id: WorkspaceSectionId;
  readonly slug: WorkspaceSectionId;
  readonly href: `/${WorkspaceSectionId}`;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly primary: boolean;
  readonly mobile: boolean;
  readonly lifecycleStage?: string;
  readonly previous?: WorkspaceSectionId;
  readonly next?: WorkspaceSectionId;
}

export interface WorkspaceNavigationItem {
  readonly id: 'home' | WorkspaceSectionId;
  readonly href: '/' | `/${WorkspaceSectionId}`;
  readonly label: string;
  readonly icon: IconName;
  readonly mobile: boolean;
}

export const workspaceSections: readonly WorkspaceSection[] = [
  {
    id: 'collections',
    slug: 'collections',
    href: '/collections',
    label: 'Коллекции',
    title: 'Коллекции',
    description: 'Единый источник ассортимента, коммерческих атрибутов, цен, материалов и готовности к публикации.',
    icon: 'collections',
    primary: true,
    mobile: true,
    lifecycleStage: 'Collection',
    next: 'showroom',
  },
  {
    id: 'showroom',
    slug: 'showroom',
    href: '/showroom',
    label: 'Шоурум',
    title: 'Digital Showroom',
    description: 'Публикация коллекций, управляемый доступ партнёров и единое представление коммерческого предложения.',
    icon: 'showroom',
    primary: true,
    mobile: true,
    lifecycleStage: 'Showroom',
    previous: 'collections',
    next: 'selections',
  },
  {
    id: 'selections',
    slug: 'selections',
    href: '/selections',
    label: 'Выбор',
    title: 'Рабочие выборы',
    description: 'Совместная работа байера и бренда с SKU, вариантами, размерами, комментариями и решениями.',
    icon: 'selection',
    primary: true,
    mobile: false,
    lifecycleStage: 'Selection',
    previous: 'showroom',
    next: 'orders',
  },
  {
    id: 'orders',
    slug: 'orders',
    href: '/orders',
    label: 'Заказы',
    title: 'Заказы',
    description: 'Размерные сетки, количества, коммерческие условия, версии и подтверждение обязательств сторон.',
    icon: 'orders',
    primary: true,
    mobile: true,
    lifecycleStage: 'Order Builder → Order → Confirmation',
    previous: 'selections',
    next: 'dealspace',
  },
  {
    id: 'dealspace',
    slug: 'dealspace',
    href: '/dealspace',
    label: 'DealSpace',
    title: 'DealSpace',
    description: 'Единое пространство сделки: сообщения, документы, решения, сроки и подтверждённая история изменений.',
    icon: 'messages',
    primary: false,
    mobile: false,
    lifecycleStage: 'DealSpace',
    previous: 'orders',
  },
  {
    id: 'messages',
    slug: 'messages',
    href: '/messages',
    label: 'Сообщения',
    title: 'Сообщения',
    description: 'Контекстная коммуникация, привязанная к коллекции, выбору, заказу или сделке, а не отдельный изолированный чат.',
    icon: 'messages',
    primary: true,
    mobile: true,
  },
  {
    id: 'calendar',
    slug: 'calendar',
    href: '/calendar',
    label: 'Календарь',
    title: 'Коммерческий календарь',
    description: 'Сроки кампаний, публикаций, выборов, подтверждений и обязательств в одном временном контуре.',
    icon: 'calendar',
    primary: true,
    mobile: false,
    lifecycleStage: 'Campaign',
    next: 'collections',
  },
  {
    id: 'analytics',
    slug: 'analytics',
    href: '/analytics',
    label: 'Аналитика',
    title: 'Аналитика',
    description: 'Единая система показателей по ассортименту, коммерческой активности, заказам и результативности партнёрств.',
    icon: 'analytics',
    primary: true,
    mobile: false,
  },
  {
    id: 'settings',
    slug: 'settings',
    href: '/settings',
    label: 'Настройки',
    title: 'Настройки workspace',
    description: 'Организация, участники, роли, уведомления и параметры рабочей среды без дублирования прав доступа.',
    icon: 'settings',
    primary: false,
    mobile: false,
  },
  {
    id: 'help',
    slug: 'help',
    href: '/help',
    label: 'Помощь',
    title: 'Помощь',
    description: 'Контекстная помощь по текущему процессу, правилам данных и действиям пользователя.',
    icon: 'help',
    primary: false,
    mobile: false,
  },
  {
    id: 'notifications',
    slug: 'notifications',
    href: '/notifications',
    label: 'Уведомления',
    title: 'Уведомления',
    description: 'Приоритетные события workspace с переходом к исходной сущности и без разрыва контекста.',
    icon: 'bell',
    primary: false,
    mobile: false,
  },
  {
    id: 'search',
    slug: 'search',
    href: '/search',
    label: 'Поиск',
    title: 'Глобальный поиск',
    description: 'Поиск по коллекциям, SKU, партнёрам, выборам, заказам и сделкам из одной точки входа.',
    icon: 'search',
    primary: false,
    mobile: false,
  },
] as const;

const dashboardNavigation: WorkspaceNavigationItem = {
  id: 'home',
  href: '/',
  label: 'Главная',
  icon: 'home',
  mobile: true,
};

export const workspaceNavigation: readonly WorkspaceNavigationItem[] = [
  dashboardNavigation,
  ...workspaceSections
    .filter((section) => section.primary)
    .map(({ id, href, label, icon, mobile }) => ({ id, href, label, icon, mobile })),
];

export const mobileWorkspaceNavigation = workspaceNavigation.filter((item) => item.mobile);

export const commercialLifecycle = [
  ['01', 'Campaign', 'Календарь сезона и коммерческий контекст'],
  ['02', 'Collection', 'Ассортимент, цены и материалы'],
  ['03', 'Showroom', 'Публикация и презентация байерам'],
  ['04', 'Selection', 'Рабочий выбор магазина'],
  ['05', 'Order Builder', 'Размерные сетки, количества и условия'],
  ['06', 'Order', 'Формализованный заказ и версии'],
  ['07', 'Confirmation', 'Согласование и фиксация обязательств'],
  ['08', 'DealSpace', 'Документы, сообщения и исполнение сделки'],
] as const;

export function getWorkspaceSection(slug: string): WorkspaceSection | undefined {
  return workspaceSections.find((section) => section.slug === slug);
}
