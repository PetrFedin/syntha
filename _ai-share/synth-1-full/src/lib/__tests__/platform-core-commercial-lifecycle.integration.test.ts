import { runPlatformCoreAllocation } from '@/lib/platform-core-allocation-engine';
import {
  evaluatePlatformCoreFulfillmentStartGuards,
  evaluatePlatformCoreOrderConfirmationGuards,
  toPlatformCoreLifecycleCustomGuards,
} from '@/lib/platform-core-commercial-lifecycle-guards';
import {
  applyPlatformCoreLifecycleTransition,
  evaluatePlatformCoreLifecycleTransition,
} from '@/lib/platform-core-lifecycle-engine';
import { calculatePlatformCoreOrderPricing } from '@/lib/platform-core-pricing-engine';

function buildPricingResult() {
  return calculatePlatformCoreOrderPricing({
    lines: [
      {
        pricing: {
          articleId: 'ART-001',
          currency: 'EUR',
          wholesaleUnitPrice: 100,
          recommendedRetailPrice: 250,
          minimumOrderQty: 10,
          casePackQty: 5,
          paymentTerms: {
            prepaymentPercent: 30,
            balancePercent: 70,
            balanceDueDays: 30,
            allowInstallments: false,
          },
        },
        quantity: 10,
      },
    ],
    shopCredit: {
      shopId: 'SHOP-001',
      creditLimit: 10_000,
      openBalance: 0,
      overdueBalance: 0,
      manualHold: false,
    },
  });
}

function buildAllocation() {
  return runPlatformCoreAllocation({
    articleId: 'ART-001',
    availableQty: 10,
    policy: 'first_confirmed_first_allocated',
    commercialAvailability: 'available_to_order',
    requests: [
      {
        shopId: 'SHOP-001',
        orderId: 'ORDER-001',
        lineId: 'LINE-001',
        requestedQty: 10,
        shopPriority: 1,
        confirmedAt: '2026-07-10T10:00:00.000Z',
      },
    ],
  });
}

describe('Platform Core commercial lifecycle integration', () => {
  it('confirms an order only after pricing and full allocation pass', () => {
    const guards = evaluatePlatformCoreOrderConfirmationGuards({
      pricing: buildPricingResult(),
      allocation: buildAllocation(),
    });

    expect(guards.every((guard) => guard.passed)).toBe(true);

    const nextState = applyPlatformCoreLifecycleTransition({
      from: 'order_draft',
      action: 'confirm_order',
      context: {
        entityId: 'ORDER-001',
        documents: [
          {
            documentId: 'DOC-ORDER-001',
            type: 'shop_order',
            ownerType: 'order',
            ownerId: 'ORDER-001',
            version: 1,
            title: 'Order confirmation',
            status: 'issued',
            visibility: 'brand_and_shop',
            createdAt: '2026-07-10T10:00:00.000Z',
            createdByRole: 'shop',
          },
        ],
        customGuards: toPlatformCoreLifecycleCustomGuards(guards),
      },
    });

    expect(nextState).toBe('order_confirmed');
  });

  it('starts own-development fulfillment only with a Production Order', () => {
    const missingProductionOrder = evaluatePlatformCoreFulfillmentStartGuards({
      articleOrigin: 'own_development',
      selectedFulfillmentRoute: 'brand_production',
      productionOrderCreated: false,
    });

    expect(
      missingProductionOrder.some(
        (guard) => guard.code === 'production_order_missing' && !guard.passed
      )
    ).toBe(true);

    const blocked = evaluatePlatformCoreLifecycleTransition({
      from: 'fulfillment_planned',
      action: 'start_fulfillment',
      context: {
        entityId: 'ORDER-001',
        customGuards: toPlatformCoreLifecycleCustomGuards(missingProductionOrder),
      },
    });

    expect(blocked.allowed).toBe(false);
    expect(blocked.blockers).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'custom_guard_failed' })])
    );

    const ready = evaluatePlatformCoreFulfillmentStartGuards({
      articleOrigin: 'own_development',
      selectedFulfillmentRoute: 'brand_production',
      productionOrderCreated: true,
    });

    const nextState = applyPlatformCoreLifecycleTransition({
      from: 'fulfillment_planned',
      action: 'start_fulfillment',
      context: {
        entityId: 'ORDER-001',
        customGuards: toPlatformCoreLifecycleCustomGuards(ready),
      },
    });

    expect(nextState).toBe('fulfillment_in_progress');
  });

  it('starts ready-made sourcing fulfillment only with a Supplier PO and without a Production Order', () => {
    const missingSupplierPo = evaluatePlatformCoreFulfillmentStartGuards({
      articleOrigin: 'ready_made_sourcing',
      selectedFulfillmentRoute: 'supplier_purchase_order',
      supplierPoCreated: false,
      productionOrderCreated: false,
    });

    expect(
      missingSupplierPo.some((guard) => guard.code === 'supplier_po_missing' && !guard.passed)
    ).toBe(true);
    expect(missingSupplierPo.some((guard) => guard.code === 'production_order_missing')).toBe(false);

    const blocked = evaluatePlatformCoreLifecycleTransition({
      from: 'fulfillment_planned',
      action: 'start_fulfillment',
      context: {
        entityId: 'ORDER-001',
        customGuards: toPlatformCoreLifecycleCustomGuards(missingSupplierPo),
      },
    });

    expect(blocked.allowed).toBe(false);

    const ready = evaluatePlatformCoreFulfillmentStartGuards({
      articleOrigin: 'ready_made_sourcing',
      selectedFulfillmentRoute: 'supplier_purchase_order',
      supplierPoCreated: true,
      productionOrderCreated: false,
    });

    const nextState = applyPlatformCoreLifecycleTransition({
      from: 'fulfillment_planned',
      action: 'start_fulfillment',
      context: {
        entityId: 'ORDER-001',
        customGuards: toPlatformCoreLifecycleCustomGuards(ready),
      },
    });

    expect(nextState).toBe('fulfillment_in_progress');
  });

  it('rejects a fulfillment route that conflicts with article origin', () => {
    const guards = evaluatePlatformCoreFulfillmentStartGuards({
      articleOrigin: 'own_development',
      selectedFulfillmentRoute: 'supplier_purchase_order',
      supplierPoCreated: true,
      productionOrderCreated: false,
    });

    expect(
      guards.some((guard) => guard.code === 'fulfillment_route_missing' && !guard.passed)
    ).toBe(true);

    const blocked = evaluatePlatformCoreLifecycleTransition({
      from: 'fulfillment_planned',
      action: 'start_fulfillment',
      context: {
        entityId: 'ORDER-001',
        customGuards: toPlatformCoreLifecycleCustomGuards(guards),
      },
    });

    expect(blocked.allowed).toBe(false);
  });

  it('blocks confirmation when allocation is incomplete', () => {
    const allocation = runPlatformCoreAllocation({
      articleId: 'ART-001',
      availableQty: 6,
      policy: 'first_confirmed_first_allocated',
      commercialAvailability: 'limited_allocation',
      requests: [
        {
          shopId: 'SHOP-001',
          orderId: 'ORDER-001',
          lineId: 'LINE-001',
          requestedQty: 10,
          shopPriority: 1,
          confirmedAt: '2026-07-10T10:00:00.000Z',
        },
      ],
    });

    const guards = evaluatePlatformCoreOrderConfirmationGuards({
      pricing: buildPricingResult(),
      allocation,
    });

    expect(
      guards.some((guard) => guard.code === 'allocation_shortfall' && !guard.passed)
    ).toBe(true);
  });
});
