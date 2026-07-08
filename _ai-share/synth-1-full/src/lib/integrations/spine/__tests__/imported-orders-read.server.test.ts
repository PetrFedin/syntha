import {
  getImportedOrderRecordForOperationalUi,
  listImportedOrdersForOperationalUi,
} from '../imported-orders-read.server';

jest.mock('../imported-orders-persistence.file', () => ({
  listImportedOrdersAsB2B: jest.fn(() => [{ order: 'INT-FILE-1' }]),
  getImportedOrderRecord: jest.fn(),
  getImportedLineItems: jest.fn(),
}));

jest.mock('../imported-orders-persistence.pg', () => ({
  listSpineImportedOrdersFromPg: jest.fn(),
  getSpineImportedOrderRecordFromPg: jest.fn(),
}));

jest.mock('../spine-operational-store', () => ({
  ensureSpineOperationalStoreReady: jest.fn().mockResolvedValue(undefined),
  isSpineOperationalPgEnabled: jest.fn(() => true),
}));

jest.mock('../spine-pg-hydrate-guards', () => ({
  isSpineOperationalPgPrimary: jest.fn(),
}));

import { listImportedOrdersAsB2B } from '../imported-orders-persistence.file';
import {
  getSpineImportedOrderRecordFromPg,
  listSpineImportedOrdersFromPg,
} from '../imported-orders-persistence.pg';
import { isSpineOperationalPgPrimary } from '../spine-pg-hydrate-guards';

const mockPgPrimary = isSpineOperationalPgPrimary as jest.Mock;
const mockListPg = listSpineImportedOrdersFromPg as jest.Mock;
const mockGetPg = getSpineImportedOrderRecordFromPg as jest.Mock;
const mockListFile = listImportedOrdersAsB2B as jest.Mock;

describe('imported-orders-read.server', () => {
  beforeEach(() => {
    mockPgPrimary.mockReset();
    mockListPg.mockReset();
    mockGetPg.mockReset();
    mockListFile.mockClear();
  });

  it('reads from file when not PG-primary', async () => {
    mockPgPrimary.mockReturnValue(false);
    const orders = await listImportedOrdersForOperationalUi();
    expect(orders).toEqual([{ order: 'INT-FILE-1' }]);
    expect(mockListPg).not.toHaveBeenCalled();
  });

  it('reads from PG when PG-primary', async () => {
    mockPgPrimary.mockReturnValue(true);
    mockListPg.mockResolvedValue([
      {
        externalKey: 'joor:1',
        record: {
          wholesaleOrderId: 'INT-JOOR-1',
          order: {
            order: 'INT-JOOR-1',
            shop: 'S',
            brand: 'B',
            status: 'pending',
            amount: '1',
            date: 'd',
          },
          lineItems: [],
          importedAt: '2026-06-01',
        },
      },
    ]);
    const orders = await listImportedOrdersForOperationalUi();
    expect(orders.map((o) => o.order)).toEqual(['INT-JOOR-1']);
    expect(mockListFile).not.toHaveBeenCalled();
  });

  it('getImportedOrderRecordForOperationalUi uses PG when primary', async () => {
    mockPgPrimary.mockReturnValue(true);
    mockGetPg.mockResolvedValue({
      wholesaleOrderId: 'INT-JOOR-9',
      order: { order: 'INT-JOOR-9' },
      lineItems: [],
      importedAt: '2026-06-01',
    });
    const rec = await getImportedOrderRecordForOperationalUi('INT-JOOR-9');
    expect(rec?.wholesaleOrderId).toBe('INT-JOOR-9');
  });
});
