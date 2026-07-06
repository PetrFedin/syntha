/** @jest-environment node */
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/server/workshop2-route-auth', () => ({
  guardWorkshop2Route: jest.fn(async () => ({ ok: true, actor: { actorLabel: 'brand-test' } })),
  WORKSHOP2_READ_ROLES: ['production:view'],
}));

jest.mock('@/lib/server/pg-contextual-message-threads-handler', () => ({
  buildPgContextualThreadsResponse: jest.fn(async () =>
    NextResponse.json({ ok: true, threads: [], source: 'postgres' })
  ),
}));

import { GET } from '../route';
import { guardWorkshop2Route } from '@/lib/server/workshop2-route-auth';
import { buildPgContextualThreadsResponse } from '@/lib/server/pg-contextual-message-threads-handler';

describe('GET /api/brand/messages/threads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (guardWorkshop2Route as jest.Mock).mockResolvedValue({ ok: true, actor: { actorLabel: 'brand-test' } });
  });

  it('requires guard before listing threads', async () => {
    const req = new NextRequest('http://localhost/api/brand/messages/threads');
    const res = await GET(req);

    expect(guardWorkshop2Route).toHaveBeenCalled();
    expect(buildPgContextualThreadsResponse).toHaveBeenCalledWith('brand', req);
    expect(res.status).toBe(200);
  });

  it('returns 401 when guard rejects', async () => {
    (guardWorkshop2Route as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ ok: false }, { status: 401 })
    );

    const req = new NextRequest('http://localhost/api/brand/messages/threads');
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(buildPgContextualThreadsResponse).not.toHaveBeenCalled();
  });
});
