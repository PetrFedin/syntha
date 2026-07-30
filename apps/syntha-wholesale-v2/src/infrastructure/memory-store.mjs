import { invariant } from '../core/errors.mjs';
import { membershipKey } from '../modules/access-control/public.mjs';

export function createMemoryWholesaleStore() {
  let state = emptyState();
  let transactionTail = Promise.resolve();

  function transaction(work) {
    const run = transactionTail.then(async () => {
      const draft = cloneState(state);
      const tx = transactionView(draft);
      const result = await work(tx);
      state = draft;
      return result;
    });
    transactionTail = run.catch(() => undefined);
    return run;
  }

  return Object.freeze({
    transaction,
    snapshot() {
      return freezeSnapshot(state);
    },
    readOutbox(status = 'pending') {
      return [...state.outbox.values()].filter((record) => record.status === status);
    },
    async markOutboxPublished(eventIds, publishedAt) {
      return transaction((tx) => {
        for (const eventId of eventIds) tx.markOutboxPublished(eventId, publishedAt);
      });
    },
  });
}

function emptyState() {
  return {
    organisations: new Map(),
    memberships: new Map(),
    campaigns: new Map(),
    collections: new Map(),
    cycles: new Map(),
    deals: new Map(),
    calendar: new Map(),
    commands: new Map(),
    outbox: new Map(),
  };
}

function cloneState(state) {
  return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, new Map(value)]));
}

function transactionView(state) {
  return Object.freeze({
    getOrganisation: (id) => state.organisations.get(id),
    insertOrganisation: (organisation) => insertUnique(state.organisations, organisation.id, organisation, 'ORG_ALREADY_EXISTS'),

    getMembership: (organisationId, userId) => state.memberships.get(membershipKey(organisationId, userId)),
    listMembershipsByOrganisation: (organisationId) => [...state.memberships.values()].filter((item) => item.organisationId === organisationId),
    listMembershipsForTrade: (brandId, shopId) => [...state.memberships.values()].filter((item) => item.organisationId === brandId || item.organisationId === shopId),
    insertMembership: (membership) => insertUnique(state.memberships, membershipKey(membership.organisationId, membership.userId), membership, 'MEMBERSHIP_ALREADY_EXISTS'),

    getCampaign: (id) => state.campaigns.get(id),
    insertCampaign: (campaign) => insertUnique(state.campaigns, campaign.id, campaign, 'CAMPAIGN_ALREADY_EXISTS'),
    saveCampaign: (campaign, expectedVersion) => saveVersioned(state.campaigns, campaign, expectedVersion, 'CAMPAIGN_CONCURRENCY_CONFLICT'),

    getCollection: (id) => state.collections.get(id),
    insertCollection: (collection) => insertUnique(state.collections, collection.id, collection, 'COLLECTION_ALREADY_EXISTS'),
    saveCollection: (collection, expectedVersion) => saveVersioned(state.collections, collection, expectedVersion, 'COLLECTION_CONCURRENCY_CONFLICT'),

    getCycle: (id) => state.cycles.get(id),
    insertCycle: (cycle) => insertUnique(state.cycles, cycle.id, cycle, 'CYCLE_ALREADY_EXISTS'),
    saveCycle: (cycle, expectedVersion) => saveVersioned(state.cycles, cycle, expectedVersion, 'CYCLE_CONCURRENCY_CONFLICT'),

    insertDeal: (deal) => insertUnique(state.deals, deal.id, deal, 'DEAL_ALREADY_EXISTS'),
    insertCalendarMilestone: (milestone) => insertUnique(state.calendar, milestone.id, milestone, 'CALENDAR_MILESTONE_ALREADY_EXISTS'),

    getCommand: (id) => state.commands.get(id),
    insertCommand: (command) => insertUnique(state.commands, command.id, command, 'COMMAND_ALREADY_EXISTS'),

    appendOutbox: (event) => insertUnique(state.outbox, event.id, Object.freeze({ event, status: 'pending', publishedAt: null }), 'OUTBOX_EVENT_ALREADY_EXISTS'),
    markOutboxPublished: (eventId, publishedAt) => {
      const current = state.outbox.get(eventId);
      invariant(current, 'OUTBOX_EVENT_NOT_FOUND', 'Outbox event not found', { eventId });
      state.outbox.set(eventId, Object.freeze({ ...current, status: 'published', publishedAt }));
    },
  });
}

function insertUnique(map, key, value, code) {
  invariant(!map.has(key), code, 'Entity already exists', { key });
  map.set(key, value);
}

function saveVersioned(map, entity, expectedVersion, code) {
  const current = map.get(entity.id);
  invariant(current, 'ENTITY_NOT_FOUND', 'Versioned entity not found', { id: entity.id });
  invariant(current.version === expectedVersion, code, 'Optimistic concurrency conflict', {
    id: entity.id,
    expectedVersion,
    actualVersion: current.version,
  });
  invariant(entity.version === expectedVersion + 1, 'VERSION_INCREMENT_INVALID', 'Version must increment exactly once', {
    id: entity.id,
    expectedVersion,
    nextVersion: entity.version,
  });
  map.set(entity.id, entity);
}

function freezeSnapshot(state) {
  return Object.freeze({
    organisations: [...state.organisations.values()],
    memberships: [...state.memberships.values()],
    campaigns: [...state.campaigns.values()],
    collections: [...state.collections.values()],
    cycles: [...state.cycles.values()],
    deals: [...state.deals.values()],
    calendar: [...state.calendar.values()],
    commands: [...state.commands.values()],
    outbox: [...state.outbox.values()],
    events: [...state.outbox.values()].map((record) => record.event),
  });
}
