import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(__dirname, '..', '..', '..', '..');
const platformRoot = path.join(repoRoot, 'components', 'platform');

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      walkFiles(abs, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name)) out.push(abs);
  }
  return out;
}

function rel(abs: string): string {
  return path.relative(repoRoot, abs);
}

const ALLOWED_SHARED_CANONICAL = [
  'components/platform/shared/PlatformCoreEmptyState.tsx',
  'components/platform/shared/PlatformCoreDataTable.tsx',
  'components/platform/shared/PlatformCoreSectionHeader.tsx',
];

const NOISE_PATTERNS: ReadonlyArray<{ label: string; re: RegExp }> = [
  { label: 'English empty state copy', re: /No data|Nothing here|No results|Coming soon/i },
  { label: 'decorative hero language', re: /hero/i },
];

describe('Platform Core UI anti-drift scan', () => {
  const files = walkFiles(platformRoot).filter((abs) => !ALLOWED_SHARED_CANONICAL.includes(rel(abs)));

  it('does not introduce local empty-state or decorative hero copy in platform components', () => {
    const hits = files.flatMap((abs) => {
      const src = fs.readFileSync(abs, 'utf8');
      return NOISE_PATTERNS.filter(({ re }) => re.test(src)).map(({ label }) => `${rel(abs)}: ${label}`);
    });

    expect(hits).toEqual([]);
  });

  it('keeps local components from declaring new canonical PlatformCore shared shells ad hoc', () => {
    const offenders = files
      .filter((abs) => !rel(abs).includes('components/platform/shared/'))
      .filter((abs) => /export function PlatformCore(EmptyState|DataTable|SectionHeader)/.test(fs.readFileSync(abs, 'utf8')))
      .map(rel);

    expect(offenders).toEqual([]);
  });
});
