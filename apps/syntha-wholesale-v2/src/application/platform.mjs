import { domainEvent } from '../core/events.mjs';
import { invariant } from '../core/errors.mjs';
import { assertWholesaleStore } from './store-contract.mjs';
import { assertTradePair } from '../modules/organisations/public.mjs';
import { CAPABILITIES, assertCapability, assertTradeCapability } from '../modules/access-control/public.mjs';
import { assertActiveRelationship } from '../modules/counterparty-relationships/public.mjs';
import { createCampaign, changeCampaignStatus } from '../modules/campaigns/public.mjs';
import { createCollection, publishCollection } from '../modules/collections/public.mjs';
import { advanceCommercialCycle, attachOrder, createCommercialCycle } from '../modules/commercial-cycle/public.mjs';
import { openDealSpace } from '../modules/deal-space/public.mjs';
import { createCalendarMilestone } from '../modules/calendar/public.mjs';

export function createWholesalePlatform({
  store,
  clock = () => new Date().toISOString(),
  nextId = defaultIdGenerator(),
  systemActorId = 'system',
} = {}) {
  assertWholesaleStore(store);

  function execute(commandId, fingerprint, actorId, action) {
    invariant(commandId, 'COMMAND_ID_REQUIRED', 'Every mutation requires commandId');
    return store.transaction(async (tx) => {
      const previous = tx.getCommand(commandId);
      if (previous) {
        invariant(previous.fingerprint === fingerprint, 'COMMAND_ID_CONFLICT', 'commandId was already used by another mutation', { commandId });
        return previous.result;
      }
      const result = await action(tx);
      tx.insertCommand(Object.freeze({ id: commandId, fingerprint, actorId, result, completedAt: clock() }));
      return result;
    });
  }

  function append(tx, type, aggregateId, payload, commandId, actorId) {
    const event = domainEvent({ id: nextId('event'), type, aggregateId, occurredAt: clock(), payload, metadata: { commandId, actorId } });
    tx.appendOutbox(event);
    return event;
  }

  function assertOrganisationActor(tx, organisationId, actorId, capability) {
    const membership = tx.getMembership(organisationId, actorId);
    assertCapability(membership, capability);
    return membership;
  }

  function authorizeTrade(tx, actorId, cycle, capability) {
    return assertTradeCapability({
      memberships: tx.listMembershipsForTrade(cycle.brandId, cycle.shopId), actorId,
      brandId: cycle.brandId, shopId: cycle.shopId, capability,
    });
  }

  return Object.freeze({
    registerOrganisation(commandId, actorId, organisation) {
      return execute(commandId, `registerOrganisation:${actorId}:${JSON.stringify(organisation)}`, actorId, (tx) => {
        invariant(actorId === systemActorId, 'SYSTEM_ACTOR_REQUIRED', 'Only the system actor can register organisations');
        tx.insertOrganisation(organisation);
        append(tx, 'organisation.registered', organisation.id, { type: organisation.type }, commandId, actorId);
        return organisation;
      });
    },

    grantMembership(commandId, actorId, membership) {
      return execute(commandId, `grantMembership:${actorId}:${JSON.stringify(membership)}`, actorId, (tx) => {
        const organisation = tx.getOrganisation(membership.organisationId);
        invariant(organisation, 'ORG_NOT_FOUND', 'Membership organisation not found', { organisationId: membership.organisationId });
        invariant(organisation.type === membership.organisationType, 'MEMBERSHIP_ORG_TYPE_MISMATCH', 'Membership organisation type does not match organisation');
        const organisationMemberships = tx.listMembershipsByOrganisation(organisation.id);
        if (organisationMemberships.length === 0) {
          invariant(actorId === systemActorId, 'SYSTEM_ACTOR_REQUIRED', 'Only the system actor can bootstrap the first membership');
          invariant(membership.role === 'owner', 'FIRST_MEMBERSHIP_OWNER_REQUIRED', 'The first membership must be owner');
        } else {
          assertOrganisationActor(tx, organisation.id, actorId, CAPABILITIES.ORGANISATION_MANAGE);
        }
        tx.insertMembership(membership);
        append(tx, 'membership.granted', membership.id, { organisationId: organisation.id, userId: membership.userId, role: membership.role }, commandId, actorId);
        return membership;
      });
    },

    createCampaign(commandId, actorId, input) {
      return execute(commandId, `createCampaign:${actorId}:${JSON.stringify(input)}`, actorId, (tx) => {
        const brand = tx.getOrganisation(input.brandId);
        invariant(brand?.type === 'brand', 'BRAND_REQUIRED', 'Campaign owner must be a brand');
        assertOrganisationActor(tx, brand.id, actorId, CAPABILITIES.CAMPAIGN_MANAGE);
        const campaign = createCampaign({ id: nextId('campaign'), ...input, createdAt: clock() });
        tx.insertCampaign(campaign);
        append(tx, 'campaign.created', campaign.id, { brandId: campaign.brandId, season: campaign.season }, commandId, actorId);
        return campaign;
      });
    },

    openCampaign(commandId, actorId, campaignId) {
      return execute(commandId, `openCampaign:${actorId}:${campaignId}`, actorId, (tx) => {
        const current = requireEntity(tx.getCampaign(campaignId), 'CAMPAIGN_NOT_FOUND', { campaignId });
        assertOrganisationActor(tx, current.brandId, actorId, CAPABILITIES.CAMPAIGN_MANAGE);
        const updated = changeCampaignStatus(current, 'open', clock());
        tx.saveCampaign(updated, current.version);
        append(tx, 'campaign.opened', campaignId, { version: updated.version }, commandId, actorId);
        return updated;
      });
    },

    createCollection(commandId, actorId, input) {
      return execute(commandId, `createCollection:${actorId}:${JSON.stringify(input)}`, actorId, (tx) => {
        const campaign = requireEntity(tx.getCampaign(input.campaignId), 'CAMPAIGN_NOT_FOUND', { campaignId: input.campaignId });
        assertOrganisationActor(tx, campaign.brandId, actorId, CAPABILITIES.COLLECTION_MANAGE);
        const collection = createCollection({ id: nextId('collection'), campaign, ...input, createdAt: clock() });
        tx.insertCollection(collection);
        append(tx, 'collection.created', collection.id, { campaignId: campaign.id, currency: collection.currency }, commandId, actorId);
        return collection;
      });
    },

    publishCollection(commandId, actorId, collectionId) {
      return execute(commandId, `publishCollection:${actorId}:${collectionId}`, actorId, (tx) => {
        const current = requireEntity(tx.getCollection(collectionId), 'COLLECTION_NOT_FOUND', { collectionId });
        const campaign = requireEntity(tx.getCampaign(current.campaignId), 'CAMPAIGN_NOT_FOUND', { campaignId: current.campaignId });
        assertOrganisationActor(tx, current.brandId, actorId, CAPABILITIES.COLLECTION_MANAGE);
        const updated = publishCollection(current, campaign, clock());
        tx.saveCollection(updated, current.version);
        append(tx, 'collection.published', collectionId, { version: updated.version }, commandId, actorId);
        return updated;
      });
    },

    startCycle(commandId, actorId, { brandId, shopId, campaignId, collectionId }) {
      const input = { brandId, shopId, campaignId, collectionId };
      return execute(commandId, `startCycle:${actorId}:${JSON.stringify(input)}`, actorId, (tx) => {
        const brand = tx.getOrganisation(brandId);
        const shop = tx.getOrganisation(shopId);
        assertTradePair({ brand, shop });
        assertTradeCapability({
          memberships: tx.listMembershipsForTrade(brandId, shopId), actorId, brandId, shopId,
          capability: CAPABILITIES.COMMERCIAL_CYCLE_CREATE,
        });
        const relationship = tx.getRelationshipByTrade(brandId, shopId);
        assertActiveRelationship(relationship, { brandId, shopId });
        const campaign = requireEntity(tx.getCampaign(campaignId), 'CAMPAIGN_NOT_FOUND', { campaignId });
        const collection = requireEntity(tx.getCollection(collectionId), 'COLLECTION_NOT_FOUND', { collectionId });
        const cycle = createCommercialCycle({ id: nextId('cycle'), brandId, shopId, campaign, collection, createdAt: clock() });
        tx.insertCycle(cycle);
        append(tx, 'commercial-cycle.started', cycle.id, { ...input, relationshipId: relationship.id }, commandId, actorId);
        return cycle;
      });
    },

    advanceCycle(commandId, actorId, cycleId, targetStage) {
      return execute(commandId, `advanceCycle:${actorId}:${cycleId}:${targetStage}`, actorId, (tx) => {
        const current = requireEntity(tx.getCycle(cycleId), 'CYCLE_NOT_FOUND', { cycleId });
        authorizeTrade(tx, actorId, current, CAPABILITIES.COMMERCIAL_CYCLE_ADVANCE);
        const updated = advanceCommercialCycle(current, targetStage, clock());
        tx.saveCycle(updated, current.version);
        append(tx, 'commercial-cycle.advanced', cycleId, { from: current.stage, to: targetStage, version: updated.version }, commandId, actorId);
        return updated;
      });
    },

    attachOrder(commandId, actorId, cycleId, order) {
      return execute(commandId, `attachOrder:${actorId}:${cycleId}:${JSON.stringify(order)}`, actorId, (tx) => {
        const current = requireEntity(tx.getCycle(cycleId), 'CYCLE_NOT_FOUND', { cycleId });
        authorizeTrade(tx, actorId, current, CAPABILITIES.ORDER_WRITE);
        const collection = requireEntity(tx.getCollection(current.collectionId), 'COLLECTION_NOT_FOUND', { collectionId: current.collectionId });
        invariant(order.currency === collection.currency, 'ORDER_COLLECTION_CURRENCY_MISMATCH', 'Order currency must match collection currency', {
          orderCurrency: order.currency, collectionCurrency: collection.currency,
        });
        const updated = attachOrder(current, order, clock());
        tx.saveCycle(updated, current.version);
        append(tx, 'order.attached', cycleId, { orderId: order.id, totalAmount: order.totalAmount, currency: order.currency }, commandId, actorId);
        return updated;
      });
    },

    confirmAndOpenDeal(commandId, actorId, cycleId) {
      return execute(commandId, `confirmAndOpenDeal:${actorId}:${cycleId}`, actorId, (tx) => {
        const current = requireEntity(tx.getCycle(cycleId), 'CYCLE_NOT_FOUND', { cycleId });
        authorizeTrade(tx, actorId, current, CAPABILITIES.ORDER_CONFIRM);
        const confirmed = advanceCommercialCycle(current, 'confirmation', clock());
        tx.saveCycle(confirmed, current.version);
        const deal = openDealSpace({ id: nextId('deal'), cycle: confirmed, createdAt: clock() });
        const brandMilestone = createCalendarMilestone({
          id: nextId('calendar'), ownerOrganisationId: confirmed.brandId, cycleId, type: 'deal',
          title: `Deal opened for ${confirmed.order.id}`, startsAt: clock(), visibility: 'shared',
        });
        const shopMilestone = createCalendarMilestone({
          id: nextId('calendar'), ownerOrganisationId: confirmed.shopId, cycleId, type: 'deal',
          title: `Deal opened for ${confirmed.order.id}`, startsAt: brandMilestone.startsAt, visibility: 'shared',
        });
        const completed = advanceCommercialCycle(confirmed, 'deal-space', clock());
        tx.saveCycle(completed, confirmed.version);
        tx.insertDeal(deal);
        tx.insertCalendarMilestone(brandMilestone);
        tx.insertCalendarMilestone(shopMilestone);
        append(tx, 'order.confirmed', cycleId, { orderId: completed.order.id }, commandId, actorId);
        append(tx, 'deal-space.opened', deal.id, { cycleId, orderId: deal.orderId }, commandId, actorId);
        return Object.freeze({ cycle: completed, deal, milestones: Object.freeze([brandMilestone, shopMilestone]) });
      });
    },

    snapshot() { return store.snapshot(); },
  });
}

function requireEntity(entity, code, details) {
  invariant(entity, code, 'Entity not found', details);
  return entity;
}
function defaultIdGenerator() {
  let sequence = 0;
  return (prefix) => `${prefix}_${++sequence}`;
}
