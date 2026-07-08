import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
/**
 * Куда «относится» B2B-функционал в иерархии кабинетов и с кем стык.
 * Раньше рендерилось на `/shop/b2b` (сейчас корень редиректит на `/shop`); данные можно использовать в админке/доках.
 * Якоря shop: `buildShopCabinetAnchors()` — группы из `SHOP_B2B_HUB_GROUP_IDS` в `shop-navigation-normalized.ts`
 * (ритейл + столпы опта + «Опт: дополнительно» + аналитика). Brand: `buildBrandCabinetAnchors()`.
 */
import { ROUTES } from '@/lib/routes';
import {
  buildBrandCabinetAnchors,
  buildShopCabinetAnchors,
} from '@/lib/data/cabinet-matrix-anchors';

export type CabinetProfileId = 'shop' | 'brand' | 'distributor' | 'factory' | 'admin' | 'client';

export type CabinetB2bRoutingRow = {
  id: CabinetProfileId;
  title: string;
  blurb: string;
  homeHref: string;
  /** Типовые входы в B2B/смежные процессы из этого кабинета. */
  anchors: { label: string; href: string }[];
  /** Handoff: открыть связанный контур другой роли. */
  peers: { label: string; href: string }[];
};

export const CABINET_B2B_ROUTING_MATRIX: CabinetB2bRoutingRow[] = [
  {
    id: 'shop',
    title: 'Кабинет магазина (байер / ритейлер)',
    blurb:
      'Основной владелец сценариев Discover, матрицы, оплат, fulfillment и розницы. Список якорей = ссылки из групп хаба B2B (`SHOP_B2B_HUB_GROUP_IDS`: ритейл, partners→pim→b2b→logistics, расширенный опт, аналитика), не путать с узким набором столпов сайдбара `SHOP_B2B_NAV_GROUP_IDS`.',
    homeHref: ROUTES.shop.home,
    anchors: buildShopCabinetAnchors(),
    peers: [
      { label: 'Реестр B2B заказов (бренд)', href: ROUTES.brand.b2bOrders },
      { label: 'Выставки (бренд)', href: LEGACY_ROUTES.brand.tradeShows },
      { label: 'Кабинет дистрибутора', href: ROUTES.distributor.home },
      { label: 'Админ: мосты B2B', href: ROUTES.admin.home },
    ],
  },
  {
    id: 'brand',
    title: 'Кабинет бренда',
    blurb:
      'Владелец лайншитов, апрува заказов, выставок и контента для байеров. После расформирования часть перейдёт в производственный/платформенный контур. Список ниже — все верхнеуровневые пункты brandNavGroups.',
    homeHref: ROUTES.brand.home,
    anchors: buildBrandCabinetAnchors(),
    peers: [
      { label: 'Discover (ритейл)', href: LEGACY_ROUTES.shop.b2bDiscover },
      { label: 'Заказы байера', href: ROUTES.shop.b2bOrders },
      { label: 'Загрузка остатков ритейла', href: ROUTES.shop.inventory },
      { label: 'Производство', href: ROUTES.brand.production },
    ],
  },
  {
    id: 'distributor',
    title: 'Кабинет дистрибутора',
    blurb:
      'Те же оптовые сценарии, что у байера, но в отдельном UX-слое; ссылки ведут на общие экраны `/shop/b2b/*` до выделения префикса.',
    homeHref: ROUTES.distributor.home,
    anchors: [
      { label: 'Дашборд DIST', href: ROUTES.distributor.home },
      { label: 'B2B заказы', href: ROUTES.shop.b2bOrders },
      { label: 'Каталог', href: LEGACY_ROUTES.shop.b2bCatalog },
      { label: 'Карта процессов', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
    ],
    peers: [
      { label: 'Ритейл-центр', href: ROUTES.shop.home },
      { label: 'Бренд: контракты', href: ROUTES.brand.documents },
    ],
  },
  {
    id: 'factory',
    title: 'Производство / поставщик',
    blurb:
      'Исполнение, QC, материалы и RFQ; стыкуется с заказами бренда и загрузкой остатков у ритейлера.',
    homeHref: EXTENDED_ROUTES.factory.production,
    anchors: [
      { label: 'Хаб factory', href: EXTENDED_ROUTES.factory.production },
      { label: 'Production (бренд)', href: ROUTES.brand.production },
      { label: 'Supplier RFQ', href: ROUTES.brand.suppliersRfq },
      { label: 'Поиск поставщиков (ритейл)', href: ROUTES.shop.b2bSupplierDiscovery },
    ],
    peers: [
      { label: 'Матрица бренда', href: ROUTES.brand.inventory },
      { label: 'Склад ритейла', href: ROUTES.shop.inventory },
    ],
  },
  {
    id: 'admin',
    title: 'Платформа (админ)',
    blurb:
      'Наблюдение и мосты между контурами: тендеры, RFQ, fulfillment, маркетплейс без замены кабинетов ролей.',
    homeHref: ROUTES.admin.home,
    anchors: [
      { label: 'Админ', href: ROUTES.admin.home },
      { label: 'Discover (контроль)', href: LEGACY_ROUTES.shop.b2bDiscover },
      { label: 'Карта B2B', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
      { label: 'RFQ', href: LEGACY_ROUTES.shop.b2bRfq },
      { label: 'Тендеры', href: LEGACY_ROUTES.shop.b2bTenders },
      { label: 'Fulfillment', href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard },
    ],
    peers: [
      { label: 'Ритейл', href: ROUTES.shop.home },
      { label: 'Бренд', href: ROUTES.brand.home },
      { label: 'Дистрибутор', href: ROUTES.distributor.home },
    ],
  },
  {
    id: 'client',
    title: 'Клиентский кабинет',
    blurb:
      'B2C-покупки и сервис; смежность с магазином (наличие, выдача, маркетинг бренда на витрине).',
    homeHref: ROUTES.client.home,
    anchors: [
      { label: 'Кабинет клиента', href: ROUTES.client.home },
      { label: 'Каталог', href: ROUTES.client.catalog },
      { label: 'Заказы', href: ROUTES.client.orders },
    ],
    peers: [
      { label: 'Ритейл-центр', href: ROUTES.shop.home },
      { label: 'Розничные заказы', href: ROUTES.shop.orders },
    ],
  },
];

/** Профиль-владелец URL под `/shop/b2b` (эвристика для будущих редиректов). */
export function cabinetOwnerForShopB2bPath(pathname: string): CabinetProfileId {
  const p = pathname.replace(/\/$/, '') || '/';
  if (!p.startsWith('/shop/b2b')) return 'shop';
  if (p.includes('/supplier-discovery') || p.includes('/rfq') || p.includes('/tenders'))
    return 'admin';
  if (p.includes('/fulfillment')) return 'factory';
  return 'shop';
}
