/**
 * Market Room B2C domain: brand <-> client introduction, delayed purchase attribution,
 * evidence-gated commission and buyer reward. This is a PURE calculation module.
 *
 * Never interpret a client-submitted verification/status as trusted: only authorized
 * server handlers may build verified purchase snapshots from PSP or reconciled ERP data.
 * Persistence, authentication and settlement transfers are implemented separately.
 */

export type MarketRoomTouchKind =
  | 'room_entered'
  | 'product_saved'
  | 'brand_chat_started'
  | 'consultation_booked'
  | 'offer_accepted'
  | 'checkout_started'
  | 'tracked_brand_link_opened';

export type MarketRoomPurchaseSource =
  | 'marketroom_checkout'
  | 'brand_online_checkout'
  | 'buyer_purchase_claim';

export type MarketRoomVerification =
  | 'pending'
  | 'psp_verified'
  | 'brand_erp_client_reconciled'
  | 'admin_audited'
  | 'rejected';

export type MarketRoomPurchaseStatus =
  | 'paid'
  | 'delivered'
  | 'cancelled'
  | 'charged_back';

export type MarketRoomCommissionStatus =
  | 'not_attributed'
  | 'pending_verification'
  | 'provisional'
  | 'ready_for_settlement'
  | 'closed_zero';

export interface MarketRoomRelationship {
  id: string;
  clientId: string;
  brandId: string;
  /** Server-recorded, not an arbitrary click from an unknown visitor. */
  sourceEventId: string;
  source: MarketRoomTouchKind;
  qualifiedAt: string;
  /** Consent to use customer-brand interaction for transaction attribution. */
  attributionConsent: boolean;
}

export interface MarketRoomBrandAgreement {
  brandId: string;
  currency: string;
  /** Percentage in basis points. 1000 bps = 10%. Agreement, not global constant. */
  commissionBps: number;
  /** Customer reward funded by the commission / separately agreed marketing budget. */
  buyerRewardBps: number;
  /** Max time between qualifying brand interaction and a later purchase. */
  attributionWindowDays: number;
  /** Days after delivery before bonus becomes spendable and commission payable. */
  returnHoldDays: number;
  validFrom: string;
  validUntil?: string;
}

export interface MarketRoomPurchase {
  id: string;
  clientId: string;
  brandId: string;
  currency: string;
  purchasedAt: string;
  /** Server-calculated paid merchandise excluding non-commissionable components. */
  eligiblePaidMinor: number;
  refundedEligibleMinor: number;
  source: MarketRoomPurchaseSource;
  status: MarketRoomPurchaseStatus;
  verification: MarketRoomVerification;
  /** Trusted PSP reference, reconciled invoice or administrator evidence ID. */
  verificationReference?: string;
  deliveredAt?: string;
}

export type MarketRoomAttributionReason =
  | 'qualified'
  | 'no_relationship'
  | 'identity_mismatch'
  | 'brand_mismatch'
  | 'consent_missing'
  | 'non_qualifying_touch'
  | 'before_introduction'
  | 'window_expired'
  | 'agreement_inactive'
  | 'currency_mismatch';

export interface MarketRoomAttributionResult {
  eligible: boolean;
  reason: MarketRoomAttributionReason;
  relationshipId?: string;
}

export interface MarketRoomFinancialSnapshot {
  saleId: string;
  relationshipId?: string;
  attribution: MarketRoomAttributionResult;
  currency: string;
  status: MarketRoomCommissionStatus;
  /** Eligible, paid merchandise net of eligible returns, in currency minor units. */
  eligibleNetMinor: number;
  /** Verified accrual; NOT a payment to Market Room. */
  commissionAccruedMinor: number;
  commissionPayableMinor: number;
  /** Buyer reward is unavailable until verification + delivery + hold. */
  buyerRewardPendingMinor: number;
  buyerRewardAvailableMinor: number;
  /** Commission minus reward, before PSP fees, taxes, support and other costs. */
  grossContributionMinor: number;
}

export interface MarketRoomLedgerDelta {
  saleId: string;
  currency: string;
  commissionAccruedDeltaMinor: number;
  commissionPayableDeltaMinor: number;
  buyerRewardPendingDeltaMinor: number;
  buyerRewardAvailableDeltaMinor: number;
}

const DAY_MS = 86_400_000;

