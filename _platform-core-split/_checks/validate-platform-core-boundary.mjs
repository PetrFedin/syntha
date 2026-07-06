#!/usr/bin/env node
/**
 * Platform Core boundary check (Projects).
 * Проверяет .cursorignore, наличие entry points и запрет broad-import в узком core UI/API.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function walk(relativePath) {
  const root = path.join(repoRoot, relativePath);
  if (!fs.existsSync(root)) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    const stat = fs.lstatSync(current);
    out.push(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) stack.push(path.join(current, entry));
    }
  }
  return out;
}

function relative(absolutePath) {
  return path.relative(repoRoot, absolutePath);
}

// ── Doc pack ──
for (const doc of [
  '_platform-core-split/platform-core/PLATFORM-CORE-DOC-INDEX.md',
  '_platform-core-split/platform-core/CURSOR-START-HERE.md',
  '_platform-core-split/platform-core/PLATFORM-CORE-CURSOR-RUN.md',
  '_platform-core-split/platform-core/PLATFORM-CORE-NO-WORKSHOP2-UI.md',
  '.cursor/rules/platform-core-scope.mdc',
]) {
  if (!exists(doc)) fail(`Missing Platform Core doc/rule: ${doc}`);
}

// ── .cursorignore token guards ──
const cursorignore = exists('.cursorignore') ? read('.cursorignore') : '';
for (const required of [
  '_platform-core-split/platform-core/DEEP-AUDIT-2026-06-21.md',
  '_ai-share/synth-1-full/src/components/brand/production/',
  '_ai-share/synth-1-full/src/lib/routes.ts',
  '_ai-share/synth-1-full/src/lib/production/data/',
  '_ai-share/synth-1-full/src/lib/production/',
  '_ai-share/synth-1-full/src/lib/b2b/',
  '_ai-share/synth-1-full/src/lib/fashion/',
  '_ai-share/synth-1-full/src/lib/communications/',
  '_ai-share/synth-1-full/src/lib/platform/',
  '_ai-share/synth-1-full/src/lib/brand/',
  '_ai-share/synth-1-full/src/app/api/workshop2/',
  '_ai-share/synth-1-full/e2e/',
  '.planning/',
]) {
  if (!cursorignore.includes(required)) {
    fail(`.cursorignore must include ${required}`);
  }
}

// ── Runtime entry points ──
for (const entry of [
  '_ai-share/synth-1-full/src/app/platform/page.tsx',
  '_ai-share/synth-1-full/src/app/platform/layout.tsx',
  '_ai-share/synth-1-full/src/lib/platform-core-hub-matrix.ts',
  '_ai-share/synth-1-full/src/lib/platform-core-cabinet-route.ts',
  '_ai-share/synth-1-full/src/lib/platform-core-native-href.ts',
  '_ai-share/synth-1-full/src/lib/platform-core-strict-routes.ts',
  '_ai-share/synth-1-full/src/_archive/platform-core-legacy-escapes/README.md',
]) {
  if (!exists(entry)) fail(`Missing Platform Core entry: ${entry}`);
}

const clientLayout = read('_ai-share/synth-1-full/src/components/layout/client-layout.tsx');
if (!clientLayout.includes('isPlatformCoreMode')) {
  fail('client-layout must gate Platform Core mode (isPlatformCoreMode).');
}

// ── components/platform: без прямого @/lib/production и @/components/shop/b2b ──
const platformComponentsRoot = '_ai-share/synth-1-full/src/components/platform';
const bannedInPlatformComponents = [
  "from '@/lib/production/",
  'from "@/lib/production"',
  "from '@/lib/b2b/",
  'from "@/lib/b2b/"',
  "from '@/lib/fashion/",
  'from "@/lib/fashion/"',
  "from '@/lib/brand-production/",
  'from "@/lib/brand-production/"',
  "from '@/lib/brand/",
  'from "@/lib/brand/"',
  "from '@/lib/communications/",
  'from "@/lib/communications/"',
  "from '@/lib/platform/",
  'from "@/lib/platform/"',
  "from '@/lib/production-data",
  "from '@/lib/order/",
  "from '@/lib/shop/",
  "from '@/lib/data/entity-links",
  "from '@/lib/server/pg-contextual-message-threads-handler",
  "from '@/lib/server/shop-development-progress-server",
  "from '@/lib/pillar-cabinet-",
  "from '@/lib/marketing/syntha-style-intelligence-hero",
  "from '@/lib/syntha-embed'",
  "from '@/lib/layout/cabinet-route-match'",
];

for (const item of walk(platformComponentsRoot)) {
  if (fs.lstatSync(item).isDirectory()) continue;
  if (!/\.(ts|tsx)$/.test(item)) continue;
  const content = fs.readFileSync(item, 'utf8');
  const rel = relative(item).replace(/\\/g, '/');
  for (const banned of bannedInPlatformComponents) {
    if (content.includes(banned)) {
      fail(`components/platform imports legacy lib directly (use platform-core-ports): ${rel}`);
    }
  }
  if (content.includes('@/components/shop/b2b/')) {
    fail(`components/platform must not import components/shop/b2b (use components/platform/showroom): ${rel}`);
  }
}

// ── Narrow core paths: app/platform + api/platform-core без @/lib/routes ──
const narrowCoreRoots = [
  '_ai-share/synth-1-full/src/app/platform',
  '_ai-share/synth-1-full/src/app/api/platform-core',
];

const bannedInNarrowCore = ["from '@/lib/routes'", 'from "@/lib/routes"'];

for (const activeRoot of narrowCoreRoots) {
  for (const item of walk(activeRoot)) {
    if (fs.lstatSync(item).isDirectory()) continue;
    if (!/\.(ts|tsx)$/.test(item)) continue;
    const content = fs.readFileSync(item, 'utf8');
    for (const banned of bannedInNarrowCore) {
      if (content.includes(banned)) {
        fail(`Narrow core imports lib/routes: ${relative(item)}`);
      }
    }
  }
}

if (failures.length) {
  console.error('Platform Core boundary FAILED:\n' + failures.join('\n'));
  process.exit(1);
}

console.log('Platform Core boundary OK');
