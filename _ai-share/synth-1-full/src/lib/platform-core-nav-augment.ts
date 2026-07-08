import { Factory, FileText, Handshake, Inbox, LayoutGrid, Package, Truck } from 'lucide-react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  COMMS_GROUP_LABEL,
  MATRIX_ORDER_LABEL,
  MY_CABINET_LABEL,
  MFR_PRODUCTION_GROUP_LABEL,
  PLATFORM_CORE_CABINET_LEAD,
  SHOP_B2B_GROUP_LABEL,
  SHOP_PARTNERS_GROUP_LABEL,
  SHOP_PIM_GROUP_LABEL,
  SHOWROOM_SHOP_LABEL,
  SHOWROOM_SHOP_LEAD,
  SUPPLIER_PIM_GROUP_LABEL,
} from '@/lib/platform-core-canonical-labels';
import { PLATFORM_CORE_CABINET_NAV_VALUE } from '@/lib/platform-core-cabinet-chrome';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsCatalogHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import {
  platformCoreShopB2bNavHiddenSet,
  platformCoreShopLogisticsNavHiddenSet,
} from '@/lib/platform-core-side-paths-registry';
import { sortCommsNavLinksMessagesFirst } from '@/lib/platform-core-nav-comms-order';
import {
  factoryProductionDossierContextHref,
  factoryProductionOrdersOrderContextHref,
  factorySupplierCalendarB2bOrderContextHref,
  factorySupplierRfqInboxHref,
  ROUTES,
} from '@/lib/platform-core-routes';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

const coreShowroomHref = `${ROUTES.shop.b2bShowroom}?collection=${PLATFORM_CORE_DEMO.collectionId}`;
const coreMatrixHref = `${ROUTES.shop.b2bMatrix}?collection=${PLATFORM_CORE_DEMO.collectionId}`;

type NavSubsectionLike = {
  label: string;
  value: string;
  href: string;
};

type NavLinkLike = {
  label: string;
  value: string;
  href: string;
  icon: unknown;
  description?: string;
  subsections?: NavSubsectionLike[];
  quickActions?: Array<{ label: string; href: string; icon: unknown }>;
  testId?: string;
};

type NavGroupLike = {
  id: string;
  links?: NavLinkLike[];
};

/** Sidebar href → native core cabinet (STRICT-safe). */
export function withPlatformCoreNavHrefs<T extends NavGroupLike>(groups: readonly T[]): T[] {
  if (!isPlatformCoreMode()) return [...groups];
  return groups.map((g) => ({
    ...g,
    links: g.links?.map((l) => ({
      ...l,
      href: platformCoreUiHref(l.href, PLATFORM_CORE_DEMO),
      subsections: l.subsections?.map((s) => ({
        ...s,
        href: platformCoreUiHref(s.href, PLATFORM_CORE_DEMO),
      })),
      quickActions: l.quickActions?.map((qa) => ({
        ...qa,
        href: platformCoreUiHref(qa.href, PLATFORM_CORE_DEMO),
      })),
    })),
  })) as T[];
}

const SHOP_B2B_SUBSECTION_HIDDEN_IN_CORE = platformCoreShopB2bNavHiddenSet();
const SHOP_LOGISTICS_SUBSECTION_HIDDEN_IN_CORE = platformCoreShopLogisticsNavHiddenSet();

