import {
  InMemoryLifecycleIdempotencyRegistry,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type {
  OrderReviewAuditRecord,
  OrderReviewOutboxEvent,
  OrderReviewRepository,
} from '../application/order-review-repository';
import type {
  ConfirmedOrderVersion,
  ConfirmedOrderVersionId,
  OrderReview,
  OrderReviewId,
} from '../domain/order-review';
import type { OrderLine, SubmittedOrderSnapshotId } from '../domain/order';

function copyLine(line: OrderLine): OrderLine {
  return Object.freeze({
    ...line,
    sizeQuantities: Object.freeze(
      line.sizeQuantities.map((entry) => Object.freeze({ ...entry })),
    ),
    totals: Object.freeze({ ...line.totals }),
  });
}

function copyReview(review: OrderReview): OrderReview {
  return Object.freeze({
    ...review,
    ...(review.approval
      ? { approval: Object.freeze({ ...review.approval }) }
      : {}),
    ...(review.amendmentRequest
      ? {
          amendmentRequest: Object.freeze({
            ...review.amendmentRequest,
            lineChanges: Object.freeze(
              review.amendmentRequest.lineChanges.map((change) =>
                Object.freeze({
                  ...change,
                  ...(change.sizeQuantities
                    ? {
                        sizeQuantities: Object.freeze(
                          change.sizeQuantities.map((entry) =>
                            Object.freeze({ ...entry }),
                          ),
                        ),
                      }
                    : {}),
                }),
              ),
            ),
          }),
        }
      : {}),
  });
}

function copyConfirmed(version: ConfirmedOrderVersion): ConfirmedOrderVersion {
  return Object.freeze({
    ...version,
    lines: Object.freeze(version.lines.map(copyLine)),
    totals: Object.freeze({ ...version.totals }),
  });
}

export class InMemoryOrderReviewRepository implements OrderReviewRepository {
  private readonly reviews = new Map<string, OrderReview>();
  private readonly confirmed = new Map<string, ConfirmedOrderVersion>();
  private readonly idempotency = new InMemoryLifecycleIdempotencyRegistry();
  readonly audits: OrderReviewAuditRecord[] = [];
  readonly outbox: OrderReviewOutboxEvent[] = [];

  private reviewKey(sellerOrganisationId: OrganisationId, id: string): string {
    return `${sellerOrganisationId}:${id}`;
  }

  private confirmedKey(sellerOrganisationId: OrganisationId, id: string): string {
    return `${sellerOrganisationId}:${id}`;
  }

  private loadReview(command: LifecycleCreateCommand, id: string): OrderReview | null {
    const review = this.reviews.get(this.reviewKey(command.organisationId, id));
    return review ? copyReview(review) : null;
  }

  private loadConfirmed(
    command: LifecycleCreateCommand,
    id: string,
  ): ConfirmedOrderVersion | null {
    const version = this.confirmed.get(this.confirmedKey(command.organisationId, id));
    return version ? copyConfirmed(version) : null;
  }

  async findReviewForSeller(
    sellerOrganisationId: OrganisationId,
    id: OrderReviewId,
  ): Promise<OrderReview | null> {
    const review = this.reviews.get(this.reviewKey(sellerOrganisationId, id));
    return review ? copyReview(review) : null;
  }

  async findReviewBySnapshotForSeller(
    sellerOrganisationId: OrganisationId,
    snapshotId: SubmittedOrderSnapshotId,
  ): Promise<OrderReview | null> {
    const review = [...this.reviews.values()].find(
      (candidate) =>
        candidate.sellerOrganisationId === sellerOrganisationId &&
        candidate.submittedOrderSnapshotId === snapshotId,
    );
    return review ? copyReview(review) : null;
  }

  async findReviewForBuyer(
    buyerOrganisationId: OrganisationId,
    id: OrderReviewId,
  ): Promise<OrderReview | null> {
    const review = [...this.reviews.values()].find(
      (candidate) =>
        candidate.buyerOrganisationId === buyerOrganisationId && candidate.id === id,
    );
    return review ? copyReview(review) : null;
  }

  async listReviewsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly OrderReview[]> {
    return [...this.reviews.values()]
      .filter((review) => review.sellerOrganisationId === sellerOrganisationId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(copyReview);
  }

  async listReviewsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly OrderReview[]> {
    return [...this.reviews.values()]
      .filter((review) => review.buyerOrganisationId === buyerOrganisationId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(copyReview);
  }

  async findDecisionReplay(command: LifecycleCreateCommand): Promise<OrderReview | null> {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'ORDER_REVIEW',
      loadEntity: (id) => this.loadReview(command, id),
    });
  }

  async createDecision(
    review: OrderReview,
    audit: OrderReviewAuditRecord,
    event: OrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<OrderReview>> {
    const replay = await this.findDecisionReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    const stored = copyReview(review);
    this.reviews.set(this.reviewKey(review.sellerOrganisationId, review.id), stored);
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(
      Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }),
    );
    await this.idempotency.complete({
      command,
      resultEntityType: 'ORDER_REVIEW',
      resultEntityId: review.id,
      entity: stored,
      loadEntity: (id) => this.loadReview(command, id),
    });
    return Object.freeze({ entity: copyReview(stored), replayed: false });
  }

  async findConfirmationReplay(
    command: LifecycleCreateCommand,
  ): Promise<ConfirmedOrderVersion | null> {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'CONFIRMED_ORDER_VERSION',
      loadEntity: (id) => this.loadConfirmed(command, id),
    });
  }

  async confirm(
    review: OrderReview,
    confirmed: ConfirmedOrderVersion,
    expectedVersion: number,
    audit: OrderReviewAuditRecord,
    event: OrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<ConfirmedOrderVersion>> {
    const replay = await this.findConfirmationReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    const reviewKey = this.reviewKey(review.sellerOrganisationId, review.id);
    const current = this.reviews.get(reviewKey);
    if (!current || current.version !== expectedVersion) {
      return Promise.reject(new Error('ORDER_REVIEW_VERSION_CONFLICT'));
    }
    const storedReview = copyReview(review);
    const storedConfirmed = copyConfirmed(confirmed);
    this.reviews.set(reviewKey, storedReview);
    this.confirmed.set(
      this.confirmedKey(confirmed.sellerOrganisationId, confirmed.id),
      storedConfirmed,
    );
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(
      Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }),
    );
    await this.idempotency.complete({
      command,
      resultEntityType: 'CONFIRMED_ORDER_VERSION',
      resultEntityId: confirmed.id,
      entity: storedConfirmed,
      loadEntity: (id) => this.loadConfirmed(command, id),
    });
    return Object.freeze({ entity: copyConfirmed(storedConfirmed), replayed: false });
  }

  async findConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
    id: ConfirmedOrderVersionId,
  ): Promise<ConfirmedOrderVersion | null> {
    const version = this.confirmed.get(this.confirmedKey(sellerOrganisationId, id));
    return version ? copyConfirmed(version) : null;
  }

  async findConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
    id: ConfirmedOrderVersionId,
  ): Promise<ConfirmedOrderVersion | null> {
    const version = [...this.confirmed.values()].find(
      (candidate) =>
        candidate.buyerOrganisationId === buyerOrganisationId && candidate.id === id,
    );
    return version ? copyConfirmed(version) : null;
  }

  async listConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly ConfirmedOrderVersion[]> {
    return [...this.confirmed.values()]
      .filter((version) => version.sellerOrganisationId === sellerOrganisationId)
      .sort((left, right) => right.confirmedAt.localeCompare(left.confirmedAt))
      .map(copyConfirmed);
  }

  async listConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly ConfirmedOrderVersion[]> {
    return [...this.confirmed.values()]
      .filter((version) => version.buyerOrganisationId === buyerOrganisationId)
      .sort((left, right) => right.confirmedAt.localeCompare(left.confirmedAt))
      .map(copyConfirmed);
  }
}
