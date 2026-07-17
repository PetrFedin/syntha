import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const walk = (dir) => existsSync(dir) ? readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
}) : [];
const rel = (path) => relative(root, path).replaceAll('\\', '/');
const fail = (path, message) => errors.push(`${rel(path)}: ${message}`);
const warn = (path, message) => warnings.push(`${rel(path)}: ${message}`);
const read = (path) => readFileSync(path, 'utf8');

if (!existsSync(root)) {
  console.error(`Missing V2 workspace: ${root}`);
  process.exit(1);
}

const files = walk(root);
for (const path of files.filter((file) => extname(file) === '.json')) {
  try { JSON.parse(read(path)); }
  catch (error) { fail(path, `invalid JSON: ${error.message}`); }
}

const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
for (const path of files.filter((file) => extname(file) === '.md')) {
  for (const match of read(path).matchAll(linkPattern)) {
    const target = match[1].trim();
    if (!target || target.startsWith('#') || /^[a-z]+:\/\//i.test(target) || target.startsWith('mailto:')) continue;
    const local = target.split('#')[0];
    if (!local) continue;
    const resolved = resolve(dirname(path), decodeURIComponent(local));
    if (!resolved.startsWith(root)) fail(path, `local link escapes V2 workspace: ${target}`);
    else if (!existsSync(resolved)) fail(path, `broken local link: ${target}`);
  }
}

const canonical = [
  'AGENTS.md', 'CURSOR_START_HERE.md', 'CURSOR_MASTER_RULES.md', 'src/README.md',
  'docs/architecture/README.md', 'docs/architecture/CODE_STRUCTURE.md',
  'docs/architecture/context-map.json'
].map((path) => join(root, path)).filter(existsSync);
for (const path of canonical) {
  const content = read(path);
  if (/\bpublic\.ts\b/.test(content)) fail(path, 'public.ts is forbidden; use module root index.ts');
  if (/src\/(features|domain|application|infrastructure|adapters|components)\//.test(content)) fail(path, 'old horizontal source architecture is forbidden');
  if (/\bV2-\d{4}\b/.test(content)) fail(path, 'legacy V2-* task ID is forbidden; use TASK-*');
}

const taskRoot = join(root, 'tasks');
const taskFiles = walk(taskRoot).filter((file) => extname(file) === '.md' && !file.endsWith('README.md'));
const taskById = new Map();
for (const path of taskFiles) {
  const fileName = rel(path).split('/').at(-1);
  const content = read(path);
  const id = content.match(/^task_id:\s*(TASK-\d{4})\s*$/m)?.[1];
  const status = content.match(/^status:\s*(DRAFT|BLOCKED|READY|IN_PROGRESS|QA|DONE)\s*$/m)?.[1];
  const dependencyBlock = content.match(/^dependencies:\s*\n((?:\s+-\s+TASK-\d{4}\s*\n?)*)/m)?.[1] ?? '';
  const dependencies = [...dependencyBlock.matchAll(/TASK-\d{4}/g)].map((match) => match[0]);
  if (!/^TASK-\d{4}-.+\.md$/.test(fileName)) fail(path, 'task filename must be TASK-0000-short-name.md');
  if (!id) fail(path, 'missing valid task_id metadata');
  else if (!fileName.startsWith(`${id}-`)) fail(path, `task_id ${id} does not match filename`);
  if (!status) fail(path, 'missing valid task status metadata');
  if (id) {
    if (taskById.has(id)) fail(path, `duplicate task id ${id}`);
    taskById.set(id, { path, fileName, status, dependencies });
  }
}

const manifestPath = join(taskRoot, 'task-manifest.json');
if (!existsSync(manifestPath)) {
  fail(taskRoot, 'task-manifest.json is required');
} else {
  let manifest;
  try { manifest = JSON.parse(read(manifestPath)); } catch { manifest = null; }
  if (manifest) {
    const entries = Array.isArray(manifest.tasks) ? manifest.tasks : [];
    const manifestById = new Map();
    for (const entry of entries) {
      if (!/^TASK-\d{4}$/.test(entry.id ?? '')) { fail(manifestPath, `invalid task id ${entry.id}`); continue; }
      if (manifestById.has(entry.id)) fail(manifestPath, `duplicate manifest task ${entry.id}`);
      manifestById.set(entry.id, entry);
      const task = taskById.get(entry.id);
      if (!task) { fail(manifestPath, `${entry.id} has no Markdown task file`); continue; }
      if (entry.file !== task.fileName) fail(manifestPath, `${entry.id} file does not match Markdown filename`);
      if (entry.status !== task.status) fail(manifestPath, `${entry.id} status ${entry.status} does not match Markdown ${task.status}`);
      const deps = Array.isArray(entry.dependencies) ? entry.dependencies : [];
      if (JSON.stringify([...deps].sort()) !== JSON.stringify([...task.dependencies].sort())) fail(manifestPath, `${entry.id} dependencies do not match Markdown`);
      for (const dependency of deps) if (!taskById.has(dependency)) fail(manifestPath, `${entry.id} references missing dependency ${dependency}`);
      if (entry.status === 'READY') {
        for (const dependency of deps) if (taskById.get(dependency)?.status !== 'DONE') fail(manifestPath, `${entry.id} cannot be READY while ${dependency} is not DONE`);
      }
    }
    for (const id of taskById.keys()) if (!manifestById.has(id)) fail(manifestPath, `${id} is missing from task manifest`);
    const visiting = new Set();
    const visited = new Set();
    const visit = (id) => {
      if (visiting.has(id)) { fail(manifestPath, `dependency cycle detected at ${id}`); return; }
      if (visited.has(id)) return;
      visiting.add(id);
      for (const dep of manifestById.get(id)?.dependencies ?? []) visit(dep);
      visiting.delete(id);
      visited.add(id);
    };
    for (const id of manifestById.keys()) visit(id);
  }
}

const adrRoot = join(root, 'docs/architecture/adr');
const adrIndex = join(adrRoot, 'README.md');
const validAdrStatuses = new Set(['PROPOSED', 'ACCEPTED', 'SUPERSEDED', 'REJECTED']);
if (existsSync(adrIndex)) {
  const indexContent = read(adrIndex);
  const rows = [...indexContent.matchAll(/\| \[ADR-(\d{4})\]\(([^)]+)\) \|[^|]+\| ([A-Z]+) \|/g)];
  const indexed = new Set();
  for (const [, number, target, indexStatus] of rows) {
    const path = resolve(adrRoot, target);
    indexed.add(target);
    if (!existsSync(path)) { fail(adrIndex, `ADR-${number} points to missing file ${target}`); continue; }
    const fileStatus = read(path).match(/^Status:\s*([A-Z]+)\s*$/m)?.[1];
    if (!validAdrStatuses.has(indexStatus)) fail(adrIndex, `ADR-${number} has invalid index status ${indexStatus}`);
    if (!fileStatus) fail(path, 'missing ADR Status field');
    else if (fileStatus !== indexStatus) fail(path, `status ${fileStatus} does not match index status ${indexStatus}`);
  }
  for (const path of walk(adrRoot).filter((file) => /^ADR-\d{4}-.+\.md$/.test(file.split('/').at(-1)))) {
    const name = path.split('/').at(-1);
    if (!indexed.has(name)) fail(path, 'ADR file is not listed in adr/README.md');
  }
} else fail(adrRoot, 'ADR index README.md is required');

const modulesRoot = join(root, 'src/modules');
if (existsSync(modulesRoot)) {
  for (const moduleName of readdirSync(modulesRoot).filter((name) => statSync(join(modulesRoot, name)).isDirectory())) {
    const moduleRoot = join(modulesRoot, moduleName);
    if (!existsSync(join(moduleRoot, 'README.md'))) fail(moduleRoot, 'module README.md is required');
    if (!existsSync(join(moduleRoot, 'index.ts'))) fail(moduleRoot, 'module root index.ts is required');
  }
  for (const path of walk(modulesRoot).filter((file) => ['.ts', '.tsx', '.js', '.mjs'].includes(extname(file)))) {
    const currentModule = rel(path).split('/')[2];
    for (const match of read(path).matchAll(/(?:from\s+|import\s*\()(['"])([^'"]+)\1/g)) {
      const moduleMatch = match[2].match(/(?:^|\/)modules\/([^/]+)(?:\/(.+))?$/);
      if (!moduleMatch) continue;
      const [, targetModule, deepPath] = moduleMatch;
      if (targetModule !== currentModule && deepPath && deepPath !== 'index' && deepPath !== 'index.ts') fail(path, `deep import into module "${targetModule}": ${match[2]}`);
    }
  }
} else warn(root, 'src/modules does not exist yet; module checks skipped');

for (const message of warnings) console.warn(`WARN ${message}`);
if (errors.length) {
  for (const message of errors) console.error(`ERROR ${message}`);
  console.error(`Architecture validation failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Architecture validation passed (${files.length} files checked).`);
