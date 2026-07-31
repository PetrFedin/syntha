import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'db', 'migrations');
const files = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort();
const sql = (await Promise.all(files.map((file) => readFile(path.join(directory, file), 'utf8')))).join('\n');
const requiredTables = [
  'organisations', 'memberships', 'counterparty_relationships', 'campaigns', 'collections', 'showrooms',
  'showroom_invitations', 'commercial_cycles', 'selections', 'orders', 'deals', 'calendar_milestones',
  'commands', 'outbox_events', 'notifications', 'notification_projections', 'notification_commands',
  'auth_users', 'auth_sessions',
];
const requiredFragments = [
  'UNIQUE (brand_id, shop_id)', 'UNIQUE (showroom_id, shop_id)', 'cycle_id text NOT NULL UNIQUE',
  "status text NOT NULL CHECK (status IN ('pending', 'published'))", 'outbox_status_idx',
  'notifications_recipient_status_idx', 'version integer NOT NULL CHECK (version > 0)',
  'email_normalized text NOT NULL UNIQUE', 'token_hash char(64) NOT NULL UNIQUE', 'auth_sessions_expiry_idx',
];
const missing = [];
for (const table of requiredTables) if (!new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${table}\\s*\\(`, 'i').test(sql)) missing.push(`table:${table}`);
for (const fragment of requiredFragments) if (!sql.includes(fragment)) missing.push(`contract:${fragment}`);
if (missing.length) {
  console.error(`PostgreSQL contract is incomplete:\n${missing.map((item) => `- ${item}`).join('\n')}`);
  process.exit(1);
}
console.log(`PostgreSQL contract OK (${requiredTables.length} tables across ${files.length} migrations).`);
