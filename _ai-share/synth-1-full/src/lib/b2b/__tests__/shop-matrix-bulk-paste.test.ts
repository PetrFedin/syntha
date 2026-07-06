import {
  groupShopMatrixBulkPasteByArticle,
  parseShopMatrixBulkPaste,
} from '@/lib/b2b/shop-matrix-bulk-paste';

describe('shop-matrix-bulk-paste', () => {
  it('parses csv lines and groups by article', () => {
    const raw = `demo-ss27-01, M, 12
demo-ss27-01, L, 8
demo-ss27-02, S, 4`;
    const { lines, errors } = parseShopMatrixBulkPaste(raw);
    expect(errors).toHaveLength(0);
    expect(lines).toHaveLength(3);
    const grouped = groupShopMatrixBulkPasteByArticle(lines);
    expect(grouped.get('demo-ss27-01')).toHaveLength(2);
  });

  it('skips header row', () => {
    const { lines } = parseShopMatrixBulkPaste('Артикул, Размер, qty\ndemo-ss27-01, M, 2');
    expect(lines).toHaveLength(1);
  });
});
