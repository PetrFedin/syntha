/**
 * Регрессия: единая логика sidebar Platform Core (волна 17).
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC_ROOT = path.join(__dirname, '..', '..');

function readSrc(rel: string): string {
  return fs.readFileSync(path.join(SRC_ROOT, rel), 'utf8');
}

jest.mock('lucide-react', () => {
  const C = () => null;
  return new Proxy(
    { __esModule: true },
    {
      get: (_t, prop) => {
        if (prop === '__esModule') return true;
        return C;
      },
    }
  );
});

jest.mock('@/lib/cabinet-core-mode', () => ({
  isPlatformCoreMode: jest.fn(() => true),
}));

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { augmentBrandNavGroupsForCore } from '@/lib/brand-core-nav-augment';
import {
  augmentManufacturerNavForCoreCabinet,
  augmentShopNavForCoreCabinet,
  augmentSupplierNavForCoreCabinet,
} from '@/lib/platform-core-nav-augment';
import {
  BRAND_B2B_GROUP_LABEL,
  BRAND_DEVELOPMENT_GROUP_LABEL,
  BRAND_PIM_GROUP_LABEL,
  BRAND_PRODUCTION_GROUP_LABEL,
  LINESHEETS_LABEL,
  MATRIX_ORDER_LABEL,
  RETAILERS_LABEL,
  SHOWROOM_SHOP_LABEL,
  SHOP_B2B_GROUP_LABEL,
  SHOP_PARTNERS_GROUP_LABEL,
  SHOP_PIM_GROUP_LABEL,
  SUPPLIER_PIM_GROUP_LABEL,
} from '@/lib/platform-core-canonical-labels';

describe('platform core nav unify (wave 17)', () => {
  beforeEach(() => {
    (isPlatformCoreMode as jest.Mock).mockReturnValue(true);
  });

  it('brand pim: legacy catalog hidden, linesheets in pillar 2, not in b2b', () => {
    const groups = augmentBrandNavGroupsForCore([
      {
        id: 'pim',
        label: 'Товар',
        links: [
          { label: 'Товары', value: 'pim', href: '/brand/products', icon: null },
          { label: 'Коллекции', value: 'collections', href: '/brand/collections', icon: null },
          { label: 'B2B Шоурум', value: 'showroom', href: '/brand/showroom', icon: null },
        ],
      },
      {
        id: 'b2b',
        links: [{ label: 'Заказы B2B', value: 'orders', href: '/brand/b2b-orders', icon: null }],
      },
    ]);

    const pim = groups.find((g) => g.id === 'pim')!;
    expect(pim.label).toBe(BRAND_PIM_GROUP_LABEL);
    const values = pim.links!.map((l) => l.value);
    expect(values).not.toContain('pim');
    expect(values).not.toContain('collections');
    expect(values).toContain('linesheets-core');
    expect(pim.links!.find((l) => l.value === 'linesheets-core')?.label).toBe(LINESHEETS_LABEL);

    const b2b = groups.find((g) => g.id === 'b2b')!;
    expect(b2b.label).toBe(BRAND_B2B_GROUP_LABEL);
    expect(b2b.links!.some((l) => l.value === 'linesheets-core')).toBe(false);
    expect(b2b.links!.some((l) => l.value === 'retailers-core')).toBe(true);
    expect(b2b.links!.find((l) => l.value === 'orders')?.label).toBe('Реестр B2B');
  });

  it('brand group labels match hub pillar titles', () => {
    const groups = augmentBrandNavGroupsForCore([
      {
        id: 'development',
        label: 'Old',
        links: [{ label: 'W2', value: 'workshop2', href: '/brand/w2', icon: null }],
      },
      {
        id: 'production',
        links: [{ label: 'P', value: 'shop-floor', href: '/brand/p', icon: null }],
      },
      { id: 'comms', label: 'Old comms', links: [] },
    ]);
    expect(groups.find((g) => g.id === 'development')?.label).toBe(BRAND_DEVELOPMENT_GROUP_LABEL);
    expect(groups.find((g) => g.id === 'production')?.label).toBe(BRAND_PRODUCTION_GROUP_LABEL);
    expect(groups.find((g) => g.id === 'comms')?.label).toBe('Связь');
  });

  it('shop: flat showroom + matrix in pim, tracking in b2b, partners label', () => {
    const groups = augmentShopNavForCoreCabinet([
      {
        id: 'pim',
        label: 'Товар',
        links: [
          {
            label: 'Каталог опта',
            value: 'b2b-catalog',
            href: '/shop/b2b/catalog',
            icon: null,
            subsections: [{ label: 'Матрица', value: 'matrix', href: '/shop/b2b/matrix' }],
          },
          {
            label: 'Коллекции и план',
            value: 'collection-planning',
            href: '/shop/b2b/collection-terms',
            icon: null,
          },
          {
            label: 'Шоурум и презентации',
            value: 'showroom-suite',
            href: '/shop/b2b/showroom',
            icon: null,
          },
        ],
      },
      {
        id: 'b2b',
        links: [{ label: 'Заказы B2B', value: 'b2b-orders', href: '/shop/b2b/orders', icon: null }],
      },
    ]);

    const pim = groups.find((g) => g.id === 'pim')!;
    expect(pim.label).toBe(SHOP_PIM_GROUP_LABEL);
    expect(pim.links!.map((l) => l.value)).toEqual([
      'platform-core-cabinet',
      'showroom-core',
      'matrix-core',
    ]);
    expect(pim.links!.find((l) => l.value === 'showroom-core')?.label).toBe(SHOWROOM_SHOP_LABEL);
    expect(pim.links!.find((l) => l.value === 'matrix-core')?.label).toBe(MATRIX_ORDER_LABEL);

    const b2b = groups.find((g) => g.id === 'b2b')!;
    expect(b2b.label).toBe(SHOP_B2B_GROUP_LABEL);
    expect(b2b.links!.map((l) => l.value)).toEqual(['b2b-orders', 'b2b-tracking-core']);
    expect(b2b.links!.some((l) => l.value === 'showroom-core')).toBe(false);
  });

  it('shop partners: discover + apply only in core', () => {
    const groups = augmentShopNavForCoreCabinet([
      {
        id: 'partners',
        links: [
          {
            label: 'Партнёры',
            value: 'partner-funnel',
            href: '/shop/b2b/partners',
            icon: null,
            subsections: [
              { label: 'Discover', value: 'discover', href: '/shop/b2b/discover' },
              { label: 'Портфель', value: 'portfolio', href: '/shop/b2b/partners' },
            ],
          },
        ],
      },
    ]);
    const partners = groups.find((g) => g.id === 'partners')!;
    expect(partners.label).toBe(SHOP_PARTNERS_GROUP_LABEL);
    expect(partners.links!.map((l) => l.value)).toEqual([
      'partners-discover-core',
      'partners-apply-core',
    ]);
  });

  it('manufacturer production: handoff queue, orders, dossier flat links', () => {
    const groups = augmentManufacturerNavForCoreCabinet([
      {
        id: 'production',
        links: [
          {
            label: 'Производство',
            value: 'shop-floor',
            href: '/factory/production',
            icon: null,
            subsections: [{ label: 'Гант', value: 'gantt', href: '/gantt' }],
          },
        ],
      },
    ]);
    const production = groups.find((g) => g.id === 'production')!;
    const values = production.links!.map((l) => l.value);
    expect(values).toContain('platform-core-cabinet');
    expect(values).toContain('handoff-queue-core');
    expect(values).toContain('production-orders-core');
    expect(values).toContain('dossier-core');
    expect(values).not.toContain('gantt');
  });

  it('supplier pim: BOM + procurement flat links', () => {
    const groups = augmentSupplierNavForCoreCabinet([
      {
        id: 'pim',
        links: [
          {
            label: 'Материалы',
            value: 'materials-hub',
            href: '/factory/production/materials',
            icon: null,
            subsections: [{ label: 'RFQ', value: 'rfq', href: '/rfq' }],
          },
        ],
      },
    ]);
    const pim = groups.find((g) => g.id === 'pim')!;
    expect(pim.label).toBe(SUPPLIER_PIM_GROUP_LABEL);
    expect(pim.links!.map((l) => l.value)).toEqual([
      'platform-core-cabinet',
      'materials-bom-core',
      'materials-catalog-core',
      'materials-procurement-core',
    ]);
    const catalog = pim.links!.find((l) => l.value === 'materials-catalog-core')!;
    expect(catalog.href).toContain('/factory/supplier/core?pillar=order_production');
    expect(catalog.href).toContain('pcf=materials-catalog');
    expect((catalog as { testId?: string }).testId).toBe('supplier-sidebar-materials-catalog-nav');
  });

  it('supplier comms: RFQ inbox nav — отдельный маршрут, не alias messages', () => {
    const groups = augmentSupplierNavForCoreCabinet([
      {
        id: 'comms',
        links: [
          { label: 'Календарь', value: 'calendar', href: '/brand/calendar', icon: null },
          { label: 'Сообщения', value: 'messages', href: '/brand/messages', icon: null },
        ],
      },
    ]);
    const comms = groups.find((g) => g.id === 'comms')!;
    expect(comms.links!.map((l) => l.value)).toEqual(['messages', 'rfq-inbox-core', 'calendar']);
    const rfq = comms.links!.find((l) => l.value === 'rfq-inbox-core')!;
    expect(rfq.href).toContain('/factory/supplier/rfq-inbox');
    expect(rfq.href).not.toContain('feature=rfq');
    expect(rfq.label).toBe('Запросы цен');
    expect((rfq as { testId?: string }).testId).toBe('supplier-sidebar-rfq-inbox-nav');
    const messages = comms.links!.find((l) => l.value === 'messages')!;
    expect(messages.href).toContain('/factory/supplier/core?pillar=comms');
  });

  it('getRoleGoldenPathQuickLinks returns deduped workspace links for brand', () => {
    const { getRoleGoldenPathQuickLinks } = jest.requireActual('@/lib/platform-core-hub-matrix');
    const links = getRoleGoldenPathQuickLinks('brand', [
      'development',
      'sample_collection',
      'collection_order',
    ]);
    expect(links.length).toBeGreaterThan(0);
    expect(links.length).toBeLessThanOrEqual(6);
    const hrefs = links.map((l: { href: string }) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('brand: placeholder surfaces archived in core nav (analytics, collaborations)', () => {
    const prev = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    try {
      const { applyBrandNavPipeline, shouldHideNavArchiveCluster } =
        jest.requireActual<typeof import('@/lib/cabinet-core-mode')>('@/lib/cabinet-core-mode');
      const groups = applyBrandNavPipeline([
        { id: 'development', links: [] },
        {
          id: 'analytics',
          links: [{ label: 'Аналитика', value: 'analytics', href: '/brand/analytics', icon: null }],
        },
        {
          id: 'collaborations',
          links: [
            {
              label: 'Коллаборации',
              value: 'collaborations',
              href: '/brand/collaborations',
              icon: null,
            },
          ],
        },
      ]);
      expect(shouldHideNavArchiveCluster()).toBe(true);
      expect(groups.find((g) => g.id === 'analytics')?.clusterId).toBe('archive');
      expect(groups.find((g) => g.id === 'collaborations')?.clusterId).toBe('archive');
      expect(groups.find((g) => g.id === 'development')?.clusterId).toBe('syntha-cores');
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
      else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prev;
    }
  });

  it('pre-orders page redirects to b2b registry in platform core', () => {
    const page = readSrc('app/brand/pre-orders/page.tsx');
    expect(page).not.toContain("'use client'");
    expect(page).toContain('isPlatformCoreMode');
    expect(page).toContain('redirect');
    expect(page).toContain('ROUTES.brand.b2bOrders');
    expect(page).not.toContain('BrandPreOrdersCorePage');
  });

  it('core sidebar: archive groups stripped, cluster label unified', () => {
    const prev = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    try {
      const { filterNavGroupsForCoreSidebar, resolveSidebarClustersForCore } =
        jest.requireActual<typeof import('@/lib/cabinet-core-mode')>('@/lib/cabinet-core-mode');
      const { PLATFORM_CORE_SIDEBAR_CLUSTER_LABEL } = jest.requireActual<
        typeof import('@/lib/platform-core-canonical-labels')
      >('@/lib/platform-core-canonical-labels');

      const groups = filterNavGroupsForCoreSidebar([
        { id: 'production', clusterId: 'syntha-cores' },
        { id: 'overview', clusterId: 'archive' },
        { id: 'team', clusterId: 'archive' },
      ]);
      expect(groups.map((g) => g.id)).toEqual(['production']);

      const clusters = resolveSidebarClustersForCore();
      expect(clusters).toHaveLength(1);
      expect(clusters[0]?.label).toBe(PLATFORM_CORE_SIDEBAR_CLUSTER_LABEL);
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
      else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prev;
    }
  });

  it('supplier comms: messages → RFQ → calendar in core augment', () => {
    const groups = augmentSupplierNavForCoreCabinet([
      {
        id: 'comms',
        links: [
          { label: 'Календарь', value: 'calendar', href: '/cal', icon: null },
          { label: 'Сообщения', value: 'messages', href: '/msg', icon: null },
        ],
      },
    ]);
    const comms = groups.find((g) => g.id === 'comms')!;
    expect(comms.links!.map((l) => l.value)).toEqual(['messages', 'rfq-inbox-core', 'calendar']);
  });

  it('role nav reference matches augmented brand structure', () => {
    const { PLATFORM_CORE_BRAND_NAV } = jest.requireActual<
      typeof import('@/lib/platform-core-role-nav-reference')
    >('@/lib/platform-core-role-nav-reference');
    const groups = augmentBrandNavGroupsForCore([
      {
        id: 'development',
        links: [{ label: 'W2', value: 'workshop2', href: '/w2', icon: null }],
      },
      {
        id: 'pim',
        links: [
          { label: 'PIM', value: 'pim', href: '/p', icon: null },
          { label: 'Showroom', value: 'showroom', href: '/s', icon: null },
        ],
      },
      { id: 'b2b', links: [{ label: 'O', value: 'orders', href: '/o', icon: null }] },
      { id: 'production', links: [{ label: 'P', value: 'shop-floor', href: '/pf', icon: null }] },
      {
        id: 'comms',
        links: [
          { label: 'M', value: 'messages', href: '/m', icon: null },
          { label: 'C', value: 'calendar', href: '/c', icon: null },
        ],
      },
    ]);

    for (const groupId of PLATFORM_CORE_BRAND_NAV.groupOrder) {
      const spec = PLATFORM_CORE_BRAND_NAV.groups[groupId]!;
      const group = groups.find((g) => g.id === groupId)!;
      expect(group.label).toBe(spec.label);
    }
  });

  it('brand nav: demo collection on W2, linesheets, range, showroom', () => {
    const groups = augmentBrandNavGroupsForCore([
      {
        id: 'development',
        links: [{ label: 'W2', value: 'workshop2', href: '/brand/w2', icon: null }],
      },
      {
        id: 'pim',
        links: [{ label: 'Showroom', value: 'showroom', href: '/brand/showroom', icon: null }],
      },
    ]);
    const w2 = groups
      .find((g) => g.id === 'development')!
      .links!.find((l) => l.value === 'workshop2')!;
    expect(w2.href).toContain('/brand/core?pillar=development');
    expect(w2.href).toContain('collection=SS27');
    expect(w2.description).toMatch(/лайншит/i);

    const pim = groups.find((g) => g.id === 'pim')!;
    const linesheets = pim.links!.find((l) => l.value === 'linesheets-core')!;
    expect(linesheets.href).toContain('/brand/core?pillar=sample_collection');
    expect(linesheets.href).toContain('collection=SS27');
    const showroom = pim.links!.find((l) => l.value === 'showroom')!;
    expect(showroom.href).toContain('/brand/core?pillar=sample_collection');

    const range = groups
      .find((g) => g.id === 'development')!
      .links!.find((l) => l.value === 'range-planner')!;
    expect(range?.href).toContain('/brand/core?pillar=development');
  });
});