function filterShopNavForPlatformCore<T extends NavGroupLike>(groups: readonly T[]): T[] {
  return groups.map((g) => {
    if (!g.links) return g;

    if (g.id === 'partners') {
      return {
        ...g,
        label: SHOP_PARTNERS_GROUP_LABEL,
        links: [
          {
            label: 'Партнёры брендов',
            value: 'partners-discover-core',
            href: ROUTES.shop.b2bPartnersDiscover,
            icon: Handshake,
            description: 'Discover брендов и onboarding в цепочку опта.',
          },
          {
            label: 'Заявка на доступ',
            value: 'partners-apply-core',
            href: ROUTES.shop.b2bApply,
            icon: FileText,
            description: 'Запрос доступа к витрине бренда.',
          },
        ],
      } as T;
    }

    if (g.id === 'pim') {
      const cabinet = g.links.find((l) => l.value === PLATFORM_CORE_CABINET_NAV_VALUE);
      const catalog = g.links.find((l) => l.value === 'b2b-catalog');
      const showroomLink = {
        label: SHOWROOM_SHOP_LABEL,
        value: 'showroom-core',
        href: coreShowroomHref,
        icon: catalog?.icon ?? LayoutGrid,
        description: SHOWROOM_SHOP_LEAD,
      };
      const matrixLink = {
        label: MATRIX_ORDER_LABEL,
        value: 'matrix-core',
        href: coreMatrixHref,
        icon: LayoutGrid,
        description: 'Оптовый заказ внутри коллекции — столп «Оптовый заказ».',
      };
      const links = [...(cabinet ? [cabinet] : []), showroomLink, matrixLink];
      return { ...g, label: SHOP_PIM_GROUP_LABEL, links } as T;
    }

    if (g.id === 'b2b') {
      let links = g.links.map((link) => {
        if (link.value !== 'b2b-orders') {
          return {
            ...link,
            subsections: link.subsections?.filter(
              (s) => !SHOP_B2B_SUBSECTION_HIDDEN_IN_CORE.has(s.value)
            ),
          };
        }
        return {
          ...link,
          label: 'Реестр B2B',
          description: 'Оптовые заказы из PostgreSQL — реестр и статусы цепочки.',
          subsections: undefined,
        };
      });
      if (!links.some((l) => l.value === 'b2b-tracking-core')) {
        links = [
          ...links,
          {
            label: 'Трекинг',
            value: 'b2b-tracking-core',
            href: ROUTES.shop.b2bTracking,
            icon: Truck,
            description: 'Статус цепочки после отправки заказа.',
            subsections: undefined,
          },
        ];
      }
      return { ...g, label: SHOP_B2B_GROUP_LABEL, links } as T;
    }

    if (g.id === 'logistics') {
      return {
        ...g,
        links: g.links.map((link) => {
          if (link.value !== 'inventory' || !link.subsections) return link;
          const subsections = link.subsections.filter(
            (s) => !SHOP_LOGISTICS_SUBSECTION_HIDDEN_IN_CORE.has(s.value)
          );
          return {
            ...link,
            href: ROUTES.shop.b2bTracking,
            label: 'Отслеживание B2B',
            description: 'Статус цепочки и поставок по оптовым заказам.',
            subsections: subsections.length ? subsections : undefined,
          };
        }),
      } as T;
    }

    if (g.id === 'comms') {
      return {
        ...g,
        label: COMMS_GROUP_LABEL,
        links: sortCommsNavLinksMessagesFirst(
          g.links.map((link) => {
            if (link.value === 'calendar') {
              return {
                ...link,
                href: `${ROUTES.shop.b2bCalendar}?layers=orders,logistics`,
                description: 'События по оптовым заказам и поставкам.',
              };
            }
            return link;
          })
        ),
      } as T;
    }

    return g;
  });
}

function filterManufacturerNavForPlatformCore<T extends NavGroupLike>(groups: readonly T[]): T[] {
  return groups
    .filter((g) => g.id !== 'partners')
    .map((g) => {
      if (!g.links) return g;

      if (g.id === 'comms') {
        return {
          ...g,
          label: COMMS_GROUP_LABEL,
          links: sortCommsNavLinksMessagesFirst(
            g.links.map((link) => {
              if (link.value === 'calendar') {
                return {
                  ...link,
                  href: `${ROUTES.factory.productionCalendar}?role=manufacturer&layers=tasks,orders,production`,
                  description: 'Задачи, заказы и этапы производства — цех.',
                };
              }
              if (link.value === 'messages') {
                return {
                  ...link,
                  href: ROUTES.factory.messages,
                  description: 'Сообщения цеха и контекст по заказу.',
                };
              }
              return link;
            })
          ),
        } as T;
      }

      if (g.id === 'production') {
        const cabinet = g.links.find((l) => l.value === PLATFORM_CORE_CABINET_NAV_VALUE);
        const links = [
          ...(cabinet ? [cabinet] : []),
          {
            label: 'Очередь передачи',
            value: 'handoff-queue-core',
            href: factoryHandoffQueueHrefForDemo(PLATFORM_CORE_DEMO),
            icon: Factory,
            description: 'Передача подтверждённого заказа в производство.',
          },
          {
            label: 'Заказы цеха',
            value: 'production-orders-core',
            href: factoryProductionOrdersOrderContextHref(PLATFORM_CORE_DEMO.demoOrderId, {
              factoryId: PLATFORM_CORE_DEMO.factoryId,
            }),
            icon: Package,
            description: 'PO и серии цеха.',
          },
          {
            label: 'Досье',
            value: 'dossier-core',
            href: factoryProductionDossierContextHref(PLATFORM_CORE_DEMO.demoArticleId, {
              collectionId: PLATFORM_CORE_DEMO.collectionId,
              orderId: PLATFORM_CORE_DEMO.demoOrderId,
            }),
            icon: FileText,
            description: 'ТЗ артикула (read-only).',
          },
        ];
        return { ...g, label: MFR_PRODUCTION_GROUP_LABEL, links } as T;
      }

      return g;
    });
}

