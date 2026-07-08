import {
  annotatePillarCrossLink,
  pillarCrossLinkRequiresOrder,
} from '@/lib/platform/pillar-cross-link-order-policy';
import {
  applyShopMatrixTierToCartItem,
  mapPriceTierToWorkshop2CartTier,
} from '@/lib/b2b/shop-matrix-cart-tier';
import { resolveShopMatrixUnitPrice } from '@/lib/b2b/shop-matrix-tier-pricing';
import {
  brandCommsEntityThreadAttachTzMessage,
  brandCommsEntityThreadSupportsAttachTz,
} from '@/lib/fashion/brand-comms-entity-thread-attach-tz';
import {
  factoryCommsEntityThreadAttachTzMessage,
  manufacturerCommsEntityThreadSupportsAttachTz,
  supplierCommsEntityThreadSupportsAttachTz,
} from '@/lib/fashion/factory-comms-entity-thread-attach-tz';

describe('pillar-cross-link-order-policy', () => {
  it('disables order-scoped capabilities without orderId', () => {
    expect(pillarCrossLinkRequiresOrder('comms-order-context', { role: 'shop' })).toBe(true);
    const link = annotatePillarCrossLink(
      { label: 'Чат по заказу', href: '/shop/b2b/tracking' },
      'comms-order-context',
      { role: 'shop' }
    );
    expect(link.disabled).toBe(true);
    expect(link.disabledReasonRu).toContain('?order=');
  });

  it('keeps development links enabled without order', () => {
    const link = annotatePillarCrossLink(
      { label: 'Material passport', href: '/brand/merch/fabric-passport' },
      'dev-material-passport',
      { role: 'brand' }
    );
    expect(link.disabled).toBeUndefined();
  });
});

describe('shop-matrix-tier-pricing', () => {
  it('uses PG synced multiplier when present', () => {
    const resolved = resolveShopMatrixUnitPrice(1000, 'retail_b', [
      {
        tierId: 'retail_b',
        priceListId: 'pl-1',
        priceListName: 'Retail B',
        multiplier: 0.91,
        shopSynced: true,
        collectionId: 'SS27',
      },
    ]);
    expect(resolved.source).toBe('pg-tier-sync');
    expect(resolved.unitPrice).toBe(910);
  });
});

describe('shop-matrix-cart-tier', () => {
  it('maps outlet tier to vip cart session and applies multiplier to cart line', () => {
    expect(mapPriceTierToWorkshop2CartTier('outlet')).toBe('vip');
    const priced = applyShopMatrixTierToCartItem(
      {
        id: 'demo-ss27-01',
        name: 'Demo',
        price: 1000,
        quantity: 2,
        images: [],
        category: 'apparel',
      },
      'retail_b',
      [
        {
          tierId: 'retail_b',
          priceListId: 'pl-1',
          priceListName: 'Retail B',
          multiplier: 0.9,
          shopSynced: true,
          collectionId: 'SS27',
        },
      ]
    );
    expect(priced.price).toBe(900);
    expect((priced as { wholesalePriceRub?: number }).wholesalePriceRub).toBe(900);
  });
});

describe('brand-comms-entity-thread-attach-tz', () => {
  it('supports bom and sample only', () => {
    expect(brandCommsEntityThreadSupportsAttachTz('bom')).toBe(true);
    expect(brandCommsEntityThreadSupportsAttachTz('qc')).toBe(false);
    expect(
      brandCommsEntityThreadAttachTzMessage({
        threadKind: 'sample',
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        dossierHref: '/brand/production/w2?w2pane=tz',
      })
    ).toContain('Sample round');
  });
});

describe('factory-comms-entity-thread-attach-tz', () => {
  it('supports manufacturer dossier/sample and supplier bom', () => {
    expect(manufacturerCommsEntityThreadSupportsAttachTz('dossier')).toBe(true);
    expect(manufacturerCommsEntityThreadSupportsAttachTz('handoff')).toBe(false);
    expect(supplierCommsEntityThreadSupportsAttachTz('bom')).toBe(true);
    expect(supplierCommsEntityThreadSupportsAttachTz('rfq')).toBe(false);
    expect(
      factoryCommsEntityThreadAttachTzMessage({
        variant: 'supplier',
        threadKind: 'bom',
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        dossierHref: '/brand/production/w2?w2pane=tz',
      })
    ).toContain('поставщик');
  });
});
