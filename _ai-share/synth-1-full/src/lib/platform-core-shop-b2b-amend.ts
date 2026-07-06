export type ShopAmendChainStep = { id: string; done?: boolean };

/** Магазин может amend до подтверждения брендом (shop_sent ∧ ¬brand_confirmed). */
export function canShopAmendOrder(input: {
  variant: string;
  orderStatus?: string | null;
  poHandedOff?: boolean;
  chainSteps?: ShopAmendChainStep[] | null;
}): boolean {
  if (input.variant !== 'shop') return false;

  const steps = input.chainSteps;
  if (steps?.length) {
    const shopSentDone = steps.find((s) => s.id === 'shop_sent')?.done === true;
    const brandConfirmedDone = steps.find((s) => s.id === 'brand_confirmed')?.done === true;
    return shopSentDone && !brandConfirmedDone;
  }

  return input.poHandedOff !== true && input.orderStatus === 'submitted';
}
