import {
  isInvestorBriefPathname,
  resolveCanonicalInvestorUrl,
  resolveInvestorContactUrl,
} from '@/lib/investors/investor-brief-route';

describe('investor brief route', () => {
  it('recognizes only the presentation route family', () => {
    expect(isInvestorBriefPathname('/investors')).toBe(true);
    expect(isInvestorBriefPathname('/investors/')).toBe(true);
    expect(isInvestorBriefPathname('/investors/preview')).toBe(true);
    expect(isInvestorBriefPathname('/platform')).toBe(false);
    expect(isInvestorBriefPathname('/')).toBe(false);
  });

  it('prefers configured canonical URL and strips campaign data', () => {
    expect(
      resolveCanonicalInvestorUrl(
        'https://syntha.example/investors?utm_source=qr#platform',
        'https://fallback.example'
      )
    ).toBe('https://syntha.example/investors');
  });

  it('falls back to current origin without inventing a host', () => {
    expect(resolveCanonicalInvestorUrl(undefined, 'https://preview.example')).toBe(
      'https://preview.example/investors'
    );
  });

  it('rejects unsafe protocols', () => {
    expect(resolveCanonicalInvestorUrl('javascript:alert(1)', 'https://preview.example')).toBe(
      'https://preview.example/investors'
    );
    expect(resolveCanonicalInvestorUrl(undefined, 'javascript:alert(1)')).toBeNull();
    expect(resolveInvestorContactUrl('javascript:alert(1)')).toBeNull();
  });

  it('supports https and mailto contact destinations', () => {
    expect(resolveInvestorContactUrl('https://syntha.example/contact')).toBe(
      'https://syntha.example/contact'
    );
    expect(resolveInvestorContactUrl('mailto:partners@syntha.example')).toBe(
      'mailto:partners@syntha.example'
    );
  });
});
