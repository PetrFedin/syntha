import { buildPillarRegistryCrossLinks } from '@/lib/pillar-cross-links';
import { getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';

describe('pillar-cross-links', () => {
  it('returns brand CO integration links for active order', () => {
    const demo = getPlatformCoreDemo('SS27');
    const links = buildPillarRegistryCrossLinks('brand', 'collection_order', demo);
    expect(links.length).toBeGreaterThan(0);
    expect(links.some((l) => l.id === 'brand-co-shop-matrix')).toBe(true);
  });

  it('returns shop CO matrix link', () => {
    const demo = getPlatformCoreDemo('SS27');
    const links = buildPillarRegistryCrossLinks('shop', 'collection_order', demo);
    expect(links.some((l) => l.id === 'shop-co-matrix')).toBe(true);
  });

  it('returns brand OP handoff links', () => {
    const demo = getPlatformCoreDemo('SS27');
    const links = buildPillarRegistryCrossLinks('brand', 'order_production', demo);
    expect(links.some((l) => l.id === 'brand-op-handoff')).toBe(true);
  });

  it('returns brand dev W2 and planner links', () => {
    const demo = getPlatformCoreDemo('SS27');
    const links = buildPillarRegistryCrossLinks('brand', 'development', demo);
    expect(links.some((l) => l.id === 'brand-dev-w2')).toBe(true);
    expect(links.some((l) => l.id === 'brand-dev-planner')).toBe(true);
  });

  it('returns manufacturer OP handoff queue', () => {
    const demo = getPlatformCoreDemo('SS27');
    const links = buildPillarRegistryCrossLinks('manufacturer', 'order_production', demo);
    expect(links.some((l) => l.id === 'mfr-op-handoff-queue')).toBe(true);
  });
});
