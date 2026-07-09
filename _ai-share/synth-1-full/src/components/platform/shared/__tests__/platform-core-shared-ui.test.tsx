import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(__dirname, '..', '..', '..', '..');

function readSharedComponent(fileName: string): string {
  const abs = path.join(repoRoot, 'components', 'platform', 'shared', fileName);
  expect(fs.existsSync(abs)).toBe(true);
  return fs.readFileSync(abs, 'utf8');
}

describe('Platform Core shared UI shells', () => {
  it('PlatformCoreEmptyState stays tied to the density contract and one-next-action rule', () => {
    const src = readSharedComponent('PlatformCoreEmptyState.tsx');
    expect(src).toMatch(/getPlatformCoreContainerRole/);
    expect(src).toMatch(/getPlatformCoreTypographyRole/);
    expect(src).toMatch(/nextActionLabel/);
    expect(src).toMatch(/nextActionHref/);
    expect(src).toMatch(/data-platform-core-empty-state="canonical"/);
    expect(src).not.toMatch(/hero/i);
  });

  it('PlatformCoreDataTable uses the canonical empty state instead of local ad-hoc empty UI', () => {
    const src = readSharedComponent('PlatformCoreDataTable.tsx');
    expect(src).toMatch(/PlatformCoreEmptyState/);
    expect(src).toMatch(/isEmpty/);
    expect(src).toMatch(/emptyReason/);
    expect(src).toMatch(/emptyNextActionLabel/);
    expect(src).not.toMatch(/No data/);
    expect(src).not.toMatch(/Nothing here/);
  });

  it('PlatformCoreDataTable remains a migration-safe shell and keeps children compatibility', () => {
    const src = readSharedComponent('PlatformCoreDataTable.tsx');
    expect(src).toMatch(/children\?: ReactNode/);
    expect(src).toMatch(/hubCabinet\.listChrome/);
    expect(src).toMatch(/table_shell/);
    expect(src).toMatch(/overflow-x-auto/);
  });

  it('PlatformCoreSectionHeader standardizes title, context and one primary action', () => {
    const src = readSharedComponent('PlatformCoreSectionHeader.tsx');
    expect(src).toMatch(/data-platform-core-section-header="canonical"/);
    expect(src).toMatch(/primaryAction/);
    expect(src).toMatch(/secondaryActions/);
    expect(src).toMatch(/getPlatformCoreTypographyRole/);
    expect(src).toMatch(/section_title/);
    expect(src).toMatch(/meta/);
    expect(src).not.toMatch(/hero/i);
  });
});
