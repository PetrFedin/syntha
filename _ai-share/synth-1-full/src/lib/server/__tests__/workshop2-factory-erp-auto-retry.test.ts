import {
  WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX,
  runWorkshop2FactoryHandoffErpAutoRetries,
} from '@/lib/server/workshop2-b2b-production-handoff';
import { listWorkshop2PurchaseOrdersByPayloadSource } from '@/lib/server/workshop2-purchase-order-repository';

jest.mock('@/lib/server/workshop2-purchase-order-repository', () => ({
  listWorkshop2PurchaseOrdersByPayloadSource: jest.fn(),
  getWorkshop2PurchaseOrderById: jest.fn(),
  updateWorkshop2PurchaseOrderErpSync: jest.fn(),
}));

jest.mock('@/lib/server/workshop2-purchase-order-erp-create', () => ({
  postWorkshop2PurchaseOrderToErpOnCreate: jest.fn(),
}));

jest.mock('@/lib/server/platform-core-chain-status-hub', () => ({
  bumpPlatformCoreChainStatus: jest.fn(),
}));

const listPos = listWorkshop2PurchaseOrdersByPayloadSource as jest.MockedFunction<
  typeof listWorkshop2PurchaseOrdersByPayloadSource
>;

describe('workshop2 factory ERP auto-retry', () => {
  it('экспортирует лимит авто-повторов', () => {
    expect(WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX).toBe(3);
  });

  it('пропускает PO с erpNextRetryAt в будущем (lazy, без burst)', async () => {
    listPos.mockResolvedValueOnce([
      {
        id: 'PO-1',
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        status: 'error',
        supplierId: 'fact-1',
        qty: 10,
        payload: {
          source: 'b2b_production_handoff',
          erpAutoRetryCount: 0,
          erpNextRetryAt: new Date(Date.now() + 60_000).toISOString(),
        },
        erpExternalId: undefined,
        syncedAt: undefined,
        lineRef: undefined,
        createdAt: '',
        updatedAt: '',
      },
    ]);

    const result = await runWorkshop2FactoryHandoffErpAutoRetries({ factoryId: 'fact-1' });
    expect(result.attempted).toBe(0);
    expect(result.succeeded).toBe(0);
  });
});
