import {
  ARTICLE_SPINE_ARCHIVE_SECTION_IDS,
  filterCabinetSectionsForArticleSpine,
  filterPlatformCoreHubRowsForBaseline,
  filterW2MainTabsForCreationMode,
  isArticleCreationMode,
  isArticleSpineArchiveSection,
  isW2MainTabVisibleForCreationMode,
  PLATFORM_CORE_ARTICLE_SPINE_STAGES,
  resolveArticleCreationMode,
  resolveW2MainTabForCreationMode,
  W2_ARTICLE_MAIN_TABS_BUY_OR_IMPORT,
} from '@/lib/platform-core-article-spine';

describe('platform-core-article-spine', () => {
  it('defines ordered spine stages from article to comms', () => {
    expect(PLATFORM_CORE_ARTICLE_SPINE_STAGES[0].id).toBe('article_create');
    expect(PLATFORM_CORE_ARTICLE_SPINE_STAGES.at(-1)?.id).toBe('comms_calendar');
    const fulfillment = PLATFORM_CORE_ARTICLE_SPINE_STAGES.find(
      (s) => s.id === 'order_fulfillment'
    );
    expect(fulfillment?.primaryRoleId).toBe('brand');
  });

  it('marks monetization sections as archive', () => {
    expect(isArticleSpineArchiveSection('brand-co-wssi-plan')).toBe(true);
    expect(isArticleSpineArchiveSection('brand-co-chain')).toBe(true);
    expect(isArticleSpineArchiveSection('brand-dev-w2-hub')).toBe(false);
    expect(isArticleSpineArchiveSection('shop-co-matrix')).toBe(false);
  });

  it('filterCabinetSectionsForArticleSpine is no-op when spine mode off', () => {
    const sections = [{ id: 'brand-co-wssi-plan' }, { id: 'brand-co-registry' }];
    expect(filterCabinetSectionsForArticleSpine(sections)).toEqual(sections);
  });

  it('archive set is stable', () => {
    expect(ARTICLE_SPINE_ARCHIVE_SECTION_IDS.has('shop-co-working-order')).toBe(true);
  });

  it('filters hub rows to brand+shop in two-role baseline', () => {
    const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    const prevExt = process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    delete process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
    const rows = [
      { id: 'brand' as const },
      { id: 'shop' as const },
      { id: 'manufacturer' as const },
    ];
    expect(filterPlatformCoreHubRowsForBaseline(rows).map((r) => r.id)).toEqual(['brand', 'shop']);
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
    if (prevExt === undefined) delete process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
    else process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES = prevExt;
  });

  it('resolveArticleCreationMode defaults to full_production', () => {
    expect(resolveArticleCreationMode(undefined)).toBe('full_production');
    expect(resolveArticleCreationMode({ articleCreationMode: 'buy_or_import' })).toBe(
      'buy_or_import'
    );
    expect(isArticleCreationMode('full_production')).toBe(true);
    expect(isArticleCreationMode('invalid')).toBe(false);
  });

  it('buy_or_import hides production tabs in dossier (Wave 8b)', () => {
    const tabs = [
      { id: 'tz', title: 'ТЗ' },
      { id: 'supply', title: 'Снабжение' },
      { id: 'release', title: 'Производство' },
      { id: 'vault', title: 'Документы' },
    ];
    const filtered = filterW2MainTabsForCreationMode(tabs, 'buy_or_import');
    expect(filtered.map((t) => t.id)).toEqual(['tz', 'vault']);
    expect(W2_ARTICLE_MAIN_TABS_BUY_OR_IMPORT).toContain('fit');
    expect(isW2MainTabVisibleForCreationMode('release', 'buy_or_import')).toBe(false);
    expect(isW2MainTabVisibleForCreationMode('release', 'full_production')).toBe(true);
    expect(resolveW2MainTabForCreationMode('release', 'buy_or_import')).toBe('tz');
    expect(resolveW2MainTabForCreationMode('fit', 'buy_or_import')).toBe('fit');
  });
});
