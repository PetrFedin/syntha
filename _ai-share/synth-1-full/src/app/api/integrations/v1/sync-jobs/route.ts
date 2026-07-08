import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { enqueueSyncJob, listSyncJobs } from '@/lib/integrations/spine/sync-jobs-persistence.file';
import {
  processQueuedSyncJobsServer,
  retrySyncJobServer,
} from '@/lib/integrations/spine/sync-jobs-worker.server';

/** GET /api/integrations/v1/sync-jobs */
export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  const limit = Number(new URL(req.url).searchParams.get('limit') ?? '20');
  return NextResponse.json(
    {
      ok: true as const,
      data: { jobs: listSyncJobs(Number.isFinite(limit) ? limit : 20) },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}

/** POST /api/integrations/v1/sync-jobs — enqueue or retry failed job */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  let body: {
    platform?: string;
    kind?: string;
    retryJobId?: string;
    process?: boolean;
    limit?: number;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* empty body ok */
  }

  if (body.process === true) {
    const limit = Number(body.limit ?? 10);
    const processed = await processQueuedSyncJobsServer(Number.isFinite(limit) ? limit : 10);
    return NextResponse.json(
      {
        ok: true as const,
        data: { processed, count: processed.length },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { headers: { 'x-request-id': requestId } }
    );
  }

  if (body.retryJobId?.trim()) {
    const job = await retrySyncJobServer(body.retryJobId.trim());
    if (!job) {
      return NextResponse.json(
        {
          ok: false as const,
          error: { code: 'RETRY_NOT_ALLOWED', message: 'Job not found or not in failed state' },
          meta: { requestId, mode, apiVersion: 'v1' as const },
        },
        { status: 409, headers: { 'x-request-id': requestId } }
      );
    }
    return NextResponse.json(
      {
        ok: true as const,
        data: { job, retriedFrom: body.retryJobId.trim() },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { headers: { 'x-request-id': requestId } }
    );
  }

  const job = enqueueSyncJob({
    platform: body.platform ?? 'joor',
    kind: (body.kind as 'orders_import') ?? 'orders_import',
  });
  return NextResponse.json(
    {
      ok: true as const,
      data: { job },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
