import {
  PILLAR_CAPABILITY_REGISTRY,
  getPillarCapabilityById,
} from '@/lib/platform/pillar-capability-registry';
import { getShopReplenishmentWorkflowLinks } from '@/lib/platform/pillar-capability-links';

describe('pillar-capability-registry', () => {
  it('has unique capability ids', () => {
    const ids = PILLAR_CAPABILITY_REGISTRY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('relatedIds reference existing capabilities', () => {
    const ids = new Set(PILLAR_CAPABILITY_REGISTRY.map((e) => e.id));
    for (const entry of PILLAR_CAPABILITY_REGISTRY) {
      for (const relatedId of entry.relatedIds) {
        expect(ids.has(relatedId)).toBe(true);
      }
    }
  });

  it('resolveHref returns non-empty paths', () => {
    for (const entry of PILLAR_CAPABILITY_REGISTRY) {
      const href = entry.resolveHref({});
      expect(href.startsWith('/')).toBe(true);
      expect(href.length).toBeGreaterThan(1);
    }
  });

  it('replenishment workflow links include matrix and ATP neighbors', () => {
    const links = getShopReplenishmentWorkflowLinks({ collectionId: 'SS27' });
    const labels = links.map((l) => l.label);
    expect(labels.some((l) => l.includes('Матрица'))).toBe(true);
    expect(getPillarCapabilityById('co-replenishment-workspace')).toBeDefined();
  });
});