function filterSupplierNavForPlatformCore<T extends NavGroupLike>(groups: readonly T[]): T[] {
  return groups
    .filter((g) => g.id !== 'partners')
    .map((g) => {
      if (!g.links) return g;

      if (g.id === 'comms') {
        const calendarLink = g.links.find((l) => l.value === 'calendar');
        const messagesLink = g.links.find((l) => l.value === 'messages');
        const links = [
          ...(messagesLink
            ? [
                {
                  ...messagesLink,
                  href: ROUTES.factory.supplierMessages,
                  description: 'Сообщения и контекст по артикулу.',
                },
              ]
            : []),
          {
            label: 'Запросы цен',
            value: 'rfq-inbox-core',
            href: factorySupplierRfqInboxHref({
              collectionId: PLATFORM_CORE_DEMO.collectionId,
              articleId: PLATFORM_CORE_DEMO.demoArticleId,
            }),
            icon: Inbox,
            description: 'Входящие RFQ — отдельный маршрут, не alias сообщений.',
            testId: 'supplier-sidebar-rfq-inbox-nav',
          },
          ...(calendarLink
            ? [
                {
                  ...calendarLink,
                  href: factorySupplierCalendarB2bOrderContextHref(PLATFORM_CORE_DEMO.demoOrderId),
                  description: 'Поставки, заказы и логистика материалов.',
                },
              ]
            : []),
        ];
        return {
          ...g,
          label: COMMS_GROUP_LABEL,
          links: sortCommsNavLinksMessagesFirst(links),
        } as T;
      }

      if (g.id === 'pim') {
        const cabinet = g.links.find((l) => l.value === PLATFORM_CORE_CABINET_NAV_VALUE);
        const materialsHub = g.links.find((l) => l.value === 'materials-hub');
        const links = [
          ...(cabinet ? [cabinet] : []),
          {
            label: 'Материалы цеха',
            value: 'materials-bom-core',
            href: factoryMaterialsHrefForDemo(PLATFORM_CORE_DEMO),
            icon: materialsHub?.icon ?? Package,
            description: 'BOM из досье — спецификация материалов.',
          },
          {
            label: 'Каталог материалов',
            value: 'materials-catalog-core',
            href: factoryMaterialsCatalogHrefForDemo(PLATFORM_CORE_DEMO),
            icon: Package,
            description: 'Листинги и остатки материалов поставщика.',
            testId: 'supplier-sidebar-materials-catalog-nav',
          },
          {
            label: 'Закупка под PO',
            value: 'materials-procurement-core',
            href: factoryMaterialsProcurementHrefForDemo(PLATFORM_CORE_DEMO, { role: 'supplier' }),
            icon: Package,
            description: 'Закупка и PATCH materials_supplied под производственный заказ.',
          },
        ];
        return { ...g, label: SUPPLIER_PIM_GROUP_LABEL, links } as T;
      }

      if (g.id === 'logistics') {
        return {
          ...g,
          links: g.links.map((link) => {
            if (link.value === 'logistics-hub') {
              return {
                ...link,
                href: factorySupplierCalendarB2bOrderContextHref(PLATFORM_CORE_DEMO.demoOrderId),
                description: 'Логистика материалов (кабинет поставщика, не brand.logistics).',
              };
            }
            return link;
          }),
        } as T;
      }

      return g;
    });
}