export const MARKET_ROOM_QUALIFYING_TOUCHES: ReadonlySet<MarketRoomTouchKind> = new Set([
  'product_saved',
  'brand_chat_started',
  'consultation_booked',
  'offer_accepted',
  'checkout_started',
  'tracked_brand_link_opened',
]);

function assertMinor(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer in minor currency units`);
  }
}

function assertRate(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new Error(`${label} must be integer basis points in [0, 10000]`);
  }
}

function assertDays(value: number, label: string, max: number): void {
  if (!Number.isInteger(value) || value < 0 || value > max) {
    throw new Error(`${label} must be whole days in [0, ${max}]`);
  }
}

function utcMs(value: string, label: string): number {
  if (
    typeof value !== 'string' ||
    !/(Z|[+-]\d{2}:\d{2})$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new Error(`${label} must be an ISO 8601 timestamp with an explicit timezone`);
  }
  return Date.parse(value);
}

function validateAgreement(agreement: MarketRoomBrandAgreement): void {
  assertRate(agreement.commissionBps, 'commissionBps');
  assertRate(agreement.buyerRewardBps, 'buyerRewardBps');
  assertDays(agreement.attributionWindowDays, 'attributionWindowDays', 365);
  assertDays(agreement.returnHoldDays, 'returnHoldDays', 180);
  if (!/^[A-Z]{3}$/.test(agreement.currency)) {
    throw new Error('currency must be an uppercase ISO 4217 code');
  }
  const start = utcMs(agreement.validFrom, 'validFrom');
  if (agreement.validUntil && utcMs(agreement.validUntil, 'validUntil') < start) {
    throw new Error('validUntil cannot precede validFrom');
  }
}

function validatePurchase(purchase: MarketRoomPurchase): void {
  utcMs(purchase.purchasedAt, 'purchasedAt');
  assertMinor(purchase.eligiblePaidMinor, 'eligiblePaidMinor');
  assertMinor(purchase.refundedEligibleMinor, 'refundedEligibleMinor');
  if (purchase.refundedEligibleMinor > purchase.eligiblePaidMinor) {
    throw new Error('refundedEligibleMinor cannot exceed eligiblePaidMinor');
  }
  if (purchase.deliveredAt) utcMs(purchase.deliveredAt, 'deliveredAt');
  if (!purchase.id.trim() || !purchase.clientId.trim() || !purchase.brandId.trim()) {
    throw new Error('purchase id, clientId and brandId are required');
  }
}

/** First eligible interaction wins for this relationship; a passive page view is not sufficient. */
export function resolveMarketRoomAttribution(input: {
  relationship?: MarketRoomRelationship | null;
  purchase: MarketRoomPurchase;
  agreement: MarketRoomBrandAgreement;
}): MarketRoomAttributionResult {
  const { relationship, purchase, agreement } = input;
  validateAgreement(agreement);
  validatePurchase(purchase);
  const time = utcMs(purchase.purchasedAt, 'purchasedAt');
  const start = utcMs(agreement.validFrom, 'validFrom');
  const end = agreement.validUntil ? utcMs(agreement.validUntil, 'validUntil') : Infinity;

  if (agreement.brandId !== purchase.brandId) {
    return { eligible: false, reason: 'brand_mismatch' };
  }
  if (agreement.currency !== purchase.currency) {
    return { eligible: false, reason: 'currency_mismatch' };
  }
  if (!relationship) return { eligible: false, reason: 'no_relationship' };
  if (relationship.clientId !== purchase.clientId) {
    return { eligible: false, reason: 'identity_mismatch' };
  }
  if (relationship.brandId !== purchase.brandId) {
    return { eligible: false, reason: 'brand_mismatch' };
  }
  if (!relationship.attributionConsent) {
    return { eligible: false, reason: 'consent_missing' };
  }
  if (!relationship.sourceEventId.trim() || !MARKET_ROOM_QUALIFYING_TOUCHES.has(relationship.source)) {
    return { eligible: false, reason: 'non_qualifying_touch' };
  }
  const firstTouch = utcMs(relationship.qualifiedAt, 'qualifiedAt');
  if (time < firstTouch) {
    return { eligible: false, reason: 'before_introduction' };
  }
  if (time < start || time > end || firstTouch < start || firstTouch > end) {
    return { eligible: false, reason: 'agreement_inactive' };
  }
  if (time - firstTouch > agreement.attributionWindowDays * DAY_MS) {
    return { eligible: false, reason: 'window_expired' };
  }
  return { eligible: true, reason: 'qualified', relationshipId: relationship.id };
}

/** Integer minor units throughout, HALF-UP rounding to the nearest minor unit. */
export function calculateMarketRoomBasisPoints(amountMinor: number, basisPoints: number): number {
  assertMinor(amountMinor, 'amountMinor');
  assertRate(basisPoints, 'basisPoints');
  const rounded =
    (BigInt(amountMinor) * BigInt(basisPoints) + BigInt(5_000)) / BigInt(10_000);
  if (rounded > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Calculated amount exceeds safe integer range');
  }
  return Number(rounded);
}

export function calculateMarketRoomFinancialSnapshot(input: {
  relationship?: MarketRoomRelationship | null;
  purchase: MarketRoomPurchase;
  agreement: MarketRoomBrandAgreement;
  asOf: string;
}): MarketRoomFinancialSnapshot {
  const { purchase, agreement } = input;
  const asOf = utcMs(input.asOf, 'asOf');
  const attribution = resolveMarketRoomAttribution(input);
  const eligibleNetMinor =
    purchase.status === 'cancelled' || purchase.status === 'charged_back'
      ? 0
      : purchase.eligiblePaidMinor - purchase.refundedEligibleMinor;

  const base: MarketRoomFinancialSnapshot = {
    saleId: purchase.id,
    relationshipId: attribution.relationshipId,
    attribution,
    currency: purchase.currency,
    status: 'not_attributed',
    eligibleNetMinor,
    commissionAccruedMinor: 0,
    commissionPayableMinor: 0,
    buyerRewardPendingMinor: 0,
    buyerRewardAvailableMinor: 0,
    grossContributionMinor: 0,
  };

  if (!attribution.eligible) return base;
  const verified =
    purchase.verification === 'psp_verified' ||
    purchase.verification === 'brand_erp_client_reconciled' ||
    purchase.verification === 'admin_audited';

  if (purchase.verification === 'rejected' || !verified || !purchase.verificationReference?.trim()) {
    return { ...base, status: 'pending_verification' };
  }
  if (eligibleNetMinor === 0) return { ...base, status: 'closed_zero' };

  const fee = calculateMarketRoomBasisPoints(eligibleNetMinor, agreement.commissionBps);
  const reward = calculateMarketRoomBasisPoints(eligibleNetMinor, agreement.buyerRewardBps);

  const delivered =
    purchase.status === 'delivered' &&
    typeof purchase.deliveredAt === 'string' &&
    utcMs(purchase.deliveredAt, 'deliveredAt') >= utcMs(purchase.purchasedAt, 'purchasedAt');

  const eligibleForRelease =
    delivered && asOf >= utcMs(purchase.deliveredAt!, 'deliveredAt') + agreement.returnHoldDays * DAY_MS;

  return {
    ...base,
    status: eligibleForRelease ? 'ready_for_settlement' : 'provisional',
    commissionAccruedMinor: fee,
    commissionPayableMinor: eligibleForRelease ? fee : 0,
    buyerRewardPendingMinor: eligibleForRelease ? 0 : reward,
    buyerRewardAvailableMinor: eligibleForRelease ? reward : 0,
    grossContributionMinor: fee - reward,
  };
}

/**
 * Changes to refunded value generate NEGATIVE ledger deltas, never a second full payout.
 * Persistence layer MUST enforce unique (saleId, settlementRevision) for idempotency.
 */
export function calculateMarketRoomLedgerDelta(
  previous: MarketRoomFinancialSnapshot | null,
  next: MarketRoomFinancialSnapshot
): MarketRoomLedgerDelta {
  if (previous && (previous.saleId !== next.saleId || previous.currency !== next.currency)) {
    throw new Error('Ledger comparison requires the same sale and currency');
  }
  return {
    saleId: next.saleId,
    currency: next.currency,
    commissionAccruedDeltaMinor:
      next.commissionAccruedMinor - (previous?.commissionAccruedMinor ?? 0),
    commissionPayableDeltaMinor:
      next.commissionPayableMinor - (previous?.commissionPayableMinor ?? 0),
    buyerRewardPendingDeltaMinor:
      next.buyerRewardPendingMinor - (previous?.buyerRewardPendingMinor ?? 0),
    buyerRewardAvailableDeltaMinor:
      next.buyerRewardAvailableMinor - (previous?.buyerRewardAvailableMinor ?? 0),
  };
}
