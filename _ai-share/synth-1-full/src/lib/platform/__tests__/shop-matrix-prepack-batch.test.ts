import {
  prepackApplyBatchRequestKey,
  prepackApplyRequestKey,
} from '@/lib/b2b/shop-matrix-prepack-apply';

describe('shop-matrix-prepack batch', () => {
  it('builds stable batch key regardless of order', () => {
    const a = { articleId: 'art-a', packCount: 2 };
    const b = { articleId: 'art-b', packCount: 1 };
    expect(prepackApplyBatchRequestKey([a, b])).toBe(prepackApplyBatchRequestKey([b, a]));
    expect(prepackApplyRequestKey(a)).toBe('art-a:2');
  });
});
