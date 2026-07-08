import fs from 'fs';
import os from 'os';
import path from 'path';

import { dispatchSyncJobKindAsync } from '../sync-jobs-handlers.server';
import { enqueueSyncJob } from '../sync-jobs-persistence.file';
import {
  processQueuedSyncJobsAsync,
  resetSyncJobDispatch,
  setSyncJobDispatch,
} from '../sync-jobs-worker.service';

describe('sync-jobs-handlers.server', () => {
  let tmpJobs: string;
  let tmpImported: string;

  beforeEach(() => {
    tmpJobs = path.join(os.tmpdir(), `sync-handlers-jobs-${Date.now()}.json`);
    tmpImported = path.join(os.tmpdir(), `sync-handlers-imported-${Date.now()}.json`);
    process.env.B2B_INTEGRATION_SYNC_JOBS_FILE = tmpJobs;
    process.env.B2B_IMPORTED_ORDERS_FILE = tmpImported;
    fs.writeFileSync(
      tmpImported,
      JSON.stringify({ schemaVersion: 1, orders: {}, externalIndex: {} }, null, 2)
    );
    delete process.env.JOOR_API_BASE;
    delete process.env.JOOR_ACCESS_TOKEN;
    delete process.env.NUORDER_API_KEY;
  });

  afterEach(() => {
    delete process.env.B2B_INTEGRATION_SYNC_JOBS_FILE;
    delete process.env.B2B_IMPORTED_ORDERS_FILE;
    for (const f of [tmpJobs, tmpImported]) {
      try {
        fs.unlinkSync(f);
      } catch {
        /* ok */
      }
    }
    resetSyncJobDispatch();
  });

  it('orders_import without credentials fails with channel error', async () => {
    const outcome = await dispatchSyncJobKindAsync({
      id: 'test',
      platform: 'joor',
      kind: 'orders_import',
      status: 'queued',
      createdAt: new Date().toISOString(),
    });
    expect('error' in outcome).toBe(true);
    if ('error' in outcome) {
      expect(outcome.error).toMatch(/JOOR/i);
    }
  });

  it('process via server dispatch completes queued tracking job', async () => {
    setSyncJobDispatch(dispatchSyncJobKindAsync);
    const job = enqueueSyncJob({ platform: 'syntha', kind: 'tracking_sync' });
    expect(job.status).toBe('queued');
    const processed = await processQueuedSyncJobsAsync(5);
    const done = processed.find((j) => j.id === job.id);
    expect(done?.status).toBe('completed');
    expect(typeof done?.resultCount).toBe('number');
  });
});
