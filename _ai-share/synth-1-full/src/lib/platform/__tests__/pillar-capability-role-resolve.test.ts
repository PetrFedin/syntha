import {
  resolveCoAgentRepHref,
  resolveCoCollaborativeOrderHref,
  resolveCoLandedMarginHref,
  resolveCoPricelistVersionHref,
  resolveCoWholesaleMatrixHref,
  resolveCommsEntityThreadsHref,
  resolveCommsOrderContextHref,
  resolveDevRfqSupplierHref,
  resolveOpCutTicketWipHref,
  resolveOpInventoryAtpHref,
  resolveOpMrpSupplyHref,
  resolveOpPhysicalCountHref,
  resolveScShowroomBuyHref,
} from '@/lib/platform/pillar-capability-role-resolve';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

describe('pillar-capability-role-resolve', () => {
  const ctx = { collectionId: 'SS27', orderId: 'INT-1', articleId: 'art-1' };

  it('routes comms-order-context per role', () => {
    expect(resolveCommsOrderContextHref({ ...ctx, role: 'shop' })).toContain('b2b/tracking');
    expect(resolveCommsOrderContextHref({ ...ctx, role: 'shop' })).toContain('pcf=tracking');
    expect(resolveCommsOrderContextHref({ ...ctx, role: 'brand' })).toContain('pcf=chat');
    expect(resolveCommsOrderContextHref({ ...ctx, role: 'manufacturer' })).toContain('pcf=order');
    expect(resolveCommsOrderContextHref({ ...ctx, role: 'supplier' })).toContain(
      'supplier/messages'
    );
  });

  it('routes comms-entity-threads per role', () => {
    expect(resolveCommsEntityThreadsHref({ ...ctx, role: 'brand' })).toContain('/brand/messages');
    expect(resolveCommsEntityThreadsHref({ ...ctx, role: 'manufacturer' })).toContain(
      '/factory/messages'
    );
    expect(resolveCommsEntityThreadsHref({ ...ctx, role: 'supplier' })).toContain(
      'supplier/messages'
    );
  });

  it('routes dev-rfq and mrp supply per role', () => {
    expect(resolveDevRfqSupplierHref({ ...ctx, role: 'brand' })).toContain('centric');
    expect(resolveDevRfqSupplierHref({ ...ctx, role: 'supplier' })).toContain(
      '/factory/supplier/rfq-inbox'
    );
    expect(resolveDevRfqSupplierHref({ ...ctx, role: 'supplier' })).not.toContain(
      `${PILLAR_CAPABILITY_FEATURE_PARAM}=rfq`
    );
    expect(resolveOpMrpSupplyHref({ ...ctx, role: 'supplier' })).toContain('pcf=supply');
    expect(resolveOpMrpSupplyHref({ ...ctx, role: 'brand' })).toContain('w2pane=supply');
  });

  it('routes inventory and cut-ticket per role', () => {
    expect(resolveOpInventoryAtpHref({ ...ctx, role: 'shop' })).toContain('/shop/inventory');
    expect(resolveOpInventoryAtpHref({ ...ctx, role: 'brand' })).toContain('/brand/inventory');
    expect(resolveOpPhysicalCountHref({ ...ctx, role: 'shop' })).toContain('pcf=reconcile');
    expect(resolveOpPhysicalCountHref({ ...ctx, role: 'brand' })).toContain('pcf=count');
    expect(resolveOpCutTicketWipHref({ ...ctx, role: 'brand' })).toContain('pcf=cut-ticket');
    expect(resolveOpCutTicketWipHref({ ...ctx, role: 'manufacturer' })).toContain(
      '/factory/production/orders'
    );
  });

  it('routes collection_order capabilities per role', () => {
    expect(resolveCoWholesaleMatrixHref({ ...ctx, role: 'shop' })).toContain('/shop/b2b/matrix');
    expect(resolveCoWholesaleMatrixHref({ ...ctx, role: 'brand' })).toContain('/shop/b2b/matrix');
    expect(resolveCoLandedMarginHref({ ...ctx, role: 'shop' })).toContain('pcf=rollup');
    expect(resolveCoLandedMarginHref({ ...ctx, role: 'brand' })).toContain('pcf=simulator');
    expect(resolveCoLandedMarginHref({ ...ctx, role: 'brand' })).toContain(
      '/brand/merch/margin-simulator'
    );
    expect(resolveCoCollaborativeOrderHref(ctx)).toContain('pcf=session');
    expect(resolveCoAgentRepHref({ ...ctx, role: 'brand' })).toContain('pcf=ledger');
    expect(resolveScShowroomBuyHref({ ...ctx, role: 'brand' })).toContain('pcf=preview');
    expect(resolveScShowroomBuyHref({ ...ctx, surface: 'platform' })).toContain('pcf=showcase');
    expect(
      resolveScShowroomBuyHref({ ...ctx, surface: 'platform', workspaceId: 'platform-b2b-hub' })
    ).toContain('pcf=hub');
    expect(resolveCoPricelistVersionHref({ ...ctx, role: 'brand' })).toContain('pcf=versions');
  });
});
