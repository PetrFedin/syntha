import { resolveShopShowroomCoverHero } from '@/lib/b2b/shop-showroom-cover-hero';

describe('shop-showroom-cover-hero', () => {
  it('prefers dossier hero over partner cover', () => {
    const hero = resolveShopShowroomCoverHero({
      dossierHeroUrl: 'https://cdn.example/dossier.jpg',
      partnerCoverUrl: 'https://cdn.example/partner.jpg',
    });
    expect(hero?.source).toBe('dossier');
    expect(hero?.labelRu).toContain('dossier');
  });

  it('falls back to partner cover then logo', () => {
    expect(
      resolveShopShowroomCoverHero({ partnerCoverUrl: 'https://cdn.example/cover.jpg' })?.source
    ).toBe('partner-cover');
    expect(
      resolveShopShowroomCoverHero({ partnerLogoUrl: 'https://cdn.example/logo.jpg' })?.source
    ).toBe('partner-logo');
  });
});
