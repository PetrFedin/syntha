import { collectWorkshop2B2bCartPackViolations } from '@/lib/production/workshop2-b2b-cart-pack-rules';

describe('workshop2-b2b-cart-pack-rules', () => {
  it('flags qty not divisible by case pack', () => {
    const violations = collectWorkshop2B2bCartPackViolations({
      session: {
        lines: [
          {
            collectionId: 'SS27',
            articleId: 'demo-ss27-01',
            colorCode: 'NAV',
            size: 'M',
            qty: 5,
            wholesalePriceRub: 1000,
          },
        ],
      },
      casePackByArticleKey: new Map([['SS27:demo-ss27-01', 6]]),
    });
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('кратно 6');
  });

  it('passes when qty matches pack multiple', () => {
    const violations = collectWorkshop2B2bCartPackViolations({
      session: {
        lines: [
          {
            collectionId: 'SS27',
            articleId: 'demo-ss27-01',
            colorCode: 'NAV',
            size: 'M',
            qty: 3,
            wholesalePriceRub: 1000,
          },
          {
            collectionId: 'SS27',
            articleId: 'demo-ss27-01',
            colorCode: 'NAV',
            size: 'L',
            qty: 3,
            wholesalePriceRub: 1000,
          },
        ],
      },
      casePackByArticleKey: new Map([['SS27:demo-ss27-01', 6]]),
    });
    expect(violations).toHaveLength(0);
  });
});
