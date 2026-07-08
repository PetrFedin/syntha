import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { getShopB2BHubLinks, sanitizeEntityLinksForPlatformCore } from '@/lib/data/entity-links';
import {
  PLATFORM_CORE_ENTITY_LINK_HIDDEN_HREFS,
  platformCoreEntityLinkHiddenSet,
} from '@/lib/platform-core-entity-links-registry';
import { ROUTES } from '@/lib/routes';

describe('platform-core-entity-links-registry', () => {
  it('скрытые href — уникальный набор side-paths', () => {
    const hidden = platformCoreEntityLinkHiddenSet();
    expect(hidden.size).toBe(PLATFORM_CORE_ENTITY_LINK_HIDDEN_HREFS.length);
    expect(hidden.has(LEGACY_ROUTES.shop.b2bQuickOrder)).toBe(true);
    expect(hidden.has(ROUTES.brand.preOrders)).toBe(true);
    expect(hidden.has(LEGACY_ROUTES.shop.b2bDocuments)).toBe(true);
    expect(hidden.has(LEGACY_ROUTES.shop.b2bTenders)).toBe(true);
    expect(hidden.has(LEGACY_ROUTES.shop.b2bAssortmentPlanning)).toBe(true);
    expect(hidden.has(ROUTES.shop.b2bOrders)).toBe(false);
  });
});

describe('sanitizeEntityLinksForPlatformCore', () => {
  const prev = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prev;
  });

  it('переписывает catalog → витрина без SS27 в label', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const out = sanitizeEntityLinksForPlatformCore([
      { label: 'Каталог', href: LEGACY_ROUTES.shop.b2bCatalog },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.href).toContain('/shop/b2b/showroom');
    expect(out[0]?.label).toBe('Витрина · коллекции брендов');
    expect(out[0]?.label).not.toMatch(/SS27|Showroom/i);
  });

  it('getShopB2BHubLinks в core — RU без PG radar / B2B EN', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const links = getShopB2BHubLinks();
    const labels = links.map((l) => l.label).join('|');
    expect(labels).toContain('Мой кабинет');
    expect(labels).toContain('Оптовые заказы');
    expect(labels).not.toMatch(/PG radar|Заказы B2B|Showroom/i);
  });
});
