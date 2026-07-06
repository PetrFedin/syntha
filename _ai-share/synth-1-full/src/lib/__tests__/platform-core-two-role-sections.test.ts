import {
  filterReadinessSubItemsForTwoRoleBaseline,
  isTwoRoleBaselineSectionAllowed,
  PLATFORM_CORE_TWO_ROLE_WHOLESALE_FLOW,
} from '@/lib/platform-core-two-role-sections';

describe('platform-core-two-role-sections', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
  const prevExt = process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    delete process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
  });

  afterAll(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
    if (prevExt === undefined) delete process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
    else process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES = prevExt;
  });

  it('defines 12-step JOOR/NuORDER wholesale flow', () => {
    expect(PLATFORM_CORE_TWO_ROLE_WHOLESALE_FLOW).toHaveLength(12);
    expect(PLATFORM_CORE_TWO_ROLE_WHOLESALE_FLOW[0].sectionId).toBe('brand-dev-w2-hub');
    expect(PLATFORM_CORE_TWO_ROLE_WHOLESALE_FLOW.at(-1)?.sectionId).toBe('shop-co-buyer-tracking');
  });

  it('denylist hides CRM/WSSI and supplier dev sections', () => {
    expect(
      isTwoRoleBaselineSectionAllowed('brand', 'collection_order', 'brand-co-wssi-plan')
    ).toBe(false);
    expect(
      isTwoRoleBaselineSectionAllowed('shop', 'collection_order', 'shop-co-matrix')
    ).toBe(true);
    expect(
      isTwoRoleBaselineSectionAllowed('brand', 'development', 'brand-dev-rfq-supplier')
    ).toBe(false);
    expect(
      isTwoRoleBaselineSectionAllowed('brand', 'development', 'brand-dev-range')
    ).toBe(true);
  });

  it('filters only denylisted sections, keeps audit order', () => {
    const items = [
      { id: 'shop-co-replenishment', label: 'Repl', order: 1 } as const,
      { id: 'shop-co-matrix', label: 'Matrix', order: 2 } as const,
      { id: 'shop-co-agent-rep', label: 'Agent', order: 3 } as const,
      { id: 'shop-co-checkout', label: 'Checkout', order: 4 } as const,
    ];
    const filtered = filterReadinessSubItemsForTwoRoleBaseline(
      items as unknown as import('@/lib/platform-core-readiness-audit').ReadinessSubItem[],
      'shop',
      'collection_order'
    );
    expect(filtered.map((i) => i.id)).toEqual([
      'shop-co-replenishment',
      'shop-co-matrix',
      'shop-co-checkout',
    ]);
  });
});
