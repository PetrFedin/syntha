import {
  interpolateB2bMessageTemplateBody,
  savePlatformCoreB2bMessageTemplate,
} from '@/lib/communications/platform-core-b2b-message-templates-storage';
import { shouldRequireShopB2bCheckoutJwt } from '@/lib/server/shop-b2b-checkout-auth-policy';

describe('platform-core-b2b-message-templates-storage', () => {
  it('interpolates template placeholders', () => {
    const text = interpolateB2bMessageTemplateBody(
      'Заказ {{orderId}} · {{collectionId}} · {{articleId}}',
      { orderId: 'B2B-1', collectionId: 'SS27', articleId: 'art-1' }
    );
    expect(text).toContain('B2B-1');
    expect(text).toContain('SS27');
    expect(text).toContain('art-1');
  });

  it('savePlatformCoreB2bMessageTemplate rejects empty body', () => {
    expect(
      savePlatformCoreB2bMessageTemplate({
        labelRu: 'Test',
        context: 'b2b_order',
        bodyTemplate: '   ',
      })
    ).toBeNull();
  });
});

describe('shop-b2b-checkout-route-auth policy', () => {
  const prev = process.env.WORKSHOP2_B2B_CHECKOUT_REQUIRE_JWT;

  afterEach(() => {
    if (prev === undefined) delete process.env.WORKSHOP2_B2B_CHECKOUT_REQUIRE_JWT;
    else process.env.WORKSHOP2_B2B_CHECKOUT_REQUIRE_JWT = prev;
  });

  it('does not require JWT in test env by default', () => {
    delete process.env.WORKSHOP2_B2B_CHECKOUT_REQUIRE_JWT;
    expect(shouldRequireShopB2bCheckoutJwt()).toBe(false);
  });

  it('requires JWT when flag is 1', () => {
    process.env.WORKSHOP2_B2B_CHECKOUT_REQUIRE_JWT = '1';
    expect(shouldRequireShopB2bCheckoutJwt()).toBe(true);
  });
});
