import {
  buildPillarCabinetRelatedLinks,
  buildPillarCabinetSectionItems,
  pillarCabinetUsesEmptySections,
} from '@/lib/pillar-cabinet-sections';
import { getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';

describe('pillar-cabinet-sections', () => {
  it('excludes cabinet meta sections from hub list', () => {
    const items = buildPillarCabinetSectionItems('brand', 'collection_order', 'SS27');
    expect(items.some((i) => i.id.endsWith('-cabinet'))).toBe(false);
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(12);
  });

  it('detects empty-cell section mode', () => {
    expect(
      pillarCabinetUsesEmptySections('supplier', 'collection_order', 'empty')
    ).toBe(true);
    expect(pillarCabinetUsesEmptySections('brand', 'development', 'active')).toBe(false);
  });

  it('caps related links at 3', () => {
    const links = buildPillarCabinetRelatedLinks(
      'brand',
      'collection_order',
      'SS27',
      getPlatformCoreDemo('SS27')
    );
    expect(links.length).toBeLessThanOrEqual(3);
  });
});
