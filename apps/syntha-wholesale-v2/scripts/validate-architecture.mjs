import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import process from 'node:process';

const appRoot = resolve(process.cwd(), 'apps/syntha-wholesale-v2');
const errors = [];
const warnings = [];

function walk(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function rel(path) {
  return relative(appRoot, path).replaceAll('\\', '/');
}

function fail(path, message) {
  errors.push(`${rel(path)}: ${message}`);
}

function warn(path, message) {
  warnings.push(`${rel(path)}: ${message}`);
}

if (!existsSync(appRoot)) {
  console.error('Syntha V2 workspace is missing:', appRoot);
  process.exit(1);
}

const files = walk(appRoot);
const textFiles = files.filter((path) => ['.md', '.json', '.ts', '.tsx', '.js', '.mjs'].includes(extname(path)));

for (const path of files.filter((file) => extname(file) === '.json')) {
  try {
    JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(path, `invalid JSON: ${error.message}`);
  }
}

const markdownLinkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
for (const path of files.filter((file) => extname(file) === '.md')) {
  const content = readFileSync(path, 'utf8');
  for (const match of content.matchAll(markdownLinkPattern)) {
    const target = match[1].trim();
    if (!target || target.startsWith('#') || /^[a-z]+:\/\//i.test(target) || target.startsWith('mailto:')) continue;
    const withoutAnchor = target.split('#')[0];
    if (!withoutAnchor) continue;
    const resolved = normalize(resolve(dirname(path), decodeURIComponent(withoutAnchor)));
    if (!resolved.startsWith(appRoot)) {
      fail(path, `local link escapes V2 workspace: ${target}`);
    } else if (!existsSync(resolved)) {
      fail(path, `broken local link: ${target}`);
    }
  }
}

const canonicalDocs = [
  'AGENTS.md',
  'CURSOR_START_HERE.md',
  'CURSOR_MASTER_RULES.md',
  'src/README.md',
  'docs/architecture/README.md',
  'docs/architecture/CODE_STRUCTURE.md',
  'docs/architecture/context-map.json'
].map((path) => join(appRoot, path)).filter(existsSync);

for (const path of canonicalDocs) {
  const content = readFileSync(path, 'utf8');
  if (/\bpublic\.ts\b/.test(content)) fail(path, 'public.ts is forbidden; use module root index.ts');
  if (/src\/(features|domain|application|infrastructure|adapters|components)\//.test(content)) {
    fail(path, 'old horizontal root architecture is forbidden');
  }
  if (/\bV2-\d{4}\b/.test(content)) fail(path, 'legacy V2-* task ID is forbidden; use TASK-*');
}

const tasksRoot = join(appRoot, 'tasks');
for (const path of walk(tasksRoot).filter((file) => extname(file) === '.md' && !file.endsWith('/README.md'))) {
  const name = rel