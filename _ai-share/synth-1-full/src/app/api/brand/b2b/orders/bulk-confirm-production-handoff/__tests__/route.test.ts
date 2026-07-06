/** @jest-environment node */
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/server/workshop2-route-auth', () => ({
  guardWorkshop2Route: jest.fn(async () => ({ ok: true, actor: { actorLabel: 'brand-test' } })),
  WORKSHOP2_WRITE_ROLES: ['production:edit'],
}));

jest.mock('@/lib/server/workshop2-b2b-production-handoff', () => ({
  bulkConfirmWorkshop2B2bProductionHandoff: jest.fn(async () => ({
    ok: true,
    handedOff: ['B2B-DEMO-SHOP1-SS27'],
    skipped: [],
    errors: [],
    messageRu: 'ok',
  })),
  buildWorkshop2BulkHandoffIdempotencyKey: jest.fn(
    (orderIds: string[], factoryId?: string) =>
      `b2b-bulk-handoff:${factoryId ?? 'fact-1'}:${[...orderIds].sort().join(',')}`
  ),
}));

import { POST } from '../route';
import { guardWorkshop2Route } from '@/lib/server/workshop2-route-auth';
import { bulkConfirmWorkshop2B2bProductionHandoff } from '@/lib/server/workshop2-b2b-production-handoff';

describe('POST /api/brand/b2b/orders/bulk-confirm-production-handoff', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (guardWorkshop2Route as jest.Mock).mockResolvedValue({ ok: true, actor: { actorLabel: 'brand-test' } });
  });

  it('requires guard before bulk handoff', async () => {
    const req = new NextRequest(
      'http://localhost/api/brand/b2b/orders/bulk-confirm-production-handoff',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: ['B2B-DEMO-SHOP1-SS27'] }),
      }
    );

    const res = await POST(req);
    const json = (await res.json()) as { ok?: boolean; handedOff?: string[] };

    expect(guardWorkshop2Route).toHaveBeenCalled();
    expect(bulkConfirmWorkshop2B2bProductionHandoff).toHaveBeenCalledWith({
      orderIds: ['B2B-DEMO-SHOP1-SS27'],
      factoryId: undefined,
      idempotencyKey: 'b2b-bulk-handoff:fact-1:B2B-DEMO-SHOP1-SS27',
    });
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.handedOff).toEqual(['B2B-DEMO-SHOP1-SS27']);
  });

  it('forwards Idempotency-Key header to bulk handoff server fn', async () => {
    const customKey = 'client-bulk-handoff:retry-1';
    const req = new NextRequest(
      'http://localhost/api/brand/b2b/orders/bulk-confirm-production-handoff',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': customKey,
        },
        body: JSON.stringify({ orderIds: ['B2B-DEMO-SHOP1-SS27'] }),
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(bulkConfirmWorkshop2B2bProductionHandoff).toHaveBeenCalledWith({
      orderIds: ['B2B-DEMO-SHOP1-SS27'],
      factoryId: undefined,
      idempotencyKey: customKey,
    });
  });

  it('returns 401 when guard rejects', async () => {
    (guardWorkshop2Route as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ ok: false }, { status: 401 })
    );

    const req = new NextRequest(
      'http://localhost/api/brand/b2b/orders/bulk-confirm-production-handoff',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: ['B2B-DEMO-SHOP1-SS27'] }),
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(bulkConfirmWorkshop2B2bProductionHandoff).not.toHaveBeenCalled();
  });
});