const CORE_CABINET_LINK = {
  label: MY_CABINET_LABEL,
  value: PLATFORM_CORE_CABINET_NAV_VALUE,
  icon: LayoutGrid,
  description: PLATFORM_CORE_CABINET_LEAD,
} as const;

function prependCabinetLink<T extends NavGroupLike>(
  groups: readonly T[],
  groupId: string,
  href: string
): T[] {
  if (!isPlatformCoreMode()) return [...groups];
  return groups.map((g) => {
    if (g.id !== groupId || !g.links) return g;
    if (g.links.some((l) => l.value === CORE_CABINET_LINK.value)) return g;
    return {
      ...g,
      links: [{ ...CORE_CABINET_LINK, href }, ...g.links],
    } as T;
  });
}

export function augmentBrandNavForCoreCabinet<T extends NavGroupLike>(groups: readonly T[]): T[] {
  return withPlatformCoreNavHrefs(
    prependCabinetLink(groups, 'development', ROUTES.brand.coreCabinet)
  );
}

export function augmentShopNavForCoreCabinet<T extends NavGroupLike>(groups: readonly T[]): T[] {
  let out = prependCabinetLink(groups, 'pim', ROUTES.shop.coreCabinet);
  if (!isPlatformCoreMode()) return out;
  return withPlatformCoreNavHrefs(filterShopNavForPlatformCore(out));
}

export function augmentManufacturerNavForCoreCabinet<T extends NavGroupLike>(
  groups: readonly T[]
): T[] {
  let out = prependCabinetLink(groups, 'production', ROUTES.factory.productionCoreCabinet);
  if (!isPlatformCoreMode()) return out;
  return withPlatformCoreNavHrefs(filterManufacturerNavForPlatformCore(out));
}

export function augmentSupplierNavForCoreCabinet<T extends NavGroupLike>(
  groups: readonly T[]
): T[] {
  let out = prependCabinetLink(groups, 'pim', ROUTES.factory.supplierCoreCabinet);
  if (!isPlatformCoreMode()) return out;
  return withPlatformCoreNavHrefs(filterSupplierNavForPlatformCore(out));
}

/** Дистрибутор: те же фильтры partners/b2b, что у shop в core. */
export function augmentDistributorNavForCoreCabinet<T extends NavGroupLike>(
  groups: readonly T[]
): T[] {
  if (!isPlatformCoreMode()) return [...groups];
  return withPlatformCoreNavHrefs(filterShopNavForPlatformCore(groups));
}

type ShopOverviewItem = { href: string; label: string; desc: string; testId?: string };
type ShopOverviewSection = { title: string; items: ShopOverviewItem[] };
type HubTodayAction = { label: string; href: string; desc: string };

/** Дашборд `/shop` в core: только golden path, без mock side-paths. */
export function getShopCoreHubTodayActions(): HubTodayAction[] {
  return [
    { label: 'Мой кабинет', href: ROUTES.shop.coreCabinet, desc: 'Столпы цепочки' },
    {
      label: SHOWROOM_SHOP_LABEL,
      href: coreShowroomHref,
      desc: 'Коллекции брендов для опта',
    },
    { label: 'Оптовые заказы (B2B)', href: ROUTES.shop.b2bOrders, desc: 'Реестр из PostgreSQL' },
  ];
}

