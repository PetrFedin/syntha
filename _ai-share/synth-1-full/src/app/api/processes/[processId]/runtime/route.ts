/**
 * API runtime процесса: снимок состояния по `processId` + `contextId`.
 * PG: `platform_core_live_workflow_store` при `WORKSHOP2_DATABASE_URL`.
 * Fallback: `.data/workflow-store.json`. В Platform Core клиент — только API (без localStorage).
 */
import { NextResponse } from 'next/server';
import { readJsonBody } from '@/lib/http/read-json-body';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import {
  getStoredRuntimePayloadAsync,
  upsertRuntimeAsync,
  workflowStoreMeta,
} from '@/lib/server/process-workflow-store';

export const runtime = 'nodejs';

function resolveRuntimeStorageMode() {
  const meta = workflowStoreMeta();
  if (meta.persistence === 'postgres') return toBffPgStorageMode('pg');
  if (meta.persistence === 'file') return toBffPgStorageMode('file');
  return toBffPgStorageMode('unavailable');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ processId: string }> }
) {
  const { processId } = await params;
  const { searchParams } = new URL(request.url);
  const contextId = searchParams.get('contextId') ?? 'default';

  try {
    const storageMode = resolveRuntimeStorageMode();
    const stored = await getStoredRuntimePayloadAsync(processId, contextId);
    if (stored && typeof stored === 'object') {
      return NextResponse.json({ ok: true, storageMode, ...stored });
    }
    return NextResponse.json({ ok: true, storageMode, processId, contextId, runtimes: {} });
  } catch (e) {
    console.error('GET /api/processes/[processId]/runtime:', e);
    return NextResponse.json({ error: 'Failed to fetch runtime' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ processId: string }> }
) {
  const { processId } = await params;
  const { searchParams } = new URL(request.url);
  const contextId = searchParams.get('contextId') ?? 'default';

  try {
    const storageMode = resolveRuntimeStorageMode();
    const body = await readJsonBody<Record<string, unknown>>(request);
    const merged = { ok: true, storageMode, processId, contextId, ...body };
    await upsertRuntimeAsync(processId, contextId, merged);
    return NextResponse.json(merged);
  } catch (e) {
    console.error('PUT /api/processes/[processId]/runtime:', e);
    return NextResponse.json({ error: 'Failed to update runtime' }, { status: 500 });
  }
}
