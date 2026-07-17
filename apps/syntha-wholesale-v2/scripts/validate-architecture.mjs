import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import process from 'node:process';

const root = resolve(process.cwd(), 'apps/syntha-wholesale-v2');
const errors = [];
const warnings = [];

const walk = (dir) => existsSync(dir)
  ? readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path];
    })
  : [];
const rel = (path) => relative(root, path).replaceAll('\\', '/');
const fail = (path, message) => errors.push(`${rel(path)}: ${message}`);
const warn = (path, message) => warnings.push(`${rel(path)}: ${message}`);

if (!existsSync(root)) {
  console.error(`Missing V2 workspace: ${root}`);
  process.exit(1);
}

const files = walk(root);

for (const path of files.filter((file) => extname(file) === '.json')) {
  try { JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) { fail(path, `invalid JSON: ${error.message}`); }
}

const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
for (const path of files.filter((file) => extname(file) === '.md')) {
  const content = readFileSync(path, 'utf8');
  for (const match of content.matchAll(linkPattern)) {
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
  const content = readFileSync(path, 'utf8');
  if (/\bpublic\.ts\b/.test(content)) fail(path, 'public.ts is forbidden; use module root index.ts');
  if (/src\/(features|domain|application|infrastructure|adapters|components)\//.test(content)) {
    fail(path, 'old horizontal source architecture is forbidden');
  }
  if (/\bV2-\d{4}\b/.test(content)) fail(path, 'legacy V2-* task ID is forbidden; use TASK-*');
}

const tasks = walk(join(root, 'tasks')).filter((file) => extname(file) === '.md' && !file.endsWith('README.md'));
for (const path of tasks) {
  const fileName = rel(path).split('/').at(-1);
  if (!/^TASK-\d{4}-.+\.md$/.test(fileName)) fail(path, 'task filename must be TASK-0000-short-name.md');
  const content = readFileSync(path, 'utf8');
  const id = content.match(/^task_id:\s*(TASK-\d{4})\s*$/m)?.[1];
  if (!id) fail(path, 'missing valid task_id metadata');
  else if (!fileName.startsWith(`${id}-`)) fail(path, `task_id ${id} does not match filename`);
}

const modulesRoot = join(root, 'src/modules');
if (existsSync(modulesRoot)) {
  for (const moduleName of readdirSync(modulesRoot).filter((name) => statSync(join(modulesRoot, name)).isDirectory())) {
    const moduleRoot = join(modulesRoot, moduleName);
    if (!existsSync(join(moduleRoot, 'README.md'))) fail(moduleRoot, 'module README.md is required');
    if (!existsSync(join(moduleRoot, 'index.ts'))) fail(moduleRoot, 'module root index.ts is required');
  }

  for (const path of walk(modulesRoot).filter((file) => ['.ts', '.tsx', '.js', '.mjs'].includes(extname(file)))) {
    const currentModule = rel(path).split('/')[2];
    const content = readFileSync(path, 'utf8');
    const importPattern = /(?:from\s+|import\s*\()(['"])([^'"]+)\1/g;
    for (const match of content.matchAll(importPattern)) {
      const specifier = match[2];
      const moduleMatch = specifier.match(/(?:^|\/)modules\/([^/]+)(?:\/(.+))?$/);
      if (!moduleMatch) continue;
      const [, targetModule, deepPath] = moduleMatch;
      if (targetModule !== currentModule && deepPath && deepPath !== 'index' && deepPath !== 'index.ts') {
        fail(path, `deep import into module "${targetModule}": ${specifier}`);
      }
    }
  }
} else {
  warn(root, 'src/modules does not exist yet; module checks skipped');
}

for (const message of warnings) console.warn(`WARN ${message}`);
if (errors.length) {
  for (const message of errors) console.error(`ERROR ${message}`);
  console.error(`Architecture validation failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Architecture validation passed (${files.length} files checked).`);
