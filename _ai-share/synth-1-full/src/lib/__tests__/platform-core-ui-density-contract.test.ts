import {
  PLATFORM_CORE_CONTAINER_TOKENS,
  PLATFORM_CORE_NOISE_RULES,
  PLATFORM_CORE_SPACING_TOKENS,
  PLATFORM_CORE_TYPOGRAPHY_TOKENS,
  getPlatformCoreContainerRole,
  getPlatformCoreTypographyRole,
} from '@/lib/platform-core-ui-density-contract';

describe('Platform Core UI density contract', () => {
  it('uses only the approved compact spacing scale', () => {
    expect(PLATFORM_CORE_SPACING_TOKENS.map((token) => token.value)).toEqual([
      '4px',
      '8px',
      '12px',
      '16px',
      '20px',
      '24px',
      '32px',
    ]);
  });

  it('defines all required typography roles without oversized platform text', () => {
    const roles = PLATFORM_CORE_TYPOGRAPHY_TOKENS.map((token) => token.role);
    expect(roles).toEqual([
      'page_title',
      'section_title',
      'card_title',
      'body',
      'meta',
      'badge',
      'button',
      'table_header',
      'table_cell',
    ]);

    const oversized = PLATFORM_CORE_TYPOGRAPHY_TOKENS.filter(
      (token) => Number(token.fontSize.replace('px', '')) > 24
    );
    expect(oversized).toEqual([]);
  });

  it('keeps typography lookup helpers in sync with the contract', () => {
    expect(getPlatformCoreTypographyRole('page_title')?.fontSize).toBe('24px');
    expect(getPlatformCoreTypographyRole('table_cell')?.fontSize).toBe('13px');
    expect(getPlatformCoreTypographyRole('badge')?.fontWeight).toBe(600);
  });

  it('defines compact container roles for the platform workspace', () => {
    const roles = PLATFORM_CORE_CONTAINER_TOKENS.map((token) => token.role);
    expect(roles).toEqual([
      'page',
      'section',
      'card',
      'compact_card',
      'panel',
      'table_shell',
      'dialog',
    ]);

    expect(getPlatformCoreContainerRole('page')?.maxWidth).toBe('1280px');
    expect(getPlatformCoreContainerRole('compact_card')?.minHeight).toBe('72px');
    expect(getPlatformCoreContainerRole('table_shell')?.padding).toBe('0');
  });

  it('prevents decorative noise from becoming an accepted baseline pattern', () => {
    expect(PLATFORM_CORE_NOISE_RULES).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/одно главное действие/i),
        expect.stringMatching(/пустые hero-блоки/i),
        expect.stringMatching(/Empty state/i),
      ])
    );
  });
});
