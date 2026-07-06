import {
  normalizeShopCoreBuyerId,
  resolveShopCoreBuyerIdFromClient,
  resolveShopCoreBuyerIdFromOrganization,
  resolveShopCoreBuyerIdFromPartnerEmail,
  resolveShopCoreBuyerIdFromSessionUid,
  shopCoreBuyerLabelRu,
} from '@/lib/order/shop-core-buyer-context';

describe('shop-core-buyer-context', () => {
  it('defaults unknown buyer to shop1', () => {
    expect(normalizeShopCoreBuyerId('unknown')).toBe('shop1');
    expect(normalizeShopCoreBuyerId(null)).toBe('shop1');
  });

  it('accepts shop1 and shop2 presets', () => {
    expect(normalizeShopCoreBuyerId('shop2')).toBe('shop2');
    expect(shopCoreBuyerLabelRu('shop2')).toContain('Петербург');
  });

  it('resolves client priority search → org → cookie → storage', () => {
    expect(
      resolveShopCoreBuyerIdFromClient({
        searchBuyer: 'shop2',
        cookieBuyer: 'shop1',
        storageBuyer: 'shop1',
      })
    ).toBe('shop2');
    expect(
      resolveShopCoreBuyerIdFromClient({
        cookieBuyer: 'shop2',
      })
    ).toBe('shop2');
  });

  it('maps platform org ids to buyer presets', () => {
    expect(resolveShopCoreBuyerIdFromOrganization('org-shop-001')).toBe('shop1');
    expect(resolveShopCoreBuyerIdFromOrganization('retail_msk_2')).toBe('shop2');
    expect(resolveShopCoreBuyerIdFromOrganization('buyer-demo')).toBe('shop1');
    expect(resolveShopCoreBuyerIdFromOrganization('unknown-org')).toBeUndefined();
  });

  it('prefers mapped org over stale cookie', () => {
    expect(
      resolveShopCoreBuyerIdFromClient({
        activeOrganizationId: 'retail_msk_2',
      })
    ).toBe('shop2');
    expect(
      resolveShopCoreBuyerIdFromClient({
        cookieBuyer: 'shop1',
        activeOrganizationId: 'retail_msk_2',
      })
    ).toBe('shop2');
    expect(
      resolveShopCoreBuyerIdFromClient({
        searchBuyer: 'shop1',
        activeOrganizationId: 'retail_msk_2',
      })
    ).toBe('shop1');
  });

  it('maps retailer ids and onboarding org aliases', () => {
    expect(resolveShopCoreBuyerIdFromOrganization('shop2')).toBe('shop2');
    expect(resolveShopCoreBuyerIdFromOrganization('org-shop-002')).toBe('shop2');
    expect(resolveShopCoreBuyerIdFromOrganization('retail_spb_1')).toBe('shop2');
    expect(resolveShopCoreBuyerIdFromOrganization('buyer-demo-spb')).toBe('shop2');
    expect(resolveShopCoreBuyerIdFromOrganization('acme-retail-spb-onboarding')).toBe('shop2');
  });

  it('maps session uid to buyer preset', () => {
    expect(resolveShopCoreBuyerIdFromSessionUid('shop-002')).toBe('shop2');
    expect(resolveShopCoreBuyerIdFromSessionUid('shop-001')).toBe('shop1');
    expect(resolveShopCoreBuyerIdFromSessionUid('unknown')).toBeUndefined();
  });

  it('maps partner invite email to shop buyer preset', () => {
    expect(resolveShopCoreBuyerIdFromPartnerEmail('buyer@shop-demo.local')).toBe('shop1');
    expect(resolveShopCoreBuyerIdFromPartnerEmail('buyer-demo-spb@shop-demo.local')).toBe('shop2');
  });

  it('prefers org over session uid over stale cookie', () => {
    expect(
      resolveShopCoreBuyerIdFromClient({
        sessionUid: 'shop-001',
        cookieBuyer: 'shop2',
      })
    ).toBe('shop1');
    expect(
      resolveShopCoreBuyerIdFromClient({
        activeOrganizationId: 'retail_msk_2',
        sessionUid: 'shop-001',
      })
    ).toBe('shop2');
  });
});
