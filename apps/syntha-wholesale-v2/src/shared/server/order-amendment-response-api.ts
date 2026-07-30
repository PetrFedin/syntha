import { NextResponse } from 'next/server';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  OrderAmendmentResponseAlreadyExists,
  OrderAmendmentResponseDomainError,
  OrderAmendmentResponseNotFound,
  OrderAmendmentResponseSourceNotFound,
  OrderAmendmentResponseVersionConflict,
  RevisedOrderVersionNotFound,
} from '@/modules/orders';
import { CommercialApiError } from '@/shared/server/commercial-api';

function postgresCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

export function orderAmendmentResponseApiFailure(error: unknown): NextResponse {
  if (error instanceof CommercialApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (
    error instanceof OrderAmendmentResponseNotFound ||
    error instanceof OrderAmendmentResponseSourceNotFound ||
    error instanceof RevisedOrderVersionNotFound
  ) {
    return NextResponse.json(
      { error: 'order_amendment_response_resource_not_found' },
      { status: 404 },
    );
  }
  if (
    error instanceof OrderAmendmentResponseAlreadyExists ||
    error instanceof OrderAmendmentResponseVersionConflict ||
    error instanceof LifecycleIdempotencyConflict ||
    postgresCode(error) === '23505'
  ) {
    return NextResponse.json(
      {
        error: 'order_amendment_response_conflict',
        message: error instanceof Error ? error.message : undefined,
      },
      { status: 409 },
    );
  }
  if (error instanceof OrderAmendmentResponseDomainError) {
    return NextResponse.json(
      { error: 'invalid_order_amendment_response', message: error.message },
      { status: 400 },
    );
  }
  if (postgresCode(error) === '23503') {
    return NextResponse.json(
      { error: 'order_amendment_response_reference_unavailable' },
      { status: 409 },
    );
  }
  return NextResponse.json(
    { error: 'order_amendment_response_service_unavailable' },
    { status: 503 },
  );
}

export function requiredAmendmentResponsePerspective(
  value: string | null,
): 'buyer' | 'seller' {
  if (value === 'buyer' || value === 'seller') return value;
  throw new CommercialApiError(
    400,
    'invalid_perspective',
    'perspective must be buyer or seller',
  );
}

export function requiredAmendmentResponseAction(
  value: unknown,
): 'accept' | 'counter' | 'reject' {
  if (value === 'accept' || value === 'counter' || value === 'reject') return value;
  throw new CommercialApiError(
    400,
    'invalid_action',
    'action must be accept, counter or reject',
  );
}
