export type PlatformCoreCurrency = 'RUB' | 'EUR' | 'USD' | 'GBP' | 'CNY' | string;

export type PlatformCorePaymentTerms = {
  prepaymentPercent: number;
  balancePercent: number;
  balanceDueDays: number;
  allowInstallments: boolean;
};

export type PlatformCorePriceTier = {
  minQty: number;
  wholesaleUnitPrice: number;
};

export type PlatformCoreArticlePricing = {
  articleId: string;
  skuId?: string;
  currency: PlatformCoreCurrency;
  wholesaleUnitPrice: number;
  recommendedRetailPrice?: number;
  minimumOrderQty: number;
  casePackQty?: number;
  priceTiers?: readonly PlatformCorePriceTier[];
  paymentTerms: PlatformCorePaymentTerms;
  validFrom?: string;
  validTo?: string;
};

export type PlatformCoreShopCreditProfile = {
  shopId: string;
  creditLimit: number;
  openBalance: number;
  overdueBalance: number;
  manualHold: boolean;
};

export type PlatformCoreOrderPricingLine = {
  articleId: string;
  skuId?: string;
  quantity: number;
  appliedUnitPrice: number;
  lineSubtotal: number;
  meetsMoq: boolean;
};

export type PlatformCoreOrderPricingResult = {
  currency: PlatformCoreCurrency;
  lines: readonly PlatformCoreOrderPricingLine[];
  subtotal: number;
  requiredPrepayment: number;
  remainingBalance: number;
  creditExposureAfterOrder: number;
  creditHold: boolean;
  holdReasons: readonly string[];
};

function assertNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number`);
  }
  return value;
}

function assertPositiveInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
}

export function validatePlatformCorePaymentTerms(terms: PlatformCorePaymentTerms): void {
  const total = terms.prepaymentPercent + terms.balancePercent;
  if (total !== 100) {
    throw new Error('Payment terms must total 100 percent');
  }
  if (terms.prepaymentPercent < 0 || terms.balancePercent < 0) {
    throw new Error('Payment term percentages cannot be negative');
  }
  if (!Number.isInteger(terms.balanceDueDays) || terms.balanceDueDays < 0) {
    throw new Error('balanceDueDays must be a non-negative integer');
  }
}

export function getPlatformCoreWholesaleUnitPrice(
  pricing: PlatformCoreArticlePricing,
  quantity: number
): number {
  const safeQuantity = assertPositiveInteger(quantity, 'quantity');
  const tiers = [...(pricing.priceTiers ?? [])]
    .filter((tier) => tier.minQty > 0 && tier.wholesaleUnitPrice >= 0)
    .sort((a, b) => a.minQty - b.minQty);

  const applicableTier = tiers
    .filter((tier) => safeQuantity >= tier.minQty)
    .at(-1);

  return applicableTier?.wholesaleUnitPrice ?? pricing.wholesaleUnitPrice;
}

export function calculatePlatformCoreOrderPricing(args: {
  lines: readonly { pricing: PlatformCoreArticlePricing; quantity: number }[];
  shopCredit: PlatformCoreShopCreditProfile;
}): PlatformCoreOrderPricingResult {
  if (args.lines.length === 0) {
    throw new Error('At least one pricing line is required');
  }

  const currency = args.lines[0]?.pricing.currency;
  if (!currency || args.lines.some((line) => line.pricing.currency !== currency)) {
    throw new Error('All pricing lines must use the same currency');
  }

  const holdReasons: string[] = [];
  const lines = args.lines.map(({ pricing, quantity }) => {
    validatePlatformCorePaymentTerms(pricing.paymentTerms);
    const safeQuantity = assertPositiveInteger(quantity, 'quantity');
    const unitPrice = assertNonNegative(
      getPlatformCoreWholesaleUnitPrice(pricing, safeQuantity),
      'wholesaleUnitPrice'
    );
    const meetsMoq = safeQuantity >= pricing.minimumOrderQty;
    if (!meetsMoq) {
      holdReasons.push(`MOQ not met for article ${pricing.articleId}`);
    }

    return {
      articleId: pricing.articleId,
      skuId: pricing.skuId,
      quantity: safeQuantity,
      appliedUnitPrice: unitPrice,
      lineSubtotal: unitPrice * safeQuantity,
      meetsMoq,
    } satisfies PlatformCoreOrderPricingLine;
  });

  const subtotal = lines.reduce((sum, line) => sum + line.lineSubtotal, 0);
  const weightedPrepayment = args.lines.reduce((sum, line) => {
    const lineSubtotal = getPlatformCoreWholesaleUnitPrice(line.pricing, line.quantity) * line.quantity;
    return sum + lineSubtotal * (line.pricing.paymentTerms.prepaymentPercent / 100);
  }, 0);
  const requiredPrepayment = weightedPrepayment;
  const remainingBalance = subtotal - requiredPrepayment;
  const creditExposureAfterOrder = args.shopCredit.openBalance + remainingBalance;

  if (args.shopCredit.manualHold) holdReasons.push('Shop is on manual credit hold');
  if (args.shopCredit.overdueBalance > 0) holdReasons.push('Shop has overdue balance');
  if (creditExposureAfterOrder > args.shopCredit.creditLimit) {
    holdReasons.push('Credit limit exceeded');
  }

  return {
    currency,
    lines,
    subtotal,
    requiredPrepayment,
    remainingBalance,
    creditExposureAfterOrder,
    creditHold: holdReasons.length > 0,
    holdReasons: [...new Set(holdReasons)],
  };
}

export function canPlatformCoreConfirmPricedOrder(
  result: PlatformCoreOrderPricingResult
): boolean {
  return !result.creditHold && result.lines.every((line) => line.meetsMoq);
}
