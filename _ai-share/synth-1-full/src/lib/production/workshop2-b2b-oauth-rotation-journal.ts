/**
 * OAuth callback / rotation journal (file-backed, no secrets).
 */
import fs from 'node:fs';
import path from 'node:path';

const JOURNAL = '.planning/workshop2-b2b-oauth-callback-journal.json';

export function appendWorkshop2B2bOAuthCallbackJournal(input: {
  provider: string;
  externalOrderRef: string;
  orderId: string;
  live: boolean;
  joorOrderId?: string;
}): void {
  const file = path.join(process.cwd(), JOURNAL);
  let rows: unknown[] = [];
  try {
    if (fs.existsSync(file)) {
      rows = (JSON.parse(fs.readFileSync(file, 'utf8')) as { entries?: unknown[] }).entries ?? [];
    }
  } catch {
    rows = [];
  }
  rows.push({ ...input, at: new Date().toISOString() });
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    `${JSON.stringify({ updatedAt: new Date().toISOString(), entries: rows }, null, 2)}\n`,
    'utf8'
  );
}
