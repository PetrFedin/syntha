/**
 * Phase 22.5 · final Platform Core boundary guards (baseline ring A).
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(__dirname, '..', '..', '..');

/** Hard block — must never appear in baseline ring A. */
const FORBIDDEN: ReadonlyArray<{ label: string; re: RegExp }> = [
  { label: '_archive', re: /from ['"]@\/.*_archive/ },
  { label: '_extended UI', re: /from ['"]@\/components\/_extended/ },
  { label: '@/components/client', re: /from ['"]@\/components\/client/ },
  { label: '@/components/factory', re: /from ['"]@\/components\/factory/ },
  { label: '@/components/wardrobe', re: /from ['"]@\/components\/wardrobe/ },
  { label: '@/components/distributor', re: /from ['"]@\/components\/distributor/ },
  { label: '@/lib/routes (full)', re: /from ['"]@\/lib\/routes['"]/ },
  { label: '@/lib/marketing', re: /from ['"]@\/lib\/marketing/ },
  { label: '@/lib/academy', re: /from ['"]@\/lib\/academy/ },
  { label: '@/lib/analytics', re: /from ['"]@\/lib\/analytics/ },
  { label: '@/lib/experiments', re: /from ['"]@\/lib\/experiments/ },
  { label: '@/lib/loyalty', re: /from ['"]@\/lib\/loyalty/ },
  { label: '@/lib/auctions', re: /from ['"]@\/lib\/auctions/ },
  { label: '@/app/client', re: /from ['"]@\/app\/client/ },
  { label: '@/app/academy', re: /from ['"]@\/app\/academy/ },
  { label: '@/app/admin', re: /from ['"]@\/app\/admin/ },
  { label: 'hub-matrix-rows-extended direct', re: /from ['"]@\/lib\/platform-core-hub-matrix-rows-extended['"]/ },
];

const EXTENDED_UI_FILE =
  /\/(Factory|Supplier|MfrEmpty|SupEmpty|Manufacturer|CommsPillarCardExtended|DevelopmentPillarCardManufacturer|OrderProductionPillarCardManufacturer|supplier-collection-order|\/extended\/)/i;

const BASELINE_RING_A_LIB = [
  'src/lib/platform-core-routes.ts',
  'src/lib/platform-core-hub-matrix.ts',
  'src/lib/platform-core-hub-matrix-peers.ts',
  'src/lib/platform-core-hub-matrix-demo-rewrite.ts',
  'src/lib/platform-core-hub-matrix-rows.ts',
  'src/lib/platform-core-article-spine.ts',
  'src/lib/platform-core-services.ts',
  'src/lib/platform-core-empty-state.ts',
  'src/lib/platform-core-chain-snapshot.types.ts',
  'src/lib/platform-core-cabinet-chrome.ts',
  'src/lib/platform-core-cabinet-workspace.ts',
  'src/lib/platform-core-two-role-sections.ts',
] as const;

/** Baseline UI still linking factory dossier via extended-routes facade — must not grow. */
const BASELINE_EXTENDED_ROUTES_DEBT_CAP = 12;

function walkTs(dirRel: string, out: string[] = []): string[] {
  const abs = path.join(repoRoot, dirRel);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dirRel, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      walkTs(rel, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

function read(rel: string): string {
  return fs.readFileSync(path.join(repoRoot, rel), 'utf8');
}

function forbiddenHits(content: string): string[] {
  return FORBIDDEN.filter(({ re }) => re.test(content)).map(({ label }) => label);
}

const baselinePlatformUi = walkTs('src/components/platform').filter(
  (f) => !EXTENDED_UI_FILE.test(f)
);

describe('Phase 22.5 final core boundaries', () => {
  it.each(baselinePlatformUi)('components/platform baseline %s has no forbidden imports', (rel) => {
    expect(forbiddenHits(read(rel))).toEqual([]);
  });

  it.each(BASELINE_RING_A_LIB)('ring A lib %s has no forbidden imports', (rel) => {
    expect(fs.existsSync(path.join(repoRoot, rel))).toBe(true);
    expect(forbiddenHits(read(rel))).toEqual([]);
  });

  it('baseline UI extended-routes debt does not grow', () => {
    const debt = baselinePlatformUi.filter((rel) =>
      read(rel).includes("from '@/lib/platform-core-extended-routes'")
    );
    expect(debt.length).toBeLessThanOrEqual(BASELINE_EXTENDED_ROUTES_DEBT_CAP);
  });

  it('canonical services barrel exports documents + comms gateways', () => {
    const svc = read('src/lib/platform-core-services.ts');
    expect(svc).toMatch(/getPlatformCoreDocumentsForArticle/);
    expect(svc).toMatch(/getPlatformCoreCommsForOrder/);
  });

  it('canonical empty state re-exports design-system', () => {
    const es = read('src/lib/platform-core-empty-state.ts');
    expect(es).toMatch(/design-system\/empty-state/);
  });

  it('PlatformCoreDataTable uses hubCabinet.listChrome', () => {
    const dt = read('src/components/platform/shared/PlatformCoreDataTable.tsx');
    expect(dt).toMatch(/hubCabinet\.listChrome/);
  });

  it('PeerStrip shell adopted by CO/CM baseline strips', () => {
    for (const rel of [
      'src/components/platform/BrandCoCabinetSpinePeerStrip.tsx',
      'src/components/platform/BrandCmCabinetSpinePeerStrip.tsx',
      'src/components/platform/ShopCmCabinetSpinePeerStrip.tsx',
      'src/components/platform/BrandCmOrderContextPeerStrip.tsx',
      'src/components/platform/ShopCmOrderContextPeerStrip.tsx',
    ]) {
      expect(read(rel)).toMatch(/PlatformCoreSpinePeerStripShell/);
    }
  });
});
