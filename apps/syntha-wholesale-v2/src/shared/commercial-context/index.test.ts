import { describe, expect, it } from 'vitest';
import {
  buildCommercialContextPath,
  getNextLifecycleEntity,
  getPreviousLifecycleEntity,
  getRequiredParentContext,
  validateCommercialContext,
} from '@/shared/commercial-context';

const completeContext = {
  organisationId: 'organisation-1',
  seasonId: 'season-1',
  campaignId: 'campaign-1',
  collectionId: 'collection-1',
  showroomId: 'showroom-1',
  selectionId: 'selection-1',
  orderDraftId: 'draft-1',
  orderId: 'order-1',
  confirmationId: 'confirmation-1',
  dealId: 'deal-1',
} as const;

describe('commercial context', () => {
  it('builds an ordered path with distinct entity identities', () => {
    const path = buildCommercialContextPath(completeContext);
    expect(path.map(({ type }) => type)).toEqual([
      'organisation', 'season', 'campaign', 'collection', 'showroom',
      'selection', 'order-draft', 'order', 'confirmation', 'deal',
    ]);
    expect(new Set(path.map(({ id }) => id)).size).toBe(path.length);
  });

  it('rejects a child without its required parent', () => {
    const result = validateCommercialContext({ collectionId: 'collection-1' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('collectionId requires campaignId');
  });

  it('exposes explicit parent and lifecycle relations', () => {
    expect(getRequiredParentContext('order')).toBe('order-draft');
    expect(getNextLifecycleEntity('selection')).toBe('order-draft');
    expect(getPreviousLifecycleEntity('confirmation')).toBe('order');
  });
});
