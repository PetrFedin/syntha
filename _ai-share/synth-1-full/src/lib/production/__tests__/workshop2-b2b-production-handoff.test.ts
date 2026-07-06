import {
  bulkConfirmWorkshop2B2bProductionHandoff,
  buildWorkshop2BulkHandoffIdempotencyKey,
  rememberWorkshop2BulkHandoffIdempotency,
  resetWorkshop2BulkHandoffIdempotencyForTests,
  workshop2B2bProductionHandoffPoId,
  WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
} from '@/lib/server/workshop2-b2b-production-handoff';

jest.mock('@/lib/server/workshop2-b2b-orders-repository', () => ({
  getWorkshop2B2bOrder: jest.fn(),
}));

jest.mock('@/lib/server/workshop2-material-requisition-repository', () => ({
  listWorkshop2MaterialRequisitions: jest.fn(async () => []),
  areWorkshop2MaterialRequisitionsConfirmedForArticles: jest.fn(),
}));

import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';

describe('workshop2-b2b-production-handoff', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds deterministic PO id from B2B order', () => {
    expect(workshop2B2bProductionHandoffPoId('B2B-DEMO-SHOP1-SS27')).toBe(
      'PO-B2B-B2B-DEMO-SHOP1-SS27'
    );
  });

  it('uses stable payload source key', () => {
    expect(WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE).toBe('b2b_production_handoff');
  });

  it('bulk handoff skips submitted orders without auto-confirm', async () => {
    (getWorkshop2B2bOrder as jest.Mock).mockResolvedValue({
      id: 'B2B-DEMO-SHOP1-SS27',
      status: 'submitted',
      collectionId: 'SS27',
      lines: [{ articleId: 'demo-ss27-01', qty: 1 }],
    });

    const result = await bulkConfirmWorkshop2B2bProductionHandoff({
      orderIds: ['B2B-DEMO-SHOP1-SS27'],
    });

    expect(result.ok).toBe(false);
    expect(result.skipped).toContain('B2B-DEMO-SHOP1-SS27');
    expect(result.errors[0]?.messageRu).toMatch(/подтвердите заказ/i);
  });

  it('bulk handoff idempotency returns cached result', async () => {
    resetWorkshop2BulkHandoffIdempotencyForTests();
    const key = buildWorkshop2BulkHandoffIdempotencyKey(['B2B-CACHED-1']);
    rememberWorkshop2BulkHandoffIdempotency(key, {
      ok: true,
      handedOff: ['B2B-CACHED-1'],
      skipped: [],
      errors: [],
      messageRu: 'cached',
    });

    const result = await bulkConfirmWorkshop2B2bProductionHandoff({
      orderIds: ['B2B-CACHED-1'],
      idempotencyKey: key,
    });

    expect(result.idempotent).toBe(true);
    expect(result.handedOff).toEqual(['B2B-CACHED-1']);
    expect(getWorkshop2B2bOrder).not.toHaveBeenCalled();
  });
});
