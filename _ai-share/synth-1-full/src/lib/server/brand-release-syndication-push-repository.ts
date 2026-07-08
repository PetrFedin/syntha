import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { BrandReleaseSyndicationPushResult } from '@/lib/fashion/brand-release-syndication-push';

const memory: BrandReleaseSyndicationPushResult[] = [];
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-release-syndication-push.json');
let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(
      fs.readFileSync(STORE_FILE, 'utf8')
    ) as BrandReleaseSyndicationPushResult[];
    if (Array.isArray(parsed)) memory.splice(0, memory.length, ...parsed);
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(memory.slice(-50), null, 2));
  } catch {
    /* best effort */
  }
}

export function appendBrandReleaseSyndicationPush(
  result: BrandReleaseSyndicationPushResult
): BrandReleaseSyndicationPushResult {
  hydrateFileIfNeeded();
  memory.push(result);
  persistFile();
  return result;
}

export function listBrandReleaseSyndicationPushes(limit = 10): BrandReleaseSyndicationPushResult[] {
  hydrateFileIfNeeded();
  return memory.slice(-limit).reverse();
}

export function brandReleaseSyndicationPushStorageMode(): 'file' | 'memory' {
  if (canUseDiskPersistence() && fs.existsSync(STORE_FILE)) return 'file';
  return 'memory';
}
