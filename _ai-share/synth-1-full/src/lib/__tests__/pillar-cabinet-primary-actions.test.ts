import {
  buildPillarCabinetActions,
  countRoleChainProgress,
} from '@/lib/pillar-cabinet-primary-actions';
import { getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';

describe('pillar-cabinet-primary-actions', () => {
  it('returns hub primary action for brand collection_order', () => {
    const demo = getPlatformCoreDemo('SS27');
    const actions = buildPillarCabinetActions('brand', 'collection_order', demo);
    expect(actions.primary.label.length).toBeGreaterThan(0);
    expect(actions.primary.href.length).toBeGreaterThan(0);
    expect(actions.primary.testId).toBe('role-pillar-primary-cta');
  });

  it('counts chain progress from pillar done flags', () => {
    const nav = ['development', 'collection_order', 'comms'] as const;
    const { done, total } = countRoleChainProgress(nav, (id) =>
      id === 'development' ? true : id === 'collection_order' ? false : null
    );
    expect(total).toBe(3);
    expect(done).toBe(1);
  });
});
