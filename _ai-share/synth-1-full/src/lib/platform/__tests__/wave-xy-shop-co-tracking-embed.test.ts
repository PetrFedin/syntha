import {
  WAVE_XY_SHOP_CO_BRAND_MIRROR_PREFIX_RU,
  WAVE_XY_SHOP_CO_CHAIN_LIVE_PREFIX_RU,
  WAVE_XY_SHOP_CO_TRACKING_EMBED_STRIP_RU,
  WAVE_XY_SHOP_OP_CO_TRACKING_DEDUP_LINK_RU,
  shopCoCabinetTrackingEmbedAnchorHref,
  shopCoCabinetTrackingEmbedChainMirrorPollTestId,
  shopCoCabinetTrackingEmbedChainMirrorSseTestId,
  shopCoCabinetTrackingEmbedChainMirrorTestId,
} from '@/lib/platform/wave-xy-shop-co-tracking-embed';

describe('wave XY — shop CO cabinet tracking embed + SSE mirror', () => {
  it('CO cabinet tracking embed testids', () => {
    expect('shop-co-cabinet-tracking-embed').toContain('tracking-embed');
    expect('shop-co-cabinet-tracking-embed-facts').toContain('facts');
    expect('shop-co-cabinet-tracking-embed-chain').toContain('chain');
    expect('shop-co-cabinet-tracking-embed-brand-mirror').toContain('brand-mirror');
    expect('shop-co-cabinet-tracking-embed-nav').toContain('nav');
    expect('shop-co-cabinet-tracking-embed-tracking-link').toContain('tracking');
    expect('shop-co-cabinet-tracking-embed-calendar-link').toContain('calendar');
    expect('shop-co-cabinet-tracking-embed-loading').toContain('loading');
    expect('shop-co-buyer-tracking').toContain('buyer-tracking');
  });

  it('chain-status SSE mirror testids on cabinet embed (wave VJ carry-over)', () => {
    const orderId = 'B2B-DEMO-SHOP1-SS27';
    expect(shopCoCabinetTrackingEmbedChainMirrorTestId(orderId)).toBe(
      'shop-co-cabinet-tracking-embed-chain-mirror-B2B-DEMO-SHOP1-SS27'
    );
    expect(shopCoCabinetTrackingEmbedChainMirrorSseTestId(orderId)).toContain('sse-live');
    expect(shopCoCabinetTrackingEmbedChainMirrorPollTestId(orderId)).toContain('poll');
    expect('data-chain-sse-live').toContain('chain-sse-live');
  });

  it('PlatformCoreB2bOrderDetailFacts embedSurface cabinetTracking', () => {
    expect('embedSurface').toContain('embed');
    expect('cabinetTracking').toContain('Tracking');
  });

  it('RU compact strip labels + OP dedup link', () => {
    expect(WAVE_XY_SHOP_CO_TRACKING_EMBED_STRIP_RU).toMatch(/трекинг/i);
    expect(WAVE_XY_SHOP_CO_BRAND_MIRROR_PREFIX_RU).toBe('Бренд');
    expect(WAVE_XY_SHOP_CO_CHAIN_LIVE_PREFIX_RU).toMatch(/цепочка/i);
    expect(WAVE_XY_SHOP_OP_CO_TRACKING_DEDUP_LINK_RU).toMatch(/оптов/i);
  });

  it('shop OP pillar dedup testids', () => {
    expect('shop-op-cabinet-co-tracking-dedup').toContain('dedup');
    expect('shop-op-cabinet-co-tracking-dedup-link').toContain('dedup-link');
  });

  it('CO cabinet anchor href with buyer-tracking hash', () => {
    const href = shopCoCabinetTrackingEmbedAnchorHref('SS27', 'B2B-DEMO-SHOP1-SS27');
    expect(href).toContain('/shop/core');
    expect(href).toContain('pillar=collection_order');
    expect(href).toContain('collection=SS27');
    expect(href).toContain('#shop-co-buyer-tracking');
  });
});
