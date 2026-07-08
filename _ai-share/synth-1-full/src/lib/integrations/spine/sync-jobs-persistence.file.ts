/**
 * Sync jobs registry (admin retry) — demo file store with queued→running→terminal lifecycle.
 */
import 'server-only';

import fs from 'fs';
import path from 'path';

export type IntegrationSyncJob = {
  id: string;
  platform: string;
  kind:
    | 'orders_import'
    | 'inventory'
    | 'styles_import'
    | 'export'
    | 'wip_sync'
    | 'tracking_sync'
    | 'rfq_import'
    | 'rfq_ack'
    | 'bom_import'
    | 'delivery_sync'
    | 'media_import'
    | 'allocation_sync'
    | 'zedonk_style_import'
    | 'vendor_po_import'
    | 'vendor_po_ack'
    | 'order_export'
    | 'working_order'
    | 'linesheet_gen'
    | 'zedonk_consolidated';
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  resultCount?: number;
};

export type IntegrationSyncJobsFileV1 = {
  schemaVersion: 1;
  jobs: IntegrationSyncJob[];
};

const EMPTY: IntegrationSyncJobsFileV1 = { schemaVersion: 1, jobs: [] };

function filePath(): string {
  const fromEnv = process.env.B2B_INTEGRATION_SYNC_JOBS_FILE?.trim();
  if (fromEnv) return fromEnv;
  return path.join(process.cwd(), 'data', 'b2b-integration-sync-jobs.json');
}

function load(): IntegrationSyncJobsFileV1 {
  try {
    const raw = fs.readFileSync(filePath(), 'utf8');
    const j = JSON.parse(raw) as IntegrationSyncJobsFileV1;
    if (j?.schemaVersion !== 1 || !Array.isArray(j.jobs)) return { ...EMPTY };
    return j;
  } catch {
    return { ...EMPTY };
  }
}

function save(data: IntegrationSyncJobsFileV1): void {
  const p = filePath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function mirrorJobToPg(job: IntegrationSyncJob): void {
  void import('./spine-operational-persistence.pg')
    .then(({ mirrorSyncJobsSnapshotToPg, isSpineOperationalPgEnabled }) => {
      if (isSpineOperationalPgEnabled()) return mirrorSyncJobsSnapshotToPg([job]);
    })
    .catch(() => undefined);
}

function patchJob(id: string, patch: Partial<IntegrationSyncJob>): IntegrationSyncJob | undefined {
  const data = load();
  const idx = data.jobs.findIndex((j) => j.id === id);
  if (idx < 0) return undefined;
  const next = { ...data.jobs[idx], ...patch };
  data.jobs[idx] = next;
  save(data);
  mirrorJobToPg(next);
  return next;
}

export function getSyncJob(id: string): IntegrationSyncJob | undefined {
  return load().jobs.find((j) => j.id === id.trim());
}

export function listSyncJobs(limit = 20): IntegrationSyncJob[] {
  return load()
    .jobs.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function insertQueuedJob(params: {
  platform: string;
  kind: IntegrationSyncJob['kind'];
}): IntegrationSyncJob {
  const job: IntegrationSyncJob = {
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    platform: params.platform,
    kind: params.kind,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };
  const data = load();
  data.jobs.unshift(job);
  if (data.jobs.length > 100) data.jobs.length = 100;
  save(data);
  mirrorJobToPg(job);
  return job;
}

export function markSyncJobRunning(id: string): IntegrationSyncJob | undefined {
  return patchJob(id, { status: 'running', startedAt: new Date().toISOString() });
}

export function completeSyncJob(id: string, resultCount = 0): IntegrationSyncJob | undefined {
  return patchJob(id, {
    status: 'completed',
    finishedAt: new Date().toISOString(),
    resultCount,
    error: undefined,
  });
}

export function failSyncJob(id: string, error: string): IntegrationSyncJob | undefined {
  return patchJob(id, {
    status: 'failed',
    finishedAt: new Date().toISOString(),
    error: error.trim() || 'sync failed',
  });
}

/**
 * Enqueue audit job. With resultCount/error — runs queued→running→terminal in-process.
 * Without outcome — stays queued (manual retry / worker pickup).
 */
export function enqueueSyncJob(params: {
  platform: string;
  kind: IntegrationSyncJob['kind'];
  resultCount?: number;
  error?: string;
}): IntegrationSyncJob {
  const job = insertQueuedJob(params);
  if (params.error !== undefined) {
    markSyncJobRunning(job.id);
    return failSyncJob(job.id, params.error) ?? job;
  }
  if (params.resultCount !== undefined) {
    markSyncJobRunning(job.id);
    return completeSyncJob(job.id, params.resultCount) ?? job;
  }
  return job;
}

/** PG hydrate: replace in-memory file snapshot (admin sync jobs list). */
export function replaceSyncJobsSnapshot(jobs: IntegrationSyncJob[]): void {
  save({ schemaVersion: 1, jobs: jobs.slice(0, 100) });
}