export function getShopCoreOverviewSections(): ShopOverviewSection[] {
  return [
    {
      title: 'Основная цепочка опта',
      items: [
        {
          href: ROUTES.shop.coreCabinet,
          label: 'Мой кабинет',
          desc: 'Столпы × роли',
          testId: 'shop-dashboard-core-cabinet-link',
        },
        {
          href: coreShowroomHref,
          label: SHOWROOM_SHOP_LABEL,
          desc: 'Коллекции брендов',
          testId: 'shop-dashboard-b2b-showroom-link',
        },
        {
          href: coreMatrixHref,
          label: MATRIX_ORDER_LABEL,
          desc: 'Оптовый заказ внутри коллекции',
          testId: 'shop-dashboard-b2b-matrix-link',
        },
        {
          href: ROUTES.shop.b2bOrders,
          label: 'Оптовые заказы (B2B)',
          desc: 'Статусы и цепочка',
          testId: 'shop-dashboard-b2b-orders-link',
        },
        {
          href: ROUTES.shop.b2bPartnersDiscover,
          label: 'Партнёры брендов',
          desc: 'Доступ и витрины',
          testId: 'shop-dashboard-b2b-discover-link',
        },
      ],
    },
    {
      title: 'Связь',
      items: [
        {
          href: ROUTES.shop.messages,
          label: 'Сообщения',
          desc: 'Чат по заказу и артикулу',
          testId: 'shop-dashboard-messages-link',
        },
        {
          href: `${ROUTES.shop.b2bCalendar}?layers=orders,logistics`,
          label: 'Календарь',
          desc: 'События по оптовым заказам и поставкам',
          testId: 'shop-dashboard-calendar-link',
        },
      ],
    },
  ];
}

type FactoryOverviewSection = { title: string; items: ShopOverviewItem[] };

export function getFactoryCoreManufacturerSections(): FactoryOverviewSection[] {
  return [
    {
      title: 'Производство',
      items: [
        {
          href: ROUTES.factory.productionCoreCabinet,
          label: 'Мой кабинет',
          desc: 'Столпы × роли',
        },
        {
          href: ROUTES.factory.production,
          label: 'Очередь цеха',
          desc: 'Передача подтверждённого заказа в производство',
        },
        {
          href: `/factory/production/dossier/${PLATFORM_CORE_DEMO.demoArticleId}`,
          label: `Досье · ${PLATFORM_CORE_DEMO.demoArticleId}`,
          desc: 'ТЗ артикула',
        },
        { href: ROUTES.factory.productionOrders, label: 'Заказы цеха', desc: 'PO и серии' },
      ],
    },
    {
      title: 'Связь',
      items: [
        {
          href: `${ROUTES.factory.productionCalendar}?role=manufacturer&layers=tasks,orders,production`,
          label: 'Календарь',
          desc: 'Этапы производства',
        },
        { href: ROUTES.factory.messages, label: 'Сообщения', desc: 'Чат по заказу и PO' },
      ],
    },
  ];
}

export function getFactoryCoreSupplierSections(): FactoryOverviewSection[] {
  return [
    {
      title: 'Поставщик',
      items: [
        {
          href: ROUTES.factory.supplierCoreCabinet,
          label: 'Мой кабинет',
          desc: 'Столпы × роли',
        },
        {
          href: factoryMaterialsHrefForDemo(PLATFORM_CORE_DEMO),
          label: 'Материалы цеха',
          desc: 'Спецификация (BOM) и закупка под PO',
        },
      ],
    },
    {
      title: 'Связь',
      items: [
        {
          href: factorySupplierCalendarB2bOrderContextHref(PLATFORM_CORE_DEMO.demoOrderId),
          label: 'Календарь',
          desc: 'Поставки и логистика',
        },
        {
          href: `${ROUTES.factory.messages}?role=supplier`,
          label: 'Сообщения',
          desc: 'Чат по артикулу и заказу',
        },
      ],
    },
  ];
}

export function getShopCoreRetailerB2bQuickSections(): ShopOverviewSection[] {
  return [
    {
      title: 'Заказы',
      items: [
        {
          href: coreMatrixHref,
          label: MATRIX_ORDER_LABEL,
          desc: 'Формирование оптового заказа',
        },
        { href: ROUTES.shop.b2bOrders, label: 'Реестр B2B', desc: 'PostgreSQL' },
        { href: ROUTES.shop.b2bTracking, label: 'Отслеживание', desc: 'Статус после отправки' },
      ],
    },
    {
      title: 'Коллекция',
      items: [
        {
          href: coreShowroomHref,
          label: SHOWROOM_SHOP_LABEL,
          desc: 'Презентация коллекции бренда',
        },
        {
          href: ROUTES.shop.b2bPartnersDiscover,
          label: 'Discover брендов',
          desc: 'Партнёры и доступ',
        },
      ],
    },
  ];
}
