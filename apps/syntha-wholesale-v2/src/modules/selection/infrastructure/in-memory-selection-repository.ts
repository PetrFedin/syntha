import {
  InMemoryLifecycleIdempotencyRegistry,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';
import type { ShowroomId } from '@/modules/showroom';

import type {
  SelectionAuditRecord,
  SelectionOutboxEvent,
  SelectionRepository,
} from '../application/selection-repository';
import type {
  Selection,
  SelectionId,
  ShowroomAccessGrant,
  ShowroomAccessGrantId,
} from '../domain/selection';

function copyGrant(grant: ShowroomAccessGrant): ShowroomAccessGrant {
  return Object.freeze({ ...grant });
}

function copySelection(selection: Selection): Selection {
  return Object.freeze({
    ...selection,
    items: Object.freeze(
      selection.items.map((item) =>
        Object.freeze({
          ...item,
          sizeCurve: Object.freeze(item.sizeCurve.map((entry) => Object.freeze({ ...entry }))),
        }),
      ),
    ),
  });
}

export class InMemorySelectionRepository implements SelectionRepository {
  private readonly grants = new Map<string, ShowroomAccessGrant>();
  private readonly selections = new Map<string, Selection>();
  private readonly idempotency = new InMemoryLifecycleIdempotencyRegistry();
  readonly audits: SelectionAuditRecord[] = [];
  readonly outbox: SelectionOutboxEvent[] = [];

  constructor(input?: {
    readonly grants?: readonly ShowroomAccessGrant[];
    readonly selections?: readonly Selection[];
  }) {
    for (const grant of input?.grants ?? []) {
      this.grants.set(this.grantKey(grant.sellerOrganisationId, grant.id), copyGrant(grant));
    }
    for (const selection of input?.selections ?? []) {
      this.selections.set(
        this.selectionKey(selection.buyerOrganisationId, selection.id),
        copySelection(selection),
      );
    }
  }

  private grantKey(sellerOrganisationId: OrganisationId, id: string): string {
    return `${sellerOrganisationId}:${id}`;
  }

  private selectionKey(buyerOrganisationId: OrganisationId, id: string): string {
    return `${buyerOrganisationId}:${id}`;
  }

  private loadGrant(command: LifecycleCreateCommand, id: string): ShowroomAccessGrant | null {
    return this.grants.get(this.grantKey(command.organisationId, id)) ?? null;
  }

  private loadSelection(command: LifecycleCreateCommand, id: string): Selection | null {
    return this.selections.get(this.selectionKey(command.organisationId, id)) ?? null;
  }

  async findActiveGrant(
    sellerOrganisationId: OrganisationId,
    showroomId: ShowroomId,
    buyerOrganisationId: OrganisationId,
  ): Promise<ShowroomAccessGrant | null> {
    const grant = [...this.grants.values()].find(
      (candidate) =>
        candidate.sellerOrganisationId === sellerOrganisationId &&
        candidate.buyerOrganisationId === buyerOrganisationId &&
        candidate.showroomId === showroomId &&
        candidate.status === 'ACTIVE',
    );
    return grant ? copyGrant(grant) : null;
  }

  async findGrantForSeller(
    sellerOrganisationId: OrganisationId,
    grantId: ShowroomAccessGrantId,
  ): Promise<ShowroomAccessGrant | null> {
    const grant = this.grants.get(this.grantKey(sellerOrganisationId, grantId));
    return grant ? copyGrant(grant) : null;
  }

  async findGrantForBuyer(
    buyerOrganisationId: OrganisationId,
    grantId: ShowroomAccessGrantId,
  ): Promise<ShowroomAccessGrant | null> {
    const grant = [...this.grants.values()].find(
      (candidate) =>
        candidate.id === grantId && candidate.buyerOrganisationId === buyerOrganisationId,
    );
    return grant ? copyGrant(grant) : null;
  }

  async listGrantsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly ShowroomAccessGrant[]> {
    return [...this.grants.values()]
      .filter((grant) => grant.sellerOrganisationId === sellerOrganisationId)
      .sort((left, right) => right.grantedAt.localeCompare(left.grantedAt))
      .map(copyGrant);
  }

  async listGrantsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly ShowroomAccessGrant[]> {
    return [...this.grants.values()]
      .filter((grant) => grant.buyerOrganisationId === buyerOrganisationId)
      .sort((left, right) => right.grantedAt.localeCompare(left.grantedAt))
      .map(copyGrant);
  }

  async findGrantReplay(command: LifecycleCreateCommand): Promise<ShowroomAccessGrant | null> {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'SHOWROOM_ACCESS_GRANT',
      loadEntity: (id) => this.loadGrant(command, id),
    });
  }

  async createGrant(
    grant: ShowroomAccessGrant,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<ShowroomAccessGrant>> {
    const replay = await this.findGrantReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    this.grants.set(this.grantKey(grant.sellerOrganisationId, grant.id), copyGrant(grant));
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));
    return this.idempotency.complete({
      command,
      resultEntityType: 'SHOWROOM_ACCESS_GRANT',
      resultEntityId: grant.id,
      entity: copyGrant(grant),
      loadEntity: (id) => this.loadGrant(command, id),
    });
  }

  async updateGrant(
    grant: ShowroomAccessGrant,
    expectedVersion: number,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
  ): Promise<boolean> {
    const key = this.grantKey(grant.sellerOrganisationId, grant.id);
    const current = this.grants.get(key);
    if (!current || current.version !== expectedVersion) return false;
    this.grants.set(key, copyGrant(grant));
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));
    return true;
  }

  async findSelection(
    buyerOrganisationId: OrganisationId,
    id: SelectionId,
  ): Promise<Selection | null> {
    const selection = this.selections.get(this.selectionKey(buyerOrganisationId, id));
    return selection ? copySelection(selection) : null;
  }

  async findSelectionByGrant(
    buyerOrganisationId: OrganisationId,
    grantId: ShowroomAccessGrantId,
  ): Promise<Selection | null> {
    const selection = [...this.selections.values()].find(
      (candidate) =>
        candidate.buyerOrganisationId === buyerOrganisationId &&
        candidate.showroomAccessGrantId === grantId,
    );
    return selection ? copySelection(selection) : null;
  }

  async listSelections(buyerOrganisationId: OrganisationId): Promise<readonly Selection[]> {
    return [...this.selections.values()]
      .filter((selection) => selection.buyerOrganisationId === buyerOrganisationId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(copySelection);
  }

  async findSelectionReplay(command: LifecycleCreateCommand): Promise<Selection | null> {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'SELECTION',
      loadEntity: (id) => this.loadSelection(command, id),
    });
  }

  async createSelection(
    selection: Selection,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<Selection>> {
    const replay = await this.findSelectionReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    this.selections.set(
      this.selectionKey(selection.buyerOrganisationId, selection.id),
      copySelection(selection),
    );
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));
    return this.idempotency.complete({
      command,
      resultEntityType: 'SELECTION',
      resultEntityId: selection.id,
      entity: copySelection(selection),
      loadEntity: (id) => this.loadSelection(command, id),
    });
  }

  async updateSelection(
    selection: Selection,
    expectedVersion: number,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
  ): Promise<boolean> {
    const key = this.selectionKey(selection.buyerOrganisationId, selection.id);
    const current = this.selections.get(key);
    if (!current || current.version !== expectedVersion) return false;
    this.selections.set(key, copySelection(selection));
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));
    return true;
  }
}
