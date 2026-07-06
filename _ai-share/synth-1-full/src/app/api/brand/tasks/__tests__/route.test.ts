/** @jest-environment node */
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/server/workshop2-route-auth', () => ({
  guardWorkshop2Route: jest.fn(async () => ({ ok: true, actor: { actorLabel: 'brand-test' } })),
  WORKSHOP2_READ_ROLES: ['production:view'],
  WORKSHOP2_WRITE_ROLES: ['production:edit'],
}));

jest.mock('@/lib/server/brand-tasks-repository', () => ({
  isBrandTasksPgConfigured: jest.fn(() => true),
  listBrandTasksKanban: jest.fn(async () => [{ id: 't1', title: 'Task' }]),
  replaceBrandTasksKanban: jest.fn(async () => ({ ok: true, mode: 'postgres' })),
}));

import { GET, POST, PUT } from '../route';
import { guardWorkshop2Route } from '@/lib/server/workshop2-route-auth';
import { listBrandTasksKanban, replaceBrandTasksKanban } from '@/lib/server/brand-tasks-repository';

describe('/api/brand/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (guardWorkshop2Route as jest.Mock).mockResolvedValue({ ok: true, actor: { actorLabel: 'brand-test' } });
  });

  it('GET requires read guard and returns tasks', async () => {
    const req = new NextRequest('http://localhost/api/brand/tasks');
    const res = await GET(req);
    const json = (await res.json()) as { ok?: boolean; tasks?: unknown[] };

    expect(guardWorkshop2Route).toHaveBeenCalled();
    expect(listBrandTasksKanban).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.tasks).toHaveLength(1);
  });

  it('GET returns 401 when guard rejects', async () => {
    (guardWorkshop2Route as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ ok: false }, { status: 401 })
    );

    const req = new NextRequest('http://localhost/api/brand/tasks');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('PUT requires write guard and persists tasks', async () => {
    const req = new NextRequest('http://localhost/api/brand/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: [{ id: 't1', title: 'Task' }] }),
    });

    const res = await PUT(req);
    const json = (await res.json()) as { ok?: boolean };

    expect(guardWorkshop2Route).toHaveBeenCalled();
    expect(replaceBrandTasksKanban).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
  });

  it('POST alias persists tasks (wave VA)', async () => {
    const req = new NextRequest('http://localhost/api/brand/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: [{ id: 't2', title: 'Task 2' }] }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { ok?: boolean; httpMethod?: string };

    expect(replaceBrandTasksKanban).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.httpMethod).toBe('POST');
  });
});
