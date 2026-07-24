import type { IconName } from '@/shared/ui';

export type WorkspaceSectionId =
  | 'campaigns'
  | 'collections'
  | 'showroom'
  | 'selections'
  | 'order-builder'
  | 'orders'
  | 'confirmation'
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
  readonly systemRole: string;
  readonly capabilities: readonly string[];
  readonly primaryActionLabel: string;
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
    id: 'campaigns',
    slug: 'campaigns',
    href: '/campaigns',
    label: 'Кампании',
    title: 'Коммерческие кампании',
    description: 'Сезонный контекст, цели, рынки, партнёры, окна продаж и правила, из которых начинается единый коммерческий процесс.',
    icon: 'calendar',
    primary: false,
    mobile: false,
    systemRole: 'Определяет сезонные границы и коммерческие правила для всех нижестоящих сущностей.',
    capabilities: ['Сезонный контекст', 'Коммерческие сроки', 'Рынки и партнёры'],
    primaryActionLabel: 'Перейти к коллекциям',
    lifecycleStage: 'Campaign',
    next: 'collections',
  },
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
    systemRole: 'Группирует готовый к продаже ассортимент внутри выбранной кампании.',
    capabilities: ['Ассортимент', 'Коммерческие атрибуты', 'Готовность к публикации'],
    primaryActionLabel: 'Перейти в showroom',
    lifecycleStage: 'Collection',
    previous: 'campaigns',
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
    systemRole: 'Публикует согласованную коллекцию для управляемого доступа партнёров.',
    capabilities: ['Публикация', 'Доступ партнёров', 'Коммерческая презентация'],
    primaryActionLabel: 'Начать выбор',
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
    systemRole: 'Фиксирует решение байера до появления обязательств по заказу.',
    capabilities: ['Shortlist', 'Бюджет', 'Размерный intent'],
    primaryActionLabel: 'Открыть Order Builder',
    lifecycleStage: 'Selection',
    previous: 'showroom',
    next: 'order-builder',
  },
  {
    id: 'order-builder',
    slug: 'order-builder',
    href: '/order-builder',
    label: 'Сборка заказа',
    title: 'Order Builder',
    description: 'Преобразование согласованного выбора в размерные сетки, количества, поставки, валюты и коммерческие условия.',
    icon: 'orders',
    primary: false,
    mobile: false,
    systemRole: 'Преобразует выбор в валидируемый черновик заказа без смешения сущностей.',
    capabilities: ['Размерные сетки', 'Количество', 'Проверка условий'],
    primaryActionLabel: 'Перейти к заказам',
    lifecycleStage: 'Order Builder',
    previous: 'selections',
    next: 'orders',
  },
  {
    id: 'orders',
    slug: 'orders',
    href: '/orders',
    label: 'Заказы',
    title: 'Заказы',
    description: 'Формализованные заказы, версии, коммерческие условия и единая история обязательств сторон.',
    icon: 'orders',
    primary: true,
    mobile: true,
    systemRole: 'Хранит версионированные коммерческие обязательства сторон.',
    capabilities: ['Версии заказа', 'Согласование', 'История изменений'],
    primaryActionLabel: 'Перейти к подтверждению',
    lifecycleStage: 'Order',
    previous: 'order-builder',
    next: 'confirmation',
  },
  {
    id: 'confirmation',
    slug: 'confirmation',
    href: '/confirmation',
    label: 'Подтверждение',
    title: 'Подтверждение заказа',
    description: 'Проверка расхождений, согласование финальной версии и фиксация подтверждённых обязательств без потери истории.',
    icon: 'check',
    primary: false,
    mobile: false,
    systemRole: 'Фиксирует согласованную версию заказа перед совместным исполнением.',
    capabilities: ['Проверка расхождений', 'Финальное согласование', 'Неизменяемый снимок'],
    primaryActionLabel: 'Открыть DealSpace',
    lifecycleStage: 'Confirmation',
    previous: 'orders',
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
    systemRole: 'Собирает решения, сообщения, файлы и сроки вокруг подтверждённой сделки.',
    capabilities: ['Контекстные сообщения', 'Документы', 'Решения и действия'],
    primaryActionLabel: 'Вернуться на dashboard',
    lifecycleStage: 'DealSpace',
    previous: 'confirmation',
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
    systemRole: 'Обеспечивает коммуникацию только в контексте исходной коммерческой сущности.',
    capabilities: ['Entity threads', 'Обратная ссылка', 'История обсуждения'],
    primaryActionLabel: 'Вернуться к исходной сущности',
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
    systemRole: 'Координирует сроки процесса и возвращает пользователя к исходной сущности события.',
    capabilities: ['События процесса', 'Сроки', 'Entity deep links'],
    primaryActionLabel: 'Открыть ближайшую стадию',
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
    systemRole: 'Показывает измерения единого коммерческого процесса без создания параллельных фактов.',
    capabilities: ['Sell-in', 'Конверсия lifecycle', 'Результативность партнёрств'],
    primaryActionLabel: 'Вернуться на dashboard',
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
    systemRole: 'Управляет workspace и организационными предпочтениями, не дублируя authorization.',
    capabilities: ['Организация', 'Участники', 'Параметры workspace'],
    primaryActionLabel: 'Вернуться на dashboard',
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
    systemRole: 'Объясняет текущую стадию, данные и безопасные следующие действия.',
    capabilities: ['Контекстная помощь', 'Правила данных', 'Навигация процесса'],
    primaryActionLabel: 'Вернуться на dashboard',
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
    systemRole: 'Доставляет события только с валидной точкой назначения в коммерческом контуре.',
    capabilities: ['Приоритет', 'Read state', 'Source entity links'],
    primaryActionLabel: 'Открыть исходную сущность',
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
    systemRole: 'Находит коммерческие сущности и всегда возвращает маршрут к результату.',
    capabilities: ['Единая модель результата', 'Тип сущности', 'Контекстный маршрут'],
    primaryActionLabel: 'Вернуться на dashboard',
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

export function getWorkspaceSection(slug: string): WorkspaceSection | undefined {
  return workspaceSections.find((section) => section.slug === slug);
}

export function getWorkspaceSectionById(id: WorkspaceSectionId): WorkspaceSection {
  const section = workspaceSections.find((item) => item.id === id);

  if (!section) {
    throw new Error(`Unknown workspace section: ${id}`);
  }

  return section;
}

export function isLifecycleSection(
  section: WorkspaceSection,
): section is WorkspaceSection & { readonly lifecycleStage: string } {
  return typeof section.lifecycleStage === 'string';
}

export function getPreviousWorkspaceSection(
  section: WorkspaceSection,
): WorkspaceSection | undefined {
  return section.previous ? getWorkspaceSectionById(section.previous) : undefined;
}

export function getNextWorkspaceSection(
  section: WorkspaceSection,
): WorkspaceSection | undefined {
  return section.next ? getWorkspaceSectionById(section.next) : undefined;
}

export const commercialLifecycle = workspaceSections.filter(isLifecycleSection);

function assertUnique(values: readonly string[], field: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`Workspace registry contains duplicate ${field}`);
  }
}

