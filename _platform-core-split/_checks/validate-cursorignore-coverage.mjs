#!/usr/bin/env node
/**
 * Проверка .cursorignore: legacy закрыт, Platform Core allowlist открыт.
 * Запуск из корня Projects: node _platform-core-split/_checks/validate-cursorignore-coverage.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const ignorePath = path.join(repoRoot, '.cursorignore');
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function readIgnore() {
  if (!fs.existsSync(ignorePath)) {
    fail('Missing Projects/.cursorignore');
    return '';
  }
  return fs.readFileSync(ignorePath, 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(repoRoot, rel));
}

/** Строка denylist: path должен быть в ignore (без учёта negation). */
function mustBeDenied(content, relPath) {
  if (!content.split('\n').some((line) => line.trim() === relPath || line.trim() === relPath.replace(/\/$/, ''))) {
    fail(`Denylist missing in .cursorignore: ${relPath}`);
  }
}

/** Allowlist: файл существует и не перекрыт голым deny без negation после. */
function mustBeAllowlisted(content, relPath) {
  if (!exists(relPath)) {
    fail(`Allowlist entry missing on disk: ${relPath}`);
    return;
  }
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  let ignored = false;
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    if (line.startsWith('!')) {
      const un = line.slice(1);
      if (relPath === un || relPath.startsWith(un.replace(/\/$/, '') + '/')) {
        ignored = false;
      }
      continue;
    }
    const deny = line.replace(/\/$/, '');
    if (relPath === deny || relPath.startsWith(deny + '/')) {
      ignored = true;
    }
  }
  if (ignored) {
    fail(`Allowlist path blocked by .cursorignore (add ! exception): ${relPath}`);
  }
}

const content = readIgnore();

// ── Denylist (обязательные строки) ──
for (const p of [
  '_platform-core-split/platform-core/DEEP-AUDIT-2026-06-21.md',
  '_ai-share/synth-1-full/src/lib/production/',
  '_ai-share/synth-1-full/src/lib/b2b/',
  '_ai-share/synth-1-full/src/components/brand/production/',
  '_ai-share/synth-1-full/src/app/shop/b2b/',
  '_ai-share/synth-1-full/src/app/api/workshop2/',
  '_ai-share/synth-1-full/e2e/',
  '_platform-core-split/legacy-rest/',
]) {
  mustBeDenied(content, p);
}

// ── Allowlist (должны быть доступны агенту) ──
for (const p of [
  '_platform-core-split/platform-core/PLATFORM-CORE-TOKEN-BUDGET.md',
  '_platform-core-split/platform-core/PLATFORM-CORE-ISOLATION-MAP.md',
  '_platform-core-split/platform-core/CURSOR-START-HERE.md',
  '_ai-share/synth-1-full/src/app/platform/page.tsx',
  '_ai-share/synth-1-full/src/components/platform/PlatformHubPageClient.tsx',
  '_ai-share/synth-1-full/src/lib/platform-core-hub-matrix.ts',
  '_ai-share/synth-1-full/src/lib/platform-core-native-href.ts',
  '_ai-share/synth-1-full/src/app/brand/core/page.tsx',
  '_ai-share/synth-1-full/src/app/shop/core/page.tsx',
  '_ai-share/synth-1-full/src/app/factory/production/core/page.tsx',
]) {
  mustBeAllowlisted(content, p);
}

// ── Docs pack ──
for (const doc of [
  '_platform-core-split/platform-core/PLATFORM-CORE-ARCHIVE-INTEGRATION-RULES.md',
  '_platform-core-split/platform-core/PLATFORM-CORE-ACTION-CONTRACTS.md',
  '_platform-core-split/platform-core/PLATFORM-CORE-STAGE-GATES.md',
]) {
  if (!exists(doc)) fail(`Missing doc: ${doc}`);
}

if (failures.length) {
  console.error('cursorignore coverage FAILED:\n' + failures.map((f) => `  • ${f}`).join('\n'));
  process.exit(1);
}

console.log('cursorignore coverage OK');
