'use server';

import { randomUUID } from 'node:crypto';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  OrderAlreadyExists,
  OrderDomainError,
  OrderNotFound,
  OrderSelectionAccessRevoked,
  OrderSelectionNotReady,
  OrderVersionConflict,
  createOrderDraftUseCase,
  getOrderRepository,
  setOrderLineCommercialTermsUseCase,
  setOrderLineQuantityUseCase,
  submitOrderUseCase,
} from '@/modules/orders/index-next';
import { SelectionNotFound, getSelectionRepository } from '@/modules/selection';
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
  const value = Number(required(formData, field));
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new CommercialApiError(
      400,
      'invalid_field',
      `${field} must be an integer from 0 through 10000`,
    );
  }
  return value;
}

function noticeFor(error: unknown): string {
  if (error instanceof LifecycleIdempotencyConflict) return 'order_idempotency_conflict';
  if (error instanceof SelectionNotFound) return 'order_selection_not_found';
  if (error instanceof OrderSelectionNotReady) return 'order_selection_not_ready';
  if (error instanceof OrderSelectionAccessRevoked) return 'order_access_revoked';
  if (error instanceof OrderAlreadyExists) return 'order_exists';
  if (error instanceof OrderNotFound) return 'order_not_found';
  if (error instanceof OrderVersionConflict) return 'order_version_conflict';
  if (error instanceof OrderDomainError || error instanceof CommercialApiError) {
    return 'invalid_order_input';
  }
  return 'order_service_unavailable';
}

function target(path: '/order-builder' | '/orders', notice: string, orderId?: string): Route {
  const query = new URLSearchParams({ notice });
  if (orderId) query.set('orderId', orderId);
  return `${path}?${query.toString()}` as Route;
}

function revalidateOrders(): void {
  revalidatePath('/order-builder');
  revalidatePath('/orders');
}

export async function createOrderDraftAction(formData: FormData): Promise<never> {
  let notice = 'order_draft_created';
  let createdOrderId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const [repository, selectionRepository] = await Promise.all([
      getOrderRepository(),
      getSelectionRepository(),
    ]);
    const result = await createOrderDraftUseCase({
      repository,
      selectionRepository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      selectionId: required(formData, 'selectionId'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    createdOrderId = result.entity.id;
    notice = result.replayed ? 'order_draft_replayed' : 'order_draft_created';
    revalidateOrders();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target('/order-builder', notice, createdOrderId));
}

export async function setOrderLineTermsAction(formData: FormData): Promise<never> {
  const currentOrderId = required(formData, 'orderId');
  let notice = 'order_terms_updated';
  try {
    const access = await requireWorkspaceAccess('operate');
    const [repository, selectionRepository] = await Promise.all([
      getOrderRepository(),
      getSelectionRepository(),
    ]);
    await setOrderLineCommercialTermsUseCase({
      repository,
      selectionRepository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      orderId: currentOrderId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      lineId: required(formData, 'lineId'),
      unitPriceMinor: nonNegativeInteger(formData, 'unitPriceMinor'),
      discountBasisPoints: basisPoints(formData, 'discountBasisPoints'),
      taxBasisPoints: basisPoints(formData, 'taxBasisPoints'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidateOrders();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target('/order-builder', notice, currentOrderId));
}

export async function setOrderLineQuantityAction(formData: FormData): Promise<never> {
  const currentOrderId = required(formData, 'orderId');
  let notice = 'order_quantity_updated';
  try {
    const access = await requireWorkspaceAccess('operate');
    const [repository, selectionRepository] = await Promise.all([
      getOrderRepository(),
      getSelectionRepository(),
    ]);
    await setOrderLineQuantityUseCase({
      repository,
      selectionRepository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      orderId: currentOrderId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      lineId: required(formData, 'lineId'),
      size: required(formData, 'size'),
      quantity: nonNegativeInteger(formData, 'quantity'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidateOrders();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target('/order-builder', notice, currentOrderId));
}

export async function submitOrderAction(formData: FormData): Promise<never> {
  const currentOrderId = required(formData, 'orderId');
  let notice = 'order_submitted';
  try {
    const access = await requireWorkspaceAccess('operate');
    const [repository, selectionRepository] = await Promise.all([
      getOrderRepository(),
      getSelectionRepository(),
    ]);
    const result = await submitOrderUseCase({
      repository,
      selectionRepository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      orderId: currentOrderId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    notice = result.replayed ? 'order_submit_replayed' : 'order_submitted';
    revalidateOrders();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target('/orders', notice));
}
