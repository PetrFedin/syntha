import { NextResponse } from 'next/server';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  RevisedConfirmedOrderVersionNotFound,
  RevisedOrderReviewAlreadyExists,
  RevisedOrderReviewDomainError,
  RevisedOrderReviewNotFound,
  RevisedOrderReviewSourceNotFound,
  RevisedOrderReviewVersionConflict,
} from '@/modules/orders';
import { CommercialApiError } from '@/shared/server/commercial-api';

function postgresCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

export function revisedOrderReviewApiFailure(error: unknown): NextResponse {
  if (error instanceof CommercialApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (
    error instanceof RevisedOrderReviewNotFound ||
    error instanceof RevisedOrderReviewSourceNotFound ||
    error instanceof RevisedConfirmedOrderVersionNotFound
  ) {
    return NextResponse.json(
      { error: 'revised_order_review_resource_not_found' },
      { status: 404 },
    );
  }
  if (
    error instanceof RevisedOrderReviewAlreadyExists ||
    error instanceof RevisedOrderReviewVersionConflict ||
    error instanceof LifecycleIdempotencyConflict ||
    postgresCode(error) === '23505'
  ) {
    return NextResponse.json(
      {
        error: 'revised_order_review_conflict',
        message: error instanceof Error ? error.message : undefined,
      },
      { status: 409 },
    );
  }
  if (error instanceof RevisedOrderReviewDomainError) {
    return NextResponse.json(
      { error: 'invalid_revised_order_review', message: error.message },
      { status: 400 },
    );
  }
  if (postgresCode(error) === '23503') {
    return NextResponse.json(
      { error: 'revised_order_review_reference_unavailable' },
      { status: 409 },
    );
  }
  return NextResponse.json(
    { error: 'revised_order_review_service_unavailable' },
    { status: 503 },
  );
}

export function requiredRevisedOrderReviewPerspective(
  value: string | null,
): 'buyer' | 'seller' {
  if (value === 'buyer' || value === 'seller') return value;
  throw new CommercialApiError(
    400,
    'invalid_perspective',
    'perspective must be buyer or seller',
  );
}

export function requiredRevisedOrderReviewAction(
  value: unknown,
): 'approve' | 'request_amendment' {
  if (value === 'approve' || value === 'request_amendment') return value;
  throw new CommercialApiError(
    400,
    'invalid_action',
    'action must be approve or request_amendment',
  );
}
