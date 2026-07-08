import { NextRequest, NextResponse } from 'next/server';

import { loadShopMatrixArticleInspectorView } from '@/lib/server/shop-matrix-article-inspector';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** GET /api/shop/b2b/matrix/article-inspector?collectionId=&articleId= — read-only production attrs для shop matrix. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  const articleId = req.nextUrl.searchParams.get('articleId')?.trim() ?? '';

  const result = await loadShopMatrixArticleInspectorView({ collectionId, articleId });
  if (!result.ok) {
    const status = 'code' in result && result.code === 'factory_pack_gate_blocked' ? 403 : 404;
    return NextResponse.json(
      {
        ok: false,
        messageRu: result.messageRu,
        ...('code' in result && result.code ? { code: result.code } : {}),
        ...('releaseGate' in result && result.releaseGate
          ? { releaseGate: result.releaseGate }
          : {}),
      },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    view: result.view,
    messageRu: `Inspector · ${result.view.name} (${result.view.articleId}).`,
  });
}
