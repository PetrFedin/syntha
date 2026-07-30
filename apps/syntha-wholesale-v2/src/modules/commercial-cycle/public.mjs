import { invariant } from '../../core/errors.mjs';

export const COMMERCIAL_STAGES = Object.freeze([
  'campaign',
  'collection',
  'showroom',
  'selection',
  'order-builder',
  'order',
  'confirmation',
  'deal-space',
]);

export function createCommercialCycle({ id, brandId, shopId, campaignName, createdAt }) {
  invariant(id, 'CYCLE_ID_REQUIRED', 'Commercial cycle id is required');
  invariant(brandId && shopId, 'CYCLE_PARTIES_REQUIRED', 'Brand and shop are required');
  invariant(brandId !== shopId, 'CYCLE_PARTIES_MUST_DIFFER', 'Brand and shop must be different');
  invariant(campaignName?.trim(), 'CAMPAIGN_NAME_REQUIRED', 'Campaign name is required');

  return Object.freeze({
    id,
    brandId,
    shopId,
    campaignName: campaignName.trim(),
    stage: 'campaign',
    version: 1,
    order: null,
    createdAt,
    updatedAt: createdAt,
  });
}

export function advanceCommercialCycle(cycle, targetStage, updatedAt) {
  const currentIndex = COMMERCIAL_STAGES.indexOf(cycle.stage);
  const targetIndex = COMMERCIAL_STAGES.indexOf(targetStage);
  invariant(targetIndex >= 0, 'STAGE_UNKNOWN', 'Unknown commercial stage', { targetStage });
  invariant(targetIndex === currentIndex + 1, 'STAGE_TRANSITION_INVALID', 'Commercial stages must advance one step at a time', {
    from: cycle.stage,
    to: targetStage,
  });
  if (targetStage === 'confirmation') {
    invariant(cycle.order, 'ORDER_REQUIRED_FOR_CONFIRMATION', 'An order is required before confirmation');
    invariant(cycle.order.totalAmount > 0, 'ORDER_TOTAL_INVALID', 'Order total must be positive');
  }
  return Object.freeze({ ...cycle, stage: targetStage, version: cycle.version + 1, updatedAt });
}

export function attachOrder(cycle, order, updatedAt) {
  invariant(cycle.stage === 'order', 'ORDER_STAGE_REQUIRED', 'Order can only be attached at the order stage', { stage: cycle.stage });
  invariant(order?.id, 'ORDER_ID_REQUIRED', 'Order id is required');
  invariant(Number.isFinite(order.totalAmount) && order.totalAmount > 0, 'ORDER_TOTAL_INVALID', 'Order total must be positive');
  invariant(typeof order.currency === 'string' && order.currency.length === 3, 'ORDER_CURRENCY_INVALID', 'Order currency must be ISO-4217 code');
  invariant(Array.isArray(order.lines) && order.lines.length > 0, 'ORDER_LINES_REQUIRED', 'Order must contain at least one line');
  const lineTotal = order.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  invariant(Math.abs(lineTotal - order.totalAmount) < 0.000001, 'ORDER_TOTAL_MISMATCH', 'Order total does not match line totals', {
    expected: lineTotal,
    actual: order.totalAmount,
  });
  return Object.freeze({
    ...cycle,
    order: Object.freeze({ ...order, lines: Object.freeze(order.lines.map((line) => Object.freeze({ ...line }))) }),
    version: cycle.version + 1,
    updatedAt,
  });
}
