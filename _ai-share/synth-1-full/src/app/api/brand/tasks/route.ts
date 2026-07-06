import { NextRequest, NextResponse } from 'next/server';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import {
  isBrandTasksPgConfigured,
  listBrandTasksKanban,
  replaceBrandTasksKanban,
} from '@/lib/server/brand-tasks-repository';
import type { BrandTaskRecord } from '@/lib/production-data/port';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  if (!isBrandTasksPgConfigured()) {
    return NextResponse.json(
      { ok: false, storageMode: 'unavailable', mode: 'postgres_unavailable', tasks: [] },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const tasks = await listBrandTasksKanban();
  return NextResponse.json(
    { ok: true, storageMode: 'pg', mode: 'postgres', tasks },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

async function persistBrandTasksKanbanRoute(
  request: NextRequest,
  method: 'PUT' | 'POST'
): Promise<NextResponse> {
  const auth = await guardWorkshop2Route(request, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  if (!isBrandTasksPgConfigured()) {
    return NextResponse.json(
      { ok: false, storageMode: 'unavailable', error: 'postgres_unavailable', messageRu: 'PostgreSQL недоступен — Kanban не сохранён.' },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as { tasks?: BrandTaskRecord[] } | null;
  if (!body?.tasks || !Array.isArray(body.tasks)) {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const result = await replaceBrandTasksKanban({ tasks: body.tasks });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.mode, messageRu: 'Сохранение в PG не выполнено.' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    storageMode: 'pg',
    mode: 'postgres',
    count: body.tasks.length,
    httpMethod: method,
  });
}

export async function PUT(request: NextRequest) {
  return persistBrandTasksKanbanRoute(request, 'PUT');
}

/** Wave VA: POST alias для Kanban persist (совместим с mini-panel). */
export async function POST(request: NextRequest) {
  return persistBrandTasksKanbanRoute(request, 'POST');
}
