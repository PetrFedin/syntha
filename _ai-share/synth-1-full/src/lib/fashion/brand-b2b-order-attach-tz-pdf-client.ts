import {
  brandB2bOrderAttachTzPdfApiPath,
  type BrandOpAttachTzPdfResult,
} from '@/lib/fashion/brand-op-attach-tz-pdf';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

/** Client POST · attach TZ PDF metadata to production PO (Wave UN / UY). */
export async function postBrandB2bOrderAttachTzPdf(input: {
  orderId: string;
  collectionId: string;
  articleId: string;
  productionOrderId?: string;
}): Promise<BrandOpAttachTzPdfResult> {
  const res = await fetch(brandB2bOrderAttachTzPdfApiPath(input.orderId), {
    method: 'POST',
    headers: {
      ...buildWorkshop2ApiRequestHeaders(),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      collectionId: input.collectionId,
      articleId: input.articleId,
      productionOrderId: input.productionOrderId,
    }),
    cache: 'no-store',
  });

  const json = (await res.json()) as BrandOpAttachTzPdfResult & { messageRu?: string };
  if (!res.ok) {
    return {
      ok: false,
      orderId: input.orderId,
      messageRu: json.messageRu ?? 'Не удалось прикрепить ТЗ PDF.',
    };
  }
  return json;
}
