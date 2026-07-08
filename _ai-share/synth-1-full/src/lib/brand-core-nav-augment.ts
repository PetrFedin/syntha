import { FileText, Layers, Monitor, Target, Users } from 'lucide-react';
import { brandB2bOrdersAwaitingHandoffRegistryHref, ROUTES } from '@/lib/routes';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { brandLinesheetsHrefForDemo } from '@/lib/platform-core-hub-matrix-demo-hrefs';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';
import {
  BRAND_B2B_GROUP_LABEL,
  BRAND_DEVELOPMENT_GROUP_LABEL,
  BRAND_PIM_GROUP_LABEL,
  BRAND_PRODUCTION_GROUP_LABEL,
  COMMS_GROUP_LABEL,
  LINESHEETS_LABEL,
  LINESHEETS_LEAD,
  RETAILERS_LABEL,
  SHOWROOM_BRAND_LABEL,
  SHOWROOM_BRAND_LEAD,
  W2_WORKSPACE_LABEL,
  W2_WORKSPACE_LEAD,
} from '@/lib/platform-core-canonical-labels';
import { sortCommsNavLinksMessagesFirst } from '@/lib/platform-core-nav-comms-order';
import { withPlatformCoreNavHrefs } from '@/lib/platform-core-nav-augment';

type NavLinkLike = {
  label: string;
  value: string;
  href: string;
  icon: unknown;
  description?: string;
  subsections?: Array<{ label: string; value: string; href: string }>;
  quickActions?: Array<{ label: string; href: string; icon: unknown }>;
};

type NavGroupLike = {
  id: string;
  label?: string;
  links?: NavLinkLike[];
};

const factoryHubHref = `/brand/factories/${PLATFORM_CORE_DEMO.factoryHubId}`;
const brandHandoffHref = brandB2bOrdersAwaitingHandoffRegistryHref();
const brandLinesheetsHref = brandLinesheetsHrefForDemo(PLATFORM_CORE_DEMO);
const brandShowroomHref = `${ROUTES.brand.showroom}?collection=${encodeURIComponent(PLATFORM_CORE_DEMO.collectionId)}`;
const brandW2Href = `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${encodeURIComponent(PLATFORM_CORE_DEMO.collectionId)}`;
const brandRangePlannerHref = `${ROUTES.brand.rangePlanner}?collection=${encodeURIComponent(PLATFORM_CORE_DEMO.collectionId)}`;

function isBrandFactoryF1Href(href: string): boolean {
  return href.includes('/brand/factories/') || href === ROUTES.brand.factories;
}

/** JOOR / buyer-mirror mock — вне golden path (guard редиректит, в nav не показываем). */
const BRAND_CORE_HIDDEN_LINK_VALUES = new Set([
  'shop-discover',
  'shop-b2b-payment',
  'shop-passport',
  'shop-b2b-map',
  'retail-b2b-map',
  'brand-trade-shows',
  'shop-b2b-trade-shows',
  'shop-b2b-trade-appointments',
  'shop-b2b-apply',
  'shop-fulfillment',
  'shop-rfq',
  'shop-tenders',
  'shop-supplier-discovery',
  'buyer-applications',
  'bopis',
  'brand-suppliers-rfq',
]);

/** Legacy PIM в core: каталог и сезонные подборки — в W2 и лайншитах. */
const BRAND_CORE_PIM_HIDDEN_LINK_VALUES = new Set(['pim', 'collections']);

const BRAND_CORE_HIDDEN_QUICK_ACTION_HREFS = new Set<string>([
  ROUTES.brand.preOrders,
  ROUTES.brand.collections,
  factoryHubHref,
  ROUTES.brand.factories,
  ROUTES.brand.production,
]);

function stripBrandNavLinkForCore<T extends NavLinkLike>(link: T): T {
  let next = link;
  if (link.quickActions?.length) {
    const quickActions = link.quickActions.filter(
      (qa) =>
        !BRAND_CORE_HIDDEN_QUICK_ACTION_HREFS.has(qa.href) &&
        !isBrandFactoryF1Href(qa.href) &&
        !/Фабрика · f1|fact-1/i.test(qa.label)
    );
    if (quickActions.length !== link.quickActions.length) {
      next = { ...next, quickActions: quickActions.length ? quickActions : undefined };
    }
  }
  if (link.subsections?.length) {
    const subsections = link.subsections.filter(
      (s) =>
        !BRAND_CORE_HIDDEN_QUICK_ACTION_HREFS.has(s.href) &&
        !BRAND_CORE_HIDDEN_LINK_VALUES.has(s.value)
    );
    if (subsections.length !== link.subsections.length) {
      next = { ...next, subsections: subsections.length ? subsections : undefined };
    }
  }
  return next;
}

