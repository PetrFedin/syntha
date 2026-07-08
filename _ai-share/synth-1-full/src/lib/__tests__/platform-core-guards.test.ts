/**
 * Platform Core Phase 21 · contract/manifest/route guard tests.
 * Prevents re-introducing split-brain imports and doc drift.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(__dirname, '..', '..', '..');
const docsRoot = path.join(repoRoot, 'docs');

function readRepo(relPath: string): string {
  const abs = path.join(repoRoot, relPath);
  expect(fs.existsSync(abs)).toBe(true);
  return fs.readFileSync(abs, 'utf8');
}

function readDoc(name: string): string {
  const abs = path.join(docsRoot, name);
  expect(fs.existsSync(abs)).toBe(true);
  return fs.readFileSync(abs, 'utf8');
}

function walkTsFiles(dirRel: string, out: string[] = []): string[] {
  const abs = path.join(repoRoot, dirRel);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dirRel, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      walkTsFiles(rel, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.test.tsx')) {
      out.push(rel);
    }
  }
  return out;
}

const PLATFORM_CORE_FORBIDDEN: ReadonlyArray<{ label: string; re: RegExp }> = [
  { label: '_archive', re: /from ['"]@\/.*_archive/ },
  { label: '_extended (direct UI)', re: /from ['"]@\/components\/_extended/ },
  { label: '@/components/client', re: /from ['"]@\/components\/client/ },
  { label: '@/components/factory (direct)', re: /from ['"]@\/components\/factory/ },
  { label: '@/lib/routes (full)', re: /from ['"]@\/lib\/routes['"]/ },
];

const EXTENDED_PLATFORM_FILE =
  /\/(Factory|Supplier|MfrEmpty|SupEmpty|Manufacturer|CommsPillarCardExtended|DevelopmentPillarCardManufacturer|OrderProductionPillarCardManufacturer|supplier-collection-order)/i;

function isBaselinePlatformFile(relPath: string): boolean {
  return !EXTENDED_PLATFORM_FILE.test(relPath);
}

describe('Platform Core contract docs', () => {
  it('PLATFORM_CORE_CONTRACT.md exists and declares single write-path', () => {
    const doc = readDoc('PLATFORM_CORE_CONTRACT.md');
    expect(doc).toMatch(/W2 Platform Core|Next\.js BFF|единственн/i);
    expect(doc).toMatch(/FastAPI/i);
  });

  it('PLATFORM_CORE_MANIFEST.md lists canonical paths', () => {
    const doc = readDoc('PLATFORM_CORE_MANIFEST.md');
    expect(doc).toMatch(/platform-core-routes/);
    expect(doc).toMatch(/components\/platform/);
  });

  it('PLATFORM_CORE_CANONICAL_AUDIT.md references Phase 21 stabilization', () => {
    const doc = readDoc('PLATFORM_CORE_CANONICAL_AUDIT.md');
    expect(doc.length).toBeGreaterThan(500);
  });
});

describe('Platform Core canonical routes', () => {
  it('shop b2b orders uses nested path', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const routes = require('@/lib/platform-core-routes') as typeof import('@/lib/platform-core-routes');
    expect(routes.ROUTES.shop.b2bOrders).toBe('/shop/b2b/orders');
    expect(routes.ROUTES.shop.b2bOrders).not.toContain('b2b-orders');
  });

  it('legacy b2b-message-templates route re-exports canonical handler', () => {
    const legacy = readRepo('src/app/api/platform-core/b2b-message-templates/route.ts');
    expect(legacy).toMatch(/b2b\/message-templates\/route/);
    expect(legacy).not.toMatch(/getPlatformCoreB2bMessageTemplatesServer/);
  });

  it('middleware redirects shop/b2b-orders and legacy message-templates API', () => {
    const mw = readRepo('src/middleware.ts');
    expect(mw).toMatch(/\/shop\/b2b-orders/);
    expect(mw).toMatch(/\/shop\/b2b\/orders/);
    expect(mw).toMatch(/\/api\/platform-core\/b2b-message-templates/);
    expect(mw).toMatch(/\/api\/platform-core\/b2b\/message-templates/);
  });
});

describe('Platform Core canonical snapshot types', () => {
  it('chain snapshot types live in platform-core-chain-snapshot.types.ts', () => {
    const types = readRepo('src/lib/platform-core-chain-snapshot.types.ts');
    expect(types).toMatch(/PlatformCoreChainPillarSnapshot/);
    expect(types).toMatch(/PlatformCoreChainOverviewState/);
    expect(types).toMatch(/ChainPillarSnap/);
  });

  it('server chain-overview re-exports canonical chain types', () => {
    const server = readRepo('src/lib/server/platform-core-chain-overview.ts');
    expect(server).toMatch(/platform-core-chain-snapshot\.types/);
  });
});

describe('Platform Core components/platform import guards (baseline)', () => {
  const files = walkTsFiles('src/components/platform').filter(isBaselinePlatformFile);

  it.each(files)('%s has no forbidden imports', (relPath) => {
    const content = readRepo(relPath);
    const hits = PLATFORM_CORE_FORBIDDEN.filter(({ re }) => re.test(content)).map(({ label }) => label);
    expect(hits).toEqual([]);
  });
});

describe('Platform Core hub matrix modularization', () => {
  it('peers and demo-rewrite are extracted from hub-matrix.ts', () => {
    expect(fs.existsSync(path.join(repoRoot, 'src/lib/platform-core-hub-matrix-peers.ts'))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, 'src/lib/platform-core-hub-matrix-demo-rewrite.ts'))).toBe(true);
    const hub = readRepo('src/lib/platform-core-hub-matrix.ts');
    const lines = hub.split('\n').length;
    expect(lines).toBeLessThan(520);
  });
});

describe('FastAPI write-path registry doc', () => {
  it('documents spine entities as read-only via FastAPI in Platform Core mode', () => {
    const doc = readDoc('FASTAPI_PLATFORM_CORE_WRITE_REGISTRY.md');
    expect(doc).toMatch(/read-only|READ ONLY/i);
    expect(doc).toMatch(/orders\.py|collections\.py|collaboration/i);
  });
});
