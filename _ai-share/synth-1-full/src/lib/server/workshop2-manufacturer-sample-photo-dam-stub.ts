import 'server-only';

import { randomUUID } from 'node:crypto';

export type ManufacturerSamplePhotoDamStubResult = {
  ok: boolean;
  assetId: string;
  url: string;
  messageRu: string;
};

/** Wave UL/VL · stub POST sample photo into DAM (PG journal when enabled). */
export async function attachManufacturerSamplePhotoDamStub(
  input: {
    collectionId: string;
    articleId: string;
    orderId?: string;
    factoryId?: string;
    filename?: string;
  },
  options?: { assetUrlBase?: string }
): Promise<ManufacturerSamplePhotoDamStubResult> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  if (!collectionId || !articleId) {
    return {
      ok: false,
      assetId: '',
      url: '',
      messageRu: 'collectionId и articleId обязательны.',
    };
  }

  const assetId = `dam-sample-${randomUUID().slice(0, 10)}`;
  const filename = input.filename?.trim() || 'sample-photo-front.jpg';
  const urlBase =
    options?.assetUrlBase?.trim() ||
    '/api/workshop2/manufacturer/sample-photo/dam-stub';
  const url = `${urlBase}/${encodeURIComponent(assetId)}?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}&file=${encodeURIComponent(filename)}`;

  return {
    ok: true,
    assetId,
    url,
    messageRu: `Фото образца сохранено (DAM stub) · ${filename}.`,
  };
}
