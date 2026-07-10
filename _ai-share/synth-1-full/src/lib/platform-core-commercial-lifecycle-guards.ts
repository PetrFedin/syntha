import type { PlatformCoreAllocationRun } from '@/lib/platform-core-allocation-engine';
import { getPlatformCoreAllocatedQty } from '@/lib/platform-core-allocation-engine';
import type {
  PlatformCoreArticleOriginType,
  PlatformCoreBackstageFulfillmentRoute,
} from '@/lib/platform-core-article-fulfillment-model';
import { getPlatformCoreArticleFulfillmentProfile } from '@/lib/platform-core-article-fulfillment-model';
import type { PlatformCoreLifecycleContext } from '@/lib/platform-core-lifecycle-engine';
import type { PlatformCoreOrderPricingResult } from '@/lib/platform-core-pricing-engine';
import { canPlatformCoreConfirmPricedOrder } from '@/lib/platform-core-pricing-engine';

export type PlatformCoreCommercialGuardCode =
  | 'pricing_not_ready'
  | 'allocation_not_ready'
  | 'allocation_shortfall'
  | 'fulfillment_route_missing'
  | 'supplier_po_missing'
  | 'production_order_missing';

export type PlatformCoreCommercialGuardResult = {
  passed: boolean;
  code: PlatformCoreCommercialGuardCode;
  message: string;
};

export type PlatformCoreCommercialLifecycleInput = {
  pricing?: PlatformCoreOrderPricingResult;
  allocation?: PlatformCoreAllocationRun;
  articleOrigin?: PlatformCoreArticleOriginType;
  selectedFulfillmentRoute?: PlatformCoreBackstageFulfillmentRoute;
  supplierPoCreated?: boolean;
  productionOrderCreated?: boolean;
};

export function evaluatePlatformCoreOrderConfirmationGuards(
  input: PlatformCoreCommercialLifecycleInput
): PlatformCoreCommercialGuardResult[] {
  const results: PlatformCoreCommercialGuardResult[] = [];

  if (!input.pricing) {
    results.push({
      passed: false,
      code: 'pricing_not_ready',
      message: 'Order pricing must be calculated before confirmation.',
    });
  } else {
    results.push({
      passed: canPlatformCoreConfirmPricedOrder(input.pricing),
      code: 'pricing_not_ready',
      message: canPlatformCoreConfirmPricedOrder(input.pricing)
        ? 'Pricing and credit checks passed.'
        : `Order has pricing or credit blockers: ${input.pricing.holdReasons.join(', ')}`,
    });
  }

  if (!input.allocation) {
    results.push({
      passed: false,
      code: 'allocation_not_ready',
      message: 'Allocation must be completed before order confirmation.',
    });
  } else {
    const requestedQty = input.allocation.results.reduce((sum, line) => sum + line.requestedQty, 0);
    const allocatedQty = getPlatformCoreAllocatedQty(input.allocation);
    results.push({
      passed: requestedQty === allocatedQty,
      code: 'allocation_shortfall',
      message:
        requestedQty === allocatedQty
          ? 'All order quantities are allocated.'
          : `Allocation shortfall: requested ${requestedQty}, allocated ${allocatedQty}.`,
    });
  }

  return results;
}

export function evaluatePlatformCoreFulfillmentStartGuards(
  input: PlatformCoreCommercialLifecycleInput
): PlatformCoreCommercialGuardResult[] {
  const results: PlatformCoreCommercialGuardResult[] = [];

  if (!input.articleOrigin) {
    return [
      {
        passed: false,
        code: 'fulfillment_route_missing',
        message: 'Article origin is required to determine fulfillment route.',
      },
    ];
  }

  const profile = getPlatformCoreArticleFulfillmentProfile(input.articleOrigin);
  const selectedRoute = input.selectedFulfillmentRoute ?? profile.backstageRoute;

  results.push({
    passed: selectedRoute === profile.backstageRoute || profile.backstageRoute === 'mixed_execution',
    code: 'fulfillment_route_missing',
    message:
      selectedRoute === profile.backstageRoute || profile.backstageRoute === 'mixed_execution'
        ? `Fulfillment route selected: ${selectedRoute}.`
        : `Selected route ${selectedRoute} conflicts with article origin ${input.articleOrigin}.`,
  });

  if (profile.requiresSupplierPo) {
    results.push({
      passed: Boolean(input.supplierPoCreated),
      code: 'supplier_po_missing',
      message: input.supplierPoCreated
        ? 'Supplier PO is ready.'
        : 'Supplier PO is required before fulfillment can start.',
    });
  }

  if (profile.requiresProductionOrder) {
    results.push({
      passed: Boolean(input.productionOrderCreated),
      code: 'production_order_missing',
      message: input.productionOrderCreated
        ? 'Production Order is ready.'
        : 'Production Order is required before fulfillment can start.',
    });
  }

  return results;
}

export function toPlatformCoreLifecycleCustomGuards(
  results: readonly PlatformCoreCommercialGuardResult[]
): NonNullable<PlatformCoreLifecycleContext['customGuards']> {
  return results.map((result) => ({
    passed: result.passed,
    message: result.message,
  }));
}

export function canPlatformCoreConfirmCommercialOrder(
  input: PlatformCoreCommercialLifecycleInput
): boolean {
  return evaluatePlatformCoreOrderConfirmationGuards(input).every((guard) => guard.passed);
}

export function canPlatformCoreStartCommercialFulfillment(
  input: PlatformCoreCommercialLifecycleInput
): boolean {
  return evaluatePlatformCoreFulfillmentStartGuards(input).every((guard) => guard.passed);
}
