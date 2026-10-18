import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const benchmarkPath = resolve(root, 'docs/product/wholesale-capability-benchmark.json');
const taskPath = resolve(root, 'tasks/TASK-0005-wholesale-capability-canon.md');
const errors = [];
const fail = (message) => errors.push(message);

if (!existsSync(benchmarkPath)) fail('docs/product/wholesale-capability-benchmark.json is required');
if (!existsSync(taskPath)) fail('TASK-0005 wholesale capability canon is required');

let benchmark;
try { benchmark = JSON.parse(readFileSync(benchmarkPath, 'utf8')); } catch (error) { fail(`invalid JSON: ${error.message}`); }

if (benchmark) {
  const decisions = new Set(benchmark.decision_values ?? []);
  const coverageValues = new Set(benchmark.coverage_values ?? []);
  const seen = new Set();
  const capabilities = Array.isArray(benchmark.capabilities) ? benchmark.capabilities : [];
  if (capabilities.length < 15) fail('benchmark must contain at least 15 capabilities');
  for (const capability of capabilities) {
    if (!/^WSC-\d{3}$/.test(capability.id ?? '')) fail(`invalid capability id ${capability.id}`);
    if (seen.has(capability.id)) fail(`duplicate capability id ${capability.id}`);
    seen.add(capability.id);
    if (!capability.name?.trim()) fail(`${capability.id} name is required`);
    if (!Array.isArray(capability.source_patterns) || capability.source_patterns.length === 0) fail(`${capability.id} source_patterns are required`);
    if (!decisions.has(capability.decision)) fail(`${capability.id} has invalid decision ${capability.decision}`);
    if (!coverageValues.has(capability.coverage)) fail(`${capability.id} has invalid coverage ${capability.coverage}`);
    if (!capability.phase?.trim()) fail(`${capability.id} phase is required`);
    if (!capability.module?.trim()) fail(`${capability.id} module is required`);
    if (capability.decision === 'EXCLUDE' && capability.phase !== 'OUT_OF_SCOPE') fail(`${capability.id} excluded capability must be OUT_OF_SCOPE`);
    if (capability.coverage === 'CANONICAL' && capability.decision === 'DEFER') fail(`${capability.id} cannot be both CANONICAL and DEFER`);
  }

  if (existsSync(taskPath)) {
    const task = readFileSync(taskPath, 'utf8');
    const taskIds = new Set([...task.matchAll(/^\s+-\s+(WSC-\d{3})\s*$/gm)].map((match) => match[1]));
    for (const id of seen) if (!taskIds.has(id)) fail(`${id} is missing from TASK-0005 capability_ids`);
    for (const id of taskIds) if (!seen.has(id)) fail(`${id} is listed in TASK-0005 but missing from benchmark`);
    if (taskIds.size !== seen.size) fail(`TASK-0005 capability count ${taskIds.size} does not match benchmark count ${seen.size}`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR wholesale benchmark: ${error}`);
  process.exit(1);
}
console.log(`Wholesale benchmark validation passed (${benchmark.capabilities.length} capabilities checked and linked to TASK-0005).`);
