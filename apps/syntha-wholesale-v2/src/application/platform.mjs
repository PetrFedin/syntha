import { domainEvent } from '../core/events.mjs';
import { invariant } from '../core/errors.mjs';
import { assertTradePair } from '../modules/organisations/public.mjs';
import {
  CAPABILITIES,
  assertCapability,
  assertTradeCapability,
  membershipKey,
} from '../modules/access-control/public.mjs';
import {
  advanceCommercialCycle,
  attachOrder,
  createCommercialCycle,
} from '../modules/commercial-cycle/public.mjs';
import { openDealSpace } from '../modules/deal-space/public.mjs';
import { createCalendarMilestone } from '../modules/calendar/public.mjs';

export function createWholesalePlatform({
  clock = () => new Date().toISOString(),
  nextId = defaultIdGenerator(),
  systemActorId = 'system',
} = {}) {
  const organisations = new Map();
  const memberships = new Map();
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

  function append(type, aggregateId, payload, commandId, actorId) {
    const event = domainEvent({
      id: nextId('event'),
      type,
      aggregateId,
      occurredAt: clock(),
      payload,
      metadata: { commandId, actorId },
    });
    events.push(event);
    return event;
  }

  function tradeMemberships(cycle) {
    return [...memberships.values()].filter((membership) =>
      membership.organisationId === cycle.brandId || membership.organisationId === cycle.shopId,
    );
  }

  function authorizeTrade(actorId, cycle, capability) {
    return assertTradeCapability({
      memberships: tradeMemberships(cycle),
      actorId,
      brandId: cycle.brandId,
      shopId: cycle.shopId,
      capability,
    });
  }

  return Object.freeze({
    registerOrganisation(commandId, actorId, organisation) {
      return execute(commandId, `registerOrganisation:${actorId}:${JSON.stringify(organisation)}`, () => {
        invariant(actorId === systemActorId, 'SYSTEM_ACTOR_REQUIRED', 'Only the system actor can register organisations');
        invariant(!organisations.has(organisation.id), 'ORG_ALREADY_EXISTS', 'Organisation already exists', { id: organisation.id });
        organisations.set(organisation.id, organisation);
        append('organisation.registered', organisation.id, { type: organisation.type }, commandId, actorId);
        return organisation;
      });
    },

    grantMembership(commandId, actorId, membership) {
      return execute(commandId, `grantMembership:${actorId}:${JSON.stringify(membership)}`, () => {
        const organisation = organisations.get(membership.organisationId);
        invariant(organisation, 'ORG_NOT_FOUND', 'Membership organisation not found', { organisationId: membership.organisationId });
        invariant(organisation.type === membership.organisationType, 'MEMBERSHIP_ORG_TYPE_MISMATCH', 'Membership organisation type does not match organisation');
        const organisationMemberships = [...memberships.values()].filter((item) => item.organisationId === organisation.id);
        if (organisationMemberships.length === 0) {
          invariant(actorId === systemActorId, 'SYSTEM_ACTOR_REQUIRED', 'Only the system actor can bootstrap the first membership');
          invariant(membership.role === 'owner', 'FIRST_MEMBERSHIP_OWNER_REQUIRED', 'The first membership must be owner');
        } else {
          const actorMembership = memberships.get(membershipKey(organisation.id, actorId));
          assertCapability(actorMembership, CAPABILITIES.ORGANISATION_MANAGE);
        }
        const key = membershipKey(organisation.id, membership.userId);
        invariant(!memberships.has(key), 'MEMBERSHIP_ALREADY_EXISTS', 'User already belongs to organisation', {
          organisationId: organisation.id,
          userId: membership.userId,
        });
        memberships.set(key, membership);
        append('membership.granted', membership.id, {
          organisationId: organisation.id,
          userId: membership.userId,
          role: membership.role,
        }, commandId, actorId);
        return membership;
      });
    },

    startCycle(commandId, actorId, { brandId, shopId, campaignName }) {
      return execute(commandId, `startCycle:${actorId}:${JSON.stringify({ brandId, shopId, campaignName })}`, () => {
        const brand = organisations.get(brandId);
        const shop = organisations.get(shopId);
        assertTradePair({ brand, shop });
        assertTradeCapability({
          memberships: [...memberships.values()],
          actorId,
          brandId,
          shopId,
          capability: CAPABILITIES.COMMERCIAL_CYCLE_CREATE,
        });
        const cycle = createCommercialCycle({
          id: nextId('cycle'),
          brandId,
          shopId,
          campaignName,
          createdAt: clock(),
        });
        cycles.set(cycle.id, cycle);
        append('commercial-cycle.started', cycle.id, { brandId, shopId, campaignName: cycle.campaignName }, commandId, actorId);
        return cycle;
      });
    },

    advanceCycle(commandId, actorId, cycleId, targetStage) {
      return execute(commandId, `advanceCycle:${actorId}:${cycleId}:${targetStage}`, () => {
        const current = requireCycle(cycles, cycleId);
        authorizeTrade(actorId, current, CAPABILITIES.COMMERCIAL_CYCLE_ADVANCE);
        const updated = advanceCommercialCycle(current, targetStage, clock());
        cycles.set(cycleId, updated);
        append('commercial-cycle.advanced', cycleId, { from: current.stage, to: targetStage, version: updated.version }, commandId, actorId);
        return updated;
      });
    },

    attachOrder(commandId, actorId, cycleId, order) {
      return execute(commandId, `attachOrder:${actorId}:${cycleId}:${JSON.stringify(order)}`, () => {
        const current = requireCycle(cycles, cycleId);
        authorizeTrade(actorId, current, CAPABILITIES.ORDER_WRITE);
        const updated = attachOrder(current, order, clock());
        cycles.set(cycleId, updated);
        append('order.attached', cycleId, { orderId: order.id, totalAmount: order.totalAmount, currency: order.currency }, commandId, actorId);
        return updated;
      });
    },

    confirmAndOpenDeal(commandId, actorId, cycleId) {
      return execute(commandId, `confirmAndOpenDeal:${actorId}:${cycleId}`, () => {
        const current = requireCycle(cycles, cycleId);
        authorizeTrade(actorId, current, CAPABILITIES.ORDER_CONFIRM);
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
        append('order.confirmed', cycleId, { orderId: completed.order.id }, commandId, actorId);
        append('deal-space.opened', deal.id, { cycleId, orderId: deal.orderId }, commandId, actorId);
        return Object.freeze({ cycle: completed, deal, milestones: Object.freeze([brandMilestone, shopMilestone]) });
      });
    },

    snapshot() {
      return Object.freeze({
        organisations: [...organisations.values()],
        memberships: [...memberships.values()],
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
