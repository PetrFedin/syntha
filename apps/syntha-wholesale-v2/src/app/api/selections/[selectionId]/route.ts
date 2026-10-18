import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  addSelectionItemUseCase,
  archiveSelectionUseCase,
  getSelection,
  getSelectionRepository,
  markSelectionReadyUseCase,
  setSelectionBudgetUseCase,
  setSelectionSizeCurveUseCase,
} from '@/modules/selection';
import {
  optionalString,
  requireCommercialApiAccess,
  requireJsonObject,
  requiredPositiveInteger,
  requiredString,
} from '@/shared/server/commercial-api';
import {
  optionalNonNegativeInteger,
  requiredNonNegativeInteger,
  requiredSizeCurve,
  selectionApiFailure,
} from '@/shared/server/selection-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly selectionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const { selectionId } = await context.params;
    const repository = await getSelectionRepository();
    const selection = await getSelection({
      repository,
      buyerOrganisationId: access.organisationId,
      selectionId,
    });
    return NextResponse.json(selection, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return selectionApiFailure(error);
  }
}

export async function PATCH(
  request: Request,
  context: { readonly params: Promise<{ readonly selectionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const { selectionId } = await context.params;
    const body = await requireJsonObject(request);
    const action = requiredString(body.action, 'action');
    const expectedVersion = requiredPositiveInteger(body.expectedVersion, 'expectedVersion');
    const repository = await getSelectionRepository();
    const common = {
      repository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      selectionId,
      expectedVersion,
      actorCredentialId: access.actorCredentialId,
    } as const;

    let selection;
    if (action === 'set_budget') {
      selection = await setSelectionBudgetUseCase({
        ...common,
        budgetMinor: requiredNonNegativeInteger(body.budgetMinor, 'budgetMinor'),
        currency: optionalString(body.currency, 'currency'),
      });
    } else if (action === 'add_item') {
      selection = await addSelectionItemUseCase({
        ...common,
        productReference: requiredString(body.productReference, 'productReference'),
        variantReference: optionalString(body.variantReference, 'variantReference'),
        quantityIntent: optionalNonNegativeInteger(body.quantityIntent, 'quantityIntent'),
        note: optionalString(body.note, 'note'),
      });
    } else if (action === 'set_size_curve') {
      selection = await setSelectionSizeCurveUseCase({
        ...common,
        itemId: requiredString(body.itemId, 'itemId'),
        sizeCurve: requiredSizeCurve(body.sizeCurve),
        note: optionalString(body.note, 'note'),
      });
    } else if (action === 'mark_ready') {
      selection = await markSelectionReadyUseCase(common);
    } else if (action === 'archive') {
      selection = await archiveSelectionUseCase(common);
    } else {
      return NextResponse.json({ error: 'unsupported_selection_action' }, { status: 400 });
    }

    return NextResponse.json(selection, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return selectionApiFailure(error);
  }
}
