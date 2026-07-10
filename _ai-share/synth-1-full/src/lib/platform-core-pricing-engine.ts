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
  meetsCasePack: boolean;
  priceIsActive: boolean;
  commercialBlocks: readonly string[];
};

export type PlatformCoreOrderPricingResult = {
  currency: PlatformCoreCurrency;
  lines: readonly PlatformCoreOrderPricingLine[];
  subtotal: number;
  requiredPrepayment: number;
  remainingBalance: number;
  creditExposureAfterOrder: number;
  commercialHold: boolean;
  creditHold: boolean;
  commercialBlockReasons: readonly string[];
  creditHoldReasons: readonly string[];
  /** Compatibility aggregate for existing callers. */
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

function isPricingActive(pricing: PlatformCoreArticlePricing, at: Date): boolean {
  const timestamp = at.getTime();
  const validFrom = pricing.validFrom ? new Date(pricing.validFrom).getTime() : undefined;
  const validTo = pricing.validTo ? new Date(pricing.validTo).getTime() : undefined;

  if (validFrom !== undefined && Number.isNaN(validFrom)) {
    throw new Error(`Invalid validFrom for article ${pricing.articleId}`);
  }
  if (validTo !== undefined && Number.isNaN(validTo)) {
    throw new Error(`Invalid validTo for article ${pricing.articleId}`);
  }

  return (validFrom === undefined || timestamp >= validFrom) && (validTo === undefined || timestamp <= validTo);
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
  evaluatedAt?: Date;
}): PlatformCoreOrderPricingResult {
  if (args.lines.length === 0) {
    throw new Error('At least one pricing line is required');
  }

  const currency = args.lines[0]?.pricing.currency;
  if (!currency || args.lines.some((line) => line.pricing.currency !== currency)) {
    throw new Error('All pricing lines must use the same currency');
  }

  const evaluatedAt = args.evaluatedAt ?? new Date();
  const commercialBlockReasons: string[] = [];
  const creditHoldReasons: string[] = [];

  const lines = args.lines.map(({ pricing, quantity }) => {
    validatePlatformCorePaymentTerms(pricing.paymentTerms);
    const safeQuantity = assertPositiveInteger(quantity, 'quantity');
    const unitPrice = assertNonNegative(
      getPlatformCoreWholesaleUnitPrice(pricing, safeQuantity),
      'wholesaleUnitPrice'
    );
    const meetsMoq = safeQuantity >= pricing.minimumOrderQty;
    const casePackQty = pricing.casePackQty ?? 1;
    const meetsCasePack = safeQuantity % assertPositiveInteger(casePackQty, 'casePackQty') === 0;
    const priceIsActive = isPricingActive(pricing, evaluatedAt);
    const lineBlocks: string[] = [];

    if (!meetsMoq) lineBlocks.push(`MOQ not met for article ${pricing.articleId}`);
    if (!meetsCasePack) lineBlocks.push(`Case pack not met for article ${pricing.articleId}`);
    if (!priceIsActive) lineBlocks.push(`Price is not active for article ${pricing.articleId}`);
    commercialBlockReasons.push(...lineBlocks);

    return {
      articleId: pricing.articleId,
      skuId: pricing.skuId,
      quantity: safeQuantity,
      appliedUnitPrice: unitPrice,
      lineSubtotal: unitPrice * safeQuantity,
      meetsMoq,
      meetsCasePack,
      priceIsActive,
      commercialBlocks: lineBlocks,
    } satisfies PlatformCoreOrderPricingLine;
  });

  const subtotal = lines.reduce((sum, line) => sum + line.lineSubtotal, 0);
  const requiredPrepayment = args.lines.reduce((sum, line) => {
    const lineSubtotal = getPlatformCoreWholesaleUnitPrice(line.pricing, line.quantity) * line.quantity;
    return sum + lineSubtotal * (line.pricing.paymentTerms.prepaymentPercent / 100);
  }, 0);
  const remainingBalance = subtotal - requiredPrepayment;
  const creditExposureAfterOrder = args.shopCredit.openBalance + remainingBalance;

  if (args.shopCredit.manualHold) creditHoldReasons.push('Shop is on manual credit hold');
  if (args.shopCredit.overdueBalance > 0) creditHoldReasons.push('Shop has overdue balance');
  if (creditExposureAfterOrder > args.shopCredit.creditLimit) {
    creditHoldReasons.push('Credit limit exceeded');
  }

  const uniqueCommercialReasons = [...new Set(commercialBlockReasons)];
  const uniqueCreditReasons = [...new Set(creditHoldReasons)];

  return {
    currency,
    lines,
    subtotal,
    requiredPrepayment,
    remainingBalance,
    creditExposureAfterOrder,
    commercialHold: uniqueCommercialReasons.length > 0,
    creditHold: uniqueCreditReasons.length > 0,
    commercialBlockReasons: uniqueCommercialReasons,
    creditHoldReasons: uniqueCreditReasons,
    holdReasons: [...uniqueCommercialReasons, ...uniqueCreditReasons],
  };
}

export function canPlatformCoreConfirmPricedOrder(
  result: PlatformCoreOrderPricingResult
): boolean {
  return !result.creditHold && !result.commercialHold;
}
