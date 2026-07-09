import fs from 'node:fs';
import path from 'node:path';

import {
  PLATFORM_CORE_SHARED_UI_MANIFEST,
  getPlatformCoreSharedUiComponentNames,
  getPlatformCoreSharedUiManifestItem,
} from '@/lib/platform-core-shared-ui-manifest';

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

  it('PlatformCoreDataTable reuses PlatformCoreSectionHeader instead of local header typography', () => {
    const src = readSharedComponent('PlatformCoreDataTable.tsx');
    expect(src).toMatch(/PlatformCoreSectionHeader/);
    expect(src).not.toMatch(/getPlatformCoreTypographyRole/);
    expect(src).not.toMatch(/sectionTitle/);
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

  it('shared barrel exports all canonical Platform Core UI shells', () => {
    const src = readSharedComponent('index.ts');
    expect(src).toMatch(/PlatformCoreDataTable/);
    expect(src).toMatch(/PlatformCoreEmptyState/);
    expect(src).toMatch(/PlatformCoreSectionHeader/);
    expect(src).not.toMatch(/default/);
  });

  it('shared UI manifest lists only existing canonical shared components', () => {
    expect(getPlatformCoreSharedUiComponentNames()).toEqual([
      'PlatformCoreSectionHeader',
      'PlatformCoreDataTable',
      'PlatformCoreEmptyState',
    ]);

    for (const item of PLATFORM_CORE_SHARED_UI_MANIFEST) {
      expect(item.componentName).toMatch(/^PlatformCore/);
      expect(item.importPath).toMatch(/^@\/components\/platform\/shared\//);
      expect(item.replacesRu.length).toBeGreaterThanOrEqual(2);
      expect(item.requiredFor.length).toBeGreaterThanOrEqual(2);
      expect(item.migrationRuleRu.length).toBeGreaterThan(40);
      expect(readSharedComponent(`${item.componentName}.tsx`)).toContain(`export function ${item.componentName}`);
    }
  });

  it('shared UI manifest has lookup helpers for migration-safe usage', () => {
    expect(getPlatformCoreSharedUiManifestItem('section_header')?.componentName).toBe(
      'PlatformCoreSectionHeader'
    );
    expect(getPlatformCoreSharedUiManifestItem('data_table')?.componentName).toBe(
      'PlatformCoreDataTable'
    );
    expect(getPlatformCoreSharedUiManifestItem('empty_state')?.componentName).toBe(
      'PlatformCoreEmptyState'
    );
  });
});
