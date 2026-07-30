import { domainEvent } from '../core/events.mjs';
import { invariant } from '../core/errors.mjs';
import { assertTradePair } from '../modules/organisations/public.mjs';
import {
  advanceCommercialCycle,
  attachOrder,
  createCommercialCycle,
} from '../modules/commercial-cycle/public.mjs';
import { openDealSpace } from '../modules/deal-space/public.mjs';
import { createCalendarMilestone } from '../modules/calendar/public.mjs';

export function createWholesalePlatform({ clock = () => new Date().toISOString(), nextId = defaultIdGenerator() } = {}) {
  const organisations = new Map();
  const cycles = new Map();
  const deals = new Map();
  const calendar = new Map();
  const events = [];
  const commandResults = new Map();

  function execute(commandId, fingerprint, action) {
    invariant(commandId, 'COMMAND_ID_REQUIRED', 'Every mutation requires commandId');
    const previous = commandResults.get(commandId);
    if (previous) {
      invariant(previous.fingerprint === fingerprint, 'COMMAND_ID_CONFLICT', 'commandId was already used by another mutation', { commandId });
      return previous.result;
    }
    const result = action();
    commandResults.set(commandId, Object.freeze({ fingerprint, result }));
    return result;
  }

  function append(type, aggregateId, payload, commandId) {
    const event = domainEvent({
      id: nextId('event'),
      type,
      aggregateId,
      occurredAt: clock(),
      payload,
      metadata: { commandId },
    });
    events.push(event);
    return event;
  }

  return Object.freeze({
    registerOrganisation(commandId, organisation) {
      return execute(commandId, `registerOrganisation:${JSON.stringify(organisation)}`, () => {
        invariant(!organisations.has(organisation.id), 'ORG_ALREADY_EXISTS', 'Organisation already exists', { id: organisation.id });
        organisations.set(organisation.id, organisation);
        append('organisation.registered', organisation.id, { type: organisation.type }, commandId);
        return organisation;
      });
    },

    startCycle(commandId, { brandId, shopId, campaignName }) {
      return execute(commandId, `startCycle:${JSON.stringify({ brandId, shopId, campaignName })}`, () => {
        const brand = organisations.get(brandId);
        const shop = organisations.get(shopId);
        assertTradePair({ brand, shop });
        const cycle = createCommercialCycle({
          id: nextId('cycle'),
          brandId,
          shopId,
          campaignName,
          createdAt: clock(),
        });
        cycles.set(cycle.id, cycle);
        append('commercial-cycle.started', cycle.id, { brandId, shopId, campaignName: cycle.campaignName }, commandId);
        return cycle;
      });
    },

    advanceCycle(commandId, cycleId, targetStage) {
      return execute(commandId, `advanceCycle:${cycleId}:${targetStage}`, () => {
        const current = requireCycle(cycles, cycleId);
        const updated = advanceCommercialCycle(current, targetStage, clock());
        cycles.set(cycleId, updated);
        append('commercial-cycle.advanced', cycleId, { from: current.stage, to: targetStage, version: updated.version }, commandId);
        return updated;
      });
    },

    attachOrder(commandId, cycleId, order) {
      return execute(commandId, `attachOrder:${cycleId}:${JSON.stringify(order)}`, () => {
        const current = requireCycle(cycles, cycleId);
        const updated = attachOrder(current, order, clock());
        cycles.set(cycleId, updated);
        append('order.attached', cycleId, { orderId: order.id, totalAmount: order.totalAmount, currency: order.currency }, commandId);
        return updated;
      });
    },

    confirmAndOpenDeal(commandId, cycleId) {
      return execute(commandId, `confirmAndOpenDeal:${cycleId}`, () => {
        const current = requireCycle(cycles, cycleId);
        const confirmed = advanceCommercialCycle(current, 'confirmation', clock());
        const deal = openDealSpace({ id: nextId('deal'), cycle: confirmed, createdAt: clock() });
        const brandMilestone = createCalendarMilestone({
          id: nextId('calendar'),
          ownerOrganisationId: confirmed.brandId,
          cycleId,
          type: 'deal',
          title: `Deal opened for ${confirmed.order.id}`,
          startsAt: clock(),
          visibility: 'shared',
        });
        const shopMilestone = createCalendarMilestone({
          id: nextId('calendar'),
          ownerOrganisationId: confirmed.shopId,
          cycleId,
          type: 'deal',
          title: `Deal opened for ${confirmed.order.id}`,
          startsAt: brandMilestone.startsAt,
          visibility: 'shared',
        });
        const completed = advanceCommercialCycle(confirmed, 'deal-space', clock());
        cycles.set(cycleId, completed);
        deals.set(deal.id, deal);
        calendar.set(brandMilestone.id, brandMilestone);
        calendar.set(shopMilestone.id, shopMilestone);
        append('order.confirmed', cycleId, { orderId: completed.order.id }, commandId);
        append('deal-space.opened', deal.id, { cycleId, orderId: deal.orderId }, commandId);
        return Object.freeze({ cycle: completed, deal, milestones: Object.freeze([brandMilestone, shopMilestone]) });
      });
    },

    snapshot() {
      return Object.freeze({
        organisations: [...organisations.values()],
        cycles: [...cycles.values()],
        deals: [...deals.values()],
        calendar: [...calendar.values()],
        events: [...events],
      });
    },
  });
}

function requireCycle(cycles, cycleId) {
  const cycle = cycles.get(cycleId);
  invariant(cycle, 'CYCLE_NOT_FOUND', 'Commercial cycle not found', { cycleId });
  return cycle;
}

function defaultIdGenerator() {
  let sequence = 0;
  return (prefix) => `${prefix}_${++sequence}`;
}
