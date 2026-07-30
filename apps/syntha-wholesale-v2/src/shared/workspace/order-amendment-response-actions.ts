'use server';

import { randomUUID } from 'node:crypto';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  OrderAmendmentResponseAlreadyExists,
  OrderAmendmentResponseDomainError,
  OrderAmendmentResponseSourceNotFound,
  OrderAmendmentResponseVersionConflict,
  acceptOrderAmendmentUseCase,
  counterOrderAmendmentUseCase,
  getOrderAmendmentResponseRepository,
  getOrderRepository,
  getOrderReviewRepository,
  rejectOrderAmendmentUseCase,
  type ProposedOrderLineChange,
} from '@/modules/orders';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

function required(formData: FormData, field: string): string {
  const value = formData.get(field);
  if (typeof value !== 'string' || !value.trim()) {
    throw new CommercialApiError(400, 'invalid_field', `${field} is required`);
  }
  return value.trim();
}

function positiveInteger(formData: FormData, field: string): number {
  const value = Number(required(formData, field));
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be positive`);
  }
  return value;
}

function nonNegativeInteger(formData: FormData, field: string): number {
  const value = Number(required(formData, field));
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be non-negative`);
  }
  return value;
}

function basisPoints(formData: FormData, field: string): number {
  const value = nonNegativeInteger(formData, field);
  if (value > 10_000) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must not exceed 10000`);
  }
  return value;
}

function noticeFor(error: unknown): string {
  if (error instanceof LifecycleIdempotencyConflict) return 'response_idempotency_conflict';
  if (error instanceof OrderAmendmentResponseSourceNotFound) return 'response_source_not_found';
  if (error instanceof OrderAmendmentResponseAlreadyExists) return 'response_exists';
  if (error instanceof OrderAmendmentResponseVersionConflict) return 'response_version_conflict';
  if (
    error instanceof OrderAmendmentResponseDomainError ||
    error instanceof CommercialApiError
  ) {
    return 'invalid_response_input';
  }
  return 'response_service_unavailable';
}

function target(notice: string, responseId?: string): Route {
  const query = new URLSearchParams({ notice });
  if (responseId) query.set('responseId', responseId);
  return `/confirmation?${query.toString()}` as Route;
}

async function repositories() {
  const [orderRepository, reviewRepository, responseRepository] = await Promise.all([
    getOrderRepository(),
    getOrderReviewRepository(),
    getOrderAmendmentResponseRepository(),
  ]);
  return Object.freeze({ orderRepository, reviewRepository, responseRepository });
}

function refresh(): void {
  revalidatePath('/confirmation');
  revalidatePath('/orders');
}

export async function acceptOrderAmendmentAction(formData: FormData): Promise<never> {
  let notice = 'amendment_accepted';
  let responseId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const result = await acceptOrderAmendmentUseCase({
      ...(await repositories()),
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      reviewId: required(formData, 'reviewId'),
      expectedReviewVersion: positiveInteger(formData, 'expectedReviewVersion'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    responseId = result.entity.id;
    notice = result.replayed ? 'amendment_accept_replayed' : 'amendment_accepted';
    refresh();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, responseId));
}

export async function counterOrderAmendmentAction(formData: FormData): Promise<never> {
  let notice = 'amendment_countered';
  let responseId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const change: ProposedOrderLineChange = Object.freeze({
      lineId: required(formData, 'lineId') as ProposedOrderLineChange['lineId'],
      sizeQuantities: Object.freeze([
        Object.freeze({
          size: required(formData, 'size'),
          quantity: nonNegativeInteger(formData, 'quantity'),
        }),
      ]),
      unitPriceMinor: nonNegativeInteger(formData, 'unitPriceMinor'),
      discountBasisPoints: basisPoints(formData, 'discountBasisPoints'),
      taxBasisPoints: basisPoints(formData, 'taxBasisPoints'),
    });
    const result = await counterOrderAmendmentUseCase({
      ...(await repositories()),
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      reviewId: required(formData, 'reviewId'),
      expectedReviewVersion: positiveInteger(formData, 'expectedReviewVersion'),
      reason: required(formData, 'reason'),
      lineChanges: Object.freeze([change]),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    responseId = result.entity.id;
    notice = result.replayed ? 'amendment_counter_replayed' : 'amendment_countered';
    refresh();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, responseId));
}

export async function rejectOrderAmendmentAction(formData: FormData): Promise<never> {
  let notice = 'amendment_rejected';
  let responseId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const result = await rejectOrderAmendmentUseCase({
      ...(await repositories()),
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      reviewId: required(formData, 'reviewId'),
      expectedReviewVersion: positiveInteger(formData, 'expectedReviewVersion'),
      reason: required(formData, 'reason'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    responseId = result.entity.id;
    notice = result.replayed ? 'amendment_reject_replayed' : 'amendment_rejected';
    refresh();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, responseId));
}
