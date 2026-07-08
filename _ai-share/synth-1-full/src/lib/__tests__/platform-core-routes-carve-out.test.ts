/**
 * Platform Core: platform paths must not import broad `@/lib/routes`.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(__dirname, '..');
const scanRoots = [
  'src/components/platform',
  'src/lib/platform-core-hub-matrix.ts',
  'src/lib/platform-core-hub-matrix-rows.ts',
  'src/lib/platform-core-hub-matrix-role-pillar-hrefs.ts',
];

function walk(filePath: string, out: string[] = []): string[] {
  if (!fs.existsSync(filePath)) return out;
  const stat = fs.statSync(filePath);
  if (stat.isFile() && /\.(ts|tsx)$/.test(filePath)) {
    out.push(filePath);
    return out;
  }
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(filePath)) {
      walk(path.join(filePath, entry), out);
    }
  }
  return out;
}

describe('platform-core-routes carve-out', () => {
  it('platform paths do not import @/lib/routes', () => {
    const failures: string[] = [];
    for (const rel of scanRoots) {
      const abs = path.join(repoRoot, rel);
      for (const file of walk(abs)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes("from '@/lib/routes'") || content.includes('from "@/lib/routes"')) {
          failures.push(path.relative(repoRoot, file));
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('platform-core-routes exports ROUTES.brand.coreCabinet', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ROUTES } =
      require('@/lib/platform-core-routes') as typeof import('@/lib/platform-core-routes');
    expect(ROUTES.brand.coreCabinet).toBe('/brand/core');
  });

  it('platform paths do not link to legacy Workshop2 UI routes', () => {
    const failures: string[] = [];
    for (const rel of scanRoots) {
      const abs = path.join(repoRoot, rel);
      for (const file of walk(abs)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('/brand/production/workshop2')) {
          failures.push(path.relative(repoRoot, file));
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
