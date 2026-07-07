/**
 * Статические подписи и демо-агрегаты хаба «Организация» (экосистема, виджет внимания).
 * При появлении данных с API — подменять в компонентах, не дублируя строки здесь без нужды.
 */

/** Ссылка на полный обзор экосистемы (отчёт, дашборд партнёров) */
export const PARTNERS_ECOSYSTEM_OVERVIEW_HREF = '/brand/retailers';

/** Короткие ссылки: где работать с партнёрами */
export const PARTNER_WORK_LINKS = [
  { label: 'Шоурум', href: '/brand/showroom', sub: 'байеры' },
  { label: 'Чаты', href: '/brand/messages', sub: 'сообщения с партнёрами' },
  { label: 'Команда', href: '/brand/team', sub: 'ответственные' },
] as const;

/** Табы секции «Партнёрская экосистема»: систематизация по смыслу */
export const PARTNER_ECOSYSTEM_TABS = [
  { id: 'overview', label: 'Обзор', desc: 'Сводка и быстрые переходы' },
  {
    id: 'by-type',
    label: 'Партнёры по типам',
    desc: 'Цепочка поставок, каналы продаж, интеграции',
  },
  {
    id: 'processes',
    label: 'Процессы и области',
    desc: 'Контракты, финансы, качество, логистика, задачи, аналитика',
  },
] as const;

export type PartnerEcosystemTabId = (typeof PARTNER_ECOSYSTEM_TABS)[number]['id'];

/** Описание виджета «Требуют внимания» для иконки вопроса */
export const ATTENTION_WIDGET_DESCRIPTION =
  'Партнёры с открытыми задачами, документами на подпись, просроченными платежами или требующие проверки. Число и список зависят от выбранного периода (7 или 30 дней).';

export const ATTENTION_WIDGET_TIPS = [
  'Проверяйте партнёров на проверке',
  'Закрывайте просроченные документы',
  'Реагируйте на алерты по партнёрам',
] as const;

/** Требуют внимания: количество и разбивка за период (демо до API) */
export const ATTENTION_BY_PERIOD: Record<
  '7d' | '30d',
  { total: number; items: { label: string; value: string; href: string }[] }
> = {
  '7d': {
    total: 2,
    items: [
      { label: 'Производства', value: '1', href: '/brand/factories?status=review' },
      { label: 'Магазины', value: '1', href: '/brand/retailers?status=pending' },
    ],
  },
  '30d': {
    total: 4,
    items: [
      { label: 'Производства', value: '1', href: '/brand/factories?status=review' },
      { label: 'Магазины', value: '3', href: '/brand/retailers?status=pending' },
    ],
  },
};
