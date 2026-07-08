/**
 * Sync job worker orchestration (testable stub dispatch; server overrides via setSyncJobDispatch).
 */
import type { IntegrationSyncJob } from './sync-jobs-persistence.file';
import {
  completeSyncJob,
  failSyncJob,
  getSyncJob,
  insertQueuedJob,
  listSyncJobs,
  markSyncJobRunning,
} from './sync-jobs-persistence.file';

export type SyncJobDispatchOutcome = { resultCount: number } | { error: string };
export type SyncJobDispatchFn = (
  job: IntegrationSyncJob
) => SyncJobDispatchOutcome | Promise<SyncJobDispatchOutcome>;

function stubDispatchSyncJobKind(job: IntegrationSyncJob): SyncJobDispatchOutcome {
  switch (job.kind) {
    case 'orders_import':
    case 'tracking_sync':
    case 'vendor_po_ack':
    case 'rfq_ack':
    case 'vendor_po_import':
    case 'allocation_sync':
    case 'wip_sync':
      return { resultCount: 1 };
    default:
      return { resultCount: 0 };
  }
}

let dispatchImpl: SyncJobDispatchFn = stubDispatchSyncJobKind;

/** Server bootstrap: real file-mirror counts (see sync-jobs-worker.server.ts). */
export function setSyncJobDispatch(fn: SyncJobDispatchFn): void {
  dispatchImpl = fn;
}

export function resetSyncJobDispatch(): void {
  dispatchImpl = stubDispatchSyncJobKind;
}

export function runSyncJobWorker(jobId: string): IntegrationSyncJob | undefined {
  return runSyncJobWorkerSync(jobId);
}

export async function runSyncJobWorkerAsync(
  jobId: string
): Promise<IntegrationSyncJob | undefined> {
  const job = getSyncJob(jobId);
  if (!job || job.status !== 'queued') return undefined;

  markSyncJobRunning(job.id);
  try {
    const outcome = await dispatchImpl(job);
    if ('error' in outcome) {
      return failSyncJob(job.id, outcome.error);
    }
    return completeSyncJob(job.id, outcome.resultCount);
  } catch (e) {
    return failSyncJob(job.id, e instanceof Error ? e.message : String(e));
  }
}

/** @deprecated Tests: prefer runSyncJobWorkerAsync when dispatch may be async. */
function runSyncJobWorkerSync(jobId: string): IntegrationSyncJob | undefined {
  const job = getSyncJob(jobId);
  if (!job || job.status !== 'queued') return undefined;

  markSyncJobRunning(job.id);
  try {
    const outcome = dispatchImpl(job);
    if (outcome instanceof Promise) {
      throw new Error('Async dispatch requires runSyncJobWorkerAsync');
    }
    if ('error' in outcome) {
      return failSyncJob(job.id, outcome.error);
    }
    return completeSyncJob(job.id, outcome.resultCount);
  } catch (e) {
    return failSyncJob(job.id, e instanceof Error ? e.message : String(e));
  }
}

/** FIFO worker pickup for queued jobs (stub dispatch in unit tests). */
export function processQueuedSyncJobs(limit = 10): IntegrationSyncJob[] {
  const cap = Math.max(1, Math.min(limit, 25));
  const queued = listSyncJobs(100)
    .filter((j) => j.status === 'queued')
    .slice(0, cap);
  const processed: IntegrationSyncJob[] = [];
  for (const job of queued) {
    const done = runSyncJobWorkerSync(job.id);
    if (done) processed.push(done);
  }
  return processed;
}

/** Server FIFO worker — supports async upstream handlers. */
export async function processQueuedSyncJobsAsync(limit = 10): Promise<IntegrationSyncJob[]> {
  const cap = Math.max(1, Math.min(limit, 25));
  const queued = listSyncJobs(100)
    .filter((j) => j.status === 'queued')
    .slice(0, cap);
  const processed: IntegrationSyncJob[] = [];
  for (const job of queued) {
    const done = await runSyncJobWorkerAsync(job.id);
    if (done) processed.push(done);
  }
  return processed;
}

/** Re-enqueue failed job and run worker. */
export function retrySyncJob(failedJobId: string): IntegrationSyncJob | null {
  const prev = getSyncJob(failedJobId);
  if (!prev || prev.status !== 'failed') return null;
  const job = insertQueuedJob({ platform: prev.platform, kind: prev.kind });
  return runSyncJobWorkerSync(job.id) ?? null;
}

export async function retrySyncJobAsync(failedJobId: string): Promise<IntegrationSyncJob | null> {
  const prev = getSyncJob(failedJobId);
  if (!prev || prev.status !== 'failed') return null;
  const job = insertQueuedJob({ platform: prev.platform, kind: prev.kind });
  return (await runSyncJobWorkerAsync(job.id)) ?? null;
}
