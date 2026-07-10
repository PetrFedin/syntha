import {
  closePlatformCoreOrderProduction,
  createPlatformCoreOrderProductionTail,
  dispatchPlatformCoreShipment,
  evaluatePlatformCoreCloseoutStatus,
  getPlatformCoreOrderProductionTailBlockers,
  getPlatformCoreShopTrackingSnapshot,
  issuePlatformCorePacking,
  recordPlatformCoreShopAcceptance,
  updatePlatformCoreQcStatus,
} from '@/lib/platform-core-order-production-tail';

const shipmentDocuments = [
  {
    documentId: 'DOC-QC-1',
    type: 'qc_report' as const,
    ownerType: 'production_order' as const,
    ownerId: 'ORDER-001',
    version: 1,
    title: 'QC report',
    status: 'approved' as const,
    visibility: 'brand_internal' as const,
    createdAt: '2026-07-10T10:00:00.000Z',
    createdByRole: 'brand' as const,
  },
  {
    documentId: 'DOC-PACK-1',
    type: 'packing_list' as const,
    ownerType: 'shipment' as const,
    ownerId: 'ORDER-001',
    version: 1,
    title: 'Packing list',
    status: 'issued' as const,
    visibility: 'shop_visible_after_shipment' as const,
    createdAt: '2026-07-10T10:10:00.000Z',
    createdByRole: 'brand' as const,
  },
  {
    documentId: 'DOC-INV-1',
    type: 'invoice' as const,
    ownerType: 'shipment' as const,
    ownerId: 'ORDER-001',
    version: 1,
    title: 'Invoice',
    status: 'issued' as const,
    visibility: 'shop_visible_after_shipment' as const,
    createdAt: '2026-07-10T10:20:00.000Z',
    createdByRole: 'brand' as const,
  },
];

describe('Platform Core Order Production tail', () => {
  it('blocks packing before QC and required shipment documents are ready', () => {
    const tail = createPlatformCoreOrderProductionTail({ orderId: 'ORDER-001' });

    expect(() => issuePlatformCorePacking(tail)).toThrow(/QC and shipment documents/i);
    expect(getPlatformCoreOrderProductionTailBlockers(tail)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'qc_not_passed' }),
        expect.objectContaining({ code: 'packing_documents_missing' }),
      ])
    );
  });

  it('runs the happy path from QC to packing, dispatch, shop acceptance and closeout', () => {
    let tail = createPlatformCoreOrderProductionTail({
      orderId: 'ORDER-001',
      documents: shipmentDocuments,
    });

    tail = updatePlatformCoreQcStatus(tail, 'passed');
    tail = issuePlatformCorePacking(tail);

    expect(tail.packingStatus).toBe('issued');
    expect(tail.shipmentStatus).toBe('ready_to_dispatch');
    expect(getPlatformCoreShopTrackingSnapshot(tail)).toMatchObject({
      status: 'preparing_shipment',
      acceptanceActionAvailable: false,
    });

    tail = dispatchPlatformCoreShipment(tail);
    expect(getPlatformCoreShopTrackingSnapshot(tail)).toMatchObject({
      status: 'shipped',
      acceptanceActionAvailable: true,
    });

    tail = recordPlatformCoreShopAcceptance({
      tail,
      acceptanceStatus: 'accepted',
    });

    expect(tail.shipmentStatus).toBe('delivered');
    expect(evaluatePlatformCoreCloseoutStatus(tail)).toBe('ready_to_close');

    tail = closePlatformCoreOrderProduction(tail);
    expect(tail.closeoutStatus).toBe('closed');
    expect(getPlatformCoreShopTrackingSnapshot(tail)).toEqual({
      orderId: 'ORDER-001',
      status: 'closed',
      acceptanceActionAvailable: false,
      closeoutBlocked: false,
    });
  });

  it('opens a claim for accepted-with-discrepancy and blocks closeout', () => {
    let tail = createPlatformCoreOrderProductionTail({
      orderId: 'ORDER-001',
      documents: shipmentDocuments,
    });

    tail = updatePlatformCoreQcStatus(tail, 'passed');
    tail = issuePlatformCorePacking(tail);
    tail = dispatchPlatformCoreShipment(tail);
    tail = recordPlatformCoreShopAcceptance({
      tail,
      acceptanceStatus: 'accepted_with_discrepancy',
    });

    expect(tail.hasOpenClaim).toBe(true);
    expect(evaluatePlatformCoreCloseoutStatus(tail)).toBe('blocked');
    expect(getPlatformCoreOrderProductionTailBlockers(tail)).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'open_claim' })])
    );
    expect(() => closePlatformCoreOrderProduction(tail)).toThrow(/Open claim/i);
  });

  it('does not allow dispatch before packing is issued', () => {
    const tail = updatePlatformCoreQcStatus(
      createPlatformCoreOrderProductionTail({
        orderId: 'ORDER-001',
        documents: shipmentDocuments,
      }),
      'passed'
    );

    expect(() => dispatchPlatformCoreShipment(tail)).toThrow(/packing is issued/i);
  });
});
