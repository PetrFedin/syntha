import { NextRequest, NextResponse } from 'next/server';

import { attachManufacturerSamplePhotoDamStub } from '@/lib/server/workshop2-manufacturer-sample-photo-dam-stub';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type Body = {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  factoryId?: string;
  filename?: string;
};

/** POST — DAM stub attach sample photo (Wave VL · mfr dev). */
export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const result = await attachManufacturerSamplePhotoDamStub(
    {
      collectionId: body.collectionId ?? '',
      articleId: body.articleId ?? '',
      orderId: body.orderId,
      factoryId: body.factoryId,
      filename: body.filename,
    },
    { assetUrlBase: '/api/workshop2/manufacturer/samples/attach-photo' }
  );

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
