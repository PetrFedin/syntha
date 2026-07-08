import 'server-only';

import { isSpineOperationalPgEnabled } from './spine-operational-persistence.pg';
import { listImportedOrdersAsB2B } from './imported-orders-persistence.file';
import { listAllocationQueue } from './allocation-queue-persistence.file';
import { listAllIntegrationMeta } from './integration-meta-persistence.file';
import { listSyncJobs } from './sync-jobs-persistence.file';
import { listVendorPoRecords } from './vendor-po-persistence.file';
import { listCentricRfqRecords } from './centric-rfq-persistence.file';
import { listProductionWipRecords } from './production-wip-persistence.file';
import { getIntegrationExternalRefsFilePath } from './integration-external-refs-persistence.file';
import fs from 'fs';

/** PG — единственный SoT (staging/prod); file только hydrate-cache. */
export function isSpineOperationalPgPrimary(): boolean {
  return process.env.SPINE_OPERATIONAL_PG_PRIMARY === '1' && isSpineOperationalPgEnabled();
}

/** PG-primary: не писать JSON mirror (import/allocation и т.д.). */
export function shouldSpinePersistImportedOrdersToFile(): boolean {
  return !isSpineOperationalPgPrimary();
}

/** Не затирать file snapshot пустым PG при dev-данных в файле (кроме PG-primary). */
export function shouldApplyPgSnapshot(pgCount: number, fileCount: number): boolean {
  if (isSpineOperationalPgPrimary()) return true;
  return pgCount > 0 || fileCount === 0;
}

export function countImportedOrdersInFile(): number {
  return listImportedOrdersAsB2B().length;
}

export function countAllocationQueueInFile(): number {
  return listAllocationQueue(500).length;
}

export function countIntegrationMetaInFile(): number {
  return Object.keys(listAllIntegrationMeta()).length;
}

export function countSyncJobsInFile(): number {
  return listSyncJobs(500).length;
}

export function countExternalRefsInFile(): number {
  try {
    const raw = fs.readFileSync(getIntegrationExternalRefsFilePath(), 'utf8');
    const j = JSON.parse(raw) as { refs?: unknown[] };
    return Array.isArray(j.refs) ? j.refs.length : 0;
  } catch {
    return 0;
  }
}

export function countVendorPoInFile(): number {
  return listVendorPoRecords().length;
}

export function countCentricRfqInFile(): number {
  return listCentricRfqRecords().length;
}

export function countProductionWipInFile(): number {
  return listProductionWipRecords().length;
}
