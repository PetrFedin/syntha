import type { PlatformCoreCommercialAvailabilityStatus } from '@/lib/platform-core-article-fulfillment-model';

export type PlatformCoreAllocationPolicy =
  | 'first_confirmed_first_allocated'
  | 'shop_priority'
  | 'proportional'
  | 'manual_brand_allocation';

export type PlatformCoreAllocationLineStatus =
  | 'fully_allocated'
  | 'partially_allocated'
  | 'backordered'
  | 'cancelled_unallocated';

export type PlatformCoreAllocationRequest = {
  shopId: string;
  orderId: string;
  lineId: string;
  requestedQty: number;
  shopPriority: number;
  confirmedAt?: string;
};

export type PlatformCoreAllocationResultLine = PlatformCoreAllocationRequest & {
  allocatedQty: number;
  backorderQty: number;
  cancelledQty: number;
  status: PlatformCoreAllocationLineStatus;
};

export type PlatformCoreAllocationRun = {
  articleId: string;
  skuId?: string;
  availableQty: number;
  policy: PlatformCoreAllocationPolicy;
  commercialAvailability: PlatformCoreCommercialAvailabilityStatus;
  results: readonly PlatformCoreAllocationResultLine[];
  unallocatedAvailableQty: number;
};

function compareAllocationRequests(
  policy: PlatformCoreAllocationPolicy,
  a: PlatformCoreAllocationRequest,
  b: PlatformCoreAllocationRequest
): number {
  if (policy === 'shop_priority') {
    return b.shopPriority - a.shopPriority || a.orderId.localeCompare(b.orderId);
  }

  if (policy === 'first_confirmed_first_allocated') {
    return (a.confirmedAt ?? '').localeCompare(b.confirmedAt ?? '') || a.orderId.localeCompare(b.orderId);
  }

  return a.orderId.localeCompare(b.orderId);
}

function buildAllocationResult(
  request: PlatformCoreAllocationRequest,
  allocatedQty: number,
  allowBackorder: boolean
): PlatformCoreAllocationResultLine {
  const missingQty = Math.max(request.requestedQty - allocatedQty, 0);
  const backorderQty = allowBackorder ? missingQty : 0;
  const cancelledQty = allowBackorder ? 0 : missingQty;

  let status: PlatformCoreAllocationLineStatus = 'fully_allocated';
  if (allocatedQty === 0 && backorderQty > 0) status = 'backordered';
  else if (allocatedQty === 0 && cancelledQty > 0) status = 'cancelled_unallocated';
  else if (allocatedQty < request.requestedQty) status = 'partially_allocated';

  return {
    ...request,
    allocatedQty,
    backorderQty,
    cancelledQty,
    status,
  };
}

export function runPlatformCoreAllocation(args: {
  articleId: string;
  skuId?: string;
  availableQty: number;
  requests: readonly PlatformCoreAllocationRequest[];
  policy: PlatformCoreAllocationPolicy;
  commercialAvailability: PlatformCoreCommercialAvailabilityStatus;
  allowBackorder?: boolean;
}): PlatformCoreAllocationRun {
  const allowBackorder = args.allowBackorder ?? true;
  const safeAvailableQty = Math.max(Math.floor(args.availableQty), 0);

  if (args.policy === 'proportional') {
    const totalRequested = args.requests.reduce((sum, request) => sum + request.requestedQty, 0);
    let remaining = safeAvailableQty;

    const provisional = args.requests.map((request) => {
      const proportionalQty = totalRequested > 0
        ? Math.floor((request.requestedQty / totalRequested) * safeAvailableQty)
        : 0;
      const allocatedQty = Math.min(request.requestedQty, proportionalQty, remaining);
      remaining -= allocatedQty;
      return buildAllocationResult(request, allocatedQty, allowBackorder);
    });

    return {
      articleId: args.articleId,
      skuId: args.skuId,
      availableQty: safeAvailableQty,
      policy: args.policy,
      commercialAvailability: args.commercialAvailability,
      results: provisional,
      unallocatedAvailableQty: remaining,
    };
  }

  const orderedRequests = [...args.requests].sort((a, b) =>
    compareAllocationRequests(args.policy, a, b)
  );
  let remaining = safeAvailableQty;

  const results = orderedRequests.map((request) => {
    const allocatedQty = Math.min(request.requestedQty, remaining);
    remaining -= allocatedQty;
    return buildAllocationResult(request, allocatedQty, allowBackorder);
  });

  return {
    articleId: args.articleId,
    skuId: args.skuId,
    availableQty: safeAvailableQty,
    policy: args.policy,
    commercialAvailability: args.commercialAvailability,
    results,
    unallocatedAvailableQty: remaining,
  };
}

export function getPlatformCoreAllocatedQty(run: PlatformCoreAllocationRun): number {
  return run.results.reduce((sum, line) => sum + line.allocatedQty, 0);
}

export function getPlatformCoreBackorderQty(run: PlatformCoreAllocationRun): number {
  return run.results.reduce((sum, line) => sum + line.backorderQty, 0);
}
