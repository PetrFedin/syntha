/**
 * Роли партнёрской экосистемы (supply / sales / platform): подписи, порядок карточек, виджеты-заготовки.
 * Патчи счётчиков приходят с бэка в `partnerEcosystem`; здесь — статический UX-слой.
 */

export type PartnerEcosystemRole = 'supply' | 'sales' | 'platform';

export const PARTNER_ROLE_LABELS: Record<PartnerEcosystemRole, string> = {
  supply: 'Цепочка поставок',
  sales: 'Каналы продаж',
  platform: 'Связь и интеграции',
};

/** Порядок карточек по ролям (слева направо, горизонтально) */
export const PARTNER_ROLE_ORDER: Record<PartnerEcosystemRole, string[]> = {
  supply: ['factories', 'suppliers'],
  sales: ['retailers', 'distributors'],
  platform: ['integrations'],
};

export interface PartnerRoleWidgetItem {
  label: string;
  value: string;
  href?: string;
}

export interface PartnerRoleWidget {
  title: string;
  summary?: string;
  items: PartnerRoleWidgetItem[];
  actions: { label: string; href: string }[];
  /** Доп. блок при раскрытии */
  expandLabel?: string;
  expandItems?: { label: string; href?: string }[];
}

export const PARTNER_ROLE_WIDGETS: Record<PartnerEcosystemRole, PartnerRoleWidget> = {
  supply: {
    title: 'В работе по цепочке',
    summary: 'Заказы, проверки, документы',
    items: [
      { label: 'Активных заказов', value: '5', href: '/brand/b2b-orders' },
      { label: 'Новых за период', value: '1', href: '/brand/factories' },
      { label: 'Договоров', value: '8', href: '/brand/documents' },
    ],
    actions: [
      { label: 'Добавить производство', href: '/brand/factories?action=new' },
      { label: 'Добавить поставщика', href: '/brand/materials?action=new' },
    ],
    expandLabel: 'Быстрые переходы',
    expandItems: [
      { label: 'Заказы на производство', href: '/brand/production' },
      { label: 'Закупки', href: '/brand/auctions' },
    ],
  },
  sales: {
    title: 'По каналам продаж',
    summary: 'Заказы, подтверждения, договоры',
    items: [
      { label: 'С заказами за 30 дн.', value: '89', href: '/brand/b2b-orders' },
      { label: 'Ожидают подтверждения', value: '3', href: '/brand/retailers?status=pending' },
      { label: 'Активных каналов', value: '14', href: '/brand/distributors' },
    ],
    actions: [
      { label: 'Пригласить магазин', href: '/brand/retailers?action=invite' },
      { label: 'Добавить дистрибутора', href: '/brand/distributors?action=new' },
    ],
    expandLabel: 'Быстрые переходы',
    expandItems: [
      { label: 'Заказы B2B', href: '/brand/b2b-orders' },
      { label: 'Возвраты от партнёров', href: '/brand/returns-claims' },
    ],
  },
  platform: {
    title: 'Подключения',
    summary: '3 из 9 активно',
    items: [
      { label: 'Активных', value: '3', href: '/brand/integrations' },
      { label: 'Доступно', value: '6', href: '/brand/integrations' },
    ],
    actions: [{ label: 'Подключить интеграцию', href: '/brand/integrations' }],
    expandLabel: 'Типы интеграций',
    expandItems: [
      { label: '1С', href: '/brand/integrations' },
      { label: 'ЭДО', href: '/brand/documents' },
      { label: 'Маркетплейсы', href: '/brand/integrations' },
    ],
  },
};
