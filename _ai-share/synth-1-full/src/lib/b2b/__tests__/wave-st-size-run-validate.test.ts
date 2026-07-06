import { validateShopMatrixSizeRunMoq } from '@/lib/b2b/shop-matrix-size-run-validate';

describe('wave-st-size-run-validate', () => {
  it('passes when all active sizes meet MOQ', () => {
    const result = validateShopMatrixSizeRunMoq({
      qtyBySize: { S: 6, M: 12, L: 6 },
      moqPerCell: 6,
    });
    expect(result.ok).toBe(true);
  });

  it('ignores zero qty sizes', () => {
    const result = validateShopMatrixSizeRunMoq({
      qtyBySize: { S: 0, M: 6 },
      moqPerCell: 6,
    });
    expect(result.ok).toBe(true);
  });

  it('returns Russian message for violations', () => {
    const result = validateShopMatrixSizeRunMoq({
      qtyBySize: { L: 3 },
      moqPerCell: 6,
    });
    expect(result.ok).toBe(false);
    expect(result.messageRu).toContain('MOQ');
  });
});