/** Доп. пункты меню для встроенных блоков (Range Planner, Materials) — только client nav. */
export function augmentBrandNavGroupsForCore<T extends NavGroupLike>(groups: readonly T[]): T[] {
  if (!isPlatformCoreMode()) return [...groups];
  const out = groups.map((g) => {
    if (g.links) {
      const filtered = g.links
        .filter((l) => !BRAND_CORE_HIDDEN_LINK_VALUES.has(l.value))
        .map((l) => stripBrandNavLinkForCore(l));
      g = { ...g, links: filtered } as T;
    }
    if (g.id === 'development' && g.links) {
      let links = g.links.map((l) => {
        const stripped = stripBrandNavLinkForCore(l);
        if (l.value !== 'workshop2') return stripped;
        return {
          ...stripped,
          label: W2_WORKSPACE_LABEL,
          href: brandW2Href,
          description: W2_WORKSPACE_LEAD,
        };
      });
      const hasRange = links.some((l) => l.value === 'range-planner');
      if (!hasRange) {
        links = [
          ...links,
          {
            label: 'План ассортимента',
            value: 'range-planner',
            icon: Target,
            href: brandRangePlannerHref,
            description: 'Range planner до создания артикула в Workshop2.',
          },
        ];
      }
      return { ...g, label: BRAND_DEVELOPMENT_GROUP_LABEL, links } as T;
    }
    if (g.id === 'pim' && g.links) {
      let links = g.links
        .filter((l) => !BRAND_CORE_PIM_HIDDEN_LINK_VALUES.has(l.value))
        .map((l) => {
          if (l.value === 'showroom') {
            return {
              ...stripBrandNavLinkForCore(l),
              label: SHOWROOM_BRAND_LABEL,
              href: brandShowroomHref,
              description: SHOWROOM_BRAND_LEAD,
              subsections: undefined,
              quickActions: undefined,
            };
          }
          return stripBrandNavLinkForCore(l);
        });
      const hasLinesheets = links.some((l) => l.value === 'linesheets-core');
      if (!hasLinesheets) {
        links = [
          {
            label: LINESHEETS_LABEL,
            value: 'linesheets-core',
            icon: FileText,
            href: brandLinesheetsHref,
            description: LINESHEETS_LEAD,
          },
          ...links,
        ];
      }
      return { ...g, label: BRAND_PIM_GROUP_LABEL, links } as T;
    }
    if (g.id === 'b2b' && g.links) {
      let links = g.links.map((l) => {
        if (l.value !== 'orders') return stripBrandNavLinkForCore(l);
        return {
          ...stripBrandNavLinkForCore(l),
          label: 'Реестр B2B',
          description: 'Operational orders PG: confirm → handoff в цех.',
        };
      });
      if (!links.some((l) => l.value === 'retailers-core')) {
        links = [
          ...links,
          {
            label: RETAILERS_LABEL,
            value: 'retailers-core',
            icon: Users,
            href: ROUTES.brand.retailers,
            description: 'Партнёры опта: доступ магазинов к витрине и заказам.',
          },
        ];
      }
      return { ...g, label: BRAND_B2B_GROUP_LABEL, links } as T;
    }
    if (g.id === 'production' && g.links) {
      let links = g.links.map((l) => {
        if (l.value !== 'shop-floor') return l;
        return {
          ...stripBrandNavLinkForCore(l),
          href: brandHandoffHref,
          label: 'Подтверждение → цех',
          description: 'Принять B2B-заказ и передать производству с контекстом досье.',
          subsections: undefined,
          quickActions: l.quickActions?.filter(
            (qa) =>
              qa.href !== ROUTES.brand.productsMatrix &&
              !BRAND_CORE_HIDDEN_QUICK_ACTION_HREFS.has(qa.href) &&
              !isBrandFactoryF1Href(qa.href)
          ),
        };
      });
      const hasMaterials = links.some((l) => l.value === 'materials-core');
      if (!hasMaterials) {
        links = [
          ...links,
          {
            label: 'Материалы',
            value: 'materials-core',
            icon: Layers,
            href: ROUTES.brand.materials,
            description: 'Библиотека материалов для BOM в досье.',
          },
        ];
      }
      return { ...g, label: BRAND_PRODUCTION_GROUP_LABEL, links } as T;
    }
    if (g.id === 'comms') {
      const links = (g.links ?? []).map((l) => {
        if (l.value === 'messages') {
          return {
            ...l,
            description: 'Контекстные треды по заказу и артикулу W2.',
          };
        }
        if (l.value === 'calendar') {
          return {
            ...l,
            description: 'Задачи, заказы и этапы производства.',
          };
        }
        return l;
      });
      return {
        ...g,
        label: COMMS_GROUP_LABEL,
        links: sortCommsNavLinksMessagesFirst(links),
      } as T;
    }
    return g;
  });
  return withPlatformCoreNavHrefs(out);
}
