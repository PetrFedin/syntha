import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import {
  buildPlatformCoreGoldenCrossRoleStops,
  buildPlatformCoreGoldenCrossRoleStopsForUi,
  goldenCrossRoleOrderId,
  isNativeGoldenCrossRoleHref,
} from '@/lib/platform-core-golden-cross-role-path';

describe('platform-core-golden-cross-role-path', () => {
  const demo = {
    collectionId: PLATFORM_CORE_DEMO.collectionId,
    demoOrderId: PLATFORM_CORE_DEMO.demoOrderId,
    demoArticleId: PLATFORM_CORE_DEMO.demoArticleId,
    factoryId: PLATFORM_CORE_DEMO.factoryId,
    factoryHubId: PLATFORM_CORE_DEMO.factoryHubId,
    productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
  };

  it('resolves demo orderId', () => {
    expect(goldenCrossRoleOrderId(demo)).toBe(PLATFORM_CORE_DEMO.demoOrderId);
  });

  it('builds native core hrefs with shared order for all stops', () => {
    const orderId = goldenCrossRoleOrderId(demo);
    const stops = buildPlatformCoreGoldenCrossRoleStops(demo);

    expect(stops.length).toBe(15);
    expect(stops.map((s) => s.roleId)).toEqual(
      expect.arrayContaining(['shop', 'brand', 'manufacturer', 'supplier'])
    );

    for (const stop of stops) {
      expect(isNativeGoldenCrossRoleHref(stop.href)).toBe(true);
      expect(stop.href).toContain(`section=${stop.sectionId}`);
      expect(stop.href).not.toMatch(/\/shop\/b2b\/|\/brand\/b2b-orders/);
      if (stop.roleId !== 'brand' || stop.pillarId !== 'development') {
        expect(stop.href).toContain(`order=${encodeURIComponent(orderId)}`);
      }
    }

    const dossier = stops.find((s) => s.sectionId === 'brand-dev-dossier');
    expect(dossier?.href).toContain(`article=${encodeURIComponent(demo.demoArticleId)}`);
  });

  it('baseline UI stops exclude manufacturer and supplier', () => {
    const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    const prevExt = process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    delete process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
    try {
      const uiStops = buildPlatformCoreGoldenCrossRoleStopsForUi(demo);
      expect(uiStops).toHaveLength(12);
      expect(uiStops.map((s) => s.roleId)).not.toEqual(
        expect.arrayContaining(['manufacturer', 'supplier'])
      );
    } finally {
      if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
      else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
      if (prevExt === undefined) delete process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
      else process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES = prevExt;
    }
  });

  it('brand spine: dev → linesheets → showroom', () => {
    const brandDev = buildPlatformCoreGoldenCrossRoleStops(demo)
      .filter(
        (s) =>
          s.roleId === 'brand' &&
          (s.pillarId === 'development' || s.pillarId === 'sample_collection')
      )
      .map((s) => s.sectionId);
    expect(brandDev).toEqual([
      'brand-dev-w2-hub',
      'brand-dev-dossier',
      'brand-sc-linesheets',
      'brand-sc-showroom',
    ]);
  });

  it('shop spine: matrix → checkout → registry → detail', () => {
    const shopIds = buildPlatformCoreGoldenCrossRoleStops(demo)
      .filter((s) => s.roleId === 'shop')
      .map((s) => s.sectionId);
    expect(shopIds).toEqual([
      'shop-sc-showroom',
      'shop-co-matrix',
      'shop-co-checkout',
      'shop-co-registry',
      'shop-co-detail',
    ]);
  });
});
