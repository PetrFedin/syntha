import {
  InMemoryLifecycleIdempotencyRegistry,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type {
  OrderAmendmentResponseAuditRecord,
  OrderAmendmentResponseOutboxEvent,
  OrderAmendmentResponseRepository,
} from '../application/order-amendment-response-repository';
import type {
  OrderAmendmentResponse,
  OrderAmendmentResponseId,
  RevisedOrderVersion,
  RevisedOrderVersionId,
} from '../domain/order-amendment-response';
import type { OrderReviewId } from '../domain/order-review';

function copyResponse(response: OrderAmendmentResponse): OrderAmendmentResponse {
  return Object.freeze({
    ...response,
    proposedLineChanges: Object.freeze(
      response.proposedLineChanges.map((change) =>
        Object.freeze({
          ...change,
          ...(change.sizeQuantities
            ? {
                sizeQuantities: Object.freeze(
                  change.sizeQuantities.map((entry) => Object.freeze({ ...entry })),
                ),
              }
            : {}),
        }),
      ),
    ),
  });
}

function copyRevision(revised: RevisedOrderVersion): RevisedOrderVersion {
  return Object.freeze({
    ...revised,
    lines: Object.freeze(
      revised.lines.map((line) =>
        Object.freeze({
          ...line,
          sizeQuantities: Object.freeze(
            line.sizeQuantities.map((entry) => Object.freeze({ ...entry })),
          ),
          totals: Object.freeze({ ...line.totals }),
        }),
      ),
    ),
    totals: Object.freeze({ ...revised.totals }),
  });
}

export class InMemoryOrderAmendmentResponseRepository
  implements OrderAmendmentResponseRepository
{
  private readonly responses = new Map<string, OrderAmendmentResponse>();
  private readonly revisedVersions = new Map<string, RevisedOrderVersion>();
  private readonly idempotency = new InMemoryLifecycleIdempotencyRegistry();
  readonly audits: OrderAmendmentResponseAuditRecord[] = [];
  readonly outbox: OrderAmendmentResponseOutboxEvent[] = [];

  private responseKey(buyerOrganisationId: OrganisationId, id: string): string {
    return `${buyerOrganisationId}:${id}`;
  }

  private revisedKey(buyerOrganisationId: OrganisationId, id: string): string {
    return `${buyerOrganisationId}:${id}`;
  }

  private loadResponse(command: LifecycleCreateCommand, id: string): OrderAmendmentResponse | null {
    return this.responses.get(this.responseKey(command.organisationId, id)) ?? null;
  }

  async findCreateReplay(
    command: LifecycleCreateCommand,
  ): Promise<OrderAmendmentResponse | null> {
    const response = this.idempotency.findReplay({
      command,
      expectedEntityType: 'ORDER_AMENDMENT_RESPONSE',
      loadEntity: (id) => this.loadResponse(command, id),
    });
    return response ? copyResponse(response) : null;
  }

  async findResponseForBuyer(
    buyerOrganisationId: OrganisationId,
    responseId: OrderAmendmentResponseId,
  ): Promise<OrderAmendmentResponse | null> {
    const response = this.responses.get(this.responseKey(buyerOrganisationId, responseId));
    return response ? copyResponse(response) : null;
  }

  async findResponseForSeller(
    sellerOrganisationId: OrganisationId,
    responseId: OrderAmendmentResponseId,
  ): Promise<OrderAmendmentResponse | null> {
    const response = [...this.responses.values()].find(
      (candidate) => candidate.id === responseId && candidate.sellerOrganisationId === sellerOrganisationId,
    );
    return response ? copyResponse(response) : null;
  }

  async findResponseByReviewForBuyer(
    buyerOrganisationId: OrganisationId,
    reviewId: OrderReviewId,
  ): Promise<OrderAmendmentResponse | null> {
    const response = [...this.responses.values()].find(
      (candidate) =>
        candidate.buyerOrganisationId === buyerOrganisationId &&
        candidate.orderReviewId === reviewId,
    );
    return response ? copyResponse(response) : null;
  }

  async findResponseByReviewForSeller(
    sellerOrganisationId: OrganisationId,
    reviewId: OrderReviewId,
  ): Promise<OrderAmendmentResponse | null> {
    const response = [...this.responses.values()].find(
      (candidate) =>
        candidate.sellerOrganisationId === sellerOrganisationId &&
        candidate.orderReviewId === reviewId,
    );
    return response ? copyResponse(response) : null;
  }

  async createResponse(
    response: OrderAmendmentResponse,
    revised: RevisedOrderVersion | null,
    audit: OrderAmendmentResponseAuditRecord,
    event: OrderAmendmentResponseOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<OrderAmendmentResponse>> {
    const replay = await this.findCreateReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    const existing = await this.findResponseByReviewForBuyer(
      response.buyerOrganisationId,
      response.orderReviewId,
    );
    if (existing) throw new Error('ORDER_AMENDMENT_RESPONSE_ALREADY_EXISTS');

    const storedResponse = copyResponse(response);
    this.responses.set(
      this.responseKey(response.buyerOrganisationId, response.id),
      storedResponse,
    );
    if (revised) {
      this.revisedVersions.set(
        this.revisedKey(revised.buyerOrganisationId, revised.id),
        copyRevision(revised),
      );
    }
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(
      Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }),
    );
    return this.idempotency.complete({
      command,
      resultEntityType: 'ORDER_AMENDMENT_RESPONSE',
      resultEntityId: response.id,
      entity: storedResponse,
      loadEntity: (id) => this.loadResponse(command, id),
    });
  }

  async findRevisedForBuyer(
    buyerOrganisationId: OrganisationId,
    versionId: RevisedOrderVersionId,
  ): Promise<RevisedOrderVersion | null> {
    const revised = this.revisedVersions.get(this.revisedKey(buyerOrganisationId, versionId));
    return revised ? copyRevision(revised) : null;
  }

  async findRevisedForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: RevisedOrderVersionId,
  ): Promise<RevisedOrderVersion | null> {
    const revised = [...this.revisedVersions.values()].find(
      (candidate) => candidate.id === versionId && candidate.sellerOrganisationId === sellerOrganisationId,
    );
    return revised ? copyRevision(revised) : null;
  }

  async listResponsesForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly OrderAmendmentResponse[]> {
    return Object.freeze(
      [...this.responses.values()]
        .filter((response) => response.buyerOrganisationId === buyerOrganisationId)
        .sort((left, right) => right.respondedAt.localeCompare(left.respondedAt))
        .map(copyResponse),
    );
  }

  async listResponsesForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly OrderAmendmentResponse[]> {
    return Object.freeze(
      [...this.responses.values()]
        .filter((response) => response.sellerOrganisationId === sellerOrganisationId)
        .sort((left, right) => right.respondedAt.localeCompare(left.respondedAt))
        .map(copyResponse),
    );
  }

  async listRevisedForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderVersion[]> {
    return Object.freeze(
      [...this.revisedVersions.values()]
        .filter((revised) => revised.buyerOrganisationId === buyerOrganisationId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map(copyRevision),
    );
  }

  async listRevisedForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderVersion[]> {
    return Object.freeze(
      [...this.revisedVersions.values()]
        .filter((revised) => revised.sellerOrganisationId === sellerOrganisationId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map(copyRevision),
    );
  }
}
