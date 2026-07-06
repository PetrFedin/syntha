import {
  validateShopMatrixSizeRunDistribution,
  validateShopMatrixSizeRunMoq,
} from '@/lib/b2b/shop-matrix-size-run-validate';

describe('validateShopMatrixSizeRunDistribution', () => {
  it('passes when qty matches default curve proportions', () => {
    const curve = { XS: 1, S: 2, M: 3, L: 2, XL: 1 };
    const qtyBySize = { XS: 10, S: 20, M: 30, L: 20, XL: 10 };
    const result = validateShopMatrixSizeRunDistribution({ qtyBySize, expectedCurve: curve });
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('flags size outside curve', () => {
    const result = validateShopMatrixSizeRunDistribution({
      qtyBySize: { XXL: 12 },
      expectedCurve: { S: 2, M: 3, L: 2 },
    });
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes('XXL'))).toBe(true);
  });
});

describe('validateShopMatrixSizeRunMoq', () => {
  it('passes when qty meets MOQ per cell', () => {
    const result = validateShopMatrixSizeRunMoq({ qtyBySize: { M: 6 }, moqPerCell: 6 });
    expect(result.ok).toBe(true);
  });
});
