import { NextResponse } from 'next/server';

import {
  getSelectionRepository,
  listBuyerShowroomAccess,
} from '@/modules/selection';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import { selectionApiFailure } from '@/shared/server/selection-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const repository = await getSelectionRepository();
    const grants = await listBuyerShowroomAccess({
      repository,
      buyerOrganisationId: access.organisationId,
    });
    return NextResponse.json(
      { grants },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return selectionApiFailure(error);
  }
}
