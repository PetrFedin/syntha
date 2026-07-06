import { NextRequest, NextResponse } from 'next/server';

import type { PlatformCoreB2bMessageTemplateContext } from '@/lib/communications/platform-core-b2b-message-templates';
import type { SavedPlatformCoreB2bMessageTemplate } from '@/lib/communications/platform-core-b2b-message-templates-storage';
import {
  deletePlatformCoreB2bMessageTemplateServer,
  getPlatformCoreB2bMessageTemplatesServer,
  platformCoreB2bMessageTemplatesStorageMode,
  savePlatformCoreB2bMessageTemplateServer,
} from '@/lib/server/platform-core-b2b-message-templates-repository';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

function ownerKeyFromRequest(req: NextRequest): string {
  return (
    req.nextUrl.searchParams.get('ownerKey')?.trim() ||
    req.headers.get('x-w2-organization-id')?.trim() ||
    'platform-core'
  );
}

/** GET /api/platform-core/b2b/message-templates — shared PG store (не localStorage). */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const ownerKey = ownerKeyFromRequest(req);
  const context = req.nextUrl.searchParams.get('context')?.trim() as
    | PlatformCoreB2bMessageTemplateContext
    | undefined;
  const config = await getPlatformCoreB2bMessageTemplatesServer(ownerKey);
  const templates = context
    ? config.templates.filter((t) => t.context === context)
    : config.templates;

  return NextResponse.json({
    ok: true,
    ownerKey,
    templates,
    storageMode: toBffPgStorageMode(platformCoreB2bMessageTemplatesStorageMode()),
    updatedAt: config.updatedAt,
  });
}

/** POST — save custom template. DELETE via ?id= */
export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const ownerKey = ownerKeyFromRequest(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const labelRu = String(b.labelRu ?? '').trim();
  const bodyTemplate = String(b.bodyTemplate ?? '').trim();
  const context = String(b.context ?? '') as PlatformCoreB2bMessageTemplateContext;
  if (!labelRu || !bodyTemplate || (context !== 'b2b_order' && context !== 'workshop2_article')) {
    return NextResponse.json(
      { ok: false, messageRu: 'Нужны labelRu, bodyTemplate, context.' },
      { status: 400 }
    );
  }

  const template: SavedPlatformCoreB2bMessageTemplate = {
    id: String(b.id ?? `custom-${Date.now()}`),
    labelRu: labelRu.slice(0, 48),
    context,
    bodyTemplate: bodyTemplate.slice(0, 2000),
    createdAt: new Date().toISOString(),
  };

  const saved = await savePlatformCoreB2bMessageTemplateServer({ ownerKey, template });
  return NextResponse.json({
    ok: true,
    template,
    templates: saved.templates,
    storageMode: toBffPgStorageMode(platformCoreB2bMessageTemplatesStorageMode()),
  });
}

export async function DELETE(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const ownerKey = ownerKeyFromRequest(req);
  const id = req.nextUrl.searchParams.get('id')?.trim();
  if (!id) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите id.' }, { status: 400 });
  }
  const saved = await deletePlatformCoreB2bMessageTemplateServer({ ownerKey, id });
  return NextResponse.json({
    ok: true,
    templates: saved.templates,
    storageMode: toBffPgStorageMode(platformCoreB2bMessageTemplatesStorageMode()),
  });
}
