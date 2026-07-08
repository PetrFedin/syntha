import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import {
  dedupeEntityLinksByHref,
  finalizeRelatedModuleLinks,
  getIntegrationsLinks,
  getShopB2BHubLinks,
} from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { SHOP_B2B_ORDERS_HUB_LABEL } from '@/lib/ui/b2b-registry-label';

describe('entity-links — RelatedModules / B2B shop hub (full contour)', () => {
  it('dedupeEntityLinksByHref merges legacy /shop/b2b-orders with canonical /shop/b2b/orders', () => {
    const links = [
      { label: SHOP_B2B_ORDERS_HUB_LABEL, href: ROUTES.shop.b2bOrdersLegacy! },
      { label: SHOP_B2B_ORDERS_HUB_LABEL, href: ROUTES.shop.b2bOrders! },
    ];
    const d = dedupeEntityLinksByHref(links);
    expect(d).toHaveLength(1);
    expect(d[0].href).toBe(ROUTES.shop.b2bOrders);
  });

  it('finalizeRelatedModuleLinks exposes at most one «B2B Заказы» hub label', () => {
    const links = [
      { label: SHOP_B2B_ORDERS_HUB_LABEL, href: ROUTES.shop.b2bOrdersLegacy! },
      { label: SHOP_B2B_ORDERS_HUB_LABEL, href: ROUTES.shop.b2bOrders! },
    ];
    const f = finalizeRelatedModuleLinks(links);
    expect(f.filter((l) => l.label === SHOP_B2B_ORDERS_HUB_LABEL)).toHaveLength(1);
  });

  it('getIntegrationsLinks + finalizeRelatedModuleLinks stays stable (no duplicate hub rows)', () => {
    const f = finalizeRelatedModuleLinks(getIntegrationsLinks());
    const hub = f.filter((l) => l.label === SHOP_B2B_ORDERS_HUB_LABEL);
    expect(hub.length).toBeLessThanOrEqual(1);
  });

  it('getShopB2BHubLinks in platform core returns ≤7 PG links without JOOR/NuOrder legacy', () => {
    const prev = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    try {
      const links = getShopB2BHubLinks();
      expect(links.length).toBeLessThanOrEqual(7);
      expect(links.length).toBeGreaterThanOrEqual(6);
      const hrefs = links.map((l) => l.href).join(' ');
      expect(hrefs).toContain(ROUTES.shop.b2bPartnersDiscover);
      expect(hrefs).not.toContain(LEGACY_ROUTES.shop.b2bDiscover);
      expect(hrefs).not.toContain(LEGACY_ROUTES.shop.b2bCatalog);
      expect(hrefs).not.toMatch(/joor|nuorder/i);
      const labels = links.map((l) => l.label).join(' ');
      expect(labels).not.toMatch(/JOOR|NuOrder/i);
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
      else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prev;
    }
  });
});
