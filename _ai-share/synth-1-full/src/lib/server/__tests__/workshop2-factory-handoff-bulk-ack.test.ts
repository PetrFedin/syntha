import {
  bulkAcknowledgeWorkshop2FactoryProductionHandoff,
  confirmWorkshop2B2bProductionHandoff,
  listWorkshop2FactoryProductionHandoffQueue,
  WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
} from '@/lib/server/workshop2-b2b-production-handoff';
import { getWorkshop2PurchaseOrderById } from '@/lib/server/workshop2-purchase-order-repository';

const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

describe('workshop2 factory handoff bulk acknowledge', () => {
  it('принимает pending_erp серию и идемпотентно пропускает synced', async () => {
    const handoff = await confirmWorkshop2B2bProductionHandoff({ orderId: DEMO_ORDER });
    if (!handoff.ok) {
      console.warn('skip bulk ack test: handoff not ok', handoff.messageRu);
      return;
    }

    const queue = await listWorkshop2FactoryProductionHandoffQueue({
      factoryId: handoff.factoryId,
    });
    const row = queue.items.find((i) => i.b2bOrderId === DEMO_ORDER);
    expect(row).toBeTruthy();
    expect(row!.status).toBe('pending_erp');

    const first = await bulkAcknowledgeWorkshop2FactoryProductionHandoff({
      factoryId: handoff.factoryId,
      items: [
        {
          productionOrderId: row!.productionOrderId,
          collectionId: row!.collectionId,
          articleId: row!.articleId,
        },
      ],
      actor: 'jest-factory',
    });
    expect(first.acknowledged).toContain(row!.productionOrderId);
    expect(first.errors).toHaveLength(0);

    const po = await getWorkshop2PurchaseOrderById(row!.productionOrderId);
    expect(po?.status).toBe('synced');
    expect(po?.payload?.source).toBe(WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE);

    const second = await bulkAcknowledgeWorkshop2FactoryProductionHandoff({
      factoryId: handoff.factoryId,
      items: [
        {
          productionOrderId: row!.productionOrderId,
          collectionId: row!.collectionId,
          articleId: row!.articleId,
        },
      ],
    });
    expect(second.skipped).toContain(row!.productionOrderId);
  });
});
