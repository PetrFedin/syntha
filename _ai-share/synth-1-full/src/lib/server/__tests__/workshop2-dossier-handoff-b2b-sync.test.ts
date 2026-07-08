import {
  pickWorkshop2B2bOrderIdForDossierHandoffSync,
  syncWorkshop2B2bOrderAfterDossierHandoffCommit,
} from '@/lib/server/workshop2-b2b-production-handoff';
import { putWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';

const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

function orderStub(
  partial: Partial<Workshop2B2bOrderRecord> & { id: string }
): Workshop2B2bOrderRecord {
  return {
    id: partial.id,
    collectionId: partial.collectionId ?? 'SS27',
    articleId: partial.articleId ?? 'demo-ss27-01',
    buyerId: partial.buyerId ?? 'shop-1',
    repId: partial.repId,
    status: partial.status ?? 'confirmed',
    tier: partial.tier ?? 'gold',
    totalRub: partial.totalRub ?? 100_000,
    lines: partial.lines ?? [{ articleId: 'demo-ss27-01', collectionId: 'SS27', qty: 12 }],
    commissionPreview: partial.commissionPreview,
    metadata: partial.metadata,
    createdAt: partial.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: partial.updatedAt ?? '2026-01-01T00:00:00.000Z',
  };
}

describe('pickWorkshop2B2bOrderIdForDossierHandoffSync', () => {
  it('prefers confirmed order in collection', () => {
    const picked = pickWorkshop2B2bOrderIdForDossierHandoffSync(
      [
        orderStub({ id: 'sub-1', status: 'submitted' }),
        orderStub({ id: 'conf-1', status: 'confirmed' }),
      ],
      'SS27'
    );
    expect(picked).toBe('conf-1');
  });

  it('skips shipped and cancelled', () => {
    const picked = pickWorkshop2B2bOrderIdForDossierHandoffSync(
      [
        orderStub({ id: 'shipped-1', status: 'shipped' }),
        orderStub({ id: 'cancel-1', status: 'cancelled' }),
      ],
      'SS27'
    );
    expect(picked).toBeNull();
  });
});

describe('syncWorkshop2B2bOrderAfterDossierHandoffCommit', () => {
  beforeEach(async () => {
    await putWorkshop2B2bOrder(
      orderStub({
        id: DEMO_ORDER,
        status: 'confirmed',
        articleId: 'demo-ss27-01',
        collectionId: 'SS27',
      })
    );
  });

  it('creates production PO for demo order after dossier handoff', async () => {
    const result = await syncWorkshop2B2bOrderAfterDossierHandoffCommit({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: DEMO_ORDER,
    });
    expect(result.attempted).toBe(true);
    expect(result.resolvedOrderId).toBe(DEMO_ORDER);
    expect(result.results[0]?.ok).toBe(true);
    expect(result.results[0]?.productionOrderId).toMatch(/^PO-B2B-/);
  });
});
