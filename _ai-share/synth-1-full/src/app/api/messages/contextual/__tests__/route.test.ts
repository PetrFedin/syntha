/** @jest-environment node */
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/server/workshop2-route-auth', () => ({
  guardWorkshop2Route: jest.fn(async () => ({ ok: true, actor: { actorLabel: 'brand-test' } })),
  WORKSHOP2_READ_ROLES: ['production:read'],
  WORKSHOP2_WRITE_ROLES: ['production:edit'],
}));

jest.mock('@/lib/server/workshop2-contextual-messages-repository', () => ({
  listWorkshop2ContextualMessages: jest.fn(async () => [
    {
      id: 'msg-1',
      contextType: 'b2b_order',
      contextId: 'B2B-DEMO-SHOP1-SS27',
      message: 'Hello',
      createdAt: '2026-01-01T00:00:00.000Z',
      sender: 'Магазин',
    },
  ]),
  appendWorkshop2ContextualMessage: jest.fn(
    async (input: { contextType: string; contextId: string; message: string }) => ({
      id: 'msg-new',
      contextType: input.contextType,
      contextId: input.contextId,
      message: input.message,
      createdAt: '2026-01-02T00:00:00.000Z',
      sender: 'Brand QA',
    })
  ),
}));

import { GET, POST } from '../route';
import {
  appendWorkshop2ContextualMessage,
  listWorkshop2ContextualMessages,
} from '@/lib/server/workshop2-contextual-messages-repository';
import { guardWorkshop2Route } from '@/lib/server/workshop2-route-auth';

describe('/api/messages/contextual HTTP contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns 400 when context params missing', async () => {
    const req = new NextRequest('http://localhost/api/messages/contextual');
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(guardWorkshop2Route).toHaveBeenCalled();
  });

  it('GET lists messages for contextType+contextId', async () => {
    const req = new NextRequest(
      'http://localhost/api/messages/contextual?contextType=b2b_order&contextId=B2B-DEMO-SHOP1-SS27'
    );
    const res = await GET(req);
    const json = (await res.json()) as { messages?: { id: string; sender: string }[] };

    expect(res.status).toBe(200);
    expect(listWorkshop2ContextualMessages).toHaveBeenCalledWith({
      contextType: 'b2b_order',
      contextId: 'B2B-DEMO-SHOP1-SS27',
    });
    expect(json.messages?.[0]?.id).toBe('msg-1');
    expect(json.messages?.[0]?.sender).toBe('Магазин');
  });

  it('POST returns 400 when required fields missing', async () => {
    const req = new NextRequest('http://localhost/api/messages/contextual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextType: 'b2b_order' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('POST appends message with sender resolution via repository', async () => {
    const req = new NextRequest('http://localhost/api/messages/contextual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-w2-actor-label': 'Brand QA',
      },
      body: JSON.stringify({
        contextType: 'b2b_order',
        contextId: 'B2B-DEMO-SHOP1-SS27',
        message: 'Подтверждаем состав',
      }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { message?: { id: string; sender: string } };

    expect(res.status).toBe(201);
    expect(appendWorkshop2ContextualMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        contextType: 'b2b_order',
        contextId: 'B2B-DEMO-SHOP1-SS27',
        message: 'Подтверждаем состав',
        isSystem: false,
      })
    );
    expect(json.message?.id).toBe('msg-new');
    expect(json.message?.sender).toBe('Brand QA');
  });

  it('returns 401 when guard rejects write', async () => {
    (guardWorkshop2Route as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ ok: false }, { status: 401 })
    );

    const req = new NextRequest('http://localhost/api/messages/contextual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contextType: 'b2b_order',
        contextId: 'B2B-DEMO-SHOP1-SS27',
        message: 'test',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
