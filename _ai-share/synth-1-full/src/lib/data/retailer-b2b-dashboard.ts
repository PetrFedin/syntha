import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
/**
 * Быстрые ссылки B2B для кабинета ритейла (`/shop`).
 * Корень `/shop/b2b` редиректит на `/shop`; полный список — в сайдбаре.
 */
import { ROUTES } from '@/lib/routes';

export type RetailerB2bOverviewItem = { href: string; label: string; desc: string };
export type RetailerB2bOverviewSection = { title: string; items: RetailerB2bOverviewItem[] };

export const RETAILER_B2B_QUICK_LINK_SECTIONS: RetailerB2bOverviewSection[] = [
  {
    title: 'Заказы',
    items: [
      {
        href: LEGACY_ROUTES.shop.b2bWorkspaceMap,
        label: 'Карта процессов B2B',
        desc: 'Модули закупок и роли на одной схеме',
      },
      { href: ROUTES.shop.b2bCreateOrder, label: 'Создать заказ', desc: 'Новый оптовый заказ' },
      {
        href: LEGACY_ROUTES.shop.b2bOrderByCollection,
        label: 'Заказ по коллекции',
        desc: 'Подбор по коллекции',
      },
      { href: LEGACY_ROUTES.shop.b2bOrderDrafts, label: 'Черновики', desc: 'Сохранённые корзины' },
      { href: ROUTES.shop.b2bOrders, label: 'Список заказов', desc: 'Статусы и отгрузки' },
      { href: LEGACY_ROUTES.shop.b2bQuickOrder, label: 'Быстрый заказ', desc: 'По артикулам' },
    ],
  },
  {
    title: 'Каталог и партнёры',
    items: [
      { href: LEGACY_ROUTES.shop.b2bDiscover, label: 'Discover', desc: 'Поиск брендов' },
      { href: ROUTES.shop.b2bPartners, label: 'Партнёры', desc: 'Мои бренды' },
    ],
  },
  {
    title: 'Исполнение и закупки у поставщиков',
    items: [
      {
        href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard,
        label: 'Fulfillment',
        desc: 'SLA, обещание vs факт по отгрузкам',
      },
      { href: LEGACY_ROUTES.shop.b2bRfq, label: 'RFQ', desc: 'Котировки у фабрик и поставщиков' },
      { href: LEGACY_ROUTES.shop.b2bTenders, label: 'Тендеры', desc: 'Конкурентные закупки на площадке' },
      {
        href: ROUTES.shop.b2bSupplierDiscovery,
        label: 'Поиск поставщиков',
        desc: 'Каталог и матчинг под профиль закупок',
      },
    ],
  },
  {
    title: 'Финансы и условия',
    items: [
      { href: ROUTES.shop.b2bFinance, label: 'Финансы партнёра', desc: 'Оплаты и лимиты' },
      { href: LEGACY_ROUTES.shop.b2bPayment, label: 'Оплата заказов', desc: 'Инвойсы и счета' },
      {
        href: ROUTES.shop.b2bCollectionTerms,
        label: 'Условия по коллекциям',
        desc: 'Коммерческие условия',
      },
    ],
  },
  {
    title: 'Аналитика и маржа',
    items: [
      { href: ROUTES.shop.analytics, label: 'Розничная аналитика', desc: 'Продажи и спрос' },
      { href: ROUTES.shop.analyticsFootfall, label: 'Трафик по зонам', desc: 'Footfall по залу' },
      { href: LEGACY_ROUTES.shop.b2bAnalytics, label: 'Аналитика закупок', desc: 'KPI опта' },
      {
        href: ROUTES.shop.b2bOrderAnalytics,
        label: 'Аналитика по заказам',
        desc: 'Топ стилей и тренды',
      },
      { href: LEGACY_ROUTES.shop.b2bReports, label: 'Отчёты партнёра', desc: 'Экспорт и план/факт' },
      {
        href: LEGACY_ROUTES.shop.b2bMarginAnalysis,
        label: 'Хаб маржи',
        desc: 'Калькулятор, отчёт ASOS, landed cost',
      },
      {
        href: ROUTES.shop.b2bLandedCost,
        label: 'Landed cost',
        desc: 'Полная себестоимость поставки',
      },
    ],
  },
  {
    title: 'Поставки, контент и отчёты',
    items: [
      { href: LEGACY_ROUTES.shop.b2bDeliveryCalendar, label: 'Календарь поставок', desc: 'Окна отгрузки' },
      { href: ROUTES.shop.b2bShowroom, label: 'Виртуальный шоурум', desc: 'Онлайн-сессии' },
      { href: ROUTES.shop.b2bLookbookShare, label: 'Поделиться лукбуком', desc: 'B2B-шаринг' },
      { href: ROUTES.shop.b2bAcademy, label: 'Академия', desc: 'Обучение и база знаний' },
    ],
  },
];