function validateWorkspaceRegistry(): void {
  assertUnique(workspaceSections.map(({ id }) => id), 'id');
  assertUnique(workspaceSections.map(({ slug }) => slug), 'slug');
  assertUnique(workspaceSections.map(({ href }) => href), 'href');

  if (commercialLifecycle.length !== 8) {
    throw new Error('Workspace lifecycle must contain exactly 8 stages');
  }

  for (const section of workspaceSections) {
    const previous = getPreviousWorkspaceSection(section);
    const next = getNextWorkspaceSection(section);

    if (previous && previous.next !== section.id) {
      throw new Error(`Workspace registry previous/next mismatch for ${section.id}`);
    }
    if (next && next.previous !== section.id) {
      throw new Error(`Workspace registry next/previous mismatch for ${section.id}`);
    }
  }

  const visited = new Set<WorkspaceSectionId>();
  let current: WorkspaceSection | undefined = commercialLifecycle[0];

  while (current) {
    if (visited.has(current.id)) {
      throw new Error(`Workspace lifecycle contains a cycle at ${current.id}`);
    }
    visited.add(current.id);
    current = getNextWorkspaceSection(current);
  }

  if (visited.size !== commercialLifecycle.length) {
    throw new Error('Workspace lifecycle contains disconnected stages');
  }
}

validateWorkspaceRegistry();
