import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ledgerPath = resolve(root, 'docs/architecture/change-ledger.json');
const manifestPath = resolve(root, 'tasks/task-manifest.json');
const adrIndexPath = resolve(root, 'docs/architecture/adr/README.md');
const errors = [];
const fail = (message) => errors.push(message);

if (!existsSync(ledgerPath)) fail('change-ledger.json is required');
let ledger;
try { ledger = JSON.parse(readFileSync(ledgerPath, 'utf8')); } catch (error) { fail(`invalid JSON: ${error.message}`); }

const taskIds = new Set(JSON.parse(readFileSync(manifestPath, 'utf8')).tasks.map((task) => task.id));
const adrIndex = readFileSync(adrIndexPath, 'utf8');
const adrIds = new Set([...adrIndex.matchAll(/ADR-\d{4}/g)].map((match) => match[0]));

if (ledger) {
  const seen = new Set();
  for (const entry of ledger.entries ?? []) {
    if (!/^CHG-\d{4}$/.test(entry.id ?? '')) fail(`invalid change id ${entry.id}`);
    if (seen.has(entry.id)) fail(`duplicate change id ${entry.id}`);
    seen.add(entry.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? '')) fail(`${entry.id} has invalid date`);
    if (!['governance','architecture','runtime','feature','fix','migration','docs'].includes(entry.type)) fail(`${entry.id} has invalid type`);
    if (!entry.summary?.trim()) fail(`${entry.id} summary is required`);
    for (const task of entry.tasks ?? []) if (!taskIds.has(task)) fail(`${entry.id} references missing task ${task}`);
    for (const adr of entry.adrs ?? []) if (!adrIds.has(adr)) fail(`${entry.id} references missing ADR ${adr}`);
    for (const file of entry.files ?? []) if (!existsSync(resolve(root, file))) fail(`${entry.id} references missing file ${file}`);
    if (!entry.verification?.command) fail(`${entry.id} verification command is required`);
    if (!['PASS','FAIL','NOT_RUN'].includes(entry.verification?.result)) fail(`${entry.id} verification result is invalid`);
    if (!entry.rollback?.trim()) fail(`${entry.id} rollback is required`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR change-ledger.json: ${error}`);
  process.exit(1);
}
console.log(`Change ledger validation passed (${ledger.entries.length} entries checked).`);
