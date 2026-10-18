import { describe, expect, it } from 'vitest';
import { workspaceServiceFixtures } from '@/shared/connected-services/fixtures';

describe('connected service fixture identity', () => {
  it('keeps each service record identity distinct from its source entity identity', () => {
    const records = [
      ...workspaceServiceFixtures.messages,
      ...workspaceServiceFixtures.notifications,
      ...workspaceServiceFixtures.calendar,
      ...workspaceServiceFixtures.search,
    ];

    for (const record of records) {
      expect(record.id).not.toBe(record.sourceEntity.id);
    }
  });

  it('uses the source order identity for a search result link', () => {
    const [result] = workspaceServiceFixtures.search;
    expect(result.id).toBe('fixture-result-1');
    expect(result.sourceEntity).toEqual({ type: 'order', id: 'fixture-order-1' });
    expect(result.href).toContain('orderId=fixture-order-1');
    expect(result.href).not.toContain('orderId=fixture-result-1');
  });
});
