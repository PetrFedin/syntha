import { describe, expect, it } from 'vitest';

import {
  assertOrderTransition,
  canTransitionOrder,
  createOrderTransition,
  getAllowedOrderTransitions,
} from './order-workflow';

describe('commercial order workflow', () => {
  it('allows the primary happy-path transitions', () => {
    expect(canTransitionOrder('draft', 'submitted')).toBe(true);
    expect(canTransitionOrder('submitted', 'confirmed')).toBe(true);
    expect(canTransitionOrder('confirmed', 'allocated')).toBe(true);
    expect(canTransitionOrder('allocated', 'ready')).toBe(true);
    expect(canTransitionOrder('ready', 'shipped')).toBe(true);
    expect(canTransitionOrder('shipped', 'delivered')).toBe(true);
    expect(canTransitionOrder('delivered', 'closed')).toBe(true);
  });

  it('rejects transitions that skip required business stages', () => {
    expect(canTransitionOrder('draft', 'confirmed')).toBe(false);
    expect(canTransitionOrder('confirmed', 'shipped')).toBe(false);
    expect(() => assertOrderTransition('closed', 'draft')).toThrow(
      'Order cannot transition from "closed" to "draft".',
    );
  });

  it('exposes terminal statuses with no outgoing transitions', () => {
    expect(getAllowedOrderTransitions('closed')).toEqual([]);
    expect(getAllowedOrderTransitions('cancelled')).toEqual([]);
  });

  it('creates an auditable transition record', () => {
    expect(
      createOrderTransition(
        'draft',
        'submitted',
        'user-42',
        'Buyer completed the order',
        '2026-07-26T12:00:00.000Z',
      ),
    ).toEqual({
      from: 'draft',
      to: 'submitted',
      actorId: 'user-42',
      reason: 'Buyer completed the order',
      occurredAt: '2026-07-26T12:00:00.000Z',
    });
  });
});
