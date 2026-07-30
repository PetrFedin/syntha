import {
  InMemoryLifecycleIdempotencyRegistry,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type {
  RevisedOrderReviewAuditRecord,
  RevisedOrderReviewOutboxEvent,
  RevisedOrderReviewRepository,
} from '../application/revised-order-review-repository';
import type { RevisedOrderVersionId } from '../domain/order-amendment-response';
import type {
  RevisedConfirmedOrderVersion,
  RevisedConfirmedOrderVersionId,
  RevisedOrderReview,
  RevisedOrderReviewId,
} from '../domain/revised-order-review';

function copyReview(review: RevisedOrderReview): RevisedOrderReview {
  return Object.freeze({
    ...review,
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
    ...(review.approval ? { approval: Object.freeze({ ...review.approval }) } : {}),
  });
}

function copyConfirmed(
  confirmed: RevisedConfirmedOrderVersion,
): RevisedConfirmedOrderVersion {
  return Object.freeze({
    ...confirmed,
    lines: Object.freeze(
      confirmed.lines.map((line) =>
        Object.freeze({
          ...line,
          sizeQuantities: Object.freeze(
            line.sizeQuantities.map((entry) => Object.freeze({ ...entry })),
          ),
          totals: Object.freeze({ ...line.totals }),
        }),
      ),
    ),
    totals: Object.freeze({ ...confirmed.totals }),
  });
}

export class InMemoryRevisedOrderReviewRepository
  implements RevisedOrderReviewRepository
{
  private readonly reviews = new Map<string, RevisedOrderReview>();
  private readonly confirmed = new Map<string, RevisedConfirmedOrderVersion>();
  private readonly idempotency = new InMemoryLifecycleIdempotencyRegistry();
  readonly audits: RevisedOrderReviewAuditRecord[] = [];
  readonly outbox: RevisedOrderReviewOutboxEvent[] = [];

  private reviewKey(sellerOrganisationId: OrganisationId, id: string): string {
    return `${sellerOrganisationId}:${id}`;
  }

  private confirmedKey(sellerOrganisationId: OrganisationId, id: string): string {
    return `${sellerOrganisationId}:${id}`;
  }

  private loadReview(
    command: LifecycleCreateCommand,
    id: string,
  ): RevisedOrderReview | null {
    return this.reviews.get(this.reviewKey(command.organisationId, id)) ?? null;
  }

  private loadConfirmed(
    command: LifecycleCreateCommand,
    id: string,
  ): RevisedConfirmedOrderVersion | null {
    return this.confirmed.get(this.confirmedKey(command.organisationId, id)) ?? null;
  }

  async findReviewForSeller(
    sellerOrganisationId: OrganisationId,
    reviewId: RevisedOrderReviewId,
  ): Promise<RevisedOrderReview | null> {
    const review = this.reviews.get(this.reviewKey(sellerOrganisationId, reviewId));
    return review ? copyReview(review) : null;
  }

  async findReviewByVersionForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: RevisedOrderVersionId,
  ): Promise<RevisedOrderReview | null> {
    const review = [...this.reviews.values()].find(
      (candidate) =>
        candidate.sellerOrganisationId === sellerOrganisationId &&
        candidate.revisedOrderVersionId === versionId,
    );
    return review ? copyReview(review) : null;
  }

  async findReviewForBuyer(
    buyerOrganisationId: OrganisationId,
    reviewId: RevisedOrderReviewId,
  ): Promise<RevisedOrderReview | null> {
    const review = [...this.reviews.values()].find(
      (candidate) =>
        candidate.buyerOrganisationId === buyerOrganisationId &&
        candidate.id === reviewId,
    );
    return review ? copyReview(review) : null;
  }

  async listReviewsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderReview[]> {
    return Object.freeze(
      [...this.reviews.values()]
        .filter((review) => review.sellerOrganisationId === sellerOrganisationId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .map(copyReview),
    );
  }

  async listReviewsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderReview[]> {
    return Object.freeze(
      [...this.reviews.values()]
        .filter((review) => review.buyerOrganisationId === buyerOrganisationId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .map(copyReview),
    );
  }

  async findDecisionReplay(
    command: LifecycleCreateCommand,
  ): Promise<RevisedOrderReview | null> {
    const review = this.idempotency.findReplay({
      command,
      expectedEntityType: 'REVISED_ORDER_REVIEW',
      loadEntity: (id) => this.loadReview(command, id),
    });
    return review ? copyReview(review) : null;
  }

  async createDecision(
    review: RevisedOrderReview,
    audit: RevisedOrderReviewAuditRecord,
    event: RevisedOrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<RevisedOrderReview>> {
    const replay = await this.findDecisionReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    const existing = await this.findReviewByVersionForSeller(
      review.sellerOrganisationId,
      review.revisedOrderVersionId,
    );
    if (existing) throw new Error('REVISED_ORDER_REVIEW_ALREADY_EXISTS');
    const stored = copyReview(review);
    this.reviews.set(this.reviewKey(review.sellerOrganisationId, review.id), stored);
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(
      Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }),
    );
    return this.idempotency.complete({
      command,
      resultEntityType: 'REVISED_ORDER_REVIEW',
      resultEntityId: review.id,
      entity: stored,
      loadEntity: (id) => this.loadReview(command, id),
    });
  }

  async findConfirmationReplay(
    command: LifecycleCreateCommand,
  ): Promise<RevisedConfirmedOrderVersion | null> {
    const confirmed = this.idempotency.findReplay({
      command,
      expectedEntityType: 'REVISED_CONFIRMED_ORDER_VERSION',
      loadEntity: (id) => this.loadConfirmed(command, id),
    });
    return confirmed ? copyConfirmed(confirmed) : null;
  }

  async confirm(
    review: RevisedOrderReview,
    confirmed: RevisedConfirmedOrderVersion,
    expectedVersion: number,
    audit: RevisedOrderReviewAuditRecord,
    event: RevisedOrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<RevisedConfirmedOrderVersion>> {
    const replay = await this.findConfirmationReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    const key = this.reviewKey(review.sellerOrganisationId, review.id);
    const current = this.reviews.get(key);
    if (!current || current.version !== expectedVersion) {
      throw new Error('REVISED_ORDER_REVIEW_VERSION_CONFLICT');
    }
    const storedReview = copyReview(review);
    const storedConfirmed = copyConfirmed(confirmed);
    this.reviews.set(key, storedReview);
    this.confirmed.set(
      this.confirmedKey(confirmed.sellerOrganisationId, confirmed.id),
      storedConfirmed,
    );
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(
      Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }),
    );
    return this.idempotency.complete({
      command,
      resultEntityType: 'REVISED_CONFIRMED_ORDER_VERSION',
      resultEntityId: confirmed.id,
      entity: storedConfirmed,
      loadEntity: (id) => this.loadConfirmed(command, id),
    });
  }

  async findConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: RevisedConfirmedOrderVersionId,
  ): Promise<RevisedConfirmedOrderVersion | null> {
    const confirmed = this.confirmed.get(
      this.confirmedKey(sellerOrganisationId, versionId),
    );
    return confirmed ? copyConfirmed(confirmed) : null;
  }

  async findConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
    versionId: RevisedConfirmedOrderVersionId,
  ): Promise<RevisedConfirmedOrderVersion | null> {
    const confirmed = [...this.confirmed.values()].find(
      (candidate) =>
        candidate.buyerOrganisationId === buyerOrganisationId &&
        candidate.id === versionId,
    );
    return confirmed ? copyConfirmed(confirmed) : null;
  }

  async listConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedConfirmedOrderVersion[]> {
    return Object.freeze(
      [...this.confirmed.values()]
        .filter((confirmed) => confirmed.sellerOrganisationId === sellerOrganisationId)
        .sort((left, right) => right.confirmedAt.localeCompare(left.confirmedAt))
        .map(copyConfirmed),
    );
  }

  async listConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedConfirmedOrderVersion[]> {
    return Object.freeze(
      [...this.confirmed.values()]
        .filter((confirmed) => confirmed.buyerOrganisationId === buyerOrganisationId)
        .sort((left, right) => right.confirmedAt.localeCompare(left.confirmedAt))
        .map(copyConfirmed),
    );
  }
}
