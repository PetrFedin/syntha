import { NextRequest, NextResponse } from 'next/server';

import type { FloorTabScope } from '@/lib/production-data/port';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import {
  brandFloorTabDraftStorageMode,
  getBrandFloorTabDraftServer,
  putBrandFloorTabDraftServer,
} from '@/lib/server/brand-floor-tab-draft-repository';

const VALID_SCOPES = new Set<FloorTabScope>([
  'gold-sample',
  'qc-app',
  'gantt',
  'nesting',
  'fit-comments',
  'daily-output',
  'worker-skills',
  'milestones-video',
  'subcontractor',
]);

function parseScope(raw: string): FloorTabScope | null {
  const scope = raw.trim() as FloorTabScope;
  return VALID_SCOPES.has(scope) ? scope : null;
}

/** GET — floor-tab draft (subcontractor, qc-app, …). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ scope: string }> }
) {
  const { scope: rawScope } = await params;
  const scope = parseScope(rawScope);
  if (!scope) {
    return NextResponse.json({ ok: false, messageRu: 'Неизвестный scope.' }, { status: 400 });
  }

  const { draft, storageMode } = await getBrandFloorTabDraftServer({ scope });
  return NextResponse.json({
    ok: true,
    scope,
    draft,
    storageMode: toBffPgStorageMode(storageMode),
    messageRu: draft ? 'Черновик вкладки цеха загружен.' : 'Черновик пуст — seed по умолчанию.',
  });
}

/** PUT — persist floor-tab draft. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ scope: string }> }
) {
  const { scope: rawScope } = await params;
  const scope = parseScope(rawScope);
  if (!scope) {
    return NextResponse.json({ ok: false, messageRu: 'Неизвестный scope.' }, { status: 400 });
  }

  let body: { draft?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  if (body.draft === undefined) {
    return NextResponse.json({ ok: false, messageRu: 'draft обязателен.' }, { status: 400 });
  }

  const result = await putBrandFloorTabDraftServer({ scope, draft: body.draft });
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
    scope,
    storageMode: toBffPgStorageMode(result.storageMode ?? brandFloorTabDraftStorageMode()),
    messageRu: 'Черновик вкладки цеха сохранён.',
  });
}
