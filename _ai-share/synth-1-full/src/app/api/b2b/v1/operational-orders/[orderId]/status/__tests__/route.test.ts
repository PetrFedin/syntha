/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

jest.mock('@/lib/order/b2b-operational-api-server', () => ({
  ...jest.requireActual('@/lib/order/b2b-operational-api-server'),
  findOperationalOrderForRequest: jest.fn(),
}));

jest.mock('@/lib/integrations/spine/integration-ui-utils', () => ({
  isIntegrationImportedWholesaleOrderId: jest.fn(() => false),
}));

import { PATCH } from '@/app/api/b2b/v1/operational-orders/[orderId]/status/route';
import { findOperationalOrderForRequest } from '@/lib/order/b2b-operational-api-server';
import { getOperationalStatusRecord } from '@/lib/order/b2b-operational-status-persistence.file';

const mockedFind = findOperationalOrderForRequest as jest.MockedFunction<
  typeof findOperationalOrderForRequest
>;

describe('PATCH /api/b2b/v1/operational-orders/[orderId]/status', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'b2b-op-status-'));
    process.env.B2B_OPERATIONAL_STATUS_FILE = path.join(tmpDir, 'status.json');
    mockedFind.mockReset();
  });

  afterEach(() => {
    delete process.env.B2B_OPERATIONAL_STATUS_FILE;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns 403 when shop actor tries to PATCH brand status', async () => {
    const req = new Request('http://localhost/api/b2b/v1/operational-orders/B2B-1/status', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'idem-shop-block',
        'x-syntha-api-actor-role': 'shop',
      },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    const res = await PATCH(req as never, { params: Promise.resolve({ orderId: 'B2B-1' }) });
    expect(res.status).toBe(403);
  });

  it('persists brand status for shop GET mirror', async () => {
    mockedFind.mockResolvedValue({
      order: 'B2B-TS-1',
      shop: 'Demo Shop',
      date: new Date().toISOString(),
      amount: 1000,
      status: 'Submitted',
    } as never);

    const req = new Request('http://localhost/api/b2b/v1/operational-orders/B2B-TS-1/status', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'idem-brand-ts-1',
        'x-syntha-api-actor-role': 'brand',
      },
      body: JSON.stringify({ status: 'brand_confirmed' }),
    });
    const res = await PATCH(req as never, { params: Promise.resolve({ orderId: 'B2B-TS-1' }) });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean; data?: { status?: string } };
    expect(json.ok).toBe(true);
    expect(json.data?.status).toBe('brand_confirmed');
    expect(getOperationalStatusRecord('B2B-TS-1')?.status).toBe('brand_confirmed');
  });
});
