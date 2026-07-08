/**
 * Platform Core v1 · import boundary guards.
 *
 * Baseline Platform Core не должен тянуть полный `@/lib/routes`, archive/extended
 * или factory/supplier UI. Тест падает при повторном «загрязнении» ядра.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(__dirname, '..', '..', '..');

const BASELINE_FILES = [
  'src/app/brand/core/page.tsx',
  'src/app/shop/core/page.tsx',
  'src/components/platform/PlatformCoreCabinetPage.tsx',
  'src/components/platform/RoleCoreCabinetHub.tsx',
  'src/lib/platform-core-hub-matrix-rows.ts',
  'src/lib/platform-core-routes.ts',
  'src/lib/platform-core-hub-matrix.ts',
  'src/lib/platform-core-hub-matrix-peers.ts',
  'src/lib/platform-core-hub-matrix-demo-rewrite.ts',
  'src/lib/platform-core-article-spine.ts',
  'src/lib/platform-core-chain-snapshot.types.ts',
] as const;

const FORBIDDEN_PATTERNS: ReadonlyArray<{ label: string; re: RegExp }> = [
  { label: '@/lib/routes', re: /from ['"]@\/lib\/routes['"]/ },
  { label: '_archive', re: /from ['"]@\/.*_archive/ },
  { label: '_extended', re: /from ['"]@\/.*_extended/ },
  { label: 'src/app/client', re: /from ['"]@\/app\/client/ },
  { label: '@/components/client', re: /from ['"]@\/components\/client/ },
  { label: '@/components/wardrobe', re: /from ['"]@\/components\/wardrobe/ },
  { label: '@/components/factory', re: /from ['"]@\/components\/factory/ },
  { label: '@/components/distributor', re: /from ['"]@\/components\/distributor/ },
  {
    label: 'platform-core-hub-matrix-rows-extended',
    re: /from ['"]@\/lib\/platform-core-hub-matrix-rows-extended['"]/,
  },
  {
    label: 'platform-core-extended-routes',
    re: /from ['"]@\/lib\/platform-core-extended-routes['"]/,
  },
  {
    label: 'platform-core-legacy-routes',
    re: /from ['"]@\/lib\/platform-core-legacy-routes['"]/,
  },
];

function readBaseline(relPath: string): string {
  const abs = path.join(repoRoot, relPath);
  expect(fs.existsSync(abs)).toBe(true);
  return fs.readFileSync(abs, 'utf8');
}

describe('platform-core import boundaries (v1 baseline)', () => {
  it.each(BASELINE_FILES)('%s has no forbidden imports', (relPath) => {
    const content = readBaseline(relPath);
    const hits = FORBIDDEN_PATTERNS.filter(({ re }) => re.test(content)).map(({ label }) => label);
    expect(hits).toEqual([]);
  });

  it('platform-core-routes exports only brand/shop ROUTES keys', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ROUTES } =
      require('@/lib/platform-core-routes') as typeof import('@/lib/platform-core-routes');
    expect(Object.keys(ROUTES)).toEqual(['brand', 'shop']);
    expect(ROUTES.brand.coreCabinet).toBe('/brand/core');
    expect(ROUTES.shop.coreCabinet).toBe('/shop/core');
  });

  it('platform-core-extended-routes owns factory ROUTES', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ROUTES } =
      require('@/lib/platform-core-extended-routes') as typeof import('@/lib/platform-core-extended-routes');
    expect(Object.keys(ROUTES)).toEqual(['factory']);
    expect(ROUTES.factory.productionCoreCabinet).toBe('/factory/production/core');
  });

  it('platform-core-legacy-routes exposes LEGACY_ROUTES paths', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { LEGACY_ROUTES } =
      require('@/lib/platform-core-legacy-routes') as typeof import('@/lib/platform-core-legacy-routes');
    expect(LEGACY_ROUTES.shop.b2bCatalog).toBe('/shop/b2b/catalog');
    expect(LEGACY_ROUTES.brand.tradeShows).toBe('/brand/b2b/trade-shows');
  });
});
