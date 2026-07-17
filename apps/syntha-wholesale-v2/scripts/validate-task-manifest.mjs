import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const taskRoot = resolve(root, 'tasks');
const manifestPath = resolve(taskRoot, 'task-manifest.json');
const errors = [];
const fail = (message) => errors.push(message);
const read = (path) => readFileSync(path, 'utf8');

function parseTask(path) {
  const content = read(path);
  const frontmatter = content.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? '';
  const id = frontmatter.match(/^task_id:\s*(TASK-\d{4})\s*$/m)?.[1];
  const status = frontmatter.match(/^status:\s*(DRAFT|BLOCKED|READY|IN_PROGRESS|QA|DONE)\s*$/m)?.[1];
  const dependencies = [];
  let inDependencies = false;
  for (const line of frontmatter.split('\n')) {
    const key = line.match(/^([a-z_]+):/i)?.[1];
    if (key) inDependencies = key === 'dependencies';
    if (inDependencies) {
      const dependency = line.match(/^\s+-\s+(TASK-\d{4})\s*$/)?.[1];
      if (dependency) dependencies.push(dependency);
    }
  }
  return { id, status, dependencies };
}

if (!existsSync(manifestPath)) fail('tasks/task-manifest.json is required');
let manifest = null;
try { manifest = JSON.parse(read(manifestPath)); } catch (error) { fail(`invalid manifest JSON: ${error.message}`); }

if (manifest) {
  const entries = Array.isArray(manifest.tasks) ? manifest.tasks : [];
  const byId = new Map();
  for (const entry of entries) {
    if (!/^TASK-\d{4}$/.test(entry.id ?? '')) { fail(`invalid task id ${entry.id}`); continue; }
    if (byId.has(entry.id)) fail(`duplicate manifest task ${entry.id}`);
    byId.set(entry.id, entry);
    const path = resolve(taskRoot, entry.file ?? '');
    if (!path.startsWith(taskRoot) || !existsSync(path)) { fail(`${entry.id} points to missing task file ${entry.file}`); continue; }
    const task = parseTask(path);
    if (task.id !== entry.id) fail(`${entry.id} does not match task file metadata`);
    if (task.status !== entry.status) fail(`${entry.id} status ${entry.status} does not match Markdown ${task.status}`);
    const manifestDeps = Array.isArray(entry.dependencies) ? [...entry.dependencies].sort() : [];
    if (JSON.stringify(manifestDeps) !== JSON.stringify([...task.dependencies].sort())) fail(`${entry.id} dependencies do not match Markdown`);
  }
  for (const entry of entries) {
    for (const dependency of entry.dependencies ?? []) {
      if (!byId.has(dependency)) fail(`${entry.id} references missing dependency ${dependency}`);
      if (entry.status === 'READY' && byId.get(dependency)?.status !== 'DONE') fail(`${entry.id} cannot be READY while ${dependency} is not DONE`);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) { fail(`dependency cycle detected at ${id}`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)?.dependencies ?? []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of byId.keys()) visit(id);
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR tasks/task-manifest.json: ${error}`);
  process.exit(1);
}
console.log(`Task manifest validation passed (${manifest.tasks.length} tasks checked).`);
