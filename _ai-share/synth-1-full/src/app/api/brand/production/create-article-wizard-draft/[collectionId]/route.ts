import { NextRequest, NextResponse } from 'next/server';

import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import type { CreateArticleWizardDraftV1 } from '@/lib/production/create-article-wizard-draft.types';
import { parseCreateArticleWizardDraftV1 } from '@/lib/production/create-article-wizard-draft.types';
import {
  brandCreateArticleWizardDraftStorageMode,
  clearBrandCreateArticleWizardDraftServer,
  getBrandCreateArticleWizardDraftServer,
  patchBrandCreateArticleWizardDraftServer,
  putBrandCreateArticleWizardDraftServer,
} from '@/lib/server/brand-create-article-wizard-draft-repository';

function parseCollectionId(raw: string): string | null {
  const collectionId = raw.trim();
  return collectionId ? collectionId : null;
}

/** GET — черновик мастера «Создать артикул». */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  const { collectionId: rawId } = await params;
  const collectionId = parseCollectionId(rawId);
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'collectionId обязателен.' }, { status: 400 });
  }

  const { draft, storageMode } = await getBrandCreateArticleWizardDraftServer({ collectionId });
  return NextResponse.json({
    ok: true,
    collectionId,
    draft,
    storageMode: toBffPgStorageMode(storageMode),
    messageRu: draft ? 'Черновик мастера загружен.' : 'Черновик пуст.',
  });
}

/** POST — полный upsert черновика. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  const { collectionId: rawId } = await params;
  const collectionId = parseCollectionId(rawId);
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'collectionId обязателен.' }, { status: 400 });
  }

  let body: { draft?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const draft = parseCreateArticleWizardDraftV1(body.draft);
  if (!draft) {
    return NextResponse.json(
      { ok: false, messageRu: 'draft v1 обязателен (mode, sku, …).' },
      { status: 400 }
    );
  }

  const result = await putBrandCreateArticleWizardDraftServer({ collectionId, draft });
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        storageMode: toBffPgStorageMode(result.storageMode),
        messageRu: 'PG недоступен.',
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    collectionId,
    draft,
    storageMode: toBffPgStorageMode(result.storageMode ?? brandCreateArticleWizardDraftStorageMode()),
    messageRu: 'Черновик мастера сохранён.',
  });
}

/** PATCH — частичное обновление или clear: true. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  const { collectionId: rawId } = await params;
  const collectionId = parseCollectionId(rawId);
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'collectionId обязателен.' }, { status: 400 });
  }

  let body: { clear?: boolean; patch?: Partial<CreateArticleWizardDraftV1> } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  if (body.clear) {
    const result = await clearBrandCreateArticleWizardDraftServer({ collectionId });
    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          storageMode: toBffPgStorageMode(result.storageMode),
          messageRu: 'PG недоступен.',
        },
        { status: 503 }
      );
    }
    return NextResponse.json({
      ok: true,
      collectionId,
      draft: null,
      storageMode: toBffPgStorageMode(result.storageMode ?? brandCreateArticleWizardDraftStorageMode()),
      messageRu: 'Черновик мастера удалён.',
    });
  }

  const result = await patchBrandCreateArticleWizardDraftServer({
    collectionId,
    patch: body.patch,
  });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, messageRu: 'Нет черновика для patch или patch пуст.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    collectionId,
    draft: result.draft,
    storageMode: toBffPgStorageMode(result.storageMode ?? brandCreateArticleWizardDraftStorageMode()),
    messageRu: 'Черновик мастера обновлён.',
  });
}
